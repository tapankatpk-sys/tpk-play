// ============================================
// CRUCIGRAMA GENERATOR - Motor de generación
// ============================================

export interface CrosswordWord {
  word: string       // uppercase, no spaces
  clue: string       // the question/clue text
  category: string   // e.g. "estadio", "fundacion", "apodo"
}

export interface PlacedWord {
  word: string
  clue: string
  category: string
  row: number
  col: number
  direction: 'across' | 'down'
  number: number  // display number for clues
}

export interface GridCell {
  letter: string
  number?: number    // word start number
  isAcrossStart?: boolean
  isDownStart?: boolean
  acrossWord?: string  // which across word this belongs to
  downWord?: string    // which down word this belongs to
}

export interface CrosswordPuzzle {
  grid: (GridCell | null)[][]
  placedWords: PlacedWord[]
  rows: number
  cols: number
  teamId?: string
  teamName?: string
  difficulty: 'bajo' | 'medio' | 'dificil'
}

// ============================================
// Seeded random for deterministic generation
// ============================================
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ============================================
// Main crossword generation algorithm
// ============================================
export function generateCrossword(
  words: CrosswordWord[],
  difficulty: 'bajo' | 'medio' | 'dificil',
  seed: number = Date.now(),
  teamId?: string,
  teamName?: string
): CrosswordPuzzle {
  const rng = seededRandom(seed)

  // Sort words by length (longest first) then shuffle within same length
  const sortedWords = [...words].sort((a, b) => {
    const lenDiff = b.word.length - a.word.length
    if (lenDiff !== 0) return lenDiff
    return rng() > 0.5 ? 1 : -1
  })

  // Limit words based on difficulty
  const maxWords = difficulty === 'bajo' ? 10 : difficulty === 'medio' ? 20 : 30
  const selectedWords = sortedWords.slice(0, maxWords)

  // Grid dimensions
  const maxLen = Math.max(...selectedWords.map(w => w.word.length), 5)
  const gridSize = Math.max(maxLen + 10, difficulty === 'bajo' ? 18 : difficulty === 'medio' ? 24 : 30)

  // Initialize empty grid
  const grid: (GridCell | null)[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => null)
  )

  const placedWords: PlacedWord[] = []

  // Helper: check if a word can be placed at position
  function canPlace(word: string, row: number, col: number, dir: 'across' | 'down'): boolean {
    const len = word.length
    const dr = dir === 'down' ? 1 : 0
    const dc = dir === 'across' ? 1 : 0

    // Check bounds
    if (row < 0 || col < 0) return false
    if (row + dr * (len - 1) >= gridSize) return false
    if (col + dc * (len - 1) >= gridSize) return false

    // Check cell before word start (should be empty)
    const beforeR = row - dr
    const beforeC = col - dc
    if (beforeR >= 0 && beforeC >= 0 && grid[beforeR][beforeC] !== null) return false

    // Check cell after word end (should be empty)
    const afterR = row + dr * len
    const afterC = col + dc * len
    if (afterR < gridSize && afterC < gridSize && grid[afterR][afterC] !== null) return false

    let hasIntersection = placedWords.length === 0

    for (let i = 0; i < len; i++) {
      const r = row + dr * i
      const c = col + dc * i
      const cell = grid[r][c]

      if (cell !== null) {
        // Cell is occupied - check if letter matches
        if (cell.letter !== word[i]) return false
        // This is a valid intersection
        hasIntersection = true

        // Check that we're not running parallel to another word of same direction
        if (dir === 'across' && cell.acrossWord) return false
        if (dir === 'down' && cell.downWord) return false
      } else {
        // Cell is empty - check that adjacent cells perpendicular to direction are empty
        // This prevents words from being adjacent without intersection
        if (dir === 'across') {
          // Check above and below
          if (r > 0 && grid[r - 1][c] !== null) {
            // There's a cell above - it's ok only if it's part of a down word that intersects here
            const aboveCell = grid[r - 1][c]
            if (!aboveCell?.downWord) return false
          }
          if (r < gridSize - 1 && grid[r + 1][c] !== null) {
            const belowCell = grid[r + 1][c]
            if (!belowCell?.downWord) return false
          }
        } else {
          // Check left and right
          if (c > 0 && grid[r][c - 1] !== null) {
            const leftCell = grid[r][c - 1]
            if (!leftCell?.acrossWord) return false
          }
          if (c < gridSize - 1 && grid[r][c + 1] !== null) {
            const rightCell = grid[r][c + 1]
            if (!rightCell?.acrossWord) return false
          }
        }
      }
    }

    return hasIntersection
  }

  // Helper: place a word on the grid
  function placeWord(word: string, row: number, col: number, dir: 'across' | 'down', num: number, clue: string, category: string) {
    const dr = dir === 'down' ? 1 : 0
    const dc = dir === 'across' ? 1 : 0
    const len = word.length

    for (let i = 0; i < len; i++) {
      const r = row + dr * i
      const c = col + dc * i

      if (grid[r][c] === null) {
        grid[r][c] = {
          letter: word[i],
          acrossWord: dir === 'across' ? word : undefined,
          downWord: dir === 'down' ? word : undefined,
        }
      } else {
        // Existing cell (intersection)
        if (dir === 'across') {
          grid[r][c]!.acrossWord = word
        } else {
          grid[r][c]!.downWord = word
        }
      }
    }

    // Set start number
    if (grid[row][col]) {
      grid[row][col]!.number = num
      if (dir === 'across') grid[row][col]!.isAcrossStart = true
      else grid[row][col]!.isDownStart = true
    }

    placedWords.push({ word, clue, category, row, col, direction: dir, number: num })
  }

  // Place first word horizontally at center
  if (selectedWords.length > 0) {
    const firstWord = selectedWords[0]
    const startRow = Math.floor(gridSize / 2)
    const startCol = Math.floor((gridSize - firstWord.word.length) / 2)
    placeWord(firstWord.word, startRow, startCol, 'across', 1, firstWord.clue, firstWord.category)
  }

  // Place remaining words
  let wordNumber = 2
  for (let w = 1; w < selectedWords.length; w++) {
    const entry = selectedWords[w]
    const word = entry.word
    let bestPos: { row: number; col: number; dir: 'across' | 'down'; score: number } | null = null

    // Try to find a placement that intersects with existing words
    for (let pi = 0; pi < placedWords.length; pi++) {
      const placed = placedWords[pi]
      // Look for common letters between this word and placed words
      for (let i = 0; i < word.length; i++) {
        for (let j = 0; j < placed.word.length; j++) {
          if (word[i] === placed.word[j]) {
            // Try placing perpendicular to the placed word
            const newDir: 'across' | 'down' = placed.direction === 'across' ? 'down' : 'across'
            let newRow: number, newCol: number

            if (placed.direction === 'across') {
              // Placed word is across, new word goes down
              newRow = placed.row - i
              newCol = placed.col + j
            } else {
              // Placed word is down, new word goes across
              newRow = placed.row + j
              newCol = placed.col - i
            }

            if (canPlace(word, newRow, newCol, newDir)) {
              // Score: prefer central positions and more intersections
              const centerR = gridSize / 2
              const centerC = gridSize / 2
              const midR = newRow + (newDir === 'down' ? word.length / 2 : 0)
              const midC = newCol + (newDir === 'across' ? word.length / 2 : 0)
              const distFromCenter = Math.abs(midR - centerR) + Math.abs(midC - centerC)
              const score = 1000 - distFromCenter

              if (!bestPos || score > bestPos.score) {
                bestPos = { row: newRow, col: newCol, dir: newDir, score }
              }
            }
          }
        }
      }
    }

    if (bestPos) {
      placeWord(word, bestPos.row, bestPos.col, bestPos.dir, wordNumber, entry.clue, entry.category)
      wordNumber++
    }
  }

  // Trim the grid to remove empty rows/cols around the crossword
  let minR = gridSize, maxR = 0, minC = gridSize, maxC = 0
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] !== null) {
        minR = Math.min(minR, r)
        maxR = Math.max(maxR, r)
        minC = Math.min(minC, c)
        maxC = Math.max(maxC, c)
      }
    }
  }

  // Add padding
  const pad = 1
  const trimmedRows = maxR - minR + 1 + pad * 2
  const trimmedCols = maxC - minC + 1 + pad * 2
  const trimmedGrid: (GridCell | null)[][] = Array.from({ length: trimmedRows }, () =>
    Array.from({ length: trimmedCols }, () => null)
  )

  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      trimmedGrid[r - minR + pad][c - minC + pad] = grid[r][c]
    }
  }

  // Adjust placed word positions
  const adjustedWords = placedWords.map(pw => ({
    ...pw,
    row: pw.row - minR + pad,
    col: pw.col - minC + pad,
  }))

  return {
    grid: trimmedGrid,
    placedWords: adjustedWords,
    rows: trimmedRows,
    cols: trimmedCols,
    teamId,
    teamName,
    difficulty,
  }
}

