const LEGEND = [
  { label: 'Q', fullLabel: 'QUIET', color: 'bg-green-500' },
  { label: 'M', fullLabel: 'MODERATE', color: 'bg-orange-400' },
  { label: 'B', fullLabel: 'BUSY', color: 'bg-yellow-400' },
  { label: 'C', fullLabel: 'CROWDED', color: 'bg-red-500' },
];

const CongestionLegend = () => {
  return (
    <div className="absolute bottom-6 left-4 md:left-auto md:right-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-gray-100">
      {LEGEND.map((item) => (
        <div key={item.label} className="flex items-center gap-1">
          <span className={`w-3 h-3 rounded-full ${item.color}`} />
          <span className="text-xs font-medium text-gray-700 md:hidden">{item.label}</span>
          <span className="hidden md:inline text-xs font-medium text-gray-700">{item.fullLabel}</span>
        </div>
      ))}
    </div>
  );
};

export default CongestionLegend;
