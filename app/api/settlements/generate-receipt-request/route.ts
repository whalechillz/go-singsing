import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tourId, golfCourseName, deposit, settlementDate, subtotal } = body;

    if (!tourId || !golfCourseName || !deposit) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 투어 정보 가져오기
    const { data: tour, error: tourError } = await supabase
      .from('singsing_tours')
      .select('*')
      .eq('id', tourId)
      .single();

    if (tourError || !tour) {
      return NextResponse.json(
        { error: '투어 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 날짜 포맷팅
    const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
    };

    const formatDateRange = (startDate: string, endDate?: string) => {
      if (!startDate) return '';
      const start = new Date(startDate);
      const end = endDate ? new Date(endDate) : start;
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      return `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}~${String(end.getDate()).padStart(2, '0')}(${days[start.getDay()]}~${days[end.getDay()]})`;
    };

    // 발행 요청 금액 계산 (계약금 - 환불금)
    const contractAmount = deposit.amount || 0;
    const refundAmount = 0; // 환불은 별도로 관리되므로 여기서는 0
    const issuanceAmount = contractAmount - refundAmount;

    // Excel 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 데이터 배열 생성
    const data = [
      ['세금계산서 발행 요청'],
      [],
      ['수신 :', golfCourseName],
      [],
      ['발신 :', '싱싱투어'],
      [],
      ['귀사의 무궁한 발전을 기원하며, 항상 협조해 주심에 깊이 감사드립니다.'],
      [],
      ['입금내역은 다음과 같습니다.'],
      [],
      [`1. ${formatDateRange(tour.start_date, tour.end_date)} 계약금 : ${contractAmount.toLocaleString()}원${deposit.date ? ` (${formatDate(deposit.date)} 출금)` : ''}`],
      [],
      [`2. 세금계산서 발행금액 ${issuanceAmount.toLocaleString()}원 (계약금-환불금)`],
      [],
      [],
      [],
      [],
      ['', '', '', '', formatDate(new Date().toISOString())],
      [],
      ['', '', '', '', '싱싱투어'],
      [],
      ['주소 :', '경기도 수원시 영통구 법조로149번길 200', '', '', '대표: 김탁수'],
      [],
      ['전화:', '031-215-3990 / 010-3332-9020']
    ];

    // 워크시트 생성
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // 열 너비 설정
    worksheet['!cols'] = [
      { wch: 15 }, // A
      { wch: 50 }, // B
      { wch: 10 }, // C
      { wch: 10 }, // D
      { wch: 15 }  // E
    ];

    // 셀 병합 및 스타일 설정
    // 제목 병합 (A1:E1)
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } });
    
    // 인사말 병합 (A7:E7)
    worksheet['!merges'].push({ s: { r: 6, c: 0 }, e: { r: 6, c: 4 } });
    
    // 입금내역 안내 병합 (A9:E9)
    worksheet['!merges'].push({ s: { r: 8, c: 0 }, e: { r: 8, c: 4 } });

    // 워크북에 워크시트 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, '세금계산서발행요청');

    // Excel 파일 버퍼 생성
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 파일명 생성
    const fileName = `세금계산서발행요청_${golfCourseName}_${deposit.date || new Date().toISOString().split('T')[0]}.xlsx`;

    // 응답 반환
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error: any) {
    console.error('세금계산서 발행 요청서 생성 오류:', error);
    return NextResponse.json(
      { error: `발행 요청서 생성 실패: ${error.message}` },
      { status: 500 }
    );
  }
}

