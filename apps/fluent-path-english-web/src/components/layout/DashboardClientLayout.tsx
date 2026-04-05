'use client'

import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'
import { AudioPlayer } from '../audio-player/AudioPlayer'
import { useUIStore } from '@/store/useUIStore'
import { useAudioPlayerStore } from '@/store/useAudioPlayerStore'
import { cn } from '@/lib/utils'

export function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useUIStore()
  const hasPlaylist = useAudioPlayerStore((s) => s.playlist.length > 0)

  return (
    <div>
      <DashboardSidebar />
      <div
        className={cn(
          'flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 transition-all duration-300',
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64',
        )}
      >
        <DashboardHeader />
        <main className={cn('py-10', hasPlaylist && 'pb-28')}>
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
      <AudioPlayer />
    </div>
  )
}

