/**
 * VIP2769 고객 확인 스크립트
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkVIP2769() {
  console.log('🔍 VIP2769 고객 확인 중...\n');
  
  try {
    // 이름으로 검색
    const { data: byName, error: nameError } = await supabase
      .from('customers')
      .select('*')
      .ilike('name', '%VIP2769%')
      .limit(10);
    
    if (nameError) {
      console.error('❌ 이름 검색 오류:', nameError);
    } else {
      console.log(`📋 이름으로 검색 결과: ${byName?.length || 0}명`);
      byName?.forEach(c => {
        console.log(`   - ${c.name} (${c.phone})`);
        console.log(`     최근 연락: ${c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString('ko-KR') : '없음'}`);
        console.log(`     모임명: ${c.tags?.join(', ') || '없음'}`);
        console.log(`     직급: ${c.position || '없음'}`);
        console.log(`     특이사항: ${c.notes || '없음'}`);
        console.log(`     소스: ${c.source || '없음'}`);
        console.log('');
      });
    }
    
    // 전화번호로 검색 (010-6273-2769 또는 01062732769)
    const phoneNumbers = ['010-6273-2769', '01062732769', '62732769'];
    
    for (const phone of phoneNumbers) {
      const normalizedPhone = phone.replace(/-/g, '');
      const { data: byPhone, error: phoneError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', normalizedPhone)
        .limit(10);
      
      if (phoneError) {
        console.error(`❌ 전화번호 검색 오류 (${phone}):`, phoneError);
      } else if (byPhone && byPhone.length > 0) {
        console.log(`📞 전화번호로 검색 결과 (${phone}): ${byPhone.length}명`);
        byPhone.forEach(c => {
          console.log(`   - ${c.name} (${c.phone})`);
          console.log(`     최근 연락: ${c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString('ko-KR') : '없음'}`);
          console.log(`     모임명: ${c.tags?.join(', ') || '없음'}`);
          console.log(`     직급: ${c.position || '없음'}`);
          console.log(`     특이사항: ${c.notes || '없음'}`);
          console.log(`     소스: ${c.source || '없음'}`);
          console.log('');
        });
      }
    }
    
    // "차량문의" 특이사항이 있는 고객 검색
    const { data: byNotes, error: notesError } = await supabase
      .from('customers')
      .select('*')
      .ilike('notes', '%차량문의%')
      .limit(10);
    
    if (notesError) {
      console.error('❌ 특이사항 검색 오류:', notesError);
    } else {
      console.log(`📝 "차량문의" 특이사항이 있는 고객: ${byNotes?.length || 0}명`);
      byNotes?.forEach(c => {
        console.log(`   - ${c.name} (${c.phone})`);
        console.log(`     특이사항: ${c.notes || '없음'}`);
        console.log('');
      });
    }
    
    // "총무" 직급이 있는 고객 검색
    const { data: byPosition, error: positionError } = await supabase
      .from('customers')
      .select('*')
      .eq('position', '총무')
      .limit(10);
    
    if (positionError) {
      console.error('❌ 직급 검색 오류:', positionError);
    } else {
      console.log(`👔 "총무" 직급이 있는 고객: ${byPosition?.length || 0}명`);
      byPosition?.forEach(c => {
        console.log(`   - ${c.name} (${c.phone})`);
        console.log(`     직급: ${c.position}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ 확인 중 오류:', error);
    process.exit(1);
  }
}

checkVIP2769();

