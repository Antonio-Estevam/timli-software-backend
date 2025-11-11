import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/authMiddleware'

const router = Router()

router.get('/admin-only', authenticate, authorize('ADMIN'), (req, res) => {
  const user = (req as any).user
  res.json({
    message: `Bem-vindo, administrador ${user.userId}!`,
    role: user.role
  })
})

export default router