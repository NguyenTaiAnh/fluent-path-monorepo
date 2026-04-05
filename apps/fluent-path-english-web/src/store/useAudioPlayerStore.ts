import { create } from 'zustand'

export interface AudioTrack {
  lessonId: string
  title: string
  sectionTitle: string
  audioUrl: string
  duration: number | null
}

export type RepeatMode = 'off' | 'all' | 'one'

interface AudioPlayerState {
  // Playlist
  playlist: AudioTrack[]
  courseId: string | null
  courseTitle: string | null
  courseThumbnail: string | null

  // Playback
  currentTrackIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: number

  // Repeat & Shuffle
  repeatMode: RepeatMode // off → all → one
  isShuffle: boolean
  shuffleOrder: number[] // shuffled indices

  // Sleep timer
  sleepTimerMinutes: number | null // null = off, number = minutes
  sleepTimerEndTime: number | null // timestamp when timer expires

  // Actions
  setPlaylist: (params: {
    courseId: string
    courseTitle: string
    courseThumbnail: string | null
    tracks: AudioTrack[]
    startIndex?: number
  }) => void
  playTrack: (index: number) => void
  nextTrack: () => void
  prevTrack: () => void
  togglePlay: () => void
  setIsPlaying: (playing: boolean) => void
  setProgress: (currentTime: number, duration: number) => void
  setPlaybackRate: (rate: number) => void
  clearPlayer: () => void

  // New actions
  cycleRepeatMode: () => void
  toggleShuffle: () => void
  setSleepTimer: (minutes: number | null) => void
  checkSleepTimer: () => boolean // returns true if timer expired
}

function generateShuffleOrder(length: number, currentIndex: number): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  // Move current track to front so it doesn't restart
  const ciPos = indices.indexOf(currentIndex)
  if (ciPos > 0) {
    ;[indices[0], indices[ciPos]] = [indices[ciPos], indices[0]]
  }
  return indices
}

export const useAudioPlayerStore = create<AudioPlayerState>((set, get) => ({
  playlist: [],
  courseId: null,
  courseTitle: null,
  courseThumbnail: null,
  currentTrackIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  repeatMode: 'off',
  isShuffle: false,
  shuffleOrder: [],
  sleepTimerMinutes: null,
  sleepTimerEndTime: null,

  setPlaylist: ({ courseId, courseTitle, courseThumbnail, tracks, startIndex = 0 }) => {
    const { isShuffle } = get()
    set({
      courseId,
      courseTitle,
      courseThumbnail,
      playlist: tracks,
      currentTrackIndex: startIndex,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
      shuffleOrder: isShuffle ? generateShuffleOrder(tracks.length, startIndex) : [],
    })
  },

  playTrack: (index) => {
    const { playlist } = get()
    if (index >= 0 && index < playlist.length) {
      set({
        currentTrackIndex: index,
        isPlaying: true,
        currentTime: 0,
        duration: 0,
      })
    }
  },

  nextTrack: () => {
    const { currentTrackIndex, playlist, repeatMode, isShuffle, shuffleOrder } = get()

    // Repeat one: restart current track
    if (repeatMode === 'one') {
      set({ currentTime: 0, isPlaying: true })
      return
    }

    let nextIndex: number

    if (isShuffle && shuffleOrder.length > 0) {
      // Find current position in shuffle order
      const shufflePos = shuffleOrder.indexOf(currentTrackIndex)
      if (shufflePos < shuffleOrder.length - 1) {
        nextIndex = shuffleOrder[shufflePos + 1]
      } else if (repeatMode === 'all') {
        // Re-shuffle and start from beginning
        const newOrder = generateShuffleOrder(playlist.length, shuffleOrder[0])
        set({ shuffleOrder: newOrder })
        nextIndex = newOrder[0]
      } else {
        set({ isPlaying: false })
        return
      }
    } else {
      if (currentTrackIndex < playlist.length - 1) {
        nextIndex = currentTrackIndex + 1
      } else if (repeatMode === 'all') {
        nextIndex = 0
      } else {
        set({ isPlaying: false })
        return
      }
    }

    set({
      currentTrackIndex: nextIndex,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    })
  },

  prevTrack: () => {
    const { currentTrackIndex, currentTime, isShuffle, shuffleOrder, playlist, repeatMode } = get()
    // If more than 3s into track, restart
    if (currentTime > 3) {
      set({ currentTime: 0 })
      return
    }

    let prevIndex: number

    if (isShuffle && shuffleOrder.length > 0) {
      const shufflePos = shuffleOrder.indexOf(currentTrackIndex)
      if (shufflePos > 0) {
        prevIndex = shuffleOrder[shufflePos - 1]
      } else if (repeatMode === 'all') {
        prevIndex = shuffleOrder[shuffleOrder.length - 1]
      } else {
        return
      }
    } else {
      if (currentTrackIndex > 0) {
        prevIndex = currentTrackIndex - 1
      } else if (repeatMode === 'all') {
        prevIndex = playlist.length - 1
      } else {
        return
      }
    }

    set({
      currentTrackIndex: prevIndex,
      isPlaying: true,
      currentTime: 0,
      duration: 0,
    })
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setProgress: (currentTime, duration) =>
    set({
      currentTime,
      duration: isFinite(duration) ? duration : 0,
    }),

  setPlaybackRate: (rate) => set({ playbackRate: rate }),

  clearPlayer: () =>
    set({
      playlist: [],
      courseId: null,
      courseTitle: null,
      courseThumbnail: null,
      currentTrackIndex: 0,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      sleepTimerMinutes: null,
      sleepTimerEndTime: null,
    }),

  // Cycle: off → all → one → off
  cycleRepeatMode: () =>
    set((state) => {
      const modes: RepeatMode[] = ['off', 'all', 'one']
      const idx = modes.indexOf(state.repeatMode)
      return { repeatMode: modes[(idx + 1) % modes.length] }
    }),

  toggleShuffle: () => {
    const { isShuffle, playlist, currentTrackIndex } = get()
    if (!isShuffle) {
      set({
        isShuffle: true,
        shuffleOrder: generateShuffleOrder(playlist.length, currentTrackIndex),
      })
    } else {
      set({ isShuffle: false, shuffleOrder: [] })
    }
  },

  setSleepTimer: (minutes) => {
    if (minutes === null) {
      set({ sleepTimerMinutes: null, sleepTimerEndTime: null })
    } else {
      set({
        sleepTimerMinutes: minutes,
        sleepTimerEndTime: Date.now() + minutes * 60 * 1000,
      })
    }
  },

  checkSleepTimer: () => {
    const { sleepTimerEndTime } = get()
    if (sleepTimerEndTime && Date.now() >= sleepTimerEndTime) {
      set({
        isPlaying: false,
        sleepTimerMinutes: null,
        sleepTimerEndTime: null,
      })
      return true
    }
    return false
  },
}))
