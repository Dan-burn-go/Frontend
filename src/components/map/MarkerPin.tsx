import { useId } from 'react';

interface MarkerPinProps {
  color: string;
  size: number;
}

// 단일 채널 톤 다운 — 미묘한 깊이감만 주기 위한 최소한의 조정
const darken = (hex: string, amount: number) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;
  const adj = (c: number) => Math.max(0, Math.round(c * (1 - amount)));
  return `#${[adj(r), adj(g), adj(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
};

const MarkerPin = ({ color, size }: MarkerPinProps) => {
  const rid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `mp-${rid}`;

  const bottom = darken(color, 0.12);

  const h = size * 1.18;
  const w = h * (40 / 52);

  return (
    <svg width={w} height={h} viewBox="0 0 40 52" style={{ overflow: 'visible' }}>
      <defs>
        {/* 형태감만 살짝 부여하는 거의 안 보이는 톤 변화 */}
        <linearGradient id={gradId} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={bottom} />
        </linearGradient>
      </defs>

      {/* 핀 본체 + 화이트 stroke 일체 */}
      <path
        d="M20 2 C 30.5 2 38 9.5 38 19.5 C 38 30 28 38.5 20 50 C 12 38.5 2 30 2 19.5 C 2 9.5 9.5 2 20 2 Z"
        fill={`url(#${gradId})`}
        stroke="white"
        strokeWidth="2.25"
        strokeLinejoin="round"
      />

      {/* 안쪽 도트 — 단 하나 */}
      <circle cx="20" cy="19.5" r="5" fill="white" />
    </svg>
  );
};

export default MarkerPin;
