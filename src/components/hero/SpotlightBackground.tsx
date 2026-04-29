'use client'

import { useMemo } from 'react'

export default function SpotlightBackground() {
  // Generate random star positions
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 60}%`,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main black background */}
      <div className="absolute inset-0 bg-black" />

      {/* Radial dark vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* ========== LAS VEGAS SPOTLIGHT BEAMS ========== */}

      {/* Spotlight beam 1 - Purple (left side, sweeping right) */}
      <div
        className="spotlight-beam-1 absolute"
        style={{
          bottom: '0%',
          left: '5%',
          width: '350px',
          height: '110%',
          background: 'linear-gradient(0deg, rgba(168, 85, 247, 0.35) 0%, rgba(168, 85, 247, 0.12) 30%, rgba(168, 85, 247, 0.03) 60%, transparent 100%)',
          clipPath: 'polygon(10% 100%, 90% 100%, 70% 0%, 30% 0%)',
          filter: 'blur(8px)',
          transformOrigin: 'bottom center',
        }}
      />

      {/* Spotlight beam 2 - Orange/Gold (right side, sweeping left) */}
      <div
        className="spotlight-beam-2 absolute"
        style={{
          bottom: '0%',
          right: '5%',
          width: '300px',
          height: '105%',
          background: 'linear-gradient(0deg, rgba(249, 115, 22, 0.3) 0%, rgba(249, 115, 22, 0.1) 30%, rgba(249, 115, 22, 0.02) 60%, transparent 100%)',
          clipPath: 'polygon(10% 100%, 90% 100%, 75% 0%, 25% 0%)',
          filter: 'blur(8px)',
          transformOrigin: 'bottom center',
        }}
      />

      {/* Spotlight beam 3 - Green (center-left, sweeping) */}
      <div
        className="spotlight-beam-3 absolute"
        style={{
          bottom: '0%',
          left: '30%',
          width: '280px',
          height: '100%',
          background: 'linear-gradient(0deg, rgba(34, 197, 94, 0.25) 0%, rgba(34, 197, 94, 0.08) 30%, rgba(34, 197, 94, 0.02) 60%, transparent 100%)',
          clipPath: 'polygon(15% 100%, 85% 100%, 65% 0%, 35% 0%)',
          filter: 'blur(6px)',
          transformOrigin: 'bottom center',
        }}
      />

      {/* Spotlight beam 4 - Pink/Magenta (far right) */}
      <div
        className="spotlight-beam-4 absolute"
        style={{
          bottom: '0%',
          right: '20%',
          width: '250px',
          height: '95%',
          background: 'linear-gradient(0deg, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0.08) 30%, rgba(236, 72, 153, 0.02) 60%, transparent 100%)',
          clipPath: 'polygon(10% 100%, 90% 100%, 70% 0%, 30% 0%)',
          filter: 'blur(7px)',
          transformOrigin: 'bottom center',
        }}
      />

      {/* Spotlight beam 5 - Gold/Yellow (center, tall) */}
      <div
        className="spotlight-beam-5 absolute"
        style={{
          bottom: '0%',
          left: '45%',
          width: '200px',
          height: '115%',
          background: 'linear-gradient(0deg, rgba(234, 179, 8, 0.3) 0%, rgba(234, 179, 8, 0.1) 25%, rgba(234, 179, 8, 0.02) 55%, transparent 100%)',
          clipPath: 'polygon(20% 100%, 80% 100%, 60% 0%, 40% 0%)',
          filter: 'blur(6px)',
          transformOrigin: 'bottom center',
        }}
      />

      {/* Spotlight beam 6 - Cyan/Blue (far left) */}
      <div
        className="spotlight-beam-6 absolute"
        style={{
          bottom: '0%',
          left: '15%',
          width: '220px',
          height: '90%',
          background: 'linear-gradient(0deg, rgba(6, 182, 212, 0.2) 0%, rgba(6, 182, 212, 0.06) 30%, rgba(6, 182, 212, 0.01) 60%, transparent 100%)',
          clipPath: 'polygon(15% 100%, 85% 100%, 65% 0%, 35% 0%)',
          filter: 'blur(7px)',
          transformOrigin: 'bottom center',
        }}
      />

      {/* ========== LAS VEGAS LIGHT SOURCES (bottom) ========== */}
      {/* These are the bright points where spotlights originate */}

      {/* Light source 1 - Purple */}
      <div
        className="absolute"
        style={{
          bottom: '-2%',
          left: '8%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, rgba(168, 85, 247, 0.3) 40%, transparent 70%)',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(168, 85, 247, 0.3), 0 0 90px rgba(168, 85, 247, 0.15)',
          animation: 'spotlight-source-pulse 2s ease-in-out infinite',
        }}
      />

      {/* Light source 2 - Orange */}
      <div
        className="absolute"
        style={{
          bottom: '-2%',
          right: '8%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.8) 0%, rgba(249, 115, 22, 0.3) 40%, transparent 70%)',
          boxShadow: '0 0 30px rgba(249, 115, 22, 0.6), 0 0 60px rgba(249, 115, 22, 0.3), 0 0 90px rgba(249, 115, 22, 0.15)',
          animation: 'spotlight-source-pulse 2.5s ease-in-out 0.5s infinite',
        }}
      />

      {/* Light source 3 - Green */}
      <div
        className="absolute"
        style={{
          bottom: '-2%',
          left: '35%',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.7) 0%, rgba(34, 197, 94, 0.25) 40%, transparent 70%)',
          boxShadow: '0 0 25px rgba(34, 197, 94, 0.5), 0 0 50px rgba(34, 197, 94, 0.25)',
          animation: 'spotlight-source-pulse 3s ease-in-out 1s infinite',
        }}
      />

      {/* Light source 4 - Pink */}
      <div
        className="absolute"
        style={{
          bottom: '-2%',
          right: '25%',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.7) 0%, rgba(236, 72, 153, 0.25) 40%, transparent 70%)',
          boxShadow: '0 0 25px rgba(236, 72, 153, 0.5), 0 0 50px rgba(236, 72, 153, 0.25)',
          animation: 'spotlight-source-pulse 2.8s ease-in-out 0.3s infinite',
        }}
      />

      {/* Light source 5 - Gold */}
      <div
        className="absolute"
        style={{
          bottom: '-2%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '55px',
          height: '55px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.8) 0%, rgba(234, 179, 8, 0.3) 40%, transparent 70%)',
          boxShadow: '0 0 30px rgba(234, 179, 8, 0.6), 0 0 60px rgba(234, 179, 8, 0.3), 0 0 90px rgba(234, 179, 8, 0.15)',
          animation: 'spotlight-source-pulse 2.2s ease-in-out 0.7s infinite',
        }}
      />

      {/* Light source 6 - Cyan */}
      <div
        className="absolute"
        style={{
          bottom: '-2%',
          left: '20%',
          width: '45px',
          height: '45px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.6) 0%, rgba(6, 182, 212, 0.2) 40%, transparent 70%)',
          boxShadow: '0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)',
          animation: 'spotlight-source-pulse 3.2s ease-in-out 1.5s infinite',
        }}
      />

      {/* ========== FLOOR GLOW REFLECTIONS ========== */}
      <div
        className="floor-glow-animate absolute"
        style={{
          bottom: '0%',
          left: '0%',
          width: '35%',
          height: '25%',
          background: 'radial-gradient(ellipse at bottom center, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          filter: 'blur(25px)',
        }}
      />
      <div
        className="floor-glow-animate absolute"
        style={{
          bottom: '0%',
          right: '0%',
          width: '35%',
          height: '25%',
          background: 'radial-gradient(ellipse at bottom center, rgba(249, 115, 22, 0.12) 0%, transparent 70%)',
          filter: 'blur(25px)',
          animationDelay: '1.5s',
        }}
      />
      <div
        className="floor-glow-animate absolute"
        style={{
          bottom: '0%',
          left: '35%',
          width: '30%',
          height: '20%',
          background: 'radial-gradient(ellipse at bottom center, rgba(234, 179, 8, 0.1) 0%, transparent 70%)',
          filter: 'blur(20px)',
          animationDelay: '0.8s',
        }}
      />

      {/* ========== VEGAS SIDE PILLAR LIGHTS ========== */}
      {/* Left side vertical lights */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center justify-around py-8 w-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`left-light-${i}`}
            className="w-2 h-2 rounded-full"
            style={{
              background: ['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899', '#06b6d4'][i % 6],
              boxShadow: `0 0 8px ${['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899', '#06b6d4'][i % 6]}, 0 0 16px ${['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899', '#06b6d4'][i % 6]}40`,
              animation: `vegas-lights ${0.5 + Math.random() * 1.5}s ease-in-out ${i * 0.12}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Right side vertical lights */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-around py-8 w-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`right-light-${i}`}
            className="w-2 h-2 rounded-full"
            style={{
              background: ['#ec4899', '#eab308', '#06b6d4', '#a855f7', '#f97316', '#22c55e'][i % 6],
              boxShadow: `0 0 8px ${['#ec4899', '#eab308', '#06b6d4', '#a855f7', '#f97316', '#22c55e'][i % 6]}, 0 0 16px ${['#ec4899', '#eab308', '#06b6d4', '#a855f7', '#f97316', '#22c55e'][i % 6]}40`,
              animation: `vegas-lights ${0.5 + Math.random() * 1.5}s ease-in-out ${i * 0.12}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ========== TOP MARQUEE LIGHTS ========== */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-around px-8 h-4">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={`top-light-${i}`}
            className="w-2 h-2 rounded-full"
            style={{
              background: ['#a855f7', '#f97316', '#eab308', '#22c55e', '#ec4899', '#06b6d4'][i % 6],
              boxShadow: `0 0 6px ${['#a855f7', '#f97316', '#eab308', '#22c55e', '#ec4899', '#06b6d4'][i % 6]}, 0 0 12px ${['#a855f7', '#f97316', '#eab308', '#22c55e', '#ec4899', '#06b6d4'][i % 6]}50`,
              animation: `vegas-lights ${0.4 + Math.random() * 1.2}s ease-in-out ${i * 0.08}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ========== TWINKLING STARS ========== */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      {/* Subtle scanline overlay */}
      <div className="scanline-effect absolute inset-0 opacity-20" />

      {/* Top light source glow - ambient overhead */}
      <div
        className="absolute"
        style={{
          top: '-5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '25%',
          background: 'radial-gradient(ellipse at top center, rgba(255,255,255,0.04) 0%, transparent 70%)',
          filter: 'blur(15px)',
        }}
      />
    </div>
  )
}
