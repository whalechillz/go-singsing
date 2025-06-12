# 싱싱골프투어 데이터 동기화 문제 종합 해결 방안

## 현재 문제점들

1. **투어 운영진 추가 시 에러 발생**
   - 구체적인 에러 메시지 없음
   - 데이터베이스 저장 실패

2. **"기사님 연락처만 표시" 체크박스 동기화 문제**
   - 설정과 실제 표시가 일치하지 않음
   - 사용자 의도와 다른 동작

3. **투어 정보와 문서 설정 간 데이터 불일치**
   - 투어 스탭 정보와 문서 링크 설정의 연락처가 다를 수 있음

## 종합 해결 방안

### 1. 데이터 구조 개선

```typescript
// 통합 표지 설정 타입 정의
interface PortalSettings {
  theme: string;
  showContact: boolean;
  enableThemeSelector: boolean;
  showOnlyDriver: boolean; // 명시적 필드 추가
  contactNumbers: {
    manager: string;
    driver: string;
  };
  targetAudience: 'customer' | 'staff' | 'golf';
  specialNotice: string;
  // 추가: 설정 버전 관리
  settingsVersion: number;
  lastUpdated: string;
}
```

### 2. 중앙 집중식 상태 관리

```typescript
// 전역 상태 관리를 위한 Context 생성
import { createContext, useContext, useState } from 'react';

interface TourDataContextType {
  tourInfo: Tour | null;
  tourStaff: StaffMember[];
  updateTourStaff: (staff: StaffMember[]) => void;
  refreshData: () => Promise<void>;
}

const TourDataContext = createContext<TourDataContextType>({
  tourInfo: null,
  tourStaff: [],
  updateTourStaff: () => {},
  refreshData: async () => {}
});

export const useTourData = () => useContext(TourDataContext);
```

### 3. 실시간 동기화 구현

```typescript
// Supabase 실시간 구독 설정
useEffect(() => {
  const staffSubscription = supabase
    .channel('tour-staff-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'singsing_tour_staff',
        filter: `tour_id=eq.${tourId}`
      },
      (payload) => {
        console.log('Staff change detected:', payload);
        refreshStaffData();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(staffSubscription);
  };
}, [tourId]);
```

### 4. 트랜잭션 처리로 데이터 일관성 보장

```typescript
// 투어 정보와 스탭 정보를 트랜잭션으로 처리
const saveTourWithStaff = async (tourData: TourForm, staffData: StaffMember[]) => {
  const { data, error } = await supabase.rpc('save_tour_with_staff', {
    p_tour_id: tourId,
    p_tour_data: tourData,
    p_staff_data: staffData
  });
  
  if (error) {
    throw new Error(`저장 실패: ${error.message}`);
  }
  
  return data;
};
```

### 5. 연락처 정보 통합 관리

```typescript
// 연락처 정보 중앙 관리 함수
const getConsolidatedContacts = async (tourId: string) => {
  // 1. 투어 스탭에서 연락처 가져오기
  const { data: staffData } = await supabase
    .from('singsing_tour_staff')
    .select('*')
    .eq('tour_id', tourId)
    .order('display_order');
  
  // 2. 투어 기본 정보에서 연락처 가져오기
  const { data: tourData } = await supabase
    .from('singsing_tours')
    .select('company_phone, company_mobile')
    .eq('id', tourId)
    .single();
  
  // 3. 설정에서 연락처 가져오기
  const { data: settingsData } = await supabase
    .from('app_settings')
    .select('*')
    .single();
  
  // 우선순위: 스탭 정보 > 투어 정보 > 기본 설정
  return {
    manager: findContact(staffData, ['매니저', '가이드']) || tourData?.company_mobile || settingsData?.default_mobile,
    driver: findContact(staffData, ['기사']) || '',
    company: tourData?.company_phone || settingsData?.company_phone || '031-215-3990'
  };
};
```

### 6. 에러 처리 및 로깅 개선

```typescript
// 상세한 에러 로깅 시스템
const logError = async (error: any, context: string) => {
  console.error(`[${context}] Error:`, error);
  
  // Supabase에 에러 로그 저장
  await supabase.from('error_logs').insert({
    context,
    error_message: error.message,
    error_stack: error.stack,
    user_id: getCurrentUserId(),
    tour_id: tourId,
    created_at: new Date().toISOString()
  });
  
  // 사용자에게 친화적인 에러 메시지 표시
  showUserFriendlyError(error, context);
};
```

### 7. 낙관적 업데이트 (Optimistic Updates)

```typescript
// UI를 즉시 업데이트하고 백그라운드에서 저장
const updateStaffOptimistically = async (newStaff: StaffMember[]) => {
  // 1. UI 즉시 업데이트
  setStaff(newStaff);
  setIsSaving(true);
  
  try {
    // 2. 백그라운드에서 저장
    await saveStaffToDatabase(newStaff);
    showSuccessMessage('저장되었습니다');
  } catch (error) {
    // 3. 실패 시 롤백
    setStaff(previousStaff);
    showErrorMessage('저장 실패. 다시 시도해주세요.');
  } finally {
    setIsSaving(false);
  }
};
```

## 구현 우선순위

1. **긴급 (1주일 내)**
   - 스탭 추가 에러 메시지 개선
   - 체크박스 상태 명시적 저장

2. **중요 (2주일 내)**
   - 연락처 정보 통합 관리
   - 트랜잭션 처리 구현

3. **개선 (1개월 내)**
   - 실시간 동기화
   - 중앙 집중식 상태 관리
   - 낙관적 업데이트

## 테스트 체크리스트

- [ ] 스탭 추가/수정/삭제가 정상 작동하는가?
- [ ] 에러 발생 시 명확한 메시지가 표시되는가?
- [ ] 체크박스 상태가 올바르게 저장/복원되는가?
- [ ] 여러 탭/창에서 동시 작업 시 데이터가 동기화되는가?
- [ ] 네트워크 오류 시 적절히 처리되는가?

## 모니터링

```typescript
// 성능 및 에러 모니터링
const monitorPerformance = () => {
  // 저장 시간 측정
  const startTime = performance.now();
  
  // 작업 수행
  await performOperation();
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // 성능 로그
  if (duration > 1000) {
    console.warn(`Slow operation detected: ${duration}ms`);
  }
};
```
