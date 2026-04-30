import HeroSection from '@/components/hero/HeroSection'
import TPKBanners from '@/components/banners/TPKBanners'
import RegistrationSection from '@/components/registration/RegistrationSection'
import TriviaGame from '@/components/trivia/TriviaGame'
import LightningTriviaGame from '@/components/lightning/LightningTriviaGame'
import MemoryGame from '@/components/memory/MemoryGame'
import CrosswordGame from '@/components/crossword/CrosswordGame'
import SlotMachineGame from '@/components/slot/SlotMachineGame'
import AdminPanel from '@/components/admin/AdminPanel'
import CircularPopup from '@/components/popup/CircularPopup'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      
      {/* TPK Banners - Ganador & Premio */}
      <TPKBanners />
      
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
              Pon a prueba tu conocimiento futbolero
            </p>
          </div>
        </div>

        {/* Trivia Futbolera */}
        <div className="relative z-10 mb-10">
          <TriviaGame />
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
          <LightningTriviaGame />
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

        {/* Memoria Futbolera  */}
        <div className="relative z-10 mb-10">
          <MemoryGame />
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
          <CrosswordGame />
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
        <div className="relative z-10">
          <SlotMachineGame />
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
