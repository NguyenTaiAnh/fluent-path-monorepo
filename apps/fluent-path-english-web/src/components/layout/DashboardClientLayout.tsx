'use client'

import { DashboardSidebar } from './DashboardSidebar'
import { DashboardHeader } from './DashboardHeader'
import { useUIStore } from '@/store/useUIStore'
import { cn } from '@/lib/utils'

export function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useUIStore()

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
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
