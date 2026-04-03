// Audio state and action types
export interface AudioState {
  isPlaying: boolean
  progress: number
  duration: number
  currentTime: number
  hasError: boolean
  isLoading: boolean
  retryCount: number
  apiLoading: boolean // Separate API loading state
  playbackRate: number
  isLooping: boolean
}

export type AudioAction =
  | { type: 'PLAY_SUCCESS' }
  | { type: 'PLAY_ERROR' }
  | { type: 'PAUSE' }
  | { type: 'TIME_UPDATE'; payload: { currentTime: number; duration: number } }
  | { type: 'AUDIO_ENDED' }
  | { type: 'LOADING_START' }
  | { type: 'LOADING_SUCCESS' }
  | { type: 'LOADING_ERROR' }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'SIMULATION_START' }
  | {
      type: 'SIMULATION_PROGRESS'
      payload: { progress: number; currentTime: number; duration: number }
    }
  | { type: 'SIMULATION_END' }
  | { type: 'RETRY' }
  | { type: 'CONTINUE_ANYWAY' }
  | { type: 'MAX_RETRIES_REACHED' }
  | { type: 'API_LOADING_START' }
  | { type: 'API_LOADING_SUCCESS' }
  | { type: 'API_LOADING_ERROR' }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }
  | { type: 'TOGGLE_LOOP' }

export interface AudioControlsProps {
  audioRef: React.RefObject<HTMLAudioElement | null>
  audioState: AudioState
  dispatch: React.Dispatch<AudioAction>
  audioSrc: string
}

export interface ListeningSectionProps {
  speed: 'normal' | 'slow'
  lessonId: string
  partId: string
  contentUrl?: string | null
  pdfUrl?: string | null
  onComplete?: () => void
}
