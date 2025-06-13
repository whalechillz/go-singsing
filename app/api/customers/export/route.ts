import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // URL 파라미터 파싱
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const customerType = searchParams.get("customer_type");
    const marketingAgreed = searchParams.get("marketing_agreed");

    // 쿼리 구성
    let query = supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    // 필터 적용
    if (status) {
      query = query.eq("status", status);
    }
    if (customerType) {
      query = query.eq("customer_type", customerType);
    }
    if (marketingAgreed === "true") {
      query = query.eq("marketing_agreed", true);
    }

    const { data: customers, error } = await query;

    if (error) throw error;

    // 엑셀 데이터 형식 변환
    const excelData = (customers || []).map(customer => ({
      "이름": customer.name,
      "전화번호": customer.phone,
      "이메일": customer.email || "",
      "생년월일": customer.birth_date || "",
      "성별": customer.gender === "male" ? "남성" : customer.gender === "female" ? "여성" : "",
      "주소": customer.address || "",
      "메모": customer.notes || "",
      "태그": customer.tags?.join(",") || "",
      "마케팅동의": customer.marketing_agreed ? "Y" : "N",
      "카카오친구": customer.kakao_friend ? "Y" : "N",
      "고객유형": customer.customer_type === "vip" ? "VIP" : 
                customer.customer_type === "regular" ? "일반" : 
                customer.customer_type === "new" ? "신규" : "",
      "상태": customer.status === "active" ? "활성" : 
             customer.status === "inactive" ? "비활성" : "차단",
      "총투어횟수": customer.total_tour_count || 0,
      "총결제금액": customer.total_payment_amount || 0,
      "첫투어날짜": customer.first_tour_date || "",
      "마지막투어날짜": customer.last_tour_date || "",
      "등록일": new Date(customer.created_at).toLocaleDateString('ko-KR'),
      "마케팅동의일": customer.marketing_agreed_at ? new Date(customer.marketing_agreed_at).toLocaleDateString('ko-KR') : "",
      "카카오친구추가일": customer.kakao_friend_at ? new Date(customer.kakao_friend_at).toLocaleDateString('ko-KR') : ""
    }));

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    
    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 10 }, // 이름
      { wch: 15 }, // 전화번호
      { wch: 25 }, // 이메일
      { wch: 12 }, // 생년월일
      { wch: 8 },  // 성별
      { wch: 30 }, // 주소
      { wch: 30 }, // 메모
      { wch: 20 }, // 태그
      { wch: 10 }, // 마케팅동의
      { wch: 10 }, // 카카오친구
      { wch: 10 }, // 고객유형
      { wch: 8 },  // 상태
      { wch: 10 }, // 총투어횟수
      { wch: 12 }, // 총결제금액
      { wch: 12 }, // 첫투어날짜
      { wch: 15 }, // 마지막투어날짜
      { wch: 12 }, // 등록일
      { wch: 15 }, // 마케팅동의일
      { wch: 18 }, // 카카오친구추가일
    ];
    worksheet['!cols'] = columnWidths;

    // 워크북에 워크시트 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, "고객목록");

    // 통계 시트 추가
    const stats = {
      "전체고객수": customers?.length || 0,
      "활성고객수": customers?.filter(c => c.status === "active").length || 0,
      "VIP고객수": customers?.filter(c => c.customer_type === "vip").length || 0,
      "마케팅동의": customers?.filter(c => c.marketing_agreed).length || 0,
      "카카오친구": customers?.filter(c => c.kakao_friend).length || 0,
      "내보내기일시": new Date().toLocaleString('ko-KR')
    };

    const statsData = Object.entries(stats).map(([key, value]) => ({
      "항목": key,
      "값": value
    }));

    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    statsSheet['!cols'] = [{ wch: 15 }, { wch: 20 }];
    
    XLSX.utils.book_append_sheet(workbook, statsSheet, "통계");

    // 엑셀 파일로 변환
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'buffer' 
    });

    // 파일 다운로드 응답
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="customers_${new Date().toISOString().split('T')[0]}.xlsx"`,
      }
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "고객 목록 내보내기 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
