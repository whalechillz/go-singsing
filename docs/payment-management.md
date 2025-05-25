# 결제 관리 페이지 설계

## 개요
싱싱골프투어 참가자들의 결제 내역을 관리하는 페이지입니다.

## 주요 기능

### 1. 결제 정보 관리
- 투어별 결제 현황 조회
- 참가자별 결제 상태 확인
- 예약금/잔금 관리
- 그룹 일괄 결제 처리

### 2. 결제 상태 추적
- 대기중(pending)
- 완료(completed)
- 취소(cancelled)
- 환불(refunded)

### 3. 결제 유형
- 예약금(deposit)
- 잔금(balance)
- 전액(full)

### 4. 영수증 관리
- 현금영수증
- 세금계산서
- 간이영수증

## 메뉴 위치
결제 관리 페이지는 관리자 메뉴의 **"전체 참가자 관리"** 하위 메뉴로 추가하는 것이 적합합니다.

### 추천 메뉴 구조:
```
- 투어 상품 관리
- 투어 관리
- 전체 참가자 관리
  ├── 참가자 목록
  ├── 결제 관리 (NEW)
  └── 참가자 통계
- 전체 참가자 관리 (2)
- 문서 관리
- 설정
```

### 대안:
별도의 최상위 메뉴로 "결제 관리"를 추가할 수도 있습니다.

## 데이터베이스 구조

### singsing_payments 테이블
- `id`: UUID (Primary Key)
- `tour_id`: UUID (Foreign Key to singsing_tours)
- `participant_id`: UUID (Foreign Key to singsing_participants)
- `payer_id`: UUID (대표 결제자 ID)
- `payment_method`: VARCHAR (결제 방법)
- `amount`: INTEGER (결제 금액)
- `is_group_payment`: BOOLEAN (그룹 결제 여부)
- `receipt_type`: VARCHAR (영수증 유형)
- `receipt_requested`: BOOLEAN (영수증 요청 여부)
- `payment_type`: VARCHAR (deposit/balance/full)
- `payment_status`: VARCHAR (pending/completed/cancelled/refunded)
- `payment_date`: TIMESTAMP (결제일)
- `note`: TEXT (메모)
- `created_at`: TIMESTAMP

### singsing_participants 테이블 (결제 관련 필드)
- `is_paying_for_group`: BOOLEAN (그룹 대표 결제자 여부)
- `group_size`: INTEGER (그룹 인원수)
- `companions`: TEXT[] (동반자 이름 목록)

## UI 구성

### 1. 결제 현황 대시보드
- 투어별 결제 요약
- 미결제자 목록
- 금일 결제 현황

### 2. 결제 목록
- 필터: 투어, 결제 상태, 결제 유형, 날짜
- 검색: 참가자명, 전화번호
- 일괄 작업: 결제 확인, 영수증 발행

### 3. 결제 상세
- 참가자 정보
- 결제 금액 (예약금/잔금)
- 결제 방법
- 그룹 결제 정보
- 결제 이력

### 4. 그룹 결제 처리
- 대표 결제자 지정
- 동반자 목록 관리
- 일괄 결제 처리

## 구현 우선순위
1. 기본 결제 목록 및 상태 관리
2. 그룹 결제 처리 기능
3. 결제 통계 및 리포트
4. 영수증 발행 기능
