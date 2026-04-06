import { NextResponse } from 'next/server'

/**
 * Simple in-memory rate limiter using sliding window.
 * For production with multiple instances, use Redis (@upstash/ratelimit).
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 })
 *   const result = limiter.check(ip)
 *   if (!result.allowed) return result.response
 */

interface RateLimitEntry {
  timestamps: number[]
}

interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number
  /** Max requests per window */
  maxRequests: number
  /** Message to return when rate limited */
  message?: string
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [, store] of stores) {
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < 600_000)
      if (entry.timestamps.length === 0) {
        store.delete(key)
      }
    }
  }
}, 300_000)

export function createRateLimiter(options: RateLimiterOptions) {
  const { windowMs, maxRequests, message = 'Too many requests. Please try again later.' } = options
  const storeId = `${windowMs}-${maxRequests}`

  if (!stores.has(storeId)) {
    stores.set(storeId, new Map())
  }
  const store = stores.get(storeId)!

  return {
    check(identifier: string): { allowed: boolean; response?: NextResponse } {
      const now = Date.now()
      const entry = store.get(identifier) || { timestamps: [] }

      // Remove timestamps outside the window
      entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs)

      if (entry.timestamps.length >= maxRequests) {
        const retryAfter = Math.ceil((entry.timestamps[0] + windowMs - now) / 1000)
        return {
          allowed: false,
          response: NextResponse.json(
            { error: message },
            {
              status: 429,
              headers: {
                'Retry-After': String(retryAfter),
                'X-RateLimit-Limit': String(maxRequests),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(Math.ceil((entry.timestamps[0] + windowMs) / 1000)),
              },
            },
          ),
        }
      }

      entry.timestamps.push(now)
      store.set(identifier, entry)

      return { allowed: true }
    },
  }
}

// ─── Pre-configured limiters ───

/** Auth endpoints: 5 attempts per minute */
export const authLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 5,
  message: 'Too many login/register attempts. Please wait 1 minute.',
})

/** API endpoints: 60 requests per minute */
export const apiLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 60,
})

/** Upload endpoints: 10 uploads per minute */
export const uploadLimiter = createRateLimiter({
  windowMs: 60_000,
  maxRequests: 10,
  message: 'Too many uploads. Please wait.',
})

/**
 * Extract client IP from request headers.
 * Works with Vercel, Cloudflare, and direct connections.
 */
export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers)
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    '127.0.0.1'
  )
}
