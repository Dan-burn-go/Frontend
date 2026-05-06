import { useEffect, useReducer } from 'react';
import axios from 'axios';
import { fetchBusiestRanking, fetchRelaxedRanking } from '../api/congestionApi';
import type { RankingEntry } from '../types/congestion';

type State = { entries: RankingEntry[]; loading: boolean; error: boolean };
type Action =
  | { type: 'reset' }
  | { type: 'success'; entries: RankingEntry[] }
  | { type: 'error' };

function rankingReducer(_: State, action: Action): State {
  switch (action.type) {
    case 'reset': return { entries: [], loading: true, error: false };
    case 'success': return { entries: action.entries, loading: false, error: false };
    case 'error': return { entries: [], loading: false, error: true };
  }
}

export const useRanking = (tab: 'busiest' | 'relaxed') => {
  const [state, dispatch] = useReducer(rankingReducer, { entries: [], loading: true, error: false });

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: 'reset' });
    const loadData = tab === 'busiest' ? fetchBusiestRanking : fetchRelaxedRanking;

    loadData(122, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          dispatch({ type: 'success', entries: data.rankings });
        }
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          dispatch({ type: 'error' });
        }
      });

    return () => controller.abort();
  }, [tab]);

  return state;
};
