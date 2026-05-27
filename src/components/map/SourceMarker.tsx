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
        className="cursor-pointer flex flex-col items-center hover:scale-105 active:scale-95 transition-transform duration-200"
        style={{
          filter:
            'drop-shadow(0 1px 2px rgba(0,0,0,0.12)) drop-shadow(0 6px 14px rgba(15,23,42,0.18))',
        }}
        onClick={() => navigate(`/place/${marker.areaCode}`, { state: { marker } })}
      >
        <div className="relative flex flex-col items-center">
          {/* 단일 펄스 — 강조는 형태가 아니라 움직임으로 */}
          <span
            className="absolute animate-ping rounded-full"
            style={{
              backgroundColor: color,
              opacity: 0.22,
              width: size * 1.1,
              height: size * 1.1,
              top: -size * 0.1,
              left: '50%',
              transform: 'translateX(-50%)',
              animationDuration: '2.4s',
            }}
          />
          <MarkerPin color={color} size={size} />
        </div>
        <div className="mt-1.5 flex flex-col items-center gap-1">
          <span
            className="inline-flex items-center text-[10px] font-semibold rounded-full px-2.5 py-0.5 text-white whitespace-nowrap"
            style={{
              backgroundColor: '#0f172a',
              letterSpacing: '0.04em',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.25)',
            }}
          >
            선택한 장소
          </span>
          <MarkerLabel color={color} name={marker.name} size={size} />
        </div>
      </div>
    </CustomOverlayMap>
  );
};

export default SourceMarker;
