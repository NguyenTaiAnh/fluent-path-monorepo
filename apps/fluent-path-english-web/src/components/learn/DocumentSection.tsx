'use client'
import React from 'react'
import { FileText, BookOpen } from 'lucide-react'
import { PdfViewer } from '@/components/ui/PdfViewer'

interface DocumentSectionProps {
  lessonId: string
  partId: string
  contentUrl?: string | null
  pdfUrl?: string | null // separate PDF URL (from lesson_media)
  title?: string
  onComplete?: () => void
}

/**
 * DocumentSection - Hiển thị bài học dạng đọc.
 * Nếu có PDF URL → hiện nút "Đọc Tapescript" mở PdfViewer popup.
 * Không còn embed iframe trong page → giao diện gọn hơn.
 */
export function DocumentSection({ contentUrl, pdfUrl, title, onComplete }: DocumentSectionProps) {
  // Resolve URL: ưu tiên pdfUrl, fallback contentUrl
  const resolvedUrl = pdfUrl ?? contentUrl ?? null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {title || 'Tapescript'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Đọc và đối chiếu với audio để cải thiện phát âm
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
        <div
          className="bg-linear-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20
          rounded-2xl p-8 border border-red-100 dark:border-red-800/30 max-w-md w-full"
        >
          <BookOpen className="w-14 h-14 text-red-400 dark:text-red-500 mx-auto mb-4" />

          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Tapescript bài học
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
            Click để xem nội dung bài học dạng văn bản. Đọc kèm theo audio giúp bạn hiểu rõ hơn và
            ghi nhớ từ vựng nhanh hơn.
          </p>

          {resolvedUrl ? (
            <PdfViewer
              url={resolvedUrl}
              title={title || 'Tapescript'}
              triggerLabel="📄 Đọc Tapescript"
              className="mx-auto"
            />
          ) : (
            <div className="text-sm text-gray-400 dark:text-gray-600 italic">
              Chưa có tài liệu cho bài học này.
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 max-w-sm">
          💡 Tip: Nghe audio trước, rồi mới đọc tapescript để kiểm tra bạn nghe được bao nhiêu.
        </p>
      </div>

      {/* Complete button */}
      {onComplete && (
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={onComplete}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold
              text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            Hoàn thành & Tiếp theo →
          </button>
        </div>
      )}
    </div>
  )
}
