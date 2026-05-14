import { useNavigate } from 'react-router-dom';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { CONGESTION_COLORS } from '../../types/congestion';
import MarkerPin from './MarkerPin';
import MarkerLabel from './MarkerLabel';
import { calcMarkerSize } from './markerUtils';
import type { PlaceMarker } from '../../types/congestion';

interface Props {
  marker: PlaceMarker;
  level: number;
}

const SourceMarker = ({ marker, level }: Props) => {
  const navigate = useNavigate();
  const color = CONGESTION_COLORS[marker.congestionLevel];
  const position = { lat: marker.latitude, lng: marker.longitude };
  const size = calcMarkerSize(level);

  return (
    <CustomOverlayMap position={position} yAnchor={1} zIndex={5}>
      <div
        className="cursor-pointer flex flex-col items-center hover:scale-110 active:scale-95 transition-transform"
        style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))' }}
        onClick={() => navigate(`/place/${marker.areaCode}`, { state: { marker } })}
      >
        <div className="relative flex flex-col items-center">
          <div
            className="absolute animate-ping rounded-full opacity-20"
            style={{
              backgroundColor: color,
              width: size * 0.85 + 12,
              height: size * 0.85 + 12,
              top: -6,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
          <MarkerPin color={color} size={size} />
        </div>
        <div className="mt-1.5 flex flex-col items-center gap-1">
          <span className="text-[9px] text-white font-bold rounded-full px-2 py-0.5 bg-gray-700 whitespace-nowrap">
            선택한 장소
          </span>
          <MarkerLabel color={color} name={marker.name} size={size} />
        </div>
      </div>
    </CustomOverlayMap>
  );
};

export default SourceMarker;
