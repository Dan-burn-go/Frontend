import { Footprints, Bus, Train } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { RouteSubPath, TrafficType } from '../../types/route';
import { resolveSubwayColor, cleanSubwayName } from '../../data/subwayLineColors';

interface Style {
  hex: string;
  Icon: LucideIcon;
  label: string;
}

// 도보=중성 회색, 버스=브랜드 청색 (logo blue-600), 지하철=호선별 공식색.
// hex로 통일해 inline style로 적용 — 호선 색상이 Tailwind 팔레트 밖이라 클래스로 표현 불가.
export const TRAFFIC_STYLE: Record<TrafficType, Style> = {
  WALK: { hex: '#64748B', Icon: Footprints, label: '도보' }, // slate-500
  BUS: { hex: '#2563EB', Icon: Bus, label: '버스' }, // blue-600
  SUBWAY: { hex: '#8B5CF6', Icon: Train, label: '지하철' }, // violet-500 (호선 매핑 실패 시)
};

// SUBWAY는 호선별 공식 색상 lookup, 그 외 모드는 type 기본색 반환
export const getSubPathColor = (subPath: RouteSubPath): string => {
  if (subPath.trafficType !== 'SUBWAY') return TRAFFIC_STYLE[subPath.trafficType].hex;
  return resolveSubwayColor(subPath.lane[0]?.name);
};

// hex + 8자리 alpha — bg-{color}-50 정도의 옅은 톤을 얻기 위한 헬퍼
export const withAlpha = (hex: string, alphaHex: string): string => `${hex}${alphaHex}`;

/**
 * 같은 구간을 운행하는 노선이 여러 개일 수 있음 (ODSAY가 `lane` 배열로 내려줌).
 * 예: 1101 / 1102 / 1103번 버스가 모두 같은 OD 구간 운행 → " / "로 묶어 표시.
 */
export const getLaneLabel = (subPath: RouteSubPath): string => {
  if (subPath.trafficType === 'WALK') return '도보';
  if (subPath.lane.length === 0) return TRAFFIC_STYLE[subPath.trafficType].label;
  if (subPath.trafficType === 'BUS') {
    const busNos = subPath.lane.map((l) => l.busNo).filter((n): n is string => Boolean(n));
    return busNos.length > 0 ? busNos.join(' / ') : '버스';
  }
  const names = subPath.lane
    .map((l) => cleanSubwayName(l.name))
    .filter((n): n is string => Boolean(n));
  return names.length > 0 ? names.join(' / ') : '지하철';
};
