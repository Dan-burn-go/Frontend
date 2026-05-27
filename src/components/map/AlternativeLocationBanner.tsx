import { SparkleIcon, XIcon } from '@phosphor-icons/react';

interface Props {
  sourceName: string;
  count: number;
  onClose: () => void;
}

const AlternativeLocationBanner = ({ sourceName, count, onClose }: Props) => {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-9999 flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full pl-5 pr-2 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.1)] border border-slate-200/60 whitespace-nowrap">
      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium tracking-tight">
        <SparkleIcon weight="fill" size={14} className="text-blue-600 shrink-0" />
        <span>
          {sourceName}의 대체지역
          <span className="ml-1.5 text-blue-600 font-extrabold tabular-nums">{count}</span>
          <span className="text-slate-500">곳</span>
        </span>
      </div>
      <button
        onClick={onClose}
        className="cursor-pointer flex items-center gap-1 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors"
      >
        <XIcon weight="bold" size={12} />
        끄기
      </button>
    </div>
  );
};

export default AlternativeLocationBanner;
