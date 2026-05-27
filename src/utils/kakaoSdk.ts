const SDK_WAIT_INTERVAL_MS = 100;
const SDK_WAIT_MAX_TRIES = 30; // 100ms × 30 = 3초

/**
 * window.kakao SDK가 로드될 때까지 대기 후 kakao.maps.load 콜백으로 라이브러리 준비를 보장한다.
 * services 라이브러리는 index.html의 SDK URL에 &libraries=services가 포함돼 있어야 함.
 * 최대 시도 횟수 초과 시 onError를 호출해 무한 로딩 상태를 방지한다 (선택).
 */
export const waitForKakao = (cb: () => void, onError?: () => void): void => {
  let tries = 0;
  const tick = () => {
    if (typeof window.kakao?.maps?.load === 'function') {
      window.kakao.maps.load(cb);
      return;
    }
    if (tries >= SDK_WAIT_MAX_TRIES) {
      onError?.();
      return;
    }
    tries += 1;
    window.setTimeout(tick, SDK_WAIT_INTERVAL_MS);
  };
  tick();
};
