// Supabase를 통해 남대문 이미지를 업데이트하는 스크립트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL 또는 Key가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateNamdaemunImage() {
  try {
    // 먼저 남대문이 존재하는지 확인
    const { data: existing, error: selectError } = await supabase
      .from('tourist_attractions')
      .select('id')
      .eq('name', '남대문')
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    const namdaemunData = {
      name: '남대문',
      category: 'tourist_spot',
      address: '서울특별시 중구 세종대로 40',
      description: '대한민국 국보 제1호, 서울의 대표적인 문화재',
      main_image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Namdaemun.jpg/1200px-Namdaemun.jpg',
      features: ['국보 제1호', '조선시대 건축물', '서울의 랜드마크'],
      recommended_duration: 60,
      tags: ['문화재', '역사', '랜드마크', '포토존'],
      region: '서울',
      is_active: true
    };

    if (existing) {
      // 존재하면 업데이트
      const { error: updateError } = await supabase
        .from('tourist_attractions')
        .update({
          main_image_url: namdaemunData.main_image_url,
          description: namdaemunData.description,
          features: namdaemunData.features,
          tags: namdaemunData.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
      console.log('✅ 남대문 데이터가 업데이트되었습니다.');
    } else {
      // 존재하지 않으면 추가
      const { error: insertError } = await supabase
        .from('tourist_attractions')
        .insert([namdaemunData]);

      if (insertError) throw insertError;
      console.log('✅ 남대문 데이터가 추가되었습니다.');
    }

    // 결과 확인
    const { data: result } = await supabase
      .from('tourist_attractions')
      .select('name, category, main_image_url')
      .eq('name', '남대문')
      .single();

    console.log('\n현재 남대문 데이터:');
    console.log(result);

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  }
}

// 스크립트 실행
updateNamdaemunImage();
