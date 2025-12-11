/**
 * Google Sheets에서 고객 데이터를 가져와서 Supabase customers 테이블에 마이그레이션
 * 
 * 사용 방법:
 * 1. Google Sheets를 공개로 설정하거나 서비스 계정에 공유
 * 2. 환경 변수 설정 (선택사항)
 * 3. npm run migrate:customers:google-sheets
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as https from 'https';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Google Sheets 정보
const SPREADSHEET_ID = '1MUvJyKGXFBZLUCuSnuOjZMjQqkSi5byu9d7u4O6uf9w';
const SHEET_NAME = 'singsing';
const GID = '812281138';

interface GoogleSheetsRow {
  [key: string]: string | number | null;
}

/**
 * CSV 파싱 (따옴표와 쉼표 처리)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // 이스케이프된 따옴표
        current += '"';
        i++;
      } else {
        // 따옴표 시작/끝
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 필드 구분자
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // 마지막 필드 추가
  result.push(current.trim());
  return result;
}

/**
 * Google Sheets에서 CSV 데이터 가져오기 (공개 시트인 경우)
 */
async function fetchGoogleSheetsData(): Promise<GoogleSheetsRow[]> {
  return new Promise((resolve, reject) => {
    // CSV 형식으로 데이터 가져오기 (gid 파라미터 제거, sheet 이름 사용)
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
    
    console.log(`📥 데이터 가져오기 URL: ${url}`);
    
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk.toString('utf-8');
      });
      
      res.on('end', () => {
        try {
          // CSV 파싱
          const lines = data.split('\n').filter(line => line.trim());
          if (lines.length === 0) {
            reject(new Error('데이터가 없습니다.'));
            return;
          }
          
          // 헤더 추출 (개선된 CSV 파싱 사용)
          const headers = parseCSVLine(lines[0])
            .map(h => h.replace(/^"|"$/g, '').trim())
            .filter(h => h.length > 0); // 빈 헤더 제거
          console.log(`📋 발견된 컬럼 (${headers.length}개): ${headers.join(', ')}`);
          
          // 데이터 행 파싱
          const rows: GoogleSheetsRow[] = [];
          for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, '').trim());
            const row: GoogleSheetsRow = {};
            headers.forEach((header, index) => {
              const value = values[index];
              row[header] = (value && value.length > 0) ? value : null;
            });
            rows.push(row);
          }
          
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * 전화번호 정규화 (하이픈 제거)
 */
function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  // 숫자만 추출
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return digits;
}

/**
 * 이메일 검증
 */
function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 날짜 형식 변환 (YYYY-MM-DD)
 */
function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  
  // 다양한 날짜 형식 처리
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString().split('T')[0];
}

/**
 * Google Sheets 데이터를 customers 테이블 형식으로 변환
 * 실제 스프레드시트 컬럼명: 이름, 연락처, 최초문의일, 최근투어일, 최근투어지, 특이사항
 */
