import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { name, searchResults } = await request.json();
    
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

위 정보를 바탕으로 "${name}"에 대한 매력적이고 정확한 설명을 작성해주세요.
또한 이 장소와 관련된 핵심 키워드들을 추출해주세요.

응답 형식:
{
  "description": "상세하고 매력적인 설명 (200-300자)",
  "keywords": ["키워드1", "키워드2", ...] (5-10개)
}
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 1000,
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
          description: parsed.description,
          keywords: parsed.keywords,
          model: 'claude-3-opus',
        });
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트로 처리
        return NextResponse.json({
          description: content.text,
          keywords: [],
          model: 'claude-3-opus',
        });
      }
    }

    return NextResponse.json({ error: '콘텐츠 생성 실패' }, { status: 500 });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json({ error: '콘텐츠 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
}
