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

      {/* ========== LAS VEGAS DRAMATIC SPOTLIGHT BEAMS ========== */}
      {/* These are the tall, dramatic cone beams like you see on the Vegas Strip */}

      {/* BEAM 1 - Purple (far left, sweeping right dramatically) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '2%',
          width: '500px',
          height: '130%',
          background: 'linear-gradient(0deg, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0.2) 20%, rgba(168, 85, 247, 0.06) 50%, rgba(168, 85, 247, 0.01) 80%, transparent 100%)',
          clipPath: 'polygon(15% 100%, 85% 100%, 75% 0%, 25% 0%)',
          filter: 'blur(6px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-1 8s ease-in-out infinite',
        }}
      />

      {/* BEAM 2 - Orange/Gold (far right, sweeping left) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          right: '2%',
          width: '450px',
          height: '125%',
          background: 'linear-gradient(0deg, rgba(249, 115, 22, 0.45) 0%, rgba(249, 115, 22, 0.18) 20%, rgba(249, 115, 22, 0.05) 50%, rgba(249, 115, 22, 0.01) 80%, transparent 100%)',
          clipPath: 'polygon(15% 100%, 85% 100%, 80% 0%, 20% 0%)',
          filter: 'blur(6px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-2 9s ease-in-out infinite',
        }}
      />

      {/* BEAM 3 - Gold/Yellow (center, tall and dramatic) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '42%',
          width: '300px',
          height: '140%',
          background: 'linear-gradient(0deg, rgba(234, 179, 8, 0.45) 0%, rgba(234, 179, 8, 0.18) 15%, rgba(234, 179, 8, 0.05) 45%, rgba(234, 179, 8, 0.01) 75%, transparent 100%)',
          clipPath: 'polygon(20% 100%, 80% 100%, 65% 0%, 35% 0%)',
          filter: 'blur(5px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-3 7s ease-in-out infinite',
        }}
      />

      {/* BEAM 4 - Pink/Magenta (left-center) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '20%',
          width: '380px',
          height: '120%',
          background: 'linear-gradient(0deg, rgba(236, 72, 153, 0.35) 0%, rgba(236, 72, 153, 0.12) 20%, rgba(236, 72, 153, 0.03) 55%, transparent 100%)',
          clipPath: 'polygon(15% 100%, 85% 100%, 70% 0%, 30% 0%)',
          filter: 'blur(7px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-4 10s ease-in-out infinite',
        }}
      />

      {/* BEAM 5 - Green (right-center) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          right: '22%',
          width: '350px',
          height: '115%',
          background: 'linear-gradient(0deg, rgba(34, 197, 94, 0.35) 0%, rgba(34, 197, 94, 0.12) 20%, rgba(34, 197, 94, 0.03) 55%, transparent 100%)',
          clipPath: 'polygon(15% 100%, 85% 100%, 72% 0%, 28% 0%)',
          filter: 'blur(7px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-5 8.5s ease-in-out infinite',
        }}
      />

      {/* BEAM 6 - Cyan (far left, subtle) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '10%',
          width: '280px',
          height: '105%',
          background: 'linear-gradient(0deg, rgba(6, 182, 212, 0.3) 0%, rgba(6, 182, 212, 0.1) 25%, rgba(6, 182, 212, 0.02) 55%, transparent 100%)',
          clipPath: 'polygon(15% 100%, 85% 100%, 68% 0%, 32% 0%)',
          filter: 'blur(6px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-6 11s ease-in-out infinite',
        }}
      />

      {/* BEAM 7 - Deep Blue (far right, subtle) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          right: '10%',
          width: '260px',
          height: '110%',
          background: 'linear-gradient(0deg, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 25%, rgba(59, 130, 246, 0.02) 55%, transparent 100%)',
          clipPath: 'polygon(15% 100%, 85% 100%, 72% 0%, 28% 0%)',
          filter: 'blur(7px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-7 9.5s ease-in-out infinite',
        }}
      />

      {/* ========== LAS VEGAS REFLECTOR LIGHT SOURCES ========== */}
      {/* These are the bright origin points with lens-flare style glow */}

      {/* Reflector 1 - Purple (far left) */}
      <div className="absolute" style={{ bottom: '-3%', left: '5%' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(168, 85, 247, 0.8) 15%, rgba(168, 85, 247, 0.3) 40%, transparent 70%)',
          boxShadow: '0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(168, 85, 247, 0.4), 0 0 120px rgba(168, 85, 247, 0.2)',
          animation: 'reflector-source-pulse 2s ease-in-out infinite',
        }} />
        {/* Lens flare ring */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.2), inset 0 0 20px rgba(168, 85, 247, 0.1)',
          animation: 'reflector-ring-pulse 2s ease-in-out infinite',
        }} />
      </div>

      {/* Reflector 2 - Orange (far right) */}
      <div className="absolute" style={{ bottom: '-3%', right: '5%' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(249, 115, 22, 0.8) 15%, rgba(249, 115, 22, 0.3) 40%, transparent 70%)',
          boxShadow: '0 0 40px rgba(249, 115, 22, 0.8), 0 0 80px rgba(249, 115, 22, 0.4), 0 0 120px rgba(249, 115, 22, 0.2)',
          animation: 'reflector-source-pulse 2.5s ease-in-out 0.5s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '1px solid rgba(249, 115, 22, 0.3)',
          boxShadow: '0 0 20px rgba(249, 115, 22, 0.2), inset 0 0 20px rgba(249, 115, 22, 0.1)',
          animation: 'reflector-ring-pulse 2.5s ease-in-out 0.5s infinite',
        }} />
      </div>

      {/* Reflector 3 - Gold (center) */}
      <div className="absolute" style={{ bottom: '-3%', left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(234, 179, 8, 0.85) 12%, rgba(234, 179, 8, 0.3) 40%, transparent 70%)',
          boxShadow: '0 0 50px rgba(234, 179, 8, 0.8), 0 0 100px rgba(234, 179, 8, 0.4), 0 0 150px rgba(234, 179, 8, 0.2)',
          animation: 'reflector-source-pulse 2.2s ease-in-out 0.3s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          border: '1px solid rgba(234, 179, 8, 0.35)',
          boxShadow: '0 0 25px rgba(234, 179, 8, 0.25), inset 0 0 25px rgba(234, 179, 8, 0.1)',
          animation: 'reflector-ring-pulse 2.2s ease-in-out 0.3s infinite',
        }} />
      </div>

      {/* Reflector 4 - Pink (left-center) */}
      <div className="absolute" style={{ bottom: '-3%', left: '25%' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(236, 72, 153, 0.75) 15%, rgba(236, 72, 153, 0.25) 40%, transparent 70%)',
          boxShadow: '0 0 35px rgba(236, 72, 153, 0.7), 0 0 70px rgba(236, 72, 153, 0.35)',
          animation: 'reflector-source-pulse 2.8s ease-in-out 0.8s infinite',
        }} />
      </div>

      {/* Reflector 5 - Green (right-center) */}
      <div className="absolute" style={{ bottom: '-3%', right: '25%' }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(34, 197, 94, 0.75) 15%, rgba(34, 197, 94, 0.25) 40%, transparent 70%)',
          boxShadow: '0 0 35px rgba(34, 197, 94, 0.7), 0 0 70px rgba(34, 197, 94, 0.35)',
          animation: 'reflector-source-pulse 3s ease-in-out 1.2s infinite',
        }} />
      </div>

      {/* Reflector 6 - Cyan (left) */}
      <div className="absolute" style={{ bottom: '-3%', left: '14%' }}>
        <div style={{
          width: '55px',
          height: '55px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(6, 182, 212, 0.7) 15%, rgba(6, 182, 212, 0.2) 40%, transparent 70%)',
          boxShadow: '0 0 25px rgba(6, 182, 212, 0.6), 0 0 50px rgba(6, 182, 212, 0.3)',
          animation: 'reflector-source-pulse 3.5s ease-in-out 1.5s infinite',
        }} />
      </div>

      {/* Reflector 7 - Blue (right) */}
      <div className="absolute" style={{ bottom: '-3%', right: '14%' }}>
        <div style={{
          width: '55px',
          height: '55px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(59, 130, 246, 0.7) 15%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
          boxShadow: '0 0 25px rgba(59, 130, 246, 0.6), 0 0 50px rgba(59, 130, 246, 0.3)',
          animation: 'reflector-source-pulse 3.2s ease-in-out 0.6s infinite',
        }} />
      </div>

      {/* ========== FLOOR GLOW REFLECTIONS ========== */}
      <div
        className="floor-glow-animate absolute"
        style={{
          bottom: '0%',
          left: '0%',
          width: '35%',
          height: '25%',
          background: 'radial-gradient(ellipse at bottom center, rgba(168, 85, 247, 0.18) 0%, transparent 70%)',
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
          background: 'radial-gradient(ellipse at bottom center, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
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
          background: 'radial-gradient(ellipse at bottom center, rgba(234, 179, 8, 0.12) 0%, transparent 70%)',
          filter: 'blur(20px)',
          animationDelay: '0.8s',
        }}
      />

      {/* ========== VEGAS SIDE PILLAR LIGHTS ========== */}
      {/* Left side vertical lights */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center justify-around py-6 w-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={`left-light-${i}`}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: ['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899', '#06b6d4'][i % 6],
              boxShadow: `0 0 8px ${['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899', '#06b6d4'][i % 6]}, 0 0 18px ${['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899', '#06b6d4'][i % 6]}50`,
              animation: `vegas-lights ${0.4 + Math.random() * 1.2}s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Right side vertical lights */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-around py-6 w-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={`right-light-${i}`}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: ['#ec4899', '#eab308', '#06b6d4', '#a855f7', '#f97316', '#22c55e'][i % 6],
              boxShadow: `0 0 8px ${['#ec4899', '#eab308', '#06b6d4', '#a855f7', '#f97316', '#22c55e'][i % 6]}, 0 0 18px ${['#ec4899', '#eab308', '#06b6d4', '#a855f7', '#f97316', '#22c55e'][i % 6]}50`,
              animation: `vegas-lights ${0.4 + Math.random() * 1.2}s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ========== TOP MARQUEE LIGHTS ========== */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-around px-6 h-4">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={`top-light-${i}`}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: ['#a855f7', '#f97316', '#eab308', '#22c55e', '#ec4899', '#06b6d4'][i % 6],
              boxShadow: `0 0 8px ${['#a855f7', '#f97316', '#eab308', '#22c55e', '#ec4899', '#06b6d4'][i % 6]}, 0 0 16px ${['#a855f7', '#f97316', '#eab308', '#22c55e', '#ec4899', '#06b6d4'][i % 6]}50`,
              animation: `vegas-lights ${0.3 + Math.random() * 1}s ease-in-out ${i * 0.06}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ========== BOTTOM MARQUEE LIGHTS ========== */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-6 h-4 z-30">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={`bottom-light-${i}`}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: ['#eab308', '#a855f7', '#ec4899', '#22c55e', '#f97316', '#06b6d4'][i % 6],
              boxShadow: `0 0 8px ${['#eab308', '#a855f7', '#ec4899', '#22c55e', '#f97316', '#06b6d4'][i % 6]}, 0 0 16px ${['#eab308', '#a855f7', '#ec4899', '#22c55e', '#f97316', '#06b6d4'][i % 6]}50`,
              animation: `vegas-lights ${0.3 + Math.random() * 1}s ease-in-out ${i * 0.06}s infinite alternate`,
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

      {/* Top ambient glow from overhead lights */}
      <div
        className="absolute"
        style={{
          top: '-5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '30%',
          background: 'radial-gradient(ellipse at top center, rgba(255,255,255,0.06) 0%, transparent 70%)',
          filter: 'blur(15px)',
        }}
      />

      {/* ========== ATMOSPHERIC HAZE ========== */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '0%',
          right: '0%',
          height: '40%',
          background: 'linear-gradient(to top, rgba(168, 85, 247, 0.03) 0%, transparent 100%)',
          filter: 'blur(30px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '30%',
          right: '0%',
          height: '35%',
          background: 'linear-gradient(to top, rgba(249, 115, 22, 0.025) 0%, transparent 100%)',
          filter: 'blur(25px)',
        }}
      />
    </div>
  )
}
