# Storybook 설치 가이드

## 1. Storybook 설치

```bash
# Next.js 프로젝트에 Storybook 추가
npx storybook@latest init

# 필요한 추가 패키지 설치
npm install --save-dev @storybook/addon-essentials @storybook/addon-interactions
```

## 2. Storybook 설정 파일 수정

`.storybook/main.js`:
```javascript
module.exports = {
  stories: [
    "../design-system/**/*.stories.@(js|jsx|ts|tsx|mdx)",
    "../components/**/*.stories.@(js|jsx|ts|tsx|mdx)"
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
};
```

`.storybook/preview.js`:
```javascript
import '../styles/globals.css';
import '../design-system/brand-colors.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
```

## 3. 실행 명령어

```bash
# Storybook 실행
npm run storybook

# Storybook 빌드
npm run build-storybook
```
