import { useEffect, useRef, useState } from 'react';
import { fetchAlternativeLocations } from '../api/mapApi';
import type { AlternativeLocation } from '../types/map';

// 백엔드 응답(AlternativeLocation[])에 시각 정보가 없어 useCongestionMarkers의 changed 판정
// (populationTime 비교)을 적용할 수 없으므로 5분 고정 폴링으로 fallback한다.
// 응답 스키마 보강(populationTime 추가)은 별도 백엔드 이슈로 분리.
const POLL_INTERVAL = 5 * 60 * 1000;

type State =
  | { status: 'loading' }
  | { status: 'success'; data: AlternativeLocation[] } // 보장: data.length > 0
  | { status: 'empty' } // 추천 결과 없음 (빈 배열)
  | { status: 'error' };

export const useAlternativeLocations = (areaCode: string | null) => {
  const [state, setState] = useState<State>({ status: 'loading' });
  const hasLoadedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!areaCode) return;

    // 다른 장소로 이동했을 때 이전 대체장소 목록이 잠깐 노출되는 stale 표시 방지
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: 'loading' });
    hasLoadedRef.current = false;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchAlternativeLocations(areaCode);
        if (cancelled) return;
        setState(data.length === 0 ? { status: 'empty' } : { status: 'success', data });
        hasLoadedRef.current = true;
      } catch (err) {
        if (cancelled) return;
        // 폴링 중 일시 실패는 직전 데이터 유지, 첫 load 실패만 error 노출
        if (!hasLoadedRef.current) {
          setState({ status: 'error' });
        } else {
          console.error('[useAlternativeLocations] 폴링 중 로드 실패:', err);
        }
      }
    };

    const tick = async () => {
      if (cancelled) return;
      await load();
      if (cancelled) return;
      timer = setTimeout(tick, POLL_INTERVAL);
    };

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [areaCode]);

  return state;
};
