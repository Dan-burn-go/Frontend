import { useEffect, useRef, useState } from 'react';
import { fetchCongestionByAreaCode } from '../api/congestionApi';
import type { CongestionData } from '../types/congestion';

// 백엔드가 5분 주기로 갱신되므로 새 데이터 받은 직후엔 5분 동안 새 데이터 없음.
// 같은 데이터 받은 경우(백엔드 갱신 직전 폴링)만 짧게 재시도해 다음 갱신을 따라잡는다.
const FRESH_INTERVAL = 5 * 60 * 1000; // 5분
const RETRY_INTERVAL = 60 * 1000; // 60초

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: CongestionData }
  | { status: 'error' };

/**
 * Route Planner의 도착지 미리보기에서 사용. 선택된 핫스팟의 현재 혼잡도를 조회한다.
 * 서비스 핵심 가치(실시간 혼잡도)를 경로 결과 화면에서 직접 노출해 일반 길찾기 앱과의
 * 차별점을 만든다.
 *
 * useCongestionMarkers와 동일한 adaptive 폴링으로 5분 갱신 주기와 동기화한다.
 */
export const useDestinationCongestion = (areaCode: string | null): State => {
  const [state, setState] = useState<State>({ status: 'idle' });
  const prevPopulationTimeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!areaCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: 'idle' });
      prevPopulationTimeRef.current = null;
      return;
    }

    // 다른 도착지로 바꿨을 때 이전 데이터가 잠깐 노출되는 stale 표시 방지
    setState({ status: 'loading' });
    prevPopulationTimeRef.current = null;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    // populationTime이 직전과 다르면 새 데이터로 보고 setState.
    // 반환값으로 "백엔드 갱신 위상과 동기화됐는지"를 알려 호출자가 다음 폴링 주기를 결정한다.
    // 첫 load는 백엔드 갱신 직후라는 보장이 없어 false 반환 → 60초 후 재시도로 위상 동기화.
    const load = async (): Promise<boolean> => {
      try {
        const data = await fetchCongestionByAreaCode(areaCode);
        if (cancelled) return false;
        const latestTime = data.populationTime;
        if (latestTime === prevPopulationTimeRef.current) return false;
        const isFirstLoad = prevPopulationTimeRef.current === null;
        setState({ status: 'success', data });
        prevPopulationTimeRef.current = latestTime;
        return !isFirstLoad;
      } catch (err) {
        if (cancelled) return false;
        // 폴링 중 일시 실패는 직전 데이터 유지, 첫 load 실패만 error 노출
        if (prevPopulationTimeRef.current === null) {
          setState({ status: 'error' });
        } else {
          console.error('[useDestinationCongestion] 폴링 중 로드 실패:', err);
        }
        return false;
      }
    };

    const tick = async () => {
      if (cancelled) return;
      const changed = await load();
      if (cancelled) return;
      timer = setTimeout(tick, changed ? FRESH_INTERVAL : RETRY_INTERVAL);
    };

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [areaCode]);

  return state;
};
