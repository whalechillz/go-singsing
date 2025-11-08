const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function findTourByKeyword(keyword, price) {
  console.log(`\n=== "${keyword}" 키워드로 투어 검색 ===\n`);

  try {
    let query = supabase
      .from('singsing_tours')
      .select('id, title, start_date, end_date, price')
      .order('start_date', { ascending: false });

    if (keyword) {
      query = query.ilike('title', `%${keyword}%`);
    }

    if (price) {
      query = query.eq('price', price);
    }

    const { data: tours, error } = await query.limit(20);

    if (error) {
      console.error('투어 조회 에러:', error);
      return;
    }

    if (tours.length === 0) {
      console.log('해당 조건의 투어가 없습니다.');
      return;
    }

    tours.forEach(tour => {
      console.log(`ID: ${tour.id}`);
      console.log(`제목: ${tour.title}`);
      console.log(`기간: ${tour.start_date} ~ ${tour.end_date}`);
      console.log(`가격: ${tour.price?.toLocaleString()}원`);
      console.log('---');
    });

  } catch (error) {
    console.error('예상치 못한 오류:', error);
  }
}

const keyword = process.argv[2] || '영덕';
const price = process.argv[3] ? parseInt(process.argv[3]) : null;
findTourByKeyword(keyword, price);

