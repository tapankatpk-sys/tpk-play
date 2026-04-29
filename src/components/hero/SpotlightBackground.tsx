'use client'

import { useMemo } from 'react'

export default function SpotlightBackground() {
  // Generate random star positions
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
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
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* Spotlight beam 1 - Purple */}
      <div
        className="spotlight-beam-1 absolute"
        style={{
          top: '-10%',
          left: '15%',
          width: '300px',
          height: '140%',
          background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.25) 0%, rgba(168, 85, 247, 0.05) 40%, transparent 100%)',
          clipPath: 'polygon(40% 0%, 60% 0%, 90% 100%, 10% 100%)',
          filter: 'blur(20px)',
          transformOrigin: 'top center',
        }}
      />

      {/* Spotlight beam 2 - Orange */}
      <div
        className="spotlight-beam-2 absolute"
        style={{
          top: '-10%',
          right: '20%',
          width: '250px',
          height: '130%',
          background: 'linear-gradient(180deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0.04) 40%, transparent 100%)',
          clipPath: 'polygon(35% 0%, 65% 0%, 85% 100%, 15% 100%)',
          filter: 'blur(18px)',
          transformOrigin: 'top center',
        }}
      />

      {/* Spotlight beam 3 - Green */}
      <div
        className="spotlight-beam-3 absolute"
        style={{
          top: '-10%',
          left: '55%',
          width: '200px',
          height: '120%',
          background: 'linear-gradient(180deg, rgba(34, 197, 94, 0.18) 0%, rgba(34, 197, 94, 0.03) 40%, transparent 100%)',
          clipPath: 'polygon(30% 0%, 70% 0%, 80% 100%, 20% 100%)',
          filter: 'blur(15px)',
          transformOrigin: 'top center',
        }}
      />

      {/* Ambient glow spots on the "floor" */}
      <div
        className="floor-glow-animate absolute"
        style={{
          bottom: '0%',
          left: '5%',
          width: '30%',
          height: '40%',
          background: 'radial-gradient(ellipse at bottom center, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />
      <div
        className="floor-glow-animate absolute"
        style={{
          bottom: '0%',
          right: '10%',
          width: '35%',
          height: '35%',
          background: 'radial-gradient(ellipse at bottom center, rgba(249, 115, 22, 0.1) 0%, transparent 70%)',
          filter: 'blur(30px)',
          animationDelay: '1.5s',
        }}
      />
      <div
        className="floor-glow-animate absolute"
        style={{
          bottom: '0%',
          left: '40%',
          width: '25%',
          height: '30%',
          background: 'radial-gradient(ellipse at bottom center, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
          filter: 'blur(25px)',
          animationDelay: '0.8s',
        }}
      />

      {/* Twinkling stars/particles */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      {/* Subtle scanline overlay */}
      <div className="scanline-effect absolute inset-0 opacity-30" />

      {/* Top light source glow */}
      <div
        className="absolute"
        style={{
          top: '-5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '30%',
          background: 'radial-gradient(ellipse at top center, rgba(255,255,255,0.05) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
    </div>
  )
}
