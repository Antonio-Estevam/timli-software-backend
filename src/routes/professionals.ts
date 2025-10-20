import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import ProfessionalsController from '../controllers/professionalsController'

export default function(prisma: PrismaClient) {
  const router = Router()
  const controller = new ProfessionalsController(prisma)

  router.get('/', controller.list.bind(controller))

  return router
}
