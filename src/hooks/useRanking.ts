import { useCallback, useEffect, useReducer, useRef } from 'react';
import axios from 'axios';
import { fetchBusiestRanking, fetchRelaxedRanking } from '../api/congestionApi';
import type { RankingEntry } from '../types/congestion';

// 백엔드가 5분 주기로 갱신되므로 새 데이터 받은 직후엔 5분 동안 새 데이터 없음.
// 같은 데이터 받은 경우(백엔드 갱신 직전 폴링)만 짧게 재시도해 다음 갱신을 따라잡는다.
const FRESH_INTERVAL = 5 * 60 * 1000; // 5분
const RETRY_INTERVAL = 60 * 1000; // 60초

const RANKING_LIMIT = 122;

type State = { entries: RankingEntry[]; loading: boolean; error: boolean };
type Action = { type: 'reset' } | { type: 'success'; entries: RankingEntry[] } | { type: 'error' };

function rankingReducer(_: State, action: Action): State {
  switch (action.type) {
    case 'reset':
      return { entries: [], loading: true, error: false };
    case 'success':
      return { entries: action.entries, loading: false, error: false };
    case 'error':
      return { entries: [], loading: false, error: true };
  }
}

// useCongestionMarkers와 동일한 adaptive 폴링으로 5분 갱신 주기와 동기화한다.
// 첫 entry의 populationTime이 직전과 다르면 새 데이터로 보고 dispatch.
// 첫 load는 백엔드 갱신 직후라는 보장이 없어 false 반환 → 60초 후 재시도로 위상 동기화.
export const useRanking = (tab: 'busiest' | 'relaxed') => {
  const [state, dispatch] = useReducer(rankingReducer, {
    entries: [],
    loading: true,
    error: false,
  });
  const prevPopulationTimeRef = useRef<string | null>(null);

  const load = useCallback(
    async (signal: AbortSignal): Promise<boolean> => {
      try {
        const loadData = tab === 'busiest' ? fetchBusiestRanking : fetchRelaxedRanking;
        const data = await loadData(RANKING_LIMIT, signal);
        if (signal.aborted) return false;
        const latestTime = data.rankings[0]?.populationTime ?? null;
        if (latestTime === null) return false;
        if (latestTime === prevPopulationTimeRef.current) return false;
        const isFirstLoad = prevPopulationTimeRef.current === null;
        dispatch({ type: 'success', entries: data.rankings });
        prevPopulationTimeRef.current = latestTime;
        return !isFirstLoad;
      } catch (err) {
        if (axios.isCancel(err) || signal.aborted) return false;
        // 폴링 중 일시 실패는 직전 데이터 유지, 첫 load 실패만 error 노출
        if (prevPopulationTimeRef.current === null) {
          dispatch({ type: 'error' });
        } else {
          console.error('[useRanking] 폴링 중 로드 실패:', err);
        }
        return false;
      }
    },
    [tab],
  );

  useEffect(() => {
    // tab 전환 시 직전 시각과 비교되지 않도록 리셋
    prevPopulationTimeRef.current = null;
    dispatch({ type: 'reset' });
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
