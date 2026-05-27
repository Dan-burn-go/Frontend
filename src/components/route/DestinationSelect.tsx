import { useMemo, useState } from 'react';
import { Navigation, X } from 'lucide-react';
import { LOCATION_MAP, searchLocationsByName } from '../../data/locations';
import { CATEGORY_NAMES } from '../../data/categories';

const MAX_RESULTS = 8;

interface Props {
  value: string | null; // areaCode
  onChange: (areaCode: string | null) => void;
}

const DestinationSelect = ({ value, onChange }: Props) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchLocationsByName(query).slice(0, MAX_RESULTS);
  }, [query]);

  const selectedLocation = value ? LOCATION_MAP.get(value) : null;

  const handleSelect = (areaCode: string) => {
    onChange(areaCode);
    setQuery('');
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-lg ring-1 ring-transparent focus-within:bg-white focus-within:ring-slate-900/10 transition-all">
        <Navigation className="size-4 text-slate-400 shrink-0" strokeWidth={1.75} />
        {selectedLocation ? (
          <span className="flex-1 text-sm text-slate-900 truncate">{selectedLocation.name}</span>
        ) : (
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            placeholder="핫플레이스 검색"
            aria-label="도착지 선택"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        )}
        {selectedLocation && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="도착지 지우기"
            className="cursor-pointer p-0.5 hover:bg-slate-200/60 rounded transition-colors"
          >
            <X className="size-4 text-slate-400" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {open && !selectedLocation && query.trim() && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-lg ring-1 ring-slate-900/5 overflow-hidden z-10"
        >
          {results.length > 0 ? (
            <ul className="py-1 max-h-72 overflow-y-auto">
              {results.map((loc) => (
                <li key={loc.areaCode}>
                  <button
                    type="button"
                    onClick={() => handleSelect(loc.areaCode)}
                    className="cursor-pointer w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3"
                  >
                    <span className="text-sm font-medium text-slate-900 truncate">{loc.name}</span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {CATEGORY_NAMES[loc.category]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-3.5 py-3 text-sm text-slate-400">검색 결과가 없어요</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DestinationSelect;
