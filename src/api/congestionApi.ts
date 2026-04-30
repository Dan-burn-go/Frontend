import instance from './instance';
import type { ApiResponse } from '../types/api';
import type { CongestionData } from '../types/congestion';

export const fetchAllCongestion = async (): Promise<CongestionData[]> => {
  const res = await instance.get<ApiResponse<CongestionData[]>>('/api/congestion');
  return res.data.data;
};

export const fetchCongestionByAreaCode = async (areaCode: string): Promise<CongestionData> => {
  const res = await instance.get<ApiResponse<CongestionData>>(`/api/congestion/${areaCode}`);
  return res.data.data;
};
