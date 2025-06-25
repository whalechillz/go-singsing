import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// .env.local 파일 로드
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function cleanupUnusedImages() {
  console.log('🧹 MMS 이미지 정리 시작...');
  
  try {
    // 1. mms-images 버킷의 모든 파일 목록 가져오기
    const { data: files, error: listError } = await supabase.storage
      .from('mms-images')
      .list();
    
    if (listError) {
      console.error('파일 목록 조회 실패:', listError);
      return;
    }
    
    console.log(`📁 총 ${files?.length || 0}개의 이미지 발견`);
    
    // 2. message_logs에서 실제 사용된 이미지 URL 목록 가져오기
    const { data: logs, error: logsError } = await supabase
      .from('message_logs')
      .select('content')
      .eq('message_type', 'mms')
      .not('content', 'is', null);
    
    if (logsError) {
      console.error('메시지 로그 조회 실패:', logsError);
      return;
    }
    
    // 사용된 이미지 URL 추출
    const usedImageUrls = new Set<string>();
    logs?.forEach(log => {
      // content에서 이미지 URL 추출 (정규식 사용)
      const urlMatch = log.content?.match(/https:\/\/[^\s]+mms-images[^\s]+/g);
      urlMatch?.forEach(url => usedImageUrls.add(url));
    });
    
    console.log(`📊 실제 사용된 이미지: ${usedImageUrls.size}개`);
    
    // 3. 사용되지 않은 이미지 찾기
    const unusedFiles: string[] = [];
    const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mms-images/`;
    
    files?.forEach(file => {
      const fileUrl = `${baseUrl}${file.name}`;
      let isUsed = false;
      
      // URL에 파일명이 포함되어 있는지 확인
      usedImageUrls.forEach(url => {
        if (url.includes(file.name)) {
          isUsed = true;
        }
      });
      
      if (!isUsed) {
        unusedFiles.push(file.name);
      }
    });
    
    console.log(`🗑️  삭제 대상 이미지: ${unusedFiles.length}개`);
    
    if (unusedFiles.length === 0) {
      console.log('✅ 삭제할 이미지가 없습니다.');
      return;
    }
    
    // 4. 사용자 확인
    console.log('\n다음 파일들을 삭제하시겠습니까?');
    unusedFiles.forEach(file => console.log(`  - ${file}`));
    console.log('\n실제로 삭제하려면 --confirm 옵션을 추가하세요.');
    
    // 5. --confirm 옵션이 있을 때만 실제 삭제
    if (process.argv.includes('--confirm')) {
      console.log('\n🗑️  이미지 삭제 중...');
      
      const { error: deleteError } = await supabase.storage
        .from('mms-images')
        .remove(unusedFiles);
      
      if (deleteError) {
        console.error('삭제 실패:', deleteError);
      } else {
        console.log(`✅ ${unusedFiles.length}개의 이미지가 삭제되었습니다.`);
      }
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 스크립트 실행
cleanupUnusedImages();
