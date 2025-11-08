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
    console.error('사용법: node scripts/input-suncheon-0414-expenses.js [tourId]');
    return;
  }

  console.log(`\n=== 순천 4/14~16 투어 비용 입력: ${tourId} ===\n`);

  // 이미지에서 추출한 데이터
  // 정산서 기준:
  // - 매출: 22,400,000원 (800,000 × 28명)
  // - 파인힐스: 16,128,000원 (576,000 × 28명)
  //   - 현금 4/11: 8,000,000원
  //   - 카드 4/16: 6,614,000원
  //   - 홀정산 환불: 1,514,000원
  //   - 실사용금액: 14,614,000원
  // - 지출: 2,480,800원
  //   - 버스: 2,310,000원 (770,000 × 3)
  //   - 김밥: 101,500원 (3,500 × 29)
  //   - 생수: 66,000원 (11,000 × 6)
  //   - 택배: 3,300원
  // - 수익: 3,791,200원

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
      quantity: 6,
      total: 66000
    }
  ];

  // 골프장 정산 정보
  // 파인힐스: 16,128,000원 (576,000 × 28)
  // - 현금 4/11: 8,000,000원
  // - 카드 4/16: 6,614,000원
  // - 홀정산 환불: 1,514,000원
  // - 실사용금액: 14,614,000원
  const golfCourseSettlement = [
    {
      golf_course_name: "파인힐스",
      date: "2025-04-14",
      items: [],
      subtotal: 16128000, // 576,000 × 28 = 16,128,000원
      deposit: 14614000, // 실사용금액 14,614,000원
      difference: 1514000, // 홀정산 환불 1,514,000원
      deposits: [
        {
          method: "cash",
          amount: 8000000,
          date: "2025-04-11",
          account: "",
          notes: "현금 4/11"
        },
        {
          method: "card",
          amount: 6614000,
          date: "2025-04-16",
          account: "",
          notes: "카드 4/16"
        }
      ],
      refunds: [
        {
          reason: "홀정산 환불",
          amount: 1514000,
          date: "2025-04-16",
          notes: ""
        }
      ],
      notes: "파인힐스 정산"
    }
  ];

  // tour_expenses 데이터
  // 이미지 기준: 골프장 실사용금액 14,614,000원 포함
  // 총 지출: 골프장 14,614,000 + 버스 2,310,000 + 김밥 101,500 + 생수 66,000 + 택배 3,300 = 17,094,800원
  const expensesData = {
    tour_id: tourId,
    golf_course_settlement: golfCourseSettlement,
    golf_course_total: 14614000, // 실사용금액 14,614,000원
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
    meal_expenses_total: 167500, // 김밥 101,500 + 생수 66,000 = 167,500원
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
      }
    ],
    other_expenses_total: 3300, // 택배
    notes: "순천 4/14~16 투어 정산",
    // 총 원가는 데이터베이스 트리거가 자동 계산
    // 이미지 기준: 골프장 14,614,000 + 버스 2,310,000 + 김밥 101,500 + 생수 66,000 + 택배 3,300 = 17,094,800원
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
  // 이미지 기준: 매출 22,400,000원 (800,000 × 28명)
  const contractRevenue = 22400000; // 매출 총액

  // 이미지 기준: 매출 22,400,000원 (800,000 × 28명)
  // 이미지 기준: 실사용금액 14,614,000원 (파인힐스 16,128,000 - 홀정산 환불 1,514,000)
  // 이미지 기준: 수익 3,791,200원
  // 정산 금액 = 매출 - 환불 = 22,400,000 - 1,514,000 = 20,886,000원
  // 또는 정산 금액 = 실사용금액 + (매출 - 실사용금액) = 14,614,000 + (22,400,000 - 14,614,000) = 22,400,000원
  // 하지만 이미지의 수익을 보면: 수익 = 정산 금액 - 총 원가 = 3,791,200원
  // 총 원가 = 정산 금액 - 수익 = 22,400,000 - 3,791,200 = 18,608,800원
  // 하지만 실제 총 원가는 골프장 14,614,000 + 버스 2,310,000 + 기타 170,800 = 17,094,800원
  // 이미지의 수익 계산: 수익 = 매출 - 지출 = 22,400,000 - (골프장 14,614,000 + 버스 2,310,000 + 기타 170,800) = 5,305,200원
  // 하지만 이미지에서는 수익이 3,791,200원으로 나와 있으므로, 정산 금액은 매출에서 환불을 뺀 금액으로 설정
  const totalPaidAmount = 22400000; // 매출 총액 (800,000 × 28명)
  const refundedAmount = 1514000; // 홀정산 환불
  const settlementAmountFinal = totalPaidAmount - refundedAmount; // 22,400,000 - 1,514,000 = 20,886,000원

  // 최신 tour_expenses의 total_cost 가져오기
  const { data: updatedExpenses } = await supabase
    .from('tour_expenses')
    .select('total_cost')
    .eq('tour_id', tourId)
    .single();
  const totalCost = updatedExpenses?.total_cost || expensesData.total_cost;
  
  // 이미지 기준: 수익(마진) = 3,791,200원
  // 정산 금액 14,614,000 - 총 원가 2,480,800 = 12,133,200원
  // 하지만 이미지에서는 수익이 3,791,200원으로 나와 있으므로, 이미지의 수익 값을 기준으로 마진 계산
  // 실제 계산: 마진 = 정산 금액 - 총 원가 = 14,614,000 - 2,480,800 = 12,133,200원
  // 이미지의 수익 값(3,791,200원)을 기준으로 마진 설정
  const expectedMargin = 3791200; // 이미지 기준 수익(마진)
  const calculatedMargin = settlementAmountFinal - totalCost; // 실제 계산 마진
  const discrepancy = calculatedMargin - expectedMargin; // 계산 차이
  
  const margin = expectedMargin; // 이미지 기준 수익(마진)
  const marginRate = settlementAmountFinal > 0 ? (margin / settlementAmountFinal) * 100 : 0; // 25.95%
  
  // 계산 차이가 1,000원 이상이면 확인 필요로 표시
  const needsReview = Math.abs(discrepancy) > 1000;

  const settlementData = {
    tour_id: tourId,
    contract_revenue: contractRevenue,
    total_paid_amount: totalPaidAmount,
    refunded_amount: refundedAmount,
    settlement_amount: settlementAmountFinal,
    total_cost: totalCost,
    margin: calculatedMargin, // 실제 계산 마진
    margin_rate: settlementAmountFinal > 0 ? (calculatedMargin / settlementAmountFinal) * 100 : 0,
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
    console.log(`정산 금액: ${settlementAmountFinal.toLocaleString()}원`);
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
  console.error('사용법: node scripts/input-suncheon-0414-expenses.js [tourId]');
  process.exit(1);
}
inputTourExpenses(tourId);

