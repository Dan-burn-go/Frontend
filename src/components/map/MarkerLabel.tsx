interface MarkerLabelProps {
  color: string;
  name: string;
  size: number;
}

const MarkerLabel = ({ color, name, size }: MarkerLabelProps) => (
  <div
    className="flex items-center gap-1.5 bg-white rounded-full px-2.5 py-1 shadow-md whitespace-nowrap"
    style={{ fontSize: `${Math.max(10, size * 0.28)}px` }}
  >
    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
    <span className="font-semibold text-gray-800">{name}</span>
  </div>
);

export default MarkerLabel;
