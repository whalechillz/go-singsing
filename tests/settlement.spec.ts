import { test, expect } from '@playwright/test';

test.describe('정산 관리 테스트', () => {
  test.beforeEach(async ({ page, context }) => {
    await page.goto('https://go.singsinggolf.kr/admin', { waitUntil: 'networkidle' });

    if (page.url().includes('/login')) {
      const email = 'taksoo.kim@gmail.com';
      const password = '112077';

      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button:has-text("로그인")');

      await page.waitForURL('**/admin**', { timeout: 15000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      await context.storageState({ path: 'playwright/.auth/admin.json' });
    }

    await page.waitForLoadState('networkidle', { timeout: 15000 });
  });

  test('정산 관리 페이지 접근', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin/settlements', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // 페이지 제목 확인
    await expect(page.locator('h1:has-text("정산 관리")')).toBeVisible({ timeout: 10000 });
  });

  test('투어 선택 드롭다운 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin/settlements', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // 투어 선택 드롭다운 확인
    const tourSelect = page.locator('select').first();
    await expect(tourSelect).toBeVisible({ timeout: 10000 });
    await expect(tourSelect.locator('option:has-text("투어 선택하여 정산 입력...")')).toBeVisible({ timeout: 5000 });
  });

  test('정산 목록 표시 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin/settlements', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // 정산 목록 테이블 확인
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });

    // 테이블 헤더 확인
    await expect(page.locator('th:has-text("투어명")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('th:has-text("정산 금액")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('th:has-text("마진")').first()).toBeVisible({ timeout: 5000 });
  });

  test('정산 통계 카드 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin/settlements', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // 통계 카드 확인
    await expect(page.locator('text=계약 매출')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=정산 금액')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=총 원가')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=총 마진')).toBeVisible({ timeout: 5000 });
  });

  test('필터 기능 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin/settlements', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // 필터 버튼 확인
    await expect(page.locator('button:has-text("전체")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("대기")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("완료")')).toBeVisible({ timeout: 5000 });

    // 필터 클릭 테스트
    await page.click('button:has-text("대기")');
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  });

  test('검색 기능 확인', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin/settlements', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // 검색 입력창 확인
    const searchInput = page.locator('input[placeholder*="투어명으로 검색"]');
    await expect(searchInput).toBeVisible({ timeout: 10000 });

    // 검색 테스트
    await searchInput.fill('순천');
    await page.waitForTimeout(1000);
  });

  test('정산 상세 페이지 접근', async ({ page }) => {
    await page.goto('https://go.singsinggolf.kr/admin/settlements', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // 정산 목록에서 첫 번째 항목의 "상세보기" 링크 클릭
    const detailLink = page.locator('a:has-text("상세보기")').first();
    
    if (await detailLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await detailLink.click();
      await page.waitForURL('**/settlement', { timeout: 15000 });
      await page.waitForLoadState('networkidle', { timeout: 15000 });

      // 정산 상세 페이지 확인
      await expect(page.locator('h1, h2, h3').filter({ hasText: /정산|원가/ })).toBeVisible({ timeout: 10000 });
    } else {
      console.log('정산 데이터가 없어 상세보기 링크를 찾을 수 없습니다.');
    }
  });

  test('투어별 정산 페이지 접근', async ({ page }) => {
    // 정해철님 투어 정산 페이지 접근
    const tourId = 'e5878cd2-bce7-495d-a428-c2b4e506fcc7';
    await page.goto(`https://go.singsinggolf.kr/admin/tours/${tourId}/settlement`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // 정산 요약 카드 확인
    await expect(page.locator('text=계약 매출')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=정산 금액')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=총 원가')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=마진')).toBeVisible({ timeout: 5000 });

    // 탭 확인
    await expect(page.locator('button:has-text("원가 입력")')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("정산 상세")')).toBeVisible({ timeout: 5000 });
  });

  test('정산서 PDF 다운로드 버튼 확인', async ({ page }) => {
    const tourId = 'e5878cd2-bce7-495d-a428-c2b4e506fcc7';
    await page.goto(`https://go.singsinggolf.kr/admin/tours/${tourId}/settlement`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // 정산 상세 탭 클릭
    await page.click('button:has-text("정산 상세")');
    await page.waitForTimeout(1000);

    // PDF 다운로드 버튼 확인
    const pdfButton = page.locator('button:has-text("정산서 PDF 다운로드")');
    await expect(pdfButton).toBeVisible({ timeout: 10000 });
  });

  test('정산 계산 차이 확인 - 유인수 투어', async ({ page }) => {
    // 유인수님 투어 정산 페이지 접근
    const tourId = '42ec1758-08da-4372-a55c-efc57e9dd351';
    const consoleMessages: string[] = [];
    
    // 콘솔 메시지 수집
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('정산 계산 디버깅') || text.includes('원가 계산 디버깅')) {
        consoleMessages.push(text);
      }
    });

    await page.goto(`https://go.singsinggolf.kr/admin/tours/${tourId}/settlement`, { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle', { timeout: 20000 });

    // 정산 요약 카드 확인
    await expect(page.locator('text=계약 매출')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=정산 금액')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=총 원가')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=마진')).toBeVisible({ timeout: 5000 });

    // 계산된 마진 값 확인
    const marginText = await page.locator('text=마진').locator('..').locator('text=/\\d+원/').first().textContent();
    console.log('계산된 마진:', marginText);

    // 예상 마진과 차이 확인 (확인 필요 알림이 있는 경우)
    const hasDiscrepancy = await page.locator('text=계산된 마진과 예상 마진이 다릅니다').isVisible({ timeout: 5000 }).catch(() => false);
    
    if (hasDiscrepancy) {
      // 계산된 마진 값 추출
      const calculatedMarginText = await page.locator('text=계산된 마진:').locator('..').locator('text=/\\d+원/').first().textContent();
      const expectedMarginText = await page.locator('text=예상 마진:').locator('..').locator('text=/\\d+원/').first().textContent();
      const discrepancyText = await page.locator('text=차이:').locator('..').locator('text=/[-]?\\d+원/').first().textContent();
      
      console.log('=== 정산 계산 차이 확인 ===');
      console.log('계산된 마진:', calculatedMarginText);
      console.log('예상 마진:', expectedMarginText);
      console.log('차이:', discrepancyText);
      
      // 콘솔 로그 확인
      await page.waitForTimeout(2000); // 콘솔 로그 수집 대기
      
      console.log('\n=== 콘솔 디버깅 로그 ===');
      consoleMessages.forEach(msg => console.log(msg));
    }

    // 원가 입력 탭으로 이동하여 원가 정보 확인
    await page.click('button:has-text("원가 입력")');
    await page.waitForTimeout(1000);

    // 원가 저장 버튼 클릭하여 계산 로그 확인
    const saveButton = page.locator('button:has-text("저장")');
    if (await saveButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveButton.click();
      await page.waitForTimeout(2000); // 계산 로그 수집 대기
    }

    // 콘솔 로그 출력
    console.log('\n=== 최종 콘솔 디버깅 로그 ===');
    consoleMessages.forEach(msg => console.log(msg));
  });
});

