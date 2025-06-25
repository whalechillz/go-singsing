import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { smsService } from '@/lib/services/smsService';
import { MESSAGE_TEMPLATES, selectTemplate } from '@/lib/services/messageTemplates';

export async function POST(request: NextRequest) {
  console.log('=== 견적서 발송 API 시작 ===');
  
  // 환경 변수 검증
  const configValidation = smsService.validateConfig();
  if (!configValidation.isValid) {
    console.error('필수 환경 변수 누락:', configValidation.missingVars);
    return NextResponse.json(
      { 
        success: false, 
        error: `필수 환경 변수가 설정되지 않았습니다: ${configValidation.missingVars.join(', ')}`,
        details: '환경 변수를 확인해주세요.'
      },
      { status: 500 }
    );
  }
  
  try {
    const body = await request.json();
    const { 
      quoteId,
      customerPhone,
      customerName,
      templateId,
      templateData,
      sendMethod = 'sms'
    } = body;

    console.log('견적서 발송 요청:', {
      quoteId,
      customerPhone,
      customerName,
      templateId,
      sendMethod
    });

    // 견적서 정보 가져오기
    console.log('견적서 조회 시도:', quoteId);
    
    const { data: quote, error: quoteError } = await supabase
      .from('singsing_tours')
      .select('*')
      .eq('id', quoteId)
      .single();

    console.log('견적서 조회 결과:', { quote: quote?.id, error: quoteError });

    if (quoteError || !quote) {
      console.error('견적서 조회 오류:', quoteError);
      throw new Error(`견적서 조회 실패: ${quoteError?.message || '견적서를 찾을 수 없습니다.'}`);
    }

    // 공개 링크 정보 가져오기
    const { data: linkData } = await supabase
      .from('public_document_links')
      .select('*')
      .eq('tour_id', quoteId)
      .eq('document_type', 'quote')
      .single();

    // 견적서 URL 생성
    const quoteUrl = linkData?.public_url 
      ? `https://go.singsinggolf.kr/s/${linkData.public_url}`
      : `https://go.singsinggolf.kr/quote/${quoteId}`;

    // 만료일 포맷팅
    const expiryDate = quote.quote_expires_at 
      ? new Date(quote.quote_expires_at).toLocaleDateString('ko-KR')
      : '미정';

    // 템플릿 변수 준비
    const templateVariables = {
      이름: customerName || '고객님',
      견적서명: quote.title,
      url: smsService.extractUrlParam(quoteUrl),
      만료일: expiryDate
    };

    // 메시지 템플릿 결정
    let messageContent = '';
    let finalTemplateData = templateData;
    
    if (templateData?.content) {
      // 사용자 정의 템플릿 사용
      messageContent = smsService.replaceTemplateVariables(templateData.content, templateVariables);
    } else {
      // 기본 템플릿 사용
      const template = selectTemplate('QUOTE', sendMethod);
      if (typeof template === 'string') {
        messageContent = smsService.replaceTemplateVariables(template, templateVariables);
      } else {
        messageContent = smsService.replaceTemplateVariables(template.content, templateVariables);
        finalTemplateData = { ...templateData, ...template };
      }
    }

    console.log('메시지 내용:', messageContent);

    // 메시지 준비
    const message = smsService.prepareMessage({
      to: customerPhone,
      text: messageContent,
      templateData: finalTemplateData,
      documentUrl: quoteUrl,
      sendMethod
    });

    console.log('준비된 메시지:', JSON.stringify(message, null, 2));

    // SMS 발송
    try {
      const solapiResult = await smsService.send([message]);
      
      console.log('Solapi 응답:', solapiResult);

      // 발송 이력 저장
      try {
        await supabase
          .from('message_send_history')
          .insert({
            tour_id: quoteId,
            message_type: 'quote',
            send_method: message.type?.toLowerCase() || 'sms',
            recipient_count: 1,
            template_id: templateId,
            status: 'success',
            sent_at: new Date().toISOString()
          });
      } catch (historyError) {
        console.error('발송 이력 저장 실패:', historyError);
      }

      return NextResponse.json({
        success: true,
        message: '견적서가 성공적으로 발송되었습니다.',
        result: solapiResult
      });

    } catch (solapiError: any) {
      console.error('Solapi 발송 오류:', solapiError);
      
      // 발송 실패 이력 저장
      try {
        await supabase
          .from('message_send_history')
          .insert({
            tour_id: quoteId,
            message_type: 'quote',
            send_method: sendMethod,
            recipient_count: 1,
            template_id: templateId,
            status: 'failed',
            error_message: solapiError.message,
            sent_at: new Date().toISOString()
          });
      } catch (historyError) {
        console.error('실패 이력 저장 실패:', historyError);
      }

      throw solapiError;
    }

  } catch (error: any) {
    console.error('=== 견적서 발송 오류 상세 ===');
    console.error('오류 타입:', error.constructor.name);
    console.error('오류 메시지:', error.message);
    console.error('오류 스택:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: error.message || '견적서 발송 중 오류가 발생했습니다.',
      details: {
        type: error.constructor.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
}