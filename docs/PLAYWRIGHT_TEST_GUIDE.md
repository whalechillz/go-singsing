# Playwright 테스트 가이드

## Playwright 실행 모드

### 1. 헤드리스 모드 (기본값)
- **명령어**: `npm run test:e2e`
- **설명**: 브라우저 창이 보이지 않고 백그라운드에서 실행
- **장점**: 빠르고 리소스 사용량이 적음
- **단점**: 브라우저 동작을 직접 볼 수 없음

### 2. 헤드 모드 (브라우저 보이기)
- **명령어**: `npm run test:e2e:headed`
- **설명**: 브라우저 창이 보이면서 테스트 실행
- **장점**: 브라우저 동작을 직접 확인 가능
- **단점**: 상대적으로 느림

### 3. UI 모드 (인터랙티브)
- **명령어**: `npm run test:e2e:ui`
- **설명**: Playwright UI에서 테스트를 시각적으로 확인하고 디버깅 가능
- **장점**: 테스트를 단계별로 확인하고 디버깅 가능
- **단점**: 가장 느림

## 테스트 실행 방법

### 기본 실행 (헤드리스 모드)
```bash
npm run test:e2e
```

### 브라우저 보면서 실행 (헤드 모드)
```bash
npm run test:e2e:headed
```

### UI 모드로 실행 (인터랙티브)
```bash
npm run test:e2e:ui
```

### 특정 테스트만 실행
```bash
# 특정 테스트만 실행
npm run test:e2e:headed -- tests/dashboard.spec.ts --grep "대시보드 주요 내용"

# 특정 파일만 실행
npm run test:e2e:headed -- tests/dashboard.spec.ts
```

## 테스트 결과 확인

### HTML 리포트 보기
```bash
npx playwright show-report
```

### 스크린샷 확인
- 실패한 테스트의 스크린샷은 `test-results/` 폴더에 저장됩니다.

## 현재 설정

### package.json 스크립트
```json
{
  "test:e2e": "playwright test",              // 헤드리스 모드
  "test:e2e:ui": "playwright test --ui",     // UI 모드
  "test:e2e:headed": "playwright test --headed" // 헤드 모드
}
```

### playwright.config.ts
- 기본적으로 `headless: true`로 설정되어 있습니다.
- `--headed` 플래그를 사용하면 헤드 모드로 실행됩니다.

## 브라우저를 보면서 테스트하는 방법

### 방법 1: 헤드 모드 사용 (권장)
```bash
npm run test:e2e:headed
```

### 방법 2: UI 모드 사용 (디버깅용)
```bash
npm run test:e2e:ui
```

### 방법 3: 특정 테스트만 헤드 모드로 실행
```bash
npm run test:e2e:headed -- tests/dashboard.spec.ts --grep "대시보드 주요 내용"
```

## 주의사항

1. **헤드리스 모드가 기본값**
   - `npm run test:e2e`는 헤드리스 모드로 실행됩니다.
   - 브라우저를 보려면 반드시 `--headed` 플래그를 사용해야 합니다.

2. **테스트 속도**
   - 헤드리스 모드: 가장 빠름
   - 헤드 모드: 중간
   - UI 모드: 가장 느림

3. **CI/CD 환경**
   - CI/CD 환경에서는 헤드리스 모드를 사용하는 것이 좋습니다.
   - 로컬 개발/디버깅 시에는 헤드 모드나 UI 모드를 사용하세요.

