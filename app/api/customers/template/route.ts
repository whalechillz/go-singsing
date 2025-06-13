import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    // 템플릿 데이터
    const templateData = [
      {
        "이름": "홍길동",
        "전화번호": "010-1234-5678",
        "이메일": "example@email.com",
        "생년월일": "1990-01-01",
        "성별": "남성",
        "주소": "서울특별시 강남구",
        "메모": "VIP 고객",
        "태그": "골프애호가,재방문고객",
        "마케팅동의": "Y",
        "카카오친구": "Y"
      },
      {
        "이름": "김영희",
        "전화번호": "010-9876-5432",
        "이메일": "kim@email.com",
        "생년월일": "1985-05-15",
        "성별": "여성",
        "주소": "경기도 성남시",
        "메모": "신규 고객",
        "태그": "초보골퍼",
        "마케팅동의": "N",
        "카카오친구": "N"
      }
    ];

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    
    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
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
      { wch: 12 }, // 마케팅동의
      { wch: 12 }, // 카카오친구
    ];
    worksheet['!cols'] = columnWidths;

    // 워크북에 워크시트 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, "고객정보");

    // 설명 시트 추가
    const instructionData = [
      { "항목": "이름", "설명": "고객 이름 (필수)", "예시": "홍길동" },
      { "항목": "전화번호", "설명": "휴대폰 번호 (필수, 010-0000-0000 형식)", "예시": "010-1234-5678" },
      { "항목": "이메일", "설명": "이메일 주소 (선택)", "예시": "example@email.com" },
      { "항목": "생년월일", "설명": "생년월일 (선택, YYYY-MM-DD 형식)", "예시": "1990-01-01" },
      { "항목": "성별", "설명": "성별 (선택, 남성/여성)", "예시": "남성" },
      { "항목": "주소", "설명": "거주지 주소 (선택)", "예시": "서울특별시 강남구" },
      { "항목": "메모", "설명": "고객 관련 메모 (선택)", "예시": "VIP 고객" },
      { "항목": "태그", "설명": "태그 (선택, 쉼표로 구분)", "예시": "골프애호가,재방문고객" },
      { "항목": "마케팅동의", "설명": "마케팅 수신 동의 (Y/N)", "예시": "Y" },
      { "항목": "카카오친구", "설명": "카카오 친구 추가 여부 (Y/N)", "예시": "Y" }
    ];
    
    const instructionSheet = XLSX.utils.json_to_sheet(instructionData);
    instructionSheet['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 25 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, instructionSheet, "작성안내");

    // 엑셀 파일로 변환
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'buffer' 
    });

    // 파일 다운로드 응답
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="customer_template_${new Date().toISOString().split('T')[0]}.xlsx"`,
      }
    });
  } catch (error) {
    console.error("Template download error:", error);
    return NextResponse.json(
      { error: "템플릿 다운로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
