import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 알리고 API 설정
const ALIGO_API_URL = "https://apis.aligo.in/send/";
const ALIGO_USER_ID = process.env.ALIGO_USER_ID || "";
const ALIGO_API_KEY = process.env.ALIGO_API_KEY || "";
const ALIGO_SENDER = process.env.ALIGO_SENDER || "";

type MessageVariable = {
  key: string;
  value: string;
};

// 메시지 변수 치환 함수
function replaceVariables(template: string, variables: MessageVariable[]): string {
  let result = template;
  
  variables.forEach(variable => {
    // #{변수명} 형식의 변수를 치환
    const regex = new RegExp(`#\\{${variable.key}\\}`, 'g');
    result = result.replace(regex, variable.value);
  });
  
  return result;
}

// 재시도 로직을 위한 함수
async function sendWithRetry(
  url: string,
  formData: FormData,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<Response> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      
      // 알리고 API는 HTTP 200이어도 result_code로 성공 여부 판단
      if (result.result_code === "1") {
        return Response.json(result);
      }
      
      // 특정 오류는 재시도하지 않음
      if (result.message?.includes("잔액") || result.message?.includes("인증")) {
        throw new Error(result.message);
      }
      
      lastError = new Error(result.message || `API Error: ${result.result_code}`);
    } catch (error) {
      lastError = error;
    }
    
    // 재시도 전 대기 (지수 백오프)
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      recipients,
      title,
      content,
      template_id,
      variables = []
    } = body;

    // 발송 결과 저장
    const results = [];
    let totalCost = 0;

    // 각 수신자별로 발송 (변수 치환을 위해)
    for (const recipient of recipients) {
      try {
        // 변수 치환
        let finalContent = content;
        let finalTitle = title;
        
        if (variables.length > 0 || recipient.customer_id) {
          // 고객 정보 가져오기
          if (recipient.customer_id) {
            const { data: customer } = await supabase
              .from("customers")
              .select("*")
              .eq("id", recipient.customer_id)
              .single();
            
            if (customer) {
              // 고객 정보 변수
              const customerVariables: MessageVariable[] = [
                { key: "이름", value: customer.name },
                { key: "전화번호", value: customer.phone },
                { key: "이메일", value: customer.email || "" },
                { key: "생년월일", value: customer.birth_date || "" },
              ];
              
              // 최근 투어 정보 가져오기
              const { data: recentTour } = await supabase
                .from("tour_participants")
                .select(`
                  *,
                  tour:tour_id (
                    tour_name,
                    start_date,
                    end_date
                  )
                `)
                .eq("customer_id", recipient.customer_id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single();
              
              if (recentTour?.tour) {
                customerVariables.push(
                  { key: "투어명", value: recentTour.tour.tour_name },
                  { key: "출발일", value: new Date(recentTour.tour.start_date).toLocaleDateString('ko-KR') },
                  { key: "결제금액", value: recentTour.payment_amount?.toLocaleString() + "원" || "0원" }
                );
              }
              
              // 추가 변수와 병합
              const allVariables = [...customerVariables, ...variables];
              
              finalContent = replaceVariables(content, allVariables);
              if (title) {
                finalTitle = replaceVariables(title, allVariables);
              }
            }
          } else {
            // 고객 ID가 없는 경우 전달받은 변수만 사용
            finalContent = replaceVariables(content, variables);
            if (title) {
              finalTitle = replaceVariables(title, variables);
            }
          }
        }

        // 알리고 API 호출 데이터
        const formData = new FormData();
        formData.append("key", ALIGO_API_KEY);
        formData.append("user_id", ALIGO_USER_ID);
        formData.append("sender", ALIGO_SENDER);
        formData.append("receiver", recipient.phone.replace(/-/g, ""));
        formData.append("msg", finalContent);
        
        // 메시지 타입별 처리
        if (type === "lms" || type === "mms") {
          formData.append("msg_type", type.toUpperCase());
          if (finalTitle) {
            formData.append("title", finalTitle);
          }
        } else if (type === "kakao_alimtalk") {
          formData.append("msg_type", "AT");
          if (template_id) {
            formData.append("template_code", template_id);
          }
        } else {
          formData.append("msg_type", "SMS");
        }
        
        // 개발 환경에서는 테스트 모드
        if (process.env.NODE_ENV === "development") {
          formData.append("testmode_yn", "Y");
        }

        // 재시도 로직이 적용된 API 호출
        const response = await sendWithRetry(ALIGO_API_URL, formData, 3, 1000);
        const result = await response.json();
        
        // 비용 계산
        let cost = 0;
        if (type === "sms") cost = 20;
        else if (type === "lms") cost = 50;
        else if (type === "mms") cost = 100;
        else if (type === "kakao_alimtalk") cost = 10;
        
        totalCost += cost;
        
        results.push({
          phone: recipient.phone,
          success: true,
          message_id: result.msg_id,
          cost: cost
        });

        // 발송 로그 저장
        await supabase.from("message_logs").insert({
          customer_id: recipient.customer_id || null,
          message_type: type,
          template_id: template_id || null,
          phone_number: recipient.phone,
          title: finalTitle || null,
          content: finalContent,
          status: "sent",
          sent_at: new Date().toISOString(),
          cost: cost,
          aligo_msg_id: result.msg_id || null
        });

      } catch (error) {
        console.error("Error sending to", recipient.phone, error);
        results.push({
          phone: recipient.phone,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
        
        // 실패 로그 저장
        await supabase.from("message_logs").insert({
          customer_id: recipient.customer_id || null,
          message_type: type,
          template_id: template_id || null,
          phone_number: recipient.phone,
          title: title || null,
          content: content,
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    // 전체 결과 반환
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      total: recipients.length,
      sent: successCount,
      failed: failCount,
      cost: totalCost,
      results: results
    });

  } catch (error) {
    console.error("Aligo API error:", error);
    return NextResponse.json(
      { 
        error: "메시지 발송 중 오류가 발생했습니다.", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}
