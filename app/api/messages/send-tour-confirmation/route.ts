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

    // 포털 URL 찾기 (public_document_links에서)
    const { data: portalLink } = await supabase
      .from('public_document_links')
      .select('public_url, short_code')
      .eq('tour_id', tourId)
      .eq('document_type', 'portal')
      .eq('is_active', true)
      .single();

    const portalUrl = portalLink?.public_url || portalLink?.short_code || 'portal-url';

    // 메시지 발송
    let successCount = 0;
    let failCount = 0;

    for (const participant of participants) {
      try {
        // 템플릿 변수 치환
        let messageContent = templateData.content;
        messageContent = messageContent.replace(/#{이름}/g, participant.name);
        messageContent = messageContent.replace(/#{투어명}/g, tour.title);
        messageContent = messageContent.replace(/#{출발일}/g, new Date(tour.start_date).toLocaleDateString());
        messageContent = messageContent.replace(/#{url}/g, portalUrl);

        // 버튼 URL 치환
        let buttons = templateData.buttons;
        if (buttons && buttons.length > 0) {
          buttons = buttons.map((btn: any) => ({
            ...btn,
            linkMo: btn.linkMo?.replace(/#{url}/g, portalUrl),
            linkPc: btn.linkPc?.replace(/#{url}/g, portalUrl)
          }));
        }

        // 메시지 로그 저장
        await supabase.from('message_logs').insert({
          customer_id: participant.id,
          message_type: sendMethod === 'kakao' ? 'alimtalk' : 'sms',
          template_id: templateId,
          phone_number: participant.phone,
          title: templateData.title,
          content: messageContent,
          buttons: buttons,
          status: 'sent',
          sent_at: new Date().toISOString()
        });

        // TODO: 실제 메시지 발송 (솔라피 API 연동)

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
    console.error('투어 확정 메시지 발송 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '메시지 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
