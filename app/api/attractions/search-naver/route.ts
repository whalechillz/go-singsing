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

    try {
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
    } catch (naverError: any) {
      console.error('Naver API error:', naverError);
      
      // 네이버 API 키가 없는 경우 빈 결과 반환
      if (naverError.message === '네이버 API 인증 정보가 없습니다.') {
        return NextResponse.json({
          success: false,
          data: {
            local: [],
            blogs: [],
            images: [],
            extractedInfo: {},
          },
          error: '네이버 API 키가 설정되지 않았습니다. .env.local 파일에 NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET을 설정해주세요.',
          source: 'naver',
        });
      }
      
      throw naverError;
    }

  } catch (error) {
    console.error('Naver search error:', error);
    return NextResponse.json(
      { error: '네이버 검색 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}