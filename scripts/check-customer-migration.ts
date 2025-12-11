/**
 * 고객 마이그레이션 결과 확인 스크립트
 * 최근 연락일, 모임명, 직급이 제대로 업데이트되었는지 확인
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

async function checkMigration() {
  console.log('🔍 고객 마이그레이션 결과 확인 중...\n');
  
  try {
    // 1. 전체 고객 수 확인
    const { count: totalCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });
    
    console.log(`📊 전체 고객 수: ${totalCount}명\n`);
    
    // 2. 최근 연락일이 있는 고객 수
    const { count: withLastContact } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .not('last_contact_at', 'is', null);
    
    console.log(`📞 최근 연락일이 있는 고객: ${withLastContact}명`);
    
    // 3. 모임명(tags)이 있는 고객 수
    const { data: customersWithTags } = await supabase
      .from('customers')
      .select('id, tags')
      .not('tags', 'is', null);
    
    const customersWithTagsCount = customersWithTags?.filter(c => 
      c.tags && Array.isArray(c.tags) && c.tags.length > 0
    ).length || 0;
    
    console.log(`🏷️  모임명(tags)이 있는 고객: ${customersWithTagsCount}명`);
    
    // 4. 직급이 있는 고객 수
    const { count: withPosition } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .not('position', 'is', null);
    
    console.log(`👔 직급이 있는 고객: ${withPosition}명\n`);
    
    // 5. 샘플 데이터 확인 (최근 연락일이 있는 고객 10명)
    console.log('📋 최근 연락일이 있는 고객 샘플 (10명):');
    const { data: sampleCustomers } = await supabase
      .from('customers')
      .select('name, phone, last_contact_at, tags, position')
      .not('last_contact_at', 'is', null)
      .order('last_contact_at', { ascending: false })
      .limit(10);
    
    sampleCustomers?.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.name} (${customer.phone})`);
      console.log(`      최근 연락: ${new Date(customer.last_contact_at!).toLocaleDateString('ko-KR')}`);
      if (customer.tags && customer.tags.length > 0) {
        console.log(`      모임명: ${customer.tags.join(', ')}`);
      }
      if (customer.position) {
        console.log(`      직급: ${customer.position}`);
      }
      console.log('');
    });
    
    // 6. 모임명 샘플 확인
    console.log('📋 모임명이 있는 고객 샘플 (10명):');
    const { data: customersWithTagsSample } = await supabase
      .from('customers')
      .select('name, phone, tags')
      .not('tags', 'is', null)
      .limit(10);
    
    customersWithTagsSample?.forEach((customer, index) => {
      if (customer.tags && Array.isArray(customer.tags) && customer.tags.length > 0) {
        console.log(`   ${index + 1}. ${customer.name} (${customer.phone}) - 모임명: ${customer.tags.join(', ')}`);
      }
    });
    console.log('');
    
    // 7. 직급 샘플 확인
    console.log('📋 직급이 있는 고객 샘플 (10명):');
    const { data: customersWithPosition } = await supabase
      .from('customers')
      .select('name, phone, position')
      .not('position', 'is', null)
      .limit(10);
    
    customersWithPosition?.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.name} (${customer.phone}) - 직급: ${customer.position}`);
    });
    console.log('');
    
    // 8. Google Sheets에서 마이그레이션된 고객 확인
    const { count: fromGoogleSheet } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'google_sheet');
    
    console.log(`📥 Google Sheets에서 마이그레이션된 고객: ${fromGoogleSheet}명`);
    
    // 9. Google Sheets 마이그레이션 고객 중 최근 연락일이 있는 비율
    const { data: googleSheetCustomers } = await supabase
      .from('customers')
      .select('last_contact_at')
      .eq('source', 'google_sheet');
    
    const withContactCount = googleSheetCustomers?.filter(c => c.last_contact_at).length || 0;
    const totalGoogleSheet = googleSheetCustomers?.length || 0;
    const contactRate = totalGoogleSheet > 0 ? (withContactCount / totalGoogleSheet * 100).toFixed(1) : 0;
    
    console.log(`   - 최근 연락일이 있는 고객: ${withContactCount}명 (${contactRate}%)`);
    
  } catch (error) {
    console.error('❌ 확인 중 오류:', error);
    process.exit(1);
  }
}

checkMigration();

