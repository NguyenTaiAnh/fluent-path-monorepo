import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createServiceClient } from '@/utils/supabase/service'

/**
 * Verify the request is from an authenticated admin user.
 * Returns { user, supabase } on success, or a NextResponse error on failure.
 */
export async function requireAdmin(): Promise<
  | { user: { id: string; email?: string }; supabase: ReturnType<typeof createServiceClient>; error?: never }
  | { error: NextResponse; user?: never; supabase?: never }
> {
  try {
    const userClient = await createClient()
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser()

    if (authError || !user) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }

    // Check admin role via service client (bypasses RLS)
    const serviceClient = createServiceClient()
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return { error: NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 }) }
    }

    return { user, supabase: serviceClient }
  } catch {
    return { error: NextResponse.json({ error: 'Authentication failed' }, { status: 500 }) }
  }
}

/**
 * Verify the request is from an authenticated user (any role).
 * Returns { user } on success, or a NextResponse error on failure.
 */
export async function requireAuth(): Promise<
  | { user: { id: string; email?: string }; error?: never }
  | { error: NextResponse; user?: never }
> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }

    return { user }
  } catch {
    return { error: NextResponse.json({ error: 'Authentication failed' }, { status: 500 }) }
  }
}

/**
 * Escape PostgreSQL LIKE/ILIKE special characters from user input.
 * Prevents wildcard injection (%, _) in search queries.
 */
export function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, '\\$&')
}
