#!/usr/bin/env node
// Before/After 측정 결과를 stale time 시계열 SVG로 시각화.
// 한 차트에 두 정책을 겹쳐 latency 손실 없이 자원만 절감했음을 직관적으로 보여준다.
//
// 사용법:
//   node scripts/freshness-chart.mjs
//     → e2e/results/before.json + after.json 읽어 e2e/results/stale-comparison.svg 생성
//   node scripts/freshness-chart.mjs <before> <after> <output>
//     → 경로 지정

import { readFileSync, writeFileSync } from 'node:fs';

const beforePath = process.argv[2] ?? 'e2e/results/before.json';
const afterPath = process.argv[3] ?? 'e2e/results/after.json';
const outputPath = process.argv[4] ?? 'e2e/results/stale-comparison.svg';

const before = JSON.parse(readFileSync(beforePath, 'utf-8'));
const after = JSON.parse(readFileSync(afterPath, 'utf-8'));

// fetch 데이터를 (시작 시각부터 경과한 분, stale 분)으로 변환.
const toPoints = (raw) =>
  raw.fetches.map((f) => ({
    elapsedMin: (f.fetchedAt - raw.startedAt) / 60_000,
    staleMin: f.staleMs / 60_000,
  }));

const beforePts = toPoints(before);
const afterPts = toPoints(after);

// ── 좌표계 ────────────────────────────────────────
const VIEW_W = 860;
const VIEW_H = 460;
const PAD_L = 70;
const PAD_R = 30;
const PAD_T = 60;
const PAD_B = 70;
const PLOT_W = VIEW_W - PAD_L - PAD_R;
const PLOT_H = VIEW_H - PAD_T - PAD_B;

const X_MAX = 32; // 30분 시나리오 + 약간 여유
const Y_MAX = 36; // 최대 stale ~34분 + 여유

const xToSvg = (x) => PAD_L + (x / X_MAX) * PLOT_W;
const yToSvg = (y) => PAD_T + PLOT_H - (y / Y_MAX) * PLOT_H;

// ── 색상 ─────────────────────────────────────────
const COLOR_BEFORE = '#dc2626'; // red-600
const COLOR_AFTER = '#16a34a'; // green-600
const COLOR_BASELINE = '#9ca3af'; // gray-400
const COLOR_AXIS = '#374151'; // gray-700
const COLOR_GRID = '#e5e7eb'; // gray-200

// ── 빌더 ─────────────────────────────────────────
const polyline = (pts, color) => {
  const points = pts.map((p) => `${xToSvg(p.elapsedMin).toFixed(1)},${yToSvg(p.staleMin).toFixed(1)}`).join(' ');
  return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
};

const dots = (pts, color) =>
  pts
    .map(
      (p) =>
        `<circle cx="${xToSvg(p.elapsedMin).toFixed(1)}" cy="${yToSvg(p.staleMin).toFixed(1)}" r="3.5" fill="${color}"/>`,
    )
    .join('');

// X 격자선 + 라벨 (5분 단위)
const xTicks = [0, 5, 10, 15, 20, 25, 30]
  .map((x) => {
    const sx = xToSvg(x).toFixed(1);
    return `
    <line x1="${sx}" y1="${PAD_T}" x2="${sx}" y2="${PAD_T + PLOT_H}" stroke="${COLOR_GRID}" stroke-width="1"/>
    <line x1="${sx}" y1="${PAD_T + PLOT_H}" x2="${sx}" y2="${PAD_T + PLOT_H + 5}" stroke="${COLOR_AXIS}" stroke-width="1"/>
    <text x="${sx}" y="${PAD_T + PLOT_H + 20}" text-anchor="middle" font-size="12" fill="${COLOR_AXIS}">${x}</text>`;
  })
  .join('');

// Y 격자선 + 라벨 (5분 단위)
const yTicks = [0, 5, 10, 15, 20, 25, 30, 35]
  .map((y) => {
    const sy = yToSvg(y).toFixed(1);
    return `
    <line x1="${PAD_L}" y1="${sy}" x2="${PAD_L + PLOT_W}" y2="${sy}" stroke="${COLOR_GRID}" stroke-width="1"/>
    <line x1="${PAD_L - 5}" y1="${sy}" x2="${PAD_L}" y2="${sy}" stroke="${COLOR_AXIS}" stroke-width="1"/>
    <text x="${PAD_L - 10}" y="${(parseFloat(sy) + 4).toFixed(1)}" text-anchor="end" font-size="12" fill="${COLOR_AXIS}">${y}</text>`;
  })
  .join('');

