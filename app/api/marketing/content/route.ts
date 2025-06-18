import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tourProductId = searchParams.get('tourProductId');
  const tourId = searchParams.get('tourId');

  if (!tourProductId && !tourId) {
    return NextResponse.json({ error: 'tourProductId 또는 tourId가 필요합니다.' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // 마케팅 콘텐츠 마스터 찾기
    let query = supabase
      .from('marketing_contents')
      .select('*')
      .eq('is_active', true);

    if (tourProductId) {
      query = query.eq('tour_product_id', tourProductId).eq('content_type', 'tour_product');
    } else {
      query = query.eq('tour_id', tourId).eq('content_type', 'tour_specific');
    }

    const { data: marketingContent, error: contentError } = await query.single();

    if (contentError || !marketingContent) {
      // 마케팅 콘텐츠가 없으면 빈 배열 반환
      return NextResponse.json({ items: [] });
    }

    // 포함/불포함 항목 가져오기
    const { data: includedItems, error: itemsError } = await supabase
      .from('marketing_included_items')
      .select('*')
      .eq('marketing_content_id', marketingContent.id)
      .order('display_order');

    if (itemsError) {
      throw itemsError;
    }

    // 특별혜택 가져오기
    const { data: specialBenefits, error: benefitsError } = await supabase
      .from('marketing_special_benefits')
      .select('*')
      .eq('marketing_content_id', marketingContent.id)
      .order('display_order');

    if (benefitsError) {
      throw benefitsError;
    }

    // 데이터 통합
    const items = [
      ...includedItems.map(item => ({
        ...item,
        category: item.category === '포함사항' ? 'included' : 
                  item.category === '불포함사항' ? 'excluded' : 'benefits'
      })),
      ...specialBenefits.map(benefit => ({
        ...benefit,
        category: 'benefits',
        title: benefit.title,
        description: benefit.description,
        icon: 'gift'
      }))
    ];

    return NextResponse.json({ items });
  } catch (error) {
    console.error('마케팅 콘텐츠 조회 오류:', error);
    return NextResponse.json({ error: '마케팅 콘텐츠 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tourProductId, tourId, contentType, items } = body;

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: '유효하지 않은 데이터입니다.' }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    // 트랜잭션 시작
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    // 기존 마케팅 콘텐츠 찾기 또는 생성
    let marketingContentId;
    
    let query = supabase
      .from('marketing_contents')
      .select('id');

    if (tourProductId) {
      query = query.eq('tour_product_id', tourProductId).eq('content_type', 'tour_product');
    } else {
      query = query.eq('tour_id', tourId).eq('content_type', 'tour_specific');
    }

    const { data: existingContent } = await query.single();

    if (existingContent) {
      marketingContentId = existingContent.id;
      
      // 기존 항목 삭제
      await supabase
        .from('marketing_included_items')
        .delete()
        .eq('marketing_content_id', marketingContentId);
        
      await supabase
        .from('marketing_special_benefits')
        .delete()
        .eq('marketing_content_id', marketingContentId);
    } else {
      // 새로운 마케팅 콘텐츠 생성
      const { data: newContent, error: createError } = await supabase
        .from('marketing_contents')
        .insert({
          tour_product_id: tourProductId,
          tour_id: tourId,
          content_type: contentType,
          is_active: true
        })
        .select()
        .single();

      if (createError) throw createError;
      marketingContentId = newContent.id;
    }

    // 새 항목 삽입
    const includedItems = [];
    const specialBenefits = [];

    items.forEach(item => {
      if (item.category === 'benefits' && item.benefit_type) {
        // 특별혜택
        specialBenefits.push({
          marketing_content_id: marketingContentId,
          benefit_type: item.benefit_type,
          title: item.title,
          description: item.description,
          value: item.value,
          badge_text: item.badge_text,
          badge_color: item.badge_color,
          display_order: item.display_order
        });
      } else {
        // 포함/불포함 항목
        includedItems.push({
          marketing_content_id: marketingContentId,
          category: item.category === 'included' ? '포함사항' : 
                    item.category === 'excluded' ? '불포함사항' : '특별혜택',
          icon: item.icon,
          title: item.title,
          description: item.description,
          display_order: item.display_order,
          is_highlight: item.is_highlight
        });
      }
    });

    // 데이터 삽입
    if (includedItems.length > 0) {
      const { error: itemsError } = await supabase
        .from('marketing_included_items')
        .insert(includedItems);
      
      if (itemsError) throw itemsError;
    }

    if (specialBenefits.length > 0) {
      const { error: benefitsError } = await supabase
        .from('marketing_special_benefits')
        .insert(specialBenefits);
      
      if (benefitsError) throw benefitsError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('마케팅 콘텐츠 저장 오류:', error);
    return NextResponse.json({ error: '마케팅 콘텐츠 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
