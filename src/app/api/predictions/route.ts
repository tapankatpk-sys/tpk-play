import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/predictions - Get all match predictions
export async function GET() {
  try {
    const predictions = await db.matchPrediction.findMany({
      orderBy: [{ order: 'asc' }, { matchDate: 'asc' }],
    })
    return NextResponse.json(predictions)
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return NextResponse.json([])
  }
}

// POST /api/predictions - Create a match prediction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const prediction = await db.matchPrediction.create({
      data: {
        homeTeam: body.homeTeam,
        awayTeam: body.awayTeam,
        homeScore: body.homeScore ?? null,
        awayScore: body.awayScore ?? null,
        matchDate: new Date(body.matchDate),
        venue: body.venue || null,
        status: body.status || 'upcoming',
        isActive: body.isActive !== undefined ? body.isActive : true,
        order: body.order ?? 0,
      },
    })
    return NextResponse.json(prediction)
  } catch (error) {
    console.error('Error creating prediction:', error)
    return NextResponse.json({ error: 'Error al crear predicción' }, { status: 500 })
  }
}

// PUT /api/predictions - Update a match prediction
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (data.homeTeam !== undefined) updateData.homeTeam = data.homeTeam
    if (data.awayTeam !== undefined) updateData.awayTeam = data.awayTeam
    if (data.homeScore !== undefined) updateData.homeScore = data.homeScore
    if (data.awayScore !== undefined) updateData.awayScore = data.awayScore
    if (data.matchDate !== undefined) updateData.matchDate = new Date(data.matchDate)
    if (data.venue !== undefined) updateData.venue = data.venue
    if (data.status !== undefined) updateData.status = data.status
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.order !== undefined) updateData.order = data.order

    const prediction = await db.matchPrediction.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(prediction)
  } catch (error) {
    console.error('Error updating prediction:', error)
    return NextResponse.json({ error: 'Error al actualizar predicción' }, { status: 500 })
  }
}

// DELETE /api/predictions - Delete a match prediction
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await db.matchPrediction.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting prediction:', error)
    return NextResponse.json({ error: 'Error al eliminar predicción' }, { status: 500 })
  }
}
