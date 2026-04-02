import { Map } from 'react-kakao-maps-sdk';

const KakaoMap = () => {
  return (
    <Map
      center={{ lat: 37.5665, lng: 126.9780 }}
      style={{ width: '100%', height: '100vh' }}
      level={7}
    />
  );
};

export default KakaoMap;
