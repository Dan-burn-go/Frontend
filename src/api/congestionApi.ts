import instance from './instance';
import type { ApiResponse } from '../types/api';
import type {
  AireportResponse,
  CongestionData,
  CongestionRankingResponse,
  CongestionTrendResponse,
} from '../types/congestion';

export const fetchAllCongestion = async (): Promise<CongestionData[]> => {
  const res = await instance.get<ApiResponse<CongestionData[]>>('/api/congestion');
  return res.data.data;
};

export const fetchCongestionByAreaCode = async (areaCode: string): Promise<CongestionData> => {
  const res = await instance.get<ApiResponse<CongestionData>>(`/api/congestion/${areaCode}`);
  return res.data.data;
};

export const fetchBusiestRanking = async (
  limit = 10,
  signal?: AbortSignal,
): Promise<CongestionRankingResponse> => {
  const res = await instance.get<ApiResponse<CongestionRankingResponse>>(
    '/api/congestion/analysis/ranking/busiest',
    { params: { limit }, signal },
  );
  return res.data.data;
};

export const fetchRelaxedRanking = async (
  limit = 10,
  signal?: AbortSignal,
): Promise<CongestionRankingResponse> => {
  const res = await instance.get<ApiResponse<CongestionRankingResponse>>(
    '/api/congestion/analysis/ranking/relaxed',
    { params: { limit }, signal },
  );
  return res.data.data;
};

export const fetchAiReport = async (
  areaCode: string,
  signal?: AbortSignal,
): Promise<AireportResponse> => {
  const res = await instance.get<ApiResponse<AireportResponse>>(
    `/api/congestion/${areaCode}/ai-report`,
    { signal },
  );
  return res.data.data;
};

export const fetchHourlyTrend = async (
  areaCode: string,
  days = 7,
  signal?: AbortSignal,
): Promise<CongestionTrendResponse> => {
  const res = await instance.get<ApiResponse<CongestionTrendResponse>>(
    `/api/congestion/analysis/hourly/${areaCode}`,
    { params: { days }, signal },
  );
  return res.data.data;
};

export const fetchDailyTrend = async (
  areaCode: string,
  days = 7,
  signal?: AbortSignal,
): Promise<CongestionTrendResponse> => {
  const res = await instance.get<ApiResponse<CongestionTrendResponse>>(
    `/api/congestion/analysis/daily/${areaCode}`,
    { params: { days }, signal },
  );
  return res.data.data;
};
