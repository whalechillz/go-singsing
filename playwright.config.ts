import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://go.singsinggolf.kr',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // 기본적으로 헤드리스 모드 (headed 옵션으로 오버라이드 가능)
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // 헤드 모드로 실행하려면 headless: false 설정
        // 또는 --headed 플래그 사용
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});

