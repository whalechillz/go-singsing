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

// SMS용 바이트 계산 함수 (한글 2바이트)
function getByteLength(str: string): number {
  let byteLength = 0;
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    // ASCII 문자 (0x00-0x7F)
    if (charCode <= 0x7F) {
      byteLength += 1;
    } else {
      // 한글 및 기타 유니코드 문자는 2바이트로 계산
      byteLength += 2;
    }
  }
  return byteLength;
}

export async function POST(request: NextRequest) {
  // 환경 변수 확인
  const missingEnvVars = [];
  if (!SOLAPI_API_KEY) missingEnvVars.push('SOLAPI_API_KEY');
  if (!SOLAPI_API_SECRET) missingEnvVars.push('SOLAPI_API_SECRET');
  if (!SOLAPI_SENDER) missingEnvVars.push('SOLAPI_SENDER');
  
  if (missingEnvVars.length > 0) {
    console.error('필수 환경 변수 누락:', missingEnvVars);
    return NextResponse.json(
      { 
        success: false, 
        error: `필수 환경 변수가 설정되지 않았습니다: ${missingEnvVars.join(', ')}`,
        details: 'Vercel 대시보드에서 Settings > Environment Variables에 환경 변수를 추가해주세요.'
      },
      { status: 500 }
    );
  }
  
  try {
    const body = await request.json();
    
    const {
      tourId,
      documentIds,
      participantIds,
      sendMethod,
      messageTemplate,
      templateId,
      templateData,
      documentUrl // 추가: 실제 문서 URL
    } = body;
    
    console.log('문서 발송 API 요청:', { 
      tourId, 
      documentIds: Array.isArray(documentIds) ? documentIds.length : documentIds, 
      participantIds: Array.isArray(participantIds) ? participantIds.length : participantIds, 
      sendMethod,
      documentUrl,
      hasMessageTemplate: !!messageTemplate,
      hasTemplateData: !!templateData 
    });
    
    // 필수 필드 검증
    if (!messageTemplate) {
      return NextResponse.json(
        { success: false, error: '메시지 템플릿이 없습니다.' },
        { status: 400 }
      );
    }
    
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
    try {
      // 솔라피 메시지 데이터 생성
      const messages = participants.map((participant) => {
        // URL 파라미터 추출 (메시지 변환용)
        let urlParam = documentUrl || '';
        if (documentUrl && documentUrl.includes('/s/')) {
          urlParam = documentUrl.split('/s/')[1];
        } else if (documentUrl && documentUrl.includes('/portal/')) {
          urlParam = documentUrl.split('/portal/')[1];
        }
        
        // 템플릿 변수 치환
        let personalizedContent = '';
        try {
          personalizedContent = (messageTemplate || '')
            .replace('#{이름}', participant.name || '고객님')
            .replace(/#{url}/g, urlParam);
        } catch (replaceError) {
          console.error('템플릿 치환 오류:', replaceError);
          personalizedContent = `[싱싱골프] ${participant.name || '고객님'}님, 투어 문서를 확인해주세요: ${documentUrl || 'https://go.singsinggolf.kr'}`;
        }
        
        // 메시지 길이 확인 (SMS용 바이트 계산 - 한글 2바이트)
        const byteLength = getByteLength(personalizedContent);
        console.log(`메시지 길이 - 참가자: ${participant.name}, SMS바이트: ${byteLength}, 문자수: ${personalizedContent.length}`);
        
        // 메시지 내용 확인 (디버깅용)
        if (byteLength > 80) {
          console.log(`긴 메시지 내용 확인: ${personalizedContent.substring(0, 50)}...`);
        }
        
        const message: any = {
          to: participant.phone.replace(/-/g, "").replace(/\s/g, "").replace(/\+82/g, "0"), // 하이픈, 공백, 국가코드 제거
          from: SOLAPI_SENDER.replace(/-/g, "").replace(/\s/g, ""),
          text: personalizedContent,
        };
        
        // 전화번호 형식 확인
        if (!message.to.match(/^01[0-9]{8,9}$/)) {
          console.error(`잘못된 전화번호 형식: ${participant.phone} -> ${message.to}`);
        }
        
        // 카카오 알림톡 사용 시
        if (sendMethod === "kakao" && SOLAPI_PFID && templateData && templateData.kakao_template_code) {
          console.log('카카오 알림톡 설정:', {
            templateId: templateData.kakao_template_code,
            pfId: SOLAPI_PFID,
            templateName: templateData.kakao_template_name,
            hasButtons: !!templateData.buttons,
            documentUrl
          });
          // 카카오 알림톡으로 발송
          message.type = "ATA";
          message.kakaoOptions = {
            pfId: SOLAPI_PFID,
            templateId: templateData.kakao_template_code,
            disableSms: false // 실패 시 SMS로 대체 발송
          };
          
          // 버튼 추가 (있는 경우) - 실제 문서 URL 사용
          if (templateData.buttons && templateData.buttons.length > 0) {
            // URL 파라미터만 추출
            let urlParam = documentUrl || 'https://go.singsinggolf.kr';
            
            // 전체 URL에서 short_code만 추출
            if (documentUrl && documentUrl.includes('/s/')) {
              // https://go.singsinggolf.kr/s/bo6d6cre -> bo6d6cre
              urlParam = documentUrl.split('/s/')[1];
            } else if (documentUrl && documentUrl.includes('/portal/')) {
              // https://go.singsinggolf.kr/portal/bo6d6cre -> bo6d6cre
              urlParam = documentUrl.split('/portal/')[1];
            }
            
            console.log('URL 파라미터 추출:', {
              원본URL: documentUrl,
              추출된파라미터: urlParam
            });
            
            const processedButtons = templateData.buttons.map((btn: any) => {
              if (typeof btn === 'string') {
                try {
                  btn = JSON.parse(btn);
                } catch (e) {
                  console.error('버튼 파싱 오류:', e);
                }
              }
              
              // #{url}만 치환 (전체 경로가 아닌 파라미터만)
              const processedButton = {
                ...btn,
                linkMo: btn.linkMo?.replace(/#{url}/g, urlParam),
                linkPc: btn.linkPc?.replace(/#{url}/g, urlParam)
              };
              
              console.log('버튼 URL 치환:', {
                원본: btn.linkMo,
                치환후: processedButton.linkMo
              });
              
              return processedButton;
            });
            message.kakaoOptions.buttons = processedButtons;
            console.log('처리된 버튼:', processedButtons);
          }
        } else {
          // SMS/LMS로 발송
          // SMS는 90바이트까지, LMS는 2000바이트까지
          // 한글은 UTF-8에서 3바이트이므로 정확한 바이트 계산 필요
          message.type = byteLength > 90 ? "LMS" : "SMS";
          if (message.type === "LMS") {
            message.subject = "[싱싱골프] 투어 문서 안내";
          }
        }
        
        return message;
      });

      // 솔라피 API 호출
      console.log("솔라피 API 호출 준비:", {
        messageCount: messages.length,
        messageType: messages[0]?.type,
        firstPhone: messages[0]?.to,
        kakaoTemplateId: templateData?.kakao_template_code,
        hasKakaoOption: !!messages[0]?.kakaoOptions,
        pfId: SOLAPI_PFID
      });

      const solapiResponse = await fetch("https://api.solapi.com/messages/v4/send-many", {
        method: "POST",
        headers: {
          ...getSignature(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      const solapiResult = await solapiResponse.json();
      console.log("솔라피 응답:", { 
        status: solapiResponse.status, 
        result: solapiResult,
        groupId: solapiResult.groupId 
      });

      // 솔라피 응답이 성공이 아니면 에러 처리
      if (!solapiResponse.ok) {
        console.error('솔라피 API 에러 상세:', {
          status: solapiResponse.status,
          statusText: solapiResponse.statusText,
          result: solapiResult,
          templateData: {
            templateId: templateData?.kakao_template_code,
            templateName: templateData?.kakao_template_name,
            buttons: templateData?.buttons
          },
          firstMessage: messages[0]
        });
        throw new Error(solapiResult.message || solapiResult.error || `솔라피 API 오류: ${solapiResponse.status}`);
      }
      
      // 메시지 로그 저장 (성공)
      try {
        const messageLogs = participants.map(participant => ({
          customer_id: participant.id,
          message_type: messages[0]?.type || 'SMS',
          template_id: templateId || 'document_link',
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
      
      // 비용 계산 (현재는 SMS/LMS 기준)
      const unitCost = messages[0]?.type === 'LMS' ? 30 : 20; // LMS 30원, SMS 20원
      const totalCost = unitCost * participants.length;
      
      return NextResponse.json({
        success: true,
        message: `${participants.length}명에게 문서가 발송되었습니다. (${messages[0]?.type || 'SMS'})`,
        participantCount: participants.length,
        cost: totalCost,
        groupId: solapiResult.groupId,
        sendMethod: messages[0]?.type || 'SMS'
      });
      
    } catch (solapiError: any) {
      console.error('Solapi 발송 오류:', solapiError);
      
      // Solapi 오류 시에도 메시지 로그는 저장 (실패 상태로)
      try {
        const failedLogs = participants.map(participant => ({
          customer_id: participant.id,
          message_type: sendMethod === 'kakao' ? 'ALIMTALK' : 'SMS',
          template_id: templateId || 'document_link',
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
            hasSender: !!SOLAPI_SENDER
          }
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('문서 발송 오류:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '발송 중 오류가 발생했습니다.',
        details: {
          message: error.toString(),
          stack: error.stack,
          name: error.name
        }
      },
      { status: 500 }
    );
  }
}