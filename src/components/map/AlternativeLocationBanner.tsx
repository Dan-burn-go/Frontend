import { Sparkles, X } from 'lucide-react';

interface Props {
  sourceName: string;
  count: number;
  onClose: () => void;
}

const AlternativeLocationBanner = ({ sourceName, count, onClose }: Props) => {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-9999 flex items-center gap-3 bg-white rounded-full px-3 py-2 shadow-md whitespace-nowrap">
      <div className="flex items-center gap-2 pl-2 text-sm text-gray-700">
        <Sparkles size={14} className="text-blue-500 shrink-0" />
        <span>
          {sourceName}의 대체지역 <span className="text-blue-500 font-bold">{count}곳</span>
        </span>
      </div>
      <div className="w-px h-5 bg-gray-200 shrink-0" />
      <button
        onClick={onClose}
        className="cursor-pointer flex items-center gap-1.5 px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-full transition-colors"
      >
        <X size={13} />
        끄기
      </button>
    </div>
  );
};

export default AlternativeLocationBanner;
