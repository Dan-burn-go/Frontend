import { useRef, useState } from 'react';

interface Options {
  threshold?: number;
  onDismiss: () => void;
}

// 바텀시트 등에서 "아래로 끌어 닫기" 제스처를 처리. dragY는 현재 드래그 오프셋(px)으로
// 호출 측에서 transform에 반영하면 손가락에 즉시 따라붙고, 손을 떼는 시점에 threshold를
// 넘었으면 onDismiss 호출, 안 넘었으면 0으로 스냅백.
//
// dragY는 state와 ref 둘 다 들고 있다: state는 transform 리렌더용, ref는 onTouchEnd가
// 빠른 스와이프 상황(touchmove→touchend가 React 리렌더 사이에 일어남)에서도 최신 값을
// 읽도록 보장하기 위한 것. ref 없이 state만 읽으면 stale 값을 보고 dismiss 누락 가능.
export const useSwipeDown = ({ threshold = 80, onDismiss }: Options) => {
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
      if (dy > 0) updateDragY(dy);
    },
    onTouchEnd: () => {
      if (dragYRef.current > threshold) onDismiss();
      updateDragY(0);
      startYRef.current = null;
    },
  };

  return { dragY, touchHandlers };
};
