import { Request, Response } from 'express'
import { AuthService } from '../services/authService'
import { PrismaClient } from '@prisma/client'

const authService = new AuthService()

export class AuthController {
  prisma: PrismaClient
  service: AuthService
  constructor(prisma: PrismaClient) { this.prisma = prisma; this.service = new AuthService() }


  // -------------------------
  // CLIENTE
  // -------------------------
  async registerClient(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body
      const client = await authService.registerClient(name, email, password)
      res.status(201).json(client)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }

  async loginClient(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const token = await authService.loginClient(email, password)
      res.json(token)
    } catch (err: any) {
      res.status(401).json({ error: err.message })
    }
  }

    async listClients(req: Request, res: Response) {
    try{
        const clients = await this.prisma.client.findMany()
        res.json(clients)
    } catch (err: any) {
      res.status(401).json({ error: err.message })
    }
  }

  // -------------------------
  // USUÁRIO (PROFISSIONAL / ADMIN)
  // -------------------------
  async registerUser(req: Request, res: Response) {
    try {
      const { name, email, password, role, bio } = req.body
      // Apenas ADMIN pode criar usuários
      const userWithProfessional = await authService.registerUser(name, email, password, role, bio)
      res.status(201).json(userWithProfessional)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const token = await authService.loginUser(email, password)
      res.json(token)
    } catch (err: any) {
      res.status(401).json({ error: err.message })
    }
  }
}