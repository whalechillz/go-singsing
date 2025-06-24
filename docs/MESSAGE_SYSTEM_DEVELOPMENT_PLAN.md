# 🚀 메시지 발송 시스템 고도화 개발 계획

## 📅 개발 일정 (2025년 6월)

### Phase 1: 기초 인프라 구축 (6/22-6/25)
- [x] DB 스키마 설계 완료
- [x] SQL 쿼리 작성 완료
- [ ] 메시지 템플릿 등록 (카카오 비즈메시지)
- [ ] 이미지 디자인 제작

### Phase 2: 백엔드 개발 (6/26-6/30)
- [ ] API 엔드포인트 구현
- [ ] 타겟팅 쿼리 함수 구현
- [ ] 솔라피 API 연동 확장
- [ ] 발송 이력 관리

### Phase 3: 프론트엔드 개발 (7/1-7/5)
- [ ] 고객 DB 필터 UI
- [ ] 마케팅 발송 모달
- [ ] 발송 현황 대시보드
- [ ] 템플릿 미리보기

### Phase 4: 테스트 및 배포 (7/6-7/8)
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 운영 배포

## 🛠️ 주요 개발 항목

### 1. 백엔드 API 개발

#### 1-1. 고객 타겟팅 API
```typescript
// /api/customers/targeting
interface TargetingRequest {
  filters: {
    region?: string[];
    tourHistory?: 'participated' | 'not_participated' | 'all';
    lastContactMonths?: number;
    lastTourMonths?: number;
    tags?: string[];
    kakaoOnly?: boolean;
  };
  limit?: number;
  offset?: number;
}

interface TargetingResponse {
  customers: Customer[];
  total: number;
  filters: TargetingRequest['filters'];
}
```

#### 1-2. 대량 발송 API
```typescript
// /api/messages/bulk-send
interface BulkSendRequest {
  customerIds: string[];
  message: {
    type: 'SMS' | 'LMS' | 'MMS' | 'KAKAO';
    templateId?: string;
    content: string;
    variables?: Record<string, any>;
    imageUrl?: string; // MMS only
  };
  schedule?: {
    sendAt: Date;
    timezone: string;
  };
  campaign?: {
    name: string;
    description?: string;
  };
}
```

#### 1-3. 발송 이력 API
```typescript
// /api/messages/history
interface MessageHistoryRequest {
  customerId?: string;
  campaignId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  type?: MessageType;
  status?: MessageStatus;
}
```

### 2. 프론트엔드 컴포넌트

#### 2-1. CustomerFilter 컴포넌트
```typescript
// components/marketing/CustomerFilter.tsx
interface CustomerFilterProps {
  onFilterChange: (filters: CustomerFilters) => void;
  boardingPlaces: BoardingPlace[];
  tags: string[];
}

const CustomerFilter: React.FC<CustomerFilterProps> = ({
  onFilterChange,
  boardingPlaces,
  tags
}) => {
  // 지역별 그룹핑
  // 투어 이력 필터
  // 연락 시점 필터
  // 태그 선택
};
```

#### 2-2. MarketingSendModal 컴포넌트
```typescript
// components/marketing/MarketingSendModal.tsx
interface MarketingSendModalProps {
  customers: Customer[];
  templates: MessageTemplate[];
  onSend: (request: BulkSendRequest) => Promise<void>;
}
```

#### 2-3. MessageDashboard 컴포넌트
```typescript
// components/marketing/MessageDashboard.tsx
interface DashboardMetrics {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  cost: number;
}
```

### 3. 데이터베이스 작업

#### 3-1. 필요한 인덱스 추가
```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_customers_region ON customers USING gin(tags);
CREATE INDEX idx_participants_tour_phone ON singsing_participants(tour_id, phone);
CREATE INDEX idx_boarding_assignments_compound ON boarding_place_assignments(participant_id, boarding_place_id);
CREATE INDEX idx_message_logs_campaign ON message_logs(campaign_id, status, sent_at);
```

#### 3-2. 뷰 생성
```sql
-- 고객 마케팅 정보 통합 뷰
CREATE VIEW customer_marketing_view AS
SELECT 
  c.*,
  cbi.region,
  cbi.boarding_place,
  cbi.last_tour_date,
  ml.last_contact_date,
  ml.total_messages_sent,
  ml.last_message_type
FROM customers c
LEFT JOIN customer_boarding_info cbi ON c.id = cbi.customer_id
LEFT JOIN customer_message_stats ml ON c.id = ml.customer_id;
```

### 4. UI/UX 개선사항

#### 4-1. 고객 DB 페이지 개선
```
[고객 데이터베이스]
┌─────────────────────────────────────────┐
│ [엑셀업로드] [내보내기] [+고객추가]     │
│ [📤 마케팅 발송 ▼]                     │
│   └─ 홍보 안내                         │
│   └─ 특별 프로모션                     │
│   └─ 맞춤 메시지                       │
├─────────────────────────────────────────┤
│ [필터 패널]                             │
│ 지역: □수도권 □경기북부 □경기남부      │
│ 투어: ○전체 ○참여 ○미참여             │
│ 연락: [최근 3개월 ▼]                   │
│ 태그: [선택 ▼]                         │
│                                         │
│ 선택된 고객: 245명                      │
├─────────────────────────────────────────┤
│ [고객 리스트]                           │
└─────────────────────────────────────────┘
```

