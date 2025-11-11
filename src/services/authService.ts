import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const JWT_EXPIRES = '7d'

export class AuthService {
  async register(name: string, email: string, password: string, role: 'ADMIN' | 'PROFESSIONAL' | 'CLIENT' = 'CLIENT') {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('Email já cadastrado.')

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, passwordHash: hash, role }
    })
    const token = this.generateToken(user.id, user.role)
    return { user: this.safeUser(user), token }
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Usuário não encontrado.')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new Error('Senha incorreta.')

    const token = this.generateToken(user.id, user.role)
    return { user: this.safeUser(user), token }
  }

  generateToken(userId: number, role: string) {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  }

  safeUser(user: any) {
    const { passwordHash, ...rest } = user
    return rest
  }
}
