import { Plus, Minus, LocateFixed } from 'lucide-react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
}

const MapControls = ({ onZoomIn, onZoomOut, onLocate }: MapControlsProps) => {
  return (
    <div className="absolute left-4 top-20 z-10 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        aria-label="확대"
        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50"
      >
        <Plus size={18} />
      </button>
      <button
        onClick={onZoomOut}
        aria-label="축소"
        className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-700 hover:bg-gray-50"
      >
        <Minus size={18} />
      </button>
      <button
        onClick={onLocate}
        aria-label="내 위치 찾기"
        className="w-10 h-10 bg-blue-500 rounded-lg shadow-md flex items-center justify-center text-white hover:bg-blue-600"
      >
        <LocateFixed size={18} />
      </button>
    </div>
  );
};

export default MapControls;
