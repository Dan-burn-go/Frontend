import { useRef, useState } from 'react';

interface Options {
  threshold?: number;
  // false면 가벼운 탭은 닫기로 처리하지 않음. 시트 본체 전체에 핸들러를 붙일 때 본문 탭이 닫기로 오판되는 걸 방지.
  dismissOnTap?: boolean;
  onDismiss: () => void;
}

const TAP_SLOP = 5;

// state와 ref를 같이 들고 있는 이유: 빠른 스와이프에서 touchmove → touchend가 React
// 리렌더 사이에 일어나면 state 기반 closure는 stale 값을 보게 됨. ref로 항상 최신 값 읽음.
export const useSwipeDown = ({ threshold = 80, dismissOnTap = true, onDismiss }: Options) => {
  const [dragY, setDragY] = useState(0);
  const dragYRef = useRef(0);
  const startYRef = useRef<number | null>(null);

  const updateDragY = (value: number) => {
    dragYRef.current = value;
    setDragY(value);
  };

  const touchHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      startYRef.current = e.touches[0].clientY;
    },
    onTouchMove: (e: React.TouchEvent) => {
      if (startYRef.current == null) return;
      const dy = e.touches[0].clientY - startYRef.current;
      updateDragY(Math.max(0, dy));
    },
    onTouchEnd: () => {
      // touchstart 없이 touchend만 들어오는 엣지(멀티터치 간섭 등)에서 dragYRef=0이
      // tap으로 오판돼 의도치 않게 onDismiss가 호출되는 것 방지.
      if (startYRef.current == null) return;
      const movement = dragYRef.current;
      const isTap = movement < TAP_SLOP;
      const passedThreshold = movement > threshold;
      if ((dismissOnTap && isTap) || passedThreshold) onDismiss();
      updateDragY(0);
      startYRef.current = null;
    },
  };

  return { dragY, touchHandlers };
};
