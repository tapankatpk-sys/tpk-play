import HeroSection from '@/components/hero/HeroSection'
import TPKBanners from '@/components/banners/TPKBanners'
import MatchPredictions from '@/components/predictions/MatchPredictions'
import RegistrationSection from '@/components/registration/RegistrationSection'
import TriviaGame from '@/components/trivia/TriviaGame'
import LightningTriviaGame from '@/components/lightning/LightningTriviaGame'
import MemoryGame from '@/components/memory/MemoryGame'
import CrosswordGame from '@/components/crossword/CrosswordGame'
import SlotMachineGame from '@/components/slot/SlotMachineGame'
import LoteriaGame from '@/components/loteria/LoteriaGame'
import RuletaEquipos from '@/components/ruleta/RuletaEquipos'
import CircuitoFutbolero from '@/components/circuito/CircuitoFutbolero'
import ParquesGame from '@/components/parques/ParquesGame'
import RompecabezasGame from '@/components/rompecabezas/RompecabezasGame'
import PenalesFutboleros from '@/components/penales/PenalesFutboleros'
import CartaMayor from '@/components/carta-mayor/CartaMayor'
import DianaEscudos from '@/components/diana/DianaEscudos'
import ClasificacionHistorica from '@/components/clasificacion/ClasificacionHistorica'
import NumeroCamiseta from '@/components/numero-camiseta/NumeroCamiseta'
import MineriaEscudos from '@/components/mineria/MineriaEscudos'
import ApuestaFutbolera from '@/components/apuesta/ApuestaFutbolera'
import SopaEscudos from '@/components/sopa/SopaEscudos'
import GameGuard from '@/components/gameguard/GameGuard'
import AdminPanel from '@/components/admin/AdminPanel'
import CircularPopup from '@/components/popup/CircularPopup'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />

      {/* TPK Banners - Ganador & Premio */}
      <TPKBanners />

      {/* Match Predictions - Liga BetPlay */}
      <MatchPredictions />

      {/* Games Section */}
      <section className="relative py-12">
        {/* Section divider */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.5), rgba(249, 115, 22, 0.5), rgba(34, 197, 94, 0.5), transparent)',
        }} />

        {/* Section title */}
        <div className="text-center mb-8 relative">
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.08) 0%, transparent 60%)',
          }} />
          <div className="relative">
            <h2
              className="text-xl md:text-2xl font-black uppercase tracking-wider mb-2"
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
            <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Debes estar registrado e ingresar tu código TPK para participar
            </p>
          </div>
        </div>

        {/* Trivia Futbolera */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Trivia Futbolera" gameIcon="⚽" accentColor="#a855f7">
            <TriviaGame />
          </GameGuard>
        </div>

        {/* Separator between games */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to right, transparent, rgba(234,179,8,0.4))',
          }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#eab308', textShadow: '0 0 8px rgba(234,179,8,0.6)', fontSize: '0.75rem' }}>⚡</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(234,179,8,0.5)' }}>
              Más juegos
            </span>
            <span style={{ color: '#eab308', textShadow: '0 0 8px rgba(234,179,8,0.6)', fontSize: '0.75rem' }}>⚡</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to left, transparent, rgba(234,179,8,0.4))',
          }} />
        </div>

        {/* Trivia Relámpago */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Trivia Relámpago" gameIcon="⚡" accentColor="#f97316">
            <LightningTriviaGame />
          </GameGuard>
        </div>

        {/* Separator before Memory Game */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.4))',
          }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#a855f7', textShadow: '0 0 8px rgba(168, 85, 247, 0.6)', fontSize: '0.75rem' }}>🧠</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(168, 85, 247, 0.5)' }}>
              Nuevo juego
            </span>
            <span style={{ color: '#a855f7', textShadow: '0 0 8px rgba(168, 85, 247, 0.6)', fontSize: '0.75rem' }}>🧠</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to left, transparent, rgba(168, 85, 247, 0.4))',
          }} />
        </div>

        {/* Memoria Futbolera */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Memoria Futbolera" gameIcon="🧠" accentColor="#ec4899">
            <MemoryGame />
          </GameGuard>
        </div>

        {/* Separator before Crossword Game */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.4))',
          }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#a855f7', textShadow: '0 0 8px rgba(168, 85, 247, 0.6)', fontSize: '0.75rem' }}>🎯</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(168, 85, 247, 0.5)' }}>
              Nuevo juego
            </span>
            <span style={{ color: '#a855f7', textShadow: '0 0 8px rgba(168, 85, 247, 0.6)', fontSize: '0.75rem' }}>🎯</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to left, transparent, rgba(168, 85, 247, 0.4))',
          }} />
        </div>

        {/* Crucigrama Futbolero */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Crucigrama Futbolero" gameIcon="🎯" accentColor="#06b6d4">
            <CrosswordGame />
          </GameGuard>
        </div>

        {/* Separator before Slot Machine */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to right, transparent, rgba(251,179,36,0.4))',
          }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#fbbf24', textShadow: '0 0 8px rgba(251,179,36,0.6)', fontSize: '0.75rem' }}>&#x1F3B0;</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(251,179,36,0.5)' }}>
              Nuevo juego
            </span>
            <span style={{ color: '#fbbf24', textShadow: '0 0 8px rgba(251,179,36,0.6)', fontSize: '0.75rem' }}>&#x1F3B0;</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to left, transparent, rgba(251,179,36,0.4))',
          }} />
        </div>

        {/* Tragamonedas Futbolera */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Tragamonedas Futbolera" gameIcon="🎰" accentColor="#fbbf24">
            <SlotMachineGame />
          </GameGuard>
        </div>

        {/* Separator before Loteria */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to right, transparent, rgba(255,0,255,0.4))',
          }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#ff00ff', textShadow: '0 0 8px rgba(255,0,255,0.6)', fontSize: '0.75rem' }}>&#x1F0CF;</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(255,0,255,0.5)' }}>
              Nuevo juego
            </span>
            <span style={{ color: '#ff00ff', textShadow: '0 0 8px rgba(255,0,255,0.6)', fontSize: '0.75rem' }}>&#x1F0CF;</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to left, transparent, rgba(255,0,255,0.4))',
          }} />
        </div>

        {/* Lotería de Equipos */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Lotería de Equipos" gameIcon="🃏" accentColor="#e879f9">
            <LoteriaGame />
          </GameGuard>
        </div>

        {/* Separator before Ruleta */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to right, transparent, rgba(255,200,0,0.4))',
          }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#ffc800', textShadow: '0 0 8px rgba(255,200,0,0.6)', fontSize: '0.75rem' }}>&#x1F3B0;</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(255,200,0,0.5)' }}>
              Nuevo juego
            </span>
            <span style={{ color: '#ffc800', textShadow: '0 0 8px rgba(255,200,0,0.6)', fontSize: '0.75rem' }}>&#x1F3B0;</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to left, transparent, rgba(255,200,0,0.4))',
          }} />
        </div>

        {/* Ruleta de Equipos */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Ruleta de Equipos" gameIcon="🎡" accentColor="#ffc800">
            <RuletaEquipos />
          </GameGuard>
        </div>

        {/* Separator before Circuito */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to right, transparent, rgba(0,255,128,0.4))',
          }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#00ff80', textShadow: '0 0 8px rgba(0,255,128,0.6)', fontSize: '0.75rem' }}>&#x1F3AE;</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(0,255,128,0.5)' }}>
              Nuevo juego
            </span>
            <span style={{ color: '#00ff80', textShadow: '0 0 8px rgba(0,255,128,0.6)', fontSize: '0.75rem' }}>&#x1F3AE;</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to left, transparent, rgba(0,255,128,0.4))',
          }} />
        </div>

        {/* Circuito Futbolero */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Circuito Futbolero" gameIcon="🎮" accentColor="#22c55e">
            <CircuitoFutbolero />
          </GameGuard>
        </div>

        {/* Separator before Parqués */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to right, transparent, rgba(250,204,21,0.4))',
          }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#facc15', textShadow: '0 0 8px rgba(250,204,21,0.6)', fontSize: '0.75rem' }}>&#x1F3B2;</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(250,204,21,0.5)' }}>
              Nuevo juego
            </span>
            <span style={{ color: '#facc15', textShadow: '0 0 8px rgba(250,204,21,0.6)', fontSize: '0.75rem' }}>&#x1F3B2;</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to left, transparent, rgba(250,204,21,0.4))',
          }} />
        </div>

        {/* Parqués Futbolero — Solo con invitación */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Parqués Futbolero" gameIcon="🎲" accentColor="#facc15">
            <ParquesGame />
          </GameGuard>
        </div>

        {/* Separator before Rompecabezas */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to right, transparent, rgba(0,255,200,0.4))',
          }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#00ffc8', textShadow: '0 0 8px rgba(0,255,200,0.6)', fontSize: '0.75rem' }}>&#x1F9E9;</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(0,255,200,0.5)' }}>
              Nuevo juego
            </span>
            <span style={{ color: '#00ffc8', textShadow: '0 0 8px rgba(0,255,200,0.6)', fontSize: '0.75rem' }}>&#x1F9E9;</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{
            background: 'linear-gradient(to left, transparent, rgba(0,255,200,0.4))',
          }} />
        </div>

        {/* Rompecabezas de Escudos */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Rompecabezas de Escudos" gameIcon="🧩" accentColor="#00ffc8">
            <RompecabezasGame />
          </GameGuard>
        </div>

        {/* Separator before Penales */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to right, transparent, rgba(255,68,68,0.4))' }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#ff4444', textShadow: '0 0 8px rgba(255,68,68,0.6)', fontSize: '0.75rem' }}>⚽</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(255,68,68,0.5)' }}>Nuevo juego</span>
            <span style={{ color: '#ff4444', textShadow: '0 0 8px rgba(255,68,68,0.6)', fontSize: '0.75rem' }}>⚽</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to left, transparent, rgba(255,68,68,0.4))' }} />
        </div>

        {/* Penales Futboleros */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Penales Futboleros" gameIcon="⚽" accentColor="#ff4444">
            <PenalesFutboleros />
          </GameGuard>
        </div>

        {/* Separator before Carta Mayor */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to right, transparent, rgba(234,179,8,0.4))' }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#eab308', textShadow: '0 0 8px rgba(234,179,8,0.6)', fontSize: '0.75rem' }}>🃏</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(234,179,8,0.5)' }}>Nuevo juego</span>
            <span style={{ color: '#eab308', textShadow: '0 0 8px rgba(234,179,8,0.6)', fontSize: '0.75rem' }}>🃏</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to left, transparent, rgba(234,179,8,0.4))' }} />
        </div>

        {/* Carta Mayor */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Carta Mayor" gameIcon="🃏" accentColor="#eab308">
            <CartaMayor />
          </GameGuard>
        </div>

        {/* Separator before Diana */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to right, transparent, rgba(239,68,68,0.4))' }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#ef4444', textShadow: '0 0 8px rgba(239,68,68,0.6)', fontSize: '0.75rem' }}>🎯</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(239,68,68,0.5)' }}>Nuevo juego</span>
            <span style={{ color: '#ef4444', textShadow: '0 0 8px rgba(239,68,68,0.6)', fontSize: '0.75rem' }}>🎯</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to left, transparent, rgba(239,68,68,0.4))' }} />
        </div>

        {/* Diana de Escudos */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Diana de Escudos" gameIcon="🎯" accentColor="#ef4444">
            <DianaEscudos />
          </GameGuard>
        </div>

        {/* Separator before Clasificación */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to right, transparent, rgba(6,182,212,0.4))' }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#06b6d4', textShadow: '0 0 8px rgba(6,182,212,0.6)', fontSize: '0.75rem' }}>🏆</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(6,182,212,0.5)' }}>Nuevo juego</span>
            <span style={{ color: '#06b6d4', textShadow: '0 0 8px rgba(6,182,212,0.6)', fontSize: '0.75rem' }}>🏆</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to left, transparent, rgba(6,182,212,0.4))' }} />
        </div>

        {/* Clasificación Histórica */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Clasificación Histórica" gameIcon="🏆" accentColor="#06b6d4">
            <ClasificacionHistorica />
          </GameGuard>
        </div>

        {/* Separator before Número Camiseta */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.4))' }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#8b5cf6', textShadow: '0 0 8px rgba(139,92,246,0.6)', fontSize: '0.75rem' }}>🔢</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(139,92,246,0.5)' }}>Nuevo juego</span>
            <span style={{ color: '#8b5cf6', textShadow: '0 0 8px rgba(139,92,246,0.6)', fontSize: '0.75rem' }}>🔢</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to left, transparent, rgba(139,92,246,0.4))' }} />
        </div>

        {/* Número Camiseta */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Número Camiseta" gameIcon="🔢" accentColor="#8b5cf6">
            <NumeroCamiseta />
          </GameGuard>
        </div>

        {/* Separator before Minería */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to right, transparent, rgba(34,197,94,0.4))' }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#22c55e', textShadow: '0 0 8px rgba(34,197,94,0.6)', fontSize: '0.75rem' }}>💣</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(34,197,94,0.5)' }}>Nuevo juego</span>
            <span style={{ color: '#22c55e', textShadow: '0 0 8px rgba(34,197,94,0.6)', fontSize: '0.75rem' }}>💣</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to left, transparent, rgba(34,197,94,0.4))' }} />
        </div>

        {/* Minería de Escudos */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Minería de Escudos" gameIcon="💣" accentColor="#22c55e">
            <MineriaEscudos />
          </GameGuard>
        </div>

        {/* Separator before Apuesta */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to right, transparent, rgba(249,115,22,0.4))' }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#f97316', textShadow: '0 0 8px rgba(249,115,22,0.6)', fontSize: '0.75rem' }}>📊</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(249,115,22,0.5)' }}>Nuevo juego</span>
            <span style={{ color: '#f97316', textShadow: '0 0 8px rgba(249,115,22,0.6)', fontSize: '0.75rem' }}>📊</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to left, transparent, rgba(249,115,22,0.4))' }} />
        </div>

        {/* Apuesta Futbolera */}
        <div className="relative z-10 mb-10">
          <GameGuard gameName="Apuesta Futbolera" gameIcon="📊" accentColor="#f97316">
            <ApuestaFutbolera />
          </GameGuard>
        </div>

        {/* Separator before Sopa */}
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to right, transparent, rgba(20,184,166,0.4))' }} />
          <div className="flex items-center gap-2">
            <span style={{ color: '#14b8a6', textShadow: '0 0 8px rgba(20,184,166,0.6)', fontSize: '0.75rem' }}>🔤</span>
            <span className="text-[0.6rem] uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(20,184,166,0.5)' }}>Nuevo juego</span>
            <span style={{ color: '#14b8a6', textShadow: '0 0 8px rgba(20,184,166,0.6)', fontSize: '0.75rem' }}>🔤</span>
          </div>
          <div className="h-px flex-1 max-w-32" style={{ background: 'linear-gradient(to left, transparent, rgba(20,184,166,0.4))' }} />
        </div>

        {/* Sopa de Escudos */}
        <div className="relative z-10">
          <GameGuard gameName="Sopa de Escudos" gameIcon="🔤" accentColor="#14b8a6">
            <SopaEscudos />
          </GameGuard>
        </div>
      </section>

      {/* Registration Section */}
      <section className="relative py-12">
        {/* Section divider */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.5), rgba(249, 115, 22, 0.5), rgba(34, 197, 94, 0.5), transparent)',
        }} />

        {/* Background glow */}
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
