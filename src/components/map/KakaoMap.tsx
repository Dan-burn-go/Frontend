import { useState } from 'react';
import { Map } from 'react-kakao-maps-sdk';
import { useCongestionMarkers } from '../../hooks/useCongestionMarkers';
import CongestionMarker from './CongestionMarker';

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_LEVEL = 7;

interface KakaoMapProps {
  selectedCategory: string;
}

const KakaoMap = ({ selectedCategory }: KakaoMapProps) => {
  const markers = useCongestionMarkers();
  const [level, setLevel] = useState(DEFAULT_LEVEL);

  const filtered = selectedCategory === 'all'
    ? markers
    : markers.filter((m) => m.category === selectedCategory);

  return (
    <Map
      center={DEFAULT_CENTER}
      style={{ width: '100%', height: '100%' }}
      level={DEFAULT_LEVEL}
      onZoomChanged={(map) => setLevel(map.getLevel())}
    >
      {filtered.map((marker) => (
        <CongestionMarker key={marker.areaCode} marker={marker} level={level} />
      ))}
    </Map>
  );
};

export default KakaoMap;
