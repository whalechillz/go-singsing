import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { smsService } from '@/lib/services/smsService';
import { MESSAGE_TEMPLATES, getDocumentType, selectTemplate } from '@/lib/services/messageTemplates';

export async function POST(request: NextRequest) {
  // 환경 변수 검증
  const configValidation = smsService.validateConfig();
  if (!configValidation.isValid) {
    console.error('필수 환경 변수 누락:', configValidation.missingVars);
    return NextResponse.json(
      { 
        success: false, 
        error: `필수 환경 변수가 설정되지 않았습니다: ${configValidation.missingVars.join(', ')}`,
        details: 'Vercel 대시보드에서 Settings > Environment Variables에 환경 변수를 추가해주세요.'
      },
      { status: 500 }
    );
  }
  
  try {
    const body = await request.json();
    
    const {
      tourId,
      documentIds,
      participantIds,
      sendMethod = 'sms',
      messageTemplate,
      templateId,
      templateData,
      documentUrl
    } = body;
    
    console.log('문서 발송 API 요청:', { 
      tourId, 
      documentIds: Array.isArray(documentIds) ? documentIds.length : documentIds, 
      participantIds: Array.isArray(participantIds) ? participantIds.length : participantIds, 
      sendMethod,
      documentUrl,
      hasMessageTemplate: !!messageTemplate,
      hasTemplateData: !!templateData 
    });
    
    // 필수 필드 검증
    if (!messageTemplate && !documentUrl) {
      return NextResponse.json(
        { success: false, error: '메시지 템플릿 또는 문서 URL이 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 참가자 정보 가져오기
    let participants: Array<{id: string, name: string, phone: string}> = [];
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
    
    // 메시지 템플릿 준비
    let finalTemplate = messageTemplate;
    let finalTemplateData = templateData;
    
    // 템플릿이 없으면 기본 템플릿 사용
    if (!messageTemplate && documentUrl) {
      const docType = getDocumentType(documentUrl);
      const template = selectTemplate(docType, sendMethod);
      
      if (typeof template === 'string') {
        finalTemplate = template;
      } else {
        finalTemplate = template.content;
        finalTemplateData = template;
      }
    }
    
    // 메시지 준비
    const messages = participants.map((participant) => {
      // URL 파라미터 추출
      const urlParam = smsService.extractUrlParam(documentUrl);
      
      // 템플릿 변수 치환
      const variables = {
        이름: participant.name || '고객님',
        url: urlParam
      };
      
      const personalizedContent = smsService.replaceTemplateVariables(finalTemplate, variables);
      
      console.log(`참가자 ${participant.name} 메시지:`, personalizedContent);
      
      // 메시지 객체 생성
      return smsService.prepareMessage({
        to: participant.phone,
        text: personalizedContent,
        templateData: finalTemplateData,
        documentUrl,
        sendMethod
      });
    });

    console.log("첫 번째 메시지 상세:", JSON.stringify(messages[0], null, 2));

    // SMS 발송
    try {
      const solapiResult = await smsService.send(messages);
      
      // 메시지 로그 저장 (성공)
      await smsService.saveMessageLog({
        participants,
        messageType: messages[0]?.type || 'SMS',
        templateId: templateId || 'document_link',
        title: '[싱싱골프] 투어 문서 안내',
        content: finalTemplate,
        status: 'sent',
        tourId,
        groupId: solapiResult.groupId
      });
      
      // 비용 계산
      const totalCost = smsService.calculateCost(messages);
      
      return NextResponse.json({
        success: true,
        message: `${participants.length}명에게 문서가 발송되었습니다. (${messages[0]?.type || 'SMS'})`,
        participantCount: participants.length,
        cost: totalCost,
        groupId: solapiResult.groupId,
        sendMethod: messages[0]?.type || 'SMS'
      });
      
    } catch (solapiError: any) {
      console.error('Solapi 발송 오류:', solapiError);
      
      // 메시지 로그 저장 (실패)
      await smsService.saveMessageLog({
        participants,
        messageType: sendMethod === 'kakao' ? 'ATA' : 'SMS',
        templateId: templateId || 'document_link',
        title: '[싱싱골프] 투어 문서 안내',
        content: finalTemplate,
        status: 'failed',
        tourId,
        error: solapiError.message
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: `메시지 발송 실패: ${solapiError.message}`,
          details: solapiError
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('문서 발송 오류:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '발송 중 오류가 발생했습니다.',
        details: {
          message: error.toString(),
          stack: error.stack,
          name: error.name
        }
      },
      { status: 500 }
    );
  }
}