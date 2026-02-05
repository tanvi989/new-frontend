
import React, { useState } from 'react';
import EyeTestPopup from '../eyeTestPopup/EyeTestPopup';

// SVG Icons replacement for FontAwesome/MUI icons to maintain consistency with Tailwind and avoid extra dependencies
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

interface TableFillterWrapProps {
    onSearch: (query: string) => void;
}

const TableFillterWrap: React.FC<TableFillterWrapProps> = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      onSearch(query);
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
          {/* Search Bar */}
          <div className="relative w-full sm:max-w-[300px] flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2">
            <div className="p-2 text-[#2B7DCD]">
                <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search..."
              aria-label="Search..."
              value={searchQuery}
              onChange={handleChange}
              className="w-full py-2 bg-transparent border-none focus:outline-none text-sm font-medium text-[#1F1F1F]"
            />
          </div>
          
          {/* Filter Button */}
          <button type="button" className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-[#2B7DCD] transition-colors">
             <FilterIcon />
          </button>
        </div>
        
        <div className="w-full sm:w-auto text-right">
          <EyeTestPopup />
        </div>
      </div>
    );
  }

export default TableFillterWrap;
