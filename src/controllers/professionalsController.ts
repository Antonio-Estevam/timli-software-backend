import { PrismaClient } from '@prisma/client'
import { Request, Response } from 'express'

export default class ProfessionalsController {
  prisma: PrismaClient
  constructor(prisma: PrismaClient) { this.prisma = prisma }

  async list(req: Request, res: Response) {
    const { serviceId, date } = req.query
    const where: any = {}
    if (serviceId) where.services = { some: { serviceId: Number(serviceId) } }
    const pros = await this.prisma.professional.findMany({
      where,
      include: { services: { include: { service: true } } }
    })
    res.json(pros)
  }
}
