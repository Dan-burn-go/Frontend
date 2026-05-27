import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { TRAFFIC_STYLE, getLaneLabel, getSubPathColor } from './trafficStyle';
import type { RouteSubPath } from '../../types/route';

const WALK_COLOR = '#CBD5E1'; // slate-300 — 가벼움/짧음
const ENDPOINT_COLOR = '#0F172A'; // slate-900 — 출발/도착 강조

interface StationRow {
  kind: 'station';
  name: string;
  color: string;
  topColor: string | null;
  bottomColor: string | null;
  topDashed: boolean;
  bottomDashed: boolean;
  tag?: '출발' | '도착';
  clickable?: boolean;
}

interface SegmentRow {
  kind: 'segment';
  color: string;
  dashed: boolean;
  content: ReactNode;
}

type Row = StationRow | SegmentRow;

const formatLabel = (subPath: RouteSubPath): string => {
  const label = getLaneLabel(subPath);
  if (subPath.trafficType === 'BUS') return `${label}번`;
  return label;
};

const buildMeta = (subPath: RouteSubPath): string | null => {
  const parts: string[] = [];
  if (subPath.intervalTime != null) parts.push(`${subPath.intervalTime}분 간격`);
  if (subPath.way) parts.push(`${subPath.way} 방향`);
  return parts.length > 0 ? parts.join(' · ') : null;
};

/**
 * 출발→도착 전체 여정을 (역 dot) + (구간 bar)로 시각화.
 * 도보=점선 회색 / 대중교통=노선 공식색 솔리드.
 * 두 인접 transit 사이 walking transfer는 중간 점이 두 번 찍혀 환승 인지가 자연스럽다.
 */
const RouteTimeline = ({
  subPaths,
  originLabel,
  destinationLabel,
  onDestinationClick,
}: {
  subPaths: RouteSubPath[];
  originLabel: string;
  destinationLabel: string;
  onDestinationClick: () => void;
}) => {
  const rows = useMemo<Row[]>(() => {
    const list: Row[] = [];

    list.push({
      kind: 'station',
      name: originLabel,
      color: ENDPOINT_COLOR,
      topColor: null,
      bottomColor: null,
      topDashed: false,
      bottomDashed: false,
      tag: '출발',
    });

    for (const sp of subPaths) {
      if (sp.trafficType === 'WALK') {
        list.push({
          kind: 'segment',
          color: WALK_COLOR,
          dashed: true,
          content: (
            <div className="py-2 flex items-baseline gap-2">
              <span className="text-[13px] font-medium text-slate-500">도보</span>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {sp.sectionTime}분
              </span>
            </div>
          ),
        });
        continue;
      }

      const color = getSubPathColor(sp);
      const stations = sp.stations ?? [];
      const board = stations[0];
      const alight = stations.length > 1 ? stations[stations.length - 1] : null;
      const Icon = TRAFFIC_STYLE[sp.trafficType].Icon;
      const label = formatLabel(sp);
      const meta = buildMeta(sp);

      if (board) {
        list.push({
          kind: 'station',
          name: board,
          color,
          topColor: null,
          bottomColor: null,
          topDashed: false,
          bottomDashed: false,
        });
      }

      list.push({
        kind: 'segment',
        color,
        dashed: false,
        content: (
          <div className="py-2.5 pl-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Icon className="size-3.5 shrink-0" style={{ color }} strokeWidth={2.25} />
              <span className="text-[13.5px] font-semibold" style={{ color }}>
                {label}
              </span>
              <span className="text-xs text-slate-400 tabular-nums shrink-0">
                {sp.sectionTime}분
              </span>
            </div>
            {meta && <p className="mt-1 pl-[20px] text-xs text-slate-400">{meta}</p>}
          </div>
        ),
      });

      if (alight) {
        list.push({
          kind: 'station',
          name: alight,
          color,
          topColor: null,
          bottomColor: null,
          topDashed: false,
          bottomDashed: false,
        });
      }
    }

    list.push({
      kind: 'station',
      name: destinationLabel,
      color: ENDPOINT_COLOR,
      topColor: null,
      bottomColor: null,
      topDashed: false,
      bottomDashed: false,
      tag: '도착',
      clickable: true,
    });

    // 인접 segment 색/스타일로 station의 위·아래 stub bar를 채워 시각 연속성 확보
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      if (row.kind !== 'station') continue;
      const above = list[i - 1];
      const below = list[i + 1];
      if (above?.kind === 'segment') {
        row.topColor = above.color;
        row.topDashed = above.dashed;
      }
      if (below?.kind === 'segment') {
        row.bottomColor = below.color;
        row.bottomDashed = below.dashed;
      }
    }

    return list;
  }, [subPaths, originLabel, destinationLabel]);

  return (
    <ol className="grid grid-cols-[20px_1fr] gap-x-4">
      {rows.map((row, i) => (
        // display: contents — li 시맨틱은 유지하면서 grid 레이아웃엔 영향 없게
        <li key={i} className="contents">
          {row.kind === 'station' ? (
            <StationRow row={row} onClick={row.clickable ? onDestinationClick : undefined} />
          ) : (
            <SegmentRowView color={row.color} dashed={row.dashed}>
              {row.content}
            </SegmentRowView>
          )}
        </li>
      ))}
    </ol>
  );
};

const Stub = ({ color, dashed }: { color: string | null; dashed: boolean }) => {
  if (!color) return <div className="flex-1" />;
  if (dashed) {
    return (
      <div
        className="flex-1 border-l-[2px] border-dashed"
        style={{ borderColor: color }}
      />
    );
  }
  return (
    <div className="flex-1 w-[3px] rounded-full" style={{ backgroundColor: color }} />
  );
};

const StationRow = ({ row, onClick }: { row: StationRow; onClick?: () => void }) => (
  <>
    <div className="self-stretch flex flex-col items-center min-h-[30px]">
      <Stub color={row.topColor} dashed={row.topDashed} />
      <div
        className="size-2.5 rounded-full shrink-0 my-0.5 ring-[3px] ring-white"
        style={{ backgroundColor: row.color }}
      />
      <Stub color={row.bottomColor} dashed={row.bottomDashed} />
    </div>
    <div className="min-w-0 py-1.5 flex items-baseline gap-2 min-h-[30px]">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="cursor-pointer text-[15px] font-semibold text-slate-900 hover:text-blue-600 hover:underline underline-offset-2 truncate"
        >
          {row.name}
        </button>
      ) : (
        <span className="text-[15px] font-semibold text-slate-900 truncate">{row.name}</span>
      )}
      {row.tag && (
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 shrink-0">
          {row.tag}
        </span>
      )}
    </div>
  </>
);

const SegmentRowView = ({
  color,
  dashed,
  children,
}: {
  color: string;
  dashed: boolean;
  children: ReactNode;
}) => (
  <>
    <div className="self-stretch flex justify-center">
      {dashed ? (
        <div
          className="border-l-[2px] border-dashed h-full"
          style={{ borderColor: color }}
        />
      ) : (
        <div className="w-[3px] h-full rounded-full" style={{ backgroundColor: color }} />
      )}
    </div>
    <div className="min-w-0">{children}</div>
  </>
);

export default RouteTimeline;
