# 데이터 마이그레이션 가이드

## 폴더 구조
```
/data
  ├── migration-sample.csv    # CSV 샘플 파일
  └── [your-data].xlsx       # 실제 마이그레이션할 엑셀 파일

/scripts
  └── migrate-participants.ts # 마이그레이션 스크립트
```

## 데이터 준비

### 1. 샘플 파일 위치
- CSV 샘플: `/data/migration-sample.csv`
- 이 파일을 엑셀로 열어서 형식 참고

### 2. 엑셀 파일 준비
1. `/data/migration-sample.csv` 파일을 엑셀로 열기
2. 데이터 입력 (필수 컬럼 유지)
3. `.xlsx` 형식으로 저장

### 필수 컬럼
- 이름 (필수)
- 연락처
- 상품가
- 계약금
- 계약일
- 잔금
- 잔금일
- 탑승지/탑승시간
- 객실
- 비고

## 마이그레이션 실행

### 1. 필요한 패키지 설치
```bash
npm install -D tsx dotenv @types/xlsx
```

### 2. 환경변수 설정
`.env.local` 파일에 추가:
```
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 3. 실행 명령어
```bash
# 기본 형식
npm run migrate <엑셀파일경로> <투어ID>

# 예시
npm run migrate ./data/tour-participants.xlsx 123e4567-e89b-12d3-a456-426614174000
```

## 주의사항
1. 마이그레이션 전 반드시 DB 백업
2. 소량의 데이터로 먼저 테스트
3. 중복 데이터 확인 (같은 이름+전화번호)
4. 날짜 형식: YYYY.MM.DD
5. 금액: 숫자만 (쉼표 가능)

## 문제 해결
- 오류 발생 시 콘솔에 상세 내용 표시
- 실패한 행 번호와 이유 확인
- 필요시 엑셀 데이터 수정 후 재실행