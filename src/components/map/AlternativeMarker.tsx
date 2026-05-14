import { useNavigate } from 'react-router-dom';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import {
  CONGESTION_COLORS,
  CONGESTION_LEVEL_MAP,
  CONGESTION_COLOR_UNKNOWN,
} from '../../types/congestion';
import MarkerPin from './MarkerPin';
import MarkerLabel from './MarkerLabel';
import { calcMarkerSize } from './markerUtils';
import type { AlternativeLocation } from '../../types/map';

interface Props {
  location: AlternativeLocation;
  level: number;
}

const AlternativeMarker = ({ location, level }: Props) => {
  const navigate = useNavigate();
  const congestionLevel = CONGESTION_LEVEL_MAP[location.congestionLevel];
  const color = congestionLevel ? CONGESTION_COLORS[congestionLevel] : CONGESTION_COLOR_UNKNOWN;
  const position = { lat: location.latitude, lng: location.longitude };
  const size = calcMarkerSize(level);

  return (
    <CustomOverlayMap position={position} yAnchor={1}>
      <div
        className="cursor-pointer flex flex-col items-center hover:scale-110 active:scale-95 transition-transform"
        style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))' }}
        onClick={() => navigate(`/place/${location.areaCode}`)}
      >
        <MarkerPin color={color} size={size} />
        <div className="mt-1.5">
          <MarkerLabel color={color} name={location.locationName} size={size} />
        </div>
      </div>
    </CustomOverlayMap>
  );
};

export default AlternativeMarker;
