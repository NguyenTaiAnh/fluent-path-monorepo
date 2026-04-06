'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { AlignLeft, Eye, EyeOff } from 'lucide-react'

interface TranscriptSegment {
  start: number
  end: number
  text: string
}

interface TranscriptKaraokeProps {
  /** The lesson part ID — used to fetch transcript from API */
  partId: string
  /** Current playback time in seconds from the audio player */
  currentTime: number
  /** Whether audio is currently playing */
  isPlaying: boolean
}

export function TranscriptKaraoke({ partId, currentTime, isPlaying }: TranscriptKaraokeProps) {
  const { data, isLoading } = useSWR<{
    mediaId: string
    title: string
    transcript: TranscriptSegment[]
  }>(`/api/transcript/${partId}`, fetcher)

  const [showTranscript, setShowTranscript] = useState(true)
  const activeRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const transcript = data?.transcript || []

  // Find the active segment index
  const activeIndex = transcript.findIndex(
    (seg) => currentTime >= seg.start && currentTime <= seg.end,
  )

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeRef.current && containerRef.current && isPlaying && activeIndex >= 0) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [activeIndex, isPlaying])

  // Click a segment to seek (emit via custom event)
  const handleSegmentClick = useCallback(
    (seg: TranscriptSegment) => {
      window.dispatchEvent(
        new CustomEvent('transcript-seek', { detail: { time: seg.start } }),
      )
    },
    [],
  )

  // No transcript data
  if (!isLoading && transcript.length === 0) {
    return null // Don't render anything if no transcript available
  }

  return (
    <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 text-sm">
          <AlignLeft className="w-4 h-4 text-indigo-500" />
          Transcript Sync
          {transcript.length > 0 && (
            <span className="text-xs text-gray-400 font-normal">
              ({transcript.length} segments)
            </span>
          )}
        </h3>
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
        >
          {showTranscript ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              Hide
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              Show
            </>
          )}
        </button>
      </div>

      {/* Transcript Body */}
      {showTranscript && (
        <div
          ref={containerRef}
          className="p-5 max-h-[400px] overflow-y-auto scroll-smooth space-y-1"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#6366f1 transparent',
          }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
              <span className="ml-3 text-sm text-gray-500">Loading transcript...</span>
            </div>
          ) : (
            transcript.map((seg, index) => {
              const isActive = index === activeIndex
              const isPast = activeIndex >= 0 && index < activeIndex

              return (
                <div
                  key={index}
                  ref={isActive ? activeRef : undefined}
                  onClick={() => handleSegmentClick(seg)}
                  className={`
                    group relative px-4 py-2.5 rounded-xl cursor-pointer
                    transition-all duration-300 ease-out
                    ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 scale-[1.01] shadow-sm'
                        : isPast
                          ? 'opacity-50'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full animate-pulse" />
                  )}

                  <p
                    className={`
                      text-base leading-relaxed transition-all duration-300
                      ${
                        isActive
                          ? 'text-indigo-700 dark:text-indigo-300 font-semibold'
                          : isPast
                            ? 'text-gray-400 dark:text-gray-600'
                            : 'text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    {seg.text}
                  </p>

                  {/* Timestamp badge */}
                  <span
                    className={`
                      absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tabular-nums
                      transition-opacity duration-200
                      ${
                        isActive
                          ? 'text-indigo-400 opacity-100'
                          : 'text-gray-300 dark:text-gray-700 opacity-0 group-hover:opacity-100'
                      }
                    `}
                  >
                    {formatTime(seg.start)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
