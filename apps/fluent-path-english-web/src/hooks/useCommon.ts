/**
 * Common utility hooks
 *
 * useToggle       — boolean on/off
 * useDisclosure   — open/close/toggle (cho modal, drawer, dropdown)
 * useLocalStorage — persist state vào localStorage
 * useDebounce     — debounce value (cho search input)
 * usePrevious     — giữ giá trị trước đó
 */

import { useState, useCallback, useEffect, useRef } from 'react'

// ─── useToggle ────────────────────────────────────────────────────────────────

/**
 * Simple boolean toggle hook.
 * @example
 *   const [isDark, toggleDark] = useToggle(false)
 *   const [isDark, toggleDark, setIsDark] = useToggle(false)
 */
export function useToggle(initialValue = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initialValue)
  const toggle = useCallback(() => setValue((v) => !v), [])
  return [value, toggle, setValue]
}

// ─── useDisclosure ────────────────────────────────────────────────────────────

interface DisclosureReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

/**
 * Quản lý trạng thái open/close cho modal, dropdown, drawer.
 * @example
 *   const { isOpen, open, close } = useDisclosure()
 *   <Button onClick={open}>Open</Button>
 *   <Modal isOpen={isOpen} onClose={close} />
 */
export function useDisclosure(initialState = false): DisclosureReturn {
  const [isOpen, setIsOpen] = useState(initialState)
  return {
    isOpen,
    open: useCallback(() => setIsOpen(true), []),
    close: useCallback(() => setIsOpen(false), []),
    toggle: useCallback(() => setIsOpen((v) => !v), []),
  }
}

// ─── useLocalStorage ──────────────────────────────────────────────────────────

/**
 * useState nhưng persist vào localStorage.
 * @example
 *   const [theme, setTheme] = useLocalStorage('theme', 'light')
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn(`useLocalStorage: could not set "${key}"`, error)
      }
    },
    [key, storedValue],
  )

  return [storedValue, setValue]
}

// ─── useDebounce ──────────────────────────────────────────────────────────────

/**
 * Debounce một value — hữu ích cho search input.
 * @example
 *   const debouncedSearch = useDebounce(searchTerm, 400)
 *   useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

// ─── usePrevious ──────────────────────────────────────────────────────────────

/**
 * Giữ giá trị của state ở lần render trước.
 * @example
 *   const prevCount = usePrevious(count)
 */
export function usePrevious<T>(value: T): T | undefined {
  const [prev, setPrev] = useState<T | undefined>(undefined)
  const currentRef = useRef(value)
  useEffect(() => {
    setPrev(currentRef.current)
    currentRef.current = value
  }, [value])
  return prev
}

// ─── useMediaQuery ────────────────────────────────────────────────────────────

/**
 * Responsive breakpoint detection.
 * @example
 *   const isMobile = useMediaQuery('(max-width: 768px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })
  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}
