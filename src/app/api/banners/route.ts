import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/banners - Get all banners (public)
export async function GET() {
  try {
    const banners = await db.tpkBanner.findMany({
      orderBy: { type: 'asc' },
    })
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json([])
  }
}

// POST /api/banners - Create a banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const banner = await db.tpkBanner.create({
      data: {
        type: body.type || 'ganador',
        title: body.title || 'GANADOR TPK',
        subtitle: body.subtitle || null,
        imageUrl: body.imageUrl || null,
        linkUrl: body.linkUrl || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    })
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json({ error: 'Error al crear banner' }, { status: 500 })
  }
}

// PUT /api/banners - Update a banner
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const banner = await db.tpkBanner.update({
      where: { id },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error updating banner:', error)
    return NextResponse.json({ error: 'Error al actualizar banner' }, { status: 500 })
  }
}

// DELETE /api/banners - Delete a banner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await db.tpkBanner.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json({ error: 'Error al eliminar banner' }, { status: 500 })
  }
}
