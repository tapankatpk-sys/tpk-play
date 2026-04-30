import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/apuesta — Get current apuesta config
export async function GET() {
  try {
    let config = await db.apuestaConfig.findFirst()
    if (!config) {
      config = await db.apuestaConfig.create({
        data: {
          matchesPerRound: 3,
          pointsExact: 60,
          pointsWinner: 20,
          pointsGoals: 30,
          timeLimit: 180,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching apuesta config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/apuesta — Create config
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const existing = await db.apuestaConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await db.apuestaConfig.create({
      data: {
        matchesPerRound: body.matchesPerRound ?? 3,
        pointsExact: body.pointsExact ?? 60,
        pointsWinner: body.pointsWinner ?? 20,
        pointsGoals: body.pointsGoals ?? 30,
        timeLimit: body.timeLimit ?? 180,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating apuesta config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/apuesta — Update config
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.matchesPerRound !== undefined) updateData.matchesPerRound = data.matchesPerRound
    if (data.pointsExact !== undefined) updateData.pointsExact = data.pointsExact
    if (data.pointsWinner !== undefined) updateData.pointsWinner = data.pointsWinner
    if (data.pointsGoals !== undefined) updateData.pointsGoals = data.pointsGoals
    if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await db.apuestaConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating apuesta config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
