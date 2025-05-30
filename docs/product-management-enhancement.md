# 여행상품 관리 시스템 개선 가이드

## 📌 개요
이 문서는 싱싱골프투어 관리 시스템의 여행상품 관리 기능을 개선하는 방법을 단계별로 설명합니다.
- 작성일: 2025-05-30
- 목적: 버스 패키지 중심 → 다양한 상품 유형 지원
- 원칙: 기존 시스템 안정성 유지하며 점진적 확장

## 🎯 개선 목표

### 현재 상태
- 버스 패키지 투어만 지원
- 고정된 탭 메뉴 구조
- 제한적인 상품 정보

### 목표 상태
- 다양한 상품 유형 지원 (버스/항공/맞춤형/당일)
- 동적 탭 메뉴 시스템
- 확장된 상품 정보 관리

## 📋 구현 단계

### Phase 0: 백업 (필수!)
```sql
-- Supabase SQL Editor에서 실행
CREATE SCHEMA IF NOT EXISTS backup_product_enhancement;

CREATE TABLE backup_product_enhancement.tour_products AS 
SELECT * FROM public.tour_products;

CREATE TABLE backup_product_enhancement.singsing_tours AS 
SELECT * FROM public.singsing_tours;

-- 백업 확인
SELECT COUNT(*) FROM backup_product_enhancement.tour_products;
SELECT COUNT(*) FROM backup_product_enhancement.singsing_tours;
```

### Phase 1: 데이터베이스 준비

#### 1.1 상품 타입 ENUM 생성
```sql
-- 상품 카테고리 ENUM 타입 생성
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_type_enum') THEN
        CREATE TYPE product_type_enum AS ENUM (
            'bus_package',    -- 버스 패키지
            'air_package',    -- 항공 패키지  
            'custom',         -- 맞춤형
            'day_tour'        -- 당일 투어
        );
    END IF;
END$$;
```

#### 1.2 tour_products 테이블 수정
```sql
-- 상품 타입 컬럼 추가
ALTER TABLE tour_products 
ADD COLUMN IF NOT EXISTS product_type product_type_enum DEFAULT 'bus_package';

-- 추가 정보 컬럼들
ALTER TABLE tour_products
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS min_participants INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS max_participants INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS price_adult INTEGER,
ADD COLUMN IF NOT EXISTS price_child INTEGER,
ADD COLUMN IF NOT EXISTS includes_flight BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS includes_accommodation BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS includes_golf BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS includes_meals BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS duration_days INTEGER,
ADD COLUMN IF NOT EXISTS duration_nights INTEGER;

-- 기존 데이터 업데이트 (모두 버스 패키지로)
UPDATE tour_products 
SET product_type = 'bus_package' 
WHERE product_type IS NULL;
```

#### 1.3 singsing_tours 테이블 수정
```sql
-- 투어 타입 컬럼 추가
ALTER TABLE singsing_tours
ADD COLUMN IF NOT EXISTS tour_type product_type_enum DEFAULT 'bus_package';

-- 기존 투어 업데이트
UPDATE singsing_tours 
SET tour_type = 'bus_package' 
WHERE tour_type IS NULL;
```

#### 1.4 상품 타입별 추가 정보 테이블
```sql
-- 항공 패키지 추가 정보
CREATE TABLE IF NOT EXISTS air_package_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES tour_products(id) ON DELETE CASCADE,
    departure_airport VARCHAR(100),
    arrival_airport VARCHAR(100),
    airline VARCHAR(100),
    flight_duration VARCHAR(50),
    visa_required BOOLEAN DEFAULT FALSE,
    visa_info TEXT,
    UNIQUE(product_id)
);

-- 맞춤형 투어 추가 정보
CREATE TABLE IF NOT EXISTS custom_tour_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES tour_products(id) ON DELETE CASCADE,
    customizable_items JSONB, -- {golf_course: true, hotel: true, meals: true}
    price_per_person_min INTEGER,
    price_per_person_max INTEGER,
    consultation_required BOOLEAN DEFAULT TRUE,
    UNIQUE(product_id)
);

-- 당일 투어 추가 정보
CREATE TABLE IF NOT EXISTS day_tour_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES tour_products(id) ON DELETE CASCADE,
    pickup_time TIME,
    return_time TIME,
    pickup_locations TEXT[], -- 픽업 가능 지역
    includes_caddie BOOLEAN DEFAULT TRUE,
    includes_cart BOOLEAN DEFAULT TRUE,
    UNIQUE(product_id)
);
```

