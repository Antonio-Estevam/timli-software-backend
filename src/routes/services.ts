import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import ServicesController from '../controllers/servicesController'

/**
 * @openapi
 * /api/services:
 *   get:
 *     summary: Lista todos os serviços disponíveis na barbearia
 *     tags: [Serviços]
 *     responses:
 *       200:
 *         description: Lista de serviços retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Corte de Cabelo
 *                   durationMin:
 *                     type: integer
 *                     example: 30
 *                   price:
 *                     type: number
 *                     example: 45.0
 */

export default function(prisma: PrismaClient) {
  const router = Router()
  const controller = new ServicesController(prisma)

  router.get('/', controller.list.bind(controller))

  return router
}
