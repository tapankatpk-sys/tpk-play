import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/canal-vivo/verify — Verificar un código PLAY para acceso al canal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, userName } = body

    if (!code) {
      return NextResponse.json({ error: 'Código PLAY requerido' }, { status: 400 })
    }

    const normalizedCode = code.toUpperCase().trim()

    // Buscar el código en la base de datos
    const playCode = await db.canalVivoCode.findUnique({
      where: { code: normalizedCode },
    })

    if (!playCode) {
      return NextResponse.json({ error: 'Código PLAY no válido. Verifica e intenta de nuevo.' }, { status: 404 })
    }

    if (playCode.isRevoked) {
      return NextResponse.json({ error: 'Este código PLAY ha sido revocado.' }, { status: 403 })
    }

    if (playCode.isUsed) {
      return NextResponse.json({ error: 'Este código PLAY ya fue utilizado.' }, { status: 403 })
    }

    // Marcar el código como usado
    const updated = await db.canalVivoCode.update({
      where: { id: playCode.id },
      data: {
        isUsed: true,
        usedBy: userName || 'anonymous',
        usedAt: new Date(),
      },
    })

    return NextResponse.json({
      valid: true,
      code: updated.code,
      message: 'Código PLAY verificado. Bienvenido al Canal en Vivo.',
    })
  } catch (error) {
    console.error('Error verifying PLAY code:', error)
    return NextResponse.json({ error: 'Error de servidor al verificar código' }, { status: 500 })
  }
}
