'use client'

import { useState, useEffect, useCallback } from 'react'

interface NeonLetterProps {
  letter: string
  color: 'purple' | 'orange' | 'green'
  index: number
}

const colorConfig = {
  purple: {
    on: {
      color: '#d8b4fe',
      textShadow: '0 0 7px #d8b4fe, 0 0 10px #d8b4fe, 0 0 21px #d8b4fe, 0 0 42px #a855f7, 0 0 82px #a855f7, 0 0 92px #a855f7, 0 0 102px #a855f7, 0 0 151px #a855f7',
      boxShadow: '0 0 5px #d8b4fe, 0 0 10px #a855f7, 0 0 20px #a855f7, 0 0 40px #a855f7, inset 0 0 5px rgba(168, 85, 247, 0.3)',
      borderColor: '#a855f7',
      backgroundColor: 'rgba(168, 85, 247, 0.15)',
    },
    off: {
      color: '#3b2070',
      textShadow: '0 0 2px #3b2070',
      boxShadow: '0 0 2px rgba(168, 85, 247, 0.2), inset 0 0 2px rgba(168, 85, 247, 0.1)',
      borderColor: '#2d1a5e',
      backgroundColor: 'rgba(168, 85, 247, 0.05)',
    },
  },
  orange: {
    on: {
      color: '#fed7aa',
      textShadow: '0 0 7px #fed7aa, 0 0 10px #fed7aa, 0 0 21px #f97316, 0 0 42px #f97316, 0 0 82px #f97316, 0 0 92px #f97316, 0 0 102px #f97316, 0 0 151px #f97316',
      boxShadow: '0 0 5px #fed7aa, 0 0 10px #f97316, 0 0 20px #f97316, 0 0 40px #f97316, inset 0 0 5px rgba(249, 115, 22, 0.3)',
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.15)',
    },
    off: {
      color: '#5c2d0a',
      textShadow: '0 0 2px #5c2d0a',
      boxShadow: '0 0 2px rgba(249, 115, 22, 0.2), inset 0 0 2px rgba(249, 115, 22, 0.1)',
      borderColor: '#3d1e08',
      backgroundColor: 'rgba(249, 115, 22, 0.05)',
    },
  },
  green: {
    on: {
      color: '#bbf7d0',
      textShadow: '0 0 7px #bbf7d0, 0 0 10px #bbf7d0, 0 0 21px #22c55e, 0 0 42px #22c55e, 0 0 82px #22c55e, 0 0 92px #22c55e, 0 0 102px #22c55e, 0 0 151px #22c55e',
      boxShadow: '0 0 5px #bbf7d0, 0 0 10px #22c55e, 0 0 20px #22c55e, 0 0 40px #22c55e, inset 0 0 5px rgba(34, 197, 94, 0.3)',
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
    off: {
      color: '#14492a',
      textShadow: '0 0 2px #14492a',
      boxShadow: '0 0 2px rgba(34, 197, 94, 0.2), inset 0 0 2px rgba(34, 197, 94, 0.1)',
      borderColor: '#0f3419',
      backgroundColor: 'rgba(34, 197, 94, 0.05)',
    },
  },
}

export default function NeonLetter({ letter, color, index }: NeonLetterProps) {
  const [isOn, setIsOn] = useState(true)
  const [transitioning, setTransitioning] = useState(false)

  const flicker = useCallback(() => {
    // Random interval between 1000ms and 2000ms
    const interval = 1000 + Math.random() * 1000
    return setTimeout(() => {
      setTransitioning(true)
      setIsOn(prev => !prev)
      // Brief flicker effect - sometimes do a double flicker
      if (Math.random() > 0.7) {
        setTimeout(() => {
          setIsOn(prev => !prev)
          setTimeout(() => {
            setIsOn(prev => !prev)
            setTransitioning(false)
          }, 80 + Math.random() * 60)
        }, 60 + Math.random() * 40)
      } else {
        setTimeout(() => {
          setTransitioning(false)
        }, 100)
      }
    }, interval)
  }, [])

  useEffect(() => {
    // Stagger initial state
    const initialDelay = index * 200 + Math.random() * 500
    const initialTimeout = setTimeout(() => {
      let timeoutId: ReturnType<typeof setTimeout>
      const scheduleNext = () => {
        timeoutId = flicker()
      }
      scheduleNext()

      const intervalId = setInterval(() => {
        clearTimeout(timeoutId)
        scheduleNext()
      }, 2500 + Math.random() * 1000)

      return () => {
        clearTimeout(timeoutId)
        clearInterval(intervalId)
      }
    }, initialDelay)

    return () => clearTimeout(initialTimeout)
  }, [flicker, index])

  const config = isOn ? colorConfig[color].on : colorConfig[color].off

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{
        width: 'clamp(60px, 10vw, 110px)',
        height: 'clamp(70px, 12vw, 130px)',
        border: `2px solid ${config.borderColor}`,
        borderRadius: '8px',
        backgroundColor: config.backgroundColor,
        boxShadow: config.boxShadow,
        transition: transitioning ? 'all 0.08s ease-in-out' : 'all 0.3s ease-in-out',
        margin: '0 clamp(4px, 0.8vw, 8px)',
      }}
    >
      {/* Inner glow overlay */}
      <div
        className="absolute inset-0 rounded-md"
        style={{
          background: isOn
            ? `radial-gradient(ellipse at center, rgba(255,255,255,0.1) 0%, transparent 70%)`
            : 'transparent',
          transition: 'all 0.3s ease-in-out',
        }}
      />
      
      {/* Letter */}
      <span
        style={{
          fontSize: 'clamp(2rem, 6vw, 4.5rem)',
          fontWeight: 900,
          fontFamily: 'var(--font-geist-sans), sans-serif',
          color: config.color,
          textShadow: config.textShadow,
          transition: transitioning ? 'all 0.08s ease-in-out' : 'all 0.3s ease-in-out',
          letterSpacing: '2px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {letter}
      </span>

      {/* Reflection below */}
      <div
        className="absolute -bottom-6 left-0 right-0 flex items-center justify-center overflow-hidden"
        style={{ height: '20px', opacity: isOn ? 0.3 : 0.05 }}
      >
        <span
          style={{
            fontSize: 'clamp(1rem, 4vw, 3rem)',
            fontWeight: 900,
            fontFamily: 'var(--font-geist-sans), sans-serif',
            color: config.color,
            textShadow: config.textShadow,
            transform: 'scaleY(-1)',
            filter: 'blur(3px)',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          {letter}
        </span>
      </div>
    </div>
  )
}
