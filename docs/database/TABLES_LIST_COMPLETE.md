# 싱싱골프 데이터베이스 테이블 목록 (최신)
*최종 업데이트: 2025-06-18 (Supabase Dashboard 기준)*

## 📊 뷰 (Views)
- `tour_with_auto_badges` - 마케팅용 통합 뷰 ⭐

## 🗄️ 핵심 투어 테이블
- `singsing_tours` - 투어 기본 정보 ⭐
- `singsing_participants` - 참가자 정보 ⭐
- `singsing_payments` - 결제 정보
- `singsing_rooms` - 객실 배정
- `singsing_tee_times` - 티타임 정보
- `singsing_participant_tee_times` - 참가자-티타임 매핑
- `singsing_tour_staff` - 투어 스탭 정보

## 🚀 운영/일정 테이블
- `tour_journey_items` - 일정 엿보기 항목 ⭐
- `tourist_attractions` - 관광지/장소 마스터 ⭐
- `tour_products` - 투어 상품 템플릿
- `tour_promotion_pages` - 프로모션 페이지
- `tour_staff_details` - 스탭 상세 정보

## 📝 메모/문서 테이블
- `singsing_memos` - 일반 메모
- `singsing_memo_templates` - 메모 템플릿
- `singsing_work_memos` - 업무 메모
- `documents` - 문서
- `public_document_links` - 공개 문서 링크

## 💬 메시지/마케팅 테이블
- `message_logs` - 메시지 로그
- `message_templates` - 메시지 템플릿
- `marketing_campaigns` - 마케팅 캠페인

## 👥 사용자/인증 테이블
- `users` - 사용자 정보
- `active_users` - 활성 사용자
- `customers` - 고객 정보
- `roles` - 역할/권한

## ⚙️ 시스템 테이블
- `singsing_settings` - 시스템 설정

---

## 🔍 주요 테이블 관계
```
tour_with_auto_badges (VIEW)
    ↓
singsing_tours ←→ singsing_participants
    ↓                    ↓
tour_journey_items   singsing_payments
    ↓
tourist_attractions
```

## 💡 작업별 사용 가이드

### 투어 목록 조회
```sql
SELECT * FROM tour_with_auto_badges 
ORDER BY start_date DESC;
```

### 투어 생성/수정
```sql
-- 기본 정보
UPDATE singsing_tours 
SET title = '새 투어명' 
WHERE id = 'tour-id';

-- 일정 정보
INSERT INTO tour_journey_items 
(tour_id, day_number, spot_id, order_index)
VALUES ('tour-id', 1, 'spot-id', 1);
```

### 참가자 관리
```sql
-- 참가자 조회
SELECT * FROM singsing_participants 
WHERE tour_id = 'tour-id';

-- 결제 정보
SELECT * FROM singsing_payments 
WHERE participant_id = 'participant-id';
```
