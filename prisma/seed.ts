import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🧠 Limpando dados antigos...')
  await prisma.appointment.deleteMany()
  await prisma.service.deleteMany()
  await prisma.professional.deleteMany()
  await prisma.user.deleteMany()
  await prisma.client.deleteMany()

  console.log('👨‍🔧 Criando usuários...')
  const adminPassword = await bcrypt.hash('admin123', 10)
  const profPassword = await bcrypt.hash('barbeiro123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@barbearia.com',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  })

  const professionalUser = await prisma.user.create({
    data: {
      name: 'Carlos Barber',
      email: 'carlos@barbearia.com',
      passwordHash: profPassword,
      role: 'PROFESSIONAL',
      professional: {
        create: {
          bio: 'Especialista em cortes masculinos modernos'
        }
      }
    },
    include: { professional: true }
  })

  console.log('💈 Criando serviços...')
  const corte = await prisma.service.create({
    data: {
      name: 'Corte Masculino',
      description: 'Corte com tesoura e máquina',
      durationMin: 30,
      priceCents: 50
    }
  })

  const barba = await prisma.service.create({
    data: {
      name: 'Barba Completa',
      description: 'Modelagem e acabamento de barba',
      durationMin: 25,
      priceCents: 35
    }
  })

  console.log('👤 Criando cliente...')
  const clientePassword = await bcrypt.hash('cliente123', 10)
  const cliente = await prisma.client.create({
    data: {
      name: 'João Silva',
      email: 'joao@cliente.com',
      passwordHash: clientePassword
    }
  })

  console.log('📅 Criando agendamento...')
  await prisma.appointment.create({
    data: {
      clientId: cliente.id,
      professionalId: professionalUser.professional?.id!,
      serviceId: corte.id,
      time: '14:00',
      date: new Date('2025-11-12T14:00:00Z'),
      duration: corte.durationMin
    }
  })

  console.log('✅ Banco populado com sucesso!')
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
