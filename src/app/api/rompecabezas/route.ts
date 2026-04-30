import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/rompecabezas — Get current rompecabezas config (create default if none exists)
export async function GET() {
  try {
    let config = await prisma.rompecabezasConfig.findFirst()
    if (!config) {
      config = await prisma.rompecabezasConfig.create({
        data: {
          gridSize: 6,
          pointsComplete: 200,
          timeBonusMax: 100,
          timeLimit: 300,
          showPreview: true,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching rompecabezas config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/rompecabezas — Create rompecabezas config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await prisma.rompecabezasConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await prisma.rompecabezasConfig.create({
      data: {
        gridSize: body.gridSize ?? 6,
        pointsComplete: body.pointsComplete ?? 200,
        timeBonusMax: body.timeBonusMax ?? 100,
        timeLimit: body.timeLimit ?? 300,
        showPreview: body.showPreview ?? true,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating rompecabezas config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/rompecabezas — Update rompecabezas config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.gridSize !== undefined) updateData.gridSize = data.gridSize
    if (data.pointsComplete !== undefined) updateData.pointsComplete = data.pointsComplete
    if (data.timeBonusMax !== undefined) updateData.timeBonusMax = data.timeBonusMax
    if (data.timeLimit !== undefined) updateData.timeLimit = data.timeLimit
    if (data.showPreview !== undefined) updateData.showPreview = data.showPreview
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await prisma.rompecabezasConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating rompecabezas config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
