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
        error: `필수 환경 변수가 설정되지 않았습니다: ${configValidation.missingVars.join(', ')}`
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { 
      customerIds,
      messageTemplate,
      templateData,
      sendType = 'REMINDER',
      sendMethod = 'sms'
    } = body;

    console.log('고객 메시지 발송 요청:', {
      customerCount: customerIds?.length,
      sendType,
      sendMethod
    });

    // 고객 정보 가져오기
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name, phone, email, birthdate')
      .in('id', customerIds);

    if (customersError || !customers || customers.length === 0) {
      throw new Error('선택된 고객이 없거나 고객 정보를 가져올 수 없습니다.');
    }

    console.log(`${customers.length}명의 고객에게 발송 예정`);

    // 메시지 템플릿 준비
    let finalTemplate = messageTemplate;
    let finalTemplateData = templateData;
    
    if (!messageTemplate) {
      // 기본 템플릿 사용
      const template = selectTemplate('CUSTOMER', sendMethod, sendType);
      
      if (typeof template === 'string') {
        finalTemplate = template;
      } else {
        finalTemplate = template.content || template.SMS || template;
        finalTemplateData = { ...templateData, ...template };
      }
    }

    // 메시지 준비
    const messages = customers.map(customer => {
      // 템플릿 변수 준비
      const variables: Record<string, string> = {
        이름: customer.name,
        이메일: customer.email || ''
      };

      // 발송 타입별 추가 변수 설정
      switch (sendType) {
        case 'BIRTHDAY':
          variables.생일혜택 = templateData?.birthdayBenefit || '10% 할인쿠폰';
          break;
        case 'PROMOTION':
          variables.프로모션 = templateData?.promotionText || '신규 투어 상품 출시';
          break;
        case 'REMINDER':
          variables.안내사항 = templateData?.reminderText || '예약 확인 안내';
          break;
      }

      // 사용자 정의 변수 추가
      if (templateData?.customVariables) {
        Object.assign(variables, templateData.customVariables);
      }

      // 템플릿 변수 치환
      const messageContent = smsService.replaceTemplateVariables(finalTemplate, variables);

      console.log(`고객 ${customer.name} 메시지:`, messageContent.substring(0, 50) + '...');

      // 메시지 객체 생성
      return smsService.prepareMessage({
        to: customer.phone,
        text: messageContent,
        templateData: finalTemplateData,
        sendMethod
      });
    });

    // SMS 발송
    try {
      const solapiResult = await smsService.send(messages);
      
      console.log('발송 결과:', {
        groupId: solapiResult.groupId,
        countInfo: solapiResult.countInfo
      });

      // 메시지 로그 저장
      await smsService.saveMessageLog({
        participants: customers.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone
        })),
        messageType: messages[0]?.type || 'SMS',
        templateId: templateData?.id || sendType.toLowerCase(),
        title: '[싱싱골프] 고객 안내',
        content: finalTemplate,
        status: 'sent',
        groupId: solapiResult.groupId
      });

      // 발송 이력 저장 (선택사항)
      try {
        await supabase
          .from('customer_message_history')
          .insert({
            message_type: sendType.toLowerCase(),
            send_method: sendMethod,
            recipient_count: customers.length,
            template_content: finalTemplate,
            status: 'success',
            sent_at: new Date().toISOString()
          });
      } catch (historyError) {
        console.error('발송 이력 저장 실패:', historyError);
      }

      return NextResponse.json({
        success: true,
        message: `${customers.length}명에게 메시지가 발송되었습니다.`,
        result: {
          sentCount: customers.length,
          messageType: messages[0]?.type,
          cost: smsService.calculateCost(messages)
        }
      });

    } catch (solapiError: any) {
      console.error('고객 메시지 발송 오류:', solapiError);
      
      // 실패 로그 저장
      await smsService.saveMessageLog({
        participants: customers.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone
        })),
        messageType: sendMethod === 'kakao' ? 'ATA' : 'SMS',
        templateId: templateData?.id || sendType.toLowerCase(),
        title: '[싱싱골프] 고객 안내',
        content: finalTemplate,
        status: 'failed',
        error: solapiError.message
      });

      throw solapiError;
    }

  } catch (error: any) {
    console.error('고객 메시지 발송 오류:', {
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