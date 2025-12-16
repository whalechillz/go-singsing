/**
 * 참가자 팀명 동기화 상태 최종 확인 스크립트
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 전화번호 정규화
const normalizePhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
};

async function verifyTeamSync() {
  console.log('=== 참가자 팀명 동기화 상태 최종 확인 ===\n');

  // 1. 전체 참가자 수
  const { count: totalParticipants } = await supabase
    .from('singsing_participants')
    .select('*', { count: 'exact', head: true });

  console.log(`전체 참가자: ${totalParticipants}명\n`);

  // 2. team_name이 있는 참가자 수
  const { count: participantsWithTeam } = await supabase
    .from('singsing_participants')
    .select('*', { count: 'exact', head: true })
    .not('team_name', 'is', null)
    .neq('team_name', '');

  console.log(`team_name이 있는 참가자: ${participantsWithTeam}명\n`);

  // 3. 모임명이 있는 고객 수
  const { count: customersWithTags } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .not('tags', 'is', null);

  console.log(`모임명(tags)이 있는 고객: ${customersWithTags}명\n`);

  // 4. 매칭 가능한 케이스 확인
  const { data: participants } = await supabase
    .from('singsing_participants')
    .select('id, name, phone, team_name')
    .not('phone', 'is', null)
    .neq('phone', '')
    .limit(100);

  const { data: customers } = await supabase
    .from('customers')
    .select('phone, tags')
    .not('phone', 'is', null)
    .not('tags', 'is', null);

  if (!participants || !customers) {
    console.error('데이터 조회 실패');
    return;
  }

  // 전화번호로 매칭
  const customerMap = new Map<string, string[]>();
  customers.forEach(c => {
    if (c.phone && c.tags) {
      const normalized = normalizePhone(c.phone);
      customerMap.set(normalized, c.tags);
    }
  });

  let matchedCount = 0;
  let needsUpdate = 0;
  const needsUpdateList: Array<{ name: string; phone: string; current: string | null; shouldBe: string }> = [];

  participants.forEach(p => {
    if (!p.phone) return;
    
    const normalized = normalizePhone(p.phone);
    const customerTags = customerMap.get(normalized);
    
    if (customerTags && customerTags.length > 0) {
      matchedCount++;
      const shouldBe = customerTags[0];
      
      if (!p.team_name || p.team_name !== shouldBe) {
        needsUpdate++;
        if (needsUpdateList.length < 20) {
          needsUpdateList.push({
            name: p.name,
            phone: p.phone,
            current: p.team_name,
            shouldBe: shouldBe
          });
        }
      }
    }
  });

  console.log(`매칭 가능한 참가자: ${matchedCount}명`);
  console.log(`업데이트 필요한 참가자: ${needsUpdate}명\n`);

  if (needsUpdateList.length > 0) {
    console.log('업데이트 필요 샘플:');
    needsUpdateList.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.name} (${item.phone})`);
      console.log(`     현재: ${item.current || '(없음)'}`);
      console.log(`     변경: ${item.shouldBe}`);
    });
    console.log('');
  }

  // 5. 특정 모임명 확인
  const targetTeams = ['구아라팀', '어울림', '유구회', '임지복 팀'];
  console.log('=== 특정 모임명 확인 ===');
  
  for (const teamName of targetTeams) {
    // 고객 테이블에서 확인
    const { data: customersWithTeam } = await supabase
      .from('customers')
      .select('name, phone, tags')
      .contains('tags', [teamName])
      .limit(5);

    // 참가자 테이블에서 확인
    const { data: participantsWithTeam } = await supabase
      .from('singsing_participants')
      .select('name, phone, team_name')
      .eq('team_name', teamName)
      .limit(5);

    console.log(`\n${teamName}:`);
    console.log(`  고객 테이블: ${customersWithTeam?.length || 0}명`);
    if (customersWithTeam && customersWithTeam.length > 0) {
      customersWithTeam.forEach(c => {
        console.log(`    - ${c.name} (${c.phone})`);
      });
    }
    console.log(`  참가자 테이블: ${participantsWithTeam?.length || 0}명`);
    if (participantsWithTeam && participantsWithTeam.length > 0) {
      participantsWithTeam.forEach(p => {
        console.log(`    - ${p.name} (${p.phone})`);
      });
    }
  }
}

verifyTeamSync()
  .then(() => {
    console.log('\n=== 확인 완료 ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('오류 발생:', error);
    process.exit(1);
  });