function mapToCustomer(row: GoogleSheetsRow, rowIndex: number): any {
  // 실제 Google Sheets 컬럼명 매핑
  const rawName = row['이름'];
  const rawPhone = row['연락처'];
  
  // 이름과 전화번호가 모두 없으면 건너뛰기
  if (!rawName && !rawPhone) {
    return null;
  }
  
  const name = (rawName || '').trim();
  const phone = normalizePhone(rawPhone);
  
  // 이름이나 전화번호 중 하나라도 없으면 건너뛰기
  if (!name || !phone) {
    return null;
  }
  
  // 이름이 너무 짧거나 이상한 경우 건너뛰기 (예: "1~2팀..." 같은 경우)
  if (name.length < 2 || name.includes('~') && name.length > 50) {
    return null;
  }
  
  // 최초문의일을 first_tour_date로 매핑 (또는 별도 필드로)
  const firstInquiryDate = parseDate(row['최초문의일'] || row['최초문의'] || row['first_inquiry']);
  const lastTourDate = parseDate(row['최근투어일'] || row['최근투어'] || row['last_tour']);
  const lastTourLocation = (row['최근투어지'] || row['최근투어지역'] || row['last_tour_location'] || '').trim();
  const lastContactDate = parseDate(row['최근연락내역'] || row['최근연락'] || row['last_contact']);
  
  // 모임명을 tags에 추가
  const meetingName = (row['모임명'] || row['모임'] || row['meeting_name'] || '').trim();
  const tags: string[] = [];
  if (meetingName) {
    tags.push(meetingName);
  }
  
  // 특이사항을 notes로 매핑
  const notes = (row['특이사항'] || row['비고'] || row['notes'] || row['Notes'] || '').trim();
  
  // 직급 추출 (특이사항 또는 이름에서 "총무", "회장", "방장" 키워드 추출)
  let position: string | null = null;
  const positionKeywords = ['총무', '회장', '방장'];
  // 먼저 특이사항에서 찾기
  for (const keyword of positionKeywords) {
    if (notes.includes(keyword)) {
      position = keyword;
      break;
    }
  }
  // 특이사항에 없으면 이름에서 찾기
  if (!position) {
    for (const keyword of positionKeywords) {
      if (name.includes(keyword)) {
        position = keyword;
        break;
      }
    }
  }
  
  // 투어 이력이 있으면 customer_type을 'regular'로, 없으면 'new'로 설정
  const customerType = lastTourDate ? 'regular' : 'new';
  
  return {
    name,
    phone,
    email: null, // 스프레드시트에 이메일 컬럼이 없음
    birth_date: null,
    gender: null,
    marketing_agreed: false,
    kakao_friend: false,
    status: 'active',
    customer_type: customerType,
    first_tour_date: firstInquiryDate || lastTourDate, // 최초문의일이 없으면 최근투어일 사용
    last_tour_date: lastTourDate,
    total_tour_count: lastTourDate ? 1 : 0, // 최소 1회로 설정 (정확한 횟수는 투어 데이터에서 계산 필요)
    total_payment_amount: 0,
    source: 'google_sheet',
    // source_id 컬럼이 없으므로 notes에 포함
    notes: [
      notes,
      lastTourLocation ? `최근 투어지: ${lastTourLocation}` : null,
      `Google Sheets 행: ${rowIndex + 2}`
    ].filter(Boolean).join(' | ') || null,
    tags: tags.length > 0 ? tags : null, // 모임명을 tags에 추가
    position: position, // 직급 추가
    activity_platform: null,
    referral_source: null,
    last_contact_at: lastContactDate || null,
    unsubscribed: false,
    unsubscribed_reason: null,
  };
}

/**
 * 마이그레이션 실행
 */
