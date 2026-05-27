import { useRef, useState } from 'react';

interface Options {
  threshold?: number;
  onDismiss: () => void;
}

const TAP_SLOP = 5;

// 바텀시트 등에서 "아래로 끌어 닫기" 제스처를 처리.
// - dragY: 현재 드래그 오프셋(px). 호출 측이 transform에 반영하면 손가락을 따라옴
// - 손가락이 시작점보다 위로 가도 0으로 클램프해 시트가 시작 위치 위로 솟지 않게 함
// - touchEnd 시 이동량이 TAP_SLOP 미만이면 탭으로 판정해 onDismiss
// - 이동량이 threshold를 넘으면 드래그-닫기로 onDismiss
// - 그 사이(부분 드래그)면 0으로 스냅백
//
// state와 ref를 같이 들고 있는 이유: 빠른 스와이프에서 touchmove → touchend가 React
// 리렌더 사이에 일어나면 state 기반 closure는 stale 값을 보게 됨. ref로 항상 최신 값 읽음.
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
      updateDragY(Math.max(0, dy));
    },
    onTouchEnd: () => {
      const movement = dragYRef.current;
      const isTap = movement < TAP_SLOP;
      const passedThreshold = movement > threshold;
      if (isTap || passedThreshold) onDismiss();
      updateDragY(0);
      startYRef.current = null;
    },
  };

  return { dragY, touchHandlers };
};
