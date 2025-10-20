import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // limpa (apenas para dev)
  await prisma.appointment.deleteMany()
  await prisma.schedule.deleteMany()
  await prisma.professionalService.deleteMany()
  await prisma.professional.deleteMany()
  await prisma.service.deleteMany()

  const corte = await prisma.service.create({
    data: { name: 'Corte', durationMin: 30, priceCents: 2500 }
  })
  const barba = await prisma.service.create({
    data: { name: 'Barba', durationMin: 20, priceCents: 1500 }
  })

  const prof1 = await prisma.professional.create({
    data: { name: 'João', photoUrl: null }
  })
  const prof2 = await prisma.professional.create({
    data: { name: 'Carlos', photoUrl: null }
  })

  await prisma.professionalService.createMany({
    data: [
      { professionalId: prof1.id, serviceId: corte.id },
      { professionalId: prof1.id, serviceId: barba.id },
      { professionalId: prof2.id, serviceId: corte.id }
    ]
  })

  // cria schedules para os próximos dias
  const today = new Date()
  for (let d = 0; d < 7; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() + d)
    const yyyy = date.toISOString().slice(0,10)
    await prisma.schedule.createMany({
      data: [
        { professionalId: prof1.id, date: yyyy, startTime: '09:00', endTime: '17:00' },
        { professionalId: prof2.id, date: yyyy, startTime: '10:00', endTime: '18:00' }
      ]
    })
  }

  console.log('Seed completo.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await new PrismaClient().$disconnect() })
