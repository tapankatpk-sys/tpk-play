import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET all games
export async function GET() {
  try {
    const games = await db.game.findMany({
      include: {
        _count: { select: { participants: true } }
      },
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(games)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json({ error: 'Error al obtener juegos' }, { status: 500 })
  }
}

// POST create a new game
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, imageUrl, type, config, order, isActive } = body

    if (!name) {
      return NextResponse.json({ error: 'El nombre del juego es requerido' }, { status: 400 })
    }

    // Get the max order value to append at end if no order specified
    let gameOrder = order
    if (gameOrder === undefined || gameOrder === null) {
      const maxOrderGame = await db.game.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true }
      })
      gameOrder = (maxOrderGame?.order ?? -1) + 1
    }

    const game = await db.game.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        type: type || 'personalizado',
        config: config ? (typeof config === 'string' ? config : JSON.stringify(config)) : null,
        order: gameOrder,
        isActive: isActive !== undefined ? isActive : true,
      }
    })

    return NextResponse.json(game, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json({ error: 'Error al crear juego' }, { status: 500 })
  }
}

// PUT update a game
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, description, imageUrl, type, config, order, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (imageUrl !== undefined) data.imageUrl = imageUrl
    if (type !== undefined) data.type = type
    if (config !== undefined) data.config = typeof config === 'string' ? config : JSON.stringify(config)
    if (order !== undefined) data.order = order
    if (isActive !== undefined) data.isActive = isActive

    const game = await db.game.update({
      where: { id },
      data,
    })

    return NextResponse.json(game)
  } catch (error) {
    console.error('Error updating game:', error)
    return NextResponse.json({ error: 'Error al actualizar juego' }, { status: 500 })
  }
}

// DELETE a game
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    await db.participant.deleteMany({ where: { gameId: id } })
    await db.game.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json({ error: 'Error al eliminar juego' }, { status: 500 })
  }
}
