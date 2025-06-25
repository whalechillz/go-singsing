import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { smsService } from '@/lib/services/smsService';
import { MESSAGE_TEMPLATES, selectTemplate } from '@/lib/services/messageTemplates';

export async function POST(request: NextRequest) {
  // 환경 변수 검증
  const configValidation = smsService.validateConfig();
  if (!configValidation.isValid) {
    console.error('필수 환경 변수 누락:', configValidation.missingVars);
    return NextResponse.json(
      { 
        success: false, 
        error: `서버 설정 오류: 필수 환경변수가 설정되지 않았습니다.`,
        details: configValidation.missingVars
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { 
      tourId, 
      participantIds, 
      templateId, 
      templateData, 
      messageType, 
      sendMethod = 'sms' 
    } = body;

    // 투어 정보 가져오기
    const { data: tour, error: tourError } = await supabase
      .from('singsing_tours')
      .select('*')
      .eq('id', tourId)
      .single();

    if (tourError || !tour) {
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

    // 공통 변수
    const tourPrice = Number(tour.price);
    const baseVariables = {
      투어명: tour.title,
      출발일: new Date(tour.start_date).toLocaleDateString('ko-KR'),
      은행명: '국민은행',
      계좌번호: '294537-04-018035'
    };

    // payment_complete인 경우 포털 링크 미리 가져오기
    let portalUrl = tourId; // 기본값
    if (messageType === 'payment_complete') {
      const { data: portalLink } = await supabase
        .from('public_document_links')
        .select('public_url')
        .eq('tour_id', tourId)
        .eq('document_type', 'portal')
        .single();
      
      if (portalLink?.public_url) {
        portalUrl = portalLink.public_url;
      }
    }

    // 메시지 타입별 변수 추가
    const getMessageVariables = (messageType: string) => {
      switch (messageType) {
        case 'deposit_request':
          return { ...baseVariables, 계약금: '100,000' };
          
        case 'balance_request':
          const balanceAmount = tourPrice - 100000;
          const deadline = new Date(tour.start_date);
          deadline.setDate(deadline.getDate() - 7);
          return {
            ...baseVariables,
            잔금: balanceAmount.toLocaleString(),
            납부기한: deadline.toLocaleDateString('ko-KR'),
            추가안내: ''
          };
          
        case 'deposit_confirmation':
          return { ...baseVariables, 계약금: '100,000' };
          
        case 'payment_complete':
          return {
            ...baseVariables,
            총금액: tourPrice.toLocaleString(),
            url: portalUrl
          };
          
        default:
          return baseVariables;
      }
    };

    const messageVariables = getMessageVariables(messageType);

    // 메시지 템플릿 선택
    let template;
    let finalTemplateData = templateData;
    
    if (templateData?.content) {
      // 사용자 정의 템플릿 사용
      template = templateData.content;
    } else {
      // 기본 템플릿 사용
      const subType = messageType.toUpperCase().replace(/-/g, '_');
      template = selectTemplate('PAYMENT', sendMethod, subType);
      
      if (typeof template === 'object') {
        finalTemplateData = { ...templateData, ...template };
        template = template.content || template.SMS || template;
      }
    }

    // 메시지 준비
    const messages = participants.map(participant => {
      // 참가자별 변수 추가
      const participantVariables = {
        ...messageVariables,
        이름: participant.name
      };

      // 템플릿 변수 치환
      const messageContent = smsService.replaceTemplateVariables(
        template,
        participantVariables
      );

      // 메시지 객체 생성
      return smsService.prepareMessage({
        to: participant.phone,
        text: messageContent,
        templateData: finalTemplateData,
        sendMethod
      });
    });

    console.log('메시지 발송 준비 완료:', {
      참가자수: messages.length,
      메시지타입: messages[0]?.type,
      첫번째메시지: messages[0]?.text?.substring(0, 50) + '...'
    });

    // SMS 발송
    try {
      const solapiResult = await smsService.send(messages);
      
      console.log('발송 결과:', solapiResult);

      // 메시지 로그 저장
      await smsService.saveMessageLog({
        participants,
        messageType: messages[0]?.type || sendMethod.toUpperCase(),
        templateId: templateId || messageType,
        title: templateData?.title || `[싱싱골프] ${messageType.replace(/_/g, ' ')}`,
        content: template,
        status: 'sent',
        tourId,
        groupId: solapiResult.groupId
      });

      return NextResponse.json({
        success: true,
        message: `${participants.length}명에게 메시지가 발송되었습니다.`,
        successCount: participants.length,
        failCount: 0
      });

    } catch (solapiError: any) {
      console.error('솔라피 발송 오류:', solapiError);
      
      // 실패 로그 저장
      await smsService.saveMessageLog({
        participants,
        messageType: sendMethod === 'kakao' ? 'ATA' : 'SMS',
        templateId: templateId || messageType,
        title: templateData?.title || `[싱싱골프] ${messageType.replace(/_/g, ' ')}`,
        content: template,
        status: 'failed',
        tourId,
        error: solapiError.message
      });

      return NextResponse.json({
        success: false,
        message: `메시지 발송 실패: ${solapiError.message}`,
        successCount: 0,
        failCount: participants.length
      });
    }

  } catch (error: any) {
    console.error('결제 메시지 발송 오류:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '메시지 발송 중 오류가 발생했습니다.',
        details: error
      },
      { status: 500 }
    );
  }
}