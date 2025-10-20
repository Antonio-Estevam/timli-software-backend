// src/controllers/appointmentsController.ts
import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { z } from 'zod'
import { AppointmentService } from '../services/appointmentService'
import { DateTime } from 'luxon'

const createSchema = z.object({
  clientName: z.string().min(1),
  clientPhone: z.string().min(6),
  serviceId: z.number().int(),
  professionalId: z.number().int(),
  date: z.string(), // YYYY-MM-DD
  time: z.string(), // HH:MM
  tz: z.string().optional()
})

export default class AppointmentsController {
  prisma: PrismaClient
  service: AppointmentService
  constructor(prisma: PrismaClient) { this.prisma = prisma; this.service = new AppointmentService(prisma) }

  // POST /appointments
  async create(req: Request, res: Response) {
    const parsed = createSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors })
    try {
      const { clientName, clientPhone, serviceId, professionalId, date, time, tz } = parsed.data
      const appointment = await this.service.createAppointment({
        clientName, clientPhone, serviceId, professionalId, date, time, tz
      })
      // retornamos o objeto criado para o frontend
      return res.status(201).json(appointment)
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Erro' })
    }
  }

  // GET /appointments?date=YYYY-MM-DD&tz=America/Sao_Paulo
  async list(req: Request, res: Response) {
    try {
      const { date, tz } = req.query
      if (!date || typeof date !== 'string') return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' })
      const timezone = (typeof tz === 'string' && tz) ? tz : (process.env.DEFAULT_TZ || 'America/Sao_Paulo')

      const appts = await this.prisma.appointment.findMany({
        where: { date: String(date) },
        include: {
          service: true,
          professional: true
        },
        orderBy: { time: 'asc' }
      })

      // formatar createdAt e time para o timezone pedido (time já é HH:MM string armazenada)
      const formatted = appts.map(a => {
        const createdAtLocal = DateTime.fromJSDate(a.createdAt).setZone(timezone).toISO()
        // construímos um DateTime para start usando date + time no timezone
        const start = DateTime.fromISO(`${a.date}T${a.time}`, { zone: timezone })
        return {
          id: a.id,
          clientName: a.clientName,
          clientPhone: a.clientPhone,
          service: { id: a.service.id, name: a.service.name, durationMin: a.service.durationMin, priceCents: a.service.priceCents },
          professional: { id: a.professional.id, name: a.professional.name },
          date: a.date, // original YYYY-MM-DD
          time: start.toFormat('HH:mm'), // formatado para fuso
          createdAt: createdAtLocal
        }
      })

      return res.json(formatted)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ error: 'internal' })
    }
  }
}
