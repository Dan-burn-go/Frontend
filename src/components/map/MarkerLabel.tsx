interface MarkerLabelProps {
  color: string;
  name: string;
  size: number;
}

const MarkerLabel = ({ color, name, size }: MarkerLabelProps) => (
  <div
    className="inline-flex items-center bg-white rounded-full whitespace-nowrap"
    style={{
      fontSize: `${Math.max(11, size * 0.3)}px`,
      padding: '4px 12px 4px 10px',
      gap: 7,
      boxShadow:
        '0 1px 2px rgba(15, 23, 42, 0.05), 0 4px 14px rgba(15, 23, 42, 0.09), inset 0 0 0 1px rgba(15, 23, 42, 0.04)',
    }}
  >
    <span
      className="shrink-0"
      style={{
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: color,
      }}
    />
    <span className="font-semibold text-gray-900 tracking-tight">{name}</span>
  </div>
);

export default MarkerLabel;
