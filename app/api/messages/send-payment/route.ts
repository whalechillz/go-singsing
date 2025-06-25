import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

// 솔라피 API 설정
const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY || "";
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET || "";
const SOLAPI_PFID = process.env.SOLAPI_PFID || "";
const SOLAPI_SENDER = process.env.SOLAPI_SENDER || "";

// HMAC 서명 생성
function getSignature() {
  const date = new Date().toISOString();
  const salt = Math.random().toString(36).substring(2, 15);
  const data = date + salt;
  const signature = crypto
    .createHmac("sha256", SOLAPI_API_SECRET)
    .update(data)
    .digest("hex");
  
  return {
    Authorization: `HMAC-SHA256 apiKey=${SOLAPI_API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    // 환경변수 확인
    if (!SOLAPI_API_KEY || !SOLAPI_API_SECRET || !SOLAPI_SENDER) {
      console.error('필수 환경변수 누락:', {
        hasApiKey: !!SOLAPI_API_KEY,
        hasApiSecret: !!SOLAPI_API_SECRET,
        hasSender: !!SOLAPI_SENDER
      });
      return NextResponse.json(
        { 
          success: false, 
          error: '서버 설정 오류: 필수 환경변수가 설정되지 않았습니다.',
          details: {
            hasApiKey: !!SOLAPI_API_KEY,
            hasApiSecret: !!SOLAPI_API_SECRET,
            hasSender: !!SOLAPI_SENDER
          }
        },
        { status: 500 }
      );
    }
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

    // 메시지 발송
    let successCount = 0;
    let failCount = 0;
    const tourPrice = Number(tour.price);

    // 카카오 알림톡용 템플릿 ID를 가져오기
    const kakaoTemplateId = templateData.kakao_template_code;

    // 솔라피 v4 그룹 메시지 발송
    try {
      // 1. 메시지 그룹 생성
      const groupResponse = await fetch("https://api.solapi.com/messages/v4/groups", {
        method: "POST",
        headers: {
          ...getSignature(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({})
      });

      if (!groupResponse.ok) {
        const errorText = await groupResponse.text();
        console.error('그룹 생성 실패:', errorText);
        throw new Error('메시지 그룹 생성 실패');
      }

      const groupData = await groupResponse.json();
      const groupId = groupData.groupId;

      console.log('메시지 그룹 생성됨:', groupId);

      // 2. 그룹에 메시지 추가
      const messages = [];
      
      for (const participant of participants) {
        // 템플릿 변수 치환
        let messageContent = templateData.content;
        messageContent = messageContent.replace(/#{이름}/g, participant.name);
        messageContent = messageContent.replace(/#{투어명}/g, tour.title);
        messageContent = messageContent.replace(/#{출발일}/g, new Date(tour.start_date).toLocaleDateString());
        messageContent = messageContent.replace(/#{은행명}/g, '국민은행');
        messageContent = messageContent.replace(/#{계좌번호}/g, '294537-04-018035');

        // 메시지 타입별 추가 변수 치환
        switch (messageType) {
          case 'deposit_request':
            const depositAmount = 100000; // 계약금 100,000원 고정
            messageContent = messageContent.replace(/#{계약금}/g, depositAmount.toLocaleString());
            break;
            
          case 'balance_request':
            // 잔금 = 투어 가격 - 계약금(100,000원)
            const balanceAmount = tourPrice - 100000;
            const deadline = new Date(tour.start_date);
            deadline.setDate(deadline.getDate() - 7);
            messageContent = messageContent.replace(/#{잔금}/g, balanceAmount.toLocaleString());
            messageContent = messageContent.replace(/#{납부기한}/g, deadline.toLocaleDateString());
            messageContent = messageContent.replace(/#{추가안내}/g, '');
            break;
            
          case 'deposit_confirmation':
            const paidDeposit = 100000; // 계약금 100,000원 고정
            messageContent = messageContent.replace(/#{계약금}/g, paidDeposit.toLocaleString());
            break;
            
          case 'payment_complete':
            messageContent = messageContent.replace(/#{총금액}/g, tourPrice.toLocaleString());
            // 실제 포털 URL로 대체 필요
            messageContent = messageContent.replace(/#{url}/g, 'portal-url');
            break;
        }

        const cleanPhone = participant.phone.replace(/-/g, "").replace(/\s/g, "");
        const cleanSender = SOLAPI_SENDER.replace(/-/g, "").replace(/\s/g, "");

        let message: any = {
          to: cleanPhone,
          from: cleanSender,
          text: messageContent
        };

        // 메시지 타입별 설정
        if (sendMethod === 'kakao' && kakaoTemplateId) {
          // 카카오 알림톡
          message.type = 'ATA';
          message.kakaoOptions = {
            pfId: SOLAPI_PFID,
            templateId: kakaoTemplateId
          };
        } else if (messageContent.length > 90) {
          // LMS
          message.type = 'LMS';
          message.subject = templateData.title || '싱싱골프투어';
        } else {
          // SMS
          message.type = 'SMS';
        }

        messages.push(message);
      }

      // 3. 메시지 추가
      const addResponse = await fetch(`https://api.solapi.com/messages/v4/groups/${groupId}/messages`, {
        method: "PUT",
        headers: {
          ...getSignature(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages })
      });

      if (!addResponse.ok) {
        const errorText = await addResponse.text();
        console.error('메시지 추가 실패:', errorText);
        throw new Error('메시지 추가 실패');
      }

      // 4. 그룹 발송
      const sendResponse = await fetch(`https://api.solapi.com/messages/v4/groups/${groupId}/send`, {
        method: "POST",
        headers: getSignature()
      });

      if (!sendResponse.ok) {
        const errorText = await sendResponse.text();
        console.error('그룹 발송 실패:', errorText);
        throw new Error('그룹 발송 실패');
      }

      const sendResult = await sendResponse.json();
      console.log('발송 결과:', sendResult);

      // 성공적으로 발송된 경우
      successCount = messages.length;

      // 메시지 로그 저장
      for (const participant of participants) {
        const cleanPhone = participant.phone.replace(/-/g, "").replace(/\s/g, "");
        await supabase.from('message_logs').insert({
          customer_id: participant.id,
          message_type: sendMethod === 'kakao' ? 'alimtalk' : messageContent.length > 90 ? 'lms' : 'sms',
          template_id: templateId,
          phone_number: cleanPhone,
          title: templateData.title,
          content: messageContent,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      }

    } catch (error: any) {
      console.error('솔라피 발송 오류:', error);
      failCount = participants.length;
    }

    return NextResponse.json({
      success: true,
      message: `${successCount}명 발송 성공${failCount > 0 ? `, ${failCount}명 발송 실패` : ''}`,
      successCount,
      failCount
    });
  } catch (error: any) {
    console.error('결제 메시지 발송 오류:', {
      message: error.message,
      stack: error.stack,
      hasApiKey: !!SOLAPI_API_KEY,
      hasApiSecret: !!SOLAPI_API_SECRET,
      hasSender: !!SOLAPI_SENDER,
      sender: SOLAPI_SENDER
    });
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '메시지 발송 중 오류가 발생했습니다.',
        details: {
          hasApiKey: !!SOLAPI_API_KEY,
          hasApiSecret: !!SOLAPI_API_SECRET,
          hasSender: !!SOLAPI_SENDER,
          sender: SOLAPI_SENDER
        }
      },
      { status: 500 }
    );
  }
}
