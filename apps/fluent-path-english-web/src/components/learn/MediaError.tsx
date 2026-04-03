'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

interface MediaErrorProps {
  type: 'audio' | 'video' | 'document' | 'general'
  onRetry?: () => void
  onContinue?: () => void
  title?: string
  message?: string
}

export function MediaError({ type, onRetry, onContinue, title, message }: MediaErrorProps) {
  const getErrorInfo = () => {
    switch (type) {
      case 'audio':
        return {
          title: title || 'Audio Loading Error',
          message:
            message ||
            'The audio file could not be loaded. This might be due to a missing file or network issue.',
          icon: AlertTriangle,
        }
      case 'video':
        return {
          title: title || 'Video Loading Error',
          message:
            message || 'The video file could not be loaded. Please check your internet connection.',
          icon: AlertTriangle,
        }
      case 'document':
        return {
          title: title || 'Document Loading Error',
          message:
            message || 'The document could not be loaded. The file might be missing or corrupted.',
          icon: AlertTriangle,
        }
      default:
        return {
          title: title || 'Loading Error',
          message: message || 'The content could not be loaded. Please try again.',
          icon: AlertTriangle,
        }
    }
  }

  const errorInfo = getErrorInfo()
  const Icon = errorInfo.icon

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 p-8 h-full flex flex-col justify-center items-center text-center">
      <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-4 mb-6">
        <Icon className="h-8 w-8 text-red-600 dark:text-red-400" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {errorInfo.title}
      </h2>

      <p className="text-gray-600 dark:text-gray-400 max-w-lg mb-8 text-lg">{errorInfo.message}</p>

      <div className="flex gap-4 flex-wrap justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}

        {onContinue && (
          <button
            onClick={onContinue}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-500 transition-colors"
          >
            Continue Anyway
          </button>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-500 dark:text-gray-500">
        If this problem persists, please contact support or check your internet connection.
      </div>
    </div>
  )
}
