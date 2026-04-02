import { Map } from 'react-kakao-maps-sdk';

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_LEVEL = 7;

const KakaoMap = () => {
  return (
    <Map
      center={DEFAULT_CENTER}
      style={{ width: '100%', height: '100dvh' }}
      level={DEFAULT_LEVEL}
    />
  );
};

export default KakaoMap;
