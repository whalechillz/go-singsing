-- ======================================
-- tour_id와 schedule_id 매핑 정리
-- ======================================

-- 1. 현재 데이터 구조 확인
SELECT 
    'singsing_tours' as table_name,
    COUNT(*) as count,
    '여행상품/골프장 정보' as description
FROM singsing_tours
UNION ALL
SELECT 
    'singsing_schedules' as table_name,
    COUNT(*) as count,
    '실제 투어 일정' as description
FROM singsing_schedules;

-- 2. 참가자 테이블의 tour_id 확인
SELECT 
    p.id as participant_id,
    p.name as participant_name,
    p.tour_id,
    s.title as schedule_title,
    t.title as tour_product_title
FROM singsing_participants p
LEFT JOIN singsing_schedules s ON p.tour_id = s.id
LEFT JOIN singsing_tours t ON p.tour_id = t.id
LIMIT 10;

-- 3. 데이터 일관성 확인
-- tour_id가 schedules를 참조하는지 tours를 참조하는지 확인
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM singsing_schedules WHERE id = p.tour_id) THEN 'schedules'
        WHEN EXISTS (SELECT 1 FROM singsing_tours WHERE id = p.tour_id) THEN 'tours'
        ELSE 'unknown'
    END as tour_id_references,
    COUNT(*) as count
FROM singsing_participants p
GROUP BY 1;

-- 4. 권장사항
-- singsing_participants.tour_id는 singsing_schedules.id를 참조해야 함
-- 필요 시 schedule_id로 컬럼명 변경 고려
