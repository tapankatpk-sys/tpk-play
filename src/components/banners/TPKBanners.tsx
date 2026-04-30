'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface TpkBannerData {
  id: string
  type: string
  title: string
  subtitle: string | null
  imageUrl: string | null
  linkUrl: string | null
  isActive: boolean
}

export default function TPKBanners() {
  const [banners, setBanners] = useState<TpkBannerData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data)) {
            setBanners(data)
          }
        }
      } catch (err) {
        console.error('Error fetching banners:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [])

  if (loading) return null

  const ganador = banners.find(b => b.type === 'ganador' && b.isActive)
  const premio = banners.find(b => b.type === 'premio' && b.isActive)

  if (!ganador && !premio) return null

  return (
    <section className="relative py-10">
      {/* Section divider top */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(to right, transparent, rgba(0,255,255,0.5), rgba(255,0,255,0.5), rgba(0,255,0,0.5), transparent)',
      }} />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(0,255,255,0.06) 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, rgba(255,0,255,0.06) 0%, transparent 50%)',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        {/* Section title */}
        <div className="text-center mb-6">
          <h2
            className="text-lg md:text-xl font-black uppercase tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #00ffff, #ff00ff, #00ff00, #00ffff)',
              backgroundSize: '300% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s linear infinite',
              filter: 'drop-shadow(0 0 10px rgba(0,255,255,0.4))',
            }}
          >
            DESTACADOS TPK
          </h2>
        </div>

        {/* Banners grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GANADOR TPK Banner */}
          {ganador && (
            <BannerCard
              banner={ganador}
              accentColor="#00ffff"
              accentGlow="rgba(0,255,255,"
              glowColor="cyan"
              frameGradient="linear-gradient(135deg, #00ffff, #0088ff, #00ffff, #00ddff)"
              cornerColor1="#00ffff"
              cornerColor2="#0088ff"
            />
          )}

          {/* PREMIO TPK Banner */}
          {premio && (
            <BannerCard
              banner={premio}
              accentColor="#ff00ff"
              accentGlow="rgba(255,0,255,"
              glowColor="magenta"
              frameGradient="linear-gradient(135deg, #ff00ff, #ff4488, #ff00ff, #ff66aa)"
              cornerColor1="#ff00ff"
              cornerColor2="#ff4488"
            />
          )}
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes led-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes led-chase {
          0% { box-shadow: 0 0 5px var(--led-color), 0 0 10px var(--led-color), 0 0 20px var(--led-color); }
          50% { box-shadow: 0 0 2px var(--led-color), 0 0 5px var(--led-color), 0 0 10px var(--led-color); }
          100% { box-shadow: 0 0 5px var(--led-color), 0 0 10px var(--led-color), 0 0 20px var(--led-color); }
        }
        @keyframes border-glow {
          0%, 100% { border-color: var(--led-color); filter: brightness(1); }
          50% { border-color: var(--led-color-dim); filter: brightness(0.7); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.6; }
          94% { opacity: 1; }
          96% { opacity: 0.8; }
          97% { opacity: 1; }
        }
      `}</style>
    </section>
  )
}

function BannerCard({
  banner,
  accentColor,
  accentGlow,
  glowColor,
  frameGradient,
  cornerColor1,
  cornerColor2,
}: {
  banner: TpkBannerData
  accentColor: string
  accentGlow: string
  glowColor: string
  frameGradient: string
  cornerColor1: string
  cornerColor2: string
}) {
  const Wrapper = banner.linkUrl ? 'a' : 'div'
  const wrapperProps = banner.linkUrl
    ? { href: banner.linkUrl, target: '_blank' as const, rel: 'noopener noreferrer' }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className="relative block rounded-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
      style={{
        '--led-color': accentColor,
        '--led-color-dim': `${accentColor}66`,
      } as React.CSSProperties}
    >
      {/* LED border - outer glow frame */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          border: '3px solid ' + accentColor,
          boxShadow: `
            0 0 8px ${accentGlow}0.8),
            0 0 16px ${accentGlow}0.5),
            0 0 30px ${accentGlow}0.3),
            0 0 50px ${accentGlow}0.15),
            inset 0 0 8px ${accentGlow}0.15),
            inset 0 0 16px ${accentGlow}0.08)
          `,
          animation: 'border-glow 2s ease-in-out infinite',
        }}
      />

      {/* LED chase lights - top */}
      <div className="absolute top-0 left-0 right-0 flex justify-around px-2 py-0 pointer-events-none z-20">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`top-${i}`}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 4px ${accentColor}, 0 0 8px ${accentColor}`,
              animation: `led-pulse 1s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* LED chase lights - bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around px-2 py-0 pointer-events-none z-20">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`bottom-${i}`}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 4px ${accentColor}, 0 0 8px ${accentColor}`,
              animation: `led-pulse 1s ease-in-out ${(12 - i) * 0.1}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* LED chase lights - left */}
      <div className="absolute top-0 left-0 bottom-0 flex flex-col justify-around py-2 px-0 pointer-events-none z-20">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`left-${i}`}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 4px ${accentColor}, 0 0 8px ${accentColor}`,
              animation: `led-pulse 1s ease-in-out ${i * 0.12}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* LED chase lights - right */}
      <div className="absolute top-0 right-0 bottom-0 flex flex-col justify-around py-2 px-0 pointer-events-none z-20">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`right-${i}`}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 4px ${accentColor}, 0 0 8px ${accentColor}`,
              animation: `led-pulse 1s ease-in-out ${(8 - i) * 0.12}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Corner LED accents */}
      {[
        { top: -2, left: -2, borderTop: `3px solid ${cornerColor1}`, borderLeft: `3px solid ${cornerColor1}`, borderRadius: '8px 0 0 0' },
        { top: -2, right: -2, borderTop: `3px solid ${cornerColor2}`, borderRight: `3px solid ${cornerColor2}`, borderRadius: '0 8px 0 0' },
        { bottom: -2, left: -2, borderBottom: `3px solid ${cornerColor2}`, borderLeft: `3px solid ${cornerColor2}`, borderRadius: '0 0 0 8px' },
        { bottom: -2, right: -2, borderBottom: `3px solid ${cornerColor1}`, borderRight: `3px solid ${cornerColor1}`, borderRadius: '0 0 8px 0' },
      ].map((corner, i) => (
        <div
          key={`corner-${i}`}
          className="absolute w-4 h-4 md:w-6 md:h-6 pointer-events-none z-30"
          style={{
            ...corner,
            boxShadow: `0 0 10px ${accentGlow}0.8), 0 0 20px ${accentGlow}0.4)`,
          }}
        />
      ))}

      {/* Banner content */}
      <div
        className="relative z-10 p-5 md:p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(10,5,30,0.9) 50%, rgba(0,0,0,0.85) 100%)',
        }}
      >
        {/* Title */}
        <h3
          className="font-black uppercase tracking-wider text-center mb-3"
          style={{
            fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
            lineHeight: '1.1',
            color: accentColor,
            textShadow: `
              0 0 10px ${accentGlow}0.9),
              0 0 20px ${accentGlow}0.6),
              0 0 40px ${accentGlow}0.4),
              0 0 60px ${accentGlow}0.2)
            `,
            animation: 'flicker 4s ease-in-out infinite',
          }}
        >
          {banner.title}
        </h3>

        {/* Subtitle */}
        {banner.subtitle && (
          <p
            className="text-center text-xs md:text-sm uppercase tracking-widest mb-4 font-bold"
            style={{
              color: `${accentColor}cc`,
              textShadow: `0 0 8px ${accentGlow}0.5)`,
            }}
          >
            {banner.subtitle}
          </p>
        )}

        {/* Image */}
        <div className="flex justify-center">
          <div
            className="relative w-40 h-40 md:w-52 md:h-52 rounded-lg overflow-hidden"
            style={{
              border: `2px solid ${accentColor}50`,
              boxShadow: `0 0 15px ${accentGlow}0.3), inset 0 0 15px ${accentGlow}0.1)`,
            }}
          >
            {banner.imageUrl ? (
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover"
                style={{ filter: 'brightness(1.05) contrast(1.05)' }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${accentGlow}0.1) 0%, rgba(0,0,0,0.8) 50%, ${accentGlow}0.1) 100%)`,
                }}
              >
                <span
                  className="text-4xl"
                  style={{
                    filter: `drop-shadow(0 0 10px ${accentColor})`,
                  }}
                >
                  {banner.type === 'ganador' ? '🏆' : '🎁'}
                </span>
              </div>
            )}

            {/* Image overlay glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, transparent 60%, ${accentGlow}0.15) 100%)`,
              }}
            />
          </div>
        </div>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <div
            className="h-px w-10 md:w-16"
            style={{
              background: `linear-gradient(to right, transparent, ${accentColor})`,
              boxShadow: `0 0 4px ${accentGlow}0.4)`,
            }}
          />
          <div
            className="w-2 h-2 rotate-45"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 6px ${accentColor}, 0 0 12px ${accentGlow}0.5)`,
            }}
          />
          <div
            className="h-px w-10 md:w-16"
            style={{
              background: `linear-gradient(to left, transparent, ${accentColor})`,
              boxShadow: `0 0 4px ${accentGlow}0.4)`,
            }}
          />
        </div>
      </div>
    </Wrapper>
  )
}
