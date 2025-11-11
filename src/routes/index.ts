import { Router } from 'express'
import servicesRouter from './services'
import professionalsRouter from './professionals'
import availabilityRouter from './availability'
import appointmentsRouter from './appointments'
import { PrismaClient } from '@prisma/client'
import { authenticate, authorize } from '../middlewares/authMiddleware'

export default function(prisma: PrismaClient) {
  const router = Router()
  router.use('/services', servicesRouter(prisma))
  router.use('/professionals', professionalsRouter(prisma))
  router.use('/availability', availabilityRouter(prisma))
  router.use('/appointments', appointmentsRouter(prisma))
  return router
}
