import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  console.log('=== 견적서 발송 API 시작 ===');
  
  // 환경 변수 확인
  console.log('환경 변수 확인:', {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SOLAPI_API_KEY: process.env.SOLAPI_API_KEY ? '설정됨' : '미설정',
    SOLAPI_API_SECRET: process.env.SOLAPI_API_SECRET ? '설정됨' : '미설정',
    SOLAPI_SENDER: process.env.SOLAPI_SENDER
  });
  
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

    console.log('견적서 조회 결과:', { quote, quoteError });

    if (quoteError) {
      console.error('견적서 조회 오류:', quoteError);
      throw new Error(`견적서 조회 실패: ${quoteError.message}`);
    }
    
    if (!quote) {
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

    // 디버깅을 위한 임시 로그 (프로덕션에서는 제거 필요)
    console.log('Solapi 환경 변수 확인:', {
      NODE_ENV: process.env.NODE_ENV,
      apiKeyLength: solapiApiKey?.length || 0,
      apiSecretLength: solapiApiSecret?.length || 0,
      apiKeyPrefix: solapiApiKey ? solapiApiKey.substring(0, 4) : 'NONE',
      sender: process.env.SOLAPI_SENDER,
      pfId: solapiPfId,
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('SOLAPI')).join(', ')
    });

    if (!solapiApiKey || !solapiApiSecret) {
      console.error('Solapi 환경 변수 누락');
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
        from: process.env.SOLAPI_SENDER || process.env.NEXT_PUBLIC_SOLAPI_SENDER || '0312153990',
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

    // API 키와 시크릿 검증
    if (!solapiApiKey || solapiApiKey === 'undefined' || solapiApiKey.includes('your_')) {
      throw new Error('Solapi API 키가 올바르게 설정되지 않았습니다.');
    }
    
    if (!solapiApiSecret || solapiApiSecret === 'undefined' || solapiApiSecret.includes('your_')) {
      throw new Error('Solapi API 시크릿이 올바르게 설정되지 않았습니다.');
    }

    // Base64 인코딩
    const auth = Buffer.from(`${solapiApiKey}:${solapiApiSecret}`).toString('base64');
    
    console.log('Solapi Authorization 헤더 길이:', auth.length);

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
