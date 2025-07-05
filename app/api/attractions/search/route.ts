import { NextRequest, NextResponse } from 'next/server';
import { getJson } from 'serpapi';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: '검색어를 입력해주세요' }, { status: 400 });
    }

    const searchParams = {
      api_key: process.env.SERPAPI_KEY,
      engine: 'google',
      q: query,
      location: 'South Korea',
      hl: 'ko',
      gl: 'kr',
      num: 10,
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
