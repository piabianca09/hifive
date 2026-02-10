import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '@/lib/types/customer';

interface AutocompleteProps {
  options: Customer[];
  onSelect: (customer: Customer) => void;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  stretch?: boolean;
  loading?: boolean;
  highlightId?: string;
  activeCustomerIds?: string[];
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  onSelect,
  placeholder,
  value,
  onChange,
  stretch = false,
  loading = false,
  highlightId,
  activeCustomerIds = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options based on input value
  const filteredOptions = options.filter(option =>
    option.first_name.toLowerCase().includes(value.toLowerCase()) ||
    option.last_name.toLowerCase().includes(value.toLowerCase()) ||
    `${option.first_name} ${option.last_name}`.toLowerCase().includes(value.toLowerCase()) ||
    option.affiliation.toLowerCase().includes(value.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (event.key === 'Enter' && highlightedIndex >= 0) {
        event.preventDefault();
        onSelect(filteredOptions[highlightedIndex]);
        setIsOpen(false);
        setHighlightedIndex(-1);
      } else if (event.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [highlightedIndex, filteredOptions, onSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleOptionClick = (option: Customer) => {
    onSelect(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className={`relative${stretch ? ' w-full' : ''}`} ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={`w-full border border-[#1827a0] border-opacity-50 rounded-lg px-3 py-2.5 bg-white text-[#03034b] focus:outline-none focus:ring-2 focus:ring-[#0c5ee5] focus:ring-opacity-50 focus:border-transparent shadow-sm transition-shadow duration-200 ${stretch ? 'w-full' : ''}`}
      />
      {loading && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <span className="inline-block w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
        </div>
      )}
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-[#1827a0] border-opacity-50 rounded-lg shadow-xl max-h-60 overflow-auto">
          {filteredOptions.map((option, index) => {
            const isHighlighted = (highlightId && option.id === highlightId) || index === highlightedIndex;
            const isActive = activeCustomerIds && activeCustomerIds.includes(option.id);
            return (
              <div
                key={option.id}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleOptionClick(option)}
                className={`px-4 py-3 cursor-pointer transition-colors duration-150 ${
                  isHighlighted
                    ? 'bg-gradient-to-r from-[#1827a0] to-[#0c5ee5] text-white'
                    : isActive
                      ? 'bg-yellow-100 text-yellow-900 opacity-60 cursor-not-allowed'
                      : 'hover:bg-[#f0f0f0]'
                }`}
                style={{ pointerEvents: isActive ? 'none' : 'auto' }}
              >
                <div className="font-medium no-underline">
                  {option.first_name} {option.last_name}
                  {isActive && <span className="ml-2 text-xs font-semibold text-yellow-700">(Active)</span>}
                </div>
                <div className="text-sm text-gray-600">{option.affiliation}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Autocomplete;