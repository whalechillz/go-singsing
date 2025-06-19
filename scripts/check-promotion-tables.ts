import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// 환경 변수 로드
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPromotionTables() {
  console.log('🔍 홍보 페이지 테이블 상태 확인 중...\n');

  // 1. tour_promotion_pages 테이블 확인
  console.log('1️⃣ tour_promotion_pages 테이블 확인:');
  const { data: promotionPages, error: promotionError } = await supabase
    .from('tour_promotion_pages')
    .select('*')
    .limit(5);

  if (promotionError) {
    console.error('❌ tour_promotion_pages 테이블 오류:', promotionError.message);
    console.log('   → 테이블이 존재하지 않거나 접근 권한이 없습니다.\n');
  } else {
    console.log(`✅ tour_promotion_pages 테이블 존재 (${promotionPages?.length || 0}개 레코드)`);
    if (promotionPages && promotionPages.length > 0) {
      console.log('   샘플 데이터:');
      promotionPages.forEach(page => {
        console.log(`   - Tour ID: ${page.tour_id}`);
        console.log(`     Slug: ${page.slug || '없음'}`);
        console.log(`     공개: ${page.is_public ? '예' : '아니오'}`);
      });
    }
    console.log();
  }

  // 2. tourist_attractions 테이블 확인
  console.log('2️⃣ tourist_attractions 테이블 확인:');
  const { data: attractions, error: attractionsError } = await supabase
    .from('tourist_attractions')
    .select('*')
    .limit(5);

  if (attractionsError) {
    console.error('❌ tourist_attractions 테이블 오류:', attractionsError.message);
    console.log('   → 테이블이 존재하지 않거나 접근 권한이 없습니다.\n');
  } else {
    console.log(`✅ tourist_attractions 테이블 존재 (${attractions?.length || 0}개 레코드)\n`);
  }

  // 3. tour_attraction_options 테이블 확인
  console.log('3️⃣ tour_attraction_options 테이블 확인:');
  const { data: options, error: optionsError } = await supabase
    .from('tour_attraction_options')
    .select('*')
    .limit(5);

  if (optionsError) {
    console.error('❌ tour_attraction_options 테이블 오류:', optionsError.message);
    console.log('   → 테이블이 존재하지 않거나 접근 권한이 없습니다.\n');
  } else {
    console.log(`✅ tour_attraction_options 테이블 존재 (${options?.length || 0}개 레코드)\n`);
  }

  // 4. 특정 투어 ID로 홍보 페이지 확인
  const tourId = 'a0560b90-67a6-4d84-a29a-2b7548266c2b';
  console.log(`4️⃣ 특정 투어 (${tourId}) 홍보 페이지 확인:`);
  
  const { data: specificPromo, error: specificError } = await supabase
    .from('tour_promotion_pages')
    .select('*')
    .eq('tour_id', tourId)
    .single();

  if (specificError) {
    console.error('❌ 해당 투어의 홍보 페이지 없음:', specificError.message);
    
    // 투어 자체가 있는지 확인
    const { data: tour, error: tourError } = await supabase
      .from('singsing_tours')
      .select('id, title, tour_period')
      .eq('id', tourId)
      .single();

    if (tourError) {
      console.log('   → 투어 자체가 존재하지 않습니다.');
    } else {
      console.log(`   → 투어는 존재함: ${tour.title}`);
      console.log('   → 홍보 페이지 레코드가 생성되지 않았습니다.');
    }
  } else {
    console.log('✅ 홍보 페이지 존재:');
    console.log(`   - Slug: ${specificPromo.slug}`);
    console.log(`   - 공개: ${specificPromo.is_public ? '예' : '아니오'}`);
    console.log(`   - 생성일: ${specificPromo.created_at}`);
  }
}

checkPromotionTables()
  .then(() => {
    console.log('\n✅ 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 오류 발생:', error);
    process.exit(1);
  });
