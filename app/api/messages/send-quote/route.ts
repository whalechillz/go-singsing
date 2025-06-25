import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('send-quote API 요청 받음:', body);
    
    const { 
      quoteId, 
      customerPhone, 
      customerName, 
      templateId, 
      templateData, 
      sendMethod 
    } = body;

    // 견적 정보 가져오기 (singsing_tours 테이블에서)
    const { data: quote, error: quoteError } = await supabase
      .from('singsing_tours')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError) {
      throw new Error('견적 정보를 가져올 수 없습니다.');
    }

    // 템플릿 변수 치환
    let messageContent = templateData.content || '';
    const tourPrice = Number(quote.price);
    const totalAmount = tourPrice * (quote.max_participants || 1);
    
    // 견적서 URL 생성
    const quoteUrl = `https://go.singsinggolf.kr/quote/${quoteId}`;
    
    // 만료일 포맷팅
    const expiryDate = quote.quote_expires_at ? new Date(quote.quote_expires_at).toLocaleDateString('ko-KR') : '미정';
    
    messageContent = messageContent.replace(/#{이름}/g, customerName);
    messageContent = messageContent.replace(/#{견적서명}/g, quote.title);
    messageContent = messageContent.replace(/#{url}/g, quoteUrl);
    messageContent = messageContent.replace(/#{만료일}/g, expiryDate);
    messageContent = messageContent.replace(/#{총금액}/g, totalAmount.toLocaleString());
    messageContent = messageContent.replace(/#{출발일}/g, new Date(quote.start_date).toLocaleDateString('ko-KR'));
    messageContent = messageContent.replace(/#{인원}/g, quote.max_participants || '1');

    // 버튼 URL 치환
    let buttons = templateData.buttons;
    if (buttons && buttons.length > 0) {
      buttons = buttons.map((btn: any) => ({
        ...btn,
        linkMo: btn.linkMo?.replace(/#{url}/g, quoteUrl),
        linkPc: btn.linkPc?.replace(/#{url}/g, quoteUrl)
      }));
    }

    // 메시지 로그 저장
    await supabase.from('message_logs').insert({
      message_type: sendMethod === 'kakao' ? 'alimtalk' : 'sms',
      template_id: templateId,
      phone_number: customerPhone,
      title: templateData.title,
      content: messageContent,
      buttons: buttons,
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    // 실제 메시지 발송
    if (sendMethod === 'kakao' && templateData.kakao_template_code) {
      // 카카오 알림톡 발송
      const kakaoResponse = await fetch('https://api.solapi.com/messages/v4/send', {
        method: 'POST',
        headers: {
          'Authorization': `HMAC-SHA256 apiKey=${process.env.NEXT_PUBLIC_SOLAPI_API_KEY}, date=${new Date().toISOString()}, salt=${Math.random().toString(36).substring(2, 15)}, signature=temp`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: {
            to: customerPhone.replace(/-/g, ''),
            from: process.env.NEXT_PUBLIC_SOLAPI_SENDER_PHONE || '0312153990',
            type: 'ATA',
            kakaoOptions: {
              pfId: process.env.NEXT_PUBLIC_KAKAO_PFID,
              templateId: templateData.kakao_template_code,
              variables: {
                '이름': customerName,
                '견적서명': quote.title,
                'url': quoteUrl,
                '만료일': expiryDate
              },
              buttons: buttons
            }
          }
        })
      });
      
      if (!kakaoResponse.ok) {
        console.error('카카오 알림톡 발송 실패:', await kakaoResponse.text());
        throw new Error('카카오 알림톡 발송에 실패했습니다.');
      }
    } else {
      // SMS 발송
      const smsResponse = await fetch('https://api.solapi.com/messages/v4/send', {
        method: 'POST',
        headers: {
          'Authorization': `HMAC-SHA256 apiKey=${process.env.NEXT_PUBLIC_SOLAPI_API_KEY}, date=${new Date().toISOString()}, salt=${Math.random().toString(36).substring(2, 15)}, signature=temp`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: {
            to: customerPhone.replace(/-/g, ''),
            from: process.env.NEXT_PUBLIC_SOLAPI_SENDER_PHONE || '0312153990',
            text: messageContent,
            type: 'SMS'
          }
        })
      });
      
      if (!smsResponse.ok) {
        console.error('SMS 발송 실패:', await smsResponse.text());
        throw new Error('SMS 발송에 실패했습니다.');
      }
    }
    
    const response = {
      success: true,
      message: '견적서가 발송되었습니다.'
    };
    
    console.log('API 응답:', response);
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('견적 메시지 발송 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '메시지 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
