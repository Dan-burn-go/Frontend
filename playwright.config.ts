import { defineConfig } from '@playwright/test';

// freshness 측정 전용 설정.
// 별도 e2e 테스트가 추가되면 testMatch 등을 분리할 수 있음.
export default defineConfig({
  testDir: './e2e',
  timeout: 35 * 60 * 1000, // 30분 시나리오 + 버퍼
  fullyParallel: false,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
