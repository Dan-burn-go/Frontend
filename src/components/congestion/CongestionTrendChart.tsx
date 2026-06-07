import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  CONGESTION_LEVEL_MAP,
  CONGESTION_COLORS,
  CONGESTION_COLOR_UNKNOWN,
} from '../../types/congestion';
import type {
  CongestionTrendKind,
  CongestionTrendPoint,
} from '../../types/congestion';

interface Props {
  data: CongestionTrendPoint[];
  kind: CongestionTrendKind;
  highlightKey?: number | null;
}

// 백엔드는 일요일=1, 토요일=7로 응답하는데 한국 사용자에게 자연스러운 월부터 일 순서로 정렬.
// 평일이 왼쪽, 주말이 오른쪽 끝에 모여 "주말이 붐비는지" 같은 패턴을 한눈에 보이게 한다.
const DAY_ORDER: Record<number, number> = {
  2: 0, // 월
  3: 1, // 화
  4: 2, // 수
  5: 3, // 목
  6: 4, // 금
  7: 5, // 토
  1: 6, // 일
};

const getColor = (congestionLevel: string): string => {
  const mapped = CONGESTION_LEVEL_MAP[congestionLevel];
  return mapped ? CONGESTION_COLORS[mapped] : CONGESTION_COLOR_UNKNOWN;
};

interface TooltipPayloadItem {
  payload: CongestionTrendPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <div className="font-semibold text-gray-900 mb-1">{point.label}</div>
      <div className="text-gray-700 flex items-center gap-1.5">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: getColor(point.congestionLevel) }}
          aria-hidden
        />
        {point.congestionLevel}
      </div>
      <div className="text-gray-500 text-xs mt-0.5">
        평균 {Math.round(point.avgMinPeople)} ~ {Math.round(point.avgMaxPeople)}명
      </div>
    </div>
  );
};

// Recharts 3.x에서 Cell이 deprecated되어 v4에서 제거 예정. 공식 권장 패턴인 shape
// prop으로 막대마다 색상·불투명도·둥근 모서리를 직접 그려 v4 호환을 확보한다.
const renderBarShape =
  (highlightKey: number | null) =>
  (props: unknown) => {
    const p = props as {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      payload?: CongestionTrendPoint;
    };
    if (
      p.x === undefined ||
      p.y === undefined ||
      p.width === undefined ||
      p.height === undefined ||
      !p.payload
    ) {
      return <g />;
    }
    const fill = getColor(p.payload.congestionLevel);
    const fillOpacity =
      highlightKey === null ? 1 : p.payload.key === highlightKey ? 1 : 0.5;
    // 위쪽 모서리만 둥글게(radius 4). height가 작은 경우 모서리 반경 보정.
    const r = Math.max(0, Math.min(4, p.height, p.width / 2));
    const path = `M ${p.x},${p.y + r} Q ${p.x},${p.y} ${p.x + r},${p.y} L ${p.x + p.width - r},${p.y} Q ${p.x + p.width},${p.y} ${p.x + p.width},${p.y + r} L ${p.x + p.width},${p.y + p.height} L ${p.x},${p.y + p.height} Z`;
    return <path d={path} fill={fill} fillOpacity={fillOpacity} />;
  };

// 현재 시각/요일 막대 위에 "지금" 라벨과 작은 dot을 띄워 검은 stroke 없이 강조.
// recharts label content로 막대마다 호출되며, 데이터 포인트의 key와 일치할 때만 렌더.
// (Bar의 dataKey 값인 avgMaxPeople이 아니라 payload.key를 비교해야 정확)
const renderNowMarker = (highlightKey: number | null) => (props: unknown) => {
  if (highlightKey === null) return null;
  const p = props as {
    x?: number | string;
    y?: number | string;
    width?: number | string;
    payload?: { key?: number };
  };
  if (
    p.payload?.key === undefined ||
    p.payload.key !== highlightKey ||
    p.x === undefined ||
    p.y === undefined ||
    p.width === undefined
  ) {
    return null;
  }
  const numX = Number(p.x);
  const numY = Number(p.y);
  const numWidth = Number(p.width);
  const cx = numX + numWidth / 2;
  return (
    <g>
      <text
        x={cx}
        y={numY - 18}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="#1f2937"
      >
        지금
      </text>
      <circle cx={cx} cy={numY - 8} r={3} fill="#1f2937" />
    </g>
  );
};

const CongestionTrendChart = ({ data, kind, highlightKey = null }: Props) => {
  const orderedData = useMemo(() => {
    if (kind !== 'daily') return data;
    return [...data].sort((a, b) => {
      const orderA = DAY_ORDER[a.key] ?? Infinity;
      const orderB = DAY_ORDER[b.key] ?? Infinity;
      return orderA - orderB;
    });
  }, [data, kind]);


  return (
    <div
      className="w-full h-64"
      role="img"
      aria-label={
        kind === 'hourly'
          ? '시간대별 평균 혼잡도 막대 차트'
          : '요일별 평균 혼잡도 막대 차트'
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={orderedData} margin={{ top: 28, right: 12, left: 0, bottom: 8 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar
            dataKey="avgMaxPeople"
            shape={renderBarShape(highlightKey)}
            label={renderNowMarker(highlightKey)}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CongestionTrendChart;
