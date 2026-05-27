import { useEffect, useRef, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { waitForKakao } from '../../utils/kakaoSdk';

const SEARCH_DEBOUNCE_MS = 250;
const MAX_RESULTS = 6;

export interface OriginSelection {
  label: string;
  lat: number;
  lng: number;
}

interface Props {
  value: OriginSelection | null;
  onChange: (next: OriginSelection | null) => void;
}

const OriginSearchInput = ({ value, onChange }: Props) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<kakao.maps.services.PlacesSearchResultItem[]>([]);
  const [open, setOpen] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const placesRef = useRef<kakao.maps.services.Places | null>(null);

  // SDK 준비되면 Places 인스턴스를 한 번만 생성해 재사용.
  // sdkReady state를 함께 올려, SDK 로드보다 사용자 입력이 빨라도 첫 검색이 silent fail하지 않도록
  // 아래 search effect가 sdkReady 변경 시 재실행되어 pending query를 처리한다.
  useEffect(() => {
    waitForKakao(() => {
      const Places = window.kakao?.maps?.services?.Places;
      if (Places) {
        placesRef.current = new Places();
        setSdkReady(true);
      }
    });
  }, []);

  // 디바운스: 입력이 멈춘 뒤에만 검색 호출. 빈 쿼리는 effect 자체를 skip하고
  // 표시 시점에 derive(query 비면 빈 배열 표시)하여 동기 setState를 피한다.
  // active flag로 언마운트/dep 변경 후 kakao 콜백이 stale setState 호출하는 것 차단.
  useEffect(() => {
    if (!query.trim() || value || !sdkReady) return;
    let active = true;
    const timer = window.setTimeout(() => {
      if (!active) return;
      const places = placesRef.current;
      if (!places) return;
      places.keywordSearch(query, (data, status) => {
        if (!active) return;
        const ok = window.kakao?.maps?.services?.Status?.OK;
        setResults(status === ok ? data.slice(0, MAX_RESULTS) : []);
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, value, sdkReady]);

  const visibleResults = query.trim() && !value ? results : [];

  const handleSelect = (item: kakao.maps.services.PlacesSearchResultItem) => {
    onChange({
      label: item.place_name,
      lat: Number(item.y),
      lng: Number(item.x),
    });
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-50 rounded-lg ring-1 ring-transparent focus-within:bg-white focus-within:ring-slate-900/10 transition-all">
        <MapPin className="size-4 text-slate-400 shrink-0" strokeWidth={1.75} />
        {value ? (
          <span className="flex-1 text-sm text-slate-900 truncate">{value.label}</span>
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
            placeholder="장소 또는 주소"
            aria-label="출발지 검색"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        )}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="출발지 지우기"
            className="cursor-pointer p-0.5 hover:bg-slate-200/60 rounded transition-colors"
          >
            <X className="size-4 text-slate-400" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {open && !value && query.trim() && (
        <div
          onMouseDown={(e) => e.preventDefault()}
          className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-lg ring-1 ring-slate-900/5 overflow-hidden z-10"
        >
          {visibleResults.length > 0 ? (
            <ul className="py-1 max-h-72 overflow-y-auto">
              {visibleResults.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="cursor-pointer w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.place_name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {item.road_address_name || item.address_name}
                    </p>
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

export default OriginSearchInput;
