import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/audio — Get audio config (create default if none exists)
export async function GET() {
  try {
    let config = await db.audioConfig.findFirst()
    if (!config) {
      config = await db.audioConfig.create({
        data: {
          audioUrl: '/tpk-anthem.mp3',
          volume: 60,
          autoPlay: false,
          isActive: true,
          label: 'Te Pe Ka Fans Club',
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching audio config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración de audio' }, { status: 500 })
  }
}

// POST /api/audio — Create audio config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await db.audioConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await db.audioConfig.create({
      data: {
        audioUrl: body.audioUrl ?? '/tpk-anthem.mp3',
        volume: body.volume ?? 60,
        autoPlay: body.autoPlay ?? false,
        isActive: body.isActive ?? true,
        label: body.label ?? 'Te Pe Ka Fans Club',
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating audio config:', error)
    return NextResponse.json({ error: 'Error al crear configuración de audio' }, { status: 500 })
  }
}

// PUT /api/audio — Update audio config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.audioUrl !== undefined) updateData.audioUrl = data.audioUrl
    if (data.volume !== undefined) updateData.volume = data.volume
    if (data.autoPlay !== undefined) updateData.autoPlay = data.autoPlay
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.label !== undefined) updateData.label = data.label
    const config = await db.audioConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating audio config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración de audio' }, { status: 500 })
  }
}
