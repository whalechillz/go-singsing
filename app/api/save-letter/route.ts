import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const {
      golfCourseContactId,
      occasion,
      letterContent,
      aiImprovementRequest,
      aiImprovedContent,
      sentDate,
      sentBy,
      status = 'draft',
      notes
    } = await request.json();

    console.log('💾 편지 저장 요청:', {
      golfCourseContactId,
      occasion,
      status,
      contentLength: letterContent?.length || 0
    });

    if (!golfCourseContactId || !occasion || !letterContent) {
      return NextResponse.json(
        { error: '골프장 담당자, 발송 사유, 편지 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    // 기존 편지가 있는지 확인 (같은 담당자, 같은 발송 사유, 같은 날짜)
    const { data: existingLetter, error: checkError } = await supabase
      .from('letter_sending_history')
      .select('id, status')
      .eq('golf_course_contact_id', golfCourseContactId)
      .eq('occasion', occasion)
      .eq('sent_date', sentDate || new Date().toISOString().split('T')[0])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let data, error;

    if (existingLetter && !checkError) {
      // 기존 편지가 있으면 상태만 업데이트
      console.log('📝 기존 편지 상태 업데이트:', existingLetter.id, '→', status);
      
      const { data: updateData, error: updateError } = await supabase
        .from('letter_sending_history')
        .update({
          status,
          letter_content: letterContent,
          ai_improvement_request: aiImprovementRequest || null,
          ai_improved_content: aiImprovedContent || null,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLetter.id)
        .select()
        .single();
      
      data = updateData;
      error = updateError;
    } else {
      // 기존 편지가 없으면 새로 생성
      console.log('📝 새 편지 생성');
      
      const { data: insertData, error: insertError } = await supabase
        .from('letter_sending_history')
        .insert({
          golf_course_contact_id: golfCourseContactId,
          occasion,
          letter_content: letterContent,
          ai_improvement_request: aiImprovementRequest || null,
          ai_improved_content: aiImprovedContent || null,
          sent_date: sentDate || new Date().toISOString().split('T')[0],
          sent_by: sentBy || null,
          status,
          notes: notes || null
        })
        .select()
        .single();
      
      data = insertData;
      error = insertError;
    }

    if (error) {
      console.error('❌ 편지 저장 실패:', error);
      return NextResponse.json(
        { 
          error: '편지 저장에 실패했습니다.', 
          details: error.message || '데이터베이스 오류가 발생했습니다.',
          code: error.code || 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }

    console.log('✅ 편지 저장 완료:', data.id);

    return NextResponse.json({
      success: true,
      letterId: data.id,
      message: '편지가 성공적으로 저장되었습니다.'
    });

  } catch (error) {
    console.error('❌ 편지 저장 오류:', error);
    return NextResponse.json(
      { 
        error: '편지 저장 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    const status = searchParams.get('status');

    let query = supabase
      .from('letter_sending_history')
      .select(`
        *,
        golf_course_contacts (
          golf_course_name,
          contact_name
        )
      `)
      .order('created_at', { ascending: false });

    if (contactId) {
      query = query.eq('golf_course_contact_id', contactId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ 편지 이력 조회 실패:', error);
      return NextResponse.json(
        { 
          error: '편지 이력을 조회할 수 없습니다.', 
          details: error.message || '데이터베이스 조회 오류가 발생했습니다.',
          code: error.code || 'QUERY_ERROR'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      letters: data || []
    });

  } catch (error) {
    console.error('❌ 편지 이력 조회 오류:', error);
    return NextResponse.json(
      { 
        error: '편지 이력 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
