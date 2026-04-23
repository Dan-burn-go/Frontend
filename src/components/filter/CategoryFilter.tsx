import { Sparkles, Coffee, ShoppingBag, Trees, Landmark } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All', Icon: Sparkles },
  { id: 'cafe', label: 'Cafe', Icon: Coffee },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingBag },
  { id: 'park', label: 'Park', Icon: Trees },
  { id: 'culture', label: 'Culture', Icon: Landmark },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="absolute top-4 inset-x-4 z-10 flex justify-center">
      <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-md overflow-x-auto max-w-full w-fit">
      {CATEGORIES.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === id
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
          }`}
        >
          <Icon size={15} />
          <span>{label}</span>
        </button>
      ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
