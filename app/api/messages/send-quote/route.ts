import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
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
    const { data: quote, error: quoteError } = await supabase
      .from('singsing_tours')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      throw new Error('견적서를 찾을 수 없습니다.');
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
      ? `https://go.singsinggolf.kr/q/${linkData.public_url}`
      : `https://go.singsinggolf.kr/quote/${quoteId}`;

    // 만료일 포맷팅
    const expiryDate = quote.quote_expires_at 
      ? new Date(quote.quote_expires_at).toLocaleDateString('ko-KR')
      : '미정';

    // 메시지 템플릿 변수 치환
    const templateVariables = {
      이름: customerName || '고객님',
      견적서명: quote.title,
      url: quoteUrl,
      만료일: expiryDate
    };

    // Solapi API 호출
    const solapiApiKey = process.env.SOLAPI_API_KEY;
    const solapiApiSecret = process.env.SOLAPI_API_SECRET;
    const solapiPfId = process.env.SOLAPI_PFID;

    if (!solapiApiKey || !solapiApiSecret) {
      throw new Error('Solapi API 키가 설정되지 않았습니다.');
    }

    // 메시지 내용 생성
    let messageContent = templateData?.content || '';
    Object.entries(templateVariables).forEach(([key, value]) => {
      messageContent = messageContent.replace(new RegExp(`#{${key}}`, 'g'), value as string);
    });

    // Solapi 메시지 발송
    const solapiUrl = 'https://api.solapi.com/messages/v4/send';
    
    const messageData = {
      messages: [{
        to: customerPhone.replace(/-/g, ''),
        from: process.env.SOLAPI_SENDER_PHONE || '0312153990',
        text: messageContent,
        type: sendMethod === 'kakao' ? 'ATA' : 'SMS',
        ...(sendMethod === 'kakao' && templateData?.kakao_template_code && {
          kakaoOptions: {
            pfId: solapiPfId,
            templateId: templateData.kakao_template_code,
            variables: templateVariables
          }
        })
      }]
    };

    console.log('Solapi 요청 데이터:', JSON.stringify(messageData, null, 2));

    // Base64 인코딩
    const auth = Buffer.from(`${solapiApiKey}:${solapiApiSecret}`).toString('base64');

    const solapiResponse = await fetch(solapiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const solapiResult = await solapiResponse.json();
    
    console.log('Solapi 응답:', solapiResult);

    if (!solapiResponse.ok) {
      throw new Error(solapiResult.message || 'Solapi API 오류');
    }

    // 발송 이력 저장 (선택사항)
    try {
      await supabase
        .from('message_send_history')
        .insert({
          tour_id: quoteId,
          message_type: 'quote',
          send_method: sendMethod,
          recipient_count: 1,
          template_id: templateId,
          status: 'success',
          sent_at: new Date().toISOString()
        });
    } catch (historyError) {
      console.error('발송 이력 저장 실패:', historyError);
      // 이력 저장 실패는 무시하고 계속 진행
    }

    return NextResponse.json({
      success: true,
      message: '견적서가 성공적으로 발송되었습니다.',
      result: solapiResult
    });

  } catch (error: any) {
    console.error('견적서 발송 오류:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || '견적서 발송 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
