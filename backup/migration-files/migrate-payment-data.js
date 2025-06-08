// 기존 결제 데이터 마이그레이션 스크립트
// 실행: node scripts/migrate-payment-data.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env.local 파일 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migratePaymentData() {
  console.log('결제 데이터 마이그레이션 시작...');

  try {
    // 1. 기존 결제 데이터 조회
    const { data: payments, error } = await supabase
      .from('singsing_payments')
      .select('*');

    if (error) {
      console.error('데이터 조회 오류:', error);
      return;
    }

    console.log(`총 ${payments.length}개의 결제 데이터를 발견했습니다.`);

    // 2. 각 결제 데이터 업데이트
    for (const payment of payments) {
      const updates = {};

      // payment_method 값 정규화 (deposit -> bank)
      if (payment.payment_method === 'deposit') {
        updates.payment_method = 'bank';
      }

      // payment_type이 없는 경우 기본값 설정
      if (!payment.payment_type) {
        // 기존 데이터는 대부분 계약금으로 추정
        updates.payment_type = 'deposit';
      }

      // payment_status가 없는 경우 기본값 설정
      if (!payment.payment_status) {
        updates.payment_status = 'completed';
      }

      // payment_date가 없는 경우 created_at 사용
      if (!payment.payment_date) {
        updates.payment_date = payment.created_at;
      }

      // 업데이트할 내용이 있는 경우에만 실행
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('singsing_payments')
          .update(updates)
          .eq('id', payment.id);

        if (updateError) {
          console.error(`결제 ID ${payment.id} 업데이트 오류:`, updateError);
        } else {
          console.log(`결제 ID ${payment.id} 업데이트 완료`);
        }
      }
    }

    console.log('마이그레이션 완료!');

    // 3. 통계 출력
    const { data: stats } = await supabase
      .from('singsing_payments')
      .select('payment_type, payment_status, count');

    console.log('\n=== 마이그레이션 결과 ===');
    console.log('payment_type 분포:');
    const typeStats = await supabase
      .from('singsing_payments')
      .select('payment_type')
      .then(({ data }) => {
        const counts = {};
        data.forEach(p => {
          counts[p.payment_type] = (counts[p.payment_type] || 0) + 1;
        });
        return counts;
      });
    console.log(typeStats);

    console.log('\npayment_status 분포:');
    const statusStats = await supabase
      .from('singsing_payments')
      .select('payment_status')
      .then(({ data }) => {
        const counts = {};
        data.forEach(p => {
          counts[p.payment_status] = (counts[p.payment_status] || 0) + 1;
        });
        return counts;
      });
    console.log(statusStats);

  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error);
  }
}

// 스크립트 실행
migratePaymentData();