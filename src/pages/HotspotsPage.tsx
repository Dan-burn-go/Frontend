import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
  Search,
  Sparkles,
  Coffee,
  ShoppingBag,
  Trees,
  Landmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Header from '../components/layout/Header';
import { getLocationImageUrl } from '../data/locations';
import { CATEGORY_NAMES } from '../data/categories';
import { useHotspotsFilter } from '../hooks/useHotspotsFilter';
import type { FilterCategory } from '../hooks/useHotspotsFilter';

const CATEGORY_FILTERS: { value: FilterCategory; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Sparkles },
  { value: 'cafe', label: 'Cafe', icon: Coffee },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { value: 'park', label: 'Park', icon: Trees },
  { value: 'culture', label: 'Culture', icon: Landmark },
];

const HotspotsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('q') ?? '');
  const isComposing = useRef(false);

  const {
    activeCategory,
    currentPage,
    totalPages,
    filteredCount,
    paged,
    pageNumbers,
    commitSearch,
    handleCategory,
    handlePage,
  } = useHotspotsFilter(inputValue);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isComposing.current) commitSearch(e.target.value);
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false;
    commitSearch(e.currentTarget.value);
  };

  return (
    <div className="flex flex-col w-full min-h-dvh bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={22} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">서울 핫플레이스</h1>
            </div>
            <p className="text-base text-gray-500">
              서울 주요 핫플레이스{' '}
              <span className="text-blue-600 font-medium">{filteredCount}곳</span>의 정보를
              제공합니다
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-green-500 font-medium mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            실시간
          </div>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={inputValue}
            onChange={handleSearchChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="핫플레이스 검색..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 transition-colors"
          />
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {CATEGORY_FILTERS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => handleCategory(value)}
              className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {filteredCount === 0 ? (
          <div className="text-center py-20 text-gray-400">검색 결과가 없습니다</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map((loc) => (
                <button
                  key={loc.areaCode}
                  type="button"
                  onClick={() => navigate(`/place/${loc.areaCode}`)}
                  className="text-left cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative bg-gray-100">
                    <img
                      src={getLocationImageUrl(loc.name)}
                      alt={loc.name}
                      className="w-full h-52 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.visibility = 'hidden';
                      }}
                    />
                    <span className="absolute top-3 left-3 bg-white/90 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {CATEGORY_NAMES[loc.category]}
                    </span>
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">{loc.name}</h2>
                    <span className="text-sm text-blue-500 font-medium">
                      #{CATEGORY_NAMES[loc.category]}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-10">
                <button
                  type="button"
                  onClick={() => handlePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="cursor-pointer p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                {pageNumbers.map((page, i) =>
                  page === null ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="w-9 h-9 inline-flex items-center justify-center text-gray-400"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePage(page)}
                      className={`cursor-pointer w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => handlePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer p-2 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-gray-400 text-center mt-12">
          이미지 출처: 서울 실시간 도시데이터 (공공누리 제1유형)
        </p>
      </div>
    </div>
  );
};

export default HotspotsPage;
