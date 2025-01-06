import { format, subMonths } from 'date-fns';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface TransactionFiltersProps {
  categories: Category[];
  selectedCategory: number | null;
  selectedMonth: number;
  selectedYear: number;
  onCategoryChange: (categoryId: number | null) => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const TransactionFilters = ({ 
  categories, 
  selectedCategory, 
  selectedMonth,
  selectedYear,
  onCategoryChange,
  onMonthChange,
  onYearChange
}: TransactionFiltersProps) => {
  // Generate last 12 months as options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      label: format(date, 'MMMM yyyy'),
      month: date.getMonth() + 1,
      year: date.getFullYear()
    };
  });

  const handleDateChange = (value: string) => {
    const [month, year] = value.split('-').map(Number);
    onMonthChange(month);
    onYearChange(year);
  };

  return (
    <div className="mb-6 grid grid-cols-2 gap-4">
      <select
        className="block w-full rounded-lg border border-gray-300 px-3 py-2"
        value={selectedCategory || ''}
        onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.icon} {category.name}
          </option>
        ))}
      </select>

      <select
        className="block w-full rounded-lg border border-gray-300 px-3 py-2"
        value={`${selectedMonth}-${selectedYear}`}
        onChange={(e) => handleDateChange(e.target.value)}
      >
        {monthOptions.map(({ label, month, year }) => (
          <option key={`${month}-${year}`} value={`${month}-${year}`}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};
  