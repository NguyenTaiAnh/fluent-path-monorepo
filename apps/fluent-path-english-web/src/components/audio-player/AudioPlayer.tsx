'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Repeat,
  Repeat1,
  Shuffle,
  Timer,
  Moon,
  ChevronUp,
} from 'lucide-react'
import { useAudioPlayerStore } from '@/store/useAudioPlayerStore'

function formatTime(time: number): string {
  if (isNaN(time) || !isFinite(time)) return '0:00'
  const m = Math.floor(time / 60)
  const s = Math.floor(time % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const SLEEP_OPTIONS = [
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '20 min', value: 20 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '60 min', value: 60 },
]

function SleepTimerCountdown({ endTime }: { endTime: number }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, endTime - Date.now())
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${m}:${s.toString().padStart(2, '0')}`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [endTime])

  return <span className="tabular-nums">{remaining}</span>
}

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const [showSleepMenu, setShowSleepMenu] = useState(false)
  const [showMobileExtra, setShowMobileExtra] = useState(false)
  const sleepMenuRef = useRef<HTMLDivElement>(null)

  const {
    playlist,
    courseTitle,
    courseThumbnail,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    repeatMode,
    isShuffle,
    sleepTimerMinutes,
    sleepTimerEndTime,
    setIsPlaying,
    setProgress,
    setPlaybackRate,
    nextTrack,
    prevTrack,
    togglePlay,
    clearPlayer,
    cycleRepeatMode,
    toggleShuffle,
    setSleepTimer,
    checkSleepTimer,
  } = useAudioPlayerStore()

  const currentTrack = playlist[currentTrackIndex]

  // Track a "generation" that increments on every track change or repeat-restart
  // This forces the sync effect to re-run even when currentTrackIndex stays the same (repeat one)
  const [playGeneration, setPlayGeneration] = useState(0)

  // Sync audio element with store state — loads new source and plays
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    audio.src = currentTrack.audioUrl
    audio.currentTime = 0
    audio.load()

    if (isPlaying) {
      const p = audio.play()
      if (p) p.catch(() => setIsPlaying(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackIndex, currentTrack?.audioUrl, playGeneration])

  // Play/pause sync (only triggers when isPlaying changes, NOT on track change)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    if (isPlaying) {
      const p = audio.play()
      if (p) p.catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack, setIsPlaying])

  // Playback rate sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  // Sleep timer check
  useEffect(() => {
    if (!sleepTimerEndTime) return
    const id = setInterval(() => {
      checkSleepTimer()
    }, 1000)
    return () => clearInterval(id)
  }, [sleepTimerEndTime, checkSleepTimer])

  // ─── Media Session API ───
  // Enables lock screen / Control Center / notification bar / Bluetooth headset controls
  // on iOS Safari, Android Chrome, and desktop browsers.

  // 1. Set metadata (track title, artist, album art) for lock screen display
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return

    const artworkSrc = courseThumbnail || '/default-course-thumbnail.png'

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: courseTitle || 'TAEnglish',
      album: currentTrack.sectionTitle || '',
      artwork: [
        { src: artworkSrc, sizes: '96x96', type: 'image/png' },
        { src: artworkSrc, sizes: '128x128', type: 'image/png' },
        { src: artworkSrc, sizes: '192x192', type: 'image/png' },
        { src: artworkSrc, sizes: '256x256', type: 'image/png' },
        { src: artworkSrc, sizes: '384x384', type: 'image/png' },
        { src: artworkSrc, sizes: '512x512', type: 'image/png' },
      ],
    })
  }, [currentTrack, courseTitle, courseThumbnail])

  // 2. Register action handlers for lock screen / notification bar / Bluetooth
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => { setIsPlaying(true) }],
      ['pause', () => { setIsPlaying(false) }],
      ['previoustrack', () => { prevTrack() }],
      ['nexttrack', () => { nextTrack() }],
      ['stop', () => { clearPlayer() }],
      // iOS: seekbackward/seekforward buttons always show on lock screen
      // Map them to skip track instead of seeking
      ['seekbackward', () => { prevTrack() }],
      ['seekforward', () => { nextTrack() }],
    ]

    for (const [action, handler] of handlers) {
      try { navigator.mediaSession.setActionHandler(action, handler) } catch { /* unsupported */ }
    }

    return () => {
      for (const [action] of handlers) {
        try { navigator.mediaSession.setActionHandler(action, null) } catch { /* ignore */ }
      }
    }
  }, [setIsPlaying, prevTrack, nextTrack, clearPlayer])

  // 3. Sync playback state (playing/paused) to lock screen
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
  }, [isPlaying])

  // 4. Update position state for lock screen progress bar
  useEffect(() => {
    if (!('mediaSession' in navigator) || !duration || !isFinite(duration)) return
    const roundedTime = Math.floor(currentTime / 5) * 5
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate,
        position: Math.min(roundedTime, duration),
      })
    } catch { /* setPositionState not supported in all browsers */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(currentTime / 5), duration, playbackRate])

  // Close sleep menu on outside click
  useEffect(() => {
    if (!showSleepMenu) return
    const handleClick = (e: MouseEvent) => {
      if (sleepMenuRef.current && !sleepMenuRef.current.contains(e.target as Node)) {
        setShowSleepMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showSleepMenu])

  // ─── Audio event handlers ───
  // Handlers are attached directly to the <audio> element via React props


  // Progress bar seeking
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current
    const audio = audioRef.current
    if (!bar || !audio || !isFinite(audio.duration)) return

    const rect = bar.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * audio.duration
    setProgress(audio.currentTime, audio.duration)
  }

  // Playback rate cycling
  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2]
    const idx = speeds.indexOf(playbackRate)
    const next = speeds[(idx + 1) % speeds.length]
    setPlaybackRate(next)
  }

  // Don't render if no playlist
  if (!playlist.length || !currentTrack) return null

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const repeatIcon =
    repeatMode === 'one' ? (
      <Repeat1 className="w-4 h-4" />
    ) : (
      <Repeat className="w-4 h-4" />
    )

  const isRepeatActive = repeatMode !== 'off'

  return (
    <>
      {/* Hidden audio element */}
      {/* iOS Safari: playsInline prevents fullscreen, webkit attrs for older iOS */}
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        webkit-playsinline="true"
        x-webkit-airplay="allow"
        onTimeUpdate={() => {
          if (isDraggingRef.current || !audioRef.current) return
          setProgress(audioRef.current.currentTime, audioRef.current.duration)
        }}
        onEnded={() => {
          const state = useAudioPlayerStore.getState()
          if (state.repeatMode === 'one') {
            if (audioRef.current) {
              audioRef.current.currentTime = 0
              audioRef.current.play().catch(() => {})
            }
            setPlayGeneration((g) => g + 1)
          } else {
            state.nextTrack()
          }
        }}
        onError={() => {
          useAudioPlayerStore.getState().nextTrack()
        }}
      />

      {/* Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-9999 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        {/* Progress bar — thin line at top of player */}
        <div
          ref={progressBarRef}
          className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-gray-800 cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-linear-to-r from-indigo-500 to-violet-500 transition-[width] duration-150 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-indigo-600 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Mobile extra controls panel */}
        {showMobileExtra && (
          <div className="sm:hidden border-b border-gray-100 dark:border-gray-800 px-4 py-2.5 flex items-center justify-around bg-gray-50/80 dark:bg-gray-900/80">
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-colors ${
                isShuffle
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Repeat */}
            <button
              onClick={cycleRepeatMode}
              className={`p-2 rounded-lg transition-colors ${
                isRepeatActive
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              aria-label="Cycle repeat mode"
            >
              {repeatIcon}
            </button>

            {/* Speed */}
            <button
              onClick={cycleSpeed}
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors tabular-nums"
            >
              {playbackRate}x
            </button>

            {/* Sleep timer */}
            <div className="relative" ref={sleepMenuRef}>
              <button
                onClick={() => setShowSleepMenu(!showSleepMenu)}
                className={`p-2 rounded-lg transition-colors relative ${
                  sleepTimerMinutes
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
                aria-label="Sleep timer"
              >
                <Moon className="w-4 h-4" />
              </button>
              {showSleepMenu && <SleepTimerMenu setSleepTimer={setSleepTimer} sleepTimerMinutes={sleepTimerMinutes} sleepTimerEndTime={sleepTimerEndTime} onClose={() => setShowSleepMenu(false)} position="top" />}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-2.5 sm:py-3 max-w-screen-2xl mx-auto">
          {/* Track info */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-2">
            {/* Album art */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shadow-md shrink-0 bg-gray-100 dark:bg-gray-800">
              <Image
                src={courseThumbnail || '/default-course-thumbnail.png'}
                alt={courseTitle || ''}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {currentTrack.title}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {courseTitle} · {currentTrack.sectionTitle}
              </p>
            </div>
          </div>

          {/* Controls — center */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Shuffle (desktop only) */}
            <button
              onClick={toggleShuffle}
              className={`hidden sm:flex p-2 rounded-full transition-colors ${
                isShuffle
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              aria-label="Toggle shuffle"
              title={isShuffle ? 'Shuffle: On' : 'Shuffle: Off'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            {/* Prev */}
            <button
              onClick={prevTrack}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2.5 sm:p-3 bg-linear-to-br from-indigo-600 to-violet-600 text-white rounded-full hover:from-indigo-500 hover:to-violet-500 transition-all hover:scale-105 shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Repeat (desktop only) */}
            <button
              onClick={cycleRepeatMode}
              className={`hidden sm:flex p-2 rounded-full transition-colors ${
                isRepeatActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
              aria-label="Cycle repeat mode"
              title={
                repeatMode === 'off'
                  ? 'Repeat: Off'
                  : repeatMode === 'all'
                    ? 'Repeat: All'
                    : 'Repeat: One'
              }
            >
              {repeatIcon}
            </button>
          </div>

          {/* Right side: time + speed + sleep + close (desktop) */}
          <div className="hidden sm:flex items-center gap-2.5 flex-1 justify-end">
            {/* Time display */}
            <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500 whitespace-nowrap">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Speed button */}
            <button
              onClick={cycleSpeed}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors tabular-nums min-w-[48px]"
              aria-label="Change playback speed"
            >
              {playbackRate}x
            </button>

            {/* Sleep timer */}
            <div className="relative" ref={sleepMenuRef}>
              <button
                onClick={() => setShowSleepMenu(!showSleepMenu)}
                className={`p-1.5 rounded-lg transition-colors relative ${
                  sleepTimerMinutes
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label="Sleep timer"
                title={sleepTimerMinutes ? `Sleep: ${sleepTimerMinutes} min` : 'Sleep timer'}
              >
                <Timer className="w-4 h-4" />
                {sleepTimerMinutes && sleepTimerEndTime && (
                  <span className="absolute -top-1.5 -right-1.5 px-1 py-0.5 text-[9px] font-bold rounded-full bg-amber-500 text-white leading-none">
                    <SleepTimerCountdown endTime={sleepTimerEndTime} />
                  </span>
                )}
              </button>
              {showSleepMenu && <SleepTimerMenu setSleepTimer={setSleepTimer} sleepTimerMinutes={sleepTimerMinutes} sleepTimerEndTime={sleepTimerEndTime} onClose={() => setShowSleepMenu(false)} position="top" />}
            </div>

            {/* Close */}
            <button
              onClick={clearPlayer}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Close player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile: minimal right side */}
          <div className="flex sm:hidden items-center gap-1.5">
            {/* Sleep indicator */}
            {sleepTimerMinutes && sleepTimerEndTime && (
              <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 tabular-nums bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md">
                <SleepTimerCountdown endTime={sleepTimerEndTime} />
              </span>
            )}
            {/* Expand extra controls */}
            <button
              onClick={() => setShowMobileExtra(!showMobileExtra)}
              className={`p-1.5 rounded-lg transition-colors ${
                showMobileExtra
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="More controls"
            >
              <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${showMobileExtra ? 'rotate-180' : ''}`} />
            </button>
            <span className="text-[10px] tabular-nums text-gray-400 whitespace-nowrap">
              {formatTime(currentTime)}
            </span>
            <button
              onClick={clearPlayer}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Sleep Timer Dropdown Menu ───────────────────────────────────────────────

function SleepTimerMenu({
  setSleepTimer,
  sleepTimerMinutes,
  sleepTimerEndTime,
  onClose,
  position = 'top',
}: {
  setSleepTimer: (m: number | null) => void
  sleepTimerMinutes: number | null
  sleepTimerEndTime: number | null
  onClose: () => void
  position?: 'top' | 'bottom'
}) {
  return (
    <div
      className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} right-0 w-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200`}
    >
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <Moon className="w-4 h-4 text-amber-500" />
        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Sleep Timer
        </span>
      </div>

      {/* Active timer info */}
      {sleepTimerMinutes && sleepTimerEndTime && (
        <div className="px-3.5 py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
            Stopping in <SleepTimerCountdown endTime={sleepTimerEndTime} />
          </span>
          <button
            onClick={() => {
              setSleepTimer(null)
              onClose()
            }}
            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Options */}
      <div className="py-1">
        {SLEEP_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setSleepTimer(opt.value)
              onClose()
            }}
            className={`w-full px-3.5 py-2.5 text-left text-sm flex items-center justify-between transition-colors ${
              sleepTimerMinutes === opt.value
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <span>{opt.label}</span>
            {sleepTimerMinutes === opt.value && (
              <span className="text-xs text-indigo-500">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Off option */}
      {sleepTimerMinutes && (
        <div className="border-t border-gray-100 dark:border-gray-800 py-1">
          <button
            onClick={() => {
              setSleepTimer(null)
              onClose()
            }}
            className="w-full px-3.5 py-2.5 text-left text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Turn off timer
          </button>
        </div>
      )}
    </div>
  )
}
