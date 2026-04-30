import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
})

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

  // Create Memoria Futbolera game
  const memoriaFutbolera = await prisma.game.upsert({
    where: { id: 'game-memoria-futbolera' },
    update: {},
    create: {
      id: 'game-memoria-futbolera',
      name: 'Memoria Futbolera',
      description: 'Encuentra los pares de escudos de los equipos de la Liga BetPlay. ¡Pon a prueba tu memoria futbolera!',
      type: 'memoria-futbolera',
      imageUrl: null,
      config: JSON.stringify({
        mode: 'memory-match',
        difficulties: {
          easy: { pairs: 4, cols: 4 },
          medium: { pairs: 6, cols: 4 },
          hard: { pairs: 10, cols: 5 },
        },
        totalTeams: 20,
        scoringSystem: {
          threeStars: 'upTo1.5xPairs',
          twoStars: 'upTo2xPairs',
          oneStar: 'moreThan2xPairs',
        },
      }),
      isActive: true,
      order: 2,
    },
  })

  console.log('✅ Created game:', memoriaFutbolera.name)

  // Create Crucigrama Futbolero game
  const crucigramaFutbolero = await prisma.game.upsert({
    where: { id: 'game-crucigrama-futbolero' },
    update: {},
    create: {
      id: 'game-crucigrama-futbolero',
      name: 'Crucigrama Futbolero',
      description: 'Resuelve crucigramas temáticos de cada equipo de la Liga BetPlay. 3 niveles de dificultad y un desafío especial. ¡Completa el crucigrama y gana puntos!',
      type: 'crucigrama-futbolero',
      imageUrl: null,
      config: JSON.stringify({
        mode: 'crossword',
        levels: {
          bajo: { words: 10, timeLimitSeconds: 600 },
          medio: { words: 20, timeLimitSeconds: 900 },
          dificil: { words: 30, timeLimitSeconds: 1200 },
        },
        specialCrossword: {
          name: 'LIGA BETPLAY',
          words: 40,
          timeLimitSeconds: 1500,
          points: 50,
          riskLoseAll: true,
        },
        totalPoints: 30,
        rotationMode: 'hourly',
        totalTeams: 20,
        questionSource: 'crossword-questions-bank',
      }),
      isActive: true,
      order: 3,
    },
  })

  console.log('✅ Created game:', crucigramaFutbolero.name)

  // Create Tragamonedas Futbolera game
  const tragamonedasFutbolera = await prisma.game.upsert({
    where: { id: 'game-tragamonedas-futbolera' },
    update: {},
    create: {
      id: 'game-tragamonedas-futbolera',
      name: 'Tragamonedas Futbolera',
      description: 'Gira los rodillos y encuentra los escudos iguales de la Liga BetPlay. ¡Jackpot con 3 escudos iguales! 5 giros gratis por partida.',
      type: 'tragamonedas-futbolera',
      imageUrl: null,
      config: JSON.stringify({
        mode: 'slot-machine',
        reels: 3,
        spinsPerGame: 5,
        scoring: {
          jackpot: { match: 3, basePoints: 50, multiplier: 'teamValue' },
          double: { match: 2, points: 10 },
          dailyBonus: { match: 'dailyTeam', points: 5 },
        },
        teamValues: {
          3: ['atletico-nacional', 'millonarios', 'america-de-cali'],
          2: ['deportivo-cali', 'atletico-junior', 'independiente-santa-fe', 'independiente-medellin'],
          1: ['once-caldas', 'deportes-tolima', 'atletico-bucaramanga', 'fortaleza-ceif', 'deportivo-pereira', 'deportivo-pasto', 'la-equidad', 'jaguares-de-cordoba', 'cucuta-deportivo', 'internacional-de-bogota', 'alianza-valledupar', 'boyaca-chico', 'llaneros', 'envigado'],
        },
        dailyTeamRotation: true,
        totalTeams: 20,
      }),
      isActive: true,
      order: 4,
    },
  })

  console.log('✅ Created game:', tragamonedasFutbolera.name)

  // Create Lotería de Equipos game
  const loteriaFutbolera = await prisma.game.upsert({
    where: { id: 'game-loteria-futbolera' },
    update: {},
    create: {
      id: 'game-loteria-futbolera',
      name: 'Lotería de Equipos',
      description: 'Se sortean escudos de la Liga BetPlay y tú marcas en tu tabla. ¡Completa línea, diagonal o lotería completa para ganar puntos!',
      type: 'loteria-futbolera',
      imageUrl: null,
      config: JSON.stringify({
        mode: 'loteria',
        boardSize: 4,
        totalTeams: 22,
        scoring: {
          line: 30,
          diagonal: 50,
          fullBoard: 100,
        },
        rotationMode: 'hourly',
      }),
      isActive: true,
      order: 5,
    },
  })

  console.log('✅ Created game:', loteriaFutbolera.name)

  // Create GANADOR TPK banner
  const ganadorBanner = await prisma.tpkBanner.upsert({
    where: { type: 'ganador' },
    update: {},
    create: {
      type: 'ganador',
      title: 'GANADOR TPK',
      subtitle: 'Campeón de la Semana',
      imageUrl: null,
      linkUrl: null,
      isActive: true,
    },
  })
  console.log('✅ Created banner:', ganadorBanner.title)

  // Create PREMIO TPK banner
  const premioBanner = await prisma.tpkBanner.upsert({
    where: { type: 'premio' },
    update: {},
    create: {
      type: 'premio',
      title: 'PREMIO TPK',
      subtitle: 'Zapatillas Personalizadas',
      imageUrl: null,
      linkUrl: null,
      isActive: true,
    },
  })
  console.log('✅ Created banner:', premioBanner.title)

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
