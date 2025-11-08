const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findTour() {
  // 2025-09-12 시작하는 투어 찾기
  const startDate = '2025-09-12';
  
  const { data, error } = await supabase
    .from('singsing_tours')
    .select('id, title, start_date, end_date, price')
    .eq('start_date', startDate)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`\n=== ${startDate} 시작하는 투어 ===\n`);
  
  if (data && data.length > 0) {
    data.forEach(tour => {
      console.log(`ID: ${tour.id}`);
      console.log(`제목: ${tour.title}`);
      console.log(`기간: ${tour.start_date} ~ ${tour.end_date}`);
      console.log(`가격: ${tour.price?.toLocaleString()}원`);
      console.log('---');
    });
  } else {
    console.log('해당 날짜의 투어를 찾을 수 없습니다.');
    
    // 비슷한 날짜 검색
    const { data: similarTours } = await supabase
      .from('singsing_tours')
      .select('id, title, start_date, end_date, price')
      .gte('start_date', '2025-09-01')
      .lte('start_date', '2025-09-30')
      .order('start_date', { ascending: true });
    
    if (similarTours && similarTours.length > 0) {
      console.log('\n9월 투어 목록:');
      similarTours.forEach(tour => {
        console.log(`- ${tour.start_date}: ${tour.title} (ID: ${tour.id})`);
      });
    }
  }
}

findTour();

