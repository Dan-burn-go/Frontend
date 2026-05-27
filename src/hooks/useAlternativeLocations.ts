import { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchAlternativeLocations } from '../api/mapApi';
import type { AlternativeLocation } from '../types/map';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: AlternativeLocation[] } // 보장: data.length > 0
  | { status: 'empty' } // 추천 결과 없음 (빈 배열)
  | { status: 'error' };

export const useAlternativeLocations = (areaCode: string | null) => {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!areaCode) return;

    const controller = new AbortController();

    fetchAlternativeLocations(areaCode, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setState(data.length === 0 ? { status: 'empty' } : { status: 'success', data });
      })
      .catch((err) => {
        if (!axios.isCancel(err)) setState({ status: 'error' });
      });

    return () => controller.abort();
  }, [areaCode]);

  return state;
};
