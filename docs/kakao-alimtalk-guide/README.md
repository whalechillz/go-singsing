# 카카오 알림톡 가이드 문서

이 디렉토리는 싱싱골프의 카카오 알림톡 템플릿 등록 및 관리를 위한 가이드 문서를 포함하고 있습니다.

## 📁 문서 구조

```
kakao-alimtalk-guide/
├── index.html           # 메인 가이드 페이지 (웹 버전)
├── styles.css          # 가이드 페이지 스타일
├── checklist.md        # 템플릿 등록 체크리스트
├── template-list.md    # 등록된 템플릿 목록 및 상태
├── image-guide.md      # 템플릿 이미지 제작 가이드
├── migration-status.md # 알리고→솔라피 마이그레이션 현황
└── README.md          # 이 문서
```

## 🚀 빠른 시작

### 웹 가이드 보기
1. 브라우저에서 `index.html` 파일 열기
2. 또는 로컬 서버로 실행:
   ```bash
   cd docs/kakao-alimtalk-guide
   python -m http.server 8000
   # http://localhost:8000 접속
   ```

### 체크리스트 활용
1. 새 템플릿 등록 시 `checklist.md` 참조
2. 각 단계별로 체크하며 진행
3. 완료 후 `template-list.md`에 정보 업데이트

## 📝 주요 정보

### 카카오 채널 정보
- **채널명:** 싱싱골프
- **PFID:** KA01PF250616100116116JGCMFKunkh
- **플랫폼:** 솔라피(Solapi)

### 템플릿 정보
1. **투어 문서 안내**
   - ID: KA01TP250620031346737xziXAto9wWT
   - 용도: 개별 문서 발송
   - 상태: 등록 완료

2. **투어 통합 안내**
   - ID: (심사 중)
   - 용도: 포털 페이지 안내
   - 상태: 심사 중

### 환경 변수
```env
SOLAPI_API_KEY=your_api_key
SOLAPI_API_SECRET=your_api_secret
SOLAPI_PFID=KA01PF250616100116116JGCMFKunkh
```

## 🔧 관련 파일 위치

### 백엔드 코드
- `/app/api/messages/send-document/route.ts`

### 프론트엔드 컴포넌트
- `/components/DocumentSendModal.tsx`

### 환경 변수
- Vercel Dashboard → Settings → Environment Variables

## 📞 담당자 정보
- **개발팀:** dev@singsinggolf.kr
- **마케팅팀:** marketing@singsinggolf.kr
- **고객센터:** 031-215-3990

## 📅 업데이트 내역
- 2025-06-20: 가이드 문서 생성
- 2025-06-20: 투어 문서 안내 템플릿 등록 완료
- 2025-06-20: 투어 통합 안내 템플릿 심사 신청