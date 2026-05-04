import { useEffect, useRef, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

const MARGIN = 20;
const MARGIN_TOP = 72;
const SCALE_MIN = 0.65;
const SCALE_REF_HEIGHT = 820;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export const useDraggable = (initialRatio: { x: number; y: number }) => {
  const [ratio, setRatio] = useState(initialRatio);
  const [cardSize, setCardSize] = useState({ width: 300, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const ref = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<{
    mouseX: number;
    mouseY: number;
    cardX: number;
    cardY: number;
  } | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const update = () => {
      if (el.offsetWidth > 0) setCardSize({ width: el.offsetWidth, height: el.offsetHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scale = Math.min(1, Math.max(SCALE_MIN, windowSize.h / SCALE_REF_HEIGHT));

  const position: Position = {
    x: clamp(ratio.x * windowSize.w, MARGIN, windowSize.w - cardSize.width * scale - MARGIN),
    y: clamp(ratio.y * windowSize.h, MARGIN_TOP, windowSize.h - cardSize.height * scale - MARGIN),
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    e.preventDefault();
    setIsDragging(true);
    dragOrigin.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      cardX: position.x,
      cardY: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      if (!dragOrigin.current || !ref.current) return;
      const { width, height } = ref.current.getBoundingClientRect();
      const newX = clamp(
        dragOrigin.current.cardX + (e.clientX - dragOrigin.current.mouseX),
        MARGIN,
        window.innerWidth - width - MARGIN,
      );
      const newY = clamp(
        dragOrigin.current.cardY + (e.clientY - dragOrigin.current.mouseY),
        MARGIN_TOP,
        window.innerHeight - height - MARGIN,
      );
      setRatio({ x: newX / window.innerWidth, y: newY / window.innerHeight });
    };

    const onMouseUp = () => {
      setIsDragging(false);
      dragOrigin.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging]);

  return { ref, position, scale, isDragging, handleMouseDown };
};
