import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// 선물 이력 조회 (GET)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');

    let query = supabase
      .from('gift_sending_history')
      .select(`
        *,
        golf_course_contacts (
          golf_course_name,
          contact_name
        )
      `)
      .order('sent_date', { ascending: false });

    if (contactId) {
      query = query.eq('golf_course_contact_id', contactId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ 선물 이력 조회 실패:', error);
      return NextResponse.json(
        { 
          error: '선물 이력 조회에 실패했습니다.', 
          details: error.message || '데이터베이스 오류가 발생했습니다.',
          code: error.code || 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }

    console.log('✅ 선물 이력 조회 완료:', data?.length || 0, '개');

    return NextResponse.json({
      success: true,
      giftHistory: data || []
    });

  } catch (error) {
    console.error('❌ 선물 이력 조회 오류:', error);
    return NextResponse.json(
      { 
        error: '선물 이력 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 선물 이력 수정 (PUT)
export async function PUT(request: NextRequest) {
  try {
    const {
      giftId,
      occasion,
      giftType,
      giftAmount,
      quantity,
      sentDate,
      sentBy,
      notes
    } = await request.json();

    console.log('✏️ 선물 이력 수정 요청:', {
      giftId,
      occasion,
      giftType,
      giftAmount,
      quantity
    });

    if (!giftId) {
      return NextResponse.json(
        { error: '선물 이력 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!occasion || !giftType || !giftAmount || !quantity || !sentDate) {
      return NextResponse.json(
        { error: '발송 사유, 선물 종류, 금액, 수량, 발송일이 필요합니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('gift_sending_history')
      .update({
        occasion,
        gift_type: giftType,
        gift_amount: giftAmount,
        quantity,
        sent_date: sentDate,
        sent_by: sentBy || null,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', giftId)
      .select()
      .single();

    if (error) {
      console.error('❌ 선물 이력 수정 실패:', error);
      return NextResponse.json(
        { 
          error: '선물 이력 수정에 실패했습니다.', 
          details: error.message || '데이터베이스 오류가 발생했습니다.',
          code: error.code || 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }

    console.log('✅ 선물 이력 수정 완료:', data.id);

    return NextResponse.json({
      success: true,
      giftHistory: data,
      message: '선물 이력이 성공적으로 수정되었습니다.'
    });

  } catch (error) {
    console.error('❌ 선물 이력 수정 오류:', error);
    return NextResponse.json(
      { 
        error: '선물 이력 수정 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 선물 이력 삭제 (DELETE)
export async function DELETE(request: NextRequest) {
  try {
    const { giftId } = await request.json();

    console.log('🗑️ 선물 이력 삭제 요청:', { giftId });

    if (!giftId) {
      return NextResponse.json(
        { error: '선물 이력 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('gift_sending_history')
      .delete()
      .eq('id', giftId);

    if (error) {
      console.error('❌ 선물 이력 삭제 실패:', error);
      return NextResponse.json(
        { 
          error: '선물 이력 삭제에 실패했습니다.', 
          details: error.message || '데이터베이스 오류가 발생했습니다.',
          code: error.code || 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }

    console.log('✅ 선물 이력 삭제 완료:', giftId);

    return NextResponse.json({
      success: true,
      message: '선물 이력이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('❌ 선물 이력 삭제 오류:', error);
    return NextResponse.json(
      { 
        error: '선물 이력 삭제 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
