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
    console.error('사용법: node scripts/input-yeongdeok-0421-expenses.js [tourId]');
    return;
  }

  console.log(`\n=== 영덕 4/21~23 투어 비용 입력: ${tourId} ===\n`);

  // 이미지에서 추출한 데이터
  // 정산서 기준:
  // - 매출: 12,800,000원 (800,000 × 16명)
  // - 오션비치: 9,336,000원 (583,500 × 16)
  //   - 현금: 4,600,000원
  //   - 카드: 4,736,000원
  // - 지출: 2,543,140원
  //   - 버스: 2,310,000원 (770,000 × 3)
  //   - 김밥: 59,500원 (3,500 × 17)
  //   - 생수: 33,000원 (11,000 × 3)
  //   - 와인: 120,000원 (30,000 × 4)
  //   - 와인오프너: 9,300원 (10개)
  //   - 와인잔: 11,340원 (30개)
  //   - 택배: 11,340원 (3,300 × 3)
  // - 수익: 920,860원
  // - COM (1인당): 57,554원 (920,860 / 16)

  // 골프장 정산 정보
  // 오션비치: 9,336,000원 (583,500 × 16)
  // - 현금: 4,600,000원
  // - 카드: 4,736,000원
  const golfCourseSettlement = [
    {
      golf_course_name: "오션비치",
      date: "2025-04-21",
      items: [],
      subtotal: 9336000, // 583,500 × 16 = 9,336,000원
      deposit: 9336000, // 입금가 9,336,000원
      difference: 0,
      deposits: [
        {
          method: "cash",
          amount: 4600000,
          date: "2025-04-21",
          account: "",
          notes: "현금"
        },
        {
          method: "card",
          amount: 4736000,
          date: "2025-04-21",
          account: "",
          notes: "카드"
        }
      ],
      refunds: [],
      notes: "오션비치 정산"
    }
  ];

  const mealExpenses = [
    {
      type: "gimbap",
      description: "김밥",
      unit_price: 3500,
      quantity: 17,
      total: 59500
    },
    {
      type: "water",
      description: "생수",
      unit_price: 11000,
      quantity: 3,
      total: 33000
    }
  ];

  const otherExpenses = [
    {
      type: "wine",
      description: "와인",
      unit_price: 30000,
      quantity: 4,
      total: 120000
    },
    {
      type: "wine_opener",
      description: "와인오프너",
      unit_price: 930,
      quantity: 10,
      total: 9300
    },
    {
      type: "wine_glass",
      description: "와인잔",
      unit_price: 378,
      quantity: 30,
      total: 11340
    },
    {
      type: "delivery",
      description: "택배",
      unit_price: 3300,
      quantity: 3,
      total: 9900
    }
  ];

  // tour_expenses 데이터
  // 이미지 기준: 골프장 입금가 9,336,000원 포함
  // 총 지출: 골프장 9,336,000 + 버스 2,310,000 + 김밥 59,500 + 생수 33,000 + 와인 120,000 + 와인오프너 9,300 + 와인잔 11,340 + 택배 9,900 = 11,889,040원
  const expensesData = {
    tour_id: tourId,
    golf_course_settlement: golfCourseSettlement,
    golf_course_total: 9336000, // 입금가 9,336,000원
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
    meal_expenses_total: 92500, // 김밥 59,500 + 생수 33,000 = 92,500원
    accommodation_cost: 0,
    restaurant_cost: 0,
    attraction_fee: 0,
    insurance_cost: 0,
    other_expenses: otherExpenses,
    other_expenses_total: 150540, // 와인 120,000 + 와인오프너 9,300 + 와인잔 11,340 + 택배 9,900 = 150,540원
    notes: "영덕 4/21~23 투어 정산",
    // 총 원가는 데이터베이스 트리거가 자동 계산
    // 이미지 기준: 골프장 9,336,000 + 버스 2,310,000 + 김밥 59,500 + 생수 33,000 + 와인 120,000 + 와인오프너 9,300 + 와인잔 11,340 + 택배 9,900 = 11,889,040원
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
  // 이미지 기준: 매출 12,800,000원 (800,000 × 16명)
  const contractRevenue = 12800000; // 매출 총액

  // 이미지 기준: 매출 12,800,000원 (800,000 × 16명)
  // 이미지 기준: 수익 920,860원
  // 정산 금액 = 매출 - 환불 = 12,800,000 - 0 = 12,800,000원
  // 이미지의 수익 계산: 수익 = 정산 금액 - 총 원가 = 920,860원
  // 총 원가 = 정산 금액 - 수익 = 12,800,000 - 920,860 = 11,879,140원
  // 실제 총 원가는 골프장 9,336,000 + 버스 2,310,000 + 김밥 59,500 + 생수 33,000 + 와인 120,000 + 와인오프너 9,300 + 와인잔 11,340 + 택배 9,900 = 11,889,040원
  // 이미지의 수익 계산: 수익 = 정산 금액 - 총 원가 = 12,800,000 - 11,889,040 = 910,960원
  // 하지만 이미지에서는 수익이 920,860원으로 나와 있으므로, 정산 금액은 매출에서 환불을 뺀 금액으로 설정
  // 정산 금액 = 매출 - 환불 = 12,800,000 - 0 = 12,800,000원
  // 실제 마진 = 정산 금액 - 총 원가 = 12,800,000 - 11,889,040 = 910,960원
  // 이미지의 수익 값(920,860원)과 실제 계산 마진(910,960원)이 다르므로, 실제 계산 마진을 사용
  const totalPaidAmount = 12800000; // 완납 금액 (매출 총액)
  const refundedAmount = 0; // 환불 없음
  const settlementAmount = totalPaidAmount - refundedAmount; // 12,800,000원

  // 최신 tour_expenses의 total_cost 가져오기
  const { data: updatedExpenses } = await supabase
    .from('tour_expenses')
    .select('total_cost')
    .eq('tour_id', tourId)
    .single();
  const totalCost = updatedExpenses?.total_cost || expensesData.total_cost;
  
  // 실제 계산 마진: 정산 금액 - 총 원가
  const calculatedMargin = settlementAmount - totalCost; // 12,800,000 - 11,889,040 = 910,960원
  const marginRate = settlementAmount > 0 ? (calculatedMargin / settlementAmount) * 100 : 0; // 7.11%
  
  // 이미지의 수익 값(920,860원)과 실제 계산 마진(910,960원) 비교
  const expectedMargin = 920860; // 이미지 기준 수익(마진)
  const discrepancy = calculatedMargin - expectedMargin; // 계산 차이
  const needsReview = Math.abs(discrepancy) > 1000; // 1,000원 이상 차이면 확인 필요
  
  // 1인당 COM 계산
  const comPerPerson = participantCount && participantCount > 0
    ? Math.floor(calculatedMargin / participantCount)
    : 0;
  
  console.log(`\n⚠️  주의: 이미지의 수익(${expectedMargin.toLocaleString()}원)과 실제 계산 마진(${calculatedMargin.toLocaleString()}원)이 다릅니다.`);
  console.log(`   차이: ${discrepancy.toLocaleString()}원`);
  console.log(`   확인 필요: ${needsReview ? '예' : '아니오'}`);
  console.log(`   1인당 COM: ${comPerPerson.toLocaleString()}원 (참가자 ${participantCount}명)`);

  const settlementData = {
    tour_id: tourId,
    contract_revenue: contractRevenue,
    total_paid_amount: totalPaidAmount,
    refunded_amount: refundedAmount,
    settlement_amount: settlementAmount,
    total_cost: totalCost,
    margin: calculatedMargin, // 실제 계산 마진
    margin_rate: marginRate,
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
    console.log(`마진률: ${marginRate.toFixed(2)}%`);
    console.log(`1인당 COM: ${comPerPerson.toLocaleString()}원 (참가자 ${participantCount}명)`);
    console.log(`확인 필요: ${needsReview ? '예' : '아니오'}`);

  } catch (error) {
    console.error('❌ 정산 데이터 업데이트 오류:', error);
  }
}

const tourId = process.argv[2] || '42ec1758-08da-4372-a55c-efc57e9dd351'; // 영덕 4/21~23 투어 ID
inputTourExpenses(tourId);


