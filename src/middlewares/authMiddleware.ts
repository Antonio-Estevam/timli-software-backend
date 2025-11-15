import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

// -----------------------------
// Autenticação de USERS (Admin / Professional)
// -----------------------------
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Token ausente' })

  const [, token] = authHeader.split(' ')
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string }

    // Somente Admin ou Professional podem acessar
    if (!['ADMIN', 'PROFESSIONAL'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    (req as any).user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

// -----------------------------
// Autenticação de CLIENTS
// -----------------------------
export function authenticateClient(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Token ausente' })

  const [, token] = authHeader.split(' ')
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string }

    if (decoded.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    (req as any).client = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

// -----------------------------
// Middleware de autorização para USERS
// roles: array de strings ['ADMIN', 'PROFESSIONAL']
// -----------------------------
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    next()
  }
}

// -----------------------------
// Middleware de autorização opcional para CLIENTS
// roles: array de strings ['CLIENT'] (geralmente só um role)
// -----------------------------
export function authorizeClient() {
  return (req: Request, res: Response, next: NextFunction) => {
    const client = (req as any).client
    if (!client || client.role !== 'CLIENT') {
      return res.status(403).json({ error: 'Acesso negado' })
    }
    next()
  }
}
