import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/popup - Get active popup config (public)
export async function GET() {
  try {
    const popups = await db.popupConfig.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(popups)
  } catch (error) {
    console.error('Error fetching popups:', error)
    return NextResponse.json([])
  }
}

// POST /api/popup - Create a popup config
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const popup = await db.popupConfig.create({
      data: {
        text: body.text || 'TPK NUEVO',
        linkUrl: body.linkUrl || '#',
        isActive: body.isActive !== undefined ? body.isActive : true,
        color: body.color || '#f97316',
        size: body.size || 120,
        position: body.position || 'bottom-left',
      },
    })
    return NextResponse.json(popup)
  } catch (error) {
    console.error('Error creating popup:', error)
    return NextResponse.json({ error: 'Error al crear popup' }, { status: 500 })
  }
}

// PUT /api/popup - Update a popup config
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const popup = await db.popupConfig.update({
      where: { id },
      data: {
        ...(data.text !== undefined && { text: data.text }),
        ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.color !== undefined && { color: data.color }),
        ...(data.size !== undefined && { size: data.size }),
        ...(data.position !== undefined && { position: data.position }),
      },
    })
    return NextResponse.json(popup)
  } catch (error) {
    console.error('Error updating popup:', error)
    return NextResponse.json({ error: 'Error al actualizar popup' }, { status: 500 })
  }
}

// DELETE /api/popup - Delete a popup config
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await db.popupConfig.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting popup:', error)
    return NextResponse.json({ error: 'Error al eliminar popup' }, { status: 500 })
  }
}
