import { NextRequest, NextResponse } from 'next/server';
import { NaverApiClient } from '@/lib/naver-api-client';

export async function POST(request: NextRequest) {
  try {
    const { query, type = 'comprehensive' } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: '검색어가 필요합니다' },
        { status: 400 }
      );
    }

    const naverClient = new NaverApiClient();
    let results;

    switch (type) {
      case 'local':
        results = await naverClient.searchLocal(query);
        break;
      case 'blog':
        results = await naverClient.searchBlog(query);
        break;
      case 'image':
        results = await naverClient.searchImage(query);
        break;
      case 'comprehensive':
      default:
        results = await naverClient.searchComprehensive(query);
        break;
    }

    return NextResponse.json({
      success: true,
      data: results,
      source: 'naver',
    });

  } catch (error) {
    console.error('Naver search error:', error);
    return NextResponse.json(
      { error: '네이버 검색 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}