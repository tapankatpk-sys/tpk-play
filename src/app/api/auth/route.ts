import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// In-memory session store (resets on server restart)
const activeSessions = new Map<string, { email: string; createdAt: number }>()

const ADMIN_EMAIL = 'tapankatpk@gmail.com'
const ADMIN_PASSWORD_HASH = '$2b$10$DQnmp4/Jyjkp5zthS9myhOCY1bKf1IE2K9qHW.G4rQo/A360BHX82'

const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, action } = body

    // Login
    if (action === 'login') {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Correo y contraseña son requeridos' },
          { status: 400 }
        )
      }

      if (email !== ADMIN_EMAIL) {
        return NextResponse.json(
          { error: 'Credenciales inválidas' },
          { status: 401 }
        )
      }

      const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Credenciales inválidas' },
          { status: 401 }
        )
      }

      // Create session token
      const token = crypto.randomBytes(32).toString('hex')
      activeSessions.set(token, { email, createdAt: Date.now() })

      return NextResponse.json({
        success: true,
        token,
        email,
      })
    }

    // Verify session
    if (action === 'verify') {
      const { token } = body
      if (!token) {
        return NextResponse.json({ valid: false }, { status: 401 })
      }

      const session = activeSessions.get(token)
      if (!session) {
        return NextResponse.json({ valid: false }, { status: 401 })
      }

      // Check expiration
      if (Date.now() - session.createdAt > SESSION_DURATION) {
        activeSessions.delete(token)
        return NextResponse.json({ valid: false }, { status: 401 })
      }

      return NextResponse.json({ valid: true, email: session.email })
    }

    // Logout
    if (action === 'logout') {
      const { token } = body
      if (token) {
        activeSessions.delete(token)
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Error de autenticación' }, { status: 500 })
  }
}
