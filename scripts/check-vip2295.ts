/**
 * VIP2295 고객 확인 스크립트
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

async function checkVIP2295() {
  console.log('🔍 VIP2295 고객 확인 중...\n');
  
  try {
    // 전화번호로 검색
    const { data: byPhone, error: phoneError } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', '01089872295')
      .limit(10);
    
    if (phoneError) {
      console.error('❌ 전화번호 검색 오류:', phoneError);
    } else if (byPhone && byPhone.length > 0) {
      console.log(`📞 전화번호로 검색 결과: ${byPhone.length}명\n`);
      byPhone.forEach(c => {
        console.log(`이름: ${c.name}`);
        console.log(`전화번호: ${c.phone}`);
        console.log(`최근 연락: ${c.last_contact_at ? new Date(c.last_contact_at).toLocaleDateString('ko-KR') : '없음'}`);
        console.log(`모임명: ${c.tags?.join(', ') || '없음'}`);
        console.log(`직급: ${c.position || '없음'}`);
        console.log(`\n📝 메모 (notes):`);
        console.log(c.notes || '(비어있음)');
        console.log(`\n소스: ${c.source || '없음'}`);
        console.log(`생성일: ${c.created_at ? new Date(c.created_at).toLocaleDateString('ko-KR') : '없음'}`);
        console.log(`수정일: ${c.updated_at ? new Date(c.updated_at).toLocaleDateString('ko-KR') : '없음'}`);
        console.log('');
      });
    } else {
      console.log('❌ VIP2295 고객을 찾을 수 없습니다.');
    }
    
    // 이름으로도 검색
    const { data: byName, error: nameError } = await supabase
      .from('customers')
      .select('*')
      .ilike('name', '%VIP2295%')
      .limit(10);
    
    if (nameError) {
      console.error('❌ 이름 검색 오류:', nameError);
    } else if (byName && byName.length > 0) {
      console.log(`📋 이름으로 검색 결과: ${byName.length}명\n`);
      byName.forEach(c => {
        console.log(`이름: ${c.name}`);
        console.log(`전화번호: ${c.phone}`);
        console.log(`메모: ${c.notes || '(비어있음)'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ 확인 중 오류:', error);
    process.exit(1);
  }
}

checkVIP2295();

