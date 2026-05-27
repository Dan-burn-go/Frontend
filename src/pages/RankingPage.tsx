import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CaretLeftIcon } from '@phosphor-icons/react';
import Header from '../components/layout/Header';
import { useRanking } from '../hooks/useRanking';
import { useOneShotPulse } from '../hooks/useOneShotPulse';
import { LOCATION_MAP } from '../data/locations';
import { CATEGORY_NAMES } from '../data/categories';
import { CONGESTION_LEVEL_MAP, CONGESTION_COLORS, CONGESTION_LABELS } from '../types/congestion';
import type { RankingEntry } from '../types/congestion';
import { extractPopulationHourMinute } from '../utils/date';

interface RankingItemProps {
  entry: RankingEntry;
  onClick: () => void;
  focusNonce?: number | null;
}

const RankingItem = ({ entry, onClick, focusNonce }: RankingItemProps) => {
  const level = CONGESTION_LEVEL_MAP[entry.congestionLevel];
  const color = level ? CONGESTION_COLORS[level] : '#9ca3af';
  const label = level ? CONGESTION_LABELS[level] : entry.congestionLevel;
  const location = LOCATION_MAP.get(entry.areaCode);
  const categoryName = location ? CATEGORY_NAMES[location.category] : null;
  const avgPeople = Math.round((entry.minPeopleCount + entry.maxPeopleCount) / 2);

  const itemRef = useRef<HTMLButtonElement>(null);
  const { active: shouldHighlight, onAnimationEnd: handleHighlightEnd } =
    useOneShotPulse(focusNonce);

  useEffect(() => {
    if (focusNonce != null) {
      itemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusNonce]);

  return (
    <button
      ref={itemRef}
      type="button"
      onClick={onClick}
      onAnimationEnd={handleHighlightEnd}
      className={`w-full text-left cursor-pointer px-7 py-5 flex items-baseline gap-6 hover:bg-slate-50/70 transition-colors ${
        shouldHighlight ? 'ranking-highlight' : ''
      }`}
    >
      <span
        className={`text-4xl font-extrabold tabular-nums tracking-tight w-12 shrink-0 leading-none ${
          entry.rank === 1
            ? 'text-amber-500'
            : entry.rank === 2
              ? 'text-slate-500'
              : entry.rank === 3
                ? 'text-amber-700'
                : 'text-slate-300'
        }`}
      >
        {String(entry.rank).padStart(2, '0')}
      </span>

      <div className="flex-1 min-w-0 self-center">
        <p className="text-lg font-bold text-slate-900 tracking-tight truncate">
          {entry.areaName}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          {categoryName && <span>{categoryName}</span>}
          {categoryName && <span className="mx-1.5 text-slate-300">·</span>}
          <span className="tabular-nums">{avgPeople.toLocaleString()}명</span>
        </p>
      </div>

      <span
        className="self-center text-xs font-semibold px-3 py-1.5 rounded-full text-white shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 4px 14px ${color}40` }}
      >
        {label}
      </span>
    </button>
  );
};

const RankingPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab: 'busiest' | 'relaxed' = tabParam === 'relaxed' ? 'relaxed' : 'busiest';

  const { entries, loading, error } = useRanking(tab);
  const isBusiest = tab === 'busiest';
  const [searchFocus, setSearchFocus] = useState<{ areaCode: string; nonce: number } | null>(null);
  const latestTime = entries[0]?.populationTime
    ? extractPopulationHourMinute(entries[0].populationTime)
    : undefined;

  // 검색으로 선택된 장소가 현재 랭킹에 있으면 그 카드 강조, 없으면 silent
  const handleSearchSelect = useCallback((areaCode: string) => {
    setSearchFocus({ areaCode, nonce: Date.now() });
  }, []);

  // 탭 전환 시 검색 focus 해제 — 새 탭에 같은 장소가 있어도 재애니메이션 안 되도록
  const handleTabChange = useCallback(
    (newTab: 'busiest' | 'relaxed') => {
      setSearchFocus(null);
      setSearchParams({ tab: newTab });
    },
    [setSearchParams],
  );

  return (
    <div className="flex flex-col w-full min-h-dvh bg-slate-50">
      <Header onSearchSelect={handleSearchSelect} />
      <div className="max-w-6xl mx-auto w-full px-6 py-10">
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer group flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <CaretLeftIcon
            weight="fill"
            size={14}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Map
        </button>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              실시간 랭킹
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              서울 핫플레이스의 혼잡도를 한눈에
            </p>
          </div>

          {latestTime && (
            <div className="hidden sm:flex items-center gap-2 shrink-0 mb-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="font-semibold tracking-[0.18em] text-slate-700 uppercase">
                Live
              </span>
              <span className="text-slate-300">·</span>
              <span className="tabular-nums text-slate-500">{latestTime} 기준</span>
            </div>
          )}
        </div>

        <div className="mt-8 inline-flex gap-1 p-1 bg-slate-100/80 rounded-full">
          <button
            onClick={() => handleTabChange('busiest')}
            className={`cursor-pointer px-5 py-2 text-sm font-semibold tracking-tight rounded-full transition ${
              isBusiest
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            혼잡도 높은 순
          </button>
          <button
            onClick={() => handleTabChange('relaxed')}
            className={`cursor-pointer px-5 py-2 text-sm font-semibold tracking-tight rounded-full transition ${
              !isBusiest
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            혼잡도 낮은 순
          </button>
        </div>

        <div className="mt-6 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loading && (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="p-8 text-center text-sm text-slate-400">
              데이터를 불러올 수 없습니다
            </div>
          )}

          {!loading && !error && (
            <ul className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <li key={entry.areaCode}>
                  <RankingItem
                    entry={entry}
                    focusNonce={
                      searchFocus?.areaCode === entry.areaCode ? searchFocus.nonce : null
                    }
                    onClick={() => navigate(`/place/${entry.areaCode}`)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
