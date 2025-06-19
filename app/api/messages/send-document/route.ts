import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Supabase 클라이언트는 이미 import됨
    const body = await request.json();
    
    const {
      tourId,
      documentIds,
      participantIds,
      sendMethod,
      messageTemplate
    } = body;
    
    // 1. 발송 이력 생성
    const { data: historyData, error: historyError } = await supabase
      .from('document_send_history')
      .insert({
        tour_id: tourId,
        document_ids: documentIds,
        participant_count: participantIds.length,
        send_method: sendMethod,
        message_template: messageTemplate,
        sent_by: 'admin' // TODO: 실제 사용자 ID로 변경
      })
      .select()
      .single();
    
    if (historyError) throw historyError;
    
    // 2. 참가자 정보 가져오기
    let query = supabase
      .from('singsing_participants')
      .select('id, name, phone')
      .eq('tour_id', tourId);
    
    // 선택된 참가자가 있으면 해당 참가자만, 없으면 확정된 전체 참가자
    if (participantIds.length > 0) {
      query = query.in('id', participantIds);
    } else {
      query = query.eq('status', '확정');
    }
    
    const { data: participants, error: participantsError } = await query;
    
    if (participantsError) throw participantsError;
    
    // 3. 메시지 큐에 추가
    const messageQueueEntries = participants.map(participant => ({
      recipient_phone: participant.phone,
      recipient_name: participant.name,
      message_type: sendMethod === 'kakao' ? 'ALIMTALK' : 'SMS',
      message_content: messageTemplate.replace('#{이름}', participant.name),
      tour_id: tourId,
      document_send_history_id: historyData.id,
      status: 'pending'
    }));
    
    const { error: queueError } = await supabase
      .from('message_queue')
      .insert(messageQueueEntries);
    
    if (queueError) throw queueError;
    
    // 4. message_logs에도 기록 (Solapi 연동 전 임시)
    const messageLogs = participants.map(participant => ({
      customer_id: participant.id,
      message_type: sendMethod === 'kakao' ? 'ALIMTALK' : 'SMS',
      template_id: 'document_link',
      phone_number: participant.phone,
      title: `[싱싱골프] 투어 문서 안내`,
      content: messageTemplate.replace('#{이름}', participant.name),
      status: 'pending',
      tour_id: tourId,
      document_link_id: documentIds[0], // 첫 번째 문서 ID
      recipient_name: participant.name
    }));
    
    const { error: logsError } = await supabase
      .from('message_logs')
      .insert(messageLogs);
    
    if (logsError) throw logsError;
    
    // TODO: 실제 Solapi API 호출 구현
    // const results = await sendMessagesViaSolapi(messageQueueEntries);
    
    return NextResponse.json({
      success: true,
      message: `${participants.length}명에게 문서가 발송되었습니다.`,
      historyId: historyData.id
    });
    
  } catch (error) {
    console.error('Document send error:', error);
    return NextResponse.json(
      { success: false, error: '발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
