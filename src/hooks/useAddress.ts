import { useEffect, useState } from 'react';
import { waitForKakao } from '../utils/kakaoSdk';

type State =
  | { status: 'loading' }
  | { status: 'success'; address: string }
  | { status: 'error' };

/**
 * lat/lng → "서울 성동구 성수동" 형태의 행정구역 주소를 조회한다.
 * 로딩/성공/실패 상태를 명시적으로 노출해 UI에서 silent 실패를 표시할 수 있다.
 */
export const useAddress = (latitude: number | null, longitude: number | null): State => {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    // 좌표가 없으면 즉시 error로 종결해 무한 loading 상태 방지
    if (latitude == null || longitude == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState({ status: 'error' });
      return;
    }

    // 다른 좌표로 이동했을 때 이전 주소가 잠깐 노출되는 stale 표시 방지
    setState({ status: 'loading' });
    waitForKakao(
      () => {
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
      },
      // SDK 로드 max 도달 시 — 더 이상 기다리지 않고 error로 노출
      () => {
        if (!cancelled) setState({ status: 'error' });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return state;
};
