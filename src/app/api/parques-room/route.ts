import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Generate a 6-char room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I,O,0,1 to avoid confusion
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// GET /api/parques-room — Get room by code or list active rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomCode = searchParams.get('roomCode')
    const participantCode = searchParams.get('participantCode')
    const listAll = searchParams.get('listAll')

    // List all active rooms (for admin)
    if (listAll === 'true') {
      const rooms = await db.parquesRoom.findMany({
        include: { players: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      return NextResponse.json(rooms)
    }

    // Get room by code
    if (roomCode) {
      const room = await db.parquesRoom.findUnique({
        where: { roomCode: roomCode.toUpperCase() },
        include: { players: true },
      })
      if (!room) {
        return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
      }
      return NextResponse.json(room)
    }

    // Get rooms where a participant is playing
    if (participantCode) {
      const rooms = await db.parquesRoom.findMany({
        where: {
          players: { some: { participantCode } },
          status: { in: ['waiting', 'playing'] },
        },
        include: { players: true },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(rooms)
    }

    return NextResponse.json({ error: 'Parámetros requeridos: roomCode, participantCode o listAll' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching parqués room:', error)
    return NextResponse.json({ error: 'Error al buscar sala' }, { status: 500 })
  }
}

// POST /api/parques-room — Create a new room or join an existing one
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, participantCode, teamSlug, clasicoMode, roomCode } = body

    // Verify participant exists
    if (!participantCode) {
      return NextResponse.json({ error: 'Código de participante requerido' }, { status: 400 })
    }
    const participant = await db.participant.findUnique({ where: { code: participantCode } })
    if (!participant) {
      return NextResponse.json({ error: 'Participante no registrado. Regístrate primero.' }, { status: 404 })
    }

    // === CREATE ROOM ===
    if (action === 'create') {
      if (!teamSlug) {
        return NextResponse.json({ error: 'Debes elegir un equipo' }, { status: 400 })
      }

      // Check if participant is already in an active room
      const existingRoom = await db.parquesRoomPlayer.findFirst({
        where: {
          participantCode,
          room: { status: { in: ['waiting', 'playing'] } },
        },
      })
      if (existingRoom) {
        const room = await db.parquesRoom.findUnique({
          where: { id: existingRoom.roomId },
          include: { players: true },
        })
        return NextResponse.json({ error: 'Ya estás en una sala activa', room })
      }

      // Generate unique room code
      let code = generateRoomCode()
      let codeExists = await db.parquesRoom.findUnique({ where: { roomCode: code } })
      while (codeExists) {
        code = generateRoomCode()
        codeExists = await db.parquesRoom.findUnique({ where: { roomCode: code } })
      }

      // Create room with creator as player 0
      const room = await db.parquesRoom.create({
        data: {
          roomCode: code,
          clasicoMode: clasicoMode || 'rivales-historicos',
          status: 'waiting',
          currentPlayer: 0,
          players: {
            create: {
              participantCode,
              participantName: participant.name,
              teamSlug,
              playerIndex: 0,
              isCreator: true,
            },
          },
        },
        include: { players: true },
      })

      return NextResponse.json(room, { status: 201 })
    }

    // === JOIN ROOM ===
    if (action === 'join') {
      if (!roomCode || !teamSlug) {
        return NextResponse.json({ error: 'Código de sala y equipo requeridos' }, { status: 400 })
      }

      const room = await db.parquesRoom.findUnique({
        where: { roomCode: roomCode.toUpperCase() },
        include: { players: true },
      })
      if (!room) {
        return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
      }
      if (room.status !== 'waiting') {
        return NextResponse.json({ error: 'La sala ya está en juego o finalizada' }, { status: 400 })
      }
      if (room.players.length >= 4) {
        return NextResponse.json({ error: 'La sala está llena' }, { status: 400 })
      }

      // Check if already in this room
      if (room.players.some(p => p.participantCode === participantCode)) {
        return NextResponse.json({ error: 'Ya estás en esta sala', room })
      }

      // Check if participant is in another active room
      const existingRoom = await db.parquesRoomPlayer.findFirst({
        where: {
          participantCode,
          room: { status: { in: ['waiting', 'playing'] } },
        },
      })
      if (existingRoom && existingRoom.roomId !== room.id) {
        return NextResponse.json({ error: 'Ya estás en otra sala activa' }, { status: 400 })
      }

      // Check team not already taken
      if (room.players.some(p => p.teamSlug === teamSlug)) {
        return NextResponse.json({ error: 'Este equipo ya fue elegido por otro jugador' }, { status: 400 })
      }

      // Add player
      const playerIndex = room.players.length
      const updatedRoom = await db.parquesRoom.update({
        where: { id: room.id },
        data: {
          players: {
            create: {
              participantCode,
              participantName: participant.name,
              teamSlug,
              playerIndex,
              isCreator: false,
            },
          },
        },
        include: { players: true },
      })

      return NextResponse.json(updatedRoom)
    }

    // === START GAME ===
    if (action === 'start') {
      if (!roomCode) {
        return NextResponse.json({ error: 'Código de sala requerido' }, { status: 400 })
      }

      const room = await db.parquesRoom.findUnique({
        where: { roomCode: roomCode.toUpperCase() },
        include: { players: true },
      })
      if (!room) {
        return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
      }

      // Only creator can start
      const creator = room.players.find(p => p.isCreator)
      if (!creator || creator.participantCode !== participantCode) {
        return NextResponse.json({ error: 'Solo el creador puede iniciar el juego' }, { status: 403 })
      }

      if (room.players.length < 2) {
        return NextResponse.json({ error: 'Se necesitan al menos 2 jugadores' }, { status: 400 })
      }

      if (room.status !== 'waiting') {
        return NextResponse.json({ error: 'El juego ya comenzó' }, { status: 400 })
      }

      // Initialize game state
      const tokensPerPlayer = 2 // from config, simplified
      const gameState = {
        tokens: room.players.map((_, i) =>
          Array.from({ length: tokensPerPlayer }, (_, j) => ({
            id: j,
            player: i,
            state: 'home',
            trackPos: -1,
            corridorPos: -1,
          }))
        ),
        consecutiveSixes: 0,
        lastDice: 0,
        startedAt: new Date().toISOString(),
      }

      const updatedRoom = await db.parquesRoom.update({
        where: { id: room.id },
        data: {
          status: 'playing',
          currentPlayer: 0,
          gameState: JSON.stringify(gameState),
        },
        include: { players: true },
      })

      return NextResponse.json(updatedRoom)
    }

    // === ROLL DICE ===
    if (action === 'roll') {
      if (!roomCode) {
        return NextResponse.json({ error: 'Código de sala requerido' }, { status: 400 })
      }

      const room = await db.parquesRoom.findUnique({
        where: { roomCode: roomCode.toUpperCase() },
        include: { players: true },
      })
      if (!room) {
        return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
      }
      if (room.status !== 'playing') {
        return NextResponse.json({ error: 'El juego no está en curso' }, { status: 400 })
      }

      // Check it's this player's turn
      const player = room.players.find(p => p.participantCode === participantCode)
      if (!player) {
        return NextResponse.json({ error: 'No estás en esta sala' }, { status: 403 })
      }
      if (player.playerIndex !== room.currentPlayer) {
        return NextResponse.json({ error: 'No es tu turno' }, { status: 403 })
      }

      // Generate random dice
      const diceValue = Math.floor(Math.random() * 6) + 1
      const gameState = JSON.parse(room.gameState || '{}')
      gameState.lastDice = diceValue

      await db.parquesRoom.update({
        where: { id: room.id },
        data: { gameState: JSON.stringify(gameState) },
      })

      return NextResponse.json({ diceValue, gameState })
    }

    // === MOVE TOKEN ===
    if (action === 'move') {
      const { tokenId } = body
      if (!roomCode || tokenId === undefined) {
        return NextResponse.json({ error: 'Código de sala y tokenId requeridos' }, { status: 400 })
      }

      const room = await db.parquesRoom.findUnique({
        where: { roomCode: roomCode.toUpperCase() },
        include: { players: true },
      })
      if (!room) {
        return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
      }

      const player = room.players.find(p => p.participantCode === participantCode)
      if (!player) {
        return NextResponse.json({ error: 'No estás en esta sala' }, { status: 403 })
      }
      if (player.playerIndex !== room.currentPlayer) {
        return NextResponse.json({ error: 'No es tu turno' }, { status: 403 })
      }

      const gameState = JSON.parse(room.gameState || '{}')
      const tokens = gameState.tokens || []
      const playerTokens = tokens[player.playerIndex] || []
      const token = playerTokens.find((t: { id: number }) => t.id === tokenId)
      if (!token) {
        return NextResponse.json({ error: 'Ficha no encontrada' }, { status: 404 })
      }

      // Return the new game state (client sends the computed new state)
      // The client will compute valid moves and send the chosen move
      return NextResponse.json({ gameState })
    }

    // === UPDATE GAME STATE (client sends full new state after a move) ===
    if (action === 'updateState') {
      const { newGameState, nextPlayer, winnerIdx, playerScore } = body
      if (!roomCode) {
        return NextResponse.json({ error: 'Código de sala requerido' }, { status: 400 })
      }

      const room = await db.parquesRoom.findUnique({
        where: { roomCode: roomCode.toUpperCase() },
        include: { players: true },
      })
      if (!room) {
        return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
      }

      const player = room.players.find(p => p.participantCode === participantCode)
      if (!player) {
        return NextResponse.json({ error: 'No estás en esta sala' }, { status: 403 })
      }
      if (player.playerIndex !== room.currentPlayer) {
        return NextResponse.json({ error: 'No es tu turno' }, { status: 403 })
      }

      const updateData: Record<string, unknown> = {}
      if (newGameState) updateData.gameState = typeof newGameState === 'string' ? newGameState : JSON.stringify(newGameState)
      if (nextPlayer !== undefined) updateData.currentPlayer = nextPlayer
      if (winnerIdx !== undefined && winnerIdx >= 0) {
        updateData.winnerPlayerIdx = winnerIdx
        updateData.status = 'finished'
      }

      const updatedRoom = await db.parquesRoom.update({
        where: { id: room.id },
        data: updateData,
        include: { players: true },
      })

      // Update player score if provided
      if (playerScore !== undefined) {
        await db.parquesRoomPlayer.update({
          where: { id: player.id },
          data: { score: playerScore },
        })
        // Also update participant total points if game finished
        if (winnerIdx >= 0) {
          await db.participant.update({
            where: { code: participantCode },
            data: { totalPoints: { increment: playerScore } },
          })
        }
      }

      return NextResponse.json(updatedRoom)
    }

    // === LEAVE ROOM ===
    if (action === 'leave') {
      if (!roomCode) {
        return NextResponse.json({ error: 'Código de sala requerido' }, { status: 400 })
      }

      const room = await db.parquesRoom.findUnique({
        where: { roomCode: roomCode.toUpperCase() },
        include: { players: true },
      })
      if (!room) {
        return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
      }

      const player = room.players.find(p => p.participantCode === participantCode)
      if (!player) {
        return NextResponse.json({ error: 'No estás en esta sala' }, { status: 400 })
      }

      // If room is still waiting, just remove the player
      if (room.status === 'waiting') {
        await db.parquesRoomPlayer.delete({ where: { id: player.id } })
        // If creator leaves and room has other players, transfer creator
        if (player.isCreator && room.players.length > 1) {
          const nextPlayer = room.players.find(p => p.id !== player.id)
          if (nextPlayer) {
            await db.parquesRoomPlayer.update({
              where: { id: nextPlayer.id },
              data: { isCreator: true },
            })
          }
        }
        // If no players left, delete room
        const remainingPlayers = await db.parquesRoomPlayer.count({ where: { roomId: room.id } })
        if (remainingPlayers === 0) {
          await db.parquesRoom.delete({ where: { id: room.id } })
        }
      } else {
        // If game in progress, mark as finished
        await db.parquesRoom.update({
          where: { id: room.id },
          data: { status: 'finished' },
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
  } catch (error) {
    console.error('Error in parqués room:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// DELETE /api/parques-room — Delete a room (admin or creator)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'roomId requerido' }, { status: 400 })
    }

    await db.parquesRoom.delete({ where: { id: roomId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting parqués room:', error)
    return NextResponse.json({ error: 'Error al eliminar sala' }, { status: 500 })
  }
}
