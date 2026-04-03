import useSWR from 'swr'
import { useState, useCallback, useRef } from 'react'

/* ─── Fetcher ────────────────────────────────────────────────────────────── */

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Fetch failed')
  return res.json()
}

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface AdminTableResult<T> {
  data: T[]
  total: number
  loading: boolean // true only on first load (no cached data yet)
  isFetching: boolean // true on every background refetch
  page: number
  pageSize: number
  setPage: (p: number) => void
  setPageSize: (s: number) => void
  search: string
  setSearch: (s: string) => void
  filters: Record<string, string>
  setFilter: (key: string, value: string) => void
  refresh: () => void
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

/**
 * Generic admin table hook using SWR.
 * Handles server-side pagination, search debounce, and arbitrary filters.
 *
 * @param endpoint  - API base path, e.g. '/api/admin/lessons'
 * @param initialPageSize - default page size (default: 10)
 */
export function useAdminTable<T>(endpoint: string, initialPageSize = 10): AdminTableResult<T> {
  const [page, setPageRaw] = useState(1)
  const [pageSize, setPageSizeRaw] = useState(initialPageSize)
  const [search, setSearchRaw] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Build query string
  const params = new URLSearchParams()
  params.set('page', page.toString())
  params.set('pageSize', pageSize.toString())
  if (debouncedSearch) params.set('search', debouncedSearch)
  Object.entries(filters).forEach(([k, v]) => {
    if (v && v !== 'all') params.set(k, v)
  })

  const url = `${endpoint}?${params}`

  const {
    data: json,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<{
    success: boolean
    data: T[]
    total: number
  }>(url, fetcher, {
    keepPreviousData: true, // ← This is the key: keeps old data while fetching new
    revalidateOnFocus: false,
  })

  // Search: debounce 300ms + reset page
  const setSearch = useCallback((value: string) => {
    setSearchRaw(value)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPageRaw(1) // reset to page 1 on new search
    }, 300)
  }, [])

  // Page change: immediate (no debounce)
  const setPage = useCallback((p: number) => {
    setPageRaw(p)
  }, [])

  // Page size: reset to page 1
  const setPageSize = useCallback((s: number) => {
    setPageSizeRaw(s)
    setPageRaw(1)
  }, [])

  // Filters: reset page
  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPageRaw(1)
  }, [])

  return {
    data: json?.data ?? [],
    total: json?.total ?? 0,
    loading: isLoading, // no cached data at all
    isFetching: isValidating && !isLoading, // has cached data, fetching update
    page,
    pageSize,
    setPage,
    setPageSize,
    search,
    setSearch,
    filters,
    setFilter,
    refresh: () => mutate(),
  }
}
