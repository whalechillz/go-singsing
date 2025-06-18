# 마케팅 콘텐츠 관리 시스템 가이드

## 개요
마케팅 페이지의 포함사항, 특별혜택, 불포함사항을 DB로 관리하는 시스템입니다.
실무용 콘텐츠와 마케팅용 콘텐츠를 분리하여 관리할 수 있습니다.

## 주요 특징

### 1. 데이터 구조
- **marketing_contents**: 마케팅 콘텐츠 마스터 테이블
- **marketing_included_items**: 포함/불포함 항목
- **marketing_special_benefits**: 특별혜택 전용 테이블
- **marketing_icons**: 아이콘 관리

### 2. 콘텐츠 타입
- **tour_product**: 투어 상품 전체에 적용되는 기본 마케팅 콘텐츠
- **tour_specific**: 특정 투어에만 적용되는 개별 마케팅 콘텐츠

### 3. 관리 기능
- 드래그 앤 드롭으로 순서 변경
- 아이콘 선택
- 특별혜택 배지 커스터마이징
- 실시간 미리보기

## 사용 방법

### 1. 마이그레이션 실행
```bash
# 마이그레이션 파일 실행
./apply-migration.sh
```

### 2. 투어 상품 마케팅 콘텐츠 관리
```tsx
// 투어 상품 수정 페이지에 추가
<MarketingContentManager
  tourProductId={tourProductId}
  contentType="tour_product"
/>
```

### 3. 개별 투어 마케팅 콘텐츠 관리
```tsx
// 투어 수정 페이지에 추가
<MarketingContentManager
  tourId={tourId}
  tourProductId={tourProductId}
  contentType="tour_specific"
/>
```

### 4. 마케팅 페이지에 표시
```tsx
// 마케팅 페이지 컴포넌트
function TourMarketingPage({ tourId }) {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    // 개별 투어 콘텐츠 우선, 없으면 투어 상품 콘텐츠 표시
    fetch(`/api/marketing/content?tourId=${tourId}`)
      .then(res => res.json())
      .then(data => {
        if (data.items.length === 0) {
          // 투어 상품 콘텐츠 가져오기
          return fetch(`/api/marketing/content?tourProductId=${tourProductId}`);
        }
        return data;
      })
      .then(data => setItems(data.items));
  }, [tourId]);
  
  return <MarketingContentDisplay items={items} />;
}
```

## 콘텐츠 우선순위

1. **개별 투어 마케팅 콘텐츠** (tour_specific)
   - 특정 투어에만 적용되는 맞춤형 콘텐츠
   - 특별 프로모션이나 이벤트용

2. **투어 상품 마케팅 콘텐츠** (tour_product)
   - 동일 상품의 모든 투어에 적용되는 기본 콘텐츠
   - 표준 포함/불포함 사항

## 특별혜택 관리

### 배지 색상
- 빨강: 긴급/한정 프로모션
- 파랑: 일반 혜택
- 보라: 프리미엄 혜택
- 초록: 친환경/웰니스
- 주황: 시즌 특가

### 혜택 타입
- **discount**: 할인 혜택
- **gift**: 사은품
- **upgrade**: 업그레이드
- **exclusive**: 독점 혜택

## 아이콘 시스템

기본 제공 아이콘:
- 🏨 숙박 (accommodation)
- 🍽️ 식사 (meal)
- 🚌 교통 (transport)
- 🏌️ 카트 (golf_cart)
- 👤 캐디 (caddie)
- 🔒 락커 (locker)
- ⛳ 그린피 (green_fee)
- 📋 보험 (insurance)
- 🎁 선물 (gift)
- 💰 할인 (discount)

## 주의사항

1. 마케팅 콘텐츠는 실무 콘텐츠와 별도로 관리됩니다
2. 특별혜택은 유효기간을 설정할 수 있습니다
3. 순서는 드래그 앤 드롭으로 쉽게 변경 가능합니다
4. 아이콘은 확장 가능한 구조로 설계되었습니다

## 향후 개선사항

- [ ] A/B 테스트 지원
- [ ] 다국어 지원
- [ ] 템플릿 시스템
- [ ] 버전 관리 및 히스토리
