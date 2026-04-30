import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/mineria — Get current mineria config
export async function GET() {
  try {
    let config = await db.mineriaConfig.findFirst()
    if (!config) {
      config = await db.mineriaConfig.create({
        data: {
          gridSize: 8,
          mineCount: 10,
          pointsPerCell: 5,
          pointsComplete: 100,
          pointsNoMines: 50,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching mineria config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/mineria — Create config
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const existing = await db.mineriaConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await db.mineriaConfig.create({
      data: {
        gridSize: body.gridSize ?? 8,
        mineCount: body.mineCount ?? 10,
        pointsPerCell: body.pointsPerCell ?? 5,
        pointsComplete: body.pointsComplete ?? 100,
        pointsNoMines: body.pointsNoMines ?? 50,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating mineria config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/mineria — Update config
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.gridSize !== undefined) updateData.gridSize = data.gridSize
    if (data.mineCount !== undefined) updateData.mineCount = data.mineCount
    if (data.pointsPerCell !== undefined) updateData.pointsPerCell = data.pointsPerCell
    if (data.pointsComplete !== undefined) updateData.pointsComplete = data.pointsComplete
    if (data.pointsNoMines !== undefined) updateData.pointsNoMines = data.pointsNoMines
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await db.mineriaConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating mineria config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
