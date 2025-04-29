# TSX 컴포넌트 갤러리

Next.js와 GitHub API를 사용하여 TSX 컴포넌트를 업로드하고 관리할 수 있는 웹 애플리케이션입니다.

## 시작하기

### 필수 조건

- Node.js 18.0.0 이상
- GitHub 계정
- GitHub Personal Access Token

### 설치

1. 저장소 클론
```bash
git clone https://github.com/your-username/tsx-gallery.git
cd tsx-gallery
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
`.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
# GitHub API 설정
GITHUB_TOKEN=your_github_token_here
REPO_OWNER=your_github_username
REPO_NAME=tsx-gallery

# Next.js 설정
NEXT_PUBLIC_GITHUB_REPO=your_github_username/tsx-gallery
```

### GitHub 토큰 생성 방법

1. GitHub에 로그인
2. Settings > Developer settings > Personal access tokens > Tokens (classic)
3. "Generate new token" 클릭
4. 토큰에 다음 권한 부여:
   - repo (전체 권한)
   - workflow
5. 토큰 생성 후 복사하여 `.env.local` 파일의 `GITHUB_TOKEN`에 붙여넣기

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 기능

- TSX 컴포넌트 업로드
- 컴포넌트 목록 조회
- 컴포넌트 상세 정보 확인
- 컴포넌트 다운로드

## 기술 스택

- Next.js
- TypeScript
- Tailwind CSS
- GitHub API
- Octokit

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
