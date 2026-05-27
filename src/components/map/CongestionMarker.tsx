import { useNavigate } from 'react-router-dom';
import { CustomOverlayMap } from 'react-kakao-maps-sdk';
import { X } from 'lucide-react';
import { CONGESTION_COLORS, CONGESTION_LABELS } from '../../types/congestion';
import { CATEGORY_NAMES } from '../../data/categories';
import { useOneShotPulse } from '../../hooks/useOneShotPulse';
import MarkerPin from './MarkerPin';
import { calcMarkerSize } from './markerUtils';
import type { PlaceMarker } from '../../types/congestion';

interface CongestionMarkerProps {
  marker: PlaceMarker;
  level: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onAlternativeRequest: (marker: PlaceMarker) => void;
  bounceNonce?: number | null;
}

const CongestionMarker = ({
  marker,
  level,
  isOpen,
  onOpen,
  onClose,
  onAlternativeRequest,
  bounceNonce,
}: CongestionMarkerProps) => {
  const navigate = useNavigate();
  const color = CONGESTION_COLORS[marker.congestionLevel];
  const position = { lat: marker.latitude, lng: marker.longitude };
  const size = calcMarkerSize(level);
  const avgPeople = Math.round((marker.minPeopleCount + marker.maxPeopleCount) / 2);

  // 검색 선택 시 한 번만 튀도록: 줌 등 리렌더에서는 재생 안 함
  const { active: shouldBounce, onAnimationEnd: handleBounceEnd } = useOneShotPulse(bounceNonce);

  return (
    <>
      {!isOpen && (
        <CustomOverlayMap position={position} yAnchor={1}>
          <div
            className={`cursor-pointer flex flex-col items-center hover:scale-110 active:scale-95 transition-transform ${
              shouldBounce ? 'marker-bounce' : ''
            }`}
            style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.3))' }}
            onClick={onOpen}
            onAnimationEnd={handleBounceEnd}
          >
            <MarkerPin color={color} size={size} />
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
                  onClick={onClose}
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
                {marker.congestionLevel !== 'QUIET' && (
                  <button
                    onClick={() => onAlternativeRequest(marker)}
                    className="cursor-pointer w-full py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                  >
                    대체지역 추천
                  </button>
                )}
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
