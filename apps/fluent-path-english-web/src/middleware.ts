import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Update Supabase session first
  const response = await updateSession(request);

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
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
