# 🚨 싱싱골프투어 긴급 수동 패치 가이드

## 문제 1: 투어 운영진 추가 시 에러

### 파일: `/app/admin/tours/[tourId]/edit/page.tsx`

#### 1. handleSubmit 함수에서 catch 블록 찾기 (약 330줄 근처)
```javascript
// 기존 코드
} catch (error: any) {
  setError(error.message);
}
```

#### 2. 다음으로 변경
```javascript
// 수정된 코드
} catch (error: any) {
  console.error('Tour staff save error:', error);
  setError(`스탭 저장 중 오류: ${error.message || '알 수 없는 오류'}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

#### 3. staffData 객체에서 (약 270줄 근처)
```javascript
// 기존 코드
const staffData = {
  tour_id: tourId,
  name: staffMember.name,
  phone: staffMember.phone,
  role: staffMember.role,
  display_order: i + 1
};
```

#### 4. order 필드 추가
```javascript
// 수정된 코드
const staffData = {
  tour_id: tourId,
  name: staffMember.name.trim(),
  phone: staffMember.phone.trim(),
  role: staffMember.role || '가이드',
  display_order: i + 1,
  order: i + 1 // legacy support 추가
};
```

---

## 문제 2: "기사님 연락처만 표시" 체크박스 동기화

### 파일: `/app/admin/tours/[tourId]/document-links/page.tsx`

#### 1. handleCreatePortal 함수에서 (약 310줄 근처)
```javascript
// 기존 코드
const portalSettings = {
  theme: portalTheme,
  showContact: showContactInfo,
  enableThemeSelector: enableThemeSelector,
  contactNumbers: {
    manager: showOnlyDriver ? '' : managerPhone,
    driver: driverPhone
  },
  targetAudience: targetAudience,
  specialNotice: specialNotice
};
```

#### 2. showOnlyDriver 필드 추가
```javascript
// 수정된 코드
const portalSettings = {
  theme: portalTheme,
  showContact: showContactInfo,
  enableThemeSelector: enableThemeSelector,
  showOnlyDriver: showOnlyDriver, // 이 줄 추가!
  contactNumbers: {
    manager: showOnlyDriver ? '' : managerPhone,
    driver: driverPhone
  },
  targetAudience: targetAudience,
  specialNotice: specialNotice
};
```

#### 3. handleUpdatePortal 함수에서도 동일하게 추가 (약 350줄 근처)
```javascript
showOnlyDriver: editShowOnlyDriver, // 이 줄 추가!
```

#### 4. handleEditClick 함수에서 (약 440줄 근처)
```javascript
// 기존 코드
setEditShowOnlyDriver(!settings.contactNumbers.manager && !!settings.contactNumbers.driver);
```

#### 5. 다음으로 변경
```javascript
// 수정된 코드
setEditShowOnlyDriver(settings.showOnlyDriver === true);
```

---

## 테스트 방법

### 1. 스탭 추가 테스트
1. 투어 관리 → 투어 선택 → 수정
2. 스탭진 관리 탭
3. "스탭 추가" 클릭
4. 정보 입력 후 저장
5. 콘솔에서 에러 확인

### 2. 체크박스 테스트  
1. 투어 관리 → 문서 링크 관리
2. "통합 표지 만들기" 클릭
3. "기사님 연락처만 표시" 체크
4. 생성 후 다시 수정 모드 진입
5. 체크박스 상태 확인

---

## ⚠️ 주의사항
- 수정 전 반드시 백업하세요!
- 개발자 도구 콘솔을 열어두고 테스트하세요
- 문제 발생 시 백업 파일로 복원하세요

---

작성일: 2025-06-12
