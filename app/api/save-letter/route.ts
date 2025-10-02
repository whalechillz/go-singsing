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

    // 편지 저장
    const { data, error } = await supabase
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

    if (error) {
      console.error('❌ 편지 저장 실패:', error);
      return NextResponse.json(
        { error: '편지 저장에 실패했습니다.', details: error.message },
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
        { error: '편지 이력을 조회할 수 없습니다.', details: error.message },
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
