'use client'

import { useState, useEffect } from 'react'

interface PopupConfig {
  id: string
  text: string
  linkUrl: string
  isActive: boolean
  color: string
  size: number
  position: string
}

export default function CircularPopup() {
  const [popup, setPopup] = useState<PopupConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const res = await fetch('/api/popup')
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          // Find the first active popup
          const activePopup = data.find((p: PopupConfig) => p.isActive)
          if (activePopup) setPopup(activePopup)
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchPopup()
  }, [])

  // Check if dismissed in this session
  useEffect(() => {
    if (popup) {
      const dismissedId = sessionStorage.getItem('tpk_popup_dismissed')
      if (dismissedId === popup.id) {
        setDismissed(true)
      }
    }
  }, [popup])

  if (loading || !popup || dismissed) return null

  const size = Math.max(80, Math.min(200, popup.size))
  const radius = size / 2 - 8

  // Position calculation
  const positionStyles: React.CSSProperties = (() => {
    switch (popup.position) {
      case 'bottom-left':
        return { bottom: '100px', left: '24px' }
      case 'bottom-right':
        return { bottom: '100px', right: '24px' }
      case 'top-left':
        return { top: '24px', left: '24px' }
      case 'top-right':
        return { top: '24px', right: '24px' }
      case 'center-left':
        return { top: '50%', left: '24px', transform: 'translateY(-50%)' }
      case 'center-right':
        return { top: '50%', right: '24px', transform: 'translateY(-50%)' }
      default:
        return { bottom: '100px', left: '24px' }
    }
  })()

  // Split text into individual characters for circular arrangement
  const text = popup.text || 'TPK NUEVO'
  const chars = text.split('')

  return (
    <div
      className="fixed z-40"
      style={positionStyles}
    >
      <a
        href={popup.linkUrl || '#'}
        target={popup.linkUrl.startsWith('http') ? '_blank' : '_self'}
        rel="noopener noreferrer"
        className="block relative cursor-pointer group"
        style={{ width: size, height: size }}
        onClick={(e) => {
          if (popup.linkUrl === '#' || !popup.linkUrl) {
            e.preventDefault()
          }
        }}
      >
        {/* Animated outer ring glow */}
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{
            background: popup.color,
            filter: 'blur(8px)',
            animationDuration: '2s',
          }}
        />

        {/* Pulse ring */}
        <div
          className="absolute rounded-full"
          style={{
            inset: -6,
            border: `2px solid ${popup.color}`,
            opacity: 0.5,
            animation: 'popup-ring-pulse 2s ease-in-out infinite',
          }}
        />

        {/* Second pulse ring (delayed) */}
        <div
          className="absolute rounded-full"
          style={{
            inset: -12,
            border: `1px solid ${popup.color}`,
            opacity: 0.3,
            animation: 'popup-ring-pulse 2s ease-in-out infinite 1s',
          }}
        />

        {/* Main circle */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${popup.color}40, ${popup.color}15 50%, rgba(0,0,0,0.9) 80%)`,
            border: `2px solid ${popup.color}`,
            boxShadow: `0 0 20px ${popup.color}60, 0 0 40px ${popup.color}30, inset 0 0 20px ${popup.color}15`,
            animation: 'popup-float 3s ease-in-out infinite',
          }}
        >
          {/* Inner shimmer */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${popup.color}20, transparent, ${popup.color}10, transparent)`,
              animation: 'popup-rotate 4s linear infinite',
            }}
          />

          {/* Center icon */}
          <div
            className="relative z-10 flex items-center justify-center"
            style={{
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${popup.color}50, ${popup.color}20)`,
              border: `1px solid ${popup.color}80`,
              boxShadow: `0 0 15px ${popup.color}60`,
            }}
          >
            <svg width={size * 0.15} height={size * 0.15} viewBox="0 0 24 24" fill="none" stroke={popup.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        </div>

        {/* Circular text around the popup */}
        <svg
          className="absolute inset-0"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{
            animation: 'popup-rotate 8s linear infinite',
          }}
        >
          <defs>
            <path
              id={`circlePath-${popup.id}`}
              d={`M ${size / 2}, ${size / 2} m -${radius}, 0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
            />
          </defs>
          <text
            className="font-black uppercase"
            style={{
              fill: popup.color,
              fontSize: Math.max(9, Math.min(14, size / 10)),
              letterSpacing: '4px',
              filter: `drop-shadow(0 0 4px ${popup.color}80)`,
            }}
          >
            <textPath href={`#circlePath-${popup.id}`}>
              {chars.join(' ').trim()} {'  '} {chars.join(' ').trim()}
            </textPath>
          </text>
        </svg>

        {/* Dismiss button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDismissed(true)
            sessionStorage.setItem('tpk_popup_dismissed', popup.id)
          }}
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          style={{
            background: 'rgba(0,0,0,0.8)',
            border: `1px solid ${popup.color}60`,
            color: popup.color,
            fontSize: '10px',
            lineHeight: 1,
          }}
        >
          x
        </button>
      </a>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes popup-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes popup-ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.2; }
        }
        @keyframes popup-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
