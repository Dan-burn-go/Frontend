import { useEffect, useState } from 'react';
import { fetchAllCongestion } from '../api/congestionApi';
import { LOCATION_MAP } from '../data/locations';
import { CONGESTION_LEVEL_MAP } from '../types/congestion';
import type { PlaceMarker } from '../types/congestion';

export const useCongestionMarkers = (): PlaceMarker[] => {
  const [markers, setMarkers] = useState<PlaceMarker[]>([]);

  useEffect(() => {
    fetchAllCongestion()
      .then((data) => {
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
      })
      .catch((err) => {
        console.error('[useCongestionMarkers] 혼잡도 데이터 로드 실패:', err);
      });
  }, []);

  return markers;
};
