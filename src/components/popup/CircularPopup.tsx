'use client'

import { useState, useEffect } from 'react'

interface PopupConfig {
  id: string
  text: string
  linkUrl: string
  imageUrl: string | null
  isActive: boolean
  color: string
  size: number
  position: string
}

export default function CircularPopup() {
  const [popup, setPopup] = useState<PopupConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const fetchPopup = async () => {
      try {
        const res = await fetch('/api/popup')
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
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

  useEffect(() => {
    if (popup) {
      const dismissedId = sessionStorage.getItem('tpk_popup_dismissed')
      if (dismissedId === popup.id) {
        setDismissed(true)
      }
    }
  }, [popup])

  if (loading || !popup || dismissed) return null

  const size = Math.max(100, Math.min(220, popup.size))
  // Outer ring radius for text (outside the circle)
  const outerTextRadius = size / 2 + 20
  // The total container needs space for the text ring outside
  const containerSize = size + 56

  const positionStyles: React.CSSProperties = (() => {
    switch (popup.position) {
      case 'bottom-left':
        return { bottom: '80px', left: '24px' }
      case 'bottom-right':
        return { bottom: '80px', right: '24px' }
      case 'top-left':
        return { top: '24px', left: '24px' }
      case 'top-right':
        return { top: '24px', right: '24px' }
      case 'center-left':
        return { top: '50%', left: '24px', transform: 'translateY(-50%)' }
      case 'center-right':
        return { top: '50%', right: '24px', transform: 'translateY(-50%)' }
      default:
        return { bottom: '80px', left: '24px' }
    }
  })()

  const text = popup.text || 'TPK NUEVO'
  const chars = text.split('')

  // Build the text string with spaces between chars for circular distribution
  const displayText = chars.join('\u00A0') // non-breaking spaces

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
        style={{ width: containerSize, height: containerSize }}
        onClick={(e) => {
          if (popup.linkUrl === '#' || !popup.linkUrl) {
            e.preventDefault()
          }
        }}
      >
        {/* Animated outer ring glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: containerSize,
            height: containerSize,
            left: 0,
            top: 0,
            background: popup.color,
            filter: 'blur(12px)',
            opacity: 0.12,
            animation: 'popup-ring-pulse 2s ease-in-out infinite',
          }}
        />

        {/* Pulsing ring - outermost */}
        <div
          className="absolute rounded-full"
          style={{
            width: containerSize - 8,
            height: containerSize - 8,
            left: 4,
            top: 4,
            border: `1.5px solid ${popup.color}`,
            opacity: 0.2,
            animation: 'popup-ring-pulse 2.5s ease-in-out infinite 0.5s',
          }}
        />

        {/* Circular text OUTSIDE the main circle - rotating */}
        <svg
          className="absolute"
          width={containerSize}
          height={containerSize}
          viewBox={`0 0 ${containerSize} ${containerSize}`}
          style={{
            left: 0,
            top: 0,
            animation: 'popup-text-rotate 10s linear infinite',
          }}
        >
          <defs>
            <path
              id={`circlePath-outer-${popup.id}`}
              d={`M ${containerSize / 2}, ${containerSize / 2} m -${outerTextRadius}, 0 a ${outerTextRadius},${outerTextRadius} 0 1,1 ${outerTextRadius * 2},0 a ${outerTextRadius},${outerTextRadius} 0 1,1 -${outerTextRadius * 2},0`}
            />
          </defs>
          <text
            className="font-black uppercase"
            style={{
              fill: popup.color,
              fontSize: Math.max(10, Math.min(13, size / 11)),
              letterSpacing: '3px',
              fontWeight: 900,
              filter: `drop-shadow(0 0 6px ${popup.color}90) drop-shadow(0 0 12px ${popup.color}50)`,
            }}
          >
            <textPath href={`#circlePath-outer-${popup.id}`}>
              {displayText} {'  \u00B7  '} {displayText} {'  \u00B7  '} {displayText}
            </textPath>
          </text>
        </svg>

        {/* Main circle with image inside */}
        <div
          className="absolute rounded-full overflow-hidden"
          style={{
            width: size,
            height: size,
            left: (containerSize - size) / 2,
            top: (containerSize - size) / 2,
            border: `3px solid ${popup.color}`,
            boxShadow: `0 0 25px ${popup.color}60, 0 0 50px ${popup.color}25, inset 0 0 20px ${popup.color}10`,
            animation: 'popup-float 3s ease-in-out infinite',
          }}
        >
          {/* Image from URL */}
          {popup.imageUrl && !imgError ? (
            <img
              src={popup.imageUrl}
              alt={popup.text}
              className="w-full h-full object-cover"
              style={{
                borderRadius: '50%',
              }}
              onError={() => setImgError(true)}
            />
          ) : (
            /* Fallback: gradient with icon */
            <div
              className="w-full h-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${popup.color}40, ${popup.color}15 50%, rgba(0,0,0,0.95) 80%)`,
              }}
            >
              <svg width={size * 0.2} height={size * 0.2} viewBox="0 0 24 24" fill="none" stroke={popup.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          )}

          {/* Inner shimmer overlay */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg, transparent 0%, ${popup.color}15 25%, transparent 50%, ${popup.color}10 75%, transparent 100%)`,
              animation: 'popup-rotate 4s linear infinite',
            }}
          />

          {/* Glass reflection */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)',
            }}
          />
        </div>

        {/* Spinning neon ring around the circle */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: size + 6,
            height: size + 6,
            left: (containerSize - size - 6) / 2,
            top: (containerSize - size - 6) / 2,
            border: `2px solid transparent`,
            borderTopColor: popup.color,
            borderRightColor: `${popup.color}60`,
            animation: 'popup-rotate 3s linear infinite',
            filter: `drop-shadow(0 0 4px ${popup.color}80)`,
          }}
        />

        {/* Dismiss button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setDismissed(true)
            sessionStorage.setItem('tpk_popup_dismissed', popup.id)
          }}
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          style={{
            background: 'rgba(0,0,0,0.85)',
            border: `1px solid ${popup.color}60`,
            color: popup.color,
            fontSize: '11px',
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
        @keyframes popup-text-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes popup-ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.25; }
          50% { transform: scale(1.06); opacity: 0.1; }
        }
        @keyframes popup-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
