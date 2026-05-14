import { MapPin } from 'lucide-react';

interface MarkerPinProps {
  color: string;
  size: number;
}

const MarkerPin = ({ color, size }: MarkerPinProps) => (
  <>
    <div
      className="flex items-center justify-center rounded-full border-[3px] border-white"
      style={{ backgroundColor: color, width: size * 0.85, height: size * 0.85 }}
    >
      <MapPin size={size * 0.38} color="white" strokeWidth={2.5} />
    </div>
    <div
      className="-mt-px"
      style={{
        width: 0,
        height: 0,
        borderLeft: `${size * 0.15}px solid transparent`,
        borderRight: `${size * 0.15}px solid transparent`,
        borderTop: `${size * 0.35}px solid ${color}`,
      }}
    />
  </>
);

export default MarkerPin;
