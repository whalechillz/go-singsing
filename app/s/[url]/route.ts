// app/s/[url]/route.ts (새 파일)
// 공개 링크 페이지에 대한 캐시 정책 설정

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'No cache' },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}