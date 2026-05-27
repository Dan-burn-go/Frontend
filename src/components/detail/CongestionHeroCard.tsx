import { CATEGORY_NAMES } from '../../data/categories';
import { CONGESTION_LABELS } from '../../types/congestion';
import type { CongestionLevel } from '../../types/congestion';
import { getLocationImageUrl } from '../../data/locations';
import type { Location } from '../../data/locations';

interface Props {
  placeInfo: Location;
  congestionLevel: CongestionLevel;
  color: string;
  avgPeople: number;
  populationTime: string;
  congestionMessage: string;
}

const CongestionHeroCard = ({
  placeInfo,
  congestionLevel,
  color,
  avgPeople,
  populationTime,
  congestionMessage,
}: Props) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
    <div className="relative bg-slate-100">
      <img
        src={getLocationImageUrl(placeInfo.name)}
        alt={placeInfo.name}
        className="w-full h-56 object-cover"
        onError={(e) => {
          e.currentTarget.style.visibility = 'hidden';
        }}
      />
    </div>
    <div className="p-8 sm:p-10">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium tracking-[0.08em] text-slate-500 mb-3">
            #{CATEGORY_NAMES[placeInfo.category]}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-[-0.025em] leading-[1.05]">
            {placeInfo.name}
          </h1>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-extrabold tracking-[-0.02em]" style={{ color }}>
            {CONGESTION_LABELS[congestionLevel]}
          </p>
          <p className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Status
          </p>
        </div>
      </div>

      <div className="mt-8">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase mb-1.5">
          Current Visitors
        </p>
        <div className="flex items-baseline gap-1.5">
          <p className="text-5xl font-extrabold text-slate-900 tracking-[-0.04em] tabular-nums">
            {avgPeople.toLocaleString()}
          </p>
          <p className="text-lg font-light text-slate-400">명</p>
        </div>
        <p className="mt-2 text-xs text-slate-400 tabular-nums tracking-wide">
          {populationTime} 측정
        </p>
      </div>

      {congestionMessage && (
        <p className="mt-8 text-[15px] sm:text-base text-slate-700 leading-[1.75] max-w-prose">
          {congestionMessage}
        </p>
      )}
    </div>
  </div>
);

export default CongestionHeroCard;
