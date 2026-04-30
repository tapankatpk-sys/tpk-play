import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/sopa — Get current sopa config
export async function GET() {
  try {
    let config = await db.sopaConfig.findFirst()
    if (!config) {
      config = await db.sopaConfig.create({
        data: {
          gridSize: 12,
          wordsPerGame: 8,
          pointsPerWord: 15,
          pointsComplete: 100,
          timeLimit: 180,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching sopa config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/sopa — Create config
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const existing = await db.sopaConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await db.sopaConfig.create({
      data: {
        gridSize: body.gridSize ?? 12,
        wordsPerGame: body.wordsPerGame ?? 8,
        pointsPerWord: body.pointsPerWord ?? 15,
        pointsComplete: body.pointsComplete ?? 100,
        timeLimit: body.timeLimit ?? 180,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating sopa config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/sopa — Update config
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.gridSize !== undefined) updateData.gridSize = data.gridSize
    if (data.wordsPerGame !== undefined) updateData.wordsPerGame = data.wordsPerGame
    if (data.pointsPerWord !== undefined) updateData.pointsPerWord = data.pointsPerWord
    if (data.pointsComplete !== undefined) updateData.pointsComplete = data.pointsComplete
    if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await db.sopaConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating sopa config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
