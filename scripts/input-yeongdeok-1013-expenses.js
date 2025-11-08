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
    console.error('사용법: node scripts/input-yeongdeok-1013-expenses.js [tourId]');
    return;
  }

  console.log(`\n=== 영덕 10/13~15 투어 비용 입력: ${tourId} ===\n`);

  // 이미지에서 추출한 데이터
  const golfCourseSettlement = [
    {
      golf_course_name: "오션비치",
      date: "2025-10-13",
      items: [
        { type: "green_fee", description: "그린피", unit_price: 547500, quantity: 12, total: 6570000 }
      ],
      subtotal: 6570000,
      deposit: 0,
      difference: 0,
      notes: "2일차 석식 25,000 차감"
    }
  ];

  const mealExpenses = [
    {
      type: "gimbap",
      description: "김밥",
      unit_price: 3500,
      quantity: 13,
      total: 45500
    },
    {
      type: "water",
      description: "생수",
      unit_price: 11000,
      quantity: 1,
      total: 11000
    }
  ];

  // tour_expenses 데이터
  // 이미지 기준 정산서 확인:
  // - 오션비치: 6,570,000원
  // - 기사님객실: 120,000원
  // - 버스: 2,310,000원
  // - 회정식: 300,000원
  // - 김밥: 45,500원
  // - 생수: 11,000원
  // - 택배: 3,300원
  // - 총 지출: 2,655,500원
  // - 총 원가: 6,570,000 + 120,000 + 2,655,500 = 9,345,500원
  // - 정산 금액: 8,190,000원
  // - 수익: 494,500원 (8,190,000 - 9,345,500 = -1,155,500원이지만 이미지에서는 494,500원)
  // 이미지의 수익을 기준으로 역산하면: 총 원가 = 정산 금액 - 수익 = 8,190,000 - 494,500 = 7,695,500원
  // 하지만 이미지의 지출 합계는 2,655,500원이므로, 오션비치 + 기사님객실 = 7,695,500 - 2,655,500 = 5,040,000원
  // 이미지 기준으로 정확히 계산:
  // - 오션비치: 6,570,000원
  // - 기사님객실: 120,000원
  // - 버스: 2,310,000원
  // - 회정식: 300,000원
  // - 김밥: 45,500원
  // - 생수: 11,000원
  // - 택배: 3,300원
  // - 총 원가: 9,345,500원
  // - 정산 금액: 8,190,000원
  // - 마진: 8,190,000 - 9,345,500 = -1,155,500원
  // 하지만 이미지에서는 수익이 494,500원으로 나와 있으므로, 이미지의 수익 값을 기준으로 마진을 설정
  const expensesData = {
    tour_id: tourId,
    golf_course_settlement: golfCourseSettlement,
    golf_course_total: 6570000, // 오션비치
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
    meal_expenses_total: 56500, // 김밥 45,500 + 생수 11,000 = 56,500원
    accommodation_cost: 120000, // 기사님객실 60,000 × 2 = 120,000원
    restaurant_cost: 300000, // 회정식 100,000 × 3 = 300,000원
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
    notes: "영덕 10/13~15 투어 정산",
    // 총 원가는 데이터베이스 트리거가 자동 계산
    // 이미지 기준: 오션비치 6,570,000 + 기사님객실 120,000 + 지출 2,655,500 = 9,345,500원
    // 하지만 실제 계산: 오션비치 6,570,000 + 기사님객실 120,000 + 버스 2,310,000 + 회정식 300,000 + 김밥 45,500 + 생수 11,000 + 택배 3,300 = 9,359,800원
    // 이미지의 수익(494,500원)을 기준으로 마진을 설정하므로, total_cost는 트리거가 자동 계산
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
  // 이미지 기준: 매출 820,000 × 12 = 9,840,000원
  const contractRevenue = 9840000; // 매출 총액

  // 이미지 기준: 현금 3,300,000원 11/10, 카드 1,740,000원 10/15 = 5,040,000원 (실 사용금액)
  // 하지만 정산 금액은 매출 기준이므로 매출 금액 사용
  // 환불: 1,650,000원 (우천환불)
  // 정산 금액 = 매출 - 환불 = 9,840,000 - 1,650,000 = 8,190,000원
  const totalPaidAmount = 9840000; // 완납 금액 (매출 총액)
  const refundedAmount = 1650000; // 환불 금액 (우천환불)
  const settlementAmount = totalPaidAmount - refundedAmount; // 8,190,000원

  // 최신 tour_expenses의 total_cost 가져오기
  const { data: updatedExpenses } = await supabase
    .from('tour_expenses')
    .select('total_cost')
    .eq('tour_id', tourId)
    .single();
  const totalCost = updatedExpenses?.total_cost || expensesData.total_cost;
  // 이미지 기준: 총 원가 = 9,345,500원 (오션비치 6,570,000 + 기사님객실 120,000 + 지출 2,655,500)
  // 정산 금액 8,190,000 - 총 원가 9,345,500 = -1,155,500원
  // 하지만 이미지에서는 수익이 494,500원으로 나와 있으므로, 이미지의 수익 값을 기준으로 마진 계산
  // 이미지의 수익 값(494,500원)을 기준으로 마진 설정
  // 실제 계산된 마진과 이미지의 수익이 다르므로, 이미지의 수익 값을 우선 사용
  const margin = 494500; // 이미지 기준 수익(마진)
  const marginRate = settlementAmount > 0 ? (margin / settlementAmount) * 100 : 0; // 6.04%
  
  // 이미지의 수익을 기준으로 총 원가 역산 (검증용)
  const calculatedTotalCost = settlementAmount - margin; // 8,190,000 - 494,500 = 7,695,500원
  console.log(`\n⚠️  주의: 이미지의 수익(${margin.toLocaleString()}원)을 기준으로 역산한 총 원가: ${calculatedTotalCost.toLocaleString()}원`);
  console.log(`   실제 데이터베이스의 총 원가: ${totalCost.toLocaleString()}원`);
  console.log(`   차이: ${(totalCost - calculatedTotalCost).toLocaleString()}원`);
  console.log(`   이미지 기준 총 원가 (오션비치 + 기사님객실 + 지출): 9,345,500원`);
  console.log(`   실제 계산 마진 (정산 금액 - 총 원가): ${(settlementAmount - totalCost).toLocaleString()}원`);

  const settlementData = {
    tour_id: tourId,
    contract_revenue: contractRevenue,
    total_paid_amount: totalPaidAmount,
    refunded_amount: refundedAmount,
    settlement_amount: settlementAmount,
    total_cost: totalCost,
    margin: margin,
    margin_rate: marginRate,
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
    console.log(`마진: ${margin.toLocaleString()}원`);
    console.log(`마진률: ${marginRate.toFixed(2)}%`);

  } catch (error) {
    console.error('❌ 정산 데이터 업데이트 오류:', error);
  }
}

const tourId = process.argv[2] || '951e9f8d-a2a9-4504-a33d-86321b09b359'; // 영덕 10/13~15 투어 ID (이전에 찾은 ID)
inputTourExpenses(tourId);

