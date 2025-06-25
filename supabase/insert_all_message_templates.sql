-- 기존 템플릿 삭제 (중복 방지)
DELETE FROM message_templates WHERE use_case IN (
  'tour_document',
  'quote',
  'payment_request',
  'payment_confirmation',
  'tour_confirmation',
  'refund',
  'promotion'
);

-- 메시지 템플릿 추가
INSERT INTO message_templates (
  name,
  type,
  kakao_template_code,
  kakao_template_name,
  title,
  content,
  variables,
  buttons,
  use_case,
  is_active
) VALUES 
-- 1. 종합 여정 안내
(
  '종합 여정 안내',
  'alimtalk',
  'tour_portal_guide',
  '종합 여정 안내',
  '[싱싱골프] #{투어명} 종합 여정 안내',
  '[싱싱골프] #{투어명} 종합 여정 안내

안녕하세요 #{이름}님,
신청하신 #{투어명} 종합 여정을 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "url": "string"}',
  '[{"name": "종합 여정 안내", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/portal/#{url}", "linkPc": "https://go.singsinggolf.kr/portal/#{url}"}]',
  'tour_document',
  true
),

-- 2. 일정표 안내
(
  '일정표 안내',
  'alimtalk',
  'tour_schedule_guide',
  '일정표 안내',
  '[싱싱골프] #{투어명} 일정표 안내',
  '[싱싱골프] #{투어명} 일정표 안내

안녕하세요 #{이름}님,
신청하신 #{투어명} 일정표를 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "url": "string"}',
  '[{"name": "일정표 확인", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/s/#{url}", "linkPc": "https://go.singsinggolf.kr/s/#{url}"}]',
  'tour_document',
  true
),

-- 3. 스탭용 일정표
(
  '스탭용 일정표',
  'alimtalk',
  'staff_schedule_guide',
  '스탭용 일정표',
  '[싱싱골프] #{투어명} 스탭용 일정표',
  '[싱싱골프] #{투어명} 스탭용 일정표

안녕하세요 #{이름}님,
신청하신 #{투어명} 스탭용 일정표를 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "url": "string"}',
  '[{"name": "일정표 확인", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/s/#{url}", "linkPc": "https://go.singsinggolf.kr/s/#{url}"}]',
  'tour_document',
  true
),

-- 4. 탑승 안내
(
  '탑승 안내',
  'alimtalk',
  'boarding_guide',
  '탑승 안내',
  '[싱싱골프] #{투어명} 탑승 안내',
  '[싱싱골프] #{투어명} 탑승 안내

안녕하세요 #{이름}님,
신청하신 #{투어명} 탑승 정보를 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "url": "string"}',
  '[{"name": "탑승정보 확인", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/s/#{url}", "linkPc": "https://go.singsinggolf.kr/s/#{url}"}]',
  'tour_document',
  true
),

-- 5. 스탭용 탑승안내
(
  '스탭용 탑승안내',
  'alimtalk',
  'staff_boarding_guide',
  '스탭용 탑승안내',
  '[싱싱골프] #{투어명} 스탭용 탑승안내',
  '[싱싱골프] #{투어명} 스탭용 탑승안내

안녕하세요 #{이름}님,
신청하신 #{투어명} 스탭 탑승 정보를 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "url": "string"}',
  '[{"name": "탑승정보 확인", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/s/#{url}", "linkPc": "https://go.singsinggolf.kr/s/#{url}"}]',
  'tour_document',
  true
),

-- 6. 객실 배정
(
  '객실 배정',
  'alimtalk',
  'room_assignment',
  '객실 배정',
  '[싱싱골프] #{투어명} 객실 배정',
  '[싱싱골프] #{투어명} 객실 배정

안녕하세요 #{이름}님,
신청하신 #{투어명} 객실 정보를 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "url": "string"}',
  '[{"name": "객실정보 확인", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/s/#{url}", "linkPc": "https://go.singsinggolf.kr/s/#{url}"}]',
  'tour_document',
  true
),

