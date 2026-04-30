---
Task ID: 1
Agent: Main Agent
Task: Build Parqués Futbolero invite-only multiplayer system

Work Log:
- Analyzed existing Parqués game codebase (single-player vs AI, 1147 lines)
- Added ParquesRoom and ParquesRoomPlayer models to prisma/schema.prisma
- Created /api/parques-room API route with actions: create, join, start, roll, move, updateState, leave
- Rewrote ParquesGame component for invite-only multiplayer:
  - Login with TPK code required to play
  - Create room (choose clásico + team) → get room code
  - Join room (enter room code + choose team)
  - Lobby with live polling for player joining
  - Game with turn-based play, dice rolling via server, move sync
  - WhatsApp invite + clipboard copy for room code sharing
  - Leave room / abandon game
- Updated AdminPanel with rooms management section (list rooms, delete rooms, refresh)
- Added Image import from next/image to AdminPanel
- Pushed schema to Neon database via Vercel build (prisma db push)
- Deployed to production at tpkplay.vercel.app

Stage Summary:
- All files committed and deployed successfully
- New API route: /api/parques-room
- New DB tables: ParquesRoom, ParquesRoomPlayer
- Parqués game now requires TPK code login and invitation to play
- Admin panel shows active rooms with ability to delete them
