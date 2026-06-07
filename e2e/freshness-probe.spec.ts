import { test } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

// 기본 30분. sanity check 시 DURATION_MS=120000 같이 짧게 override 가능.
const SCENARIO_DURATION_MS = process.env.DURATION_MS
  ? Number(process.env.DURATION_MS)
  : 30 * 60 * 1000;
const POLICY = process.env.POLICY ?? 'before';

interface FetchRecord {
  fetchedAt: number;
  populationTime: string;
  staleMs: number;
  count: number;
  populationTimeChanged: boolean;
  responseSize: number;
  levels: string[];
}

// 서울 API populationTime "YYYY-MM-DD HH:MM"은 KST(UTC+9).
// UTC epoch ms로 환산해 Date.now()와 비교 가능하게.
const parseKstTime = (s: string): number => {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/);
  if (!m) return NaN;
  const [, y, mo, d, h, mi] = m;
  return Date.UTC(+y, +mo - 1, +d, +h - 9, +mi);
};

test('freshness probe — visible-only 30min', async ({ page }) => {
  test.setTimeout(SCENARIO_DURATION_MS + 60_000);

  const fetches: FetchRecord[] = [];
  let prevPopulationTime: string | null = null;

  page.on('response', async (response) => {
    try {
      const url = new URL(response.url());
      // /api/congestion 정확히 일치하는 응답만 (분석/AI/단건 영역 제외)
      if (url.pathname !== '/api/congestion') return;
      // GET 200만 — OPTIONS preflight, 4xx/5xx, redirect 등 제외
      if (response.request().method() !== 'GET') return;
      if (response.status() !== 200) return;

      const fetchedAt = Date.now();
      const buffer = await response.body();
      const responseSize = buffer.length;
      // 빈 응답 가드 (204 같은 게 status 체크 통과해도 보호)
      if (responseSize === 0) return;
      const text = buffer.toString('utf-8').trim();
      if (!text.startsWith('{')) return;
      const body = JSON.parse(text);
      const data = body?.data;
      if (!Array.isArray(data) || data.length === 0) return;

      const first = data[0];
      const populationTime: string = first.populationTime;
      const staleMs = fetchedAt - parseKstTime(populationTime);
      const count = data.length;
      const populationTimeChanged = populationTime !== prevPopulationTime;
      const levels = data.map((d: { congestionLevel: string }) => d.congestionLevel);

      fetches.push({
        fetchedAt,
        populationTime,
        staleMs,
        count,
        populationTimeChanged,
        responseSize,
        levels,
      });

      prevPopulationTime = populationTime;
      const staleSec = (staleMs / 1000).toFixed(0);
      // eslint-disable-next-line no-console
      console.log(
        `[probe ${fetches.length}] pop=${populationTime} stale=${staleSec}s changed=${populationTimeChanged} count=${count} size=${responseSize}`,
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[probe] capture failed:', e);
    }
  });

  const startedAt = Date.now();
  // eslint-disable-next-line no-console
  console.log(`[probe] starting at ${new Date(startedAt).toISOString()}`);

  await page.goto('/');

  // useCongestionMarkers가 60초마다 polling. 그대로 30분 대기.
  await page.waitForTimeout(SCENARIO_DURATION_MS);

  const endedAt = Date.now();

  const result = {
    scenario: '60s fixed polling, visible-only 30min',
    policy: POLICY,
    startedAt,
    endedAt,
    durationMs: endedAt - startedAt,
    fetches,
  };

  const outDir = path.join(process.cwd(), 'e2e/results');
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${POLICY}.json`);
  await fs.writeFile(outPath, JSON.stringify(result, null, 2));

  // eslint-disable-next-line no-console
  console.log(`[probe] wrote ${fetches.length} records to ${outPath}`);
});
