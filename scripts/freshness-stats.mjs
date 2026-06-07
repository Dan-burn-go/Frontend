#!/usr/bin/env node
// freshness 측정 결과 JSON에서 핵심 통계만 빠르게 뽑는 헬퍼.
// 가설 판정/의사결정은 사람(또는 AI 페어)이 하고, 이 스크립트는 raw 통계만 출력.
//
// 사용법:
//   node scripts/freshness-stats.mjs e2e/results/before.json
//   node scripts/freshness-stats.mjs e2e/results/after.json

import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/freshness-stats.mjs <path-to-result-json>');
  process.exit(1);
}

const raw = JSON.parse(readFileSync(file, 'utf-8'));
const fetches = raw.fetches ?? [];

if (fetches.length === 0) {
  console.error('No fetches in file');
  process.exit(1);
}

const stale = fetches.map((f) => f.staleMs).sort((a, b) => a - b);
const avg = stale.reduce((a, b) => a + b, 0) / stale.length;
const p50 = stale[Math.floor(stale.length * 0.5)];
const p95 = stale[Math.floor(stale.length * 0.95)];

const trueCount = fetches.filter((f) => f.populationTimeChanged).length;
const falseCount = fetches.length - trueCount;

const totalBytes = fetches.reduce((s, f) => s + f.responseSize, 0);
const duplicateBytes = fetches
  .filter((f) => !f.populationTimeChanged)
  .reduce((s, f) => s + f.responseSize, 0);

// populationTime 변경 시점에 레벨 분포가 바뀐 비율
const levelChanges = [];
let prevLevels = null;
for (const f of fetches) {
  if (!f.populationTimeChanged) continue;
  if (prevLevels) {
    const changed = f.levels.filter((l, i) => l !== prevLevels[i]).length;
    levelChanges.push(changed / f.levels.length);
  }
  prevLevels = f.levels;
}
const avgLevelChangeRatio =
  levelChanges.length > 0
    ? levelChanges.reduce((a, b) => a + b, 0) / levelChanges.length
    : null;

const min = (ms) => (ms / 60000).toFixed(2);
const pct = (x) => (x * 100).toFixed(1) + '%';
const kb = (b) => (b / 1024).toFixed(1) + ' KB';

console.log(`\n=== freshness stats: ${file} ===`);
console.log(`scenario:    ${raw.scenario}`);
console.log(`policy:      ${raw.policy}`);
console.log(`duration:    ${(raw.durationMs / 60000).toFixed(2)} min`);
console.log(`fetch count: ${fetches.length}`);
console.log();
console.log(`-- staleMs (분 단위) --`);
console.log(`  avg: ${min(avg)}  p50: ${min(p50)}  p95: ${min(p95)}`);
console.log();
console.log(`-- 중복 요청 --`);
console.log(`  populationTimeChanged true:  ${trueCount}`);
console.log(`  populationTimeChanged false: ${falseCount}  (${pct(falseCount / fetches.length)})`);
console.log();
console.log(`-- 트래픽 --`);
console.log(`  total:     ${kb(totalBytes)}`);
console.log(`  duplicate: ${kb(duplicateBytes)}  (${pct(duplicateBytes / totalBytes)})`);
console.log();
console.log(`-- 레벨 변경 (populationTime 갱신 시) --`);
if (avgLevelChangeRatio == null) {
  console.log(`  N/A (populationTime 변경 없음 또는 1회만)`);
} else {
  console.log(`  평균 변경 영역 비율: ${pct(avgLevelChangeRatio)}`);
}
console.log();
