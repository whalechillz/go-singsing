// 임시로 미들웨어 비활성화
// 페이지 레벨에서 보호하는 방식으로 전환

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // 모든 요청 통과
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
