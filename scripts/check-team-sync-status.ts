/**
 * 참가자 팀명과 고객 모임명 동기화 상태 확인 스크립트
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '설정됨' : '없음');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '설정됨' : '없음');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkSyncStatus() {
  console.log('=== 참가자 팀명과 고객 모임명 동기화 상태 확인 ===\n');

  // 1. 모임명이 있는 고객 수
  const { data: customersWithTags, error: customersError } = await supabase
    .from('customers')
    .select('id, name, phone, tags')
    .not('tags', 'is', null);

  if (customersError) {
    console.error('고객 조회 오류:', customersError);
    return;
  }

  console.log(`1. 모임명(tags)이 있는 고객: ${customersWithTags?.length || 0}명\n`);

  // 2. 팀명이 있는 참가자 수
  const { data: participantsWithTeam, error: participantsError } = await supabase
    .from('singsing_participants')
    .select('id, name, phone, team_name')
    .not('team_name', 'is', null)
    .neq('team_name', '');

  if (participantsError) {
    console.error('참가자 조회 오류:', participantsError);
    return;
  }

  console.log(`2. 팀명(team_name)이 있는 참가자: ${participantsWithTeam?.length || 0}명\n`);

  // 3. 전화번호로 매칭되는 고객-참가자 쌍 확인
  const participantPhones = participantsWithTeam?.map(p => p.phone).filter(Boolean) || [];
  
  if (participantPhones.length > 0) {
    const { data: matchedCustomers, error: matchError } = await supabase
      .from('customers')
      .select('phone, tags')
      .in('phone', participantPhones);

    if (matchError) {
      console.error('매칭 조회 오류:', matchError);
      return;
    }

    console.log(`3. 참가자 전화번호로 매칭되는 고객: ${matchedCustomers?.length || 0}명\n`);

    // 4. 동기화가 필요한 케이스 확인
    let needsSync = 0;
    const syncNeeded: Array<{ participant: string; phone: string; participantTeam: string; customerTags: string[] }> = [];

    for (const participant of participantsWithTeam || []) {
      if (!participant.phone) continue;
      
      const customer = matchedCustomers?.find(c => c.phone === participant.phone);
      if (customer && customer.tags && customer.tags.length > 0) {
        // 참가자의 team_name이 고객의 tags에 없으면 동기화 필요
        if (!customer.tags.includes(participant.team_name || '')) {
          needsSync++;
          syncNeeded.push({
            participant: participant.name,
            phone: participant.phone,
            participantTeam: participant.team_name || '',
            customerTags: customer.tags
          });
        }
      }
    }

    console.log(`4. 동기화가 필요한 케이스: ${needsSync}건\n`);

    if (syncNeeded.length > 0 && syncNeeded.length <= 10) {
      console.log('동기화 필요 케이스 샘플:');
      syncNeeded.slice(0, 10).forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.participant} (${item.phone})`);
        console.log(`     참가자 팀: ${item.participantTeam}`);
        console.log(`     고객 모임명: ${item.customerTags.join(', ')}`);
      });
      console.log('');
    }
  }

  // 5. 모임명이 있는 고객 중 참가자로 등록되지 않은 경우
  const customerPhones = customersWithTags?.map(c => c.phone).filter(Boolean) || [];
  
  if (customerPhones.length > 0) {
    const { data: existingParticipants, error: existingError } = await supabase
      .from('singsing_participants')
      .select('phone')
      .in('phone', customerPhones);

    if (existingError) {
      console.error('기존 참가자 조회 오류:', existingError);
      return;
    }

    const existingPhones = new Set(existingParticipants?.map(p => p.phone) || []);
    const notInParticipants = customersWithTags?.filter(c => c.phone && !existingPhones.has(c.phone)) || [];

    console.log(`5. 모임명이 있지만 참가자로 등록되지 않은 고객: ${notInParticipants.length}명\n`);

    if (notInParticipants.length > 0 && notInParticipants.length <= 10) {
      console.log('샘플:');
      notInParticipants.slice(0, 10).forEach((customer, idx) => {
        console.log(`  ${idx + 1}. ${customer.name} (${customer.phone}) - 모임명: ${customer.tags?.join(', ') || '없음'}`);
      });
      console.log('');
    }
  }

  // 6. 모임명 샘플 출력
  console.log('=== 모임명 샘플 (고객) ===');
  if (customersWithTags && customersWithTags.length > 0) {
    const sampleTags = new Set<string>();
    customersWithTags.forEach(c => {
      if (c.tags) {
        c.tags.forEach(tag => sampleTags.add(tag));
      }
    });
    console.log(`총 ${sampleTags.size}개의 고유 모임명:`);
    Array.from(sampleTags).slice(0, 20).forEach((tag, idx) => {
      console.log(`  ${idx + 1}. ${tag}`);
    });
    if (sampleTags.size > 20) {
      console.log(`  ... 외 ${sampleTags.size - 20}개`);
    }
  }
}

checkSyncStatus()
  .then(() => {
    console.log('\n=== 확인 완료 ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('오류 발생:', error);
    process.exit(1);
  });

