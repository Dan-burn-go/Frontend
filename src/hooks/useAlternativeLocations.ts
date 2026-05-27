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

    // 다른 장소로 이동했을 때 이전 대체장소 목록이 잠깐 노출되는 stale 표시 방지
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: 'loading' });

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
