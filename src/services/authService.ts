import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const JWT_EXPIRES = '7d'

export class AuthService {
  // ---------------------------
  // CLIENT
  // ---------------------------
  async registerClient(name: string, email: string, password: string) {
    const existing = await prisma.client.findUnique({ where: { email } })
    if (existing) throw new Error('Email de cliente já cadastrado.')

    const hash = await bcrypt.hash(password, 10)
    const client = await prisma.client.create({
      data: { name, email, passwordHash: hash }
    })

    const token = this.generateToken(client.id, 'CLIENT')
    return { client: this.safeClient(client), token }
  }

  async loginClient(email: string, password: string) {
    const client = await prisma.client.findUnique({ where: { email } })
    if (!client) throw new Error('Cliente não encontrado.')

    const valid = await bcrypt.compare(password, client.passwordHash)
    if (!valid) throw new Error('Senha incorreta.')

    const token = this.generateToken(client.id, 'CLIENT')
    return { client: this.safeClient(client), token }
  }

  safeClient(client: any) {
    const { passwordHash, ...rest } = client
    return rest
  }

  // ---------------------------
  // USER (PROFESSIONAL / ADMIN)
  // ---------------------------
  async registerUser(name: string, email: string, password: string, role: 'ADMIN' | 'PROFESSIONAL', bio?: string) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('Email de usuário já cadastrado.')

    const hash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, passwordHash: hash, role }
    })

    let professional = null
    if (role === 'PROFESSIONAL') {
      professional = await prisma.professional.create({
        data: { userId: user.id, bio }
      })
    }

    const token = this.generateToken(user.id, user.role)
    return { user: this.safeUser(user), professional, token }
  }

  async loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) throw new Error('Usuário não encontrado.')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new Error('Senha incorreta.')

    const token = this.generateToken(user.id, user.role)
    return { user: this.safeUser(user), token }
  }

  // ---------------------------
  // TOKEN JWT
  // ---------------------------
  generateToken(id: number, role: string) {
    return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES })
  }

  safeUser(user: any) {
    const { passwordHash, ...rest } = user
    return rest
  }
}
