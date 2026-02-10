import React from 'react';

interface FilterSortHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  placeholder: string;
  className?: string;
}

const FilterSortHeader: React.FC<FilterSortHeaderProps> = ({
  searchTerm,
  onSearchChange,
  sortField,
  sortOrder,
  onSortChange,
  placeholder,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 ${className}`}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="border border-[#1827a0] border-opacity-50 rounded-lg px-4 py-2.5 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-all duration-200"
      />
      <select
        value={`${sortField}:${sortOrder}`}
        onChange={(e) => {
          const [field, order] = e.target.value.split(':');
          onSortChange(field);
        }}
        className="border border-[#1827a0] border-opacity-50 rounded-lg px-4 py-2.5 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-all duration-200"
      >
        <option value="check_in_time:desc">Sort by Newest</option>
        <option value="check_in_time:asc">Sort by Oldest</option>
        <option value="first_name:asc">Sort by Name A-Z</option>
        <option value="first_name:desc">Sort by Name Z-A</option>
        <option value="pass_type:asc">Sort by Pass Type</option>
      </select>
    </div>
  );
};

export default FilterSortHeader;