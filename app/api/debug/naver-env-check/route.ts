import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 환경 변수 체크
    const clientId = process.env.NAVER_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || '';
    const clientSecret = process.env.NAVER_CLIENT_SECRET || '';
    
    const hasClientId = !!clientId && clientId.length > 0;
    const hasClientSecret = !!clientSecret && clientSecret.length > 0;
    
    // 환경 정보
    const environment = process.env.NODE_ENV;
    const isVercel = !!process.env.VERCEL;
    const vercelEnv = process.env.VERCEL_ENV;
    
    // Client ID 정보 (일부만 표시)
    const clientIdInfo = hasClientId 
      ? `${clientId.substring(0, 5)}...${clientId.substring(clientId.length - 3)} (${clientId.length} chars)`
      : 'Not found';
    
    // API 헤더 테스트
    let headerTest = null;
    if (hasClientId && hasClientSecret) {
      try {
        const testUrl = 'https://openapi.naver.com/v1/search/local.json?query=test&display=1';
        const response = await fetch(testUrl, {
          headers: {
            'X-Naver-Client-Id': clientId,
            'X-Naver-Client-Secret': clientSecret,
          }
        });
        
        headerTest = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        };
        
        if (!response.ok) {
          const errorText = await response.text();
          headerTest.error = errorText;
        } else {
          const data = await response.json();
          headerTest.success = true;
          headerTest.data = data;
        }
      } catch (error: any) {
        headerTest = {
          error: error.message,
          type: 'network_error'
        };
      }
    }
    
    // 모든 환경 변수 키 목록 (보안을 위해 값은 제외)
    const allEnvKeys = Object.keys(process.env)
      .filter(key => key.includes('NAVER'))
      .map(key => ({
        key,
        exists: true,
        length: process.env[key]?.length || 0
      }));
    
    return NextResponse.json({
      hasClientId,
      hasClientSecret,
      clientIdInfo,
      environment,
      isVercel,
      vercelEnv,
      headerTest,
      envKeys: allEnvKeys,
      timestamp: new Date().toISOString(),
      debug: {
        clientIdSource: clientId ? (process.env.NAVER_CLIENT_ID ? 'NAVER_CLIENT_ID' : 'NEXT_PUBLIC_NAVER_CLIENT_ID') : null,
        processEnvKeys: Object.keys(process.env).filter(k => k.includes('NAVER')).length,
      }
    });
    
  } catch (error: any) {
    console.error('Naver env check error:', error);
    return NextResponse.json(
      { 
        error: 'Environment check failed',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
