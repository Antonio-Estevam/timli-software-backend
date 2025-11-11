import { Request, Response } from 'express'
import { AuthService } from '../services/authService'

const authService = new AuthService()

export class AuthController {
  async register(req: Request, res: Response) {
    console.log(req.body);
    
    try {
      const { name, email, password, role } = req.body
      const result = await authService.register(name, email, password, role)
      res.status(201).json(result)
      
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const result = await authService.login(email, password)
      res.json(result)
    } catch (err: any) {
      res.status(401).json({ error: err.message })
    }
  }
}
