import {
  SparkleIcon,
  CoffeeIcon,
  ShoppingBagIcon,
  TreeIcon,
  BankIcon,
} from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import type { LocationCategory } from './locations';

export const CATEGORY_NAMES: Record<LocationCategory, string> = {
  cafe: '카페',
  shopping: '쇼핑',
  park: '공원',
  culture: '문화',
};

// 카테고리 필터: 'all' + 4개 분류. CategoryFilter(HomePage), HotspotsPage에서 공유
export type FilterCategory = LocationCategory | 'all';

export interface CategoryFilterItem {
  id: FilterCategory;
  label: string; // 영문 라벨 (UI 표시)
  Icon: Icon;
}

export const CATEGORY_FILTERS: ReadonlyArray<CategoryFilterItem> = [
  { id: 'all', label: 'All', Icon: SparkleIcon },
  { id: 'cafe', label: 'Cafe', Icon: CoffeeIcon },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingBagIcon },
  { id: 'park', label: 'Park', Icon: TreeIcon },
  { id: 'culture', label: 'Culture', Icon: BankIcon },
];
