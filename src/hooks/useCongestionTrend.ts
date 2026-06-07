import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { fetchHourlyTrend, fetchDailyTrend } from '../api/congestionApi';
import type {
  CongestionTrendKind,
  CongestionTrendPoint,
  CongestionTrendResponse,
} from '../types/congestion';

// 백엔드 응답이 지난 N일 평균이라 같은 날 안에는 새 fetch가 평균에 거의 영향이 없고,
// 의미 있는 갱신은 자정이 지나 7일 윈도가 한 칸 밀릴 때 발생.
// queryKey에 KST 기준 오늘 날짜를 포함해 자정 경계에서 자동 새 fetch가 트리거되게 한다.
const STALE_TIME = 24 * 60 * 60 * 1000;
const GC_TIME = 24 * 60 * 60 * 1000;

// 모듈 스코프로 추출해 select 함수 참조를 렌더 간 안정화 (structural sharing 보존).
const selectData = (response: CongestionTrendResponse): CongestionTrendPoint[] => response.data;

const getTodayKst = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};

const useCongestionTrend = (
  kind: CongestionTrendKind,
  areaCode: string | null,
  days = 7,
) => {
  // mount 시점의 KST 날짜를 잡아둔다. 사용자가 페이지에 머무는 동안 자정을 넘는
  // 시나리오는 드물어 mount 기준 1회 계산으로 충분하다고 보고, 단순화.
  const todayKst = useMemo(() => getTodayKst(), []);

  return useQuery<CongestionTrendResponse, Error, CongestionTrendPoint[]>({
    queryKey: ['congestion-trend', kind, areaCode, days, todayKst],
    queryFn: ({ signal }) =>
      kind === 'hourly'
        ? fetchHourlyTrend(areaCode!, days, signal)
        : fetchDailyTrend(areaCode!, days, signal),
    enabled: !!areaCode,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    retry: (count, err) => {
      // 404는 비즈니스적 'empty'라 재시도 X
      if (axios.isAxiosError(err) && err.response?.status === 404) return false;
      return count < 1;
    },
    select: selectData,
  });
};

export const useHourlyTrend = (areaCode: string | null, days = 7) =>
  useCongestionTrend('hourly', areaCode, days);

export const useDailyTrend = (areaCode: string | null, days = 7) =>
  useCongestionTrend('daily', areaCode, days);
