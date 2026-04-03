'use client'

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
} from '@tanstack/react-table'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface ServerPagination {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  loading?: boolean
  pagination: ServerPagination
  skeletonRows?: number
}

/* ─── Skeleton Row ───────────────────────────────────────────────────────── */

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 rounded-md bg-gray-100 dark:bg-gray-800 animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

/* ─── Pagination Bar ─────────────────────────────────────────────────────── */

function PaginationBar({
  pagination,
  totalPages,
  isFetching,
}: {
  pagination: ServerPagination
  totalPages: number
  isFetching: boolean
}) {
  const { page, pageSize, total, onPageChange, onPageSizeChange } = pagination
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  /**
   * Always returns exactly 7 slots to avoid layout shift when navigating.
   * Early:  [1, 2, 3, 4, 5, …, N]
   * Middle: [1, …, p-1, p, p+1, …, N]
   * Late:   [1, …, N-4, N-3, N-2, N-1, N]
   */
  function getPages(p: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
    if (p <= 4) return [1, 2, 3, 4, 5, '…', total]
    if (p >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
    return [1, '…', p - 1, p, p + 1, '…', total]
  }

  const pages = getPages(page, totalPages)

  if (total === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
      {/* Left */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span className={isFetching ? 'opacity-50 transition-opacity' : ''}>
          <span className="font-medium text-gray-900 dark:text-white">{startItem}</span>–
          <span className="font-medium text-gray-900 dark:text-white">{endItem}</span> of{' '}
          <span className="font-medium text-gray-900 dark:text-white">{total}</span>
        </span>
        <label className="flex items-center gap-1.5 text-xs">
          <span className="text-gray-400">Rows per page</span>
          <select
            value={pageSize}
            disabled={isFetching}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value))
              onPageChange(1)
            }}
            className="h-7 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {[10, 20, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isFetching}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === '…' ? (
            <span
              key={`e-${i}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p as number)}
              disabled={isFetching}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                p === page
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isFetching}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

/* ─── DataTable ──────────────────────────────────────────────────────────── */

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  pagination,
  skeletonRows = 8,
}: DataTableProps<TData>) {
  const { page, pageSize, total } = pagination
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const paginationState: PaginationState = {
    pageIndex: page - 1, // TanStack is 0-indexed
    pageSize,
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { pagination: paginationState },
    pageCount: totalPages,
    manualPagination: true, // server-side pagination
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const next = updater(paginationState)
        if (next.pageIndex !== paginationState.pageIndex) {
          pagination.onPageChange(next.pageIndex + 1)
        }
        if (next.pageSize !== paginationState.pageSize) {
          pagination.onPageSizeChange(next.pageSize)
          pagination.onPageChange(1)
        }
      }
    },
  })

  const isFetching = loading && data.length > 0 // overlay mode when we have prior data
  const isInitialLoad = loading && data.length === 0

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          {/* Head */}
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          {/* Body */}
          <tbody
            className={`divide-y divide-gray-200 dark:divide-gray-800 transition-opacity duration-150 ${
              isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'
            }`}
          >
            {isInitialLoad ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationBar pagination={pagination} totalPages={totalPages} isFetching={isFetching} />
    </div>
  )
}
