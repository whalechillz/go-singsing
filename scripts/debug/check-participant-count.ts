import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkParticipantCounts() {
  console.log('=== 참가자 수 불일치 검사 시작 ===\n');

  try {
    // 모든 투어 가져오기
    const { data: tours, error: toursError } = await supabase
      .from('singsing_tours')
      .select('*')
      .is('quote_data', null)
      .order('start_date', { ascending: true });

    if (toursError) {
      console.error('투어 조회 오류:', toursError);
      return;
    }

    console.log(`총 ${tours?.length || 0}개의 투어를 검사합니다.\n`);

    // 각 투어별로 참가자 수 확인
    for (const tour of tours || []) {
      const { count: participantCount, data: participants, error: countError } = await supabase
        .from('singsing_participants')
        .select('*', { count: 'exact' })
        .eq('tour_id', tour.id);

      if (countError) {
        console.error(`투어 ${tour.id} 참가자 조회 오류:`, countError);
        continue;
      }

      const actualCount = participantCount || 0;
      const maxParticipants = tour.max_participants || 40;

      // 문제가 있는 경우만 출력
      if (actualCount > maxParticipants || actualCount > 28) {
        console.log(`\n🚨 문제 발견: ${tour.title}`);
        console.log(`   - 투어 ID: ${tour.id}`);
        console.log(`   - 기간: ${new Date(tour.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(tour.end_date).toLocaleDateString('ko-KR')}`);
        console.log(`   - 현재 참가자: ${actualCount}명`);
        console.log(`   - 최대 참가자: ${maxParticipants}명`);
        console.log(`   - 초과: ${actualCount - maxParticipants}명`);

        // 참가자 목록 확인 (중복 확인)
        if (participants) {
          // 이름으로 그룹화하여 중복 확인
          const nameGroups: { [key: string]: any[] } = {};
          participants.forEach(p => {
            const key = `${p.name}-${p.phone || 'no-phone'}`;
            if (!nameGroups[key]) nameGroups[key] = [];
            nameGroups[key].push(p);
          });

          // 중복된 참가자 찾기
          const duplicates = Object.entries(nameGroups)
            .filter(([_, group]) => group.length > 1)
            .map(([key, group]) => ({
              key,
              count: group.length,
              participants: group
            }));

          if (duplicates.length > 0) {
            console.log('\n   🔍 중복 참가자 발견:');
            duplicates.forEach(dup => {
              console.log(`      - ${dup.key}: ${dup.count}개 레코드`);
              dup.participants.forEach(p => {
                console.log(`        ID: ${p.id}, 상태: ${p.status}, 생성일: ${new Date(p.created_at).toLocaleString('ko-KR')}`);
              });
            });
          }

          // 상태별 집계
          const statusCount: { [key: string]: number } = {};
          participants.forEach(p => {
            statusCount[p.status] = (statusCount[p.status] || 0) + 1;
          });

          console.log('\n   📊 상태별 참가자 수:');
          Object.entries(statusCount).forEach(([status, count]) => {
            console.log(`      - ${status}: ${count}명`);
          });
        }
      }
    }

    // 특정 투어 상세 확인 (파인힐스 2박3일 순천비스힐)
    console.log('\n\n=== 특정 투어 상세 확인 ===');
    const { data: pineHillsTours } = await supabase
      .from('singsing_tours')
      .select('*')
      .like('title', '%파인힐스%2박3일%순천비스힐%');

    if (pineHillsTours && pineHillsTours.length > 0) {
      for (const tour of pineHillsTours) {
        console.log(`\n📋 ${tour.title}`);
        console.log(`   투어 ID: ${tour.id}`);
        
        const { data: participants, count } = await supabase
          .from('singsing_participants')
          .select('*', { count: 'exact' })
          .eq('tour_id', tour.id)
          .order('created_at', { ascending: true });

        console.log(`   실제 참가자 수: ${count}명`);
        console.log(`   최대 참가자 수: ${tour.max_participants || 40}명`);
        
        if (participants) {
          console.log('\n   참가자 목록:');
          participants.forEach((p, index) => {
            console.log(`   ${index + 1}. ${p.name} (${p.phone || '전화번호 없음'}) - ${p.status}`);
          });
        }
      }
    }

    console.log('\n\n=== 검사 완료 ===');

  } catch (error) {
    console.error('스크립트 실행 오류:', error);
  }
}

// 스크립트 실행
checkParticipantCounts();
