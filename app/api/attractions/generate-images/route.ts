import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, keywords, description } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: '관광지명이 필요합니다' }, { status: 400 });
    }

    // 이미지 생성 프롬프트 구성
    const mainPrompt = `Beautiful tourist attraction photo of ${name}, professional photography, high quality, scenic view`;
    const detailPrompt = keywords?.length > 0 
      ? `${mainPrompt}, featuring ${keywords.slice(0, 3).join(', ')}`
      : mainPrompt;

    // API 키 확인
    const falApiKey = process.env.FAL_API_KEY;
    if (!falApiKey) {
      return NextResponse.json({ error: 'FAL API 키가 설정되지 않았습니다' }, { status: 500 });
    }

    // FAL.ai API 호출
    const response = await fetch('https://fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: detailPrompt,
        image_size: 'landscape_16_9',
        num_inference_steps: 4,
        num_images: 3,
      }),
    });

    if (!response.ok) {
      throw new Error('이미지 생성 API 오류');
    }

    const data = await response.json();
    
    // 생성된 이미지 정보 포맷팅
    const images = data.images?.map((img: any, index: number) => ({
      url: img.url,
      thumbnailUrl: img.url,
      model: 'flux-schnell',
      prompt: detailPrompt,
      isMain: index === 0,
    })) || [];

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({ error: '이미지 생성 중 오류가 발생했습니다' }, { status: 500 });
  }
}
