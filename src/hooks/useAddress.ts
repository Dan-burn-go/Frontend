import { useEffect, useState } from 'react';

type State =
  | { status: 'loading' }
  | { status: 'success'; address: string }
  | { status: 'error' };

const SDK_WAIT_INTERVAL_MS = 100;
const SDK_WAIT_MAX_TRIES = 30; // 100ms × 30 = 3초

/**
 * window.kakao SDK가 로드될 때까지 대기 후 kakao.maps.load 콜백으로 라이브러리 준비를 보장한다.
 * services 라이브러리는 index.html의 SDK URL에 &libraries=services가 포함돼 있어야 함.
 */
const waitForKakao = (cb: () => void) => {
  let tries = 0;
  const tick = () => {
    if (typeof window.kakao?.maps?.load === 'function') {
      window.kakao.maps.load(cb);
      return;
    }
    if (tries >= SDK_WAIT_MAX_TRIES) return;
    tries += 1;
    window.setTimeout(tick, SDK_WAIT_INTERVAL_MS);
  };
  tick();
};

/**
 * lat/lng → "서울 성동구 성수동" 형태의 행정구역 주소를 조회한다.
 * 로딩/성공/실패 상태를 명시적으로 노출해 UI에서 silent 실패를 표시할 수 있다.
 */
export const useAddress = (latitude: number | null, longitude: number | null): State => {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    if (latitude == null || longitude == null) return;
    let cancelled = false;

    // setState는 모두 비동기 콜백 안 (kakao.maps.load / Kakao 지오코더) — effect body 동기 호출 없음
    waitForKakao(() => {
      if (cancelled) return;
      const services = window.kakao?.maps?.services;
      if (!services) {
        setState({ status: 'error' });
        return;
      }

      new services.Geocoder().coord2Address(longitude, latitude, (result, status) => {
        if (cancelled) return;
        if (status === services.Status.OK && result.length > 0 && result[0].address) {
          const a = result[0].address;
          setState({
            status: 'success',
            address: `${a.region_1depth_name} ${a.region_2depth_name} ${a.region_3depth_name}`,
          });
        } else {
          setState({ status: 'error' });
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return state;
};
