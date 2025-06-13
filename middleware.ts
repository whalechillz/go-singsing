import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 로그인 페이지는 인증 없이 접근 가능
  if (req.nextUrl.pathname === '/login') {
    // 이미 로그인한 사용자는 홈으로 리다이렉트
    if (session) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return res;
  }

  // Admin 경로는 인증 필요
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // active_users 테이블에서 사용자 역할 확인
    let { data: profile } = await supabase
      .from('active_users')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single();

    // id로 찾지 못하면 email로 시도
    if (!profile) {
      const { data: profileByEmail } = await supabase
        .from('active_users')
        .select('role, is_active')
        .eq('email', session.user.email)
        .single();
      
      profile = profileByEmail;
    }

    // 활성화되지 않은 사용자는 접근 불가
    if (!profile?.is_active) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // 스탭과 고객은 admin 페이지 접근 불가
    if (profile?.role === 'staff' || profile?.role === 'customer') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
