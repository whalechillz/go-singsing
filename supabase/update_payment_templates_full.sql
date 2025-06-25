-- 결제 관련 메시지 템플릿 업데이트
-- 1. 계좌 정보 및 템플릿 내용 업데이트
-- 2. 카카오 알림톡 템플릿 ID 업데이트

-- 계약금 요청 템플릿 업데이트
UPDATE message_templates 
SET 
  content = '[싱싱골프투어]

#{이름}님, 안녕하세요!
싱싱골프투어입니다.

#{투어명} 계약금 안내드립니다.

출발일: #{출발일}
입금계좌: #{은행명} #{계좌번호}
예금주: 싱싱골프투어(김탁수)
계약금: #{계약금}원

계약금 입금 후 꼭 연락 부탁드립니다.
감사합니다!',
  kakao_template_code = 'KA01TP25062302252304SmN6trd7FLO'
WHERE name = '계약금 요청';

-- 잔금 요청 템플릿 업데이트
UPDATE message_templates 
SET 
  content = '[싱싱골프투어]

#{이름}님, 안녕하세요!
싱싱골프투어입니다.

#{투어명} 잔금 안내드립니다.

잔금: #{잔금}원
입금계좌: #{은행명} #{계좌번호}
예금주: 싱싱골프투어(김탁수)
납부기한: #{납부기한}
#{추가안내}',
  kakao_template_code = 'KA01TP25062302060833KLK7e8ic71i'
WHERE name = '잔금 요청';

-- 계약금 확인 템플릿 업데이트
UPDATE message_templates 
SET 
  content = '[싱싱골프투어]

#{이름}님, 계약금 입금 확인되었습니다.

#{투어명}
출발일: #{출발일}
계약금: #{계약금}원

남은 잔금은 출발 전 안내드리겠습니다.
감사합니다!',
  kakao_template_code = 'KA01TP25062302703703439tZVT9pcpghg'
WHERE name = '계약금 확인';

-- 결제 완료 템플릿 업데이트
UPDATE message_templates 
SET 
  content = '[싱싱골프투어]

#{이름}님, 결제가 완료되었습니다.

#{투어명}
출발일: #{출발일}
총 결제금액: #{총금액}원

투어 준비사항은 추후 안내드리겠습니다.
감사합니다!',
  kakao_template_code = 'KA01TP25062302142533ZsJHNMYobYH'
WHERE name = '결제 완료';

-- 확인용 쿼리
SELECT name, kakao_template_code, content 
FROM message_templates 
WHERE name IN ('계약금 요청', '계약금 확인', '잔금 요청', '결제 완료');
