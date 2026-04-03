import { useState, useCallback } from 'react'

export function usePagination(initialPageSize = 10) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const resetPage = useCallback(() => setPage(1), [])

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize)
    setPage(1) // Always bump back to page 1 to prevent getting stuck on empty pages
  }, [])

  return {
    page,
    setPage,
    pageSize,
    setPageSize: changePageSize,
    resetPage,
  }
}
