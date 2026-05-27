import { useAiReport } from '../../hooks/useAiReport';
import { formatPopulationTime } from '../../utils/date';
import SectionHeader from './SectionHeader';

// AI 카드의 비-success 상태에서 표시할 메시지 — 한 곳에 모아 두면 톤 통일/번역 시 유리
const AI_STATE_MESSAGES = {
  empty: '혼잡한 시점에 AI 분석이 생성돼요.',
  stale: '이 시간대의 AI 분석은 아직 준비되지 않았어요.',
  error: 'AI 분석 정보를 불러올 수 없어요.',
} as const;

interface Props {
  areaCode: string;
}

const PlaceholderCard = ({ message }: { message: string }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm text-center text-slate-400 text-sm">
    {message}
  </div>
);

const AiInsightCard = ({ areaCode }: Props) => {
  const state = useAiReport(areaCode);

  return (
    <div>
      <SectionHeader title="AI가 본 혼잡 원인" className="mb-4" />
      {state.status === 'loading' && (
        <div className="bg-white rounded-2xl shadow-sm animate-pulse h-28" />
      )}
      {state.status === 'empty' && <PlaceholderCard message={AI_STATE_MESSAGES.empty} />}
      {state.status === 'stale' && <PlaceholderCard message={AI_STATE_MESSAGES.stale} />}
      {state.status === 'error' && <PlaceholderCard message={AI_STATE_MESSAGES.error} />}
      {state.status === 'success' && (
        <div className="relative overflow-hidden rounded-2xl shadow-sm border border-slate-100 bg-white px-8 sm:px-12 py-10 sm:py-12">
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-blue-300/25 to-blue-100/10 blur-3xl"
            aria-hidden
          />

          <span
            className="pointer-events-none select-none absolute -left-2 -top-8 text-[140px] font-extrabold text-blue-100 leading-none"
            aria-hidden
          >
            &ldquo;
          </span>

          <div className="relative">
            <div className="flex items-center justify-end mb-7">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-100/70">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </span>
                <span className="text-[9px] font-bold tracking-[0.22em] text-green-700 uppercase">
                  Live
                </span>
              </span>
            </div>

            <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-[1.55] tracking-[-0.02em] whitespace-pre-line">
              {state.data.analysisMessage}
            </p>

            {state.data.populationTime && (
              <p className="mt-8 text-xs text-slate-400 tracking-wide leading-relaxed">
                {formatPopulationTime(state.data.populationTime)} 측정 데이터를 기반으로 분석한
                결과예요
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiInsightCard;
