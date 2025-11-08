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

async function inputTourExpenses() {
  const tourId = 'e5878cd2-bce7-495d-a428-c2b4e506fcc7';
  
  console.log(`\n=== 투어 비용 입력: ${tourId} ===\n`);

  // 골프장 정산 데이터
  const golfCourseSettlement = [
    {
      golf_course_name: "순천 파인힐스",
      date: "2025-09-12",
      items: [
        {
          type: "10hole_out",
          description: "10홀아웃",
          unit_price: 858000,
          quantity: 8,
          total: 6864000
        },
        {
          type: "9hole_out",
          description: "9홀아웃",
          unit_price: 853500,
          quantity: 2,
          total: 1707000
        },
        {
          type: "9hole_out_day1_x",
          description: "9홀아웃(1일차X)",
          unit_price: 678500,
          quantity: 2,
          total: 1357000
        }
      ],
      subtotal: 9928000,
      deposit: 10000000,
      difference: -72000,
      notes: "9/11 입금, 차액 발생"
    }
  ];

  // 경비 지출 데이터
  const mealExpenses = [
    {
      type: "gimbap",
      description: "김밥",
      unit_price: 3500,
      quantity: 11,
      total: 38500
    },
    {
      type: "water",
      description: "생수",
      unit_price: 11500,
      quantity: 2,
      total: 23000
    }
  ];

  // tour_expenses 데이터
  // 이미지 기준: 버스 1,100,000원 × 2 = 2,200,000원
  const expensesData = {
    tour_id: tourId,
    golf_course_settlement: golfCourseSettlement,
    golf_course_total: 9928000,
    bus_cost: 2200000, // 1,100,000원 × 2 = 2,200,000원
    bus_driver_cost: 0,
    toll_fee: 0,
    parking_fee: 0,
    bus_notes: "왕복픽업/개인계좌입금",
    guide_fee: 0,
    guide_meal_cost: 0,
    guide_accommodation_cost: 0,
    guide_other_cost: 0,
    guide_notes: "",
    meal_expenses: mealExpenses,
    meal_expenses_total: 61500,
    accommodation_cost: 0,
    restaurant_cost: 0,
    attraction_fee: 0,
    insurance_cost: 0,
    other_expenses: [],
    other_expenses_total: 0,
    notes: "정해철님 투어 정산",
    total_cost: 9928000 + 2200000 + 61500 // 골프장 + 버스 + 경비 지출 = 12,189,500원
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
    const { data: tour } = await supabase
      .from('singsing_tours')
      .select('price')
      .eq('id', tourId)
      .single();

    const { count: participantCount } = await supabase
      .from('singsing_participants')
      .select('*', { count: 'exact', head: true })
      .eq('tour_id', tourId);

    const { data: payments } = await supabase
      .from('singsing_payments')
      .select('amount, payment_status')
      .eq('tour_id', tourId);

    const contractRevenue = (tour?.price || 0) * (participantCount || 0);
    const totalPaidAmount = payments
      ?.filter(p => p.payment_status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const refundedAmount = payments
      ?.filter(p => p.payment_status === 'refunded')
      .reduce((sum, p) => sum + Math.abs(p.amount || 0), 0) || 0;
    const settlementAmount = totalPaidAmount - refundedAmount;
    // 최신 tour_expenses의 total_cost 가져오기
    const { data: updatedExpenses } = await supabase
      .from('tour_expenses')
      .select('total_cost')
      .eq('tour_id', tourId)
      .single();
    const totalCost = updatedExpenses?.total_cost || (expensesData.golf_course_total + expensesData.bus_cost + expensesData.meal_expenses_total);
    const margin = settlementAmount - totalCost;
    const marginRate = settlementAmount > 0 ? (margin / settlementAmount) * 100 : 0;

    const settlementData = {
      tour_id: tourId,
      contract_revenue: contractRevenue,
      total_paid_amount: totalPaidAmount,
      refunded_amount: refundedAmount,
      settlement_amount: settlementAmount,
      total_cost: totalCost,
      margin: margin,
      margin_rate: marginRate,
      status: 'pending'
    };

    const { data: existingSettlement } = await supabase
      .from('tour_settlements')
      .select('id')
      .eq('tour_id', tourId)
      .single();

    if (existingSettlement) {
      const { error: settlementError } = await supabase
        .from('tour_settlements')
        .update(settlementData)
        .eq('tour_id', tourId);

      if (settlementError) throw settlementError;
      console.log('✅ 정산 데이터가 업데이트되었습니다.');
    } else {
      const { error: settlementError } = await supabase
        .from('tour_settlements')
        .insert([settlementData]);

      if (settlementError) throw settlementError;
      console.log('✅ 정산 데이터가 생성되었습니다.');
    }

    console.log('\n=== 정산 요약 ===');
    console.log(`계약 매출: ${contractRevenue.toLocaleString()}원`);
    console.log(`완납 금액: ${totalPaidAmount.toLocaleString()}원`);
    console.log(`환불 금액: ${refundedAmount.toLocaleString()}원`);
    console.log(`정산 금액: ${settlementAmount.toLocaleString()}원`);
    console.log(`총 원가: ${totalCost.toLocaleString()}원`);
    console.log(`마진: ${margin.toLocaleString()}원`);
    console.log(`마진률: ${marginRate.toFixed(2)}%`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

inputTourExpenses();

