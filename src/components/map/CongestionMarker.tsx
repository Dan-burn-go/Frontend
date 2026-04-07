import { useState } from 'react';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { MapPin } from 'lucide-react';
import { CONGESTION_COLORS } from '../../types/congestion';
import type { PlaceMarker } from '../../types/congestion';

interface CongestionMarkerProps {
  marker: PlaceMarker;
  level: number;
}

const BASE_LEVEL = 7;
const BASE_SIZE = 32;

const CongestionMarker = ({ marker, level }: CongestionMarkerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const color = CONGESTION_COLORS[marker.congestionLevel];
  const position = { lat: marker.latitude, lng: marker.longitude };
  const scale = Math.max(0.5, Math.min(2.5, 1 + (BASE_LEVEL - level) * 0.2));
  const size = Math.round(BASE_SIZE * scale);

  return (
    <>
      <CustomOverlayMap position={position} yAnchor={1}>
        <div
          className="cursor-pointer flex flex-col items-center hover:scale-110 active:scale-95 transition-transform"
          style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))' }}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <div
            className="flex items-center justify-center rounded-full border-[3px] border-white"
            style={{ backgroundColor: color, width: size * 0.85, height: size * 0.85 }}
          >
            <MapPin size={size * 0.38} color="white" strokeWidth={2.5} />
          </div>
          <div
            className="-mt-px"
            style={{
              width: 0,
              height: 0,
              borderLeft: `${size * 0.15}px solid transparent`,
              borderRight: `${size * 0.15}px solid transparent`,
              borderTop: `${size * 0.35}px solid ${color}`,
            }}
          />
        </div>
      </CustomOverlayMap>
      {isOpen && (
        <CustomOverlayMap position={position} yAnchor={1.6}>
          <div className="bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100 text-sm whitespace-nowrap">
            <p className="font-semibold text-gray-800">{marker.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{marker.congestionLevel}</p>
          </div>
        </CustomOverlayMap>
      )}
    </>
  );
};

export default CongestionMarker;
