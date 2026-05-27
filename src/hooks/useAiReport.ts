import { useEffect, useState } from 'react';
import axios from 'axios';
import { fetchAiReport } from '../api/congestionApi';
import type { AireportResponse } from '../types/congestion';

type State =
  | { status: 'loading' }
  | { status: 'success'; data: AireportResponse }
  | { status: 'empty' } // 404: 해당 장소의 AI 리포트 자체가 아직 생성되지 않음
  | { status: 'stale' } // 분석은 있지만 현재 시간대와 매칭되지 않음
  | { status: 'error' };

// 분석이 현재 시간대와 어긋나면 보여주지 않기 위한 허용 폭 (±N시간)
const HOUR_TOLERANCE = 3;

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

export const useAiReport = (areaCode: string | null) => {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (!areaCode) return;

    const controller = new AbortController();

    fetchAiReport(areaCode, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        const reportHour = parseHour(data.populationTime);
        if (reportHour == null) {
          setState({ status: 'success', data });
          return;
        }
        const diff = circularHourDiff(reportHour, new Date().getHours());
        setState(diff > HOUR_TOLERANCE ? { status: 'stale' } : { status: 'success', data });
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setState(
          axios.isAxiosError(err) && err.response?.status === 404
            ? { status: 'empty' }
            : { status: 'error' },
        );
      });

    return () => controller.abort();
  }, [areaCode]);

  return state;
};
