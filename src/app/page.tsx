'use client'

import dynamic from 'next/dynamic'
import HeroSection from '@/components/hero/HeroSection'
import TPKBanners from '@/components/banners/TPKBanners'
import MatchPredictions from '@/components/predictions/MatchPredictions'
import RegistrationSection from '@/components/registration/RegistrationSection'
import GameGuard from '@/components/gameguard/GameGuard'
import CircularPopup from '@/components/popup/CircularPopup'

// ============================================
// DYNAMIC IMPORTS - Code Splitting para 18 juegos
// Solo se carga el código del juego cuando el usuario hace scroll/lo necesita
// Esto reduce el bundle inicial de ~2MB a ~200KB
// ============================================

const GameSkeleton = () => (
  <div className="max-w-2xl mx-auto px-4">
    <div
      className="rounded-2xl p-8 text-center border animate-pulse"
      style={{
        background: 'linear-gradient(145deg, #0a0015 0%, #1a0030 50%, #0a0015 100%)',
        borderColor: 'rgba(168, 85, 247, 0.2)',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="text-2xl" style={{ color: 'rgba(168,85,247,0.3)' }}>Cargando...</div>
    </div>
  </div>
)

const TriviaGame = dynamic(() => import('@/components/trivia/TriviaGame'), {
  ssr: false,
  loading: GameSkeleton,
})

const LightningTriviaGame = dynamic(() => import('@/components/lightning/LightningTriviaGame'), {
  ssr: false,
  loading: GameSkeleton,
})

const MemoryGame = dynamic(() => import('@/components/memory/MemoryGame'), {
  ssr: false,
  loading: GameSkeleton,
})

const CrosswordGame = dynamic(() => import('@/components/crossword/CrosswordGame'), {
  ssr: false,
  loading: GameSkeleton,
})

const SlotMachineGame = dynamic(() => import('@/components/slot/SlotMachineGame'), {
  ssr: false,
  loading: GameSkeleton,
})

const LoteriaGame = dynamic(() => import('@/components/loteria/LoteriaGame'), {
  ssr: false,
  loading: GameSkeleton,
})

const RuletaEquipos = dynamic(() => import('@/components/ruleta/RuletaEquipos'), {
  ssr: false,
  loading: GameSkeleton,
})

const CircuitoFutbolero = dynamic(() => import('@/components/circuito/CircuitoFutbolero'), {
  ssr: false,
  loading: GameSkeleton,
})

const ParquesGame = dynamic(() => import('@/components/parques/ParquesGame'), {
  ssr: false,
  loading: GameSkeleton,
})

const RompecabezasGame = dynamic(() => import('@/components/rompecabezas/RompecabezasGame'), {
  ssr: false,
  loading: GameSkeleton,
})

const PenalesFutboleros = dynamic(() => import('@/components/penales/PenalesFutboleros'), {
  ssr: false,
  loading: GameSkeleton,
})

const CartaMayor = dynamic(() => import('@/components/carta-mayor/CartaMayor'), {
  ssr: false,
  loading: GameSkeleton,
})

const DianaEscudos = dynamic(() => import('@/components/diana/DianaEscudos'), {
  ssr: false,
  loading: GameSkeleton,
})

const ClasificacionHistorica = dynamic(() => import('@/components/clasificacion/ClasificacionHistorica'), {
  ssr: false,
  loading: GameSkeleton,
})

const NumeroCamiseta = dynamic(() => import('@/components/numero-camiseta/NumeroCamiseta'), {
  ssr: false,
  loading: GameSkeleton,
})

const MineriaEscudos = dynamic(() => import('@/components/mineria/MineriaEscudos'), {
  ssr: false,
  loading: GameSkeleton,
})

const ApuestaFutbolera = dynamic(() => import('@/components/apuesta/ApuestaFutbolera'), {
  ssr: false,
  loading: GameSkeleton,
})

const SopaEscudos = dynamic(() => import('@/components/sopa/SopaEscudos'), {
  ssr: false,
  loading: GameSkeleton,
})

const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
  ssr: false,
})

