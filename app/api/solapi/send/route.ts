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
    console.log("환경변수 확인:", {
      hasApiKey: !!SOLAPI_API_KEY,
      hasApiSecret: !!SOLAPI_API_SECRET,
      hasSender: !!SOLAPI_SENDER,
      sender: SOLAPI_SENDER
    });

    const body = await request.json();
    const { type, recipients, title, content, template_id } = body;

    // 솔라피 메시지 데이터
    const messages = recipients.map((recipient: any) => {
      const message: any = {
        to: recipient.phone.replace(/-/g, ""),
        from: SOLAPI_SENDER.replace(/-/g, ""),
        text: content,
        type: type === "kakao_alimtalk" ? "ATA" : type.toUpperCase(),
      };
      
      // SMS는 subject를 지원하지 않음
      if (type !== "sms" && title) {
        message.subject = title;
      }
      
      // 카카오 알림톡 옵션
      if (type === "kakao_alimtalk") {
        message.kakaoOptions = {
          pfId: SOLAPI_PFID,
          templateId: template_id,
        };
      }
      
      return message;
    });

    // 솔라피 API 호출
    console.log("솔라피 API 호출:", {
      messages: messages,
      headers: getSignature()
    });

    const response = await fetch("https://api.solapi.com/messages/v4/send-many", {
      method: "POST",
      headers: {
        ...getSignature(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const result = await response.json();
    console.log("솔라피 응답:", { status: response.status, result });

    if (!response.ok) {
      throw new Error(result.message || "솔라피 API 오류");
    }

    // 비용 계산
    const cost = calculateCost(type, recipients.length);

    return NextResponse.json({
      success: true,
      message: "메시지가 발송되었습니다.",
      count: recipients.length,
      cost: cost,
      groupId: result.groupId,
      result: result
    });

  } catch (error: any) {
    console.error("Solapi API Error:", {
      message: error.message,
      stack: error.stack,
      error: error
    });
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "메시지 발송 중 오류가 발생했습니다.",
        debug: {
          hasApiKey: !!SOLAPI_API_KEY,
          hasApiSecret: !!SOLAPI_API_SECRET,
          hasSender: !!SOLAPI_SENDER
        }
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
