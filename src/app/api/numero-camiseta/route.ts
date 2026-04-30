import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/numero-camiseta — Get current numero camiseta config
export async function GET() {
  try {
    let config = await db.numeroCamisetaConfig.findFirst()
    if (!config) {
      config = await db.numeroCamisetaConfig.create({
        data: {
          questionsPerGame: 5,
          pointsExact: 40,
          pointsClose: 20,
          noHintMultiplier: 2,
          timeLimit: 90,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching numero-camiseta config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/numero-camiseta — Create config
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const existing = await db.numeroCamisetaConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await db.numeroCamisetaConfig.create({
      data: {
        questionsPerGame: body.questionsPerGame ?? 5,
        pointsExact: body.pointsExact ?? 40,
        pointsClose: body.pointsClose ?? 20,
        noHintMultiplier: body.noHintMultiplier ?? 2,
        timeLimit: body.timeLimit ?? 90,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating numero-camiseta config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/numero-camiseta — Update config
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.questionsPerGame !== undefined) updateData.questionsPerGame = data.questionsPerGame
    if (data.pointsExact !== undefined) updateData.pointsExact = data.pointsExact
    if (data.pointsClose !== undefined) updateData.pointsClose = data.pointsClose
    if (data.noHintMultiplier !== undefined) updateData.noHintMultiplier = data.noHintMultiplier
    if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await db.numeroCamisetaConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating numero-camiseta config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
