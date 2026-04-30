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
        <div className="mb-4 text-center relative">
          {/* Glow backdrop */}
          <div
            className="absolute inset-0 -top-4 -bottom-4 left-1/2 -translate-x-1/2 w-[120%]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.15) 0%, rgba(249, 115, 22, 0.08) 30%, transparent 70%)',
              filter: 'blur(20px)',
            }}
          />
          <div className="relative">
            {/* Linea decorativa superior */}
            <div className="flex items-center justify-center gap-3 mb-2">
              <div
                className="h-[1px] w-8 md:w-16"
                style={{
                  background: 'linear-gradient(to right, transparent, #a855f7, transparent)',
                  boxShadow: '0 0 6px #a855f7',
                }}
              />
              <span
                style={{
                  color: '#f97316',
                  fontSize: '0.6rem',
                  textShadow: '0 0 8px rgba(249, 115, 22, 0.8)',
                }}
              >
                ★
              </span>
              <div
                className="h-[1px] w-8 md:w-16"
                style={{
                  background: 'linear-gradient(to right, transparent, #22c55e, transparent)',
                  boxShadow: '0 0 6px #22c55e',
                }}
              />
            </div>

            {/* Texto principal del subtítulo */}
            <h2
              className="font-black uppercase tracking-[0.15em] md:tracking-[0.25em]"
              style={{
                fontSize: 'clamp(0.75rem, 2.5vw, 1.35rem)',
                lineHeight: '1.6',
                background: 'linear-gradient(90deg, #d8b4fe 0%, #a855f7 15%, #f97316 35%, #fbbf24 50%, #22c55e 65%, #4ade80 80%, #d8b4fe 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 4s linear infinite',
                filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.4)) drop-shadow(0 0 16px rgba(249, 115, 22, 0.3))',
              }}
            >
              EL LUGAR PARA
            </h2>
            <h2
              className="font-black uppercase tracking-[0.15em] md:tracking-[0.25em]"
              style={{
                fontSize: 'clamp(0.85rem, 3vw, 1.6rem)',
                lineHeight: '1.4',
                background: 'linear-gradient(90deg, #f97316 0%, #fbbf24 20%, #a855f7 40%, #ec4899 55%, #22c55e 75%, #f97316 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 3s linear infinite reverse',
                filter: 'drop-shadow(0 0 10px rgba(249, 115, 22, 0.5)) drop-shadow(0 0 20px rgba(168, 85, 247, 0.3)) drop-shadow(0 0 30px rgba(34, 197, 94, 0.2))',
              }}
            >
              HINCHAS Y FANÁTICOS
            </h2>

            {/* Línea decorativa inferior */}
            <div className="flex items-center justify-center gap-3 mt-2">
              <div
                className="h-[1px] w-8 md:w-16"
                style={{
                  background: 'linear-gradient(to right, transparent, #f97316, transparent)',
                  boxShadow: '0 0 6px #f97316',
                }}
              />
              <span
                style={{
                  color: '#a855f7',
                  fontSize: '0.6rem',
                  textShadow: '0 0 8px rgba(168, 85, 247, 0.8)',
                }}
              >
                ★
              </span>
              <div
                className="h-[1px] w-8 md:w-16"
                style={{
                  background: 'linear-gradient(to right, transparent, #a855f7, transparent)',
                  boxShadow: '0 0 6px #a855f7',
                }}
              />
            </div>
          </div>
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

        {/* TAPANKA TPK Brand Frame */}
        <div className="mt-10 flex flex-col items-center gap-4">
          {/* Neon frame container */}
          <div
            className="relative px-8 py-5 md:px-12 md:py-6 rounded-xl"
            style={{
              border: '2px solid rgba(168, 85, 247, 0.6)',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.4), 0 0 30px rgba(249, 115, 22, 0.25), 0 0 50px rgba(168, 85, 247, 0.15), inset 0 0 15px rgba(168, 85, 247, 0.1), inset 0 0 30px rgba(249, 115, 22, 0.05)',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(0, 0, 0, 0.6) 30%, rgba(249, 115, 22, 0.08) 100%)',
            }}
          >
            {/* Corner accents - top left */}
            <div
              className="absolute top-[-1px] left-[-1px] w-5 h-5 md:w-7 md:h-7"
              style={{
                borderTop: '3px solid #f97316',
                borderLeft: '3px solid #f97316',
                borderTopLeftRadius: '12px',
                boxShadow: '0 0 8px rgba(249, 115, 22, 0.8), 0 0 15px rgba(249, 115, 22, 0.4)',
              }}
            />
            {/* Corner accents - top right */}
            <div
              className="absolute top-[-1px] right-[-1px] w-5 h-5 md:w-7 md:h-7"
              style={{
                borderTop: '3px solid #a855f7',
                borderRight: '3px solid #a855f7',
                borderTopRightRadius: '12px',
                boxShadow: '0 0 8px rgba(168, 85, 247, 0.8), 0 0 15px rgba(168, 85, 247, 0.4)',
              }}
            />
            {/* Corner accents - bottom left */}
            <div
              className="absolute bottom-[-1px] left-[-1px] w-5 h-5 md:w-7 md:h-7"
              style={{
                borderBottom: '3px solid #a855f7',
                borderLeft: '3px solid #a855f7',
                borderBottomLeftRadius: '12px',
                boxShadow: '0 0 8px rgba(168, 85, 247, 0.8), 0 0 15px rgba(168, 85, 247, 0.4)',
              }}
            />
            {/* Corner accents - bottom right */}
            <div
              className="absolute bottom-[-1px] right-[-1px] w-5 h-5 md:w-7 md:h-7"
              style={{
                borderBottom: '3px solid #f97316',
                borderRight: '3px solid #f97316',
                borderBottomRightRadius: '12px',
                boxShadow: '0 0 8px rgba(249, 115, 22, 0.8), 0 0 15px rgba(249, 115, 22, 0.4)',
              }}
            />

            {/* Title: TAPANKA TPK */}
            <h1
              className="font-black uppercase tracking-[0.12em] md:tracking-[0.2em] text-center"
              style={{
                fontSize: 'clamp(1.8rem, 6vw, 3.5rem)',
                lineHeight: '1.2',
                color: '#fff',
                textShadow: '0 0 10px rgba(168, 85, 247, 0.9), 0 0 20px rgba(168, 85, 247, 0.6), 0 0 40px rgba(249, 115, 22, 0.4), 0 0 60px rgba(168, 85, 247, 0.3), 0 0 80px rgba(249, 115, 22, 0.2)',
                filter: 'brightness(1.1)',
              }}
            >
              TAPANKA TPK
            </h1>

            {/* Decorative divider inside frame */}
            <div className="flex items-center justify-center gap-2 my-2 md:my-3">
              <div
                className="h-[1px] w-8 md:w-14"
                style={{
                  background: 'linear-gradient(to right, transparent, #f97316, transparent)',
                  boxShadow: '0 0 6px rgba(249, 115, 22, 0.6)',
                }}
              />
              <span
                style={{
                  color: '#fbbf24',
                  fontSize: '0.5rem',
                  textShadow: '0 0 8px rgba(251, 191, 36, 0.9), 0 0 15px rgba(251, 191, 36, 0.5)',
                }}
              >
                ◆
              </span>
              <div
                className="h-[1px] w-8 md:w-14"
                style={{
                  background: 'linear-gradient(to right, transparent, #a855f7, transparent)',
                  boxShadow: '0 0 6px rgba(168, 85, 247, 0.6)',
                }}
              />
            </div>

            {/* Subtitle */}
            <p
              className="font-bold uppercase tracking-[0.08em] md:tracking-[0.14em] text-center"
              style={{
                fontSize: 'clamp(0.55rem, 2vw, 0.95rem)',
                lineHeight: '1.6',
                color: '#fbbf24',
                textShadow: '0 0 8px rgba(251, 191, 36, 0.8), 0 0 16px rgba(251, 191, 36, 0.5), 0 0 30px rgba(251, 191, 36, 0.3)',
                filter: 'brightness(1.05)',
              }}
            >
              ZAPATILLAS, PRENDAS Y COMPLEMENTOS
              <br />
              DEPORTIVOS PERSONALIZADOS
            </p>
          </div>
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
