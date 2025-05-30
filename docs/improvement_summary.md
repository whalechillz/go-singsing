# 싱싱골프투어 관리 시스템 개선 방향 요약

## 현재 상황 분석

### 문제점
1. **문서 개인화 부재** - 모든 참가자 정보가 하나의 문서에 노출
2. **권한 관리 미흡** - 체계적인 권한 시스템 부재
3. **수동 프로세스** - 투어 관리가 대부분 수동으로 진행
4. **회원 정보 부족** - 참가자 전화번호 등 개인정보 미보유

### 강점
1. 기본적인 투어/참가자/결제 관리 구현
2. Supabase 기반 안정적인 인프라
3. Next.js 기반 모던 아키텍처

## 개선 전략

### 1. 회원가입 전략
**추천 방안: 하이브리드 접근**

```
메인 사이트 (www.singsinggolf.kr)
├── 정식 회원가입 (OAuth 우선)
│   ├── 카카오톡 로그인 (추천)
│   ├── 구글 로그인
│   └── 네이버 로그인
│
└── 투어 문서 (go.singsinggolf.kr)
    └── 간편 가입 (투어 참가자용)
        ├── 초대 링크 방식
        └── 최소 정보 입력 (이름, 전화번호)
```

**이유:**
- 메인 사이트: 브랜드 일관성, SEO 효과
- 투어 문서: 참가자 편의성, 진입 장벽 낮춤

### 2. 문서 개인화 전략

**단기 해결책 (1-2개월)**
```typescript
// 고유 문서 URL 생성
/tour/{tourId}/document/{documentType}?token={uniqueToken}

// 간단 인증
- 이름 기반 조회
- 생년월일 추가 인증
- QR코드 스캔
```

**장기 해결책 (3-6개월)**
```typescript
// 개인화된 대시보드
/my/tours - 내 투어 목록
/my/documents - 내 문서함
/my/payments - 결제 내역
/my/profile - 프로필 관리
```

### 3. 권한 체계 구현

```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',     // 전체 시스템 관리
  OFFICE_ADMIN = 'office_admin',   // 실무자, 결재권자
  STAFF = 'staff',                 // 가이드, 기사
  CUSTOMER = 'customer'            // 일반 고객
}

// 권한별 접근 제어
const permissions = {
  super_admin: ['*'],  // 모든 권한
  office_admin: ['tours.*', 'participants.*', 'payments.*'],
  staff: ['tours.read', 'participants.read', 'checkin.*'],
  customer: ['own.documents', 'own.payments', 'own.profile']
}
```

### 4. 알림 시스템 구축

**내부 알림 (슬랙)**
- 중요 결정사항
- 시스템 오류
- 대량 예약/취소

**고객 알림 (솔라피)**
- 예약 확정 알림톡
- 출발 D-1 안내
- 탑승지 변경 알림
- 결제 완료 알림

### 5. 핵심 기능 우선순위

**Phase 1 (완료)** ✅
- UI/UX 개선
- 통계 대시보드
- 필터/검색 기능

**Phase 2 (진행중)** 🚧
- DB 스키마 확장
- 권한 시스템
- 기본 테이블 생성

**Phase 3 (2-3주)**
1. 참가자 그룹 관리
2. 객실 자동 배정
3. 티오프 조 편성
4. 탑승 좌석 배정
5. 일정표 관리

**Phase 4 (3-4주)**
1. 문서 템플릿 시스템
2. PDF 생성
3. QR코드 생성
4. 개인화 링크

**Phase 5 (4-5주)**
1. OAuth 연동
2. 회원 프로필
3. 투어 히스토리
4. 마이페이지

## 기술적 고려사항

### 보안
```typescript
// RLS 정책 예시
create policy "users_own_documents" on documents
  for select using (
    auth.uid() = user_id 
    or exists (
      select 1 from user_roles 
      where user_id = auth.uid() 
      and role in ('admin', 'staff')
    )
  );
```

### 성능 최적화
- 이미지 최적화 (Next.js Image)
- 문서 캐싱 (Redis)
- DB 인덱싱 전략
- API 응답 캐싱

### 모니터링
- Vercel Analytics
- Sentry 에러 트래킹
- 사용자 행동 분석 (GA4)

## 예상 일정

| 단계 | 기간 | 주요 작업 |
|------|------|-----------|
| Phase 2 | 1주 | DB 확장, 권한 시스템 |
| Phase 3 | 2-3주 | 5개 관리 페이지 |
| Phase 4 | 3-4주 | 문서 시스템 |
| Phase 5 | 4-5주 | 회원 시스템 |
| Phase 6 | 2주 | 알림 시스템 |
| Phase 7 | 2주 | 모바일 최적화 |

**총 예상 기간: 12-15주**

## 투자 대비 효과

### 단기 효과 (3개월 내)
- 업무 효율성 30% 향상
- 고객 만족도 증가
- 수동 작업 50% 감소

### 장기 효과 (6개월 후)
- 완전 자동화된 투어 관리
- 개인화된 고객 경험
- 데이터 기반 의사결정
- 확장 가능한 시스템

## 다음 액션 아이템

1. **즉시 시작**
   - [ ] Phase 2 DB 마이그레이션 실행
   - [ ] 관리자 권한 설정
   - [ ] 기존 데이터 정리

2. **1주 내**
   - [ ] 5개 관리 페이지 와이어프레임
   - [ ] API 설계 문서 작성
   - [ ] 컴포넌트 구조 설계

3. **2주 내**
   - [ ] 참가자 관리 페이지 개발
   - [ ] 객실 배정 페이지 개발
   - [ ] 테스트 환경 구축

---
*이 문서는 지속적으로 업데이트됩니다.*