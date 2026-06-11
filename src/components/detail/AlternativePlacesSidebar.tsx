import { useNavigate } from 'react-router-dom';
import { CaretRightIcon } from '@phosphor-icons/react';
import type { AlternativeLocationsState } from '../../hooks/useAlternativeLocations';
import { LOCATION_MAP } from '../../data/locations';
import { CATEGORY_NAMES } from '../../data/categories';
import { CONGESTION_COLORS, CONGESTION_LABELS, CONGESTION_LEVEL_MAP } from '../../types/congestion';
import type { AlternativeLocation } from '../../types/map';
import SectionHeader from './SectionHeader';

interface Props {
  state: AlternativeLocationsState;
}

const Header = () => (
  <div className="px-5 py-5 border-b border-slate-100">
    <SectionHeader title="Alternative Places" size="text-base" />
    <p className="text-xs text-slate-500 mt-0.5">Similar vibe, less crowded</p>
  </div>
);

const Item = ({
  loc,
  onClick,
}: {
  loc: AlternativeLocation;
  onClick: () => void;
}) => {
  const categoryKey = LOCATION_MAP.get(loc.areaCode)?.category;
  const categoryName = categoryKey ? CATEGORY_NAMES[categoryKey] : null;
  const level = CONGESTION_LEVEL_MAP[loc.congestionLevel];
  const badgeColor = level ? CONGESTION_COLORS[level] : '#9ca3af';
  const badgeLabel = level ? CONGESTION_LABELS[level] : loc.congestionLevel;

  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer group w-full text-left p-5 hover:bg-blue-50/40 transition-colors block"
    >
      <p className="text-base font-bold text-slate-900 tracking-tight truncate">
        {loc.locationName}
      </p>
      <div className="flex items-center gap-2 mt-2.5">
        {categoryName && (
          <span className="text-xs text-slate-500 bg-slate-100 rounded-md px-2 py-0.5">
            {categoryName}
          </span>
        )}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: badgeColor }}
          >
            {badgeLabel}
          </span>
          <CaretRightIcon
            weight="fill"
            size={13}
            className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </div>
    </button>
  );
};

const AlternativePlacesSidebar = ({ state }: Props) => {
  const navigate = useNavigate();

  return (
    <aside className="lg:w-72 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <Header />
        {state.status === 'loading' && (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2.5" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}
        {state.status === 'error' && (
          <div className="px-5 py-6 text-center text-slate-400 text-sm">
            대체 장소를 불러올 수 없어요.
          </div>
        )}
        {state.status === 'empty' && (
          <div className="px-5 py-6 text-center text-slate-400 text-sm">
            추천할 대체 장소가 없어요.
          </div>
        )}
        {state.status === 'success' && (
          <div className="divide-y divide-slate-100">
            {[...state.data]
              .sort((a, b) => a.priority - b.priority)
              .map((loc) => (
                <Item
                  key={loc.areaCode}
                  loc={loc}
                  onClick={() => navigate(`/place/${loc.areaCode}`)}
                />
              ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default AlternativePlacesSidebar;