async function migrateCustomers() {
  console.log('🚀 Google Sheets 고객 데이터 마이그레이션 시작...\n');
  
  try {
    // 1. Google Sheets에서 데이터 가져오기
    console.log('📥 Google Sheets에서 데이터 가져오는 중...');
    const rows = await fetchGoogleSheetsData();
    console.log(`✅ ${rows.length}개의 행을 가져왔습니다.\n`);
    
    // 2. 데이터 변환
    console.log('🔄 데이터 변환 중...');
    const customers = rows
      .map((row, index) => mapToCustomer(row, index))
      .filter(customer => customer !== null);
    
    console.log(`✅ ${customers.length}개의 고객 데이터로 변환되었습니다.\n`);
    
    // 3. 기존 고객 확인 (전화번호 기준) - 배치로 처리
    console.log('🔍 기존 고객 확인 중...');
    const phones = customers.map(c => c.phone).filter(Boolean);
    
    if (phones.length === 0) {
      console.log('⚠️  유효한 전화번호가 없습니다.');
      return;
    }
    
    // 대량 데이터는 배치로 확인
    const existingPhones = new Set<string>();
    const batchSize = 1000;
    
    for (let i = 0; i < phones.length; i += batchSize) {
      const phoneBatch = phones.slice(i, i + batchSize);
      const { data: existingCustomers, error: fetchError } = await supabase
        .from('customers')
        .select('phone')
        .in('phone', phoneBatch);
      
      if (fetchError) {
        console.error('❌ 기존 고객 확인 오류:', fetchError);
        throw fetchError;
      }
      
      existingCustomers?.forEach(c => existingPhones.add(c.phone));
    }
    
    console.log(`✅ ${existingPhones.size}개의 기존 고객을 찾았습니다.\n`);
    
    // 4. 신규 고객과 업데이트 대상 분리
    const newCustomers = customers.filter(c => !existingPhones.has(c.phone));
    const updateCustomers = customers.filter(c => existingPhones.has(c.phone));
    
    console.log(`📊 통계:`);
    console.log(`  - 신규 고객: ${newCustomers.length}명`);
    console.log(`  - 업데이트 대상: ${updateCustomers.length}명\n`);
    
    // 5. 신규 고객 삽입 (배치 처리)
    if (newCustomers.length > 0) {
      console.log(`💾 신규 고객 데이터 삽입 중... (총 ${newCustomers.length}명, 배치 크기: 100)`);
      
      const batchSize = 100;
      let totalInserted = 0;
      let totalFailed = 0;
      const failedCustomers: any[] = [];
      
      for (let i = 0; i < newCustomers.length; i += batchSize) {
        const batch = newCustomers.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(newCustomers.length / batchSize);
        
        try {
          const { data: inserted, error: insertError } = await supabase
            .from('customers')
            .insert(batch)
            .select();
          
          if (insertError) {
            // 중복 키 오류인 경우 개별 삽입 시도
            if (insertError.code === '23505') {
              console.log(`⚠️  배치 ${batchNumber}/${totalBatches}에 중복이 있습니다. 개별 삽입 시도 중...`);
              
              // 개별 삽입
              for (const customer of batch) {
                try {
                  const { data: singleInserted, error: singleError } = await supabase
                    .from('customers')
                    .insert(customer)
                    .select();
                  
                  if (singleError) {
                    if (singleError.code === '23505') {
                      // 중복이면 건너뛰기
                      totalFailed++;
                    } else {
                      console.error(`   고객 ${customer.name} (${customer.phone}) 삽입 실패:`, singleError.message);
                      failedCustomers.push(customer);
                      totalFailed++;
                    }
                  } else {
                    totalInserted += singleInserted?.length || 0;
                  }
                } catch (singleError: any) {
                  console.error(`   고객 ${customer.name} (${customer.phone}) 예외:`, singleError.message);
                  failedCustomers.push(customer);
                  totalFailed++;
                }
              }
              
              console.log(`   배치 ${batchNumber}/${totalBatches} 개별 처리 완료`);
            } else {
              console.error(`❌ 배치 ${batchNumber}/${totalBatches} 삽입 실패:`, insertError);
              console.error(`   상세 오류:`, JSON.stringify(insertError, null, 2));
              failedCustomers.push(...batch);
              totalFailed += batch.length;
            }
          } else {
            totalInserted += inserted?.length || 0;
            console.log(`✅ 배치 ${batchNumber}/${totalBatches} 완료 (${inserted?.length || 0}개)`);
          }
        } catch (error: any) {
          console.error(`❌ 배치 ${batchNumber}/${totalBatches} 예외 발생:`, error);
          console.error(`   상세 오류:`, error?.message || JSON.stringify(error, null, 2));
          failedCustomers.push(...batch);
          totalFailed += batch.length;
        }
      }
      
      console.log(`\n📊 삽입 결과:`);
      console.log(`   - 성공: ${totalInserted}명`);
      console.log(`   - 실패: ${totalFailed}명`);
      
      if (failedCustomers.length > 0) {
        console.log(`\n⚠️  실패한 고객 목록 (처음 10개):`);
        failedCustomers.slice(0, 10).forEach(c => {
          console.log(`   - ${c.name} (${c.phone})`);
        });
      }
      console.log('');
    }
    
    // 6. 기존 고객 업데이트 (기존 데이터 보존, 모임명/특이사항/직급만 추가)
    if (updateCustomers.length > 0) {
      console.log(`⚠️  기존 고객 ${updateCustomers.length}명 발견. 기존 데이터를 보존하며 선택적 업데이트합니다.`);
      
      let updatedCount = 0;
      let skippedCount = 0;
      
      // Google Sheets 데이터를 전화번호로 매핑
      const sheetDataMap = new Map<string, any>();
      updateCustomers.forEach(c => {
        sheetDataMap.set(c.phone, c);
      });
      
      // 기존 고객 정보 가져오기 (배치 처리)
      const updatePhones = Array.from(sheetDataMap.keys());
      const batchSize = 100;
      
      for (let i = 0; i < updatePhones.length; i += batchSize) {
        const phoneBatch = updatePhones.slice(i, i + batchSize);
        const { data: existingCustomers, error: fetchError } = await supabase
          .from('customers')
          .select('*')
          .in('phone', phoneBatch);
        
        if (fetchError) {
          console.error('❌ 기존 고객 정보 조회 오류:', fetchError);
          continue;
        }
        
        // 각 기존 고객에 대해 업데이트
        for (const existing of existingCustomers || []) {
          const sheetData = sheetDataMap.get(existing.phone);
          if (!sheetData) continue;
          
          try {
            // 업데이트할 데이터 준비 (기존 데이터 보존)
            const updateData: any = {};
            let hasUpdate = false;
            
            // 1. 모임명 (tags에 추가, 기존 tags 유지)
            const existingTags = existing.tags || [];
            const newTags = sheetData.tags || [];
            if (newTags.length > 0) {
              const mergedTags = [...new Set([...existingTags, ...newTags])];
              if (mergedTags.length > existingTags.length) {
                updateData.tags = mergedTags;
                hasUpdate = true;
              }
            }
            
            // 2. 특이사항 (notes에 추가, 기존 notes 유지)
            const existingNotes = existing.notes || '';
            // Google Sheets의 notes에서 특이사항만 추출 (최근 투어지, 행 번호 제외)
            const sheetNotes = sheetData.notes || '';
            const specialNotes = sheetNotes.split(' | ').filter((n: string) => 
              !n.includes('최근 투어지:') && !n.includes('Google Sheets 행:')
            ).join(' | ').trim();
            
            if (specialNotes && !existingNotes.includes(specialNotes)) {
              updateData.notes = existingNotes 
                ? `${existingNotes} | ${specialNotes}`
                : specialNotes;
              hasUpdate = true;
            }
            
            // 3. 직급 (기존 값이 없을 때만 업데이트)
            if (sheetData.position && !existing.position) {
              updateData.position = sheetData.position;
              hasUpdate = true;
            }
            
            // 4. 최근연락내역 (더 최신 날짜로 업데이트)
            if (sheetData.last_contact_at) {
              const existingContactDate = existing.last_contact_at 
                ? new Date(existing.last_contact_at).getTime() 
                : 0;
              const newContactDate = new Date(sheetData.last_contact_at).getTime();
              if (newContactDate > existingContactDate) {
                updateData.last_contact_at = sheetData.last_contact_at;
                hasUpdate = true;
              }
            }
            
            // 업데이트 실행
            if (hasUpdate) {
              const { error: updateError } = await supabase
                .from('customers')
                .update(updateData)
                .eq('phone', existing.phone);
              
              if (!updateError) {
                updatedCount++;
              } else {
                console.error(`   고객 ${existing.name} (${existing.phone}) 업데이트 실패:`, updateError.message);
                skippedCount++;
              }
            } else {
              skippedCount++;
            }
          } catch (error: any) {
            console.error(`   고객 ${existing.name} (${existing.phone}) 예외:`, error.message);
            skippedCount++;
          }
        }
      }
      
      console.log(`\n📊 기존 고객 업데이트 결과:`);
      console.log(`   - 업데이트: ${updatedCount}명 (모임명/특이사항/직급 추가)`);
      console.log(`   - 건너뜀: ${skippedCount}명 (변경사항 없음 또는 기존 데이터 우선)\n`);
    }
    
    // 7. 결과 리포트
    console.log('📋 마이그레이션 완료!');
    console.log(`   - 총 처리: ${customers.length}명`);
    console.log(`   - 신규 추가: ${newCustomers.length}명`);
    console.log(`   - 기존 고객: ${updateCustomers.length}명`);
    
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error);
    process.exit(1);
  }
}

// 실행
migrateCustomers();