// ============================================
// Get current hour's team (Colombia timezone)
// ============================================
export function getCurrentCrosswordTeam(teamIds: string[], seed?: number): number {
  const now = new Date()
  const colombiaOffset = -5
  const colombiaTime = new Date(now.getTime() + (colombiaOffset + now.getTimezoneOffset() / 60) * 3600000)
  const hourKey = colombiaTime.getFullYear() * 1000000 +
    (colombiaTime.getMonth() + 1) * 10000 +
    colombiaTime.getDate() * 100 +
    colombiaTime.getHours()

  const rng = seededRandom(hourKey)
  // Use rng to pick a team index
  let idx = Math.floor(rng() * teamIds.length)
  return idx
}

// ============================================
// Validate crossword answers
// ============================================
export function validateCrossword(
  puzzle: CrosswordPuzzle,
  answers: Record<string, string>  // key: "row-col", value: letter
): { isComplete: boolean; correctWords: number; totalWords: number; incorrectCells: number } {
  let correctCells = 0
  let totalCells = 0
  let incorrectCells = 0

  for (let r = 0; r < puzzle.rows; r++) {
    for (let c = 0; c < puzzle.cols; c++) {
      const cell = puzzle.grid[r][c]
      if (cell !== null) {
        totalCells++
        const key = `${r}-${c}`
        const answer = answers[key]?.toUpperCase()
        if (answer === cell.letter) {
          correctCells++
        } else if (answer && answer !== '') {
          incorrectCells++
        }
      }
    }
  }

  // Check if all placed words are correctly filled
  let correctWords = 0
  for (const pw of puzzle.placedWords) {
    let wordCorrect = true
    const dr = pw.direction === 'down' ? 1 : 0
    const dc = pw.direction === 'across' ? 1 : 0
    for (let i = 0; i < pw.word.length; i++) {
      const key = `${pw.row + dr * i}-${pw.col + dc * i}`
      if (answers[key]?.toUpperCase() !== pw.word[i]) {
        wordCorrect = false
        break
      }
    }
    if (wordCorrect) correctWords++
  }

  return {
    isComplete: correctCells === totalCells && incorrectCells === 0,
    correctWords,
    totalWords: puzzle.placedWords.length,
    incorrectCells,
  }
}
