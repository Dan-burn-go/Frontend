import { useCallback, useEffect, useReducer, useRef } from 'react';
import axios from 'axios';
import { fetchBusiestRanking, fetchRelaxedRanking } from '../api/congestionApi';
import type { RankingEntry } from '../types/congestion';

// 백엔드가 5분 주기로 갱신되므로 새 데이터 받은 직후엔 5분 동안 새 데이터 없음.
// 같은 데이터 받은 경우(백엔드 갱신 직전 폴링)만 짧게 재시도해 다음 갱신을 따라잡는다.
const FRESH_INTERVAL = 5 * 60 * 1000; // 5분
const RETRY_INTERVAL = 60 * 1000; // 60초

type State = {
  busiest: RankingEntry[];
  relaxed: RankingEntry[];
  loading: boolean;
  error: boolean;
};

type Action =
  | { type: 'success'; busiest: RankingEntry[]; relaxed: RankingEntry[] }
  | { type: 'error' };

function topRankingsReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'success':
      return {
        busiest: action.busiest,
        relaxed: action.relaxed,
        loading: false,
        error: false,
      };
    case 'error':
      return { ...state, loading: false, error: true };
  }
}

// busiest/relaxed 두 랭킹을 한 번에 가져와 미리보기 카드/시트에서 같이 쓰도록 만든 hook.
// 단일 useRanking은 limit=122 고정이라 top N 미리보기 용도엔 부적합 — limit를 인자로 받는다.
// useCongestionMarkers와 동일한 adaptive 폴링으로 5분 갱신 주기와 동기화한다.
// 단일 endpoint인 useCongestionMarkers와 달리 busiest/relaxed 두 endpoint를 병렬로 호출하므로
// 진행 중 요청을 즉시 끊기 위해 AbortController도 함께 사용한다.
export const useTopRankings = (limit: number) => {
  const [state, dispatch] = useReducer(topRankingsReducer, {
    busiest: [],
    relaxed: [],
    loading: true,
    error: false,
  });
  const prevPopulationTimeRef = useRef<string | null>(null);

  // busiest 첫 entry의 populationTime이 직전과 다르면 새 데이터로 보고 dispatch.
  // 반환값으로 "백엔드 갱신 위상과 동기화됐는지"를 알려 호출자가 다음 폴링 주기를 결정한다.
  // 첫 load는 백엔드 갱신 직후라는 보장이 없어 false 반환 → 60초 후 재시도로 위상 동기화.
  const load = useCallback(
    async (signal: AbortSignal): Promise<boolean> => {
      try {
        const [b, r] = await Promise.all([
          fetchBusiestRanking(limit, signal),
          fetchRelaxedRanking(limit, signal),
        ]);
        if (signal.aborted) return false;
        const latestTime = b.rankings[0]?.populationTime ?? null;
        if (latestTime === null) return false;
        if (latestTime === prevPopulationTimeRef.current) return false;
        const isFirstLoad = prevPopulationTimeRef.current === null;
        dispatch({ type: 'success', busiest: b.rankings, relaxed: r.rankings });
        prevPopulationTimeRef.current = latestTime;
        return !isFirstLoad;
      } catch (err) {
        if (axios.isCancel(err) || signal.aborted) return false;
        // 폴링 중 일시 실패는 직전 데이터 유지, 첫 load 실패만 error 노출
        if (prevPopulationTimeRef.current === null) {
          dispatch({ type: 'error' });
        } else {
          console.error('[useTopRankings] 폴링 중 로드 실패:', err);
        }
        return false;
      }
    },
    [limit],
  );

  useEffect(() => {
    prevPopulationTimeRef.current = null;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      const changed = await load(controller.signal);
      if (cancelled) return;
      timer = setTimeout(tick, changed ? FRESH_INTERVAL : RETRY_INTERVAL);
    };

    tick();

    return () => {
      cancelled = true;
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, [load]);

  return state;
};
