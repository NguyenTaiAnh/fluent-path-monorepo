import { useMemo } from 'react'

// Utility functions for audio
export const useAudioUtils = () => {
  const formatTime = useMemo(() => (time: number): string => {
    if (isNaN(time) || !isFinite(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  const getAudioSrc = useMemo(() => (
    contentUrl?: string, 
    speed?: 'normal' | 'slow', 
    partId?: string
  ): string => {
    return contentUrl || 
           `/api/audio/${speed === 'normal' ? 'normal' : 'slow'}/${partId}` || 
           'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
  }, [])

  const isFiniteNumber = (value: number): boolean => {
    return isFinite(value) && !isNaN(value)
  }

  return {
    formatTime,
    getAudioSrc,
    isFiniteNumber
  }
}
