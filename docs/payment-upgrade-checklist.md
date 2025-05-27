# 결제 관리 시스템 업그레이드 체크리스트

## 사전 확인사항
- [ ] 현재 운영 중인 결제 데이터 백업
- [ ] 데이터베이스 컬럼 추가 확인 (payment_type, payment_status, payment_date)
- [ ] 개발 환경에서 테스트 완료

## 기능 테스트 체크리스트

### 1. 계약금/잔금 관리
- [ ] 투어 선택 시 계약금(30%) 자동 계산
- [ ] 투어 선택 시 잔금(70%) 자동 계산
- [ ] 전액 선택 시 100% 표시
- [ ] 그룹 결제 시 인당 금액 × 인원수 계산

### 2. 결제 상태 관리
- [ ] 완료 상태 표시 (초록색 배지)
- [ ] 대기 상태 표시 (노란색 배지)
- [ ] 취소 상태 표시 (회색 배지)
- [ ] 환불 상태 표시 (빨간색 배지)

### 3. 환불 처리
- [ ] 완료된 결제만 환불 버튼 표시
- [ ] 환불 사유 필수 입력 확인
- [ ] 환불 처리 후 상태 변경 확인
- [ ] 환불된 금액 대시보드 반영

### 4. 대시보드
- [ ] 총 수입 계산 (환불 제외)
- [ ] 계약금 총액 표시
- [ ] 미수금 인원수 표시
- [ ] 환불 총액 표시

### 5. 참가자별 결제 현황
- [ ] 완납자 수 계산
- [ ] 부분납부자 수 계산 (계약금만)
- [ ] 미납자 수 계산

### 6. 기존 기능 호환성
- [ ] 개별 결제 등록
- [ ] 그룹 일괄 결제
- [ ] 결제 수정
- [ ] 결제 삭제
- [ ] 영수증 요청 관리

## 데이터 마이그레이션
- [ ] 기존 payment_method 'deposit' → 'bank' 변환
- [ ] payment_type 기본값 'deposit' 설정
- [ ] payment_status 기본값 'completed' 설정
- [ ] payment_date 누락 시 created_at 사용

## 배포 절차

### 1. 백업
```bash
# 프로덕션 데이터베이스 백업
pg_dump [프로덕션_DB_URL] > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. 데이터베이스 업데이트
```sql
-- 이미 migration에 있지만 재확인
ALTER TABLE singsing_payments
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'deposit' CHECK (payment_type IN ('deposit', 'balance', 'full')),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'cancelled', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### 3. 빌드 및 배포
```bash
# 로컬 테스트
npm run build

# 커밋
git add -A
git commit -m "feat: 결제 관리 시스템 대규모 업그레이드

- 계약금(30%)/잔금(70%) 자동 계산 기능 추가
- 결제 상태 관리 (완료/대기/취소/환불)
- 환불 처리 기능 추가
- 프로페셔널한 대시보드 UI
- 참가자별 결제 현황 요약
- 영수증 종류 선택 개선
- 기존 데이터 호환성 유지"

# 푸시
git push origin main
```

### 4. 운영 환경 확인
- [ ] 페이지 정상 로딩
- [ ] 기존 데이터 정상 표시
- [ ] 새 결제 등록 테스트
- [ ] 환불 처리 테스트

## 롤백 계획
문제 발생 시:
1. 이전 버전으로 git revert
2. 백업한 데이터베이스 복원
3. 재배포

## 담당자 연락처
- 개발팀: [연락처]
- DB 관리자: [연락처]
- 운영팀: [연락처]