### Phase 2: 소스 코드 수정

#### 2.1 타입 정의 추가
```typescript
// types/product.ts (새 파일 생성)
export type ProductType = 'bus_package' | 'air_package' | 'custom' | 'day_tour';

export interface Product {
  id: string;
  name: string;
  product_type: ProductType;
  description?: string;
  golf_course?: string;
  hotel?: string;
  price_adult?: number;
  price_child?: number;
  min_participants?: number;
  max_participants?: number;
  includes_flight?: boolean;
  includes_accommodation?: boolean;
  includes_golf?: boolean;
  includes_meals?: boolean;
  duration_days?: number;
  duration_nights?: number;
}

export interface Tour {
  id: string;
  title: string;
  tour_type: ProductType;
  product_id?: string;
  date: string;
  price: number;
  // ... 기타 필드
}
```

#### 2.2 상품 생성 페이지 수정
```typescript
// app/admin/tour-products/new/page.tsx 수정
// 1. 상품 타입 선택 추가
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    상품 유형
  </label>
  <select
    name="product_type"
    value={formData.product_type}
    onChange={handleChange}
    className="w-full p-2 border rounded"
    required
  >
    <option value="bus_package">버스 패키지</option>
    <option value="air_package">항공 패키지</option>
    <option value="custom">맞춤형 투어</option>
    <option value="day_tour">당일 투어</option>
  </select>
</div>

// 2. 타입별 추가 필드 표시
{formData.product_type === 'air_package' && (
  <div className="space-y-4 p-4 bg-blue-50 rounded">
    <h3 className="font-semibold">항공 정보</h3>
    <input
      name="departure_airport"
      placeholder="출발 공항"
      className="w-full p-2 border rounded"
    />
    <input
      name="arrival_airport"
      placeholder="도착 공항"
      className="w-full p-2 border rounded"
    />
  </div>
)}
```

#### 2.3 동적 탭 시스템 구현
```typescript
// components/tours/DynamicTourTabs.tsx (새 파일)
import { ProductType } from '@/types/product';

interface TabConfig {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export function getTourTabs(tourId: string, tourType: ProductType): TabConfig[] {
  const basePath = `/admin/tours/${tourId}`;
  
  // 공통 탭
  const commonTabs: TabConfig[] = [
    { id: 'participants', label: '참가자 관리', href: `${basePath}/participants`, icon: 'users' },
    { id: 'schedule', label: '일정 관리', href: `${basePath}/schedule`, icon: 'calendar' },
    { id: 'documents', label: '문서 관리', href: `${basePath}/documents`, icon: 'file-text' }
  ];

  // 타입별 특화 탭
  const typeSpecificTabs: Record<ProductType, TabConfig[]> = {
    bus_package: [
      { id: 'room', label: '객실 배정', href: `${basePath}/room-assignment`, icon: 'bed' },
      { id: 'tee', label: '티오프시간 관리', href: `${basePath}/tee-times`, icon: 'clock' },
      { id: 'boarding', label: '탑승 스케줄 관리', href: `${basePath}/boarding`, icon: 'bus' }
    ],
    air_package: [
      { id: 'flight', label: '항공편 관리', href: `${basePath}/flights`, icon: 'plane' },
      { id: 'hotel', label: '호텔 예약', href: `${basePath}/hotels`, icon: 'hotel' },
      { id: 'tee', label: '티오프시간 관리', href: `${basePath}/tee-times`, icon: 'clock' }
    ],
    custom: [
      { id: 'request', label: '맞춤 요청', href: `${basePath}/requests`, icon: 'user-check' },
      { id: 'quote', label: '견적 관리', href: `${basePath}/quotes`, icon: 'dollar-sign' }
    ],
    day_tour: [
      { id: 'pickup', label: '픽업 관리', href: `${basePath}/pickup`, icon: 'car' },
      { id: 'tee', label: '티오프시간', href: `${basePath}/tee-times`, icon: 'clock' }
    ]
  };

  // 탭 조합
  return [
    commonTabs[0], // 참가자
    ...typeSpecificTabs[tourType],
    commonTabs[1], // 일정
    commonTabs[2]  // 문서
  ];
}
```

