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

    // 여러 형식 테스트
    const testFormats = [
      // 형식 1: 단순 객체
      {
        name: "Simple Format",
        body: {
          to: "01066699000",
          from: process.env.SOLAPI_SENDER?.replace(/-/g, "") || "",
          text: "싱싱골프 테스트 메시지입니다.",
          type: "SMS"
        }
      },
      // 형식 2: message 래핑
      {
        name: "Message Wrapped",
        body: {
          message: {
            to: "01066699000",
            from: process.env.SOLAPI_SENDER?.replace(/-/g, "") || "",
            text: "싱싱골프 테스트 메시지입니다.",
            type: "SMS"
          }
        }
      },
      // 형식 3: messages 배열
      {
        name: "Messages Array",
        body: {
          messages: [{
            to: "01066699000",
            from: process.env.SOLAPI_SENDER?.replace(/-/g, "") || "",
            text: "싱싱골프 테스트 메시지입니다.",
            type: "SMS"
          }]
        }
      }
    ];

    const results = [];

    for (const format of testFormats) {
      console.log(`테스트 형식: ${format.name}`);
      console.log("요청 body:", JSON.stringify(format.body, null, 2));

      try {
        const headers = getSignature();
        const response = await fetch("https://api.solapi.com/messages/v4/send", {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(format.body)
        });

        const responseText = await response.text();
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          result = { rawResponse: responseText };
        }

        results.push({
          format: format.name,
          success: response.ok,
          status: response.status,
          result
        });

      } catch (error: any) {
        results.push({
          format: format.name,
          success: false,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "여러 형식으로 테스트 완료",
      results,
      testTime: new Date().toISOString(),
      environment: {
        hasApiKey: !!process.env.SOLAPI_API_KEY,
        hasApiSecret: !!process.env.SOLAPI_API_SECRET,
        sender: process.env.SOLAPI_SENDER
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
