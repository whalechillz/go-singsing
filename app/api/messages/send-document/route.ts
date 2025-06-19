import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
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
    const body = await request.json();
    
    const {
      tourId,
      documentIds,
      participantIds,
      sendMethod,
      messageTemplate
    } = body;
    
    console.log('문서 발송 API 요청:', { 
      tourId, 
      documentIds: documentIds.length, 
      participantIds: participantIds.length, 
      sendMethod 
    });
    
    // 참가자 정보 가져오기
    let participants: Array<{id: string, name: string, phone: string}> = [];
    if (participantIds && participantIds.length > 0) {
      const { data, error } = await supabase
        .from('singsing_participants')
        .select('id, name, phone')
        .in('id', participantIds);
      
      if (error) {
        console.error('참가자 조회 오류:', error);
        throw new Error('참가자 정보를 가져올 수 없습니다.');
      }
      
      participants = data || [];
    }
    
    // 참가자가 없으면 에러
    if (participants.length === 0) {
      return NextResponse.json(
        { success: false, error: '발송할 참가자가 없습니다.' },
        { status: 400 }
      );
    }
    
    console.log(`${participants.length}명의 참가자에게 발송 예정`);
    
    // Solapi를 통한 실제 메시지 발송
    let actualSendMethod = sendMethod;
    let solapiResult: any = null;
    
    try {
      // 솔라피 메시지 데이터 생성
      const messages = participants.map((participant) => {
        const personalizedContent = messageTemplate.replace('#{이름}', participant.name || '고객님');
        const message: any = {
          to: participant.phone.replace(/-/g, ""),
          from: SOLAPI_SENDER.replace(/-/g, ""),
          text: personalizedContent,
        };
        
        // 카카오 알림톡 시도
        if (sendMethod === "kakao" && SOLAPI_PFID) {
          message.type = "ATA";
          message.kakaoOptions = {
            pfId: SOLAPI_PFID,
            // templateId는 실제 등록된 템플릿 ID로 변경 필요
            // 템플릿이 없으면 카카오톡 발송이 실패하고 SMS로 대체됩니다
            templateId: "singsing_document_link", // TODO: 실제 템플릿 ID로 변경
            disableSms: false // SMS 대체 발송 허용
          };
        } else {
          // SMS 발송
          message.type = "SMS";
          // 90바이트 초과시 자동으로 LMS로 전환
          if (personalizedContent.length > 90) {
            message.type = "LMS";
            message.subject = "[싱싱골프] 투어 문서 안내";
          }
        }
        
        return message;
      });

      // 솔라피 API 호출
      console.log("솔라피 API 호출 준비:", {
        messageCount: messages.length,
        sendMethod,
        hasPfid: !!SOLAPI_PFID,
        messageType: messages[0]?.type
      });

      const solapiResponse = await fetch("https://api.solapi.com/messages/v4/send-many", {
        method: "POST",
        headers: {
          ...getSignature(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      solapiResult = await solapiResponse.json();
      console.log("솔라피 응답:", { 
        status: solapiResponse.status, 
        result: solapiResult,
        groupId: solapiResult.groupId 
      });

      // 솔라피 응답이 성공이 아니면 에러 처리
      if (!solapiResponse.ok) {
        // 카카오 알림톡 실패시 SMS로 재시도
        if (sendMethod === "kakao" && solapiResult.message?.includes("template")) {
          console.log("카카오 알림톡 실패, SMS로 재시도");
          actualSendMethod = "sms";
          
          // SMS로 메시지 재구성
          const smsMessages = participants.map((participant) => {
            const personalizedContent = messageTemplate.replace('#{이름}', participant.name || '고객님');
            const message: any = {
              to: participant.phone.replace(/-/g, ""),
              from: SOLAPI_SENDER.replace(/-/g, ""),
              text: personalizedContent,
              type: personalizedContent.length > 90 ? "LMS" : "SMS"
            };
            
            if (message.type === "LMS") {
              message.subject = "[싱싱골프] 투어 문서 안내";
            }
            
            return message;
          });
          
          // SMS로 재발송
          const smsResponse = await fetch("https://api.solapi.com/messages/v4/send-many", {
            method: "POST",
            headers: {
              ...getSignature(),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ messages: smsMessages }),
          });
          
          solapiResult = await smsResponse.json();
          console.log("SMS 재발송 결과:", solapiResult);
          
          if (!smsResponse.ok) {
            throw new Error(solapiResult.message || "SMS 발송도 실패했습니다.");
          }
        } else {
          throw new Error(solapiResult.message || "솔라피 API 오류");
        }
      }
      
      // 메시지 로그 저장 (성공)
      try {
        const messageLogs = participants.map(participant => ({
          customer_id: participant.id,
          message_type: actualSendMethod === 'kakao' ? 'ALIMTALK' : 'SMS',
          template_id: 'document_link',
          phone_number: participant.phone,
          title: `[싱싱골프] 투어 문서 안내`,
          content: messageTemplate.replace('#{이름}', participant.name || '고객'),
          status: 'sent',
          tour_id: tourId,
          document_link_id: documentIds[0],
          recipient_name: participant.name,
          solapi_group_id: solapiResult.groupId
        }));
        
        await supabase.from('message_logs').insert(messageLogs);
      } catch (logError) {
        console.log('메시지 로그 저장 실패 (무시):', logError);
      }
      
      // 비용 계산
      const unitCost = actualSendMethod === 'kakao' ? 9 : 20;
      const totalCost = unitCost * participants.length;
      
      return NextResponse.json({
        success: true,
        message: `${participants.length}명에게 문서가 발송되었습니다. (${actualSendMethod === 'kakao' ? '카카오 알림톡' : 'SMS'})`,
        participantCount: participants.length,
        cost: totalCost,
        groupId: solapiResult.groupId,
        sendMethod: actualSendMethod
      });
      
    } catch (solapiError: any) {
      console.error('Solapi 발송 오류:', solapiError);
      
      // Solapi 오류 시에도 메시지 로그는 저장 (실패 상태로)
      try {
        const failedLogs = participants.map(participant => ({
          customer_id: participant.id,
          message_type: sendMethod === 'kakao' ? 'ALIMTALK' : 'SMS',
          template_id: 'document_link',
          phone_number: participant.phone,
          title: `[싱싱골프] 투어 문서 안내`,
          content: messageTemplate.replace('#{이름}', participant.name || '고객'),
          status: 'failed',
          tour_id: tourId,
          document_link_id: documentIds[0],
          recipient_name: participant.name,
          error_message: solapiError.message
        }));
        
        await supabase.from('message_logs').insert(failedLogs);
      } catch (logError) {
        console.log('실패 로그 저장 실패:', logError);
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: `메시지 발송 실패: ${solapiError.message}`,
          details: {
            message: solapiError.message,
            hasApiKey: !!SOLAPI_API_KEY,
            hasApiSecret: !!SOLAPI_API_SECRET,
            hasSender: !!SOLAPI_SENDER,
            hasPfid: !!SOLAPI_PFID
          }
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('문서 발송 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '발송 중 오류가 발생했습니다.',
        details: error.toString()
      },
      { status: 500 }
    );
  }
}
