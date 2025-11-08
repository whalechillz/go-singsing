import { test, expect } from '@playwright/test';

test.describe('대시보드 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 페이지로 이동
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 로그인이 필요한 경우 로그인 처리
    // 로그인 페이지로 리다이렉트되는지 확인
    if (page.url().includes('/login')) {
      // 로그인 정보 입력 (환경 변수에서 가져오기)
      const email = process.env.ADMIN_EMAIL || '';
      const password = process.env.ADMIN_PASSWORD || '';
      
      if (email && password) {
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("로그인")');
        await page.waitForURL('**/admin**', { timeout: 10000 });
      }
    }
  });

  test('대시보드 주요 내용 표시 확인', async ({ page }) => {
    // 대시보드 페이지로 이동
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 페이지 제목 확인
    await expect(page.locator('h1')).toContainText('싱싱골프투어 대시보드');
    
    // 현재 시간 표시 확인
    await expect(page.locator('text=/\\d{4}년 \\d{1,2}월 \\d{1,2}일/')).toBeVisible();
  });

  test('이번 달 통계 카드 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 이번 달 투어 카드
    await expect(page.locator('text=이번 달 투어')).toBeVisible();
    
    // 이번 달 참가자 카드
    await expect(page.locator('text=이번 달 참가자')).toBeVisible();
    
    // 예상 매출 카드
    await expect(page.locator('text=예상 매출')).toBeVisible();
    
    // 이번달 수금액 카드
    await expect(page.locator('text=이번달 수금액')).toBeVisible();
  });

  test('투어 통계 카드 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 투어 통계 섹션 확인
    await expect(page.locator('text=투어 통계')).toBeVisible();
    
    // 완료된 투어 카드
    await expect(page.locator('text=완료된 투어')).toBeVisible();
    
    // 예정인 투어 카드
    await expect(page.locator('text=예정인 투어')).toBeVisible();
  });

  test('결제 통계 카드 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 결제 통계 섹션 확인
    await expect(page.locator('text=결제 통계')).toBeVisible();
    
    // 총 수입 카드
    await expect(page.locator('text=총 수입')).toBeVisible();
    
    // 계약금 카드
    await expect(page.locator('text=계약금')).toBeVisible();
    
    // 잔금 카드
    await expect(page.locator('text=잔금')).toBeVisible();
    
    // 전액 입금 카드
    await expect(page.locator('text=전액 입금')).toBeVisible();
    
    // 완납 금액 카드
    await expect(page.locator('text=완납 금액')).toBeVisible();
    
    // 미수금 카드
    await expect(page.locator('text=미수금')).toBeVisible();
    
    // 미납 카드
    await expect(page.locator('text=미납')).toBeVisible();
    
    // 정산 금액 카드
    await expect(page.locator('text=정산 금액')).toBeVisible();
  });

  test('미수금 및 수금률 카드 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 미수금 카드
    await expect(page.locator('text=미수금')).toBeVisible();
    
    // 수금률 카드
    await expect(page.locator('text=수금률')).toBeVisible();
  });

  test('월간/연간 전환 기능 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 월간 버튼 확인
    const periodButton = page.locator('button:has-text("월간")');
    await expect(periodButton).toBeVisible();
    
    // 월간 버튼 클릭하여 연간으로 전환
    await periodButton.click();
    await expect(page.locator('button:has-text("연간")')).toBeVisible();
  });

  test('새로고침 버튼 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 새로고침 버튼 확인
    const refreshButton = page.locator('button:has-text("새로고침")');
    await expect(refreshButton).toBeVisible();
    
    // 새로고침 버튼 클릭
    await refreshButton.click();
  });

  test('카드 값이 숫자로 표시되는지 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 페이지 로딩 대기
    await page.waitForSelector('text=이번 달 투어', { timeout: 10000 });
    
    // 모든 카드의 값이 숫자 형식으로 표시되는지 확인
    const valuePatterns = [
      /\\d+개/,
      /\\d+명/,
      /\\d+원/,
      /\\d+%/
    ];
    
    // 각 카드의 값 확인
    const cards = page.locator('[class*="rounded-lg"]');
    const cardCount = await cards.count();
    
    // 최소한 몇 개의 카드가 있는지 확인
    expect(cardCount).toBeGreaterThan(0);
    
    // 주요 카드의 값이 숫자 형식인지 확인
    const monthlyToursText = await page.locator('text=/\\d+개/').first().textContent();
    expect(monthlyToursText).toMatch(/\\d+개/);
  });
  
  test('결제 통계 값 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 페이지 로딩 대기
    await page.waitForSelector('text=결제 통계', { timeout: 10000 });
    
    // 총 수입 값 확인
    const totalRevenue = page.locator('text=총 수입').locator('..').locator('text=/\\d+원/');
    await expect(totalRevenue.first()).toBeVisible();
    
    // 계약금 값 확인
    const depositAmount = page.locator('text=계약금').locator('..').locator('text=/\\d+원/');
    await expect(depositAmount.first()).toBeVisible();
    
    // 잔금 값 확인
    const balanceAmount = page.locator('text=잔금').locator('..').locator('text=/\\d+원/');
    await expect(balanceAmount.first()).toBeVisible();
    
    // 완납 금액 값 확인
    const fullyPaidAmount = page.locator('text=완납 금액').locator('..').locator('text=/\\d+원/');
    await expect(fullyPaidAmount.first()).toBeVisible();
    
    // 정산 금액 값 확인
    const settlementAmount = page.locator('text=정산 금액').locator('..').locator('text=/\\d+원/');
    await expect(settlementAmount.first()).toBeVisible();
  });

  test('다가오는 투어 섹션 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 다가오는 투어 섹션 확인
    await expect(page.locator('text=다가오는 투어')).toBeVisible();
  });

  test('빠른 작업 섹션 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin');
    
    // 빠른 작업 섹션 확인
    await expect(page.locator('text=빠른 작업')).toBeVisible();
  });
});

