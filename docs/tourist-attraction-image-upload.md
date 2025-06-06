# 관광지 이미지 업로드 기능 설정 가이드

## 1. Supabase Storage 설정

### Storage 버킷 생성
1. Supabase Dashboard에 로그인
2. Storage 메뉴로 이동
3. "New bucket" 클릭
4. 다음 설정으로 버킷 생성:
   - Name: `tourist-attractions`
   - Public bucket: ✅ 체크
   - File size limit: 5MB
   - Allowed MIME types: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

### SQL로 버킷 생성 (대안)
`/scripts/create_storage_bucket.sql` 파일의 내용을 Supabase SQL Editor에서 실행

## 2. 사용 방법

### 관광지 이미지 업로드
1. 관광지 관리 페이지(`/admin/attractions`)로 이동
2. "새 관광지 추가" 또는 기존 관광지 수정 클릭
3. 대표 이미지 섹션에서:
   - "이미지 업로드" 버튼 클릭하여 파일 선택
   - 또는 이미지 URL 직접 입력
4. 추가 이미지도 동일한 방법으로 업로드 가능

### 지원 형식
- 이미지 형식: JPG, PNG, WEBP
- 최대 파일 크기: 5MB
- 여러 장의 추가 이미지 업로드 가능

## 3. 기능 특징

- **실시간 미리보기**: 업로드한 이미지 즉시 확인
- **다중 이미지 지원**: 대표 이미지 + 추가 이미지들
- **URL 입력 지원**: 외부 이미지 URL도 사용 가능
- **이미지 개수 표시**: 카드에 총 이미지 개수 표시
- **자동 삭제**: 관광지 삭제 시 관련 이미지도 함께 정리

## 4. 주의사항

- Supabase Storage 버킷이 생성되어 있어야 함
- 이미지 업로드는 인증된 사용자만 가능
- 업로드된 이미지는 공개적으로 접근 가능