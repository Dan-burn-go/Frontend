import { useState, useMemo, useEffect, useRef } from 'react';
import { Map } from 'react-kakao-maps-sdk';
import { useCongestionMarkers } from '../../hooks/useCongestionMarkers';
import CongestionMarker from './CongestionMarker';
import AlternativeMarker from './AlternativeMarker';
import SourceMarker from './SourceMarker';
import type { AlternativeLocation } from '../../types/map';
import type { PlaceMarker } from '../../types/congestion';

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_LEVEL = 7;

interface KakaoMapProps {
  selectedCategory: string;
  alternativeLocations: AlternativeLocation[];
  sourceMarker: PlaceMarker | null;
  onAlternativeRequest: (marker: PlaceMarker) => void;
}

const KakaoMap = ({
  selectedCategory,
  alternativeLocations,
  sourceMarker,
  onAlternativeRequest,
}: KakaoMapProps) => {
  const markers = useCongestionMarkers();
  const [level, setLevel] = useState(DEFAULT_LEVEL);
  const [openMarkerId, setOpenMarkerId] = useState<string | null>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const savedViewRef = useRef<{ center: kakao.maps.LatLng; level: number } | null>(null);

  const filtered = useMemo(
    () =>
      selectedCategory === 'all' ? markers : markers.filter((m) => m.category === selectedCategory),
    [markers, selectedCategory],
  );

  useEffect(() => {
    if (!mapRef.current) return;

    if (alternativeLocations.length === 0) {
      if (savedViewRef.current) {
        mapRef.current.setCenter(savedViewRef.current.center);
        mapRef.current.setLevel(savedViewRef.current.level, { animate: true });
        savedViewRef.current = null;
      }
      return;
    }

    savedViewRef.current = {
      center: mapRef.current.getCenter(),
      level: mapRef.current.getLevel(),
    };

    const bounds = new window.kakao.maps.LatLngBounds();
    if (sourceMarker) {
      bounds.extend(new window.kakao.maps.LatLng(sourceMarker.latitude, sourceMarker.longitude));
    }
    alternativeLocations.forEach((loc) => {
      bounds.extend(new window.kakao.maps.LatLng(loc.latitude, loc.longitude));
    });
    mapRef.current.setBounds(bounds, 80);
  }, [alternativeLocations, sourceMarker]);

  return (
    <Map
      center={DEFAULT_CENTER}
      style={{ width: '100%', height: '100%' }}
      level={level}
      onCreate={(map) => {
        mapRef.current = map;
      }}
      onZoomChanged={(map) => setLevel(map.getLevel())}
    >
      {alternativeLocations.length === 0 &&
        filtered.map((marker) => (
          <CongestionMarker
            key={marker.areaCode}
            marker={marker}
            level={level}
            isOpen={openMarkerId === marker.areaCode}
            onOpen={() => setOpenMarkerId(marker.areaCode)}
            onClose={() => setOpenMarkerId(null)}
            onAlternativeRequest={onAlternativeRequest}
          />
        ))}
      {sourceMarker && <SourceMarker marker={sourceMarker} level={level} />}
      {alternativeLocations.map((loc) => (
        <AlternativeMarker key={loc.areaCode} location={loc} level={level} />
      ))}
    </Map>
  );
};

export default KakaoMap;