-- 7. 스탭용 객실배정
(
  '스탭용 객실배정',
  'alimtalk',
  'staff_room_assignment',
  '스탭용 객실배정',
  '[싱싱골프] #{투어명} 스탭용 객실배정',
  '[싱싱골프] #{투어명} 스탭용 객실배정

안녕하세요 #{이름}님,
신청하신 #{투어명} 스탭 객실 정보를 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "url": "string"}',
  '[{"name": "객실정보 확인", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/s/#{url}", "linkPc": "https://go.singsinggolf.kr/s/#{url}"}]',
  'tour_document',
  true
),

-- 8. 티타임표 안내
(
  '티타임표 안내',
  'alimtalk',
  'tee_time_guide',
  '티타임표 안내',
  '[싱싱골프] #{투어명} 티타임표',
  '[싱싱골프] #{투어명} 티타임표

안녕하세요 #{이름}님,
신청하신 #{투어명} 티타임을 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "url": "string"}',
  '[{"name": "티타임 확인", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/s/#{url}", "linkPc": "https://go.singsinggolf.kr/s/#{url}"}]',
  'tour_document',
  true
),

-- 9. 스탭용 티타임표
(
  '스탭용 티타임표',
  'alimtalk',
  'staff_tee_time_guide',
  '스탭용 티타임표',
  '[싱싱골프] #{투어명} 스탭용 티타임표',
  '[싱싱골프] #{투어명} 스탭용 티타임표

안녕하세요 #{이름}님,
신청하신 #{투어명} 스탭 티타임을 안내드립니다.

궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "url": "string"}',
  '[{"name": "티타임 확인", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/s/#{url}", "linkPc": "https://go.singsinggolf.kr/s/#{url}"}]',
  'tour_document',
  true
),

-- 10. 간편일정 안내
(
  '간편일정 안내',
  'alimtalk',
  'simple_schedule_guide',
  '간편일정 안내',
  '[싱싱골프] #{투어명} 간편일정',
  '[싱싱골프] #{투어명} 간편일정

안녕하세요 #{이름}님,
신청하신 #{투어명} 간편일정을 안내드립니다.

행복한 여행되시고 궁금하신 점은 언제든 문의주세요.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "url": "string"}',
  '[{"name": "간편일정 확인", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/s/#{url}", "linkPc": "https://go.singsinggolf.kr/s/#{url}"}]',
  'tour_document',
  true
),

-- 11. 견적서 안내
(
  '견적서 안내',
  'alimtalk',
  'quote_guide',
  '견적서 안내',
  '[싱싱골프] #{이름}님 맞춤 견적서',
  '[싱싱골프] #{이름}님 맞춤 견적서

안녕하세요 #{이름}님,
요청하신 #{투어명} 견적서를 안내드립니다.

💰 총 금액: #{총금액}원
📅 출발일: #{출발일}
👥 인원: #{인원}명

자세한 내용은 아래 링크에서 확인하세요.

*해당 견적 알림 메시지는 고객님의 요청에 의해 발송됩니다.',
  '{"이름": "string", "투어명": "string", "총금액": "string", "출발일": "string", "인원": "string", "quote_id": "string"}',
  '[{"name": "견적서 확인", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/quote/#{quote_id}", "linkPc": "https://go.singsinggolf.kr/quote/#{quote_id}"}]',
  'quote',
  true
),

-- 14. 계약금 요청
(
  '계약금 요청',
  'alimtalk',
  'deposit_request',
  '계약금 요청',
  '[싱싱골프] #{투어명} 계약금 안내',
  '[싱싱골프] #{투어명} 계약금 안내

#{이름}님, #{투어명} 예약을 위한 계약금을 안내드립니다.

💳 계약금: #{계약금}원
🏦 입금계좌: #{은행명} #{계좌번호}
📍 예금주: (주)싱싱골프

감사합니다.
싱싱골프 드림',
  '{"투어명": "string", "이름": "string", "계약금": "string", "은행명": "string", "계좌번호": "string"}',
  '[]',
  'payment_request',
  true
),

