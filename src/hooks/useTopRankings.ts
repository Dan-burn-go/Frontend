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
        if (!axios.isCancel(err)) {
          dispatch({ type: 'error' });
        }
      });

    return () => controller.abort();
  }, [limit]);

  return state;
};
