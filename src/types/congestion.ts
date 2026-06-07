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
  MODERATE: '#facc15', // yellow-400
  BUSY: '#fb923c', // orange-400
  CROWDED: '#ef4444', // red-500
};

export const CONGESTION_COLOR_UNKNOWN = '#9ca3af'; // gray-400, 혼잡도 미확인 상태

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

export interface RankingEntry {
  rank: number;
  areaCode: string;
  areaName: string;
  congestionLevel: string;
  minPeopleCount: number;
  maxPeopleCount: number;
  populationTime: string;
}

export interface CongestionRankingResponse {
  type: string;
  totalCount: number;
  rankings: RankingEntry[];
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

// AI 혼잡 원인 분석 리포트
export interface AireportResponse {
  areaCode: string;
  areaName: string;
  analysisMessage: string;
  populationTime: string;
}

// 시간대별·요일별 평균 추이 응답 (시간별: key=0~23 / 요일별: key=1=일~7=토)
export interface CongestionTrendPoint {
  key: number;
  label: string;
  congestionLevel: string; // 한국어 dominant level
  avgMinPeople: number;
  avgMaxPeople: number;
  dataCount: number;
}

export interface CongestionTrendResponse {
  areaCode: string;
  areaName: string;
  data: CongestionTrendPoint[];
}

export type CongestionTrendKind = 'hourly' | 'daily';
