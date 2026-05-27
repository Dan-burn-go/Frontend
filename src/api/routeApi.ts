import instance from './instance';
import type { ApiResponse } from '../types/api';
import type { TransitRouteResponse } from '../types/route';

export interface Coord {
  lat: number;
  lng: number;
}

export const fetchTransitRoute = async (
  origin: Coord,
  destination: Coord,
  signal?: AbortSignal,
): Promise<TransitRouteResponse> => {
  const res = await instance.get<ApiResponse<TransitRouteResponse>>('/api/mobility/route', {
    params: {
      originLat: origin.lat,
      originLng: origin.lng,
      destLat: destination.lat,
      destLng: destination.lng,
    },
    signal,
  });
  return res.data.data;
};
