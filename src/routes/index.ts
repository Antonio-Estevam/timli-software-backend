import { Router } from 'express'
import servicesRouter from './services'
import professionalsRouter from './professionals'
import availabilityRouter from './availability'
import appointmentsRouter from './appointments'
import { PrismaClient } from '@prisma/client'
import clientRoutes from './client'
import userRoutes from '../routes/user'

export default function(prisma: PrismaClient) {
  const router = Router()

  router.get('/', (req, res) => res.json({ ok: true }))
  
  //Cliente 
  router.use('/client', clientRoutes(prisma))
  router.use('/services', servicesRouter(prisma))
  router.use('/professionals', professionalsRouter(prisma))
  router.use('/availability', availabilityRouter(prisma))
  router.use('/appointments', appointmentsRouter(prisma))
  
  //PROFESSIONAL | ADMIN
  router.use('/user', userRoutes)


  return router
}