#### 4-2. 발송 모달 UI
```
[마케팅 메시지 발송]
┌─────────────────────────────────────────┐
│ 1. 발송 대상 (245명)                    │
│ ├─ 수도권: 180명                       │
│ ├─ 투어 참여: 200명                    │
│ └─ 카카오 친구: 150명                  │
├─────────────────────────────────────────┤
│ 2. 메시지 유형                          │
│ ○ 카카오 알림톡 (권장)                 │
│ ○ SMS (90자)                           │
│ ○ LMS (장문)                           │
│ ○ MMS (이미지)                         │
├─────────────────────────────────────────┤
│ 3. 템플릿 선택                          │
│ [홍보 안내 ▼]                          │
│                                         │
│ 4. 메시지 내용                          │
│ ┌───────────────────────────┐           │
│ │ [미리보기 영역]           │           │
│ └───────────────────────────┘           │
│                                         │
│ 5. 발송 옵션                            │
│ □ 예약 발송 [날짜/시간]                │
│ □ 테스트 발송 [휴대폰 번호]            │
│                                         │
│ 예상 비용: 4,655원 (19원 × 245명)      │
│                                         │
│ [취소] [테스트] [발송하기]              │
└─────────────────────────────────────────┘
```

### 5. 보안 및 권한 관리

#### 5-1. 권한 체계
```typescript
enum MarketingPermission {
  VIEW_CUSTOMERS = 'marketing:view_customers',
  SEND_MESSAGES = 'marketing:send_messages',
  VIEW_CAMPAIGNS = 'marketing:view_campaigns',
  MANAGE_TEMPLATES = 'marketing:manage_templates'
}
```

#### 5-2. 발송 제한
- 동일 고객 일일 발송 제한: 3회
- 대량 발송 시간당 제한: 1,000건
- 야간 발송 차단: 21:00 ~ 09:00

### 6. 모니터링 및 분석

#### 6-1. 실시간 모니터링
```typescript
interface RealtimeMetrics {
  sending: number;
  delivered: number;
  failed: number;
  queueSize: number;
  avgDeliveryTime: number;
}
```

#### 6-2. 분석 리포트
- 일별/주별/월별 발송 통계
- 채널별 성과 비교
- 고객 세그먼트별 반응률
- 비용 분석

### 7. 에러 처리 및 재발송

#### 7-1. 에러 유형
```typescript
enum MessageErrorType {
  INVALID_PHONE = 'invalid_phone',
  TEMPLATE_ERROR = 'template_error',
  QUOTA_EXCEEDED = 'quota_exceeded',
  BALANCE_INSUFFICIENT = 'balance_insufficient',
  NETWORK_ERROR = 'network_error'
}
```

#### 7-2. 재발송 정책
- 네트워크 오류: 3회 재시도 (지수 백오프)
- 잔액 부족: 관리자 알림 후 대기
- 잘못된 번호: 고객 정보 업데이트 요청

## 📊 예상 효과

### 정량적 효과
- 마케팅 발송 시간: 2시간 → 10분 (92% 감소)
- 타겟팅 정확도: 60% → 85% (25%p 증가)
- 메시지 비용: 평균 20% 절감 (카카오톡 활용)

### 정성적 효과
- 고객 만족도 향상
- 마케팅 담당자 업무 효율성 증대
- 데이터 기반 의사결정 가능

## 🔄 향후 확장 계획

### Phase 5: AI 기능 추가 (2025 Q3)
- 최적 발송 시간 예측
- 메시지 내용 자동 생성
- 고객 이탈 예측 및 대응

### Phase 6: 옴니채널 확장 (2025 Q4)
- 이메일 마케팅 통합
- 네이버 톡톡 연동
- 인앱 푸시 알림

## 📝 체크리스트

### 개발 전 준비사항
- [ ] 카카오 비즈메시지 템플릿 18개 등록
- [ ] MMS 이미지 18종 제작
- [ ] 솔라피 API 권한 확인
- [ ] 개인정보 처리 방침 업데이트

### 개발 중 확인사항
- [ ] 단위 테스트 작성
- [ ] API 문서 작성
- [ ] 에러 로깅 구현
- [ ] 성능 테스트

### 배포 전 확인사항
- [ ] 스테이징 환경 테스트
- [ ] 부하 테스트
- [ ] 롤백 계획 수립
- [ ] 운영 가이드 작성

## 💡 주의사항

1. **개인정보보호**
   - 발송 이력 90일 후 자동 삭제
   - 고객 동의 여부 항상 확인
   - 민감 정보 마스킹 처리

2. **발송 품질**
   - 중복 발송 방지 로직 필수
   - 발송 전 미리보기 확인
   - 테스트 발송 후 실제 발송

3. **비용 관리**
   - 일일 발송 한도 설정
   - 채널별 비용 최적화
   - 월별 예산 모니터링
