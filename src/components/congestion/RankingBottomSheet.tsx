import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendUpIcon,
  TreeEvergreenIcon,
  CaretUpIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import {
  CONGESTION_LEVEL_MAP,
  CONGESTION_COLORS,
  CONGESTION_LABELS,
} from '../../types/congestion';
import type { RankingEntry } from '../../types/congestion';
import { useSwipeDown } from '../../hooks/useSwipeDown';

const TOP_LIMIT = 3;
const SHEET_ID = 'ranking-bottom-sheet';

interface Props {
  busiest: RankingEntry[];
  relaxed: RankingEntry[];
  loading: boolean;
  error: boolean;
}

interface SectionProps {
  title: string;
  Icon: Icon;
  iconColor: string;
  tab: 'busiest' | 'relaxed';
  entries: RankingEntry[];
  loading: boolean;
  error: boolean;
  onItemSelect: (areaCode: string) => void;
}

const Section = ({
  title,
  Icon,
  iconColor,
  tab,
  entries,
  loading,
  error,
  onItemSelect,
}: SectionProps) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon size={15} weight="fill" className={iconColor} />
        <h2 className="text-[13px] font-semibold text-slate-900 tracking-tight">
          {title}
        </h2>
      </div>

      {loading ? (
        <div className="space-y-1">
          {Array.from({ length: TOP_LIMIT }).map((_, i) => (
            <div key={i} className="h-9 bg-slate-50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-xs text-slate-400 text-center py-2">
          데이터를 불러올 수 없습니다
        </p>
      ) : entries.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2">표시할 랭킹이 없어요</p>
      ) : (
        <ul>
          {entries.map((entry, i) => {
            const level = CONGESTION_LEVEL_MAP[entry.congestionLevel];
            const color = level ? CONGESTION_COLORS[level] : '#9ca3af';
            const label = level ? CONGESTION_LABELS[level] : entry.congestionLevel;
            return (
              <li key={entry.areaCode}>
                <button
                  type="button"
                  onClick={() => onItemSelect(entry.areaCode)}
                  className="cursor-pointer w-full flex items-center gap-3 py-2 -mx-2 px-2 rounded-lg active:bg-slate-50 transition-colors text-left"
                >
                  <span className="text-[13px] text-slate-300 tabular-nums w-4 shrink-0 font-medium">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-[14px] font-medium text-slate-900 tracking-tight truncate">
                    {entry.areaName}
                  </span>
                  <span
                    className="text-[10.5px] font-medium tracking-tight px-2 py-0.5 rounded-full text-white shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => navigate(`/ranking?tab=${tab}`)}
        className="cursor-pointer group flex items-center justify-center gap-1 w-full mt-3 text-[12px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
      >
        더 보기
        <ArrowRightIcon
          size={11}
          weight="bold"
          className="group-hover:translate-x-0.5 transition-transform"
        />
      </button>
    </section>
  );
};

const RankingBottomSheet = ({ busiest, relaxed, loading, error }: Props) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { dragY, touchHandlers } = useSwipeDown({
    onDismiss: () => setOpen(false),
    dismissOnTap: false,
  });

  // 시트가 열려있을 때만 Escape 키 리스너 — 닫혔을 때는 등록도 안 해 불필요한 비용 회피.
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  const handleItemSelect = (areaCode: string) => {
    setOpen(false);
    navigate(`/place/${areaCode}`);
  };

  const dragging = dragY > 0;

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="혼잡도 랭킹 열기"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={SHEET_ID}
        className={`fixed bottom-6 right-4 z-20 cursor-pointer h-10 flex items-center gap-1.5 pl-3.5 pr-3 bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-[0_4px_16px_rgba(15,23,42,0.08)] active:scale-[0.98] transition-[opacity,transform] duration-200 ${
          open ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <TrendUpIcon size={14} weight="fill" className="text-rose-500" />
        <span className="text-[13px] font-semibold text-slate-900 tracking-tight">
          Rankings
        </span>
        <CaretUpIcon size={12} weight="bold" className="text-slate-400" />
      </button>

      <div
        id={SHEET_ID}
        role="dialog"
        aria-label="혼잡도 랭킹"
        aria-hidden={!open}
        {...touchHandlers}
        className={`fixed inset-x-0 bottom-0 z-20 bg-white rounded-t-[28px] shadow-[0_-8px_32px_rgba(15,23,42,0.1)] ring-1 ring-slate-900/5 touch-none ${
          dragging ? '' : 'transition-transform duration-300 ease-out'
        }`}
        style={{
          transform: open ? `translateY(${dragY}px)` : 'translateY(100%)',
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="시트 닫기"
          data-swipe-allow
          className="cursor-pointer w-full flex justify-center pt-3 pb-2"
        >
          <div className="w-9 h-1 bg-slate-200 rounded-full" />
        </button>

        <div className="px-6 pt-2 pb-7 space-y-5">
          <Section
            title="Peak Congestion"
            Icon={TrendUpIcon}
            iconColor="text-rose-500"
            tab="busiest"
            entries={busiest}
            loading={loading}
            error={error}
            onItemSelect={handleItemSelect}
          />
          <div className="h-px bg-slate-100" />
          <Section
            title="Quiet Getaways"
            Icon={TreeEvergreenIcon}
            iconColor="text-emerald-600"
            tab="relaxed"
            entries={relaxed}
            loading={loading}
            error={error}
            onItemSelect={handleItemSelect}
          />
        </div>
      </div>
    </div>
  );
};

export default RankingBottomSheet;
