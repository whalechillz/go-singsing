import { NextRequest, NextResponse } from 'next/server';
import { getJson } from 'serpapi';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: '검색어를 입력해주세요' }, { status: 400 });
    }
    
    // API 키 확인
    const serpapiKey = process.env.SERPAPI_KEY;
    if (!serpapiKey) {
      return NextResponse.json({ error: 'SERPAPI 키가 설정되지 않았습니다' }, { status: 500 });
    }

    const searchParams = {
      api_key: serpapiKey,
      engine: 'google',
      q: query,
      location: 'South Korea',
      hl: 'ko',
      gl: 'kr',
      num: 20,  // 검색 결과를 20개로 증가
    };

    const results = await getJson(searchParams);
    
    const formattedResults = results.organic_results?.map((result: any) => ({
      title: result.title,
      snippet: result.snippet,
      link: result.link,
      displayLink: result.displayed_link,
    })) || [];

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: '검색 중 오류가 발생했습니다' }, { status: 500 });
  }
}
