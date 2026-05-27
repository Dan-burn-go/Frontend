import { useState } from 'react';
import { LOCATION_MAP, getLocationImageUrl } from '../../data/locations';
import { CATEGORY_NAMES } from '../../data/categories';
import {
  CONGESTION_LEVEL_MAP,
  CONGESTION_COLORS,
  CONGESTION_LABELS,
} from '../../types/congestion';
import { useDestinationCongestion } from '../../hooks/useDestinationCongestion';

interface Props {
  areaCode: string;
}

/**
 * 도착지로 선택된 핫스팟의 현재 혼잡도를 보여주는 헤더 카드.
 * 일반 길찾기 앱과 다른 본 서비스의 차별점(혼잡도 데이터 연계)을 결과 위에 노출한다.
 */
const DestinationPreviewCard = ({ areaCode }: Props) => {
  const [imageOk, setImageOk] = useState(true);
  const location = LOCATION_MAP.get(areaCode);
  const state = useDestinationCongestion(areaCode);

  if (!location) return null;

  const data = state.status === 'success' ? state.data : null;
  const level = data ? CONGESTION_LEVEL_MAP[data.congestionLevel] : null;
  const color = level ? CONGESTION_COLORS[level] : null;
  const label = level ? CONGESTION_LABELS[level] : null;
  const avgPeople = data
    ? Math.round((data.minPeopleCount + data.maxPeopleCount) / 2)
    : null;

  return (
    <div className="bg-white rounded-2xl ring-1 ring-slate-100 overflow-hidden">
      <div className="flex items-stretch">
        {imageOk && (
          <div className="w-24 sm:w-28 shrink-0 bg-slate-100">
            <img
              src={getLocationImageUrl(location.name)}
              alt={location.name}
              className="w-full h-full object-cover"
              onError={() => setImageOk(false)}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
          <p className="text-xs text-slate-400 font-medium">
            도착지 · {CATEGORY_NAMES[location.category]}
          </p>
          <h3 className="mt-0.5 text-lg font-semibold text-slate-900 tracking-tight truncate">
            {location.name}
          </h3>

          <div className="mt-2.5 min-h-[24px] flex items-center gap-2.5">
            {state.status === 'loading' && (
              <span className="inline-block w-20 h-5 rounded-md bg-slate-100 animate-pulse" />
            )}
            {level && color && label && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                <span className="size-1.5 rounded-full bg-white/90" />
                {label}
              </span>
            )}
            {avgPeople !== null && (
              <span className="text-xs text-slate-500 tabular-nums">
                현재 {avgPeople.toLocaleString()}명
              </span>
            )}
            {state.status === 'error' && (
              <span className="text-xs text-slate-400">혼잡도 정보 없음</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationPreviewCard;
