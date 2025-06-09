// 디버그 스크립트 - 투어 데이터 확인
// 사용법: node scripts/debug/check-tour-data.js [tourId]

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTourData(tourId) {
  if (!tourId) {
    console.error('사용법: node scripts/debug/check-tour-data.js [tourId]');
    return;
  }

  console.log(`\n=== 투어 ID: ${tourId} 데이터 확인 ===\n`);

  try {
    // 1. 투어 정보 확인
    const { data: tour, error: tourError } = await supabase
      .from('singsing_tours')
      .select('*')
      .eq('id', tourId)
      .single();

    if (tourError) {
      console.error('투어 조회 에러:', tourError);
    } else {
      console.log('1. 투어 정보:');
      console.log(`   - 제목: ${tour.title}`);
      console.log(`   - 기간: ${tour.start_date} ~ ${tour.end_date}`);
      console.log(`   - 상태: ${tour.status}`);
    }

    // 2. 여정 아이템 확인
    const { data: journeyItems, error: journeyError } = await supabase
      .from('tour_journey_items')
      .select('*')
      .eq('tour_id', tourId)
      .order('day_number')
      .order('order_index');

    if (journeyError) {
      console.error('여정 아이템 조회 에러:', journeyError);
    } else {
      console.log(`\n2. 여정 아이템: 총 ${journeyItems.length}개`);
      
      // Day별로 그룹핑
      const groupedByDay = journeyItems.reduce((acc, item) => {
        if (!acc[item.day_number]) acc[item.day_number] = [];
        acc[item.day_number].push(item);
        return acc;
      }, {});

      Object.entries(groupedByDay).forEach(([day, items]) => {
        console.log(`\n   Day ${day}: ${items.length}개 아이템`);
        items.forEach(item => {
          console.log(`     - [${item.order_index}] ${item.type || 'UNKNOWN'} - ${item.boarding_place_id ? '탑승지' : item.spot_id ? '스팟' : '기타'}`);
        });
      });
    }

    // 3. 탑승지 데이터 확인
    const { data: boardingPlaces, error: boardingError } = await supabase
      .from('singsing_boarding_places')
      .select('id, name')
      .limit(5);

    if (boardingError) {
      console.error('탑승지 조회 에러:', boardingError);
    } else {
      console.log(`\n3. 탑승지 데이터: 총 ${boardingPlaces.length}개 (샘플)`);
      boardingPlaces.forEach(place => {
        console.log(`   - ${place.name} (${place.id})`);
      });
    }

    // 4. 관광지 데이터 확인
    const { data: attractions, error: attractionError } = await supabase
      .from('tourist_attractions')
      .select('id, name, category, is_active')
      .eq('is_active', true)
      .limit(5);

    if (attractionError) {
      console.error('관광지 조회 에러:', attractionError);
    } else {
      console.log(`\n4. 관광지 데이터: 총 ${attractions.length}개 (샘플)`);
      attractions.forEach(spot => {
        console.log(`   - ${spot.name} [${spot.category}] (${spot.id})`);
      });
    }

  } catch (error) {
    console.error('스크립트 실행 중 에러:', error);
  }
}

// 명령줄 인자에서 tourId 가져오기
const tourId = process.argv[2];
checkTourData(tourId);
