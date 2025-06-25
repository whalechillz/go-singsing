import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 환경변수 확인 (민감한 정보는 일부만 표시)
  const envCheck = {
    hasKakaoJSKey: !!process.env.KAKAO_JAVASCRIPT_KEY,
    hasPublicKakaoJSKey: !!process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY,
    hasKakaoAppKey: !!process.env.NEXT_PUBLIC_KAKAO_APP_KEY,
    hasSolapiApiKey: !!process.env.SOLAPI_API_KEY,
    hasSolapiApiSecret: !!process.env.SOLAPI_API_SECRET,
    hasSolapiSender: !!process.env.SOLAPI_SENDER,
    hasSolapiPfid: !!process.env.SOLAPI_PFID,
    solapiSender: process.env.SOLAPI_SENDER || "not set",
    nodeEnv: process.env.NODE_ENV,
    // 부분적으로만 표시
    solapiApiKeyPrefix: process.env.SOLAPI_API_KEY?.substring(0, 5) + "...",
    kakaoJSKeyPrefix: process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY?.substring(0, 5) + "...",
  };

  return NextResponse.json({ 
    success: true, 
    envCheck,
    timestamp: new Date().toISOString()
  });
}
