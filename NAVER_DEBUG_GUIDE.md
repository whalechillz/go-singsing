# 네이버 API 디버깅 도구

## 개요
네이버 API 401 오류를 해결하기 위한 단계별 디버깅 도구입니다.

## 접속 방법
1. 관리자 페이지 로그인
2. 사이드바에서 "네이버 API 디버깅" 메뉴 클릭
3. URL: `/admin/naver-debug`

## 주요 기능

### 1단계: 환경 변수 확인
- Vercel 환경 변수 설정 상태 확인
- API 키 존재 여부 및 형식 검증
- 실제 API 호출 테스트

### 2단계: API 엔드포인트 테스트
- 각 API별 개별 테스트 (지역, 블로그, 이미지, 통합)
- 실시간 응답 상태 확인
- 상세 에러 메시지 표시

### 3단계: 네이버 개발자 센터 체크리스트
- 필수 설정 사항 안내
- 서비스 URL 등록 가이드
- API 권한 설정 확인

## 문제 해결 순서

1. **환경 체크** 버튼 클릭
   - NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET이 설정되어 있는지 확인
   - Vercel 환경인지 로컬 환경인지 확인

2. **전체 테스트** 버튼 클릭
   - 401 오류가 발생하면 네이버 개발자 센터 설정 확인 필요
   - 성공하면 검색 결과 개수 표시

3. **응답 상세 정보** 확인
   - Raw JSON 응답으로 정확한 오류 원인 파악
   - errorCode와 errorMessage 확인

## 일반적인 오류 및 해결 방법

### 401 Unauthorized
- Client ID/Secret 불일치
- 네이버 개발자 센터 API 권한 미설정
- 서비스 URL 미등록

### 403 Forbidden  
- API 사용 권한 없음
- 일일 호출 한도 초과

### 500 Internal Server Error
- 서버 코드 오류
- 환경 변수 로드 실패

## 네이버 개발자 센터 설정
1. https://developers.naver.com 접속
2. 애플리케이션 설정에서:
   - 사용 API: 검색 > 지역, 블로그, 이미지 체크
   - 서비스 URL: https://go2.singsinggolf.kr 등록
   - 비로그인 오픈 API 서비스 환경: WEB 선택

## Vercel 환경 변수 설정
1. Vercel 대시보드 → Settings → Environment Variables
2. 다음 변수 추가:
   - `NAVER_CLIENT_ID`
   - `NAVER_CLIENT_SECRET`
3. 모든 환경에 적용 (Production, Preview, Development)
4. 저장 후 재배포 필수
