import { useEffect, useMemo, useState } from 'react';
import { useHourlyTrend, useDailyTrend } from '../../hooks/useCongestionTrend';
import CongestionTrendChart from '../congestion/CongestionTrendChart';
import type { CongestionTrendKind } from '../../types/congestion';

interface Props {
  areaCode: string;
}

// KST는 UTC+9 고정(DST 없음)이라 timestamp에 직접 offset을 더해 Date 객체를 만들고
// getUTC* 메서드로 시간/요일을 읽는다. Intl/toLocaleString의 환경 의존 포맷(예:
// 자정을 '24'로 반환, 요일이 'Sun.'처럼 마침표 포함) 문제를 피하는 안전한 방식.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const kstNow = (): Date => new Date(Date.now() + KST_OFFSET_MS);

const getSeoulHour = (): number => kstNow().getUTCHours();

// JavaScript getUTCDay(): 0=일, 1=월, ..., 6=토
// 백엔드 DAYOFWEEK: 1=일, 2=월, ..., 7=토 → +1 매핑
const getSeoulDayOfWeekKey = (): number => kstNow().getUTCDay() + 1;

const TICK_INTERVAL = 60 * 1000; // 1분

const CongestionTrendSection = ({ areaCode }: Props) => {
  const [kind, setKind] = useState<CongestionTrendKind>('hourly');

  // 두 hook 모두 호출해 양쪽 캐시를 채워둔다. 응답이 작아 트래픽 부담은 낮고,
  // 토글 전환 시 즉시 캐시 hit으로 표시가 가능해 UX 우선.
  const hourlyQuery = useHourlyTrend(areaCode);
  const dailyQuery = useDailyTrend(areaCode);
  const currentQuery = kind === 'hourly' ? hourlyQuery : dailyQuery;

  // 사용자가 페이지에 머무는 동안 시간이 흘러도 "지금" 강조가 따라가도록
  // 1분 단위 tick으로 highlightKey를 재계산한다.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), TICK_INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  // tick은 본문에서 직접 참조하지 않지만, 1분 단위로 시간 흐름에 따라
  // highlightKey를 강제 재계산하기 위한 의존성으로 의도적으로 포함한다.
  const highlightKey = useMemo(
    () => (kind === 'hourly' ? getSeoulHour() : getSeoulDayOfWeekKey()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kind, tick],
  );

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">평소 혼잡도 추이</h2>
          <p className="text-xs text-slate-500 mt-0.5">최근 7일 측정 데이터 평균</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setKind('hourly')}
            className={`px-3 py-1 rounded-md text-sm transition-colors cursor-pointer ${
              kind === 'hourly'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            aria-pressed={kind === 'hourly'}
          >
            시간대
          </button>
          <button
            type="button"
            onClick={() => setKind('daily')}
            className={`px-3 py-1 rounded-md text-sm transition-colors cursor-pointer ${
              kind === 'daily'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            aria-pressed={kind === 'daily'}
          >
            요일별
          </button>
        </div>
      </div>

      {currentQuery.isPending && (
        <div className="h-64 animate-pulse bg-slate-50 rounded-xl" />
      )}
      {currentQuery.isError && (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          추이 데이터를 불러올 수 없어요.
        </div>
      )}
      {currentQuery.data && currentQuery.data.length === 0 && (
        <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
          아직 충분한 데이터가 쌓이지 않았어요.
        </div>
      )}
      {currentQuery.data && currentQuery.data.length > 0 && (
        <CongestionTrendChart
          data={currentQuery.data}
          kind={kind}
          highlightKey={highlightKey}
        />
      )}
    </section>
  );
};

export default CongestionTrendSection;
