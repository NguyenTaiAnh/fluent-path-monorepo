import { useActionState } from 'react'
import { AudioState, AudioAction } from '@/types/audio'

// Audio state reducer - đơn giản và tập trung
export function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    // Playback actions
    case 'PLAY_SUCCESS':
      return { ...state, isPlaying: true, hasError: false }
    case 'PLAY_ERROR':
      return { ...state, isPlaying: false }
    case 'PAUSE':
      return { ...state, isPlaying: false }

    // Progress tracking
    case 'TIME_UPDATE':
      return {
        ...state,
        currentTime: action.payload.currentTime,
        duration: isFinite(action.payload.duration) ? action.payload.duration : state.duration,
        progress:
          action.payload.duration > 0
            ? (action.payload.currentTime / action.payload.duration) * 100
            : state.progress,
      }
    case 'AUDIO_ENDED':
      return { ...state, isPlaying: false, progress: 100 }

    // Loading states
    case 'LOADING_START':
      return { ...state, isLoading: true, hasError: false }
    case 'LOADING_SUCCESS':
      return { ...state, isLoading: false, hasError: false, retryCount: 0 }
    case 'LOADING_ERROR':
      return {
        ...state,
        hasError: true,
        isLoading: false,
        duration: 180,
        currentTime: 0,
        progress: 0,
      }

    // Simulation states
    case 'SIMULATION_START':
      return { ...state, isPlaying: true, hasError: false }
    case 'SIMULATION_PROGRESS':
      return {
        ...state,
        progress: action.payload.progress,
        currentTime: action.payload.currentTime,
        duration: action.payload.duration,
      }
    case 'SIMULATION_END':
      return { ...state, isPlaying: false, progress: 100 }

    // API states
    case 'API_LOADING_START':
      return { ...state, apiLoading: true }
    case 'API_LOADING_SUCCESS':
      return { ...state, apiLoading: false }
    case 'API_LOADING_ERROR':
      return { ...state, apiLoading: false, hasError: true }

    // Playback settings
    case 'SET_PLAYBACK_RATE':
      return { ...state, playbackRate: action.payload }
    case 'TOGGLE_LOOP':
      return { ...state, isLooping: !state.isLooping }

    default:
      return state
  }
}

// Hook khởi tạo audio state với default values
export function useAudioState(initialState: Partial<AudioState> = {}) {
  const defaultState: AudioState = {
    isPlaying: false,
    progress: 0,
    duration: 0,
    currentTime: 0,
    hasError: false,
    isLoading: false, // Chỉ loading khi cần thiết
    retryCount: 0,
    apiLoading: false,
    playbackRate: 1.0,
    isLooping: false,
    ...initialState,
  }

  return useActionState(audioReducer, defaultState)
}
