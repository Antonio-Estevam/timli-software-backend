import { AppointmentService } from '../../src/services/appointmentService'

function makePrisma(overrides: any = {}) {
  const base = {
    service: { findUnique: jest.fn() },
    professionalService: { findFirst: jest.fn() },
    schedule: { findMany: jest.fn() },
    appointment: { findMany: jest.fn(), create: jest.fn() },
  }
  return Object.assign(base, overrides)
}

describe('AppointmentService.createAppointment', () => {
  test('throws if service not found', async () => {
    const prisma = makePrisma()
    prisma.service.findUnique.mockResolvedValue(null)

    const svc = new AppointmentService(prisma as any)
    await expect(svc.createAppointment({
      clientName:'A', clientPhone:'1', serviceId:1, professionalId:1, date:'2025-10-10', time:'09:00', tz:'UTC'
    })).rejects.toThrow('Service not found')
  })

  test('throws if professional does not offer service', async () => {
    const prisma = makePrisma()
    prisma.service.findUnique.mockResolvedValue({ id:1, durationMin:30 })
    prisma.professionalService.findFirst.mockResolvedValue(null)

    const svc = new AppointmentService(prisma as any)
    await expect(svc.createAppointment({
      clientName:'A', clientPhone:'1', serviceId:1, professionalId:1, date:'2025-10-10', time:'09:00', tz:'UTC'
    })).rejects.toThrow('Professional does not offer this service')
  })

  test('throws if requested time is outside schedule', async () => {
    const prisma = makePrisma()
    prisma.service.findUnique.mockResolvedValue({ id:1, durationMin:30 })
    prisma.professionalService.findFirst.mockResolvedValue({ id:1 })
    prisma.schedule.findMany.mockResolvedValue([]) // no schedule

    const svc = new AppointmentService(prisma as any)
    await expect(svc.createAppointment({
      clientName:'A', clientPhone:'1', serviceId:1, professionalId:1, date:'2025-10-10', time:'09:00', tz:'UTC'
    })).rejects.toThrow('Professional has no schedule for this date')
  })

  test('throws if overlapping with existing appointment', async () => {
    const prisma = makePrisma()
    prisma.service.findUnique.mockResolvedValue({ id:1, durationMin:30 })
    prisma.professionalService.findFirst.mockResolvedValue({ id:1 })
    prisma.schedule.findMany.mockResolvedValue([
      { id:1, professionalId:1, date:'2025-10-10', startTime:'08:00', endTime:'17:00' }
    ])
    // existing appointment at 09:00 with duration 30 overlaps requested 09:15
    prisma.appointment.findMany.mockResolvedValue([
      { id:1, date:'2025-10-10', time:'09:00', serviceId:1, professionalId:1 }
    ])
    prisma.service.findUnique.mockImplementation(({ where }) => {
      if (where && where.id === 1) return Promise.resolve({ id:1, durationMin:30 })
      return Promise.resolve(null)
    })

    const svc = new AppointmentService(prisma as any)
    await expect(svc.createAppointment({
      clientName:'A', clientPhone:'1', serviceId:1, professionalId:1, date:'2025-10-10', time:'09:15', tz:'UTC'
    })).rejects.toThrow('Horário indisponível (conflito de agenda)')
  })

  test('creates appointment when all validations pass', async () => {
    const prisma = makePrisma()
    prisma.service.findUnique.mockResolvedValue({ id:1, durationMin:30 })
    prisma.professionalService.findFirst.mockResolvedValue({ id:1 })
    prisma.schedule.findMany.mockResolvedValue([
      { id:1, professionalId:1, date:'2025-10-10', startTime:'08:00', endTime:'17:00' }
    ])
    prisma.appointment.findMany.mockResolvedValue([])
    prisma.appointment.create.mockResolvedValue({ id:10, clientName:'A' })

    const svc = new AppointmentService(prisma as any)
    const appt = await svc.createAppointment({
      clientName:'A', clientPhone:'1', serviceId:1, professionalId:1, date:'2025-10-10', time:'10:00', tz:'UTC'
    })
    expect(appt).toBeDefined()
    expect(appt.id).toBe(10)
  })
})
