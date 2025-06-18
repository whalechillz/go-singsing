-- 파인힐스 투어에 다양한 공지사항 추가 예제
-- 특정 투어 ID로 여러 공지사항 설정
UPDATE singsing_tours 
SET special_notices = '[
  {
    "id": "1",
    "content": "☔ 우천시 환불 규정 안내\n• 1홀까지: 전액-기본요금\n• 2~9홀: 차등환불\n• 10홀이상: 환불불가\n• 캐디피: 1홀 3만/2~9홀 8만/10홀이상 15만",
    "priority": 1,
    "type": "weather",
    "created_at": "2025-06-19T10:00:00Z"
  },
  {
    "id": "2",
    "content": "🔑 룸키 수령 안내\n• 2팀 이상: 각 팀 총무님 수령\n• 1팀: 대표자님 수령\n• 프론트에서 성함 말씀해주세요",
    "priority": 2,
    "type": "checkin",
    "created_at": "2025-06-19T10:00:00Z",
    "showConditions": {
      "hoursBeforeCheckin": 24
    }
  },
  {
    "id": "3",
    "content": "📢 식음료 결제 안내\n• 골프장 식당 이용시 당일 결제\n• 객실 미니바 이용시 체크아웃시 결제\n• 단체 식사는 투어비에 포함되어 있습니다",
    "priority": 3,
    "type": "general",
    "created_at": "2025-06-19T10:00:00Z"
  },
  {
    "id": "4",
    "content": "🚌 출발 시간 변경 안내\n• 출발 시간이 오전 6시에서 6시 30분으로 변경되었습니다\n• 탑승 위치는 동일합니다\n• 늦지 않도록 주의해주세요",
    "priority": 0,
    "type": "important",
    "created_at": "2025-06-19T10:00:00Z"
  }
]'::jsonb
WHERE id = '6ee634ba-9adb-49c5-915c-cb2e246dc51f';

-- 확인
SELECT 
    id,
    title,
    jsonb_array_length(special_notices) as notice_count,
    jsonb_pretty(special_notices) as notices
FROM singsing_tours 
WHERE id = '6ee634ba-9adb-49c5-915c-cb2e246dc51f';

-- 다른 투어들에도 샘플 공지 추가
UPDATE singsing_tours 
SET special_notices = '[
  {
    "id": "1",
    "content": "📍 집합 장소 안내\n• 1차: 수원역 1번 출구 (05:30)\n• 2차: 판교역 2번 출구 (06:00)\n• 버스 번호: 경기 12가 3456",
    "priority": 1,
    "type": "general",
    "created_at": "2025-06-19T10:00:00Z"
  },
  {
    "id": "2",
    "content": "🏌️ 골프장 드레스 코드\n• 상의: 카라 있는 셔츠 필수\n• 하의: 청바지 불가\n• 모자 착용 권장",
    "priority": 2,
    "type": "general",
    "created_at": "2025-06-19T10:00:00Z"
  }
]'::jsonb
WHERE special_notices = '[]'::jsonb
LIMIT 5;
