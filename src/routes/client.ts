import { Router } from 'express'
import { AuthController } from '../controllers/authController'
import { PrismaClient } from '@prisma/client'

const router = Router()
export default function(prisma: PrismaClient){
    const controller = new AuthController(prisma)

    router.post('/register', controller.registerClient)
    router.post('/login', controller.loginClient)
    router.get('/list', controller.listClients.bind(controller))

    return router
}
