# 참가자 수 불일치 문제 해결 가이드

## 문제 상황
투어 리스트에서 참가자 수가 "29/28"로 표시되지만, 실제 상세 페이지에서는 16명만 표시되는 문제

## 원인 분석
1. **중복 데이터**: 동일한 참가자가 여러 번 등록되어 있을 가능성
2. **삭제된 데이터**: 참가자를 삭제했지만 카운트가 제대로 업데이트되지 않음
3. **상태 불일치**: 취소된 참가자도 전체 카운트에 포함되고 있을 가능성

## 해결 방법

### 0. 필수 패키지 설치
먼저 tsx 패키지를 설치합니다:

```bash
npm install --save-dev tsx dotenv
```

### 1. 참가자 수 확인
먼저 실제 데이터베이스 상태를 확인합니다:

```bash
npm run check-participants
```

이 명령어는 다음을 확인합니다:
- 각 투어의 실제 참가자 수
- 최대 참가자 수 초과 여부
- 중복된 참가자 존재 여부
- 참가자 상태별 집계

### 2. 중복 참가자 정리
중복된 참가자가 발견되면:

```bash
# 먼저 어떤 중복이 있는지 확인
npm run fix-duplicates

# 실제로 중복을 삭제하려면
npm run fix-duplicates -- --confirm
```

**주의**: 이 작업은 되돌릴 수 없으므로 신중하게 진행하세요.

### 3. 수동으로 확인하기

#### 관리자 페이지에서:
1. 문제가 있는 투어의 상세 페이지로 이동
2. 참가자 목록에서 중복된 이름이 있는지 확인
3. 전화번호가 동일한 참가자가 여러 명 있는지 확인

#### 참가자 상태 확인:
- "확정" 상태의 참가자만 실제 참가자로 계산해야 함
- "취소" 상태의 참가자는 제외해야 함

### 4. 임시 해결책
문제가 지속되면 다음을 시도하세요:

1. **브라우저 캐시 삭제**
   - Ctrl + F5 (Windows) 또는 Cmd + Shift + R (Mac)

2. **페이지 새로고침**
   - 투어 목록 페이지에서 새로고침 버튼 클릭

3. **상태 필터 사용**
   - 참가자 관리 페이지에서 "확정" 탭만 선택하여 실제 참가자 수 확인

## 예방 방법

1. **참가자 추가 시**:
   - 동일한 이름과 전화번호의 참가자가 이미 있는지 확인
   - 엑셀 업로드 시 중복 확인 기능 활용

2. **참가자 삭제 시**:
   - 삭제 후 페이지를 새로고침하여 카운트 확인

3. **정기적인 데이터 정리**:
   - 주기적으로 `npm run check-participants` 실행
   - 문제 발견 시 즉시 조치

## 기술적 세부사항

참가자 수 계산 로직:
- `singsing_participants` 테이블에서 `tour_id`로 필터링
- 각 레코드를 1명으로 계산 (group_size와 무관)
- 상태와 관계없이 모든 레코드 포함

리스트 페이지 (`/app/admin/tours/page.tsx`):
```typescript
const { count: participantCount } = await supabase
  .from("singsing_participants")
  .select("id", { count: 'exact', head: true })
  .eq("tour_id", tour.id);
```

상세 페이지 (`/components/ParticipantsManager.tsx`):
```typescript
const calculateTotal = (participants: Participant[]) => {
  return participants.length;
};
```

## 문의
추가 지원이 필요하면 개발팀에 문의하세요.