-- 15. 계약금 확인
(
  '계약금 확인',
  'alimtalk',
  'deposit_confirmation',
  '계약금 확인',
  '[싱싱골프] 계약금 입금 확인',
  '[싱싱골프] 계약금 입금 확인

#{이름}님, #{투어명} 계약금 #{계약금}원이 확인되었습니다.

📅 출발일: #{출발일}

감사합니다.
싱싱골프 드림',
  '{"이름": "string", "투어명": "string", "계약금": "string", "출발일": "string"}',
  '[]',
  'payment_confirmation',
  true
),

-- 16. 잔금 요청
(
  '잔금 요청',
  'alimtalk',
  'balance_request',
  '잔금 요청',
  '[싱싱골프] #{투어명} 잔금 안내',
  '[싱싱골프] #{투어명} 잔금 안내

#{이름}님, 출발이 얼마 남지 않았습니다!

💵 잔금: #{잔금}원
📅 납부기한: #{납부기한}
🏦 입금계좌: #{은행명} #{계좌번호}
📍 예금주: (주)싱싱골프

#{추가안내}

기한 내 미입금시 예약이 취소될 수 있습니다.
☎ 031-215-3990',
  '{"투어명": "string", "이름": "string", "잔금": "string", "납부기한": "string", "은행명": "string", "계좌번호": "string", "추가안내": "string"}',
  '[]',
  'payment_request',
  true
),

-- 17. 결제 완료
(
  '결제 완료',
  'alimtalk',
  'payment_complete',
  '결제 완료',
  '[싱싱골프] #{투어명} 결제 완료',
  '[싱싱골프] #{투어명} 결제 완료

#{이름}님, #{투어명} 결제가 완료되었습니다.

✅ 총 결제금액: #{총금액}원
📅 출발일: #{출발일}

여행 준비사항은 아래에서 확인하세요.',
  '{"투어명": "string", "이름": "string", "총금액": "string", "출발일": "string", "url": "string"}',
  '[{"name": "여행 안내 보기", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/portal/#{url}", "linkPc": "https://go.singsinggolf.kr/portal/#{url}"}]',
  'payment_confirmation',
  true
),

-- 18. 환불 완료
(
  '환불 완료',
  'alimtalk',
  'refund_complete',
  '환불 완료',
  '[싱싱골프] #{환불사유} 환불 완료',
  '[싱싱골프] #{환불사유} 환불 완료

#{이름}님, #{환불사유}(으)로 인한 환불이 완료되었습니다.

💸 환불금액: #{환불금액}원
🏦 환불계좌: #{은행명} #{계좌번호끝4자리}
📅 처리일시: #{처리일시}

#{추가안내}

문의사항은 연락주세요.
☎ 031-215-3990',
  '{"환불사유": "string", "이름": "string", "환불금액": "string", "은행명": "string", "계좌번호끝4자리": "string", "처리일시": "string", "추가안내": "string"}',
  '[]',
  'refund',
  true
),

-- 19. 투어 확정
(
  '투어 확정',
  'alimtalk',
  'tour_confirmation',
  '투어 확정',
  '[싱싱골프] #{투어명} 확정 안내',
  '[싱싱골프] #{투어명} 확정 안내

#{이름}님, #{투어명} 투어가 확정되었습니다.

🏌 #{투어명}
📅 출발: #{출발일}

싱싱골프와 함께 떠나볼까요?
자세한 내용은 아래 링크에서 확인하세요.',
  '{"투어명": "string", "이름": "string", "출발일": "string", "url": "string"}',
  '[{"name": "종합 여정 안내", "linkType": "WL", "linkTypeName": "웹링크", "linkMo": "https://go.singsinggolf.kr/portal/#{url}", "linkPc": "https://go.singsinggolf.kr/portal/#{url}"}]',
  'tour_confirmation',
  true
);

-- 템플릿 타입별로 사용 가능한 템플릿 조회를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_message_templates_use_case ON message_templates(use_case);
CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(type);
