import { useEffect, useCallback, useRef } from 'react'
import { AudioState, AudioAction, AudioControlsProps } from '@/types/audio'

// Hook xử lý audio controls - tập trung và tối ưu
export const useAudioControls = ({
  audioRef,
  audioState,
  dispatch,
  audioSrc
}: AudioControlsProps) => {
  
  // Simulation function - chỉ tạo một lần
  const startSimulation = useCallback(() => {
    console.log('Bắt đầu simulation mode')
    dispatch({ type: 'SIMULATION_START' })
    
    let simulatedProgress = 0
    const interval = setInterval(() => {
      simulatedProgress += 33.33
      if (simulatedProgress >= 100) {
        dispatch({ 
          type: 'SIMULATION_PROGRESS',
          payload: { progress: 100, currentTime: 3, duration: 3 }
        })
        dispatch({ type: 'SIMULATION_END' })
        clearInterval(interval)
      } else {
        dispatch({ 
          type: 'SIMULATION_PROGRESS',
          payload: { progress: simulatedProgress, currentTime: simulatedProgress * 0.03, duration: 3 }
        })
      }
    }, 100)
  }, [dispatch])
  
  // Audio event handlers - tối ưu với proper dependencies
  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    
    dispatch({
      type: 'TIME_UPDATE',
      payload: {
        currentTime: audio.currentTime,
        duration: audio.duration
      }
    })
  }, [audioRef, dispatch])

  const handleEnded = useCallback(() => {
    dispatch({ type: 'AUDIO_ENDED' })
  }, [dispatch])

  const handleError = useCallback((e: Event) => {
    console.error('Audio loading error:', e)
    const audio = audioRef.current
    
    // Audio loading errors - hiển thị error ngay lập tức
    if (audio?.error) {
      const errorCode = audio.error.code
      console.log(`Audio load thất bại - error code: ${errorCode}`)
      dispatch({ type: 'LOADING_ERROR' })
    } else {
      console.log('Audio load thất bại - hiển thị error ngay')
      dispatch({ type: 'LOADING_ERROR' })
    }
  }, [audioRef, dispatch])

  const handleCanPlay = useCallback(() => {
    console.log('Audio load thành công')
    dispatch({ type: 'LOADING_SUCCESS' })
  }, [dispatch])

  const handleLoadStart = useCallback(() => {
    console.log('Bắt đầu load audio')
    dispatch({ type: 'LOADING_START' })
  }, [dispatch])

  // Setup audio event listeners - chỉ chạy một lần
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const events = [
      { event: 'timeupdate', handler: handleTimeUpdate },
      { event: 'loadedmetadata', handler: handleTimeUpdate },
      { event: 'ended', handler: handleEnded },
      { event: 'error', handler: handleError },
      { event: 'canplay', handler: handleCanPlay },
      { event: 'loadstart', handler: handleLoadStart }
    ]

    events.forEach(({ event, handler }) => {
      audio.addEventListener(event, handler)
    })

    audio.load()

    return () => {
      events.forEach(({ event, handler }) => {
        audio.removeEventListener(event, handler)
      })
    }
  }, [audioSrc, handleTimeUpdate, handleEnded, handleError, handleCanPlay, handleLoadStart])

  // Playback controls - đơn giản và hiệu quả
  const togglePlayPause = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audioState.isPlaying) {
      audio.pause()
      dispatch({ type: 'PAUSE' })
    } else {
      try {
        await audio.play()
        dispatch({ type: 'PLAY_SUCCESS' })
      } catch (err) {
        console.error('Audio play thất bại:', err)
        dispatch({ type: 'PLAY_ERROR' })
        
        // Fallback simulation
        if (!audio.src || audio.error) {
          startSimulation()
        }
      }
    }
  }, [audioRef, audioState.isPlaying, dispatch, startSimulation])

  const handleRewind = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, audio.currentTime - 10)
    }
  }, [audioRef])

  const handleForward = useCallback(() => {
    const audio = audioRef.current
    if (audio && isFinite(audio.duration)) {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 10)
    }
  }, [audioRef])

  const handleContinueAnyway = useCallback(() => {
    dispatch({ type: 'CONTINUE_ANYWAY' })
    startSimulation()
  }, [dispatch, startSimulation])

  // Return clean interface
  return {
    togglePlayPause,
    handleRewind,
    handleForward,
    handleContinueAnyway,
  }
}
