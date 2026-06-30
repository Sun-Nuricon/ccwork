import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 설정.
 * - 테스트는 `e2e/` 디렉터리의 `*.spec.ts`만 대상으로 한다 (Vitest와 분리).
 * - webServer로 `npm run dev`(Vite 5173 + json-server 3001)를 자동 기동한다.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // 전용 포트(5174)로 Vite + json-server 를 띄운다.
    // 5173에 다른 앱이 떠 있어도 영향을 받지 않도록 항상 자체 서버를 기동한다.
    command: 'npm run dev:e2e',
    url: 'http://localhost:5174',
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});
