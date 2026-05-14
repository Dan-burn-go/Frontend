const BASE_LEVEL = 7;
const BASE_SIZE = 32;

export const calcMarkerSize = (level: number) =>
  Math.round(BASE_SIZE * Math.max(0.5, Math.min(2.5, 1 + (BASE_LEVEL - level) * 0.2)));
