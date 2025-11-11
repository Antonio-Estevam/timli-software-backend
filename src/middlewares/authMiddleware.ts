import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Token ausente' })

  const [, token] = authHeader.split(' ')
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string }
    ;(req as any).user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user || !roles.includes(user.role))
      return res.status(403).json({ error: 'Acesso negado' })
    next()
  }
}
