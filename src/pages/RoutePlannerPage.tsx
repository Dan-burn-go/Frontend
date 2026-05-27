import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CaretLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';
import Header from '../components/layout/Header';
import OriginSearchInput from '../components/route/OriginSearchInput';
import type { OriginSelection } from '../components/route/OriginSearchInput';
import DestinationSelect from '../components/route/DestinationSelect';
import DestinationPreviewCard from '../components/route/DestinationPreviewCard';
import RoutePathCard from '../components/route/RoutePathCard';
import RouteIllustration from '../components/route/RouteIllustration';
import { useTransitRoute } from '../hooks/useTransitRoute';
import { LOCATION_MAP } from '../data/locations';

const RoutePlannerPage = () => {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState<OriginSelection | null>(null);
  const [destAreaCode, setDestAreaCode] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number>(0);
  const { state, search, reset } = useTransitRoute();

  // 총 소요시간 오름차순 — 가장 빠른 경로가 최상단/기본 펼침
  const sortedPaths = useMemo(() => {
    if (state.status !== 'success') return [];
    return [...state.data.paths].sort((a, b) => a.info.totalTime - b.info.totalTime);
  }, [state]);

  const canSearch = origin !== null && destAreaCode !== null;

  const handleSearch = () => {
    if (!origin || !destAreaCode) return;
    const dest = LOCATION_MAP.get(destAreaCode);
    if (!dest) return;
    setExpandedIdx(0);
    search(
      { lat: origin.lat, lng: origin.lng },
      { lat: dest.latitude, lng: dest.longitude },
    );
  };

  const handleOriginChange = (next: OriginSelection | null) => {
    setOrigin(next);
    if (state.status !== 'idle') reset();
  };
  const handleDestChange = (next: string | null) => {
    setDestAreaCode(next);
    if (state.status !== 'idle') reset();
  };

  // 펼친 카드를 다시 누르면 접힘 — -1을 "모두 접힘" sentinel로 사용
  const handleToggle = (idx: number) => {
    setExpandedIdx((prev) => (prev === idx ? -1 : idx));
  };

  return (
    <div className="flex flex-col w-full min-h-dvh bg-white">
      <Header />

      {/* 컨텐츠 영역에 두 개의 매우 옅은 ambient blob — 페이지에 따뜻한 톤을 더하면서도
          폼/카드의 가독성은 해치지 않는 수준으로만 노출 */}
      <div className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-0 size-[480px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #DBEAFE 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-72 -left-32 size-[420px] rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #EDE9FE 0%, transparent 70%)' }}
        />

        <div className="relative max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
          <button
            onClick={() => navigate('/')}
            className="cursor-pointer group flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 sm:mb-10 transition-colors"
          >
            <CaretLeftIcon
              weight="fill"
              size={14}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            Back to Map
          </button>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgb(15,23,42,0.04)]">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold text-slate-700 tracking-tight">
                실시간 혼잡도 안내
              </span>
            </div>

            <h1 className="text-[32px] sm:text-[48px] font-semibold text-slate-900 tracking-[-0.03em] leading-[1.05]">
              어디로 가볼까요?
            </h1>
            <p className="mt-3 text-[15px] text-slate-500 leading-relaxed">
              핫플레이스까지 가는 가장 빠른 길,
              <br className="hidden sm:block" /> 도착지의 지금 분위기와 함께 알려드려요.
            </p>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
            <div className="bg-white rounded-3xl ring-1 ring-slate-100 p-5 sm:p-6 h-fit lg:sticky lg:top-24 shadow-[0_4px_24px_-12px_rgb(15,23,42,0.08)] transition-shadow hover:shadow-[0_8px_32px_-12px_rgb(15,23,42,0.12)]">
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight mb-5">
                경로 입력
              </h2>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    출발지
                  </label>
                  <OriginSearchInput value={origin} onChange={handleOriginChange} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">
                    도착지
                  </label>
                  <DestinationSelect value={destAreaCode} onChange={handleDestChange} />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={!canSearch || state.status === 'loading'}
                className="cursor-pointer disabled:cursor-not-allowed mt-6 w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.99] disabled:bg-slate-100 disabled:text-slate-400 transition-all flex items-center justify-center gap-1.5"
              >
                {state.status === 'loading' ? (
                  <span>경로 찾는 중</span>
                ) : (
                  <>
                    <span>경로 찾기</span>
                    <ArrowRightIcon className="size-4" weight="bold" />
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {destAreaCode && <DestinationPreviewCard areaCode={destAreaCode} />}

              {state.status === 'idle' && (
                <div className="bg-white rounded-3xl ring-1 ring-slate-100 py-12 sm:py-16 px-6 flex flex-col items-center justify-center text-center shadow-[0_4px_24px_-16px_rgb(15,23,42,0.06)]">
                  <RouteIllustration className="w-32 h-auto mb-6" />
                  <p className="text-base font-semibold text-slate-900 tracking-tight">
                    {destAreaCode ? '출발지만 알려주시면 돼요' : '어디서 출발하시나요?'}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 max-w-xs leading-relaxed">
                    도보 · 버스 · 지하철을 조합해
                    <br />
                    가장 빠른 길을 찾아드릴게요
                  </p>
                </div>
              )}

              {state.status === 'loading' && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-3xl ring-1 ring-slate-100 p-5 animate-pulse"
                    >
                      <div className="h-8 w-20 bg-slate-100 rounded-md" />
                      <div className="mt-2.5 h-3 w-32 bg-slate-100 rounded" />
                      <div className="mt-4 h-1 w-full bg-slate-100 rounded-full" />
                      <div className="mt-3 flex gap-1.5">
                        <div className="h-5 w-14 bg-slate-100 rounded-md" />
                        <div className="h-5 w-12 bg-slate-100 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {state.status === 'empty' && (
                <div className="bg-white rounded-3xl ring-1 ring-slate-100 py-12 sm:py-16 text-center">
                  <p className="text-sm font-semibold text-slate-900">
                    추천 가능한 경로가 없어요
                  </p>
                  <p className="mt-1.5 text-sm text-slate-500">
                    출발지를 바꿔서 다시 시도해보세요
                  </p>
                </div>
              )}

              {state.status === 'error' && (
                <div className="bg-white rounded-3xl ring-1 ring-slate-100 py-12 sm:py-16 text-center">
                  <p className="text-sm font-semibold text-slate-900">경로를 불러올 수 없어요</p>
                  <p className="mt-1.5 text-sm text-slate-500">잠시 후 다시 시도해주세요</p>
                </div>
              )}

              {state.status === 'success' && destAreaCode && origin && (
                <>
                  <div className="flex items-baseline justify-between px-1 pt-1">
                    <p className="text-xs text-slate-500">
                      경로{' '}
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {sortedPaths.length}
                      </span>
                      개 · 빠른 순
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {sortedPaths.map((path, idx) => (
                      <RoutePathCard
                        key={idx}
                        path={path}
                        expanded={expandedIdx === idx}
                        isFastest={idx === 0}
                        destinationAreaCode={destAreaCode}
                        originLabel={origin.label}
                        destinationLabel={LOCATION_MAP.get(destAreaCode)?.name ?? '도착지'}
                        onToggle={() => handleToggle(idx)}
                        onDestinationClick={(areaCode) => navigate(`/place/${areaCode}`)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlannerPage;
