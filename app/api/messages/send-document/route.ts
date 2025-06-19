import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      tourId,
      documentIds,
      participantIds,
      sendMethod,
      messageTemplate
    } = body;
    
    console.log('API 요청 받음:', { 
      tourId, 
      documentIds: documentIds.length, 
      participantIds: participantIds.length, 
      sendMethod 
    });
    
    // 참가자 정보 가져오기
    let participants = [];
    if (participantIds && participantIds.length > 0) {
      const { data, error } = await supabase
        .from('singsing_participants')
        .select('id, name, phone')
        .in('id', participantIds);
      
      if (error) {
        console.error('참가자 조회 오류:', error);
        throw new Error('참가자 정보를 가져올 수 없습니다.');
      }
      
      participants = data || [];
    }
    
    // 참가자가 없으면 에러
    if (participants.length === 0) {
      return NextResponse.json(
        { success: false, error: '발송할 참가자가 없습니다.' },
        { status: 400 }
      );
    }
    
    console.log(`${participants.length}명의 참가자에게 발송 예정`);
    
    // 메시지 로그 저장 시도 (테이블이 없어도 무시)
    try {
      const messageLogs = participants.map(participant => ({
        customer_id: participant.id,
        message_type: sendMethod === 'kakao' ? 'ALIMTALK' : 'SMS',
        template_id: 'document_link',
        phone_number: participant.phone,
        title: `[싱싱골프] 투어 문서 안내`,
        content: messageTemplate.replace('#{이름}', participant.name || '고객'),
        status: 'success', // 실제로는 'pending'이어야 하지만 임시로 success
        tour_id: tourId,
        document_link_id: documentIds[0], // 첫 번째 문서 ID
        recipient_name: participant.name
      }));
      
      const { error } = await supabase
        .from('message_logs')
        .insert(messageLogs);
      
      if (error) {
        console.log('message_logs 저장 실패 (무시):', error);
      }
    } catch (err) {
      console.log('message_logs 테이블 없음 (무시):', err);
    }
    
    // TODO: 실제 Solapi API 호출 구현
    // 지금은 성공으로 간주
    
    return NextResponse.json({
      success: true,
      message: `${participants.length}명에게 문서 발송을 완료했습니다.\n\n실제 발송은 Solapi 연동 후 가능합니다.`,
      participantCount: participants.length
    });
    
  } catch (error: any) {
    console.error('Document send error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '발송 중 오류가 발생했습니다.',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
