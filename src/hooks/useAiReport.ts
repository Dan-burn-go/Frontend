import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { fetchAiReport } from '../api/congestionApi';
import type { AireportResponse } from '../types/congestion';

type Selected =
  | { kind: 'success'; data: AireportResponse }
  | { kind: 'stale' };

type State =
  | { status: 'loading' }
  | { status: 'success'; data: AireportResponse }
  | { status: 'empty' } // 404: 해당 장소의 AI 리포트 자체가 아직 생성되지 않음
  | { status: 'stale' } // 분석은 있지만 현재 시간대와 매칭되지 않음
  | { status: 'error' };

// 분석이 현재 시간대와 어긋나면 보여주지 않기 위한 허용 폭 (±N시간)
const HOUR_TOLERANCE = 3;

// 백엔드 AI 리포트는 혼잡도 변화 이벤트 기반으로 생성되어 fixed 갱신 주기가 없고
// Redis TTL이 3시간. 짧은 재방문은 캐시 hit, 장시간 체류는 visibility 기반 polling,
// 탭 복귀는 refetchOnWindowFocus로 한 번에 커버한다.
const STALE_TIME = 5 * 60 * 1000; // 5분
const REFETCH_INTERVAL = 5 * 60 * 1000; // 5분

// "2026-05-24 12:30" → 12
const parseHour = (populationTime: string): number | null => {
  const m = populationTime.match(/^\d{4}-\d{2}-\d{2} (\d{2}):/);
  return m ? Number(m[1]) : null;
};

// 24시 순환 거리 (예: 23시 vs 1시 → 2)
const circularHourDiff = (a: number, b: number): number => {
  const d = Math.abs(a - b);
  return d > 12 ? 24 - d : d;
};

// 서비스가 서울 데이터를 다루므로 사용자 로컬 시간이 아닌 KST 기준 시각이 필요하다.
// 해외/다른 시간대 브라우저에서도 비교가 정확하도록 Intl로 강제.
const getSeoulHour = (): number => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      hour: 'numeric',
      hour12: false,
    });
    return Number(formatter.format(new Date()));
  } catch {
    return new Date().getHours();
  }
};

// 모듈 스코프로 추출해 select 함수 참조를 렌더 간 안정화한다.
// 인라인으로 두면 매 렌더마다 새 함수 참조가 생겨 structural sharing이 작동하지 않고,
// 같은 응답에도 새 객체를 반환해 메모이제이션 효과를 잃는다.
const selectReport = (data: AireportResponse): Selected => {
  const reportHour = parseHour(data.populationTime);
  if (reportHour == null) return { kind: 'success', data };
  const diff = circularHourDiff(reportHour, getSeoulHour());
  return diff > HOUR_TOLERANCE ? { kind: 'stale' } : { kind: 'success', data };
};

export const useAiReport = (areaCode: string | null): State => {
  const query = useQuery<AireportResponse, Error, Selected>({
    queryKey: ['ai-report', areaCode],
    queryFn: ({ signal }) => fetchAiReport(areaCode!, signal),
    enabled: !!areaCode,
    staleTime: STALE_TIME,
    refetchInterval: REFETCH_INTERVAL,
    // 다른 탭이 활성화된 동안엔 polling 차단 — 사용자가 보지 않는 페이지로 트래픽 낭비 X
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    retry: (count, err) => {
      // 404는 비즈니스적 'empty'라 재시도 X
      if (axios.isAxiosError(err) && err.response?.status === 404) return false;
      return count < 1;
    },
    select: selectReport,
  });

  if (!areaCode) return { status: 'loading' };
  // SWR 정합: 캐시된 데이터가 있으면 우선 표시. 배경 refetch가 일시적으로 실패해도
  // 직전에 성공한 결과를 유지하고, error/empty 분기는 처음부터 데이터가 없을 때만 적용.
  if (query.data) {
    if (query.data.kind === 'stale') return { status: 'stale' };
    return { status: 'success', data: query.data.data };
  }
  if (query.isError) {
    const err = query.error;
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return { status: 'empty' };
    }
    return { status: 'error' };
  }
  return { status: 'loading' };
};
