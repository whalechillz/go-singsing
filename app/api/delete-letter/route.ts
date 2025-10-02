import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function DELETE(request: NextRequest) {
  try {
    const { letterId } = await request.json();

    console.log('🗑️ 편지 삭제 요청:', { letterId });

    if (!letterId) {
      return NextResponse.json(
        { error: '편지 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 편지 삭제
    const { error: deleteError } = await supabase
      .from('letter_sending_history')
      .delete()
      .eq('id', letterId);

    if (deleteError) {
      console.error('❌ 편지 삭제 실패:', deleteError);
      return NextResponse.json(
        { 
          error: '편지 삭제에 실패했습니다.', 
          details: deleteError.message || '데이터베이스 오류가 발생했습니다.',
          code: deleteError.code || 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }

    console.log('✅ 편지 삭제 완료:', letterId);

    return NextResponse.json({
      success: true,
      message: '편지가 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('❌ 편지 삭제 오류:', error);
    return NextResponse.json(
      { 
        error: '편지 삭제 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
