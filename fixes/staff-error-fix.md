# 투어 운영진(스탭) 추가 에러 수정 방안

## 문제 진단
1. 스탭 추가 시 에러가 발생하지만 구체적인 에러 메시지가 표시되지 않음
2. 데이터베이스 제약조건이나 필수 필드 누락 가능성

## 수정 사항

### 1. `/app/admin/tours/[tourId]/edit/page.tsx` 수정

#### 에러 처리 개선
```typescript
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setSaving(true);
  setError("");
  
  try {
    // ... 기존 코드 ...
    
    // 3. 스탭진 업데이트/추가 - 에러 처리 개선
    const validStaff = staff.filter(s => s.name.trim() !== "");
    
    for (let i = 0; i < validStaff.length; i++) {
      const staffMember = validStaff[i];
      const staffData = {
        tour_id: tourId,
        name: staffMember.name.trim(),
        phone: staffMember.phone.trim(),
        role: staffMember.role || '가이드',
        display_order: i + 1,
        order: i + 1 // order 필드도 추가 (legacy 지원)
      };
      
      try {
        if (staffMember.id) {
          // 기존 스탭진 업데이트
          const { error } = await supabase
            .from("singsing_tour_staff")
            .update(staffData)
            .eq("id", staffMember.id);
            
          if (error) {
            console.error(`스탭 업데이트 오류 (${staffMember.name}):`, error);
            throw new Error(`${staffMember.name} 스탭 정보 업데이트 실패: ${error.message}`);
          }
        } else {
          // 새 스탭진 추가
          const { error } = await supabase
            .from("singsing_tour_staff")
            .insert([staffData]);
            
          if (error) {
            console.error(`스탭 추가 오류 (${staffMember.name}):`, error);
            throw new Error(`${staffMember.name} 스탭 추가 실패: ${error.message}`);
          }
        }
      } catch (staffError) {
        // 개별 스탭 에러 처리
        throw staffError;
      }
    }
    
    alert('투어 정보가 성공적으로 저장되었습니다.');
    router.push("/admin/tours");
  } catch (error: any) {
    console.error('투어 저장 중 오류:', error);
    setError(error.message || '저장 중 오류가 발생했습니다.');
    
    // 스크롤을 에러 메시지로 이동
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    setSaving(false);
  }
};
```

#### 스탭 추가 시 유효성 검사 강화
```typescript
const addStaff = () => {
  // 최대 스탭 수 제한 (예: 10명)
  if (staff.length >= 10) {
    alert('스탭은 최대 10명까지 추가할 수 있습니다.');
    return;
  }
  
  setStaff([...staff, { 
    name: "", 
    phone: "", 
    role: "가이드",
    display_order: staff.length + 1 
  }]);
};
```

### 2. 데이터베이스 제약조건 확인

Supabase에서 `singsing_tour_staff` 테이블의 제약조건을 확인하세요:
- `tour_id`가 foreign key로 올바르게 설정되어 있는지
- `name` 필드가 NOT NULL인지
- `display_order` 또는 `order` 필드가 필수인지

### 3. 디버깅을 위한 콘솔 로그 추가

```typescript
// 스탭 데이터 저장 전 로그
console.log('저장할 스탭 데이터:', {
  tourId,
  validStaff,
  deletedStaffIds
});
```

## 테스트 방법
1. 브라우저 개발자 도구의 콘솔을 열어두고 테스트
2. 네트워크 탭에서 Supabase API 응답 확인
3. 다양한 시나리오 테스트:
   - 새 스탭 추가
   - 기존 스탭 수정
   - 스탭 삭제 후 저장
   - 여러 스탭 동시 추가
