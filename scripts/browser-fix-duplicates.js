// 브라우저 콘솔에서 즉시 실행 가능한 임시 해결책
// F12 개발자 도구 > Console에 붙여넣고 실행

async function fixDuplicates() {
  const { createClient } = await import('@supabase/supabase-js');
  
  // Supabase 클라이언트 가져오기 (이미 페이지에 로드되어 있음)
  const supabase = window.supabase || createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  
  // 1. 현재 모든 배정 가져오기
  const { data: allAssignments, error: fetchError } = await supabase
    .from('singsing_participant_tee_times')
    .select('*')
    .order('created_at', { ascending: true });
    
  if (fetchError) {
    console.error('데이터 조회 실패:', fetchError);
    return;
  }
  
  console.log('전체 배정:', allAssignments.length);
  
  // 2. 중복 찾기
  const seen = new Map();
  const duplicates = [];
  const toDelete = [];
  
  allAssignments.forEach(assignment => {
    const key = `${assignment.participant_id}-${assignment.tee_time_id}`;
    
    if (seen.has(key)) {
      duplicates.push(assignment);
      toDelete.push(assignment.id || assignment); // id가 있으면 id 사용
    } else {
      seen.set(key, assignment);
    }
  });
  
  console.log('중복 발견:', duplicates.length);
  
  if (duplicates.length === 0) {
    alert('중복이 없습니다!');
    return;
  }
  
  // 3. 중복 삭제
  if (confirm(`${duplicates.length}개의 중복을 삭제하시겠습니까?`)) {
    let deleteCount = 0;
    
    for (const dup of duplicates) {
      try {
        // ID가 있는 경우
        if (dup.id) {
          const { error } = await supabase
            .from('singsing_participant_tee_times')
            .delete()
            .eq('id', dup.id);
            
          if (!error) deleteCount++;
        } else {
          // ID가 없는 경우 (participant_id와 tee_time_id로 삭제)
          const { data: existingRecords } = await supabase
            .from('singsing_participant_tee_times')
            .select('*')
            .eq('participant_id', dup.participant_id)
            .eq('tee_time_id', dup.tee_time_id);
            
          if (existingRecords && existingRecords.length > 1) {
            // 첫 번째를 제외하고 삭제
            for (let i = 1; i < existingRecords.length; i++) {
              const { error } = await supabase
                .from('singsing_participant_tee_times')
                .delete()
                .eq('participant_id', existingRecords[i].participant_id)
                .eq('tee_time_id', existingRecords[i].tee_time_id)
                .eq('created_at', existingRecords[i].created_at);
                
              if (!error) deleteCount++;
            }
          }
        }
      } catch (err) {
        console.error('삭제 중 오류:', err);
      }
    }
    
    alert(`${deleteCount}개의 중복이 삭제되었습니다. 페이지를 새로고침합니다.`);
    location.reload();
  }
}

// 실행
fixDuplicates();
