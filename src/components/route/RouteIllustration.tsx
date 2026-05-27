/**
 * 출발지 → 도착지를 잇는 작은 곡선 일러스트. 빈 상태(empty/idle)에서 시각적 무게를 더해
 * 페이지가 비어 보이지 않게 한다. 출발=하늘색 핀, 도착=어두운 핀으로 색상 위계 분리.
 */
interface Props {
  className?: string;
}

const RouteIllustration = ({ className }: Props) => (
  <svg viewBox="0 0 160 56" fill="none" className={className} aria-hidden="true">
    {/* Origin pin (sky) */}
    <circle cx="18" cy="36" r="14" fill="#38BDF8" opacity="0.12" />
    <circle cx="18" cy="36" r="7" fill="#0EA5E9" />
    <circle cx="18" cy="36" r="3" fill="white" />

    {/* Dotted curve */}
    <path
      d="M 28 36 Q 80 -4 132 36"
      stroke="#CBD5E1"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeDasharray="2 5"
    />

    {/* Destination pin (slate) */}
    <circle cx="142" cy="36" r="14" fill="#0F172A" opacity="0.08" />
    <circle cx="142" cy="36" r="7" fill="#0F172A" />
    <circle cx="142" cy="36" r="3" fill="white" />
  </svg>
);

export default RouteIllustration;
