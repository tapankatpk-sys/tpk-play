'use client'

import { useMemo } from 'react'

export default function SpotlightBackground() {
  // Generate random star positions
  const stars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 50}%`,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    }))
  }, [])

  // Generate floating light particles
  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      bottom: `${Math.random() * 30}%`,
      size: Math.random() * 4 + 1,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      color: ['#a855f7', '#f97316', '#eab308', '#ec4899', '#22c55e', '#06b6d4'][Math.floor(Math.random() * 6)],
    }))
  }, [])

  const vegasColors = ['#a855f7', '#f97316', '#22c55e', '#eab308', '#ec4899', '#06b6d4']

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Main black background */}
      <div className="absolute inset-0 bg-black" />

      {/* Radial dark vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      {/* ========== LAS VEGAS MEGA SEARCHLIGHT BEAMS ========== */}
      {/* These are the iconic sweeping searchlights you see on the Vegas Strip skyline */}
      {/* They rotate continuously from their base point, creating dramatic cones of light */}

      {/* MEGA BEAM 1 - Purple (far left, 360° rotation searchlight) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '0%',
          width: '110vmax',
          height: '55vmax',
          background: `conic-gradient(
            from 0deg at 0% 100%,
            transparent 0deg,
            transparent 20deg,
            rgba(168, 85, 247, 0.35) 25deg,
            rgba(168, 85, 247, 0.15) 30deg,
            transparent 35deg,
            transparent 360deg
          )`,
          filter: 'blur(4px)',
          animation: 'vegas-searchlight-1 12s linear infinite',
          opacity: 0.9,
        }}
      />

      {/* MEGA BEAM 2 - Orange/Gold (far right, 360° rotation searchlight) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          right: '0%',
          width: '110vmax',
          height: '55vmax',
          background: `conic-gradient(
            from 0deg at 100% 100%,
            transparent 0deg,
            transparent 20deg,
            rgba(249, 115, 22, 0.35) 25deg,
            rgba(249, 115, 22, 0.15) 30deg,
            transparent 35deg,
            transparent 360deg
          )`,
          filter: 'blur(4px)',
          animation: 'vegas-searchlight-2 14s linear infinite',
          opacity: 0.9,
        }}
      />

      {/* MEGA BEAM 3 - White/Gold (center-left, sweeping searchlight) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '25%',
          width: '90vmax',
          height: '50vmax',
          background: `conic-gradient(
            from 0deg at 15% 100%,
            transparent 0deg,
            transparent 15deg,
            rgba(234, 179, 8, 0.25) 18deg,
            rgba(255, 255, 255, 0.08) 22deg,
            transparent 26deg,
            transparent 360deg
          )`,
          filter: 'blur(3px)',
          animation: 'vegas-searchlight-3 10s linear infinite',
          opacity: 0.85,
        }}
      />

      {/* MEGA BEAM 4 - Pink (center-right, sweeping searchlight) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          right: '25%',
          width: '85vmax',
          height: '48vmax',
          background: `conic-gradient(
            from 0deg at 85% 100%,
            transparent 0deg,
            transparent 15deg,
            rgba(236, 72, 153, 0.25) 18deg,
            rgba(236, 72, 153, 0.1) 22deg,
            transparent 26deg,
            transparent 360deg
          )`,
          filter: 'blur(3px)',
          animation: 'vegas-searchlight-4 11s linear infinite reverse',
          opacity: 0.8,
        }}
      />

      {/* MEGA BEAM 5 - Green (center, sweeping upward) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '45%',
          width: '70vmax',
          height: '45vmax',
          background: `conic-gradient(
            from 0deg at 50% 100%,
            transparent 0deg,
            transparent 20deg,
            rgba(34, 197, 94, 0.2) 23deg,
            rgba(34, 197, 94, 0.08) 27deg,
            transparent 31deg,
            transparent 360deg
          )`,
          filter: 'blur(3px)',
          animation: 'vegas-searchlight-5 9s linear infinite',
          opacity: 0.75,
        }}
      />

      {/* MEGA BEAM 6 - Cyan (left, subtle sweep) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '12%',
          width: '75vmax',
          height: '42vmax',
          background: `conic-gradient(
            from 0deg at 20% 100%,
            transparent 0deg,
            transparent 22deg,
            rgba(6, 182, 212, 0.2) 25deg,
            rgba(6, 182, 212, 0.08) 29deg,
            transparent 33deg,
            transparent 360deg
          )`,
          filter: 'blur(4px)',
          animation: 'vegas-searchlight-6 15s linear infinite reverse',
          opacity: 0.7,
        }}
      />

      {/* ========== STATIC DRAMATIC CONE BEAMS ========== */}
      {/* These are the tall, dramatic fixed cone beams that add depth behind the searchlights */}

      {/* CONE 1 - Deep Purple (far left, tilted) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '-5%',
          width: '600px',
          height: '140%',
          background: 'linear-gradient(0deg, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.15) 20%, rgba(168, 85, 247, 0.04) 50%, transparent 80%)',
          clipPath: 'polygon(20% 100%, 80% 100%, 70% 0%, 30% 0%)',
          filter: 'blur(8px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-1 8s ease-in-out infinite',
        }}
      />

      {/* CONE 2 - Orange (far right, tilted) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          right: '-5%',
          width: '550px',
          height: '135%',
          background: 'linear-gradient(0deg, rgba(249, 115, 22, 0.35) 0%, rgba(249, 115, 22, 0.12) 20%, rgba(249, 115, 22, 0.03) 50%, transparent 80%)',
          clipPath: 'polygon(20% 100%, 80% 100%, 75% 0%, 25% 0%)',
          filter: 'blur(8px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-2 9s ease-in-out infinite',
        }}
      />

      {/* CONE 3 - Gold (center, tall beacon) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '40%',
          width: '250px',
          height: '160%',
          background: 'linear-gradient(0deg, rgba(234, 179, 8, 0.4) 0%, rgba(234, 179, 8, 0.15) 15%, rgba(234, 179, 8, 0.04) 40%, transparent 75%)',
          clipPath: 'polygon(25% 100%, 75% 100%, 60% 0%, 40% 0%)',
          filter: 'blur(5px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-3 7s ease-in-out infinite',
        }}
      />

      {/* CONE 4 - Pink (left-center) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '18%',
          width: '400px',
          height: '125%',
          background: 'linear-gradient(0deg, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0.1) 20%, rgba(236, 72, 153, 0.02) 55%, transparent 80%)',
          clipPath: 'polygon(18% 100%, 82% 100%, 72% 0%, 28% 0%)',
          filter: 'blur(7px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-4 10s ease-in-out infinite',
        }}
      />

      {/* CONE 5 - Green (right-center) */}
      <div
        className="absolute"
        style={{
          bottom: '0%',
          right: '18%',
          width: '380px',
          height: '120%',
          background: 'linear-gradient(0deg, rgba(34, 197, 94, 0.3) 0%, rgba(34, 197, 94, 0.1) 20%, rgba(34, 197, 94, 0.02) 55%, transparent 80%)',
          clipPath: 'polygon(18% 100%, 82% 100%, 74% 0%, 26% 0%)',
          filter: 'blur(7px)',
          transformOrigin: 'bottom center',
          animation: 'vegas-reflector-5 8.5s ease-in-out infinite',
        }}
      />

      {/* ========== LUXOR-STYLE SKY BEAM ========== */}
      {/* The iconic vertical beam of light shooting into the sky, like the Luxor pyramid */}
      <div
        className="absolute"
        style={{
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120%',
          background: 'linear-gradient(0deg, rgba(255,255,255,0.12) 0%, rgba(234,179,8,0.06) 30%, rgba(255,255,255,0.02) 60%, transparent 85%)',
          clipPath: 'polygon(35% 100%, 65% 100%, 55% 0%, 45% 0%)',
          filter: 'blur(12px)',
          animation: 'luxor-beam-pulse 4s ease-in-out infinite',
        }}
      />
      {/* Luxor beam core (brighter narrow center) */}
      <div
        className="absolute"
        style={{
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '120%',
          background: 'linear-gradient(0deg, rgba(255,255,255,0.15) 0%, rgba(234,179,8,0.08) 30%, rgba(255,255,255,0.02) 60%, transparent 80%)',
          clipPath: 'polygon(30% 100%, 70% 100%, 58% 0%, 42% 0%)',
          filter: 'blur(6px)',
          animation: 'luxor-beam-pulse 4s ease-in-out 0.5s infinite',
        }}
      />

      {/* ========== REFLECTOR LIGHT HOUSING UNITS ========== */}
      {/* These look like actual reflector housing fixtures at the bottom of each beam */}

      {/* Reflector Unit 1 - Purple (far left) */}
      <div className="absolute" style={{ bottom: '-2%', left: '3%' }}>
        {/* Outer glow halo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          animation: 'reflector-halo 3s ease-in-out infinite',
        }} />
        {/* Lens flare ring 1 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          border: '1.5px solid rgba(168, 85, 247, 0.25)',
          boxShadow: '0 0 15px rgba(168, 85, 247, 0.15), inset 0 0 15px rgba(168, 85, 247, 0.08)',
          animation: 'reflector-ring-pulse 2s ease-in-out infinite',
        }} />
        {/* Lens flare ring 2 (outer) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '1px solid rgba(168, 85, 247, 0.12)',
          boxShadow: '0 0 10px rgba(168, 85, 247, 0.08)',
          animation: 'reflector-ring-pulse 2.5s ease-in-out 0.3s infinite',
        }} />
        {/* Core light source */}
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(200,170,255,0.9) 10%, rgba(168, 85, 247, 0.7) 25%, rgba(168, 85, 247, 0.2) 50%, transparent 70%)',
          boxShadow: '0 0 50px rgba(168, 85, 247, 0.9), 0 0 100px rgba(168, 85, 247, 0.5), 0 0 150px rgba(168, 85, 247, 0.25)',
          animation: 'reflector-source-pulse 2s ease-in-out infinite',
        }} />
        {/* Light rays (starburst) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '2px',
          background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.4), transparent)',
          animation: 'starburst-ray 2s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(90deg)',
          width: '200px',
          height: '2px',
          background: 'linear-gradient(to right, transparent, rgba(168, 85, 247, 0.3), transparent)',
          animation: 'starburst-ray 2s ease-in-out 0.5s infinite',
        }} />
        {/* Reflector housing shape */}
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50px',
          height: '25px',
          background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.3), rgba(0,0,0,0.8))',
          borderRadius: '0 0 8px 8px',
          borderTop: '2px solid rgba(168, 85, 247, 0.4)',
        }} />
      </div>

      {/* Reflector Unit 2 - Orange (far right) */}
      <div className="absolute" style={{ bottom: '-2%', right: '3%' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
          animation: 'reflector-halo 3.5s ease-in-out 0.5s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: '1.5px solid rgba(249, 115, 22, 0.25)',
          boxShadow: '0 0 15px rgba(249, 115, 22, 0.15), inset 0 0 15px rgba(249, 115, 22, 0.08)',
          animation: 'reflector-ring-pulse 2.5s ease-in-out 0.5s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '170px',
          height: '170px',
          borderRadius: '50%',
          border: '1px solid rgba(249, 115, 22, 0.12)',
          boxShadow: '0 0 10px rgba(249, 115, 22, 0.08)',
          animation: 'reflector-ring-pulse 3s ease-in-out 0.8s infinite',
        }} />
        <div style={{
          width: '85px',
          height: '85px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,200,150,0.9) 10%, rgba(249, 115, 22, 0.7) 25%, rgba(249, 115, 22, 0.2) 50%, transparent 70%)',
          boxShadow: '0 0 50px rgba(249, 115, 22, 0.9), 0 0 100px rgba(249, 115, 22, 0.5), 0 0 150px rgba(249, 115, 22, 0.25)',
          animation: 'reflector-source-pulse 2.5s ease-in-out 0.5s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '180px',
          height: '2px',
          background: 'linear-gradient(to right, transparent, rgba(249, 115, 22, 0.4), transparent)',
          animation: 'starburst-ray 2.3s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(90deg)',
          width: '180px',
          height: '2px',
          background: 'linear-gradient(to right, transparent, rgba(249, 115, 22, 0.3), transparent)',
          animation: 'starburst-ray 2.3s ease-in-out 0.5s infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50px',
          height: '25px',
          background: 'linear-gradient(to bottom, rgba(249, 115, 22, 0.3), rgba(0,0,0,0.8))',
          borderRadius: '0 0 8px 8px',
          borderTop: '2px solid rgba(249, 115, 22, 0.4)',
        }} />
      </div>

      {/* Reflector Unit 3 - Gold (center) */}
      <div className="absolute" style={{ bottom: '-2%', left: '50%', transform: 'translateX(-50%)' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234, 179, 8, 0.12) 0%, transparent 70%)',
          animation: 'reflector-halo 4s ease-in-out 0.3s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          border: '1.5px solid rgba(234, 179, 8, 0.3)',
          boxShadow: '0 0 20px rgba(234, 179, 8, 0.2), inset 0 0 20px rgba(234, 179, 8, 0.08)',
          animation: 'reflector-ring-pulse 2.2s ease-in-out 0.3s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '210px',
          height: '210px',
          borderRadius: '50%',
          border: '1px solid rgba(234, 179, 8, 0.15)',
          boxShadow: '0 0 15px rgba(234, 179, 8, 0.1)',
          animation: 'reflector-ring-pulse 2.8s ease-in-out 0.6s infinite',
        }} />
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,240,180,0.95) 8%, rgba(234, 179, 8, 0.8) 20%, rgba(234, 179, 8, 0.25) 45%, transparent 70%)',
          boxShadow: '0 0 60px rgba(234, 179, 8, 0.9), 0 0 120px rgba(234, 179, 8, 0.5), 0 0 180px rgba(234, 179, 8, 0.25)',
          animation: 'reflector-source-pulse 2.2s ease-in-out 0.3s infinite',
        }} />
        {/* Starburst rays for center reflector */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '240px',
          height: '2px',
          background: 'linear-gradient(to right, transparent, rgba(234, 179, 8, 0.5), transparent)',
          animation: 'starburst-ray 2s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(90deg)',
          width: '240px',
          height: '2px',
          background: 'linear-gradient(to right, transparent, rgba(234, 179, 8, 0.4), transparent)',
          animation: 'starburst-ray 2s ease-in-out 0.5s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          width: '180px',
          height: '1.5px',
          background: 'linear-gradient(to right, transparent, rgba(234, 179, 8, 0.3), transparent)',
          animation: 'starburst-ray 2.5s ease-in-out 0.2s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-45deg)',
          width: '180px',
          height: '1.5px',
          background: 'linear-gradient(to right, transparent, rgba(234, 179, 8, 0.3), transparent)',
          animation: 'starburst-ray 2.5s ease-in-out 0.7s infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '55px',
          height: '28px',
          background: 'linear-gradient(to bottom, rgba(234, 179, 8, 0.35), rgba(0,0,0,0.85))',
          borderRadius: '0 0 10px 10px',
          borderTop: '2px solid rgba(234, 179, 8, 0.5)',
        }} />
      </div>

      {/* Reflector Unit 4 - Pink (left-center) */}
      <div className="absolute" style={{ bottom: '-2%', left: '22%' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
          animation: 'reflector-halo 3s ease-in-out 0.8s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '1px solid rgba(236, 72, 153, 0.2)',
          boxShadow: '0 0 12px rgba(236, 72, 153, 0.12), inset 0 0 12px rgba(236, 72, 153, 0.06)',
          animation: 'reflector-ring-pulse 2.8s ease-in-out 0.8s infinite',
        }} />
        <div style={{
          width: '75px',
          height: '75px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(236, 72, 153, 0.8) 12%, rgba(236, 72, 153, 0.25) 40%, transparent 70%)',
          boxShadow: '0 0 40px rgba(236, 72, 153, 0.8), 0 0 80px rgba(236, 72, 153, 0.4)',
          animation: 'reflector-source-pulse 2.8s ease-in-out 0.8s infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '42px',
          height: '20px',
          background: 'linear-gradient(to bottom, rgba(236, 72, 153, 0.25), rgba(0,0,0,0.8))',
          borderRadius: '0 0 6px 6px',
          borderTop: '1.5px solid rgba(236, 72, 153, 0.35)',
        }} />
      </div>

      {/* Reflector Unit 5 - Green (right-center) */}
      <div className="absolute" style={{ bottom: '-2%', right: '22%' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, transparent 70%)',
          animation: 'reflector-halo 3.2s ease-in-out 1.2s infinite',
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          boxShadow: '0 0 12px rgba(34, 197, 94, 0.12), inset 0 0 12px rgba(34, 197, 94, 0.06)',
          animation: 'reflector-ring-pulse 3s ease-in-out 1.2s infinite',
        }} />
        <div style={{
          width: '75px',
          height: '75px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(34, 197, 94, 0.8) 12%, rgba(34, 197, 94, 0.25) 40%, transparent 70%)',
          boxShadow: '0 0 40px rgba(34, 197, 94, 0.8), 0 0 80px rgba(34, 197, 94, 0.4)',
          animation: 'reflector-source-pulse 3s ease-in-out 1.2s infinite',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '42px',
          height: '20px',
          background: 'linear-gradient(to bottom, rgba(34, 197, 94, 0.25), rgba(0,0,0,0.8))',
          borderRadius: '0 0 6px 6px',
          borderTop: '1.5px solid rgba(34, 197, 94, 0.35)',
        }} />
      </div>

      {/* Reflector Unit 6 - Cyan (left) */}
      <div className="absolute" style={{ bottom: '-1%', left: '12%' }}>
        <div style={{
          width: '55px',
          height: '55px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(6, 182, 212, 0.7) 15%, rgba(6, 182, 212, 0.2) 40%, transparent 70%)',
          boxShadow: '0 0 30px rgba(6, 182, 212, 0.7), 0 0 60px rgba(6, 182, 212, 0.35)',
          animation: 'reflector-source-pulse 3.5s ease-in-out 1.5s infinite',
        }} />
      </div>

      {/* Reflector Unit 7 - Blue (right) */}
      <div className="absolute" style={{ bottom: '-1%', right: '12%' }}>
        <div style={{
          width: '55px',
          height: '55px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(59, 130, 246, 0.7) 15%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.7), 0 0 60px rgba(59, 130, 246, 0.35)',
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
          background: 'radial-gradient(ellipse at bottom center, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
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
          background: 'radial-gradient(ellipse at bottom center, rgba(249, 115, 22, 0.18) 0%, transparent 70%)',
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
          background: 'radial-gradient(ellipse at bottom center, rgba(234, 179, 8, 0.15) 0%, transparent 70%)',
          filter: 'blur(20px)',
          animationDelay: '0.8s',
        }}
      />

      {/* ========== VEGAS SIDE PILLAR LIGHTS ========== */}
      {/* Left side vertical lights */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center justify-around py-6 w-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`left-light-${i}`}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: vegasColors[i % 6],
              boxShadow: `0 0 8px ${vegasColors[i % 6]}, 0 0 18px ${vegasColors[i % 6]}50`,
              animation: `vegas-lights ${0.4 + Math.random() * 1.2}s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* Right side vertical lights */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-around py-6 w-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`right-light-${i}`}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              background: vegasColors[i % 6],
              boxShadow: `0 0 8px ${vegasColors[i % 6]}, 0 0 18px ${vegasColors[i % 6]}50`,
              animation: `vegas-lights ${0.4 + Math.random() * 1.2}s ease-in-out ${i * 0.1}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ========== TOP & BOTTOM MARQUEE LIGHTS ========== */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-around px-6 h-4">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`top-light-${i}`}
            className="w-2 h-2 rounded-full"
            style={{
              background: vegasColors[i % 6],
              boxShadow: `0 0 6px ${vegasColors[i % 6]}, 0 0 14px ${vegasColors[i % 6]}50`,
              animation: `vegas-lights ${0.3 + Math.random() * 1}s ease-in-out ${i * 0.05}s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-around px-6 h-4 z-30">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={`bottom-light-${i}`}
            className="w-2 h-2 rounded-full"
            style={{
              background: vegasColors[i % 6],
              boxShadow: `0 0 6px ${vegasColors[i % 6]}, 0 0 14px ${vegasColors[i % 6]}50`,
              animation: `vegas-lights ${0.3 + Math.random() * 1}s ease-in-out ${i * 0.05}s infinite alternate`,
            }}
          />
        ))}
      </div>

      {/* ========== FLOATING LIGHT PARTICLES ========== */}
      {particles.map((particle) => (
        <div
          key={`particle-${particle.id}`}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            bottom: particle.bottom,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}80`,
            animation: `light-particle-float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            opacity: 0,
          }}
        />
      ))}

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
      <div className="scanline-effect absolute inset-0 opacity-15" />

      {/* Top ambient glow from overhead lights */}
      <div
        className="absolute"
        style={{
          top: '-5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          height: '35%',
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
          height: '45%',
          background: 'linear-gradient(to top, rgba(168, 85, 247, 0.04) 0%, transparent 100%)',
          filter: 'blur(30px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '30%',
          right: '0%',
          height: '40%',
          background: 'linear-gradient(to top, rgba(249, 115, 22, 0.03) 0%, transparent 100%)',
          filter: 'blur(25px)',
        }}
      />
      <div
        className="absolute"
        style={{
          bottom: '0%',
          left: '0%',
          right: '30%',
          height: '35%',
          background: 'linear-gradient(to top, rgba(234, 179, 8, 0.025) 0%, transparent 100%)',
          filter: 'blur(28px)',
        }}
      />
    </div>
  )
}
