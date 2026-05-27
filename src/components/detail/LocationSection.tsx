import { Map, CustomOverlayMap } from 'react-kakao-maps-sdk';
import { MapPinIcon } from '@phosphor-icons/react';
import { useAddress } from '../../hooks/useAddress';
import MarkerPin from '../map/MarkerPin';
import SectionHeader from './SectionHeader';

interface Props {
  latitude: number;
  longitude: number;
  color: string;
}

const LocationSection = ({ latitude, longitude, color }: Props) => {
  const addressState = useAddress(latitude, longitude);
  const addressText =
    addressState.status === 'success'
      ? addressState.address
      : addressState.status === 'loading'
        ? '위치 정보를 불러오는 중...'
        : '위치 정보를 가져올 수 없어요';

  return (
    <div>
      <div className="mb-4">
        <SectionHeader title="위치" />
        <p className="mt-2 text-sm text-slate-500 flex items-center gap-1.5">
          <MapPinIcon weight="fill" size={13} className="text-slate-400 shrink-0" />
          <span className="truncate">{addressText}</span>
        </p>
      </div>
      <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <Map
          center={{ lat: latitude, lng: longitude }}
          style={{ width: '100%', height: '260px' }}
          level={4}
        >
          <CustomOverlayMap position={{ lat: latitude, lng: longitude }} yAnchor={1}>
            <div
              className="flex flex-col items-center"
              style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))' }}
            >
              <MarkerPin color={color} size={36} />
            </div>
          </CustomOverlayMap>
        </Map>
      </div>
    </div>
  );
};

export default LocationSection;