// 도메인 baseline 15분 점선
const baselineY = yToSvg(15).toFixed(1);
const baseline = `
  <line x1="${PAD_L}" y1="${baselineY}" x2="${PAD_L + PLOT_W}" y2="${baselineY}"
        stroke="${COLOR_BASELINE}" stroke-dasharray="6 4" stroke-width="1.5"/>
  <text x="${PAD_L + PLOT_W - 6}" y="${(parseFloat(baselineY) - 6).toFixed(1)}" text-anchor="end" font-size="11" fill="${COLOR_BASELINE}">
    domain baseline (15min, 서울 API 게시 지연)
  </text>`;

// 축
const axes = `
  <line x1="${PAD_L}" y1="${PAD_T + PLOT_H}" x2="${PAD_L + PLOT_W}" y2="${PAD_T + PLOT_H}" stroke="${COLOR_AXIS}" stroke-width="1.5"/>
  <line x1="${PAD_L}" y1="${PAD_T}" x2="${PAD_L}" y2="${PAD_T + PLOT_H}" stroke="${COLOR_AXIS}" stroke-width="1.5"/>`;

// 제목 / 축 라벨
const title = `<text x="${VIEW_W / 2}" y="28" text-anchor="middle" font-size="17" font-weight="600" fill="#111827">
  Stale Time over Measurement Duration — Before vs After
</text>`;
const subtitle = `<text x="${VIEW_W / 2}" y="46" text-anchor="middle" font-size="11" fill="#6b7280">
  60s fixed polling (n=${beforePts.length}) vs adaptive polling (n=${afterPts.length}) · 30min visible-only
</text>`;
const xLabel = `<text x="${VIEW_W / 2}" y="${VIEW_H - 18}" text-anchor="middle" font-size="13" fill="${COLOR_AXIS}">
  Elapsed (min)
</text>`;
const yLabel = `<text x="22" y="${VIEW_H / 2}" text-anchor="middle" font-size="13" fill="${COLOR_AXIS}" transform="rotate(-90 22 ${VIEW_H / 2})">
  Stale Time (min)
</text>`;

// 범례 (좌측 중앙 — 데이터가 없는 stale 18~24분 영역)
const legendX = PAD_L + 16;
const legendY = yToSvg(22);
const legend = `
  <rect x="${legendX - 8}" y="${legendY - 14}" width="220" height="62" rx="4" fill="white" fill-opacity="0.95" stroke="${COLOR_GRID}" stroke-width="1"/>
  <line x1="${legendX}" y1="${legendY}" x2="${legendX + 24}" y2="${legendY}" stroke="${COLOR_BEFORE}" stroke-width="2.2"/>
  <circle cx="${legendX + 12}" cy="${legendY}" r="3.5" fill="${COLOR_BEFORE}"/>
  <text x="${legendX + 30}" y="${legendY + 4}" font-size="12" fill="#111827">Before — 60s fixed polling</text>
  <line x1="${legendX}" y1="${legendY + 20}" x2="${legendX + 24}" y2="${legendY + 20}" stroke="${COLOR_AFTER}" stroke-width="2.2"/>
  <circle cx="${legendX + 12}" cy="${legendY + 20}" r="3.5" fill="${COLOR_AFTER}"/>
  <text x="${legendX + 30}" y="${legendY + 24}" font-size="12" fill="#111827">After — adaptive polling</text>
  <line x1="${legendX}" y1="${legendY + 40}" x2="${legendX + 24}" y2="${legendY + 40}" stroke="${COLOR_BASELINE}" stroke-dasharray="6 4" stroke-width="1.5"/>
  <text x="${legendX + 30}" y="${legendY + 44}" font-size="12" fill="#111827">Domain baseline (15min)</text>`;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
  <rect width="${VIEW_W}" height="${VIEW_H}" fill="white"/>
  ${title}
  ${subtitle}
  ${xTicks}
  ${yTicks}
  ${baseline}
  ${axes}
  ${polyline(beforePts, COLOR_BEFORE)}
  ${dots(beforePts, COLOR_BEFORE)}
  ${polyline(afterPts, COLOR_AFTER)}
  ${dots(afterPts, COLOR_AFTER)}
  ${xLabel}
  ${yLabel}
  ${legend}
</svg>`;

writeFileSync(outputPath, svg);
console.log(`Wrote SVG to ${outputPath}`);
console.log(`  Before fetches: ${beforePts.length}`);
console.log(`  After fetches:  ${afterPts.length}`);
