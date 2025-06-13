import { NextRequest, NextResponse } from "next/server";

// 알리고 API 설정
const ALIGO_API_URL = "https://apis.aligo.in/send/";
const ALIGO_USER_ID = process.env.ALIGO_USER_ID || "";
const ALIGO_API_KEY = process.env.ALIGO_API_KEY || "";
const ALIGO_SENDER = process.env.ALIGO_SENDER || ""; // 발신번호

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, recipients, title, content, template_id } = body;

    // 알리고 API 요청 데이터 준비
    const formData = new FormData();
    formData.append("key", ALIGO_API_KEY);
    formData.append("user_id", ALIGO_USER_ID);
    formData.append("sender", ALIGO_SENDER);
    
    // 수신번호 처리 (최대 1000개)
    const phoneNumbers = recipients.map((r: any) => r.phone.replace(/-/g, ""));
    formData.append("receiver", phoneNumbers.join(","));
    
    // 메시지 내용
    formData.append("msg", content);
    
    // 메시지 타입별 처리
    if (type === "lms" || type === "mms") {
      formData.append("msg_type", type.toUpperCase());
      if (title) {
        formData.append("title", title);
      }
    } else if (type === "kakao_alimtalk") {
      formData.append("msg_type", "AT"); // 알림톡
      if (template_id) {
        formData.append("template_code", template_id);
      }
    } else {
      formData.append("msg_type", "SMS");
    }
    
    // 테스트 모드 (실제 발송하지 않음)
    if (process.env.NODE_ENV === "development") {
      formData.append("testmode_yn", "Y");
    }

    // 알리고 API 호출
    const response = await fetch(ALIGO_API_URL, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.result_code !== "1") {
      throw new Error(result.message || "알리고 API 오류");
    }

    // 비용 계산 (알리고 API 응답에 따라 조정 필요)
    const cost = calculateCost(type, recipients.length);

    return NextResponse.json({
      success: true,
      message: "메시지가 발송되었습니다.",
      count: recipients.length,
      cost: cost,
      result: result
    });

  } catch (error: any) {
    console.error("Aligo API Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "메시지 발송 중 오류가 발생했습니다." 
      },
      { status: 500 }
    );
  }
}

// 메시지 비용 계산 (예시)
function calculateCost(type: string, count: number): number {
  const unitCost = {
    sms: 20,
    lms: 50,
    mms: 100,
    kakao_alimtalk: 10
  };
  
  return (unitCost[type as keyof typeof unitCost] || 20) * count;
}
