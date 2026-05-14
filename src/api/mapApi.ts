import instance from './instance';
import type { ApiResponse } from '../types/api';
import type { AlternativeLocation, CultureEvent } from '../types/map';

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

export const fetchAlternativeLocations = async (
  areaCode: string,
  signal?: AbortSignal,
): Promise<AlternativeLocation[]> => {
  const res = await instance.get<ApiResponse<AlternativeLocation[]>>(
    '/api/map/alternative-location',
    { params: { areaCode }, signal },
  );
  return res.data.data;
};
