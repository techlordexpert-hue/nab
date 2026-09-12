import React from 'react';
import { Search, Frame, Sparkles, Smartphone, Layers, X } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCategory } from '../types.ts';

export const CategoryFilter: React.FC = () => {
  const { activeCategory, setActiveCategory, searchQuery, setSearchQuery } = useStore();

  const categories: { id: ProductCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Items', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'picture_frames', label: 'Picture Frames', icon: <Frame className="w-3.5 h-3.5" /> },
    { id: 'canvas_frames', label: 'Canvas Frames', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'custom_chains', label: 'Custom Chains', icon: <span className="text-xs">⛓️</span> },
    { id: 'phone_cases', label: 'Phone Cases', icon: <Smartphone className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          id="product-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search frames by size (10x12, 12x16...), ring, canvas..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-medium">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all border shrink-0 ${
                isActive
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
