# 참가자-결제 연동 기능 배포 가이드

## 1. 파일 수정
`components/ParticipantsManagerV2.tsx` 파일을 수정해야 합니다.

### 수정 내용:
- Payment 인터페이스 추가
- Participant 인터페이스에 payment 필드 추가
- fetchParticipants 함수에서 결제 정보도 함께 조회
- 테이블에 "결제상태" 컬럼 추가
- 통계에 결제 현황 추가
- 필터 탭에 "결제완료", "미결제" 추가

## 2. 스크립트 실행 권한 부여
```bash
chmod +x git-commit.sh
chmod +x quick-payment-integration-commit.sh
```

## 3. 커밋 및 배포

### 방법 1: 대화형 스크립트 사용
```bash
./git-commit.sh
```
- 변경사항 확인
- 커밋 메시지 입력 (엔터 시 기본 메시지 사용)
- Push 여부 선택

### 방법 2: 빠른 커밋 스크립트 사용
```bash
./quick-payment-integration-commit.sh
```
- 자동으로 커밋 & Push 실행

## 4. 배포 확인
1. Vercel 대시보드에서 배포 상태 확인: https://vercel.com/dashboard
2. 배포 완료 후 사이트 확인: https://go2.singsinggolf.kr/admin/participants

## 5. 새로운 기능
- ✅ 결제완료 / ⏳ 결제대기 / 미결제 상태 표시
- 💳 일괄결제 표시
- 결제 금액 표시
- 결제율 통계
- 결제 상태별 필터링

## 주의사항
- ParticipantsManagerV2.tsx 파일을 artifacts의 코드로 수정 필요
- Supabase 테이블 수정은 불필요 (이미 필요한 구조 존재)
- 프론트엔드 코드 수정만으로 구현 가능