#### 2.4 투어 상세 페이지 수정
```typescript
// app/admin/tours/[id]/layout.tsx 수정
export default async function TourDetailLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode;
  params: { id: string };
}) {
  // 투어 정보 조회
  const { data: tour } = await supabase
    .from('singsing_tours')
    .select('*, tour_products(*)')
    .eq('id', params.id)
    .single();

  // 투어 타입 결정 (기본값: bus_package)
  const tourType = tour?.tour_type || 'bus_package';
  
  // 동적 탭 구성
  const tabs = getTourTabs(params.id, tourType);

  return (
    <div>
      <TourHeader tour={tour} />
      <TabNavigation tabs={tabs} />
      <div className="p-6">{children}</div>
    </div>
  );
}
```

### Phase 3: 점진적 마이그레이션

#### 3.1 기존 데이터 검증
```sql
-- 모든 기존 투어가 bus_package인지 확인
SELECT tour_type, COUNT(*) 
FROM singsing_tours 
GROUP BY tour_type;

-- 상품별 타입 확인
SELECT product_type, COUNT(*) 
FROM tour_products 
GROUP BY product_type;
```

#### 3.2 새 상품 타입 활성화
```typescript
// .env.local에 추가
ENABLE_NEW_PRODUCT_TYPES=true

// 코드에서 조건부 표시
{process.env.ENABLE_NEW_PRODUCT_TYPES === 'true' && (
  <option value="air_package">항공 패키지</option>
)}
```

#### 3.3 단계별 롤아웃
1. **1주차**: 개발 환경에서 테스트
2. **2주차**: 특정 관리자만 사용 가능
3. **3주차**: 전체 관리자 사용 가능
4. **4주차**: 실제 상품 등록 시작

### Phase 4: 모니터링 및 롤백

#### 4.1 사용 현황 모니터링
```sql
-- 일별 상품 타입별 생성 현황
SELECT 
  DATE(created_at) as date,
  product_type,
  COUNT(*) as count
FROM tour_products
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), product_type
ORDER BY date DESC;
```

#### 4.2 롤백 스크립트
```sql
-- 긴급 롤백이 필요한 경우
-- 1. 타입을 모두 bus_package로 되돌리기
UPDATE tour_products SET product_type = 'bus_package';
UPDATE singsing_tours SET tour_type = 'bus_package';

-- 2. 추가 테이블 비활성화 (삭제하지 않음)
ALTER TABLE air_package_details RENAME TO air_package_details_backup;
ALTER TABLE custom_tour_details RENAME TO custom_tour_details_backup;
ALTER TABLE day_tour_details RENAME TO day_tour_details_backup;
```

## 🚨 주의사항

1. **백업 필수**: 모든 변경 전 반드시 백업
2. **순차 실행**: Phase 순서대로 진행
3. **테스트 우선**: 개발 환경에서 충분히 테스트
4. **사용자 교육**: 새 기능 사용법 안내
5. **모니터링**: 변경 후 에러 로그 확인

## 📞 문제 발생 시

1. 즉시 롤백 스크립트 실행
2. 백업 데이터로 복원
3. 에러 로그 수집 및 분석
4. 개발팀 연락

## 📅 예상 일정

- **2025년 6월 1주**: DB 스키마 변경
- **2025년 6월 2주**: 소스 코드 수정
- **2025년 6월 3주**: 테스트 및 검증
- **2025년 6월 4주**: 프로덕션 적용

---
*이 문서는 단계별로 실행해야 하며, 각 단계마다 검증이 필요합니다.*