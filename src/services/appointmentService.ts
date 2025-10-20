import { PrismaClient } from '@prisma/client'
import { DateTime, Interval } from 'luxon'

export class AppointmentService {
  prisma: PrismaClient
  constructor(prisma: PrismaClient) { this.prisma = prisma }

  async createAppointment({ clientName, clientPhone, serviceId, professionalId, date, time, tz }: any) {
    const timezone = tz || process.env.DEFAULT_TZ || 'America/Sao_Paulo'

    // validate service exists
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) throw new Error('Service not found')
    const durationMin = service.durationMin

    // validate professional offers service
    const ps = await this.prisma.professionalService.findFirst({
      where: { professionalId, serviceId }
    })
    if (!ps) throw new Error('Professional does not offer this service')

    // build requested interval
    const start = DateTime.fromISO(`${date}T${time}`, { zone: timezone })
    const end = start.plus({ minutes: durationMin })
    const requested = Interval.fromDateTimes(start, end)

    // fetch schedules for professional/date and ensure requested is inside a schedule
    const schedules = await this.prisma.schedule.findMany({ where: { professionalId, date } })
    if (!schedules.length) throw new Error('Professional has no schedule for this date')

    const insideAnySchedule = schedules.some(s => {
      const sStart = DateTime.fromISO(`${s.date}T${s.startTime}`, { zone: timezone })
      const sEnd = DateTime.fromISO(`${s.date}T${s.endTime}`, { zone: timezone })
      const schedInterval = Interval.fromDateTimes(sStart, sEnd)
      return schedInterval.contains(start) && schedInterval.contains(end.minus({ milliseconds: 1 }))
    })
    if (!insideAnySchedule) throw new Error('Requested time is outside professional schedule')

    // fetch appointments and check overlap
    const appointments = await this.prisma.appointment.findMany({ where: { professionalId, date } })
    for (const a of appointments) {
      const aStart = DateTime.fromISO(`${a.date}T${a.time}`, { zone: timezone })
      // determine service duration for the existing appointment's service
      const aService = await this.prisma.service.findUnique({ where: { id: a.serviceId } })
      const aDuration = aService ? aService.durationMin : 30
      const aEnd = aStart.plus({ minutes: aDuration })
      const aInterval = Interval.fromDateTimes(aStart, aEnd)
      if (aInterval.overlaps(requested)) {
        throw new Error('Horário indisponível (conflito de agenda)')
      }
    }

    // create appointment (store date and time as given - timezone-aware behavior is for validation/display)
    const appt = await this.prisma.appointment.create({
      data: { clientName, clientPhone, serviceId, professionalId, date, time }
    })

    return appt
  }
}
