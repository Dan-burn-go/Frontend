import { useRef, useState } from 'react';

interface Options {
  threshold?: number;
  // false면 가벼운 탭은 닫기로 처리하지 않음. 시트 본체 전체에 핸들러를 붙일 때 본문 탭이 닫기로 오판되는 걸 방지.
  dismissOnTap?: boolean;
  // 이 거리(px)를 손가락이 넘기 전까지는 드래그를 시작하지 않음. 미세 떨림으로 시트가 출렁이고
  // 자식 버튼 클릭이 취소되는 걸 막기 위한 dead zone. 시트 본체 전체에 핸들러를 붙일 때 의미가 큼.
  activationDistance?: number;
  onDismiss: () => void;
}

const TAP_SLOP = 5;
// data-swipe-allow가 붙은 인터랙티브 요소(예: 핸들 바)는 스와이프 시작점을 무시하지 않음.
const INTERACTIVE_SELECTOR =
  'button:not([data-swipe-allow]), a:not([data-swipe-allow]), [role="button"]:not([data-swipe-allow]), input, textarea, select';

// state와 ref를 같이 들고 있는 이유: 빠른 스와이프에서 touchmove → touchend가 React
// 리렌더 사이에 일어나면 state 기반 closure는 stale 값을 보게 됨. ref로 항상 최신 값 읽음.
export const useSwipeDown = ({
  threshold = 80,
  dismissOnTap = true,
  activationDistance = 8,
  onDismiss,
}: Options) => {
  const [dragY, setDragY] = useState(0);
  const dragYRef = useRef(0);
  const startYRef = useRef<number | null>(null);
  const activatedRef = useRef(false);

  const updateDragY = (value: number) => {
    dragYRef.current = value;
    setDragY(value);
  };

  const touchHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      // 인터랙티브 자식 위에서 시작한 터치는 무시 — 버튼 탭 의도를 드래그로 오인하지 않기 위해.
      const target = e.target as Element | null;
      if (target && target.closest(INTERACTIVE_SELECTOR)) return;
      startYRef.current = e.touches[0].clientY;
      activatedRef.current = false;
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (startYRef.current == null) return;
      const dy = e.touches[0].clientY - startYRef.current;
      if (!activatedRef.current) {
        if (dy <= activationDistance) return;
        activatedRef.current = true;
      }
      // 활성화 직후 시트가 activationDistance만큼 점프하지 않도록 빼주고 따라옴.
      updateDragY(Math.max(0, dy - activationDistance));
    },
    onTouchEnd: () => {
      // touchstart 없이 touchend만 들어오는 엣지(멀티터치 간섭 등)에서 dragYRef=0이
      // tap으로 오판돼 의도치 않게 onDismiss가 호출되는 것 방지.
      if (startYRef.current == null) return;
      const movement = dragYRef.current;
      const isTap = !activatedRef.current && movement < TAP_SLOP;
      const passedThreshold = movement > threshold;
      if ((dismissOnTap && isTap) || passedThreshold) onDismiss();
      updateDragY(0);
      startYRef.current = null;
      activatedRef.current = false;
    },
  };

  return { dragY, touchHandlers };
};
