import { ChevronDown } from 'lucide-react';
import RouteTimeline from './RouteTimeline';
import { TRAFFIC_STYLE, getLaneLabel, getSubPathColor, withAlpha } from './trafficStyle';
import { resolveSubwayColor, cleanSubwayName } from '../../data/subwayLineColors';
import type { RoutePath, RouteSubPath } from '../../types/route';

interface Props {
  path: RoutePath;
  expanded: boolean;
  isFastest: boolean;
  destinationAreaCode: string;
  originLabel: string;
  destinationLabel: string;
  onToggle: () => void;
  onDestinationClick: (areaCode: string) => void;
}

// 구간별 소요시간 비율 바. 지하철 구간은 노선 공식색으로 표시되어
// "이 경로는 2호선 위주" 같은 직관적 파악이 가능하다.
const ProportionalBar = ({ subPaths }: { subPaths: RouteSubPath[] }) => (
  <div className="flex h-1 rounded-full overflow-hidden bg-slate-100 gap-px">
    {subPaths.map((sp, i) => (
      <div key={i} style={{ flex: sp.sectionTime, backgroundColor: getSubPathColor(sp) }} />
    ))}
  </div>
);

// 사용 노선 칩. 지하철은 공식 노선색 솔리드 배경 + 화이트 텍스트 (실제 사인 스타일).
// 버스는 라이트 톤 칩. 동일 구간을 잇는 노선이 여러 개면:
//   - BUS: " / "로 묶어 한 칩 (같은 파랑 톤이라 자연스러움)
//   - SUBWAY: lane별 칩 분리 → 각자의 공식 노선색 살림
const ModeChipRow = ({ subPaths }: { subPaths: RouteSubPath[] }) => {
  const transits = subPaths.filter((sp) => sp.trafficType !== 'WALK');
  if (transits.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {transits.flatMap((sp, i) => {
        const Icon = TRAFFIC_STYLE[sp.trafficType].Icon;

        if (sp.trafficType === 'SUBWAY') {
          return sp.lane.map((lane, j) => {
            const color = resolveSubwayColor(lane.name);
            return (
              <span
                key={`${i}-${j}`}
                style={{ backgroundColor: color }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold text-white"
              >
                <Icon className="size-3" strokeWidth={2.25} />
                {cleanSubwayName(lane.name) ?? '지하철'}
              </span>
            );
          });
        }

        const color = getSubPathColor(sp);
        const label = getLaneLabel(sp);
        return [
          <span
            key={i}
            style={{ backgroundColor: withAlpha(color, '1A'), color }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
          >
            <Icon className="size-3" strokeWidth={2} />
            {label}
          </span>,
        ];
      })}
    </div>
  );
};

const RoutePathCard = ({
  path,
  expanded,
  isFastest,
  destinationAreaCode,
  originLabel,
  destinationLabel,
  onToggle,
  onDestinationClick,
}: Props) => {
  const { info, subPaths } = path;
  const transferCount = info.busTransitCount + info.subwayTransitCount;

  return (
    <article
      className={`relative bg-white rounded-2xl transition-all duration-200 overflow-hidden ${
        expanded
          ? 'ring-1 ring-slate-900/10 shadow-[0_8px_30px_-12px_rgb(15,23,42,0.18)]'
          : isFastest
            ? 'ring-1 ring-blue-100 hover:ring-blue-200/80'
            : 'ring-1 ring-slate-100 hover:ring-slate-200'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="cursor-pointer w-full text-left p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {isFastest && (
              <p className="mb-1.5 text-[11px] font-semibold text-blue-600 tracking-tight">
                최단 경로
              </p>
            )}

            <div className="flex items-baseline gap-1.5">
              <span className="text-[32px] font-semibold tabular-nums leading-none tracking-tight text-slate-900">
                {info.totalTime}
              </span>
              <span className="text-sm font-medium text-slate-400">분</span>
            </div>

            <div className="mt-2 flex items-center gap-2.5 text-xs text-slate-500">
              <span className="tabular-nums">{info.payment.toLocaleString()}원</span>
              <span className="size-1 rounded-full bg-slate-200" />
              <span>
                환승 <span className="tabular-nums text-slate-700">{transferCount}</span>회
              </span>
            </div>
          </div>

          <ChevronDown
            strokeWidth={1.75}
            className={`size-5 text-slate-300 shrink-0 mt-1 transition-transform duration-200 ${
              expanded ? 'rotate-180 text-slate-500' : ''
            }`}
          />
        </div>

        <div className="mt-4">
          <ProportionalBar subPaths={subPaths} />
        </div>

        <div className="mt-3">
          <ModeChipRow subPaths={subPaths} />
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          <div className="h-px bg-slate-100 mb-3" />
          <RouteTimeline
            subPaths={subPaths}
            originLabel={originLabel}
            destinationLabel={destinationLabel}
            onDestinationClick={() => onDestinationClick(destinationAreaCode)}
          />
        </div>
      )}
    </article>
  );
};

export default RoutePathCard;
