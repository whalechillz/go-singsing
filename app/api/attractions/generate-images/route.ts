import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, keywords, description, category } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: '관광지명이 필요합니다' }, { status: 400 });
    }

    // 카테고리별 프롬프트 설정
    let basePrompt = '';
    
    // 설명에 기반한 프롬프트 생성
    if (description && description.toLowerCase().includes('golf') || 
        description && description.includes('골프') || 
        name.toLowerCase().includes('golf') || 
        name.includes('골프')) {
      // 골프 관련 시설
      if (description && (description.includes('드라이버') || description.includes('driver'))) {
        basePrompt = `Modern golf shop interior, golf drivers on display wall, professional golf equipment store, ${name}, retail photography, clean and organized`;
      } else {
        basePrompt = `Golf facility, golf course or golf shop ${name}, professional photography`;
      }
    } else if (category === 'restaurant' || category === '맛집') {
      basePrompt = `Restaurant interior showing dining area, Korean restaurant ${name}, clean interior, professional photography`;
    } else if (category === 'shopping' || category === '쇼핑') {
      basePrompt = `Retail store interior, shopping mall or store ${name}, product displays, bright lighting, professional photography`;
    } else if (category === 'activity' || category === '액티비티') {
      basePrompt = `Activity center, recreational facility ${name}, modern interior, professional photography`;
    } else if (category === 'tourist_spot' || category === '명소') {
      basePrompt = `Tourist attraction ${name}, landmark or scenic spot, beautiful view, professional photography`;
    } else {
      basePrompt = `${name} establishment exterior or interior, ${category || 'commercial space'}, professional photography, high quality`;
    }
    
    // 키워드 추가
    const detailPrompt = keywords?.length > 0 
      ? `${basePrompt}, ${keywords.slice(0, 3).join(', ')}`
      : basePrompt;

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
