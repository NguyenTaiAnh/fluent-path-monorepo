'use client'

import { ChartBarIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20 mb-6 group-hover:bg-indigo-100 transition-colors">
        <ChartBarIcon className="h-10 w-10 text-indigo-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Tính năng đang phát triển
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
        Trang Thống Kê (Analytics) bao gồm biểu đồ doanh thu, số lượng học viên hoàn thành bài học
        và tỉ lệ tương tác đang được xây dựng ở các phiên bản tiếp theo.
      </p>
      <Link href="/admin">
        <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
          Quay lại Bảng Điều Khiển
        </Button>
      </Link>
    </div>
  )
}
