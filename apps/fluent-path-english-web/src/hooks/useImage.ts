/**
 * useImage — Simple image error fallback hook
 *
 * Usage:
 *   const { src, onError } = useImage(url, '/default.png')
 *   <img src={src} onError={onError} />
 */
import { useState } from 'react'

interface UseImageReturn {
  src: string
  isError: boolean
  onError: () => void
}

export function useImage(
  originalSrc: string | null | undefined,
  fallbackSrc: string,
): UseImageReturn {
  // initializer function avoids setState-in-effect lint warning
  const [isError, setIsError] = useState<boolean>(() => !originalSrc)

  return {
    src: isError ? fallbackSrc : (originalSrc ?? fallbackSrc),
    isError,
    onError: () => setIsError(true),
  }
}
