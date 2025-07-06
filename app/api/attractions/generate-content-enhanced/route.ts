import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    // API 키 확인
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Anthropic API 키가 설정되지 않았습니다' }, { status: 500 });
    }
    
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });
    const { name, searchResults, category } = await request.json();
    
    if (!name || !searchResults || searchResults.length === 0) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다' }, { status: 400 });
    }

    const prompt = `
다음은 "${name}"에 대한 검색 결과입니다:

${searchResults.map((result: any, index: number) => `
[${index + 1}] ${result.title}
${result.snippet}
출처: ${result.link}
`).join('\n')}

위 정보를 바탕으로 "${name}"에 대한 상세 정보를 추출하고 생성해주세요.
카테고리: ${category}

다음 JSON 형식으로 응답해주세요:
{
  "description": "매력적이고 정확한 설명 (200-300자)",
  "keywords": ["키워드1", "키워드2", ...] (5-10개),
  "address": "정확한 주소 (찾을 수 있다면)",
  "phone": "전화번호 (찾을 수 있다면)",
  "operating_hours": "운영시간 (예: 09:00-18:00, 연중무휴)",
  "parking_info": "주차 정보",
  "entrance_fee": "입장료 정보 (무료/유료 및 금액)",
  "features": ["특징1", "특징2", ...] (3-5개),
  "region": "지역명 (예: 서울, 부산, 제주 등)",
  "recommended_duration": 추천 체류시간(분 단위, 숫자만),
  "best_season": "추천 방문 시기",
  "nearby_attractions": ["근처 관광지1", "근처 관광지2"] (있다면)
}

검색 결과에서 찾을 수 없는 정보는 합리적으로 추론하거나 null로 표시하세요.
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        }
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      try {
        const parsed = JSON.parse(content.text);
        return NextResponse.json({
          ...parsed,
          model: 'claude-3-opus',
        });
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        return NextResponse.json({
          description: content.text,
          keywords: [],
          model: 'claude-3-opus',
        });
      }
    }

    return NextResponse.json({ error: '콘텐츠 생성 실패' }, { status: 500 });
  } catch (error) {
    console.error('Enhanced content generation error:', error);
    return NextResponse.json({ error: '콘텐츠 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
}
