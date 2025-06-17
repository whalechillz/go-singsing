import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env.local 파일 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDuplicateParticipants() {
  console.log('=== 중복 참가자 정리 시작 ===\n');

  try {
    // 모든 투어의 참가자 가져오기
    const { data: allParticipants, error } = await supabase
      .from('singsing_participants')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('참가자 조회 오류:', error);
      return;
    }

    // 투어별로 그룹화
    const tourGroups: { [tourId: string]: any[] } = {};
    allParticipants?.forEach(p => {
      if (!tourGroups[p.tour_id]) tourGroups[p.tour_id] = [];
      tourGroups[p.tour_id].push(p);
    });

    let totalDuplicates = 0;
    let totalRemoved = 0;

    // 각 투어별로 중복 확인
    for (const [tourId, participants] of Object.entries(tourGroups)) {
      // 이름과 전화번호로 그룹화
      const uniqueKey: { [key: string]: any[] } = {};
      
      participants.forEach(p => {
        // 전화번호가 있으면 이름+전화번호, 없으면 이름만으로 키 생성
        const key = p.phone ? `${p.name}-${p.phone}` : `${p.name}-nophone`;
        if (!uniqueKey[key]) uniqueKey[key] = [];
        uniqueKey[key].push(p);
      });

      // 중복 찾기
      const duplicates = Object.entries(uniqueKey)
        .filter(([_, group]) => group.length > 1);

      if (duplicates.length > 0) {
        const { data: tourInfo } = await supabase
          .from('singsing_tours')
          .select('title')
          .eq('id', tourId)
          .single();

        console.log(`\n📋 투어: ${tourInfo?.title || tourId}`);
        console.log(`   중복 그룹 수: ${duplicates.length}`);

        for (const [key, group] of duplicates) {
          console.log(`\n   🔍 중복 발견: ${key}`);
          console.log(`      중복 수: ${group.length}개`);
          
          // 가장 최근 것 하나만 남기고 나머지 삭제 마크
          const sorted = group.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          const keep = sorted[0];
          const toDelete = sorted.slice(1);
          
          console.log(`      ✅ 유지: ID ${keep.id} (생성: ${new Date(keep.created_at).toLocaleString('ko-KR')})`);
          
          toDelete.forEach(p => {
            console.log(`      ❌ 삭제 예정: ID ${p.id} (생성: ${new Date(p.created_at).toLocaleString('ko-KR')})`);
          });
          
          totalDuplicates += group.length - 1;
        }
      }
    }

    if (totalDuplicates > 0) {
      console.log(`\n\n총 ${totalDuplicates}개의 중복 참가자를 발견했습니다.`);
      console.log('\n실제로 삭제하시겠습니까? (이 작업은 되돌릴 수 없습니다)');
      console.log('삭제하려면 아래 명령어를 실행하세요:');
      console.log('npm run fix-duplicates -- --confirm\n');
    } else {
      console.log('\n✅ 중복 참가자가 없습니다.');
    }

    // --confirm 플래그가 있으면 실제 삭제 수행
    if (process.argv.includes('--confirm')) {
      console.log('\n\n=== 실제 삭제 시작 ===');
      
      for (const [tourId, participants] of Object.entries(tourGroups)) {
        const uniqueKey: { [key: string]: any[] } = {};
        
        participants.forEach(p => {
          const key = p.phone ? `${p.name}-${p.phone}` : `${p.name}-nophone`;
          if (!uniqueKey[key]) uniqueKey[key] = [];
          uniqueKey[key].push(p);
        });

        const duplicates = Object.entries(uniqueKey)
          .filter(([_, group]) => group.length > 1);

        for (const [key, group] of duplicates) {
          const sorted = group.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          const toDelete = sorted.slice(1);
          
          for (const p of toDelete) {
            const { error } = await supabase
              .from('singsing_participants')
              .delete()
              .eq('id', p.id);
            
            if (error) {
              console.error(`❌ 삭제 실패 (ID: ${p.id}):`, error);
            } else {
              console.log(`✅ 삭제 완료 (ID: ${p.id}, 이름: ${p.name})`);
              totalRemoved++;
            }
          }
        }
      }
      
      console.log(`\n\n✅ 총 ${totalRemoved}개의 중복 참가자를 삭제했습니다.`);
    }

  } catch (error) {
    console.error('스크립트 실행 오류:', error);
  }
}

// 스크립트 실행
fixDuplicateParticipants();
