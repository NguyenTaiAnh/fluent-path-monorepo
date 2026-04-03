'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Play, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { MediaError } from './MediaError'

interface VideoSectionProps {
  lessonId: string
  partId: string
  contentUrl: string
  onComplete?: () => void
}

export function VideoSection({ contentUrl, onComplete }: VideoSectionProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      setIsLoading(false)
      setHasError(false)
    }

    const handleError = () => {
      setHasError(true)
      setIsLoading(false)
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setHasError(false)
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('loadstart', handleLoadStart)

    video.load()

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadstart', handleLoadStart)
    }
  }, [contentUrl])

  const handleRetry = () => {
    setHasError(false)
    setIsLoading(true)
    if (videoRef.current) {
      videoRef.current.load()
    }
  }

  const handleContinueAnyway = () => {
    setHasError(false)
    if (onComplete) {
      onComplete()
    }
  }

  // Show error state if video failed to load
  if (hasError) {
    return (
      <MediaError 
        type="video"
        onRetry={handleRetry}
        onContinue={handleContinueAnyway}
        title="Video Loading Failed"
        message="The video file for this lesson could not be loaded. You can try again or continue to the next section."
      />
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 h-full flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading video...</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      <div className="aspect-video bg-black flex items-center justify-center relative group">
        <video 
          ref={videoRef}
          src={contentUrl} 
          controls 
          className="w-full h-full"
          poster="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"
        />
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold dark:text-gray-100">Video Lesson</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Watch and study with teacher AJ Hoge</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-blue-800 dark:text-blue-300 text-sm">
            <strong>Tip:</strong> You can adjust the playback speed in the video controls to practice listening at your own pace.
          </p>
        </div>

        {onComplete && (
          <div className="mt-6 flex justify-end">
            <button 
              onClick={onComplete}
              className="rounded-md bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Mark Complete & Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
