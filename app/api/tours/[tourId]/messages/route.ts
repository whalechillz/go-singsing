import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 알리고 SMS API 설정
const ALIGO_API_URL = 'https://apis.aligo.in/send/';
const ALIGO_USER_ID = process.env.ALIGO_USER_ID || '';
const ALIGO_API_KEY = process.env.ALIGO_API_KEY || '';
const ALIGO_SENDER = process.env.ALIGO_SENDER || '031-215-3990';

// 카카오톡 알림톡 API 설정  
const KAKAO_API_URL = process.env.KAKAO_API_URL || '';
const KAKAO_SENDER_KEY = process.env.KAKAO_SENDER_KEY || '';
const KAKAO_TEMPLATE_CODE = process.env.KAKAO_TEMPLATE_CODE || '';

interface MessageRequest {
  tourId: string;
  message: string;
  messageType: 'sms' | 'kakao' | 'both';
  recipients?: string[]; // 특정 수신자 지정 (선택사항)
}

export async function POST(request: NextRequest) {
  try {
    const body: MessageRequest = await request.json();
    const { tourId, message, messageType, recipients } = body;

    // 1. 수신자 목록 가져오기
    let phoneNumbers: string[] = [];
    
    if (recipients && recipients.length > 0) {
      // 특정 수신자가 지정된 경우
      phoneNumbers = recipients;
    } else {
      // 투어 참가자 전체에게 발송
      const { data: participants, error } = await supabase
        .from('singsing_participants')
        .select('name, phone')
        .eq('tour_id', tourId);

      if (error) {
        throw new Error('참가자 목록을 가져올 수 없습니다.');
      }

      if (!participants || participants.length === 0) {
        return NextResponse.json(
          { success: false, error: '발송할 참가자가 없습니다.' },
          { status: 400 }
        );
      }

      phoneNumbers = participants
        .map(p => p.phone)
        .filter(phone => phone && phone.length > 0);
    }

    // 2. 발송 이력 저장을 위한 배치 ID 생성
    const batchId = `batch_${Date.now()}`;
    
    // 3. 메시지 발송
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    if (messageType === 'sms' || messageType === 'both') {
      // SMS 발송
      for (const phone of phoneNumbers) {
        try {
          await sendSMS(phone, message);
          results.success++;
          
          // 발송 이력 저장
          await saveMessageHistory({
            tour_id: tourId,
            batch_id: batchId,
            recipient_phone: phone,
            message_type: 'sms',
            message_content: message,
            status: 'success',
            sent_at: new Date().toISOString()
          });
        } catch (error) {
          results.failed++;
          results.errors.push(`SMS 발송 실패: ${phone}`);
          
          // 실패 이력 저장
          await saveMessageHistory({
            tour_id: tourId,
            batch_id: batchId,
            recipient_phone: phone,
            message_type: 'sms',
            message_content: message,
            status: 'failed',
            error_message: error instanceof Error ? error.message : '알 수 없는 오류',
            sent_at: new Date().toISOString()
          });
        }
      }
    }

    if (messageType === 'kakao' || messageType === 'both') {
      // 카카오톡 알림톡 발송
      for (const phone of phoneNumbers) {
        try {
          await sendKakaoTalk(phone, message);
          results.success++;
          
          // 발송 이력 저장
          await saveMessageHistory({
            tour_id: tourId,
            batch_id: batchId,
            recipient_phone: phone,
            message_type: 'kakao',
            message_content: message,
            status: 'success',
            sent_at: new Date().toISOString()
          });
        } catch (error) {
          // 카카오톡 실패시 SMS로 대체 발송
          if (messageType === 'both') {
            try {
              await sendSMS(phone, message);
              results.success++;
              
              await saveMessageHistory({
                tour_id: tourId,
                batch_id: batchId,
                recipient_phone: phone,
                message_type: 'sms',
                message_content: message,
                status: 'success',
                note: '카카오톡 실패로 SMS 대체 발송',
                sent_at: new Date().toISOString()
              });
            } catch (smsError) {
              results.failed++;
              results.errors.push(`카카오톡/SMS 모두 실패: ${phone}`);
            }
          } else {
            results.failed++;
            results.errors.push(`카카오톡 발송 실패: ${phone}`);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      batchId,
      results: {
        totalRecipients: phoneNumbers.length,
        successCount: results.success,
        failedCount: results.failed,
        errors: results.errors
      }
    });

  } catch (error) {
    console.error('메시지 발송 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '메시지 발송 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

// SMS 발송 함수 (알리고 API)
async function sendSMS(phone: string, message: string) {
  // 개발 환경에서는 실제 발송 대신 로그만
  if (process.env.NODE_ENV === 'development' || !ALIGO_API_KEY) {
    console.log('[개발모드] SMS 발송 시뮬레이션');
    console.log(`수신자: ${phone}`);
    console.log(`메시지: ${message}`);
    return { result_code: '1', message: '개발모드 - 발송 성공' };
  }

  const formData = new FormData();
  formData.append('key', ALIGO_API_KEY);
  formData.append('user_id', ALIGO_USER_ID);
  formData.append('sender', ALIGO_SENDER);
  formData.append('receiver', phone);
  formData.append('msg', message);
  formData.append('title', '[싱싱골프투어]');

  const response = await fetch(ALIGO_API_URL, {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  
  if (result.result_code !== '1') {
    throw new Error(result.message || 'SMS 발송 실패');
  }
  
  return result;
}

// 카카오톡 알림톡 발송 함수
async function sendKakaoTalk(phone: string, message: string) {
  // 개발 환경에서는 실제 발송 대신 로그만
  if (process.env.NODE_ENV === 'development' || !KAKAO_SENDER_KEY) {
    console.log('[개발모드] 카카오톡 발송 시뮬레이션');
    console.log(`수신자: ${phone}`);
    console.log(`메시지: ${message}`);
    // 개발 모드에서는 50% 확률로 실패 시뮬레이션
    if (Math.random() > 0.5) {
      throw new Error('카카오톡 발송 실패 (시뮬레이션)');
    }
    return { success: true };
  }
  
  // 실제 구현시 카카오 비즈메시지 API 연동
  // 여기서는 예시 코드입니다
  
  const response = await fetch(KAKAO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KAKAO_SENDER_KEY}`
    },
    body: JSON.stringify({
      template_code: KAKAO_TEMPLATE_CODE,
      receivers: [{
        receiver_num: phone,
        template_parameter: {
          message: message
        }
      }]
    })
  });

  if (!response.ok) {
    throw new Error('카카오톡 발송 실패');
  }

  return await response.json();
}

// 메시지 발송 이력 저장
async function saveMessageHistory(data: {
  tour_id: string;
  batch_id: string;
  recipient_phone: string;
  message_type: string;
  message_content: string;
  status: string;
  error_message?: string;
  note?: string;
  sent_at: string;
}) {
  // message_history 테이블이 없을 수 있으므로 try-catch로 감싸기
  try {
    const { error } = await supabase
      .from('message_history')
      .insert([data]);
      
    if (error) {
      console.error('메시지 이력 저장 실패:', error);
      // 테이블이 없어도 계속 진행
    }
  } catch (err) {
    console.error('메시지 이력 저장 오류:', err);
  }
}

// GET 요청 - 발송 이력 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tourId = searchParams.get('tourId');
  const batchId = searchParams.get('batchId');

  try {
    let query = supabase
      .from('message_history')
      .select('*')
      .order('sent_at', { ascending: false });

    if (tourId) {
      query = query.eq('tour_id', tourId);
    }
    
    if (batchId) {
      query = query.eq('batch_id', batchId);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '이력 조회 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
