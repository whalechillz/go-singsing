import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  // Supabase 클라이언트를 함수 내부에서 생성
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: 'Supabase 환경 변수가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const body = await request.json();
    const { 
      quoteId, 
      customerPhone, 
      customerName, 
      templateId, 
      templateData, 
      sendMethod 
    } = body;

    // 견적 정보 가져오기
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single();

    if (quoteError) {
      throw new Error('견적 정보를 가져올 수 없습니다.');
    }

    // 템플릿 변수 치환
    let messageContent = templateData.content;
    const tourPrice = Number(quote.price);
    const totalAmount = tourPrice * (quote.max_participants || 1);
    
    messageContent = messageContent.replace(/#{이름}/g, customerName);
    messageContent = messageContent.replace(/#{투어명}/g, quote.title);
    messageContent = messageContent.replace(/#{총금액}/g, totalAmount.toLocaleString());
    messageContent = messageContent.replace(/#{출발일}/g, new Date(quote.start_date).toLocaleDateString());
    messageContent = messageContent.replace(/#{인원}/g, quote.max_participants || '1');
    messageContent = messageContent.replace(/#{quote_id}/g, quoteId);

    // 버튼 URL 치환
    let buttons = templateData.buttons;
    if (buttons && buttons.length > 0) {
      buttons = buttons.map((btn: any) => ({
        ...btn,
        linkMo: btn.linkMo?.replace(/#{quote_id}/g, quoteId),
        linkPc: btn.linkPc?.replace(/#{quote_id}/g, quoteId)
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

    // TODO: 실제 메시지 발송 (솔라피 API 연동)
    
    return NextResponse.json({
      success: true,
      message: '견적서가 발송되었습니다.'
    });
  } catch (error: any) {
    console.error('견적 메시지 발송 오류:', error);
    return NextResponse.json(
      { success: false, error: error.message || '메시지 발송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
