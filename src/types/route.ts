// 백엔드 GET /api/mobility/route (ODSAY 기반) 응답 타입
// 구간 종류별로 nullable 필드가 달라짐 — WALK는 lane/stations/way 없음, SUBWAY는 busNo 없음 등

export type TrafficType = 'WALK' | 'BUS' | 'SUBWAY';

export interface RouteLane {
  busNo: string | null;
  type: number | null;
  name: string | null;
  subwayCode: number | null;
}

export interface RouteSubPath {
  trafficType: TrafficType;
  sectionTime: number;
  intervalTime: number | null;
  way: string | null;
  lane: RouteLane[];
  stations: string[] | null;
}

export interface RouteInfo {
  totalTime: number;
  payment: number;
  busTransitCount: number;
  subwayTransitCount: number;
  firstStartStation: string;
  lastEndStation: string;
}

export interface RoutePath {
  info: RouteInfo;
  subPaths: RouteSubPath[];
}

export interface TransitRouteResponse {
  paths: RoutePath[];
}
