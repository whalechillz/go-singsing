// scripts/migrate-participants.ts
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// .env 파일 로드
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // 서비스 키 사용 (관리자 권한)
);

interface MigrationData {
  이름: string;
  연락처?: string;
  상품가?: number;
  계약금?: number;
  계약일?: string;
  잔금?: number;
  잔금일?: string;
  탑승지?: string;
  객실?: string;
  비고?: string;
}

// 날짜 파싱 함수
function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  
  // "2025.1.24" 형식을 "2025-01-24"로 변환
  const parts = dateStr.split('.');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
}

// 전화번호 정규화
function normalizePhone(phone: string | undefined): string {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

// 금액 파싱
function parseAmount(amount: any): number {
  if (!amount) return 0;
  
  // 숫자가 아닌 문자 제거
  const cleaned = String(amount).replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}

// 탑승지 정보 파싱
function parseBoardingInfo(boarding: string | undefined): {
  location: string;
  time: string;
} {
  if (!boarding) return { location: '', time: '' };
  
  // "수원월드컵 07:00" 형식 파싱
  const match = boarding.match(/(.+?)\s*(\d{2}:\d{2})/);
  if (match) {
    return {
      location: match[1].trim(),
      time: match[2]
    };
  }
  
  return { location: boarding, time: '' };
}

async function migrateParticipants(filePath: string, tourId: string) {
  console.log('마이그레이션 시작...');
  
  try {
    // 엑셀 파일 읽기
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<MigrationData>(worksheet);
    
    console.log(`총 ${data.length}개 데이터 발견`);
    
    const errors: any[] = [];
    const success: any[] = [];
    
    // 배치 처리를 위한 배열
    const participantsBatch = [];
    const paymentsBatch = [];
    
    for (const [index, row] of data.entries()) {
      try {
        if (!row.이름) {
          console.log(`행 ${index + 2}: 이름이 없어 건너뜀`);
          continue;
        }
        
        const { location, time } = parseBoardingInfo(row.탑승지);
        
        // 참가자 데이터 준비
        const participant = {
          tour_id: tourId,
          name: row.이름.trim(),
          phone: normalizePhone(row.연락처),
          status: '확정',
          pickup_location: location,
          pickup_time: time,
          room_type: row.객실,
          note: row.비고 || '',
          created_at: new Date().toISOString()
        };
        
        participantsBatch.push(participant);
        
        // 결제 정보가 있는 경우
        if (row.계약금 || row.잔금) {
          // 계약금
          if (row.계약금 && row.계약일) {
            paymentsBatch.push({
              tour_id: tourId,
              participant_name: row.이름.trim(), // 나중에 participant_id로 매핑
              amount: parseAmount(row.계약금),
              payment_type: '계약금',
              payment_date: parseDate(row.계약일),
              payment_status: 'completed',
              created_at: new Date().toISOString()
            });
          }
          
          // 잔금
          if (row.잔금 && row.잔금일) {
            paymentsBatch.push({
              tour_id: tourId,
              participant_name: row.이름.trim(), // 나중에 participant_id로 매핑
              amount: parseAmount(row.잔금),
              payment_type: '잔금',
              payment_date: parseDate(row.잔금일),
              payment_status: 'pending',
              created_at: new Date().toISOString()
            });
          }
        }
        
        success.push({ row: index + 2, name: row.이름 });
        
      } catch (error) {
        errors.push({
          row: index + 2,
          name: row.이름,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        });
      }
    }
    
    // 참가자 일괄 삽입
    if (participantsBatch.length > 0) {
      console.log(`참가자 ${participantsBatch.length}명 DB 삽입 중...`);
      
      const { data: insertedParticipants, error: participantsError } = await supabase
        .from('singsing_participants')
        .insert(participantsBatch)
        .select();
      
      if (participantsError) {
        throw new Error(`참가자 삽입 실패: ${participantsError.message}`);
      }
      
      // 결제 정보가 있는 경우, participant_id 매핑
      if (paymentsBatch.length > 0 && insertedParticipants) {
        console.log(`결제 정보 ${paymentsBatch.length}건 DB 삽입 중...`);
        
        // 이름으로 participant_id 매핑
        const nameToIdMap = new Map(
          insertedParticipants.map(p => [p.name, p.id])
        );
        
        // payment 데이터에 participant_id 추가
        const paymentsWithId = paymentsBatch.map(payment => {
          const participantId = nameToIdMap.get(payment.participant_name);
          if (!participantId) {
            console.warn(`결제 정보의 참가자를 찾을 수 없음: ${payment.participant_name}`);
            return null;
          }
          
          const { participant_name, ...paymentData } = payment;
          return {
            ...paymentData,
            participant_id: participantId,
            payer_id: participantId // 본인 결제로 가정
          };
        }).filter(Boolean);
        
        if (paymentsWithId.length > 0) {
          const { error: paymentsError } = await supabase
            .from('singsing_payments')
            .insert(paymentsWithId);
          
          if (paymentsError) {
            console.error(`결제 정보 삽입 실패: ${paymentsError.message}`);
          }
        }
      }
    }
    
    // 결과 출력
    console.log('\n=== 마이그레이션 완료 ===');
    console.log(`성공: ${success.length}건`);
    console.log(`실패: ${errors.length}건`);
    
    if (errors.length > 0) {
      console.log('\n실패 목록:');
      errors.forEach(e => {
        console.log(`- 행 ${e.row} (${e.name}): ${e.error}`);
      });
    }
    
  } catch (error) {
    console.error('마이그레이션 실패:', error);
  }
}

// 탑승지 정보 사전 등록
async function ensureBoardingPlaces(tourId: string) {
  const boardingPlaces = [
    '수원월드컵',
    '평택 동성골프연습장',
    '윤봉길의사 기념관',
    '차고지'
  ];
  
  console.log('탑승지 정보 확인 중...');
  
  for (const place of boardingPlaces) {
    const { error } = await supabase
      .from('singsing_boarding_places')
      .upsert({ 
        tour_id: tourId,
        name: place 
      }, {
        onConflict: 'tour_id,name'
      });
    
    if (error) {
      console.warn(`탑승지 등록 실패 (${place}):`, error.message);
    }
  }
}

// 실행
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('사용법: npm run migrate <엑셀파일경로> <투어ID>');
    console.log('예시: npm run migrate ./data/participants.xlsx 123e4567-e89b-12d3-a456-426614174000');
    process.exit(1);
  }
  
  const [filePath, tourId] = args;
  
  // 투어 존재 확인
  const { data: tour, error } = await supabase
    .from('singsing_tours')
    .select('id, title')
    .eq('id', tourId)
    .single();
  
  if (error || !tour) {
    console.error('투어를 찾을 수 없습니다:', tourId);
    process.exit(1);
  }
  
  console.log(`투어 확인: ${tour.title}`);
  
  // 탑승지 정보 사전 등록
  await ensureBoardingPlaces(tourId);
  
  // 마이그레이션 실행
  await migrateParticipants(filePath, tourId);
}

// 스크립트 실행
main().catch(console.error);