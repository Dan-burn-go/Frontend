import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { searchLocationsByName } from '../../data/locations';

interface Props {
  onSelect: (areaCode: string) => void;
}

const MAX_RESULTS = 8;

const HomeSearch = ({ onSelect }: Props) => {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!value.trim()) return [];
    return searchLocationsByName(value).slice(0, MAX_RESULTS);
  }, [value]);

  const handleSelect = (areaCode: string) => {
    onSelect(areaCode);
    setValue('');
    setOpen(false);
  };

  return (
    <div className="hidden lg:block relative">
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-48 xl:w-64">
        <Search className="size-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              return;
            }
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && results.length > 0) {
              handleSelect(results[0].areaCode);
            }
          }}
          placeholder="장소 검색..."
          aria-label="장소 검색"
          className="bg-transparent outline-none text-sm w-full"
        />
      </div>

      {open && value.trim() && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden"
        >
          {results.length > 0 ? (
            <ul className="py-1 max-h-72 overflow-y-auto">
              {results.map((loc) => (
                <li key={loc.areaCode}>
                  <button
                    type="button"
                    onClick={() => handleSelect(loc.areaCode)}
                    className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {loc.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">검색 결과가 없어요</div>
          )}
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
