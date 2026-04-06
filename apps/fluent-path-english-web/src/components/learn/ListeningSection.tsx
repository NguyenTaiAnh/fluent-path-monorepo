'use client'

import { useRef, useEffect, useCallback, useMemo } from 'react'
import { Play, Pause, FastForward, Rewind, Download, FileText, Maximize } from 'lucide-react'
import { useLessonStore } from '@/store/useLessonStore'
import { MediaError } from './MediaError'
import { useAudioState } from '@/hooks/audio/useAudioState'
import { useAudioUtils } from '@/utils/audio'
import { useAudioControls } from '@/hooks/audio/useAudioControls'
import { ListeningSectionProps } from '@/types/audio'
import { PdfViewer } from '../ui/PdfViewer'
import { TranscriptKaraoke } from './TranscriptKaraoke'
import { useDictionary } from '@/i18n/DictionaryProvider'

export function ListeningSection({
  speed,
  lessonId,
  partId,
  contentUrl,
  pdfUrl,
  courseId,
  onComplete,
}: ListeningSectionProps) {
  const isPimsleur = courseId === '29423c2e-3da5-4ad0-a640-cd23f3260114'
  const audioRef = useRef<HTMLAudioElement>(null)
  const { markSectionComplete, completedSections } = useLessonStore()
  const isCompleted = completedSections[`${lessonId}_${partId}`]
  const { formatTime, getAudioSrc } = useAudioUtils()
  const [audioState, dispatch] = useAudioState()
  const dict = useDictionary()
  const t = dict?.learning || {}

  const audioSrc = useMemo(
    () => getAudioSrc(contentUrl || undefined, speed, partId),
    [getAudioSrc, contentUrl, speed, partId],
  )

  const { togglePlayPause, handleRewind, handleForward, handleContinueAnyway } = useAudioControls({
    audioRef,
    audioState,
    dispatch,
    audioSrc,
  })

  const handleComplete = useCallback(() => {
    if (!isCompleted) {
      markSectionComplete(lessonId, partId)
    }
    onComplete?.()
  }, [markSectionComplete, lessonId, partId, onComplete, isCompleted])

  const handleContinueAnywayWithSimulation = useCallback(() => {
    handleContinueAnyway()
    setTimeout(handleComplete, 3000)
  }, [handleContinueAnyway, handleComplete])

  // API loading effect
  useEffect(() => {
    if (!contentUrl) {
      const fetchAudioUrl = async () => {
        dispatch({ type: 'API_LOADING_START' })
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          dispatch({ type: 'API_LOADING_SUCCESS' })
        } catch (error) {
          console.error('API call failed:', error)
          dispatch({ type: 'API_LOADING_ERROR' })
        }
      }
      fetchAudioUrl()
    }
  }, [contentUrl, dispatch])

  // Apply playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = audioState.playbackRate
    }
  }, [audioState.playbackRate, audioRef])

  // Listen for transcript seek events (when user clicks a transcript segment)
  useEffect(() => {
    const handleSeek = (e: Event) => {
      const time = (e as CustomEvent).detail?.time
      if (audioRef.current && typeof time === 'number') {
        audioRef.current.currentTime = time
        if (!audioState.isPlaying) {
          audioRef.current.play().catch(() => {})
        }
      }
    }
    window.addEventListener('transcript-seek', handleSeek)
    return () => window.removeEventListener('transcript-seek', handleSeek)
  }, [audioState.isPlaying])

  const toggleLoop = useCallback(() => {
    dispatch({ type: 'TOGGLE_LOOP' })
  }, [dispatch])

  const cycleSpeed = useCallback(() => {
    const speeds = [0.5, 1, 1.25, 1.5, 2]
    const currentIndex = speeds.indexOf(audioState.playbackRate)
    const nextIndex = (currentIndex + 1) % speeds.length
    dispatch({ type: 'SET_PLAYBACK_RATE', payload: speeds[nextIndex] })
  }, [audioState.playbackRate, dispatch])

  // ─── Render: prioritize error → loading → player (only ONE at a time) ───
  if (audioState.hasError) {
    const errorMessage = audioState.apiLoading
      ? 'Failed to load audio data from server. Please try again later.'
      : 'The audio file could not be loaded. It may not be uploaded yet, or your session has expired (Error 401/404).'

    return (
      <MediaError
        type="audio"
        onRetry={audioState.apiLoading ? handleContinueAnywayWithSimulation : undefined}
        onContinue={handleContinueAnywayWithSimulation}
        title={audioState.apiLoading ? 'API Loading Failed' : 'Audio Loading Failed'}
        message={errorMessage}
      />
    )
  }

  if (audioState.apiLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 h-full flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">Loading audio data...</p>
      </div>
    )
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col min-h-fit"
      data-section-id={partId}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} src={audioSrc} preload="metadata" loop={audioState.isLooping} />

      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {t.listen_practice || 'Listening Practice'} ({speed === 'normal' ? t.normal_speed || 'Normal' : t.slow_speed || 'Slow'})
        </h2>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
          {t.listen_desc || 'Listen carefully to the audio and follow along with the transcript below.'}
        </p>
      </div>

      {/* Main content - Centered Stacked Layout */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-10 mt-4 w-full max-w-5xl mx-auto">
        {/* Audio Player UI */}
        <div className="w-full max-w-md bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-3xl sm:rounded-4xl border border-gray-100 dark:border-gray-800 flex flex-col items-center space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
          {/* Control buttons */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 w-full">
            <button
              onClick={handleRewind}
              className="p-2 sm:p-3 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="Rewind 10 seconds"
            >
              <Rewind className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-3 sm:p-4 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 shrink-0"
              aria-label={audioState.isPlaying ? 'Pause' : 'Play'}
            >
              {audioState.isPlaying ? (
                <Pause className="h-6 w-6 sm:h-8 sm:w-8" />
              ) : (
                <Play className="h-6 w-6 sm:h-8 sm:w-8 ml-1 sm:ml-2" />
              )}
            </button>

            <button
              onClick={handleForward}
              className="p-2 sm:p-3 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-label="Forward 10 seconds"
            >
              <FastForward className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>

          {/* Progress bar */}
          {/* <div className="w-full space-y-3 px-2">
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-full cursor-pointer relative">
              <div
                className="h-full bg-indigo-600 transition-all duration-300 relative"
                style={{ width: `${audioState.progress}%` }}
                aria-label={`Audio progress: ${Math.round(audioState.progress)}%`}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-400 border-b border-gray-50 dark:border-gray-800/50 pb-4">
              <span>{formatTime(audioState.currentTime)}</span>
              <span>{formatTime(audioState.duration)}</span>
            </div>
          </div> */}

          {/* Progress bar (Moved up) */}
          <div className="w-full space-y-2 px-1">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-full">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${audioState.progress}%` }}
                aria-label={`Audio progress: ${Math.round(audioState.progress)}%`}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-400 dark:text-gray-500">
              <span>{formatTime(audioState.currentTime)}</span>
              <span>{formatTime(audioState.duration)}</span>
            </div>
          </div>

          {/* Extra controls (Speed & Loop) - Centered nicely */}
          <div className="flex items-center justify-center gap-3 w-full pt-1">
            <button
              onClick={cycleSpeed}
              className="flex items-center justify-center px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-full hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 transition-colors"
              aria-label="Change playback speed"
            >
              {t.speed || 'Speed'} {audioState.playbackRate}x
            </button>
            <button
              onClick={toggleLoop}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                audioState.isLooping
                  ? 'text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-900/30'
                  : 'text-gray-500 bg-gray-50 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700'
              }`}
              aria-label="Toggle loop"
              title={t.loop || 'Loop'}
            >
              {t.loop || 'Loop'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m17 2 4 4-4 4" />
                <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                <path d="m7 22-4-4 4-4" />
                <path d="M21 13v1a4 4 0 0 1-4 4H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Karaoke Transcript Sync */}
        {!isPimsleur && (
          <TranscriptKaraoke
            partId={partId}
            currentTime={audioState.currentTime}
            isPlaying={audioState.isPlaying}
          />
        )}

        {/* Transcript / PDF Area */}
        {isPimsleur ? (
          <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden shadow-sm h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/30 gap-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                {t.lesson_document || 'Lesson Document'}
              </h3>
              <div className="flex items-center gap-3">
                {contentUrl && (
                  <a
                    href={contentUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-400 dark:hover:bg-indigo-900/60 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Audio</span>
                  </a>
                )}
                {pdfUrl && (
                  <>
                    <a
                      href={pdfUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </a>
                    <PdfViewer
                      url={pdfUrl}
                      title={t.lesson_document || 'Lesson Document'}
                      triggerLabel={<Maximize className="w-4 h-4" />}
                      className="p-2! rounded-lg! bg-gray-100! text-gray-600! shadow-none! hover:bg-gray-200! dark:bg-gray-800! dark:text-gray-400! dark:hover:bg-gray-700! dark:hover:text-gray-300! from-transparent! to-transparent! transition-colors"
                    />
                  </>
                )}
              </div>
            </div>

            <div
              className={`w-full bg-[#525659] dark:bg-gray-800 relative flex items-center justify-center overflow-auto h-full`}
            >
              {pdfUrl ? (
                <iframe
                  src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-none"
                  title="Lesson PDF Transcript"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                    <FileText className="w-8 h-8 opacity-50 text-gray-500" />
                  </div>
                  <p className="text-sm font-medium">{t.no_pdf || 'No PDF available for this lesson'}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Popup-based PDF viewer for lessons WITH transcript karaoke */
          pdfUrl && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-3xl">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl shrink-0">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {t.lesson_document || 'Lesson Document'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.pdf_desc || 'PDF transcript and exercise files'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                {contentUrl && (
                  <a
                    href={contentUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t.audio || 'Audio'}</span>
                  </a>
                )}
                {pdfUrl && (
                  <>
                    <a
                      href={pdfUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t.pdf || 'PDF'}
                    </a>
                    <div className="flex items-center justify-center flex-1 sm:flex-none">
                      <PdfViewer
                        url={pdfUrl}
                        title={t.lesson_document || 'Lesson Document'}
                        triggerLabel={<Maximize className="w-4 h-4" />}
                        className="px-4! py-2! sm:p-2.5! h-full! w-full! sm:w-auto! flex! items-center! justify-center! rounded-lg! bg-gray-100! text-gray-600! shadow-none! hover:bg-gray-200! dark:bg-gray-800! dark:text-gray-400! dark:hover:bg-gray-700! from-transparent! to-transparent! transition-colors"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* Complete button */}
      <div className="mt-8 flex sm:justify-end w-full">
        <button
          onClick={handleComplete}
          className={`w-full sm:w-auto rounded-full px-8 py-3.5 sm:py-3 text-sm font-bold shadow-md transition-all ${
            isCompleted
              ? 'bg-emerald-500 text-white hover:bg-emerald-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {isCompleted ? t.completed_next || '✓ Completed • Next Part' : t.complete_next || 'Complete & Next ➔'}
        </button>
      </div>
    </div>
  )
}
