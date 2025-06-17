import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTourParticipants() {
  console.log('=== 투어별 참가자 수 확인 ===\n');

  try {
    // 모든 투어 가져오기
    const { data: tours, error: toursError } = await supabase
      .from('singsing_tours')
      .select('id, title, max_participants')
      .is('quote_data', null)
      .order('start_date', { ascending: false })
      .limit(10);

    if (toursError) {
      console.error('투어 조회 실패:', toursError);
      return;
    }

    if (!tours || tours.length === 0) {
      console.log('등록된 투어가 없습니다.');
      return;
    }

    // 각 투어별 참가자 확인
    for (const tour of tours) {
      console.log(`\n📋 투어: ${tour.title}`);
      console.log(`   최대 인원: ${tour.max_participants || 40}명`);
      
      // 참가자 목록 가져오기
      const { data: participants, error: participantsError } = await supabase
        .from('singsing_participants')
        .select('id, name, group_size')
        .eq('tour_id', tour.id);

      if (participantsError) {
        console.error(`   ❌ 참가자 조회 실패:`, participantsError);
        continue;
      }

      if (!participants || participants.length === 0) {
        console.log('   참가자 없음');
        continue;
      }

      // 참가자 수 계산
      const recordCount = participants.length;
      const groupSizeSum = participants.reduce((sum, p) => sum + (p.group_size || 1), 0);

      console.log(`   실제 참가자 수 (레코드): ${recordCount}명`);
      console.log(`   그룹 인원수 합계: ${groupSizeSum}명`);
      
      if (recordCount !== groupSizeSum) {
        console.log(`   ⚠️  불일치 발견! 레코드 수와 그룹 인원수가 다릅니다.`);
        
        // 그룹 크기가 1이 아닌 참가자 표시
        const groupParticipants = participants.filter(p => p.group_size && p.group_size > 1);
        if (groupParticipants.length > 0) {
          console.log(`   그룹 참가자:`);
          groupParticipants.forEach(p => {
            console.log(`     - ${p.name}: ${p.group_size}명`);
          });
        }
      }
    }

    console.log('\n=== 확인 완료 ===');

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 스크립트 실행
checkTourParticipants();