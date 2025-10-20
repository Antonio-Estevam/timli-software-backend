import { AvailabilityService } from '../../src/services/availabilityService'
import { DateTime } from 'luxon'

function makePrisma(overrides?: any) {
  overrides = overrides || {};
  const base = {
    service: { findUnique: jest.fn() },
    schedule: { findMany: jest.fn() },
    appointment: { findMany: jest.fn() },
  }
  return Object.assign(base, overrides)
}

describe('AvailabilityService.getAvailableSlots', () => {
  test('returns empty array when no schedules', async () => {
    const prisma = makePrisma()
    prisma.service.findUnique.mockResolvedValue({ id:1, durationMin: 30 })
    prisma.schedule.findMany.mockResolvedValue([])
    prisma.appointment.findMany.mockResolvedValue([])

    const svc = new AvailabilityService(prisma as any)
    const slots = await svc.getAvailableSlots(1, 1, '2025-10-10', 'UTC')
    expect(slots).toEqual([])
  })

  test('generates slots based on service duration and schedule', async () => {
    const prisma = makePrisma()
    prisma.service.findUnique.mockResolvedValue({ id:1, durationMin: 30 })
    prisma.schedule.findMany.mockResolvedValue([
      { id:1, professionalId:1, date:'2025-10-10', startTime:'09:00', endTime:'10:30' }
    ])
    prisma.appointment.findMany.mockResolvedValue([])

    const svc = new AvailabilityService(prisma as any)
    const slots = await svc.getAvailableSlots(1, 1, '2025-10-10', 'UTC')
    // With duration 30 and schedule 09:00-10:30, possible starts: 09:00, 09:10, 09:20, ..., last start 10:00
    // But AvailabilityService moves cursor by 10 minutes; expect multiple slots where 30min fits
    expect(slots.length).toBeGreaterThanOrEqual(3)
    expect(slots).toContain('09:00')
    expect(slots).toContain('10:00')
  })

  test('filters out slots overlapping existing appointments', async () => {
    const prisma = makePrisma()
    prisma.service.findUnique.mockResolvedValue({ id:1, durationMin: 30 })
    prisma.schedule.findMany.mockResolvedValue([
      { id:1, professionalId:1, date:'2025-10-10', startTime:'09:00', endTime:'11:00' }
    ])
    // existing appointment at 09:30 (duration 30) blocks slots that overlap
    prisma.appointment.findMany.mockResolvedValue([
      { id:1, date:'2025-10-10', time:'09:30', serviceId:1, professionalId:1 }
    ])

    const svc = new AvailabilityService(prisma as any)
    const slots = await svc.getAvailableSlots(1, 1, '2025-10-10', 'UTC')
    // slot '09:30' must not be present
    expect(slots).not.toContain('09:30')
    // ensure some other slot exists
    expect(slots).toContain('09:00')
  })
})
