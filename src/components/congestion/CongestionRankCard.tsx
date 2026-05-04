import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { fetchBusiestRanking, fetchRelaxedRanking } from '../../api/congestionApi';
import { CONGESTION_LEVEL_MAP, CONGESTION_COLORS, CONGESTION_LABELS } from '../../types/congestion';
import { useDraggable } from '../../hooks/useDraggable';
import type { RankingEntry } from '../../types/congestion';

interface Props {
  type: 'busiest' | 'relaxed';
  initialRatio: { x: number; y: number };
}

const CongestionRankCard = ({ type, initialRatio }: Props) => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { ref, position, scale, isDragging, handleMouseDown } = useDraggable(initialRatio);

  useEffect(() => {
    const controller = new AbortController();
    const loadData = type === 'busiest' ? fetchBusiestRanking : fetchRelaxedRanking;

    loadData(3, controller.signal)
      .then((data) => setEntries(data.rankings))
      .catch((err) => {
        if (!axios.isCancel(err)) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [type]);

  const isBusiest = type === 'busiest';
  const title = isBusiest ? 'Peak Congestion' : 'Quiet Getaways';
  const Icon = isBusiest ? TrendingUp : TrendingDown;
  const iconColor = isBusiest ? 'text-red-500' : 'text-green-500';

  return (
    <div
      ref={ref}
      onMouseDown={handleMouseDown}
      className="fixed z-10 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-[16vw] min-w-56 max-w-80 select-none"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${position.x}px, ${position.y}px, 0) scale(${scale})`,
        cursor: isDragging ? 'grabbing' : 'grab',
        transformOrigin: 'top left',
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className={iconColor} />
        <span className="text-base font-bold text-gray-900">{title}</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-xs text-gray-400 text-center py-2">데이터를 불러올 수 없습니다</p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => {
            const level = CONGESTION_LEVEL_MAP[entry.congestionLevel];
            const color = level ? CONGESTION_COLORS[level] : '#9ca3af';
            const label = level ? CONGESTION_LABELS[level] : entry.congestionLevel;
            return (
              <div key={entry.areaCode} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-sm text-gray-400 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-gray-800 font-medium truncate">
                    {entry.areaName}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full text-white shrink-0 ml-2"
                  style={{ backgroundColor: color }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => navigate('/ranking')}
        className="cursor-pointer flex items-center justify-center gap-1 w-full mt-4 text-sm text-blue-500 hover:text-blue-700 font-medium transition-colors"
      >
        자세히 보기
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

export default CongestionRankCard;
