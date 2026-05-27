import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { fetchTransitRoute } from '../api/routeApi';
import type { Coord } from '../api/routeApi';
import type { TransitRouteResponse } from '../types/route';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: TransitRouteResponse }
  | { status: 'empty' }
  | { status: 'error' };

interface UseTransitRouteReturn {
  state: State;
  search: (origin: Coord, destination: Coord) => void;
  reset: () => void;
}

/**
 * 경로 검색을 명시적 트리거(버튼 클릭)로 호출하는 훅.
 * 자동 fetch 패턴이 아닌 이유: 출발지/도착지 둘 다 선택 안 된 상태로도 페이지가 살아있어야 하고,
 * 사용자가 의도적으로 검색을 누른 시점에만 API 호출이 발생해야 함.
 */
export const useTransitRoute = (): UseTransitRouteReturn => {
  const [state, setState] = useState<State>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);

  const search = useCallback((origin: Coord, destination: Coord) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: 'loading' });

    fetchTransitRoute(origin, destination, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setState(data.paths.length === 0 ? { status: 'empty' } : { status: 'success', data });
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setState({ status: 'error' });
      });
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState({ status: 'idle' });
  }, []);

  // 언마운트 시 진행 중인 요청 취소
  useEffect(() => () => controllerRef.current?.abort(), []);

  return { state, search, reset };
};
