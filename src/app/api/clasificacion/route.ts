import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/clasificacion — Get current clasificacion config (create default if none exists)
export async function GET() {
  try {
    let config = await db.clasificacionConfig.findFirst()
    if (!config) {
      config = await db.clasificacionConfig.create({
        data: {
          teamsPerRound: 6,
          pointsPerfect: 150,
          pointsPartial: 80,
          timeLimit: 120,
          timeBonusMax: 50,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching clasificacion config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/clasificacion — Create clasificacion config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await db.clasificacionConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await db.clasificacionConfig.create({
      data: {
        teamsPerRound: body.teamsPerRound ?? 6,
        pointsPerfect: body.pointsPerfect ?? 150,
        pointsPartial: body.pointsPartial ?? 80,
        timeLimit: body.timeLimit ?? 120,
        timeBonusMax: body.timeBonusMax ?? 50,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating clasificacion config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/clasificacion — Update clasificacion config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.teamsPerRound !== undefined) updateData.teamsPerRound = data.teamsPerRound
    if (data.pointsPerfect !== undefined) updateData.pointsPerfect = data.pointsPerfect
    if (data.pointsPartial !== undefined) updateData.pointsPartial = data.pointsPartial
    if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit
    if (data.timeBonusMax !== undefined) updateData.timeBonusMax = data.timeBonusMax
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await db.clasificacionConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating clasificacion config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
