import instance from './instance';
import type { ApiResponse } from '../types/api';
import type { CongestionData, CongestionRankingResponse } from '../types/congestion';

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
