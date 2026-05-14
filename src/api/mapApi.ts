import instance from './instance';
import type { ApiResponse } from '../types/api';
import type { CultureEvent } from '../types/map';

export const fetchCultureEvents = async (
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<CultureEvent[]> => {
  const res = await instance.get<ApiResponse<CultureEvent[]>>('/api/map/culture-events', {
    params: { latitude, longitude },
    signal,
  });
  return res.data.data;
};
