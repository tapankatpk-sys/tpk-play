import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

// Generate unique TPK code
function generateTPKCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'TPK'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET all participants
export async function GET() {
  try {
    const participants = await db.participant.findMany({
      include: { game: true },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(participants)
  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json({ error: 'Error al obtener participantes' }, { status: 500 })
  }
}

// POST register a new participant
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, gameId, followedFb, followedIg, followedWa } = body

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Nombre, correo y teléfono son requeridos' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existing = await db.participant.findFirst({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'Este correo electrónico ya está registrado' },
        { status: 409 }
      )
    }

    // Generate unique code
    let code = generateTPKCode()
    let codeExists = await db.participant.findUnique({ where: { code } })
    while (codeExists) {
      code = generateTPKCode()
      codeExists = await db.participant.findUnique({ where: { code } })
    }

    const participant = await db.participant.create({
      data: {
        name,
        email,
        phone,
        code,
        gameId: gameId || null,
        followedFb: followedFb || false,
        followedIg: followedIg || false,
        followedWa: followedWa || false,
      },
      include: { game: true }
    })

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    console.error('Error creating participant:', error)
    return NextResponse.json({ error: 'Error al registrar participante' }, { status: 500 })
  }
}

// DELETE a participant
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID es requerido' }, { status: 400 })
    }

    await db.participant.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting participant:', error)
    return NextResponse.json({ error: 'Error al eliminar participante' }, { status: 500 })
  }
}
