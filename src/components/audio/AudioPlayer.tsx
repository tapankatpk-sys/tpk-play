'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ============================================
// AUDIO PLAYER - Himno TPK PLAY
// Reproducción indefinida, control de volumen, pausa
// ============================================

interface AudioConfigType {
  audioUrl: string
  volume: number        // 0-100
  autoPlay: boolean
  isActive: boolean
  label: string
}

const DEFAULT_CONFIG: AudioConfigType = {
  audioUrl: '/tpk-anthem.mp3',
  volume: 60,
  autoPlay: false,
  isActive: true,
  label: 'Te Pe Ka Fans Club',
}

export default function AudioPlayer() {
  const [config, setConfig] = useState<AudioConfigType>(DEFAULT_CONFIG)
  const [configLoaded, setConfigLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(60)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animFrameRef = useRef<number | null>(null)

  // Fetch audio config from DB
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/audio')
        if (res.ok) {
          const data = await res.json()
          if (data && !data.error) {
            const newConfig: AudioConfigType = {
              audioUrl: data.audioUrl || '/tpk-anthem.mp3',
              volume: data.volume ?? 60,
              autoPlay: data.autoPlay ?? false,
              isActive: data.isActive !== false,
              label: data.label || 'Te Pe Ka Fans Club',
            }
            setConfig(newConfig)
            setVolume(newConfig.volume)
          }
        }
      } catch { /* use defaults */ }
      setConfigLoaded(true)
    }
    fetchConfig()
  }, [])

  // Initialize audio element
  useEffect(() => {
    if (!configLoaded || !config.isActive) return

    const audio = new Audio(config.audioUrl)
    audio.loop = true
    audio.volume = volume / 100
    audio.preload = 'auto'
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })

    audio.addEventListener('ended', () => {
      // Loop is handled by audio.loop = true, but just in case
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => {})
      }
    })

    return () => {
      audio.pause()
      audio.src = ''
      audioRef.current = null
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [configLoaded, config.isActive, config.audioUrl])

  // Check if user already interacted (localStorage)
  useEffect(() => {
    const wasPlaying = localStorage.getItem('tpk_audio_playing')
    if (wasPlaying === 'true' && config.autoPlay) {
      setHasInteracted(true)
    }
  }, [config.autoPlay])

  // Auto-play after interaction
  useEffect(() => {
    if (hasInteracted && audioRef.current && config.isActive && config.autoPlay) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
        localStorage.setItem('tpk_audio_playing', 'true')
        startTimeUpdate()
      }).catch(() => {})
    }
  }, [hasInteracted, config.isActive, config.autoPlay])

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100
    }
  }, [volume, isMuted])

  const startTimeUpdate = useCallback(() => {
    const update = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime)
      }
      animFrameRef.current = requestAnimationFrame(update)
    }
    update()
  }, [])

  const togglePlay = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      localStorage.setItem('tpk_audio_playing', 'false')
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
        setHasInteracted(true)
        localStorage.setItem('tpk_audio_playing', 'true')
        startTimeUpdate()
      } catch {
        // Browser blocked autoplay
      }
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseInt(e.target.value)
    setVolume(newVol)
    setIsMuted(newVol === 0)
    if (audioRef.current) {
      audioRef.current.volume = newVol / 100
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const newTime = parseFloat(e.target.value)
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Visualizer bars animation
  const bars = 12
  const getBarHeight = (index: number): number => {
    if (!isPlaying) return 3
    return Math.sin(Date.now() / 200 + index * 0.8) * 8 + 10
  }

  // Don't render if inactive
  if (!configLoaded || !config.isActive) return null

  return (
    <>
      {/* Floating mini button - always visible */}
      <div
        className="fixed z-50"
        style={{
          bottom: showControls ? 'auto' : '24px',
          right: showControls ? 'auto' : '24px',
          top: showControls ? '50%' : 'auto',
          left: showControls ? '50%' : 'auto',
          transform: showControls ? 'translate(-50%, -50%)' : 'none',
        }}
      >
        {/* Expanded control panel */}
        {showControls && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowControls(false)}
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            />
            <div
              className="relative z-50 w-[340px] rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.97) 0%, rgba(10,5,20,0.99) 50%, rgba(0,0,0,0.97) 100%)',
                border: '2px solid rgba(168,85,247,0.4)',
                boxShadow: '0 0 40px rgba(168,85,247,0.2), 0 0 80px rgba(249,115,22,0.1), inset 0 0 30px rgba(168,85,247,0.05)',
              }}
            >
              {/* Header */}
              <div className="p-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* Animated visualizer bars */}
                    <div className="flex items-end gap-[2px] h-4">
                      {Array.from({ length: bars }).map((_, i) => (
                        <div
                          key={i}
                          className="w-[3px] rounded-full transition-all"
                          style={{
                            height: `${getBarHeight(i)}px`,
                            background: isPlaying
                              ? `linear-gradient(to top, #a855f7, #f97316)`
                              : 'rgba(168,85,247,0.2)',
                            boxShadow: isPlaying ? '0 0 4px rgba(168,85,247,0.5)' : 'none',
                            animation: isPlaying ? `audioBar${i % 4} 0.${3 + (i % 5)}s ease-in-out infinite alternate` : 'none',
                          }}
                        />
                      ))}
                    </div>
                    <div>
                      <div
                        className="text-xs font-black uppercase tracking-wider"
                        style={{
                          background: 'linear-gradient(90deg, #d8b4fe, #f97316)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        TPK PLAY
                      </div>
                      <div className="text-[0.5rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {config.label}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowControls(false)}
                    className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Album art placeholder */}
                <div
                  className="w-full h-24 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(249,115,22,0.15))',
                    border: '1px solid rgba(168,85,247,0.2)',
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #f97316)',
                      boxShadow: isPlaying ? '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(249,115,22,0.2)' : 'none',
                      animation: isPlaying ? 'audioSpin 3s linear infinite' : 'none',
                    }}
                  >
                    <span className="text-2xl" style={{ filter: 'brightness(2)' }}>🎵</span>
                  </div>
                  {/* Glow effect */}
                  {isPlaying && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(168,85,247,0.1) 0%, transparent 70%)',
                        animation: 'audioPulse 2s ease-in-out infinite',
                      }}
                    />
                  )}
                </div>

                {/* Track info */}
                <div className="text-center mb-2">
                  <div className="text-sm font-bold" style={{ color: '#d8b4fe' }}>
                    {config.label}
                  </div>
                  <div className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    TPK PLAY Soundtrack
                  </div>
                </div>

                {/* Progress bar / Seek */}
                <div className="mb-2">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #f97316 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[0.5rem] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-[0.5rem] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                {/* Play controls */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  {/* Back 10s */}
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
                      }
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{
                      background: isPlaying
                        ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                        : 'linear-gradient(135deg, #f97316, #ea580c)',
                      boxShadow: isPlaying
                        ? '0 0 20px rgba(168,85,247,0.5), 0 0 40px rgba(168,85,247,0.2)'
                        : '0 0 20px rgba(249,115,22,0.5), 0 0 40px rgba(249,115,22,0.2)',
                    }}
                  >
                    {isPlaying ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    )}
                  </button>

                  {/* Forward 10s */}
                  <button
                    onClick={() => {
                      if (audioRef.current) {
                        audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
                      }
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                  </button>
                </div>

                {/* Volume control */}
                <div className="flex items-center gap-2 px-2 pb-3">
                  <button onClick={toggleMute} className="cursor-pointer flex-shrink-0">
                    {isMuted || volume === 0 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="rgba(255,255,255,0.2)" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    ) : volume < 50 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="rgba(168,85,247,0.3)" stroke="#a855f7" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#a855f7" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                        <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="rgba(168,85,247,0.3)" stroke="#a855f7" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#a855f7" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="#a855f7" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #f97316 ${(isMuted ? 0 : volume)}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume)}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <span className="text-[0.5rem] font-mono w-6 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {isMuted ? '0' : volume}%
                  </span>
                </div>

                {/* Loop indicator */}
                <div className="text-center pb-3">
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.15)' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                      <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                    <span className="text-[0.5rem] font-bold" style={{ color: '#a855f7' }}>
                      Repetición infinita
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mini floating button */}
        {!showControls && (
          <button
            onClick={() => setShowControls(true)}
            className="relative w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 group"
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, #a855f7, #7c3aed)'
                : 'linear-gradient(135deg, rgba(168,85,247,0.3), rgba(249,115,22,0.3))',
              boxShadow: isPlaying
                ? '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.15)'
                : '0 0 10px rgba(168,85,247,0.15)',
              border: '2px solid rgba(168,85,247,0.4)',
            }}
          >
            {/* Pulse ring when playing */}
            {isPlaying && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '2px solid rgba(168,85,247,0.3)',
                  animation: 'audioPulseRing 2s ease-out infinite',
                }}
              />
            )}

            {isPlaying ? (
              <div className="flex items-end gap-[2px] h-5">
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-white"
                    style={{
                      height: `${8 + Math.sin(Date.now() / 200 + i * 1.2) * 6}px`,
                      animation: `audioBar${i} 0.${3 + i}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="5,3 19,12 5,21" fill="rgba(255,255,255,0.3)" />
              </svg>
            )}

            {/* Tooltip */}
            <div
              className="absolute bottom-full right-0 mb-2 px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{
                background: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(168,85,247,0.3)',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              {isPlaying ? 'Reproduciendo...' : 'Reproducir Audio'}
            </div>
          </button>
        )}
      </div>
    </>
  )
}
