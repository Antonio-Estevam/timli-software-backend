import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import AppointmentsController from '../controllers/appointmentsController'

export default function(prisma: PrismaClient) {
  const router = Router()
  const controller = new AppointmentsController(prisma)

  router.get('/', controller.list.bind(controller)) 
  router.post('/', controller.create.bind(controller))

  return router
}
