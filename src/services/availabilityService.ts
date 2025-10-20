import { PrismaClient } from '@prisma/client'
import { DateTime, Interval } from 'luxon'

export class AvailabilityService {
  prisma: PrismaClient
  constructor(prisma: PrismaClient) { this.prisma = prisma }

  // returns array of start times in HH:MM in requested timezone (or DEFAULT_TZ)
  async getAvailableSlots(professionalId: number, serviceId: number, dateISO: string, tz?: string) {
    const timezone = tz || process.env.DEFAULT_TZ || 'America/Sao_Paulo'

    // fetch service duration
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) throw new Error('Service not found')

    const durationMin = service.durationMin

    // fetch schedules for the professional on that date
    const schedules = await this.prisma.schedule.findMany({
      where: { professionalId, date: dateISO }
    })
    if (!schedules.length) return []

    // fetch appointments for that prof/date
    const appointments = await this.prisma.appointment.findMany({
      where: { professionalId, date: dateISO }
    })

    // convert appointments to intervals (in timezone)
    const apptIntervals = appointments.map(a => {
      const start = DateTime.fromISO(`${a.date}T${a.time}`, { zone: timezone })
      const end = start.plus({ minutes: service.durationMin }) // note: using same service duration; safe as service found above
      return Interval.fromDateTimes(start, end)
    })

    const slots = []
    for (const sched of schedules) {
      const schedStart = DateTime.fromISO(`${sched.date}T${sched.startTime}`, { zone: timezone })
      const schedEnd = DateTime.fromISO(`${sched.date}T${sched.endTime}`, { zone: timezone })

      let cursor = schedStart

      while (cursor.plus({ minutes: durationMin }) <= schedEnd) {
        const potentialInterval = Interval.fromDateTimes(cursor, cursor.plus({ minutes: durationMin }))
        // check overlap with any appointment
        const overlaps = apptIntervals.some(ai => ai.overlaps(potentialInterval))
        if (!overlaps) {
          slots.push(cursor.toFormat('HH:mm'))
        }
        // move cursor by smallest granularity of 10 minutes to allow denser slots (but can be adjusted)
        cursor = cursor.plus({ minutes: 10 })
      }
    }

    // unique and sort
    const unique = Array.from(new Set(slots)).sort((a,b) => a.localeCompare(b))
    return unique
  }
}
