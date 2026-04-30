import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// Genera un código alfanumérico único que inicia con "PLAY"
function generatePlayCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sin I,O,0,1 para evitar confusión
  let suffix = ''
  for (let i = 0; i < 8; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `PLAY${suffix}`
}

// GET /api/canal-vivo/codes — Listar todos los códigos PLAY
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all | active | used | revoked

    const where: Record<string, unknown> = {}
    if (filter === 'active') {
      where.isUsed = false
      where.isRevoked = false
    } else if (filter === 'used') {
      where.isUsed = true
    } else if (filter === 'revoked') {
      where.isRevoked = true
    }

    const codes = await db.canalVivoCode.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    // Estadísticas
    const total = await db.canalVivoCode.count()
    const active = await db.canalVivoCode.count({ where: { isUsed: false, isRevoked: false } })
    const used = await db.canalVivoCode.count({ where: { isUsed: true } })
    const revoked = await db.canalVivoCode.count({ where: { isRevoked: true } })

    return NextResponse.json({
      codes,
      stats: { total, active, used, revoked },
    })
  } catch (error) {
    console.error('Error fetching PLAY codes:', error)
    return NextResponse.json({ error: 'Error al cargar códigos PLAY' }, { status: 500 })
  }
}

// POST /api/canal-vivo/codes — Generar uno o múltiples códigos PLAY
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const count = Math.min(Math.max(body.count || 1, 1), 100) // Entre 1 y 100
    const description = body.description || null

    const codes: string[] = []
    const created = []

    for (let i = 0; i < count; i++) {
      let code = generatePlayCode()
      let attempts = 0

      // Asegurar unicidad - reintentar si el código ya existe
      while (codes.includes(code) && attempts < 10) {
        code = generatePlayCode()
        attempts++
      }

      // Verificar contra la base de datos
      const existing = await db.canalVivoCode.findUnique({ where: { code } })
      if (existing) {
        // Generar uno diferente usando randomBytes para mayor entropía
        const extra = randomBytes(4).toString('hex').toUpperCase()
        code = `PLAY${extra}`
      }

      codes.push(code)
      created.push(
        db.canalVivoCode.create({
          data: {
            code,
            description,
            generatedBy: 'admin',
          },
        })
      )
    }

    const result = await Promise.all(created)

    return NextResponse.json({
      codes: result,
      generated: result.length,
      message: `${result.length} código${result.length > 1 ? 's' : ''} PLAY generado${result.length > 1 ? 's' : ''} exitosamente`,
    })
  } catch (error) {
    console.error('Error generating PLAY codes:', error)
    return NextResponse.json({ error: 'Error al generar códigos PLAY' }, { status: 500 })
  }
}

// PUT /api/canal-vivo/codes — Revocar o reactivar un código
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, action } = body // action: 'revoke' | 'reactivate'

    if (!id || !action) {
      return NextResponse.json({ error: 'ID y acción requeridos' }, { status: 400 })
    }

    const existing = await db.canalVivoCode.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Código no encontrado' }, { status: 404 })
    }

    if (action === 'revoke') {
      const updated = await db.canalVivoCode.update({
        where: { id },
        data: { isRevoked: true },
      })
      return NextResponse.json({ code: updated, message: `Código ${updated.code} revocado` })
    }

    if (action === 'reactivate') {
      const updated = await db.canalVivoCode.update({
        where: { id },
        data: { isRevoked: false, isUsed: false, usedBy: null, usedAt: null },
      })
      return NextResponse.json({ code: updated, message: `Código ${updated.code} reactivado` })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Error updating PLAY code:', error)
    return NextResponse.json({ error: 'Error al actualizar código PLAY' }, { status: 500 })
  }
}

// DELETE /api/canal-vivo/codes — Eliminar un código
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await db.canalVivoCode.delete({ where: { id } })
    return NextResponse.json({ message: 'Código eliminado' })
  } catch (error) {
    console.error('Error deleting PLAY code:', error)
    return NextResponse.json({ error: 'Error al eliminar código PLAY' }, { status: 500 })
  }
}
