const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inputTourExpenses(tourId) {
  if (!tourId) {
    console.error('사용법: node scripts/input-suncheon-0519-expenses.js [tourId]');
    return;
  }

  console.log(`\n=== 순천 5/19~21 투어 비용 입력: ${tourId} ===\n`);

  // 이미지에서 추출한 데이터
  // 정산서 기준:
  // - 매출: 23,880,000원 (870,000 × 4 + 850,000 × 24)
  // - 입금가: 16,732,000원 (파인힐스 16,828,000 - 갤러리 96,000)
  // - 지출: 2,912,050원
  //   - 버스: 2,310,000원 (770,000 × 3)
  //   - 김밥: 101,500원 (3,500 × 29)
  //   - 생수: 22,000원 (11,000 × 2)
  //   - 와인: 172,630원
  //   - 택배: 3,300원
  //   - 비씨등기: 2,620원
  //   - 기사팁: 300,000원
  // - 수익: 4,235,950원

  const mealExpenses = [
    {
      type: "gimbap",
      description: "김밥",
      unit_price: 3500,
      quantity: 29,
      total: 101500
    },
    {
      type: "water",
      description: "생수",
      unit_price: 11000,
      quantity: 2,
      total: 22000
    },
    {
      type: "wine",
      description: "와인",
      unit_price: 172630,
      quantity: 1,
      total: 172630
    }
  ];

  // 골프장 정산 정보
  // 파인힐스: 16,828,000원 (601,000 × 28)
  // - 갤러리: 96,000원 (박묘철팀 1명 부상으로 갤러리 참여)
  // - 입금가: 16,732,000원 (파인힐스 16,828,000 - 갤러리 96,000)
  //   - 농협: 8,300,000원
  //   - 카드: 8,432,000원
  const golfCourseSettlement = [
    {
      golf_course_name: "파인힐스",
      date: "2025-05-19",
      items: [],
      subtotal: 16828000, // 601,000 × 28 = 16,828,000원
      deposit: 16732000, // 입금가 16,732,000원 (파인힐스 16,828,000 - 갤러리 96,000)
      difference: 96000, // 갤러리 96,000원
      deposits: [
        {
          method: "bank",
          amount: 8300000,
          date: "2025-05-19",
          account: "농협 615082-55-000077 (주)파인힐스",
          notes: "농협"
        },
        {
          method: "card",
          amount: 8432000,
          date: "2025-05-19",
          account: "",
          notes: "카드"
        }
      ],
      refunds: [
        {
          reason: "갤러리 참여",
          amount: 96000,
          date: "2025-05-19",
          notes: "박묘철팀 1명 부상으로 갤러리 참여"
        }
      ],
      notes: "파인힐스 정산"
    }
  ];

  // tour_expenses 데이터
  // 이미지 기준: 골프장 입금가 16,732,000원 포함
  // 총 지출: 골프장 16,732,000 + 버스 2,310,000 + 김밥 101,500 + 생수 22,000 + 와인 172,630 + 택배 3,300 + 비씨등기 2,620 + 기사팁 300,000 = 19,644,050원
  const expensesData = {
    tour_id: tourId,
    golf_course_settlement: golfCourseSettlement,
    golf_course_total: 16732000, // 입금가 16,732,000원
    bus_cost: 2310000, // 버스 770,000 × 3 = 2,310,000원
    bus_driver_cost: 0,
    toll_fee: 0,
    parking_fee: 0,
    bus_notes: "기업 052-053625-01-017 스위스관광㈜",
    guide_fee: 0,
    guide_meal_cost: 0,
    guide_accommodation_cost: 0,
    guide_other_cost: 0,
    guide_notes: "",
    meal_expenses: mealExpenses,
    meal_expenses_total: 296130, // 김밥 101,500 + 생수 22,000 + 와인 172,630 = 296,130원
    accommodation_cost: 0,
    restaurant_cost: 0,
    attraction_fee: 0,
    insurance_cost: 0,
    other_expenses: [
      {
        type: "delivery",
        description: "택배",
        unit_price: 3300,
        quantity: 1,
        total: 3300
      },
      {
        type: "bc_registration",
        description: "비씨등기",
        unit_price: 2620,
        quantity: 1,
        total: 2620
      },
      {
        type: "driver_tip",
        description: "기사팁",
        unit_price: 300000,
        quantity: 1,
        total: 300000
      }
    ],
    other_expenses_total: 305920, // 택배 3,300 + 비씨등기 2,620 + 기사팁 300,000 = 305,920원
    notes: "순천 5/19~21 투어 정산",
    // 총 원가는 데이터베이스 트리거가 자동 계산
    // 이미지 기준: 버스 2,310,000 + 김밥 101,500 + 생수 22,000 + 와인 172,630 + 택배 3,300 + 비씨등기 2,620 + 기사팁 300,000 = 2,912,050원
  };

  try {
    // 기존 tour_expenses 확인
    const { data: existingExpenses } = await supabase
      .from('tour_expenses')
      .select('id')
      .eq('tour_id', tourId)
      .single();

    if (existingExpenses) {
      // 업데이트
      console.log('기존 원가 데이터를 업데이트합니다...');
      const { data, error } = await supabase
        .from('tour_expenses')
        .update(expensesData)
        .eq('tour_id', tourId)
        .select()
        .single();

      if (error) throw error;
      console.log('✅ 원가 데이터가 업데이트되었습니다.');
      console.log(`총 원가: ${data.total_cost?.toLocaleString()}원`);
    } else {
      // 생성 (id 포함)
      console.log('새로운 원가 데이터를 생성합니다...');
      const expensesDataWithId = {
        id: randomUUID(),
        ...expensesData
      };
      const { data, error } = await supabase
        .from('tour_expenses')
        .insert([expensesDataWithId])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ 원가 데이터가 생성되었습니다.');
      console.log(`총 원가: ${data.total_cost?.toLocaleString()}원`);
    }

    // tour_settlements 업데이트 (정산 금액 계산)
    await updateSettlementData(tourId, expensesData);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

async function updateSettlementData(tourId, expensesData) {
  // 투어 정보 가져오기 (가격)
  const { data: tour } = await supabase
    .from('singsing_tours')
    .select('price')
    .eq('id', tourId)
    .single();

  // 참가자 수 가져오기
  const { count: participantCount } = await supabase
    .from('singsing_participants')
    .select('*', { count: 'exact', head: true })
    .eq('tour_id', tourId);

  // 결제 내역 가져오기
  const { data: payments } = await supabase
    .from('singsing_payments')
    .select('amount, payment_status, payment_type')
    .eq('tour_id', tourId);

  const tourPrice = tour?.price || 0;
  // 이미지 기준: 매출 23,880,000원 (870,000 × 4 + 850,000 × 24)
  const contractRevenue = 23880000; // 매출 총액

  // 이미지 기준: 매출 23,880,000원 (870,000 × 4 + 850,000 × 24)
  // 이미지 기준: 입금가 16,732,000원 (파인힐스 16,828,000 - 갤러리 96,000)
  // 이미지 기준: 수익 4,235,950원
  // 정산 금액 = 매출 - 환불 = 23,880,000 - 0 = 23,880,000원
  // 이미지의 수익 계산: 수익 = 정산 금액 - 총 원가 = 4,235,950원
  // 총 원가 = 정산 금액 - 수익 = 23,880,000 - 4,235,950 = 19,644,050원
  // 실제 총 원가는 골프장 16,732,000 + 버스 2,310,000 + 기타 602,050 = 19,644,050원 (일치)
  const totalPaidAmount = 23880000; // 매출 총액 (870,000 × 4 + 850,000 × 24)
  const refundedAmount = 0; // 환불 없음
  const settlementAmount = totalPaidAmount - refundedAmount; // 23,880,000원

  // 최신 tour_expenses의 total_cost 가져오기
  const { data: updatedExpenses } = await supabase
    .from('tour_expenses')
    .select('total_cost')
    .eq('tour_id', tourId)
    .single();
  const totalCost = updatedExpenses?.total_cost || expensesData.total_cost;
  
  // 이미지 기준: 수익(마진) = 4,235,950원
  // 정산 금액 16,732,000 - 총 원가 2,912,050 = 13,819,950원
  // 하지만 이미지에서는 수익이 4,235,950원으로 나와 있으므로, 이미지의 수익 값을 기준으로 마진 계산
  // 실제 계산: 마진 = 정산 금액 - 총 원가 = 16,732,000 - 2,912,050 = 13,819,950원
  // 이미지의 수익 값(4,235,950원)을 기준으로 마진 설정
  const expectedMargin = 4235950; // 이미지 기준 수익(마진)
  const calculatedMargin = settlementAmount - totalCost; // 실제 계산 마진
  const discrepancy = calculatedMargin - expectedMargin; // 계산 차이
  
  const margin = expectedMargin; // 이미지 기준 수익(마진)
  const marginRate = settlementAmount > 0 ? (margin / settlementAmount) * 100 : 0; // 25.30%
  
  // 계산 차이가 1,000원 이상이면 확인 필요로 표시
  const needsReview = Math.abs(discrepancy) > 1000;

  const settlementData = {
    tour_id: tourId,
    contract_revenue: contractRevenue,
    total_paid_amount: totalPaidAmount,
    refunded_amount: refundedAmount,
    settlement_amount: settlementAmount,
    total_cost: totalCost,
    margin: calculatedMargin, // 실제 계산 마진
    margin_rate: settlementAmount > 0 ? (calculatedMargin / settlementAmount) * 100 : 0,
    expected_margin: expectedMargin, // 예상 마진 (이미지 기준)
    calculation_discrepancy: discrepancy, // 계산 차이
    needs_review: needsReview, // 확인 필요 여부
    status: 'completed' // 정산 완료로 가정
  };

  try {
    const { data: existingSettlement } = await supabase
      .from('tour_settlements')
      .select('id')
      .eq('tour_id', tourId)
      .single();

    if (existingSettlement) {
      // 업데이트
      const { error } = await supabase
        .from('tour_settlements')
        .update(settlementData)
        .eq('tour_id', tourId);
      if (error) throw error;
    } else {
      // 생성
      const { error } = await supabase
        .from('tour_settlements')
        .insert([settlementData]);
      if (error) throw error;
    }
    console.log('✅ 정산 데이터가 생성되었습니다.');
    console.log('\n=== 정산 요약 ===');
    console.log(`계약 매출: ${contractRevenue.toLocaleString()}원`);
    console.log(`완납 금액: ${totalPaidAmount.toLocaleString()}원`);
    console.log(`환불 금액: ${refundedAmount.toLocaleString()}원`);
    console.log(`정산 금액: ${settlementAmount.toLocaleString()}원`);
    console.log(`총 원가: ${totalCost.toLocaleString()}원`);
    console.log(`계산된 마진: ${calculatedMargin.toLocaleString()}원`);
    console.log(`예상 마진: ${expectedMargin.toLocaleString()}원`);
    console.log(`계산 차이: ${discrepancy.toLocaleString()}원`);
    console.log(`확인 필요: ${needsReview ? '예' : '아니오'}`);

  } catch (error) {
    console.error('❌ 정산 데이터 업데이트 오류:', error);
  }
}

const tourId = process.argv[2];
if (!tourId) {
  console.error('투어 ID를 입력하세요.');
  console.error('사용법: node scripts/input-suncheon-0519-expenses.js [tourId]');
  process.exit(1);
}
inputTourExpenses(tourId);

