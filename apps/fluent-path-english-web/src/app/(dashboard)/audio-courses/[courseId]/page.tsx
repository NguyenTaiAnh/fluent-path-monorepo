'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useAudioPlayerStore, AudioTrack } from '@/store/useAudioPlayerStore'
import {
  ArrowLeft,
  Play,
  Pause,
  Music2,
  Clock,
  Disc3,
  Headphones,
} from 'lucide-react'

interface PlaylistResponse {
  courseId: string
  courseTitle: string
  thumbnailUrl: string | null
  totalTracks: number
  tracks: AudioTrack[]
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function CoursePlaylistPage({
  params: paramsPromise,
}: {
  params: Promise<{ courseId: string }>
}) {
  const params = React.use(paramsPromise)
  const { data, isLoading } = useSWR<PlaylistResponse>(
    `/api/courses/${params.courseId}/audio-playlist`,
    fetcher,
  )

  const {
    courseId: activeCourseId,
    currentTrackIndex,
    isPlaying,
    setPlaylist,
    playTrack,
    togglePlay,
  } = useAudioPlayerStore()

  const isThisCourseActive = activeCourseId === params.courseId

  const handlePlayAll = () => {
    if (!data) return
    if (isThisCourseActive) {
      togglePlay()
    } else {
      setPlaylist({
        courseId: data.courseId,
        courseTitle: data.courseTitle,
        courseThumbnail: data.thumbnailUrl,
        tracks: data.tracks,
        startIndex: 0,
      })
    }
  }

  const handlePlayTrack = (index: number) => {
    if (!data) return
    if (isThisCourseActive && currentTrackIndex === index) {
      togglePlay()
    } else if (isThisCourseActive) {
      playTrack(index)
    } else {
      setPlaylist({
        courseId: data.courseId,
        courseTitle: data.courseTitle,
        courseThumbnail: data.thumbnailUrl,
        tracks: data.tracks,
        startIndex: index,
      })
    }
  }

  const totalDuration = data?.tracks.reduce((acc, t) => acc + (t.duration || 0), 0) || 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/audio-courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Audio Library
      </Link>

      {isLoading ? (
        <div className="animate-pulse space-y-6">
          <div className="flex gap-6">
            <div className="w-48 h-48 bg-gray-200 dark:bg-gray-800 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-3 py-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-2/3" />
              <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/3" />
              <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-full w-36 mt-4" />
            </div>
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            ))}
          </div>
        </div>
      ) : !data ? (
        <div className="text-center py-20">
          <Music2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Could not load playlist.</p>
        </div>
      ) : (
        <>
          {/* Course Header */}
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            {/* Album Art */}
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-xl shrink-0 mx-auto sm:mx-0">
              <Image
                src={data.thumbnailUrl || '/default-course-thumbnail.png'}
                alt={data.courseTitle}
                fill
                className="object-cover"
                sizes="192px"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
            </div>

            {/* Course Info */}
            <div className="flex flex-col justify-center text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-1">
                Audio Course
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {data.courseTitle}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-5 justify-center sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Disc3 className="w-4 h-4" />
                  {data.totalTracks} tracks
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {Math.floor(totalDuration / 60)} min
                </span>
              </div>

              <button
                onClick={handlePlayAll}
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 mx-auto sm:mx-0 w-fit"
              >
                {isThisCourseActive && isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 ml-0.5" />
                    Play All
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Track List */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-[40px_1fr_100px] sm:grid-cols-[40px_1fr_200px_80px] items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <span className="text-center">#</span>
              <span>Title</span>
              <span className="hidden sm:block">Section</span>
              <span className="text-right">
                <Clock className="w-4 h-4 inline" />
              </span>
            </div>

            {/* Tracks */}
            {data.tracks.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Headphones className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No audio tracks found in this course.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {data.tracks.map((track, index) => {
                  const isCurrentTrack = isThisCourseActive && currentTrackIndex === index
                  const isTrackPlaying = isCurrentTrack && isPlaying

                  return (
                    <button
                      key={track.lessonId}
                      onClick={() => handlePlayTrack(index)}
                      className={`grid grid-cols-[40px_1fr_100px] sm:grid-cols-[40px_1fr_200px_80px] items-center px-4 py-3.5 w-full text-left transition-all duration-150 group ${
                        isCurrentTrack
                          ? 'bg-indigo-50/70 dark:bg-indigo-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      }`}
                    >
                      {/* Track number / play icon */}
                      <span className="text-center">
                        {isTrackPlaying ? (
                          <span className="inline-flex items-center gap-[2px]">
                            <span className="w-[3px] h-3 bg-indigo-500 rounded-full animate-[musicBar1_0.6s_ease-in-out_infinite]" />
                            <span className="w-[3px] h-4 bg-indigo-500 rounded-full animate-[musicBar2_0.6s_ease-in-out_0.2s_infinite]" />
                            <span className="w-[3px] h-2.5 bg-indigo-500 rounded-full animate-[musicBar3_0.6s_ease-in-out_0.4s_infinite]" />
                          </span>
                        ) : isCurrentTrack ? (
                          <Pause className="w-4 h-4 text-indigo-500 mx-auto" />
                        ) : (
                          <>
                            <span className="text-sm text-gray-400 group-hover:hidden">
                              {index + 1}
                            </span>
                            <Play className="w-4 h-4 text-gray-500 mx-auto hidden group-hover:block" />
                          </>
                        )}
                      </span>

                      {/* Title */}
                      <div className="min-w-0 pr-3">
                        <p
                          className={`text-sm font-medium truncate ${
                            isCurrentTrack
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {track.title}
                        </p>
                      </div>

                      {/* Section */}
                      <div className="hidden sm:block min-w-0 pr-3">
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {track.sectionTitle}
                        </p>
                      </div>

                      {/* Duration */}
                      <span className="text-sm text-gray-400 dark:text-gray-500 text-right tabular-nums">
                        {formatDuration(track.duration)}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
