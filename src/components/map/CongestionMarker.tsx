import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { MapPin, X } from 'lucide-react';
import { CONGESTION_COLORS, CONGESTION_LABELS } from '../../types/congestion';
import { CATEGORY_NAMES } from '../../data/categories';
import type { PlaceMarker } from '../../types/congestion';

interface CongestionMarkerProps {
  marker: PlaceMarker;
  level: number;
}

const BASE_LEVEL = 7;
const BASE_SIZE = 32;

const CongestionMarker = ({ marker, level }: CongestionMarkerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const color = CONGESTION_COLORS[marker.congestionLevel];
  const position = { lat: marker.latitude, lng: marker.longitude };
  const scale = Math.max(0.5, Math.min(2.5, 1 + (BASE_LEVEL - level) * 0.2));
  const size = Math.round(BASE_SIZE * scale);
  const avgPeople = Math.round((marker.minPeopleCount + marker.maxPeopleCount) / 2);

  return (
    <>
      {!isOpen && (
        <CustomOverlayMap position={position} yAnchor={1}>
          <div
            className="cursor-pointer flex flex-col items-center hover:scale-110 active:scale-95 transition-transform"
            style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))' }}
            onClick={() => setIsOpen(true)}
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
      )}

      {isOpen && (
        <CustomOverlayMap position={position} yAnchor={1} zIndex={10}>
          <div
            className="flex flex-col items-center"
            style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.15))' }}
          >
            <div className="bg-white rounded-2xl p-3 w-52">
              <div className="flex items-start justify-between mb-1.5">
                <p className="font-bold text-gray-900 text-sm">{marker.name}</p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="cursor-pointer text-gray-400 hover:text-gray-600 ml-2 shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex gap-1 mb-2">
                <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                  {`#${CATEGORY_NAMES[marker.category as keyof typeof CATEGORY_NAMES] ?? marker.category}`}
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">혼잡도</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: color }}
                  >
                    {CONGESTION_LABELS[marker.congestionLevel]}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">현재 인원</span>
                  <span className="text-sm font-bold text-gray-900">
                    {avgPeople.toLocaleString()}명
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  disabled
                  className="w-full py-2 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed"
                >
                  대체지역 추천 (준비 중)
                </button>
                <button
                  onClick={() => navigate(`/place/${marker.areaCode}`, { state: { marker } })}
                  className="cursor-pointer w-full py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
                >
                  상세 정보 보기
                </button>
              </div>
            </div>
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '10px solid white',
              }}
            />
          </div>
        </CustomOverlayMap>
      )}
    </>
  );
};

export default CongestionMarker;
