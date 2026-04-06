import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// ─── Simple in-middleware rate limiter for auth endpoints ───
// Supabase auth calls go directly from client → Supabase, so we can't intercept those.
// But we can rate-limit our own API routes.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}

// Cleanup stale entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  const cleanupInterval = (globalThis as Record<string, unknown>).__rateLimitCleanup;
  if (!cleanupInterval) {
    (globalThis as Record<string, unknown>).__rateLimitCleanup = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of rateLimitMap) {
        if (now > entry.resetAt) rateLimitMap.delete(key);
      }
    }, 300_000);
  }
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    '127.0.0.1'
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getIp(request);

  // ─── Rate limiting for admin API routes: 60 req/min ───
  if (pathname.startsWith('/api/admin')) {
    if (isRateLimited(ip, 60, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }
  }

  // ─── Rate limiting for upload: 10 req/min ───
  if (pathname.startsWith('/api/upload')) {
    if (isRateLimited(`upload:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many uploads. Please wait.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }
  }

  // Update Supabase session first
  const response = await updateSession(request);

  // Protect admin UI routes (pages, not API)
  if (pathname.startsWith('/admin')) {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Use service role to bypass RLS for profile check
    const supabaseService = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: profile, error: profileError } = await supabaseService
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, create one with default role
    if (profileError && profileError.code === 'PGRST116') {
      await supabaseService.from('profiles').insert({
        id: user.id,
        role: 'user',
        full_name: user.user_metadata?.full_name || user.email,
      });
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
