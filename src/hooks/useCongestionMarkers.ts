import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAllCongestion } from '../api/congestionApi';
import { LOCATION_MAP } from '../data/locations';
import { CONGESTION_LEVEL_MAP } from '../types/congestion';
import type { PlaceMarker } from '../types/congestion';

// 백엔드가 5분 주기로 갱신되므로 새 데이터 받은 직후엔 5분 동안 새 데이터 없음.
// 같은 데이터 받은 경우(백엔드 갱신 직전 폴링)만 짧게 재시도해 다음 갱신을 따라잡는다.
const FRESH_INTERVAL = 5 * 60 * 1000; // 5분
const RETRY_INTERVAL = 60 * 1000; // 60초

export const useCongestionMarkers = (): PlaceMarker[] => {
  const [markers, setMarkers] = useState<PlaceMarker[]>([]);
  const prevPopulationTimeRef = useRef<string | null>(null);

  // 응답의 populationTime이 직전과 다르면 새 데이터로 보고 markers 갱신.
  // 반환값으로 "백엔드 갱신 위상과 동기화됐는지"를 알려 호출자가 다음 폴링 주기를 결정한다.
  // 첫 load는 백엔드 갱신 직후라는 보장이 없어 false 반환 → 60초 후 재시도로 위상 동기화.
  const load = useCallback(async (): Promise<boolean> => {
    try {
      const data = await fetchAllCongestion();
      if (data.length === 0) return false;

      const latestTime = data[0].populationTime;
      if (latestTime === prevPopulationTimeRef.current) return false;

      const isFirstLoad = prevPopulationTimeRef.current === null;

      const result: PlaceMarker[] = [];
      for (const item of data) {
        const location = LOCATION_MAP.get(item.areaCode);
        if (!location) continue;
        const congestionLevel = CONGESTION_LEVEL_MAP[item.congestionLevel];
        if (!congestionLevel) {
          console.warn(`[useCongestionMarkers] 알 수 없는 혼잡도 레벨: ${item.congestionLevel}`);
          continue;
        }
        result.push({
          areaCode: item.areaCode,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          category: location.category,
          congestionLevel,
          congestionMessage: item.congestionMessage,
          minPeopleCount: item.minPeopleCount,
          maxPeopleCount: item.maxPeopleCount,
          populationTime: item.populationTime,
        });
      }
      setMarkers(result);
      prevPopulationTimeRef.current = latestTime;
      return !isFirstLoad;
    } catch (err) {
      console.error('[useCongestionMarkers] 혼잡도 데이터 로드 실패:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

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
  }, [load]);

  return markers;
};
