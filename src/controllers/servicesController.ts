import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'
import z from 'zod'

const createSchema = z.object({
  serviceName: z.string().min(3),
  durationMin: z.number().int(),
  price: z.number(),
})

export default class ServicesController {
  prisma: PrismaClient
  constructor(prisma: PrismaClient) { this.prisma = prisma }

  async list(req: Request, res: Response) {
    const services = await this.prisma.service.findMany()
    res.json(services)
  }
  async create(req: Request, res: Response) {
    const parsed = createSchema.safeParse(req.body)

    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors })
    try {
      const { serviceName, durationMin, price } = parsed.data
      res.status(201)
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Erro' })
    }
  }
}
