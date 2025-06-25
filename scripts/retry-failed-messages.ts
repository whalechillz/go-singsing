import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function retryFailedMessages() {
  console.log('🔄 실패한 메시지 재발송 준비...');
  
  try {
    // 1. 실패한 메시지 조회
    const { data: failedLogs, error } = await supabase
      .from('message_logs')
      .select(`
        *,
        customer:customer_id (
          id,
          name,
          phone
        )
      `)
      .in('status', ['failed', 'pending'])
      .order('created_at', { ascending: false })
      .limit(50); // 최대 50개까지만
    
    if (error) {
      console.error('실패한 메시지 조회 오류:', error);
      return;
    }
    
    if (!failedLogs || failedLogs.length === 0) {
      console.log('✅ 재발송할 메시지가 없습니다.');
      return;
    }
    
    console.log(`📊 재발송 대상: ${failedLogs.length}개의 메시지`);
    
    // 2. 메시지 타입별로 그룹화
    const messagesByType = failedLogs.reduce((acc, log) => {
      const type = log.message_type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(log);
      return acc;
    }, {} as Record<string, typeof failedLogs>);
    
    // 3. 타입별 통계 출력
    console.log('\n📈 메시지 타입별 통계:');
    Object.entries(messagesByType).forEach(([type, messages]) => {
      console.log(`  - ${type}: ${messages.length}개`);
    });
    
    // 4. 재발송 확인
    console.log('\n⚠️  주의: 재발송 시 추가 비용이 발생합니다!');
    console.log('실제로 재발송하려면 --confirm 옵션을 추가하세요.');
    console.log('예: npm run retry-messages -- --confirm\n');
    
    if (!process.argv.includes('--confirm')) {
      // 샘플 데이터 출력
      console.log('📋 재발송 대상 샘플 (최대 5개):');
      failedLogs.slice(0, 5).forEach(log => {
        console.log(`  - ${log.phone_number} (${log.customer?.name || '직접입력'}) - ${log.message_type}`);
      });
      return;
    }
    
    // 5. 실제 재발송 처리
    console.log('\n🚀 재발송 시작...');
    
    const results = {
      success: 0,
      failed: 0
    };
    
    for (const log of failedLogs) {
      try {
        // API 호출을 통한 재발송
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/api/solapi/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: log.message_type,
            recipients: [{
              phone: log.phone_number,
              customer_id: log.customer_id
            }],
            title: log.title,
            content: log.content,
            template_id: null,
            image_url: null // MMS 이미지는 재업로드 필요
          })
        });
        
        if (response.ok) {
          results.success++;
          // 상태 업데이트
          await supabase
            .from('message_logs')
            .update({ 
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', log.id);
            
          console.log(`✅ ${log.phone_number} - 재발송 성공`);
        } else {
          results.failed++;
          console.log(`❌ ${log.phone_number} - 재발송 실패`);
        }
        
        // API 부하 방지를 위한 딜레이
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        results.failed++;
        console.error(`❌ ${log.phone_number} - 오류:`, error);
      }
    }
    
    // 6. 결과 요약
    console.log('\n📊 재발송 결과:');
    console.log(`  ✅ 성공: ${results.success}개`);
    console.log(`  ❌ 실패: ${results.failed}개`);
    console.log(`  💰 예상 비용: ${results.success * 30}원 (평균)`);
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 스크립트 실행
retryFailedMessages();
