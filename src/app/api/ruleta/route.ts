import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/ruleta — Get current ruleta config (create default if none exists)
export async function GET() {
  try {
    let config = await prisma.ruletaConfig.findFirst()
    if (!config) {
      config = await prisma.ruletaConfig.create({
        data: {
          pointsExact: 50,
          pointsRegion: 10,
          spinDuration: 4,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching ruleta config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración' }, { status: 500 })
  }
}

// POST /api/ruleta — Create ruleta config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await prisma.ruletaConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await prisma.ruletaConfig.create({
      data: {
        pointsExact: body.pointsExact ?? 50,
        pointsRegion: body.pointsRegion ?? 10,
        spinDuration: body.spinDuration ?? 4,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating ruleta config:', error)
    return NextResponse.json({ error: 'Error al crear configuración' }, { status: 500 })
  }
}

// PUT /api/ruleta — Update ruleta config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.pointsExact !== undefined) updateData.pointsExact = data.pointsExact
    if (data.pointsRegion !== undefined) updateData.pointsRegion = data.pointsRegion
    if (data.spinDuration !== undefined) updateData.spinDuration = data.spinDuration
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await prisma.ruletaConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating ruleta config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
