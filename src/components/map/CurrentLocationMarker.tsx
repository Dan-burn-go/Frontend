import { CustomOverlayMap } from 'react-kakao-maps-sdk';

interface Props {
  latitude: number;
  longitude: number;
}

const COLOR = '#3b82f6';

const CurrentLocationMarker = ({ latitude, longitude }: Props) => (
  <CustomOverlayMap position={{ lat: latitude, lng: longitude }} yAnchor={0.5} zIndex={6}>
    <div className="relative flex items-center justify-center">
      <span
        className="absolute animate-ping rounded-full opacity-30"
        style={{ backgroundColor: COLOR, width: 28, height: 28 }}
      />
      <span
        className="rounded-full border-2 border-white"
        style={{
          backgroundColor: COLOR,
          width: 16,
          height: 16,
          boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  </CustomOverlayMap>
);

export default CurrentLocationMarker;
