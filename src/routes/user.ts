import { response, Router } from 'express'
import { AuthController } from '../controllers/authController'
import AppointmentsController from '../controllers/appointmentsController'
import { authenticateUser, authenticateClient, authorize } from '../middlewares/authMiddleware'
import { PrismaClient } from '@prisma/client'
import { log } from 'console'

const router = Router()
const prisma = new PrismaClient()
const controller = new AuthController(prisma)

router.post('/register', controller.registerUser)
router.post('/login', controller.loginUser)

router.get('/admin-only', authenticateUser, authorize('ADMIN'), () => {
  console.log("ok admin-only")
  response.status(200).send().json({"admin-only": true}) 
})
router.get('/professional-dashboard', authenticateUser, authorize('PROFESSIONAL','ADMIN'), () => {
   console.log("ok professional-dashboard")
  response.status(200).send("professional-dashboard")  
})

export default router
