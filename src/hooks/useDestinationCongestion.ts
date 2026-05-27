import { useEffect, useState } from 'react';
import { fetchCongestionByAreaCode } from '../api/congestionApi';
import type { CongestionData } from '../types/congestion';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: CongestionData }
  | { status: 'error' };

/**
 * Route Planner의 도착지 미리보기에서 사용. 선택된 핫스팟의 현재 혼잡도를 조회한다.
 * 서비스 핵심 가치(실시간 혼잡도)를 경로 결과 화면에서 직접 노출해 일반 길찾기 앱과의
 * 차별점을 만든다.
 */
export const useDestinationCongestion = (areaCode: string | null): State => {
  const [state, setState] = useState<State>({ status: 'idle' });

  useEffect(() => {
    if (!areaCode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: 'idle' });
      return;
    }

    // 다른 도착지로 바꿨을 때 이전 데이터가 잠깐 노출되는 stale 표시 방지
    setState({ status: 'loading' });

    let cancelled = false;
    fetchCongestionByAreaCode(areaCode)
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [areaCode]);

  return state;
};
