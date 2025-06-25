import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

const SOLAPI_API_KEY = process.env.SOLAPI_API_KEY || "";
const SOLAPI_API_SECRET = process.env.SOLAPI_API_SECRET || "";
const SOLAPI_PFID = process.env.SOLAPI_PFID || "";
const SOLAPI_SENDER = process.env.SOLAPI_SENDER || "";

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

export async function GET(request: NextRequest) {
  // 환경변수 상태
  const envStatus = {
    hasApiKey: !!SOLAPI_API_KEY,
    hasApiSecret: !!SOLAPI_API_SECRET,
    hasPfid: !!SOLAPI_PFID,
    pfidValue: SOLAPI_PFID,
    hasSender: !!SOLAPI_SENDER,
    senderValue: SOLAPI_SENDER
  };

  // 종합 여정 안내 템플릿 확인
  const { data: template, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('kakao_template_code', 'KA01TP250623020608338KLK7e8Ic71i')
    .single();

  // 테스트 메시지
  const testMessage = {
    to: "01012345678", // 테스트 번호
    from: SOLAPI_SENDER.replace(/-/g, ""),
    text: "테스트 메시지",
    type: "ATA",
    kakaoOptions: {
      pfId: SOLAPI_PFID,
      templateId: 'KA01TP250623020608338KLK7e8Ic71i',
      disableSms: false,
      buttons: [{
        type: "WL",
        name: "투어 안내 확인하기",
        linkMo: "https://go.singsinggolf.kr/s/test123",
        linkPc: "https://go.singsinggolf.kr/s/test123"
      }]
    }
  };

  return NextResponse.json({
    envStatus,
    template: {
      exists: !!template,
      data: template,
      error: error?.message
    },
    testMessage,
    timestamp: new Date().toISOString()
  });
}