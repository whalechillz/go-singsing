import { NextRequest, NextResponse } from 'next/server';
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
    // 환경변수 체크
    const envCheck = {
      hasApiKey: !!SOLAPI_API_KEY,
      hasApiSecret: !!SOLAPI_API_SECRET,
      hasPfId: !!SOLAPI_PFID,
      hasSender: !!SOLAPI_SENDER,
      pfId: SOLAPI_PFID,
      sender: SOLAPI_SENDER
    };

    console.log('환경변수 체크:', envCheck);

    // 테스트 메시지 - 가장 단순한 형태
    const testMessage = {
      to: "01012345678", // 테스트 번호
      from: SOLAPI_SENDER.replace(/-/g, ""),
      text: "테스트 메시지입니다.",
      type: "ATA",
      kakaoOptions: {
        pfId: SOLAPI_PFID,
        templateId: "ebce2a05-21b7-4901-b131-de4752f4ae9b", // 종합 여정 안내 템플릿
        disableSms: false
      }
    };

    console.log('테스트 메시지:', testMessage);

    // 솔라피 API 호출 (단일 메시지)
    const response = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        ...getSignature(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: testMessage }),
    });

    const result = await response.json();
    
    console.log('솔라피 응답:', {
      status: response.status,
      statusText: response.statusText,
      result
    });

    return NextResponse.json({
      success: response.ok,
      envCheck,
      testMessage,
      response: {
        status: response.status,
        statusText: response.statusText,
        result
      }
    });

  } catch (error: any) {
    console.error('테스트 API 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
