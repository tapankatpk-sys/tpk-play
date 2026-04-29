import HeroSection from '@/components/hero/HeroSection'
import RegistrationSection from '@/components/registration/RegistrationSection'
import TriviaGame from '@/components/trivia/TriviaGame'
import AdminPanel from '@/components/admin/AdminPanel'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      
      {/* Trivia Futbolera Section */}
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

        <div className="relative z-10">
          <TriviaGame />
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
    </main>
  )
}
