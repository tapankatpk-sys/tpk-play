import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/verify-code — Verify a TPK code and return user info
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
    }

    const participant = await db.participant.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        code: true,
        name: true,
        teamSlug: true,
        email: true,
        totalPoints: true,
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Código no registrado' }, { status: 404 })
    }

    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error verifying code:', error)
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })
  }
}
