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
          // No left padding on mobile (sidebar is a drawer overlay)
          // Only add padding on lg+ where sidebar is fixed
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64',
        )}
      >
        <DashboardHeader />
        <main
          className={cn(
            // Reduced top padding on mobile for more content space
            'flex-1 py-6 sm:py-10',
            // Extra bottom padding when audio player is visible
            hasPlaylist && 'pb-32 sm:pb-28',
          )}
        >
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
      <AudioPlayer />
    </div>
  )
}
