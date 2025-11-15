import cors from 'cors'
import express from 'express'
import { PrismaClient } from '@prisma/client'
import routes from './routes'
import { setupSwagger } from './docs/swagger'

const prisma = new PrismaClient()
const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
setupSwagger(app)
app.use('/api', routes(prisma))
export default app
