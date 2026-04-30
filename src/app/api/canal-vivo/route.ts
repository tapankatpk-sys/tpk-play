import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/canal-vivo — Get canal en vivo config (create default if none exists)
export async function GET() {
  try {
    let config = await db.canalVivoConfig.findFirst()
    if (!config) {
      config = await db.canalVivoConfig.create({
        data: {
          youtubeChannelId: 'UCZjpA3YBPXvJv3pg4SPEjfw',
          youtubeVideoId: '',
          streamTitle: 'Liga BetPlay en Vivo',
          streamSubtitle: 'Win Sports - Señal en Vivo',
          altStreamUrl: '',
          altStreamLabel: 'Señal Alternativa',
          showChat: true,
          showSchedule: true,
          autoPlay: true,
          isActive: true,
        },
      })
    }
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching canal vivo config:', error)
    return NextResponse.json({ error: 'Error al cargar configuración del canal en vivo' }, { status: 500 })
  }
}

// POST /api/canal-vivo — Create canal vivo config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existing = await db.canalVivoConfig.findFirst()
    if (existing) {
      return NextResponse.json({ error: 'Ya existe una configuración. Use PUT para actualizar.' }, { status: 400 })
    }
    const config = await db.canalVivoConfig.create({
      data: {
        youtubeChannelId: body.youtubeChannelId ?? 'UCZjpA3YBPXvJv3pg4SPEjfw',
        youtubeVideoId: body.youtubeVideoId ?? '',
        streamTitle: body.streamTitle ?? 'Liga BetPlay en Vivo',
        streamSubtitle: body.streamSubtitle ?? 'Win Sports - Señal en Vivo',
        altStreamUrl: body.altStreamUrl ?? '',
        altStreamLabel: body.altStreamLabel ?? 'Señal Alternativa',
        showChat: body.showChat ?? true,
        showSchedule: body.showSchedule ?? true,
        autoPlay: body.autoPlay ?? true,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error creating canal vivo config:', error)
    return NextResponse.json({ error: 'Error al crear configuración del canal en vivo' }, { status: 500 })
  }
}

// PUT /api/canal-vivo — Update canal vivo config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    const updateData: Record<string, unknown> = {}
    if (data.youtubeChannelId !== undefined) updateData.youtubeChannelId = data.youtubeChannelId
    if (data.youtubeVideoId !== undefined) updateData.youtubeVideoId = data.youtubeVideoId
    if (data.streamTitle !== undefined) updateData.streamTitle = data.streamTitle
    if (data.streamSubtitle !== undefined) updateData.streamSubtitle = data.streamSubtitle
    if (data.altStreamUrl !== undefined) updateData.altStreamUrl = data.altStreamUrl
    if (data.altStreamLabel !== undefined) updateData.altStreamLabel = data.altStreamLabel
    if (data.showChat !== undefined) updateData.showChat = data.showChat
    if (data.showSchedule !== undefined) updateData.showSchedule = data.showSchedule
    if (data.autoPlay !== undefined) updateData.autoPlay = data.autoPlay
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    const config = await db.canalVivoConfig.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating canal vivo config:', error)
    return NextResponse.json({ error: 'Error al actualizar configuración del canal en vivo' }, { status: 500 })
  }
}
