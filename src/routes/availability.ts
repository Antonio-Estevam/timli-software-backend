import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import AvailabilityController from '../controllers/availabilityController'

export default function(prisma: PrismaClient) {
  const router = Router()
  const controller = new AvailabilityController(prisma)

  router.get('/', controller.getAvailability.bind(controller))

  return router
}
