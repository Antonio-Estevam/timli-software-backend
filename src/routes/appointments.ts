import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import AppointmentsController from '../controllers/appointmentsController'
import { authenticateClient } from '../middlewares/authMiddleware'

export default function(prisma: PrismaClient) {
  const router = Router()
  const controller = new AppointmentsController(prisma)

  router.get('/', authenticateClient, controller.list.bind(controller)) 
  router.post('/', authenticateClient, controller.create.bind(controller))

  return router
}
