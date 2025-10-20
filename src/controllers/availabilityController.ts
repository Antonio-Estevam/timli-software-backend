import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import { AvailabilityService } from '../services/availabilityService'

export default class AvailabilityController {
  prisma: PrismaClient
  service: AvailabilityService
  constructor(prisma: PrismaClient) { this.prisma = prisma; this.service = new AvailabilityService(prisma) }

  async getAvailability(req: Request, res: Response) {
    try {
      const { professionalId, serviceId, date, tz } = req.query
      if (!professionalId || !serviceId || !date) return res.status(400).json({ error: 'professionalId, serviceId and date are required' })
      const timezone = typeof tz === 'string' ? tz : undefined
      const slots = await this.service.getAvailableSlots(Number(professionalId), Number(serviceId), String(date), timezone)
      res.json(slots)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'internal' })
    }
  }
}
