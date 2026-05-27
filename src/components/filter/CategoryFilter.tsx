import { CATEGORY_FILTERS } from '../../data/categories';

interface CategoryFilterProps {
  selected: string;
  onSelect: (id: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="absolute top-4 inset-x-4 z-10 flex justify-center">
      <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1.5 shadow-md overflow-x-auto max-w-full w-fit">
        {CATEGORY_FILTERS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium tracking-tight transition-colors ${
              selected === id
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
            }`}
          >
            <Icon size={15} weight="fill" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
