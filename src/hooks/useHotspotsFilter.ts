import { useSearchParams } from 'react-router-dom';
import { LOCATIONS } from '../data/locations';
import type { LocationCategory } from '../data/locations';

export type FilterCategory = LocationCategory | 'all';

const PAGE_SIZE = 12;

function getPageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const shown = new Set(
    [1, total, current, current - 1, current + 1].filter((p) => p >= 1 && p <= total),
  );
  const sorted = [...shown].sort((a, b) => a - b);

  const result: (number | null)[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push(null);
    result.push(sorted[i]);
  }
  return result;
}

export function useHotspotsFilter(searchValue: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') ?? 'all';
  const activeCategory: FilterCategory = ['cafe', 'shopping', 'park', 'culture'].includes(
    categoryParam,
  )
    ? (categoryParam as LocationCategory)
    : 'all';
  const pageParam = parseInt(searchParams.get('page') ?? '1', 10);

  const filtered = LOCATIONS.filter((loc) => {
    const matchesQuery = loc.name.toLowerCase().includes(searchValue.toLowerCase());
    const matchesCategory = activeCategory === 'all' || loc.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage =
    Number.isNaN(pageParam) || pageParam < 1 ? 1 : Math.min(pageParam, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const buildParams = (overrides: Record<string, string>) => {
    const params: Record<string, string> = {};
    if (searchValue) params.q = searchValue;
    if (activeCategory !== 'all') params.category = activeCategory;
    if (currentPage !== 1) params.page = String(currentPage);
    return { ...params, ...overrides };
  };

  const commitSearch = (value: string) => {
    const params: Record<string, string> = {};
    if (value) params.q = value;
    if (activeCategory !== 'all') params.category = activeCategory;
    setSearchParams(params, { replace: true });
  };

  const handleCategory = (value: FilterCategory) => {
    const params = buildParams({});
    delete params.page;
    if (value === 'all') delete params.category;
    else params.category = value;
    setSearchParams(params);
  };

  const handlePage = (page: number) => {
    const params = buildParams({ page: String(page) });
    if (page === 1) delete params.page;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    activeCategory,
    currentPage,
    totalPages,
    filteredCount: filtered.length,
    paged,
    pageNumbers: getPageNumbers(currentPage, totalPages),
    commitSearch,
    handleCategory,
    handlePage,
  };
}
