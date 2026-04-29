---
Task ID: 4
Agent: full-stack-developer
Task: Enhance admin panel with game management and preview

Work Log:
- Read all existing files: AdminPanel.tsx, games API, trivia API, lightning API, participants API, auth API, Prisma schema, page.tsx
- Updated /api/games/route.ts: Added support for `type`, `config`, `order` fields in POST and PUT handlers. Auto-calculates order if not specified. GET now orders by `order` field instead of `createdAt`.
- Updated /api/trivia/route.ts: Added `?preview=true` query parameter support. When preview mode is active, the response includes the `correctAnswer` field (normally hidden from players) and a `preview: true` flag.
- Updated /api/lightning/route.ts: Added `?preview=true` query parameter support. Preview mode includes `correctAnswer` in each question and returns simplified response without user session data. Fixed TypeScript error with sessionResult type annotation.
- Created /components/admin/GamePreviewModal.tsx: New modal component with three sub-previews:
  - TriviaFutboleraPreview: Fetches current trivia question with correct answer highlighted in green
  - TriviaRelampagoPreview: Fetches all 5 lightning questions with correct answers highlighted
  - GenericGamePreview: Shows game info card, config JSON, and participant count for unknown types
  - Includes "MODO VISTA PREVIA - ADMINISTRADOR" banner
  - Escape key to close, click outside to close
- Rewrote /components/admin/AdminPanel.tsx: Complete rewrite with:
  - Three tabs: Juegos, Participantes, Estadísticas
  - Enhanced game cards with type badge (icon + color), order, participant count
  - Preview button (eye icon), edit button (pencil icon), toggle active, delete with confirmation
  - Up/down reorder buttons for game ordering
  - Full game form modal with all fields: name, type (select), description, imageUrl, order, isActive toggle, config JSON with validation
  - Stats tab with: total participants, total points, active games, avg points, games by type, top 5 participants, social follow stats with progress bars
  - Participants tab preserved with WhatsApp integration and points display
  - All styling consistent with Las Vegas neon theme (purple, orange, gold, green)
- Verified TypeScript compilation: No errors in src/ directory
- Verified Next.js build: Successfully compiled

Stage Summary:
- Games API now supports type, config, order fields ✓
- Trivia API supports admin preview mode with correct answers ✓
- Lightning API supports admin preview mode with correct answers ✓
- GamePreviewModal renders trivia and lightning games without TPK code ✓
- AdminPanel has full CRUD with enhanced cards and preview ✓
- Stats tab shows comprehensive dashboard ✓
- Build verified successful ✓
