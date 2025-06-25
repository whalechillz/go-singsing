import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// HMAC 서명 생성
function getSignature() {
  const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY || "";
  const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET || "";
  
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

export async function GET(request: NextRequest) {
  try {
    // 환경변수 확인
    const hasKeys = {
      apiKey: !!process.env.SOLAPI_API_KEY,
      apiSecret: !!process.env.SOLAPI_API_SECRET,
      sender: !!process.env.SOLAPI_SENDER,
      sender_value: process.env.SOLAPI_SENDER
    };

    if (!hasKeys.apiKey || !hasKeys.apiSecret || !hasKeys.sender) {
      return NextResponse.json({
        success: false,
        message: "환경변수가 설정되지 않았습니다.",
        hasKeys
      });
    }

    // URL 파라미터로 형식 선택
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'simple';

    let testMessage: any;

    switch (format) {
      case 'wrapped':
        // message로 감싸기
        testMessage = {
          message: {
            to: "01066699000",
            from: process.env.SOLAPI_SENDER?.replace(/-/g, "") || "",
            text: "싱싱골프 테스트 메시지입니다.",
            type: "SMS"
          }
        };
        break;
      
      case 'array':
        // messages 배열
        testMessage = {
          messages: [{
            to: "01066699000",
            from: process.env.SOLAPI_SENDER?.replace(/-/g, "") || "",
            text: "싱싱골프 테스트 메시지입니다.",
            type: "SMS"
          }]
        };
        break;
      
      default:
        // 단순 형식
        testMessage = {
          to: "01066699000",
          from: process.env.SOLAPI_SENDER?.replace(/-/g, "") || "",
          text: "싱싱골프 테스트 메시지입니다.",
          type: "SMS"
        };
    }

    console.log(`테스트 형식: ${format}`);
    console.log("테스트 메시지:", JSON.stringify(testMessage, null, 2));

    // 솔라피 API 호출
    const headers = getSignature();
    const response = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testMessage)
    });

    const responseText = await response.text();
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { rawResponse: responseText };
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      format: format,
      result,
      testMessage,
      headers: Object.fromEntries(response.headers.entries()),
      testTime: new Date().toISOString(),
      availableFormats: [
        '/api/debug/test-sms?format=simple',
        '/api/debug/test-sms?format=wrapped',
        '/api/debug/test-sms?format=array'
      ]
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
