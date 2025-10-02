import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 중복 편지 이력 정리 시작...');

    // 1. 먼저 중복 데이터 확인
    const { data: duplicates, error: checkError } = await supabase
      .from('letter_sending_history')
      .select('golf_course_contact_id, occasion, sent_date, status, id, created_at')
      .order('created_at', { ascending: false });

    if (checkError) {
      console.error('❌ 중복 데이터 확인 실패:', checkError);
      return NextResponse.json(
        { error: '중복 데이터 확인에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 2. 중복 그룹 찾기
    const grouped = duplicates?.reduce((acc, item) => {
      const key = `${item.golf_course_contact_id}-${item.occasion}-${item.sent_date}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    // 3. 중복 제거: 각 그룹에서 최신 것만 유지
    const idsToDelete: string[] = [];
    
    if (grouped) {
      Object.values(grouped).forEach((group: any[]) => {
        if (group.length > 1) {
          // 최신 것(첫 번째)을 제외하고 나머지 삭제 대상에 추가
          const toDelete = group.slice(1);
          idsToDelete.push(...toDelete.map((item: any) => item.id));
        }
      });
    }

    console.log(`🗑️ 삭제할 중복 레코드: ${idsToDelete.length}개`);

    // 4. 중복 레코드 삭제
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('letter_sending_history')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('❌ 중복 데이터 삭제 실패:', deleteError);
        return NextResponse.json(
          { error: '중복 데이터 삭제에 실패했습니다.' },
          { status: 500 }
        );
      }
    }

    // 5. 정리 후 결과 확인
    const { data: remaining, error: remainingError } = await supabase
      .from('letter_sending_history')
      .select('id, golf_course_contact_id, occasion, sent_date, status')
      .order('created_at', { ascending: false });

    if (remainingError) {
      console.error('❌ 정리 후 데이터 확인 실패:', remainingError);
      return NextResponse.json(
        { error: '정리 후 데이터 확인에 실패했습니다.' },
        { status: 500 }
      );
    }

    console.log('✅ 중복 편지 이력 정리 완료');

    return NextResponse.json({
      success: true,
      deletedCount: idsToDelete.length,
      remainingCount: remaining?.length || 0,
      message: `${idsToDelete.length}개의 중복 레코드가 삭제되었습니다.`
    });

  } catch (error) {
    console.error('❌ 중복 정리 오류:', error);
    return NextResponse.json(
      { 
        error: '중복 정리 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
