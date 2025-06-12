# "기사님 연락처만 표시" 체크박스 문제 수정

## 문제 설명
통합 표지 수정 시 "기사님 연락처만 표시"를 체크했다가 취소하면 담당 매니저 연락처가 의도와 다르게 표시되는 문제

## 원인 분석
`/app/admin/tours/[tourId]/document-links/page.tsx`에서:
```javascript
// 현재 문제가 있는 코드
setEditShowOnlyDriver(!settings.contactNumbers.manager && !!settings.contactNumbers.driver);
```
이 로직은 저장된 연락처 데이터를 기반으로 체크박스 상태를 추측하는데, 사용자의 의도와 다를 수 있습니다.

## 수정 방안

### 1. 포털 설정에 `showOnlyDriver` 필드 명시적 추가

```typescript
// handleCreatePortal 함수 수정
const handleCreatePortal = async () => {
  try {
    const portalSettings = {
      theme: portalTheme,
      showContact: showContactInfo,
      enableThemeSelector: enableThemeSelector,
      showOnlyDriver: showOnlyDriver, // 명시적으로 저장
      contactNumbers: {
        manager: showOnlyDriver ? '' : managerPhone,
        driver: driverPhone
      },
      targetAudience: targetAudience,
      specialNotice: specialNotice
    };

    // ... 나머지 코드
  } catch (error) {
    // ... 에러 처리
  }
};

// handleUpdatePortal 함수도 동일하게 수정
const handleUpdatePortal = async () => {
  if (!editingPortalLink) return;
  
  try {
    const portalSettings = {
      theme: editPortalTheme,
      showContact: editShowContactInfo,
      enableThemeSelector: editEnableThemeSelector,
      showOnlyDriver: editShowOnlyDriver, // 명시적으로 저장
      contactNumbers: {
        manager: editShowOnlyDriver ? '' : editManagerPhone,
        driver: editDriverPhone
      },
      targetAudience: editTargetAudience,
      specialNotice: editSpecialNotice
    };

    // ... 나머지 코드
  } catch (error) {
    // ... 에러 처리
  }
};
```

### 2. 설정 불러오기 로직 개선

```typescript
const handleEditClick = async (link: DocumentLink) => {
  if (link.document_type === 'portal') {
    setEditingPortalLink(link);
    const settings = link.settings || {};
    
    // 기본값 설정
    setEditPortalTheme(settings.theme || 'blue');
    setEditShowContactInfo(settings.showContact !== false);
    setEditEnableThemeSelector(settings.enableThemeSelector !== false);
    setEditTargetAudience(settings.targetAudience || 'customer');
    setEditSpecialNotice(settings.specialNotice || '');
    
    // showOnlyDriver 설정 - 명시적으로 저장된 값 사용
    setEditShowOnlyDriver(settings.showOnlyDriver === true);
    
    // 항상 DB에서 최신 연락처 정보 불러오기
    const contacts = await fetchTourContacts();
    
    // 연락처 설정
    if (settings.contactNumbers) {
      // 저장된 값 우선, 없으면 DB 값 사용
      setEditManagerPhone(settings.contactNumbers.manager || contacts.managerPhone || '');
      setEditDriverPhone(settings.contactNumbers.driver || contacts.driverPhone || '');
    } else {
      // settings가 없으면 DB 값 사용
      setEditManagerPhone(contacts.managerPhone || '');
      setEditDriverPhone(contacts.driverPhone || '');
    }
    
    setIsEditPortalModalOpen(true);
  } else {
    // ... 일반 문서 수정 로직
  }
};
```

### 3. 체크박스 변경 시 상태 관리 개선

```typescript
// 체크박스 변경 핸들러 개선
const handleShowOnlyDriverChange = (checked: boolean) => {
  setShowOnlyDriver(checked);
  
  // 체크 시 매니저 연락처를 임시 저장
  if (checked && managerPhone) {
    setTempManagerPhone(managerPhone);
    // UI에서는 매니저 입력 필드를 숨김
  } else if (!checked && tempManagerPhone) {
    // 체크 해제 시 임시 저장된 매니저 연락처 복원
    setManagerPhone(tempManagerPhone);
  }
};
```

### 4. UI 개선 - 사용자에게 명확한 피드백 제공

```typescript
{showContactInfo && (
  <label className="flex items-center gap-3 ml-7">
    <input
      type="checkbox"
      checked={showOnlyDriver}
      onChange={(e) => setShowOnlyDriver(e.target.checked)}
      className="w-4 h-4 text-blue-600 rounded"
    />
    <span className="text-sm text-gray-600">
      기사님 연락처만 표시
      {showOnlyDriver && (
        <span className="text-xs text-gray-500 ml-2">
          (매니저 연락처는 숨겨집니다)
        </span>
      )}
    </span>
  </label>
)}
```

## 테스트 시나리오
1. 통합 표지 생성 시 "기사님 연락처만 표시" 체크
2. 저장 후 다시 수정 모드 진입
3. 체크박스 상태가 올바르게 복원되는지 확인
4. 체크 해제 시 매니저 연락처가 올바르게 표시되는지 확인
5. 다시 저장 후 최종 확인

## 추가 개선사항
- 연락처 정보가 변경될 때마다 자동 저장 기능 추가
- 연락처 미리보기 기능 추가
- 변경 사항 추적 및 히스토리 기능
