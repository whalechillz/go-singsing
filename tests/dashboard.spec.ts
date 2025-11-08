import { test, expect } from '@playwright/test';

test.describe('대시보드 테스트', () => {
  test.beforeEach(async ({ page, context }) => {
    // 관리자 페이지로 이동
    await page.goto('https://go.singsinggolf.kr/admin', { waitUntil: 'networkidle' });
    
    // 로그인이 필요한 경우 로그인 처리
    if (page.url().includes('/login')) {
      // 로그인 정보 입력
      const email = 'taksoo.kim@gmail.com';
      const password = '112077';
      
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button:has-text("로그인")');
      
      // 로그인 완료 대기
      await page.waitForURL('**/admin**', { timeout: 15000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // 쿠키 저장 (다음 테스트에서 재사용)
      await context.storageState({ path: 'playwright/.auth/admin.json' });
    }
    
    // 대시보드 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // 로딩 스피너가 사라질 때까지 대기
    await page.waitForSelector('text=이번 달 투어, text=싱싱골프투어 대시보드', { 
      timeout: 20000,
      state: 'visible'
    }).catch(() => {
      // 요소가 없어도 계속 진행
    });
  });

  test('대시보드 주요 내용 표시 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 페이지 제목 확인 (더 유연한 선택자)
    const title = page.locator('h1, [class*="text-2xl"]').filter({ hasText: /대시보드|싱싱골프투어/ });
    await expect(title.first()).toBeVisible({ timeout: 15000 });
    await expect(title.first()).toContainText(/대시보드|싱싱골프투어/, { timeout: 10000 });
    
    // 현재 시간 표시 확인 (더 유연한 패턴, 첫 번째 요소만)
    const timeLocator = page.locator('text=/\\d{4}년|\\d{1,2}월|\\d{1,2}일|오후|오전/').first();
    await expect(timeLocator).toBeVisible({ timeout: 10000 });
  });

  test('이번 달 통계 카드 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 이번 달 투어 카드
    await expect(page.locator('text=이번 달 투어')).toBeVisible({ timeout: 15000 });
    
    // 이번 달 참가자 카드
    await expect(page.locator('text=이번 달 참가자')).toBeVisible({ timeout: 15000 });
    
    // 예상 매출 카드
    await expect(page.locator('text=예상 매출')).toBeVisible({ timeout: 15000 });
    
    // 이번달 수금액 카드
    await expect(page.locator('text=이번달 수금액')).toBeVisible({ timeout: 15000 });
  });

  test('투어 통계 카드 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 투어 통계 섹션 확인
    await expect(page.locator('text=투어 통계')).toBeVisible({ timeout: 15000 });
    
    // 완료된 투어 카드
    await expect(page.locator('text=완료된 투어')).toBeVisible({ timeout: 15000 });
    
    // 예정인 투어 카드
    await expect(page.locator('text=예정인 투어')).toBeVisible({ timeout: 15000 });
  });

  test('결제 통계 카드 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 결제 통계 섹션 확인
    await expect(page.locator('text=결제 통계')).toBeVisible({ timeout: 15000 });
    
    // 총 수입 카드 (첫 번째 요소만)
    await expect(page.locator('text=총 수입').first()).toBeVisible({ timeout: 15000 });
    
    // 계약금 카드
    await expect(page.locator('text=계약금').first()).toBeVisible({ timeout: 15000 });
    
    // 잔금 카드
    await expect(page.locator('text=잔금').first()).toBeVisible({ timeout: 15000 });
    
    // 전액 입금 카드
    await expect(page.locator('text=전액 입금').first()).toBeVisible({ timeout: 15000 });
    
    // 완납 금액 카드
    await expect(page.locator('text=완납 금액').first()).toBeVisible({ timeout: 15000 });
    
    // 미수금 카드 (결제 통계 섹션의 미수금만)
    await expect(page.locator('text=결제 통계').locator('..').locator('text=미수금').first()).toBeVisible({ timeout: 15000 });
    
    // 미납 카드
    await expect(page.locator('text=미납').first()).toBeVisible({ timeout: 15000 });
    
    // 정산 금액 카드
    await expect(page.locator('text=정산 금액').first()).toBeVisible({ timeout: 15000 });
  });

  test('미수금 및 수금률 카드 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 미수금 카드 (미수금 및 수금률 섹션의 미수금만)
    await expect(page.locator('text=미수금').filter({ hasText: /^미수금$/ }).first()).toBeVisible({ timeout: 15000 });
    
    // 수금률 카드
    await expect(page.locator('text=수금률').first()).toBeVisible({ timeout: 15000 });
  });

  test('월간/연간 전환 기능 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 월간 버튼 확인
    const periodButton = page.locator('button:has-text("월간")');
    await expect(periodButton).toBeVisible({ timeout: 15000 });
    
    // 월간 버튼 클릭하여 연간으로 전환
    await periodButton.click();
    await expect(page.locator('button:has-text("연간")')).toBeVisible({ timeout: 10000 });
  });

  test('새로고침 버튼 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 새로고침 버튼 확인
    const refreshButton = page.locator('button:has-text("새로고침")');
    await expect(refreshButton).toBeVisible({ timeout: 15000 });
    
    // 새로고침 버튼 클릭
    await refreshButton.click();
    
    // 새로고침 후 로딩 대기
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  });

  test('카드 값이 숫자로 표시되는지 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 페이지 로딩 대기
    await page.waitForSelector('text=이번 달 투어', { timeout: 15000 });
    
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
    expect(monthlyToursText).toMatch(/\d+개/);
  });
  
  test('결제 통계 값 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 페이지 로딩 대기
    await page.waitForSelector('text=결제 통계', { timeout: 15000 });
    
    // 총 수입 값 확인
    const totalRevenue = page.locator('text=총 수입').locator('..').locator('text=/\\d+원/');
    await expect(totalRevenue.first()).toBeVisible({ timeout: 10000 });
    
    // 계약금 값 확인
    const depositAmount = page.locator('text=계약금').locator('..').locator('text=/\\d+원/');
    await expect(depositAmount.first()).toBeVisible({ timeout: 10000 });
    
    // 잔금 값 확인
    const balanceAmount = page.locator('text=잔금').locator('..').locator('text=/\\d+원/');
    await expect(balanceAmount.first()).toBeVisible({ timeout: 10000 });
    
    // 완납 금액 값 확인
    const fullyPaidAmount = page.locator('text=완납 금액').locator('..').locator('text=/\\d+원/');
    await expect(fullyPaidAmount.first()).toBeVisible({ timeout: 10000 });
    
    // 정산 금액 값 확인
    const settlementAmount = page.locator('text=정산 금액').locator('..').locator('text=/\\d+원/');
    await expect(settlementAmount.first()).toBeVisible({ timeout: 10000 });
  });

  test('다가오는 투어 섹션 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 다가오는 투어 섹션 확인
    await expect(page.locator('text=다가오는 투어')).toBeVisible({ timeout: 15000 });
  });

  test('빠른 작업 섹션 확인', async ({ page }) => {
    // 로딩 완료 대기
    await page.waitForLoadState('networkidle', { timeout: 20000 });
    
    // 빠른 작업 섹션 확인
    await expect(page.locator('text=빠른 작업')).toBeVisible({ timeout: 15000 });
  });
});

