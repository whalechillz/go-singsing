# 싱싱골프 데이터베이스 테이블 목록
*최종 업데이트: 2025-06-18*

## 📊 주요 뷰 (Views)
- `tour_with_auto_badges` - 마케팅용 통합 뷰 (자동계산 필드 포함)

## 🗄️ 핵심 테이블 (Core Tables)
- `singsing_tours` - 투어 기본 정보
- `singsing_participants` - 참가자 정보
- `singsing_payments` - 결제 정보
- `singsing_schedules` - 일정 정보
- `singsing_rooms` - 객실 정보
- `singsing_tee_times` - 티타임
- `singsing_participant_tee_times` - 참가자-티타임 매핑
- `singsing_tour_staff` - 스탭 정보

## 🚀 운영 테이블 (Operational Tables)
- `tour_journey_items` - 일정 엿보기 항목
- `tourist_attractions` - 관광지/장소 정보
- `tour_boarding_places` - 탑승 정보
- `singsing_boarding_places` - 탑승 장소
- `singsing_tour_boarding_times` - 투어별 탑승 시간

## 📦 상품 테이블 (Product Tables)
- `tour_products` - 투어 상품 템플릿

## 📝 기타 테이블 (Other Tables)
- `singsing_memo_templates` - 메모 템플릿
- `singsing_memos` - 메모
- `singsing_work_memos` - 업무 메모
- `documents` - 문서

## 🔍 빠른 확인 방법
1. Supabase Dashboard > Table Editor
2. SQL Editor에서 쿼리 실행
3. 이 문서 참조
