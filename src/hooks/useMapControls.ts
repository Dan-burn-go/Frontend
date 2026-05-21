import { useCallback, useRef, useState } from 'react';

const MIN_MAP_LEVEL = 1;
const MAX_MAP_LEVEL = 14;

// 카카오맵 인스턴스에 대한 명령형 제어(줌·현위치·이동)를 한곳에 모은 훅
export const useMapControls = () => {
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const setMap = useCallback((map: kakao.maps.Map) => {
    mapRef.current = map;
  }, []);

  const zoomIn = useCallback(() => {
    const map = mapRef.current;
    if (map) map.setLevel(Math.max(MIN_MAP_LEVEL, map.getLevel() - 1), { animate: true });
  }, []);

  const zoomOut = useCallback(() => {
    const map = mapRef.current;
    if (map) map.setLevel(Math.min(MAX_MAP_LEVEL, map.getLevel() + 1), { animate: true });
  }, []);

  const panTo = useCallback((lat: number, lng: number) => {
    mapRef.current?.panTo(new window.kakao.maps.LatLng(lat, lng));
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        mapRef.current?.panTo(new window.kakao.maps.LatLng(latitude, longitude));
      },
      () => {},
    );
  }, []);

  return { setMap, zoomIn, zoomOut, locate, panTo, userLocation };
};
