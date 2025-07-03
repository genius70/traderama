
import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  etfCounts: Record<string, number>;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  etfCounts 
}) => {
  return (
    <div className="mb-6 w-full">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {category} ({etfCounts[category] || 0})
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
