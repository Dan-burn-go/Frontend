import { useCallback, useState } from 'react';

/**
 * 외부에서 전달된 nonce가 바뀔 때마다 한 번씩만 펄스 애니메이션이 재생되도록
 * "활성 여부"와 "애니메이션 종료 핸들러"를 반환한다.
 *
 * 사용 예:
 *   const { active, onAnimationEnd } = useOneShotPulse(focusNonce);
 *   <div className={active ? 'some-pulse-class' : ''} onAnimationEnd={onAnimationEnd} />
 *
 * 줌·드래그 등으로 부모가 리렌더되거나 DOM이 reattach되어도 이미 완료된 nonce는
 * 다시 재생되지 않는다. 새 nonce가 들어오면 다시 1회 재생한다.
 */
export const useOneShotPulse = (nonce: number | null | undefined) => {
  const [finishedNonce, setFinishedNonce] = useState<number | null>(null);
  const active = nonce != null && nonce !== finishedNonce;
  const onAnimationEnd = useCallback(() => {
    setFinishedNonce(nonce ?? null);
  }, [nonce]);
  return { active, onAnimationEnd };
};
