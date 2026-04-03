import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Docs — Swagger UI',
}

/**
 * Isolated layout for /api-docs — overrides body background
 * and hides the dashboard/auth layout wrappers.
 */
export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', margin: 0, padding: 0 }}>
      {children}
    </div>
  )
}
