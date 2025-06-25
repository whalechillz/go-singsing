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
      sender: !!process.env.SOLAPI_SENDER
    };

    if (!hasKeys.apiKey || !hasKeys.apiSecret || !hasKeys.sender) {
      return NextResponse.json({
        success: false,
        message: "환경변수가 설정되지 않았습니다.",
        hasKeys
      });
    }

    // 솔라피 계정 잔액 조회 API 테스트
    const headers = getSignature();
    const response = await fetch("https://api.solapi.com/cash/v2/balance", {
      method: "GET",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
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
      result,
      headers: Object.fromEntries(response.headers.entries()),
      testTime: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
