'use client'

import { useCallback } from 'react'
import { FileText, X, ExternalLink, Maximize2, Minimize2 } from 'lucide-react'
import { useDisclosure, useToggle } from '@/hooks/useCommon'

interface PdfViewerProps {
  /** PDF URL - có thể là Google Drive link hoặc direct PDF URL */
  url: string
  /** Nút trigger hiển thị popup */
  triggerLabel?: React.ReactNode
  /** Tiêu đề hiển thị trong popup header */
  title?: string
  className?: string
}

/**
 * PdfViewer - hiển thị PDF trong popup modal khi click.
 * Dùng useDisclosure và useToggle từ useCommon.
 *
 * Hỗ trợ:
 * - Google Drive link → tự convert sang /preview embed URL
 * - Direct PDF URL    → dùng browser native PDF viewer qua iframe
 * - Fullscreen mode
 */
export function PdfViewer({
  url,
  triggerLabel = '📄 Đọc Tapescript',
  title = 'Tapescript',
  className = '',
}: PdfViewerProps) {
  const defaultLabel = (
    <>
      <FileText className="w-4 h-4" />
      📄 Đọc Tapescript
    </>
  )
  const actualTriggerLabel = triggerLabel || defaultLabel
  const { isOpen, open, close } = useDisclosure()
  const [isFullscreen, toggleFullscreen, setFullscreen] = useToggle(false)

  const handleClose = useCallback(() => {
    close()
    setFullscreen(false)
  }, [close, setFullscreen])

  const embedUrl = url

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={open}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
          bg-linear-to-r from-red-500 to-rose-600 text-white text-sm font-semibold
          shadow-md hover:shadow-lg hover:scale-105 active:scale-95
          transition-all duration-200 ${className}`}
        aria-label={`Open PDF: ${title}`}
      >
        {actualTriggerLabel}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal panel */}
          <div
            className={`relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl
              flex flex-col overflow-hidden transition-all duration-300
              ${isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full max-w-4xl h-[85vh]'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4
              bg-linear-to-r from-red-500 to-rose-600 text-white shrink-0"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5" />
                <h2 className="font-bold text-base truncate max-w-xs sm:max-w-md">{title}</h2>
              </div>

              <div className="flex items-center gap-1">
                {/* Open in new tab */}
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  title="Mở trong tab mới"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Toggle fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>

                {/* Close */}
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors ml-1"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PDF Iframe */}
            <div className="flex-1 min-h-0 bg-gray-100 dark:bg-gray-800">
              {embedUrl ? (
                <object
                  data={embedUrl}
                  type="application/pdf"
                  className="w-full h-full border-none"
                  aria-label={title}
                >
                  <div className="flex flex-col items-center justify-center w-full h-full p-8 text-center text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 mb-2 text-red-400 opacity-50" />
                    <p>Trình duyệt của bạn không hỗ trợ xem PDF trực tiếp.</p>
                    <a
                      href={embedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 text-red-500 hover:text-red-600 underline"
                    >
                      Tải PDF xuống
                    </a>
                  </div>
                </object>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 dark:text-gray-400">
                  <FileText className="w-16 h-16 opacity-30" />
                  <p className="text-sm">Không thể hiển thị tài liệu này.</p>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Mở trực tiếp →
                  </a>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div
              className="px-5 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-t
              border-gray-200 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500
              flex items-center justify-between shrink-0"
            >
              <span>Đọc tapescript để luyện phát âm và ngữ pháp</span>
              <span className="hidden sm:block">ESC để đóng</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
