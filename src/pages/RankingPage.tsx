import { useNavigate, useSearchParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowLeft, Users } from 'lucide-react';
import Header from '../components/layout/Header';
import { useRanking } from '../hooks/useRanking';
import { LOCATION_MAP } from '../data/locations';
import { CATEGORY_NAMES } from '../data/categories';
import { CONGESTION_LEVEL_MAP, CONGESTION_COLORS, CONGESTION_LABELS } from '../types/congestion';
import type { RankingEntry } from '../types/congestion';

const RANK_BADGE: Record<number, string> = {
  1: 'bg-yellow-400 text-white',
  2: 'bg-gray-400 text-white',
  3: 'bg-amber-600 text-white',
};

interface RankingItemProps {
  entry: RankingEntry;
  onClick: () => void;
}

const RankingItem = ({ entry, onClick }: RankingItemProps) => {
  const level = CONGESTION_LEVEL_MAP[entry.congestionLevel];
  const color = level ? CONGESTION_COLORS[level] : '#9ca3af';
  const label = level ? CONGESTION_LABELS[level] : entry.congestionLevel;
  const location = LOCATION_MAP.get(entry.areaCode);
  const category = location ? `#${CATEGORY_NAMES[location.category]}` : null;
  const avgPeople = Math.round((entry.minPeopleCount + entry.maxPeopleCount) / 2);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left cursor-pointer bg-white rounded-2xl px-8 py-5 flex items-center gap-6 hover:shadow-md transition-shadow"
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
          RANK_BADGE[entry.rank] ?? 'bg-gray-100 text-gray-500'
        }`}
      >
        {entry.rank}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-lg font-semibold text-gray-900 truncate">{entry.areaName}</p>
        <div className="flex items-center gap-3 mt-1.5">
          {category && <span className="text-base text-gray-400">{category}</span>}
          <span className="flex items-center gap-1 text-base text-gray-400">
            <Users size={15} />
            {avgPeople.toLocaleString()}명
          </span>
        </div>
      </div>

      <span
        className="text-base font-semibold px-5 py-2 rounded-full text-white shrink-0"
        style={{ backgroundColor: color }}
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

  return (
    <div className="flex flex-col w-full min-h-dvh bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto w-full px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="cursor-pointer flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          메인으로 돌아가기
        </button>

        <h1 className="text-3xl font-bold text-gray-900">실시간 랭킹</h1>
        <p className="text-base text-gray-400 mt-1.5">
          서울 핫플레이스의 실시간 혼잡도를 확인하세요
        </p>

        <div className="flex gap-8 mt-8 border-b border-gray-200">
          <button
            onClick={() => setSearchParams({ tab: 'busiest' })}
            className={`cursor-pointer flex items-center gap-2 pb-3 text-base font-medium border-b-2 transition-colors ${
              isBusiest
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <TrendingUp size={17} />
            혼잡도 높은 순
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'relaxed' })}
            className={`cursor-pointer flex items-center gap-2 pb-3 text-base font-medium border-b-2 transition-colors ${
              !isBusiest
                ? 'border-green-500 text-green-500'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <TrendingDown size={17} />
            혼잡도 낮은 순
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {loading && (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
              ))}
            </>
          )}

          {!loading && error && (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
              데이터를 불러올 수 없습니다
            </div>
          )}

          {!loading &&
            !error &&
            entries.map((entry) => (
              <RankingItem
                key={entry.areaCode}
                entry={entry}
                onClick={() => navigate(`/place/${entry.areaCode}`)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
