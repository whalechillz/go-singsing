# 싱싱골프투어 배포 및 테스트 가이드

## 🚀 배포 프로세스

### 1. Vercel 자동 배포
main 브랜치에 푸시하면 자동으로 배포됩니다:

```bash
# 1. 변경사항 확인
git status

# 2. 빌드 테스트
npm run build

# 3. 커밋
git add .
git commit -m "feat: 기능 설명"

# 4. 푸시 (자동 배포 트리거)
git push origin main
```

### 2. 배포 전 체크리스트
- [ ] 로컬에서 빌드 성공 확인 (`npm run build`)
- [ ] TypeScript 에러 없음 확인
- [ ] ESLint 경고/에러 해결
- [ ] 환경 변수 설정 확인
- [ ] 데이터베이스 마이그레이션 완료

### 3. 환경별 설정

#### 개발 환경
- URL: http://localhost:3000
- 환경 변수: `.env.local`

#### 스테이징 환경
- URL: https://staging-go2-singsinggolf.vercel.app
- 환경 변수: Vercel 대시보드에서 설정

#### 프로덕션 환경
- URL: https://go2.singsinggolf.kr
- 환경 변수: Vercel 대시보드에서 설정

## 🧪 테스트 가이드

### 1. 단위 테스트
```bash
# 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage
```

### 2. E2E 테스트
```bash
# Cypress 실행
npm run cypress:open

# Headless 모드
npm run cypress:run
```

### 3. 수동 테스트 체크리스트

#### 투어 관리
- [ ] 투어 생성
- [ ] 투어 수정
- [ ] 투어 삭제
- [ ] 투어 상세 정보 확인

#### 참가자 관리
- [ ] 참가자 추가
- [ ] 참가자 정보 수정
- [ ] 엑셀 업로드
- [ ] 엑셀 다운로드

#### 객실 배정
- [ ] 객실 타입 설정
- [ ] 참가자 배정
- [ ] 배정 변경
- [ ] 미배정 참가자 확인

#### 문서 생성
- [ ] 탑승 안내문 생성
- [ ] 투어 일정표 생성
- [ ] 객실 배정표 생성
- [ ] 프린트 미리보기

### 4. 성능 테스트
- [ ] 페이지 로딩 시간 < 3초
- [ ] 이미지 최적화 확인
- [ ] 번들 사이즈 확인
- [ ] Lighthouse 점수 > 90

## 🔍 모니터링

### 1. 에러 트래킹
- Sentry 대시보드 확인
- 에러 발생 시 알림 설정

### 2. 성능 모니터링
- Vercel Analytics 확인
- Core Web Vitals 지표 모니터링

### 3. 사용자 분석
- Google Analytics 확인
- 사용자 행동 패턴 분석

## 🐛 롤백 절차

문제 발생 시:

1. **즉시 롤백**
   ```bash
   # 이전 커밋으로 돌아가기
   git revert HEAD
   git push origin main
   ```

2. **Vercel 대시보드에서 롤백**
   - Deployments 탭 접속
   - 이전 배포 선택
   - "Promote to Production" 클릭

## 📋 배포 후 확인사항

### 필수 확인
- [ ] 메인 페이지 접속 가능
- [ ] 로그인/로그아웃 정상 작동
- [ ] 주요 기능 정상 작동
- [ ] 모바일 반응형 확인

### 데이터베이스
- [ ] 마이그레이션 적용 확인
- [ ] 데이터 정합성 확인
- [ ] 백업 생성

### 보안
- [ ] HTTPS 적용 확인
- [ ] 환경 변수 노출 없음
- [ ] API 엔드포인트 보안

## 🚨 긴급 대응

### 장애 발생 시
1. 장애 범위 파악
2. 롤백 여부 결정
3. 임시 조치 적용
4. 근본 원인 분석
5. 영구 조치 적용

### 연락처
- 개발팀: dev@singsinggolf.kr
- 운영팀: ops@singsinggolf.kr
- 긴급 연락처: 010-XXXX-XXXX

## 📝 배포 로그

배포 시마다 다음 정보 기록:
- 배포 일시
- 배포자
- 주요 변경사항
- 이슈 번호
- 롤백 여부
