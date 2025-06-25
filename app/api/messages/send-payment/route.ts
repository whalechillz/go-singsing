import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      tourId, 
      participantIds, 
      templateId, 
      templateData, 
      messageType, 
      sendMethod 
    } = body;

    // 투어 정보 가져오기
    const { data: tour, error: tourError } = await supabase
      .from('singsing_tours')
      .select('*')
      .eq('id', tourId)
      .single();

    if (tourError) {
      throw new Error('투어 정보를 가져올 수 없습니다.');
    }

    // 참가자 정보 가져오기
    const { data: participants, error: participantsError } = await supabase
      .from('singsing_participants')
      .select('*')
      .in('id', participantIds);

    if (participantsError || !participants || participants.length === 0) {
      throw new Error('참가자 정보를 가져올 수 없습니다.');
    }

    // 메시지 발송 (실제 구현시 솔라피 API 연동)
    let successCount = 0;
    let failCount = 0;
    const tourPrice = Number(tour.price);

    for (const participant of participants) {
      try {
        // 템플릿 변수 치환
        let messageContent = templateData.content;
        messageContent = messageContent.replace(/#{이름}/g, participant.name);
        messageContent = messageContent.replace(/#{투어명}/g, tour.title);
        messageContent = messageContent.replace(/#{출발일}/g, new Date(tour.start_date).toLocaleDateString());
        messageContent = messageContent.replace(/#{은행명}/g, '우리은행');
        messageContent = messageContent.replace(/#{계좌번호}/g, '1002-345-678901');

        // 메시지 타입별 추가 변수 치환
        switch (messageType) {
          case 'deposit_request':
            const depositAmount = Math.floor(tourPrice * 0.3);
            messageContent = messageContent.replace(/#{계약금}/g, depositAmount.toLocaleString());
            break;
            
          case 'balance_request':
            // 실제로는 개별 참가자의 결제 내역을 확인해서 잔금 계산
            const balanceAmount = Math.floor(tourPrice * 0.7);
            const deadline = new Date(tour.start_date);
            deadline.setDate(deadline.getDate() - 7);
            messageContent = messageContent.replace(/#{잔금}/g, balanceAmount.toLocaleString());
            messageContent = messageContent.replace(/#{납부기한}/g, deadline.toLocaleDateString());
            messageContent = messageContent.replace(/#{추가안내}/g, '');
            break;
            
          case 'deposit_confirmation':
            const paidDeposit = Math.floor(tourPrice * 0.3);
            messageContent = messageContent.replace(/#{계약금}/g, paidDeposit.toLocaleString());
            break;
            
          case 'payment_complete':
            messageContent = messageContent.replace(/#{총금액}/g, tourPrice.toLocaleString());
            // 실제 포털 URL로 대체 필요
            messageContent = messageContent.replace(/#{url}/g, 'portal-url');
            break;
        }

        // 메시지 로그 저장
        await supabase.from('message_logs').insert({
          customer_id: participant.id,
          message_type: sendMethod === 'kakao' ? 'alimtalk' : 'sms',
          template_id: templateId,
          phone_number: participant.phone,
          title: templateData.title,
          content: messageContent,
          status: 'sent',
          sent_at: new Date().toISOString()
        });

        successCount++;
      } catch (error) {
        console.error(`참가자 ${participant.name} 발송 실패:`, error);
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${successCount}명 발송 성공${failCount > 0 ? `, ${failCount}명 발송 실패` : ''}`,
      successCount,
      failCount
    });
  } catch (error: any) {
    console.error('결제 메시지 발송 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '메시지 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
