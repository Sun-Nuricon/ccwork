import { test, expect } from '@playwright/test';

/**
 * 스모크 테스트 — Playwright E2E 환경이 제대로 구성됐는지만 확인한다.
 * (Vite + json-server 가 webServer로 자동 기동된 상태에서 실행)
 */
test('앱 첫 화면이 렌더된다', async ({ page }) => {
  await page.goto('/');

  // 헤더 타이틀과 "새 노트" 버튼이 보인다.
  await expect(page.getByRole('heading', { name: /Notes/ })).toBeVisible();
  await expect(page.getByRole('button', { name: '+ 새 노트' })).toBeVisible();
});
