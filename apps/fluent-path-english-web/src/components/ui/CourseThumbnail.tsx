'use client'

import Image from 'next/image'
import { useState } from 'react'
import { BookOpen } from 'lucide-react'

/** Màu gradient fallback tự động dựa trên title của course */
const GRADIENT_PALETTES = [
  'from-indigo-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-rose-600',
  'from-violet-500 to-fuchsia-600',
  'from-amber-500 to-orange-600',
]

function getGradient(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return GRADIENT_PALETTES[Math.abs(hash) % GRADIENT_PALETTES.length]
}

interface CourseThumbnailProps {
  /** URL ảnh thumbnail từ DB */
  src?: string | null
  /** Tiêu đề khoá học — dùng để tạo gradient fallback và alt text */
  title: string
  /** Class cho wrapper div */
  className?: string
  /** Kích thước fill mode — mặc định true */
  fill?: boolean
}

/**
 * CourseThumbnail — Smart thumbnail component với 3 cấp fallback:
 * 1. Ảnh gốc từ src (nếu có và load thành công)
 * 2. Ảnh default từ /default-course-thumbnail.png (nếu ảnh gốc lỗi)
 * 3. Gradient placeholder với icon (nếu ảnh default cũng lỗi)
 */
export function CourseThumbnail({ src, title, className = '', fill = true }: CourseThumbnailProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(src ?? null)
  const [prevSrc, setPrevSrc] = useState<string | null | undefined>(src)
  const [errCount, setErrCount] = useState(0)
  const gradient = getGradient(title)

  // Derived state: reset when src prop changes (e.g. after thumbnail upload + refetch)
  if (src !== prevSrc) {
    setPrevSrc(src)
    setImgSrc(src ?? null)
    setErrCount(0)
  }

  const handleError = () => {
    if (errCount === 0 && imgSrc !== '/default-course-thumbnail.png') {
      // Fallback 1: use static default image
      setImgSrc('/default-course-thumbnail.png')
      setErrCount(1)
    } else {
      // Fallback 2: show gradient placeholder
      setImgSrc(null)
      setErrCount(2)
    }
  }

  // Gradient placeholder
  if (!imgSrc || errCount >= 2) {
    return (
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} flex flex-col items-center justify-center ${className}`}
      >
        <BookOpen className="w-12 h-12 text-white/60 mb-2" />
        <p className="text-white/70 text-xs font-medium text-center px-4 line-clamp-2">{title}</p>
      </div>
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={title}
      fill={fill}
      className={`object-cover group-hover:scale-105 transition-transform duration-500 ${className}`}
      onError={handleError}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}
