import cors from 'cors'
import express from 'express'
import { PrismaClient } from '@prisma/client'
import routes from './routes'
import { setupSwagger } from './docs/swagger'
import authRoutes from './routes/auth'
import adminRoutes from './routes/admin'

const prisma = new PrismaClient()
const app = express()

app.use(cors({
  origin: 'http://localhost:5173', // ou '*' durante desenvolvimento
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
setupSwagger(app)
app.use('/api', routes(prisma))
app.use('/api/auth', authRoutes)
app.use('/api', adminRoutes)
app.get('/api', (req, res) => res.json({ ok: true }))

export default app
