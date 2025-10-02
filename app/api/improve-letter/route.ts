import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API 키가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const {
      originalContent,
      improvementRequest,
      occasion,
      golfCourseName,
      contactName
    } = await request.json();

    console.log('🤖 손편지 AI 개선 요청:', {
      occasion,
      golfCourseName,
      contactName,
      improvementRequest,
      originalLength: originalContent?.length || 0
    });

    if (!originalContent || !improvementRequest) {
      return NextResponse.json(
        { error: '원본 내용과 개선 요청사항이 필요합니다.' },
        { status: 400 }
      );
    }

    // 싱싱골프투어에 특화된 프롬프트
    const prompt = `당신은 싱싱골프투어의 전문적인 손편지 작성 전문가입니다.

**골프장 정보:** ${golfCourseName}
**담당자:** ${contactName}
**발송 사유:** ${occasion}
**원본 내용:** ${originalContent}
**개선 요청사항:** ${improvementRequest}

**작업 지침:**
1. 싱싱골프투어의 브랜드 톤앤매너를 유지하세요 (친근하고 전문적)
2. 골프장과의 파트너십을 강조하세요
3. 감사와 존중의 마음을 담아 작성하세요
4. 자연스럽고 따뜻한 문체로 작성하세요
5. 한국어로 작성하되, 정중하고 예의바른 표현을 사용하세요
6. 적절한 길이로 작성하세요 (너무 길지도 짧지도 않게)
7. 구체적인 감사 표현과 앞으로의 협력 의지를 포함하세요

**개선된 손편지 내용을 작성해주세요:**`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 싱싱골프투어의 전문적인 손편지 작성 전문가입니다. 골프장 담당자들에게 보내는 따뜻하고 전문적인 인사편지를 작성합니다."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const improvedContent = response.choices[0].message.content;
    const originalLength = originalContent.length;
    const improvedLength = improvedContent.length;

    console.log('✅ 손편지 AI 개선 완료:', originalLength, '→', improvedLength, '자');

    return NextResponse.json({
      success: true,
      improvedContent,
      originalLength,
      improvedLength,
      improvementRequest,
      usageInfo: {
        model: response.model,
        tokens: response.usage?.total_tokens || 0,
        cost: response.usage?.total_tokens ? (response.usage.total_tokens * 0.00015 / 1000).toFixed(4) : '0.0000'
      }
    });

  } catch (error) {
    console.error('❌ 손편지 AI 개선 오류:', error);
    return NextResponse.json(
      { 
        error: '손편지 개선 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
