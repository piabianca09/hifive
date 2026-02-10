import React from 'react';

interface TagProps {
  label: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  onClose?: () => void;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ label, color = 'primary', onClose, className = '' }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'primary':
        return 'bg-gradient-to-r from-[#0c5ee5] to-[#0a4ec0] text-white shadow-md';
      case 'secondary':
        return 'bg-gradient-to-r from-[#e8e4d5] to-[#d4cec1] text-[#03034b] shadow-sm';
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md';
      default:
        return 'bg-gradient-to-r from-[#0c5ee5] to-[#0a4ec0] text-white shadow-md';
    }
  };

  return (
    <span 
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getColorClasses()} ${className}`}
    >
      {label}
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-2 text-white hover:text-gray-200 focus:outline-none rounded-full hover:bg-white hover:bg-opacity-20 p-0.5 transition-colors duration-200"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Tag;