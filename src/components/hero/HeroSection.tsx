'use client'

import NeonLetter from './NeonLetter'
import SpotlightBackground from './SpotlightBackground'
import Image from 'next/image'

const letters = [
  { char: 'T', color: 'purple' as const },
  { char: 'P', color: 'purple' as const },
  { char: 'K', color: 'purple' as const },
  { char: 'P', color: 'orange' as const },
  { char: 'L', color: 'green' as const },
  { char: 'A', color: 'orange' as const },
  { char: 'Y', color: 'green' as const },
]

export default function HeroSection() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
      {/* Animated spotlight background */}
      <SpotlightBackground />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-8">
        
        {/* Logo top */}
        <div className="mb-6 relative">
          <div
            className="relative"
            style={{
              filter: 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5)) drop-shadow(0 0 20px rgba(249, 115, 22, 0.3))',
            }}
          >
            <Image
              src="/images/logo.png"
              alt="TPK PLAY Logo"
              width={90}
              height={90}
              priority
              className="object-contain"
            />
          </div>
          {/* Logo glow ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: '0 0 30px rgba(168, 85, 247, 0.4), 0 0 60px rgba(249, 115, 22, 0.2)',
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Subtitle above title */}
        <div className="mb-4 text-center">
          <span
            className="uppercase tracking-[0.4em] text-sm md:text-base font-semibold"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
            }}
          >
            Juegos Ludicos Deportivos
          </span>
        </div>

        {/* TPK PLAY Neon Letters */}
        <div className="flex flex-col items-center gap-2">
          {/* TPK letters */}
          <div className="flex items-center">
            {letters.slice(0, 3).map((letter, i) => (
              <NeonLetter
                key={`tpk-${letter.char}-${i}`}
                letter={letter.char}
                color={letter.color}
                index={i}
              />
            ))}
          </div>

          {/* PLAY letters */}
          <div className="flex items-center">
            {letters.slice(3).map((letter, i) => (
              <NeonLetter
                key={`play-${letter.char}-${i}`}
                letter={letter.char}
                color={letter.color}
                index={i + 3}
              />
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-8 text-center">
          <p
            className="text-lg md:text-xl font-medium tracking-wider"
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              textShadow: '0 0 8px rgba(168, 85, 247, 0.3), 0 0 16px rgba(249, 115, 22, 0.2)',
            }}
          >
            Diversión · Competencia · Acción
          </p>
        </div>

        {/* Tiger mascot */}
        <div className="mt-8 relative">
          <div className="tiger-mascot relative">
            <Image
              src="/images/tiger.png"
              alt="TPK PLAY Mascota - Tigre"
              width={200}
              height={200}
              priority
              className="object-contain"
              style={{
                filter: 'brightness(1.1) contrast(1.05)',
              }}
            />
          </div>
          {/* Tiger floor reflection */}
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.3) 0%, rgba(249, 115, 22, 0.1) 40%, transparent 70%)',
              filter: 'blur(10px)',
            }}
          />
        </div>

        {/* CTA area - placeholder for future games */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            className="relative px-8 py-3 rounded-full font-bold text-base md:text-lg tracking-wider uppercase overflow-hidden group cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #f97316 50%, #22c55e 100%)',
              color: '#fff',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.5), 0 0 30px rgba(249, 115, 22, 0.3), 0 0 45px rgba(34, 197, 94, 0.2)',
              transition: 'all 0.3s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.7), 0 0 40px rgba(249, 115, 22, 0.5), 0 0 60px rgba(34, 197, 94, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 0 15px rgba(168, 85, 247, 0.5), 0 0 30px rgba(249, 115, 22, 0.3), 0 0 45px rgba(34, 197, 94, 0.2)'
            }}
          >
            <span className="relative z-10">Próximamente</span>
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />
          </button>
          <span
            className="text-xs tracking-widest uppercase"
            style={{
              color: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            Los juegos están por llegar
          </span>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-20"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, transparent 100%)',
        }}
      />
    </div>
  )
}
