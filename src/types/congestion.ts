// 백엔드 /api/congestion 응답의 congestionLevel은 한국어로 내려옴
// 프론트엔드 표시 및 색상 매핑을 위해 영문 등급으로 변환
export type CongestionLevel = 'QUIET' | 'MODERATE' | 'BUSY' | 'CROWDED';

export const CONGESTION_LEVEL_MAP: Record<string, CongestionLevel> = {
  여유: 'QUIET',
  보통: 'MODERATE',
  '약간 붐빔': 'BUSY',
  붐빔: 'CROWDED',
};

export const CONGESTION_LABELS: Record<CongestionLevel, string> = {
  QUIET: '여유',
  MODERATE: '보통',
  BUSY: '약간 붐빔',
  CROWDED: '붐빔',
};

export const CONGESTION_COLORS: Record<CongestionLevel, string> = {
  QUIET: '#22c55e', // green-500
  MODERATE: '#fb923c', // orange-400
  BUSY: '#facc15', // yellow-400
  CROWDED: '#ef4444', // red-500
};

export interface ForecastItem {
  forecastTime: string;
  congestionLevel: string;
  minPeopleCount: number;
  maxPeopleCount: number;
}

export interface CongestionData {
  areaCode: string;
  congestionLevel: string;
  congestionMessage: string;
  minPeopleCount: number;
  maxPeopleCount: number;
  populationTime: string;
  forecasts: ForecastItem[];
}

// 좌표 + 혼잡도가 합쳐진 마커 데이터
export interface PlaceMarker {
  areaCode: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  congestionLevel: CongestionLevel;
  congestionMessage: string;
  minPeopleCount: number;
  maxPeopleCount: number;
  populationTime: string;
}
