# Google Sheets 고객 데이터 마이그레이션 계획

## 개요
Google Sheets의 "singsing" 탭에서 고객 데이터를 가져와서 Supabase `customers` 테이블에 마이그레이션합니다.

## Google Sheets 정보
- URL: https://docs.google.com/spreadsheets/d/1MUvJyKGXFBZLUCuSnuOjZMjQqkSi5byu9d7u4O6uf9w/edit?gid=812281138#gid=812281138
- 시트명: singsing
- GID: 812281138

## 방법 1: Google Sheets API 사용 (권장)
다운로드 없이 직접 API로 데이터를 가져올 수 있습니다.

### 장점
- 실시간 데이터 동기화 가능
- 다운로드 불필요
- 자동화 가능

### 단점
- Google API 키 또는 서비스 계정 필요
- 초기 설정 필요

### 구현 방법
1. Google Cloud Console에서 프로젝트 생성
2. Google Sheets API 활성화
3. API 키 생성 또는 서비스 계정 생성
4. 스프레드시트를 공개로 설정하거나 서비스 계정에 공유

## 방법 2: CSV 다운로드 후 처리
간단하지만 수동 작업이 필요합니다.

### 장점
- 설정 간단
- API 키 불필요

### 단점
- 수동 다운로드 필요
- 실시간 동기화 불가

## 데이터베이스 스키마 매핑

### customers 테이블 필드
```sql
- id: UUID (자동 생성)
- name: VARCHAR(100) NOT NULL
- phone: VARCHAR(20) UNIQUE NOT NULL
- email: VARCHAR(255)
- birth_date: DATE
- gender: VARCHAR(10)
- marketing_agreed: BOOLEAN DEFAULT false
- marketing_agreed_at: TIMESTAMP
- kakao_friend: BOOLEAN DEFAULT false
- kakao_friend_at: TIMESTAMP
- status: VARCHAR(20) DEFAULT 'active'
- customer_type: VARCHAR(20)
- first_tour_date: DATE
- last_tour_date: DATE
- total_tour_count: INT DEFAULT 0
- total_payment_amount: DECIMAL(12,2) DEFAULT 0
- source: VARCHAR(50) -- 'google_sheet'로 설정
- source_id: VARCHAR(100) -- Google Sheets 행 번호
- notes: TEXT
- tags: TEXT[]
- position: VARCHAR(50)
- activity_platform: VARCHAR(50)
- referral_source: VARCHAR(50)
- last_contact_at: TIMESTAMP
- unsubscribed: BOOLEAN DEFAULT false
- unsubscribed_reason: TEXT
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()
```

## 마이그레이션 스크립트 계획

### 1단계: Google Sheets 데이터 읽기
- Google Sheets API 또는 CSV 파싱
- "singsing" 탭의 데이터 추출
- 헤더 행 확인 및 데이터 매핑

### 2단계: 데이터 변환 및 검증
- 필수 필드 확인 (name, phone)
- 전화번호 형식 정규화 (하이픈 제거/추가)
- 이메일 형식 검증
- 중복 데이터 확인 (phone 기준)

### 3단계: 데이터베이스 삽입
- 기존 고객 확인 (phone 기준)
- 신규 고객: INSERT
- 기존 고객: UPDATE (선택적)
- 배치 처리로 성능 최적화

### 4단계: 결과 리포트
- 성공/실패 건수
- 에러 로그
- 중복 데이터 리포트

## 구현 파일
- `scripts/migrate-customers-from-google-sheets.ts`: 마이그레이션 스크립트

## 실행 방법
```bash
npm run migrate:customers:google-sheets
```

## 주의사항
1. 전화번호는 UNIQUE 제약조건이 있으므로 중복 확인 필수
2. 기존 고객 데이터와 충돌 시 처리 방법 결정 필요
3. 대량 데이터 처리 시 배치 크기 조정 필요
4. 마이그레이션 전 백업 권장

