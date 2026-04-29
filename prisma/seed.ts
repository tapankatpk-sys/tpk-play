import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Trivia Futbolera game
  const triviaFutbolera = await prisma.game.upsert({
    where: { id: 'game-trivia-futbolera' },
    update: {},
    create: {
      id: 'game-trivia-futbolera',
      name: 'Trivia Futbolera',
      description: 'Pregunta por hora sobre la Liga BetPlay colombiana. Demuestra cuánto sabes del fútbol colombiano.',
      type: 'trivia-futbolera',
      imageUrl: null,
      config: JSON.stringify({
        mode: 'hourly',
        pointsPerCorrectAnswer: 10,
        questionSource: 'trivia-questions-bank',
        totalQuestions: 65,
      }),
      isActive: true,
      order: 0,
    },
  })

  console.log('✅ Created game:', triviaFutbolera.name)

  // Create Trivia Relámpago game
  const triviaRelampago = await prisma.game.upsert({
    where: { id: 'game-trivia-relampago' },
    update: {},
    create: {
      id: 'game-trivia-relampago',
      name: 'Trivia Relámpago',
      description: '5 preguntas en 60 segundos. ¡Velocidad y conocimiento! Bonos por rapidez.',
      type: 'trivia-relampago',
      imageUrl: null,
      config: JSON.stringify({
        mode: 'timed',
        questionsPerRound: 5,
        timeLimitSeconds: 60,
        pointsPerCorrectAnswer: 10,
        speedBonus: { '0-5s': 5, '5-10s': 3, '10-15s': 1 },
        questionSource: 'lightning-questions-bank',
        totalQuestions: 130,
      }),
      isActive: true,
      order: 1,
    },
  })

  console.log('✅ Created game:', triviaRelampago.name)

  // Verify games
  const allGames = await prisma.game.findMany({
    include: { _count: { select: { participants: true } } },
    orderBy: { order: 'asc' },
  })

  console.log(`\n🎮 Total games in database: ${allGames.length}`)
  allGames.forEach((g) => {
    console.log(`   - ${g.name} (${g.type}) - ${g.isActive ? 'Active' : 'Inactive'} - ${g._count.participants} participants`)
  })

  console.log('\n✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
