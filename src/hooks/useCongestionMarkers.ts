import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchAllCongestion } from '../api/congestionApi';
import { LOCATION_MAP } from '../data/locations';
import { CONGESTION_LEVEL_MAP } from '../types/congestion';
import type { PlaceMarker } from '../types/congestion';

const POLLING_INTERVAL = 60_000;

export const useCongestionMarkers = (): PlaceMarker[] => {
  const [markers, setMarkers] = useState<PlaceMarker[]>([]);
  const prevPopulationTimeRef = useRef<string | null>(null);

  const load = useCallback(() => {
    fetchAllCongestion()
      .then((data) => {
        if (data.length === 0) return;

        const latestTime = data[0].populationTime;
        if (latestTime === prevPopulationTimeRef.current) return;

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
      })
      .catch((err) => {
        console.error('[useCongestionMarkers] 혼잡도 데이터 로드 실패:', err);
      });
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [load]);

  return markers;
};
