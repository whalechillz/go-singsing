/**
 * 참가자 팀명 동기화 상태 확인 및 수정 스크립트
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 전화번호 정규화 (하이픈 제거)
const normalizePhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
};

async function checkAndFixTeamSync() {
  console.log('=== 참가자 팀명 동기화 확인 및 수정 ===\n');

  // 1. 모임명이 있는 고객 조회
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('phone, tags, name')
    .not('tags', 'is', null);

  if (customersError) {
    console.error('고객 조회 오류:', customersError);
    return;
  }

  console.log(`모임명이 있는 고객: ${customers?.length || 0}명\n`);

  // 2. team_name이 없는 참가자 조회
  const { data: participants, error: participantsError } = await supabase
    .from('singsing_participants')
    .select('id, name, phone, team_name')
    .or('team_name.is.null,team_name.eq.');

  if (participantsError) {
    console.error('참가자 조회 오류:', participantsError);
    return;
  }

  console.log(`team_name이 없는 참가자: ${participants?.length || 0}명\n`);

  // 3. 전화번호로 매칭하여 업데이트
  let updated = 0;
  let notMatched = 0;
  const notMatchedList: Array<{ participant: string; phone: string }> = [];

  for (const participant of participants || []) {
    if (!participant.phone) continue;

    const normalizedParticipantPhone = normalizePhone(participant.phone);

    // 고객 중에서 전화번호가 일치하는 것 찾기 (정규화된 전화번호로 비교)
    const matchingCustomer = customers?.find(c => {
      if (!c.phone) return false;
      return normalizePhone(c.phone) === normalizedParticipantPhone;
    });

    if (matchingCustomer && matchingCustomer.tags && matchingCustomer.tags.length > 0) {
      // team_name 업데이트
      const { error: updateError } = await supabase
        .from('singsing_participants')
        .update({ team_name: matchingCustomer.tags[0] })
        .eq('id', participant.id);

      if (updateError) {
        console.error(`업데이트 오류 (${participant.name}):`, updateError);
      } else {
        updated++;
        console.log(`✓ ${participant.name} (${participant.phone}) → ${matchingCustomer.tags[0]}`);
      }
    } else {
      notMatched++;
      notMatchedList.push({
        participant: participant.name,
        phone: participant.phone
      });
    }
  }

  console.log(`\n=== 결과 ===`);
  console.log(`업데이트된 참가자: ${updated}명`);
  console.log(`매칭되지 않은 참가자: ${notMatched}명\n`);

  if (notMatchedList.length > 0 && notMatchedList.length <= 20) {
    console.log('매칭되지 않은 참가자 샘플:');
    notMatchedList.slice(0, 20).forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.participant} (${item.phone})`);
    });
  }

  // 4. 최종 상태 확인
  const { data: finalParticipants, error: finalError } = await supabase
    .from('singsing_participants')
    .select('id, name, phone, team_name')
    .not('team_name', 'is', null)
    .neq('team_name', '');

  if (!finalError) {
    console.log(`\n최종 team_name이 있는 참가자: ${finalParticipants?.length || 0}명`);
  }
}

checkAndFixTeamSync()
  .then(() => {
    console.log('\n=== 완료 ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('오류 발생:', error);
    process.exit(1);
  });

