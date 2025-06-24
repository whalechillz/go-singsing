# 📚 카카오 알림톡 가이드 문서 구조

## 🗂️ 파일 구조
```
go2.singsinggolf.kr/
├── KAKAO_ALIMTALK_GUIDE.md           # 메인 가이드 (개발자용)
├── docs/kakao-alimtalk-guide/
│   ├── template-list-complete.md      # 전체 템플릿 상세 목록
│   ├── icon-type-image-guide.md      # (기존 파일)
│   ├── image-remake-guide.md         # (기존 파일)
│   └── notion-content.md             # (기존 파일)
└── public/kakao-alimtalk-guide/
    ├── index.html                     # 웹 가이드 (팀원용)
    ├── styles.css                     # 웹 가이드 스타일
    ├── template-list.md               # 템플릿 목록 (개발 연동용)
    ├── image-guide.md                 # 이미지 제작 가이드
    ├── checklist.md                   # (기존 파일)
    ├── migration-status.md            # (기존 파일)
    └── README.md                      # (기존 파일)
```

## 📋 문서별 역할

### 1. **KAKAO_ALIMTALK_GUIDE.md**
- **대상**: 개발자
- **내용**: 전체 개요, 활성화 방법, 코드 연동
- **위치**: 프로젝트 루트

### 2. **template-list-complete.md**
- **대상**: 디자이너, 기획자
- **내용**: 10개 템플릿 전체 정보, 제작 체크리스트
- **위치**: /docs/kakao-alimtalk-guide/

### 3. **index.html**
- **대상**: 전체 팀원
- **내용**: 웹 기반 가이드, 시각적 설명
- **접속**: https://go.singsinggolf.kr/kakao-alimtalk-guide/

### 4. **template-list.md**
- **대상**: 개발자, 운영팀
- **내용**: 템플릿 ID 매핑, 코드 연동 예시
- **위치**: /public/kakao-alimtalk-guide/

### 5. **image-guide.md**
- **대상**: 디자이너
- **내용**: Figma 제작 가이드, 드롭 섀도우 설정
- **위치**: /public/kakao-alimtalk-guide/

## 🚀 사용 시나리오

### 디자이너
1. `image-guide.md` 확인하여 제작 규격 파악
2. `template-list-complete.md`에서 아이콘 목록 확인
3. Figma에서 10개 템플릿 이미지 제작
4. PNG 파일 Export 및 전달

### 운영팀
1. `index.html` 웹 가이드에서 전체 프로세스 확인
2. 솔라피 콘솔에서 템플릿 등록
3. 심사 통과 후 템플릿 ID 확보
4. 개발팀에 ID 전달

### 개발자
1. `KAKAO_ALIMTALK_GUIDE.md`에서 코드 연동 방법 확인
2. `template-list.md`에서 템플릿 ID 매핑
3. 환경 변수 설정 및 코드 수정
4. 테스트 및 배포

## 📊 진행 상태
- ✅ 가이드 문서 작성 완료
- ✅ 10개 템플릿 목록 확정
- ✅ 아이콘 디자인 확정
- ⏳ Figma 이미지 제작 중
- ⏳ 솔라피 템플릿 등록 대기
- ⏳ 코드 연동 대기

## 🔗 빠른 링크
- [웹 가이드](/public/kakao-alimtalk-guide/index.html)
- [템플릿 전체 목록](/docs/kakao-alimtalk-guide/template-list-complete.md)
- [이미지 제작 가이드](/public/kakao-alimtalk-guide/image-guide.md)
- [개발 연동 가이드](/KAKAO_ALIMTALK_GUIDE.md)