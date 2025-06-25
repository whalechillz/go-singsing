import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// 솔라피 API 설정
const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY || "";
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET || "";
const SOLAPI_PFID = process.env.SOLAPI_PFID || ""; // 카카오 알림톡 채널 ID (선택)
const SOLAPI_SENDER = process.env.SOLAPI_SENDER || ""; // 발신번호

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
      console.error("필수 환경변수 누락:", {
        hasApiKey: !!SOLAPI_API_KEY,
        hasApiSecret: !!SOLAPI_API_SECRET,
        hasSender: !!SOLAPI_SENDER
      });
      return NextResponse.json(
        { 
          success: false, 
          message: "서버 설정 오류: 필수 환경변수가 설정되지 않았습니다."
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { type, recipients, title, content, template_id, image_url } = body;

    console.log("메시지 발송 요청:", {
      type,
      recipientCount: recipients.length,
      hasTitle: !!title,
      hasImage: !!image_url,
      sender: SOLAPI_SENDER,
      content: content?.substring(0, 50) + "..."
    });

    // 이미지 처리 (MMS인 경우)
    let imageFileId = null;
    if (type === "mms" && image_url) {
      try {
        console.log("MMS 이미지 처리 시작:", image_url);
        
        // Supabase 이미지 다운로드
        const imageResponse = await fetch(image_url);
        if (!imageResponse.ok) {
          throw new Error("이미지 다운로드 실패");
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBlob = new Blob([imageBuffer], { type: 'image/jpeg' });
        
        // FormData 생성 (브라우저 스타일)
        const formData = new FormData();
        formData.append('file', imageBlob, 'image.jpg');
        
        // 솔라피에 이미지 업로드
        const uploadResponse = await fetch("https://api.solapi.com/storage/v1/files", {
          method: "POST",
          headers: getSignature(),
          body: formData
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageFileId = uploadResult.fileId;
          console.log("이미지 업로드 성공:", imageFileId);
        } else {
          const errorText = await uploadResponse.text();
          console.error("솔라피 이미지 업로드 실패:", errorText);
          // 이미지 업로드 실패해도 메시지는 발송 (이미지 없이)
        }
      } catch (imageError) {
        console.error("이미지 처리 중 오류:", imageError);
        // 이미지 처리 실패해도 메시지는 발송
      }
    }

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

      // 2. 메시지 배열 생성
      const messages = recipients.map((recipient: any) => {
        // 전화번호 형식 정리
        const cleanPhone = recipient.phone.replace(/-/g, "").replace(/\s/g, "");
        const cleanSender = SOLAPI_SENDER.replace(/-/g, "").replace(/\s/g, "");
        
        // 전화번호 유효성 검증
        if (!/^01[0-9]{8,9}$/.test(cleanPhone)) {
          console.error("잘못된 수신번호 형식:", recipient.phone, "->", cleanPhone);
        }
        
        if (!/^0[0-9]{8,10}$/.test(cleanSender)) {
          console.error("잘못된 발신번호 형식:", SOLAPI_SENDER, "->", cleanSender);
        }
        
        const message: any = {
          to: cleanPhone,
          from: cleanSender,
          text: content
        };
        
        // 메시지 타입별 설정
        if (type === "kakao_alimtalk") {
          message.type = "ATA";
          message.kakaoOptions = {
            pfId: SOLAPI_PFID,
            templateId: template_id,
          };
        } else if (type === "mms") {
          message.type = "MMS";
          if (title) message.subject = title;
          if (imageFileId) message.imageId = imageFileId;
        } else if (type === "lms") {
          message.type = "LMS";
          if (title) message.subject = title;
        } else {
          message.type = "SMS";
        }
        
        return message;
      });

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

      const addResult = await addResponse.json();
      console.log('메시지 추가 결과:', addResult);

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

      // 메시지 로그 저장
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const logs = recipients.map((recipient: any) => ({
          customer_id: recipient.customer_id || null,
          message_type: type,
          phone_number: recipient.phone.replace(/-/g, ""),
          title: title || null,
          content: content,
          status: 'sent',
          cost: calculateCost(type, 1),
          sent_at: new Date().toISOString()
        }));

        await supabase.from('message_logs').insert(logs);
      } catch (logError) {
        console.error("로그 저장 실패:", logError);
        // 로그 저장 실패해도 응답은 반환
      }

      // 비용 계산
      const cost = calculateCost(type, recipients.length);

      return NextResponse.json({
        success: true,
        message: "메시지가 발송되었습니다.",
        sent: recipients.length,
        failed: 0,
        count: recipients.length,
        cost: cost,
        groupId: groupId,
        details: {
          successfulMessages: messages,
          failedMessages: []
        }
      });

    } catch (error: any) {
      console.error("솔라피 API 오류:", error);
      return NextResponse.json(
        { 
          success: false, 
          message: error.message || "메시지 발송 중 오류가 발생했습니다.",
          error: error.toString()
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error("Solapi API Error:", {
      message: error.message,
      stack: error.stack,
      error: error
    });
    
    // 더 자세한 에러 메시지
    let errorMessage = "메시지 발송 중 오류가 발생했습니다.";
    let errorDetails = {};
    
    if (!process.env.SOLAPI_API_KEY || !process.env.SOLAPI_API_SECRET) {
      errorMessage = "솔라피 API 키가 설정되지 않았습니다. Vercel 환경변수를 확인하세요.";
      errorDetails = {
        hasApiKey: !!process.env.SOLAPI_API_KEY,
        hasApiSecret: !!process.env.SOLAPI_API_SECRET,
        hasSender: !!process.env.SOLAPI_SENDER
      };
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: error.toString(),
        details: errorDetails,
        env: process.env.NODE_ENV
      },
      { status: 500 }
    );
  }
}

// 메시지 비용 계산 (솔라피 기준)
function calculateCost(type: string, count: number): number {
  const unitCost = {
    sms: 20,
    lms: 30,
    mms: 80,
    kakao_alimtalk: 9
  };
  
  return (unitCost[type as keyof typeof unitCost] || 20) * count;
}
