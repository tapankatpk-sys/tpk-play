import HeroSection from '@/components/hero/HeroSection'
import RegistrationSection from '@/components/registration/RegistrationSection'
import AdminPanel from '@/components/admin/AdminPanel'

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      
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
