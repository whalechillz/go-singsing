# 보성 녹차밭 이미지 추가 방법

## 방법 1: SQL로 직접 추가 (권장)

1. Supabase Dashboard에 로그인
2. SQL Editor로 이동
3. `/scripts/fix_tourist_attractions_and_options.sql` 파일의 내용을 실행

이 SQL은 다음 작업을 수행합니다:
- 보성 녹차밭, 송광사, 순천만 습지에 이미지 URL 추가
- tour_attraction_options 테이블 생성 (없는 경우)
- 투어에 관광지 옵션 연결

## 방법 2: 관리자 페이지에서 수정

1. 관리자 페이지 접속: `/admin/attractions`
2. 보성 녹차밭 찾기
3. 수정(연필) 버튼 클릭
4. 대표 이미지 섹션에서:
   - "이미지 업로드" 버튼으로 파일 업로드
   - 또는 이미지 URL 직접 입력:
     ```
     https://cdn.pixabay.com/photo/2015/09/09/17/18/green-tea-plantation-932397_1280.jpg
     ```
5. 추가 이미지도 동일하게 추가
6. "수정" 버튼 클릭

## 추천 이미지 URL

### 보성 녹차밭
- 대표: https://cdn.pixabay.com/photo/2015/09/09/17/18/green-tea-plantation-932397_1280.jpg
- 추가1: https://cdn.pixabay.com/photo/2020/05/12/08/17/green-tea-5161747_1280.jpg
- 추가2: https://cdn.pixabay.com/photo/2016/05/30/14/10/green-tea-field-1424733_1280.jpg

### 송광사
- 대표: https://cdn.pixabay.com/photo/2019/11/14/02/05/temple-4625073_1280.jpg

### 순천만 습지
- 대표: https://cdn.pixabay.com/photo/2017/10/23/05/56/beach-2880261_1280.jpg

## 투어에 관광지 연결하기

투어 상품에 관광지가 표시되도록 하려면 `tour_attraction_options` 테이블에 데이터를 추가해야 합니다.
이는 SQL 스크립트에 포함되어 있습니다.
