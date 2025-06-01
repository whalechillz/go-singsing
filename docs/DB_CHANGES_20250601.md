# 데이터베이스 변경사항 (2025-06-01)

## 1. singsing_participants 테이블 - 성별 필드 추가

### 변경 내용
- `gender` 필드 추가 (character varying)
- 허용값: 'M' (남성), 'F' (여성), NULL (미지정)

### SQL 마이그레이션
```sql
-- 이미 gender 필드가 있는 경우 이 쿼리는 필요 없음
ALTER TABLE singsing_participants 
ADD COLUMN IF NOT EXISTS gender character varying;

-- 기존 데이터에 대한 성별 업데이트 예시
UPDATE singsing_participants 
SET gender = 'M' 
WHERE name LIKE '%철수%' OR name LIKE '%영호%';

UPDATE singsing_participants 
SET gender = 'F' 
WHERE name LIKE '%영희%' OR name LIKE '%순자%';
```

### 테이블 구조
```sql
CREATE TABLE singsing_participants (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tour_id uuid REFERENCES singsing_tours(id),
    name character varying NOT NULL,
    phone character varying,
    team_name character varying,
    note text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status character varying,
    pickup_location character varying,
    emergency_contact character varying,
    join_count integer DEFAULT 1,
    is_confirmed boolean DEFAULT false,
    email character varying,
    role character varying,
    room_id uuid,
    gender character varying,  -- 새로 추가된 필드
    group_size integer,
    companions text[],
    is_paying_for_group boolean DEFAULT false,
    tee_time_id uuid
);
```

## 2. 관련 뷰 및 함수 업데이트

### 참가자 조회 시 성별 포함
```sql
-- 참가자 목록 조회 예시
SELECT 
    id,
    name,
    phone,
    team_name,
    gender,
    CASE 
        WHEN gender = 'M' THEN '남성'
        WHEN gender = 'F' THEN '여성'
        ELSE '미지정'
    END as gender_display
FROM singsing_participants
WHERE tour_id = $1
ORDER BY name;
```

## 3. 애플리케이션 변경사항

### TypeScript 타입 정의
```typescript
type Participant = {
  id: string;
  name: string;
  phone: string;
  team_name: string;
  note: string;
  status: string;
  tour_id: string;
  gender?: string; // 'M' | 'F' | null
  tee_time_assignments?: string[];
};
```

### 성별 표시 로직
- 혼성팀: "(혼성팀)" 표시
- 단일 성별팀: "(남성팀)" 또는 "(여성팀)" 표시
- 혼성팀 내 소수 성별: 개별 "(남)" 또는 "(여)" 표시

## 4. 데이터 입력 가이드

### 관리자 페이지에서 참가자 등록 시
1. 참가자 정보 입력 폼에 성별 선택 추가
2. 선택 옵션: 남성(M), 여성(F), 미지정(null)

### 엑셀 업로드 시
- 엑셀 파일에 '성별' 컬럼 추가
- 허용값: M, F, 남, 여, 남성, 여성
- 변환 로직: 남/남성 → M, 여/여성 → F

## 5. 주의사항

1. **기존 데이터**: 성별 정보가 없는 기존 참가자는 NULL로 유지
2. **프라이버시**: 성별 정보는 팀 구성 표시용으로만 사용
3. **문서 출력**: 고객용 문서에는 팀 타입만 표시, 스탭용에는 상세 정보 포함

## 6. 롤백 계획

문제 발생 시:
```sql
-- 성별 필드 제거 (데이터 손실 주의)
ALTER TABLE singsing_participants 
DROP COLUMN IF EXISTS gender;
```