// ============================================
// SEPARADOR REUTILIZABLE entre juegos
// ============================================
function GameSeparator({ color, icon, label }: { color: string; icon: string; label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-4 md:py-6">
      <div className="h-px flex-1 max-w-24 md:max-w-32" style={{
        background: `linear-gradient(to right, transparent, ${color}66)`,
      }} />
      <div className="flex items-center gap-1.5 md:gap-2">
        <span style={{ color, textShadow: `0 0 8px ${color}99`, fontSize: '0.7rem' }}>{icon}</span>
        <span className="text-[0.5rem] md:text-[0.6rem] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold" style={{ color: `${color}80` }}>
          {label}
        </span>
        <span style={{ color, textShadow: `0 0 8px ${color}99`, fontSize: '0.7rem' }}>{icon}</span>
      </div>
      <div className="h-px flex-1 max-w-24 md:max-w-32" style={{
        background: `linear-gradient(to left, transparent, ${color}66)`,
      }} />
    </div>
  )
}

// ============================================
// HOMEPAGE
// ============================================
export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />

      {/* TPK Banners - Ganador & Premio */}
      <TPKBanners />

      {/* Match Predictions - Liga BetPlay */}
      <MatchPredictions />

      {/* Games Section */}
      <section className="relative py-8 md:py-12">
        {/* Section divider */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.5), rgba(249, 115, 22, 0.5), rgba(34, 197, 94, 0.5), transparent)',
        }} />

        {/* Section title */}
        <div className="text-center mb-6 md:mb-8 relative">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.08) 0%, transparent 60%)',
          }} />
          <div className="relative">
            <h2
              className="text-lg md:text-2xl font-black uppercase tracking-wider mb-1 md:mb-2"
              style={{
                background: 'linear-gradient(90deg, #d8b4fe, #a855f7, #f97316, #fbbf24, #a855f7)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 4s linear infinite',
                filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.4))',
              }}
            >
              JUEGOS TPK PLAY
            </h2>
            <p className="text-[0.6rem] md:text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Debes estar registrado e ingresar tu código TPK para participar
            </p>
          </div>
        </div>

        {/* Trivia Futbolera */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Trivia Futbolera" gameIcon="⚽" accentColor="#a855f7">
            <TriviaGame />
          </GameGuard>
        </div>

        <GameSeparator color="#eab308" icon="⚡" label="Más juegos" />

        {/* Trivia Relámpago */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Trivia Relámpago" gameIcon="⚡" accentColor="#f97316">
            <LightningTriviaGame />
          </GameGuard>
        </div>

        <GameSeparator color="#a855f7" icon="🧠" label="Nuevo juego" />

        {/* Memoria Futbolera */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Memoria Futbolera" gameIcon="🧠" accentColor="#ec4899">
            <MemoryGame />
          </GameGuard>
        </div>

        <GameSeparator color="#a855f7" icon="🎯" label="Nuevo juego" />

        {/* Crucigrama Futbolero */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Crucigrama Futbolero" gameIcon="🎯" accentColor="#06b6d4">
            <CrosswordGame />
          </GameGuard>
        </div>

        <GameSeparator color="#fbbf24" icon="🎰" label="Nuevo juego" />

        {/* Tragamonedas Futbolera */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Tragamonedas Futbolera" gameIcon="🎰" accentColor="#fbbf24">
            <SlotMachineGame />
          </GameGuard>
        </div>

        <GameSeparator color="#ff00ff" icon="🃏" label="Nuevo juego" />

        {/* Lotería de Equipos */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Lotería de Equipos" gameIcon="🃏" accentColor="#e879f9">
            <LoteriaGame />
          </GameGuard>
        </div>

        <GameSeparator color="#ffc800" icon="🎡" label="Nuevo juego" />

        {/* Ruleta de Equipos */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Ruleta de Equipos" gameIcon="🎡" accentColor="#ffc800">
            <RuletaEquipos />
          </GameGuard>
        </div>

        <GameSeparator color="#00ff80" icon="🎮" label="Nuevo juego" />

        {/* Circuito Futbolero */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Circuito Futbolero" gameIcon="🎮" accentColor="#22c55e">
            <CircuitoFutbolero />
          </GameGuard>
        </div>

        <GameSeparator color="#facc15" icon="🎲" label="Nuevo juego" />

        {/* Parqués Futbolero */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Parqués Futbolero" gameIcon="🎲" accentColor="#facc15">
            <ParquesGame />
          </GameGuard>
        </div>

        <GameSeparator color="#00ffc8" icon="🧩" label="Nuevo juego" />

        {/* Rompecabezas de Escudos */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Rompecabezas de Escudos" gameIcon="🧩" accentColor="#00ffc8">
            <RompecabezasGame />
          </GameGuard>
        </div>

        <GameSeparator color="#ff4444" icon="⚽" label="Nuevo juego" />

        {/* Penales Futboleros */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Penales Futboleros" gameIcon="⚽" accentColor="#ff4444">
            <PenalesFutboleros />
          </GameGuard>
        </div>

        <GameSeparator color="#eab308" icon="🃏" label="Nuevo juego" />

        {/* Carta Mayor */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Carta Mayor" gameIcon="🃏" accentColor="#eab308">
            <CartaMayor />
          </GameGuard>
        </div>

        <GameSeparator color="#ef4444" icon="🎯" label="Nuevo juego" />

        {/* Diana de Escudos */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Diana de Escudos" gameIcon="🎯" accentColor="#ef4444">
            <DianaEscudos />
          </GameGuard>
        </div>

        <GameSeparator color="#06b6d4" icon="🏆" label="Nuevo juego" />

        {/* Clasificación Histórica */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Clasificación Histórica" gameIcon="🏆" accentColor="#06b6d4">
            <ClasificacionHistorica />
          </GameGuard>
        </div>

        <GameSeparator color="#8b5cf6" icon="🔢" label="Nuevo juego" />

        {/* Número Camiseta */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Número Camiseta" gameIcon="🔢" accentColor="#8b5cf6">
            <NumeroCamiseta />
          </GameGuard>
        </div>

        <GameSeparator color="#22c55e" icon="💣" label="Nuevo juego" />

        {/* Minería de Escudos */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Minería de Escudos" gameIcon="💣" accentColor="#22c55e">
            <MineriaEscudos />
          </GameGuard>
        </div>

        <GameSeparator color="#f97316" icon="📊" label="Nuevo juego" />

        {/* Apuesta Futbolera */}
        <div className="relative z-10 mb-6 md:mb-10">
          <GameGuard gameName="Apuesta Futbolera" gameIcon="📊" accentColor="#f97316">
            <ApuestaFutbolera />
          </GameGuard>
        </div>

        <GameSeparator color="#14b8a6" icon="🔤" label="Nuevo juego" />

        {/* Sopa de Escudos */}
        <div className="relative z-10">
          <GameGuard gameName="Sopa de Escudos" gameIcon="🔤" accentColor="#14b8a6">
            <SopaEscudos />
          </GameGuard>
        </div>
      </section>

      {/* Registration Section */}
      <section className="relative py-8 md:py-12">
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.5), rgba(249, 115, 22, 0.5), rgba(34, 197, 94, 0.5), transparent)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.05) 0%, transparent 70%)',
        }} />
        <div className="relative z-10">
          <RegistrationSection />
        </div>
      </section>

      {/* Admin Panel (floating) */}
      <AdminPanel />

      {/* Circular Popup */}
      <CircularPopup />
    </main>
  )
}
