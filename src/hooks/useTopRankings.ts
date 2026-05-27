import { useEffect, useReducer } from 'react';
import axios from 'axios';
import { fetchBusiestRanking, fetchRelaxedRanking } from '../api/congestionApi';
import type { RankingEntry } from '../types/congestion';

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
export const useTopRankings = (limit: number) => {
  const [state, dispatch] = useReducer(topRankingsReducer, {
    busiest: [],
    relaxed: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetchBusiestRanking(limit, controller.signal),
      fetchRelaxedRanking(limit, controller.signal),
    ])
      .then(([b, r]) => {
        if (!controller.signal.aborted) {
          dispatch({ type: 'success', busiest: b.rankings, relaxed: r.rankings });
        }
      })
      .catch((err) => {
        // abort 후 미세 타이밍에 CancelError가 아닌 형태로 reject되는 케이스(네트워크 race)
        // 까지 차단해, 언마운트된 컴포넌트에 dispatch가 도달하지 않도록 함.
        if (controller.signal.aborted) return;
        if (axios.isCancel(err)) return;
        dispatch({ type: 'error' });
      });

    return () => controller.abort();
  }, [limit]);

  return state;
};
