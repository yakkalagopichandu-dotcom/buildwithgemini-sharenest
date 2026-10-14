import React from 'react';
import { Language } from '../i18n/translations';
import { 
  Check, 
  Utensils, 
  Wheat, 
  Apple, 
  Croissant, 
  Package, 
  Milk, 
  Shirt, 
  Bed, 
  Gamepad2, 
  BookOpen, 
  HeartHandshake,
  LucideIcon
} from 'lucide-react';

interface CategoryGridProps {
  categories: any[];
  onSelectCategory: (catId: string | null) => void;
  selectedCategory: string | null;
  lang: Language;
  t: any;
}

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  Wheat,
  Apple,
  Croissant,
  Package,
  Milk,
  Shirt,
  Bed,
  Gamepad2,
  BookOpen,
  HeartHandshake,
  restaurant: Utensils,
  grain: Wheat,
  nutrition: Apple,
  bakery_dining: Croissant,
  inventory_2: Package,
  water_drop: Milk,
  checkroom: Shirt,
  bed: Bed,
  toys: Gamepad2,
  menu_book: BookOpen,
  health_and_safety: HeartHandshake,
};

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onSelectCategory,
  selectedCategory,
  lang,
  t,
}) => {
  return (
    <div className="my-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider block mb-1">
            Community Guidelines & Surplus Types
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.whatCanYouDonate}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.whatCanYouDonateSubtitle}
          </p>
        </div>

        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3.5 py-1.5 rounded-full transition-colors w-fit flex items-center gap-1.5"
          >
            <span>{t.resetFilter}</span>
            <span className="text-slate-400 font-normal">({selectedCategory})</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {categories.map((c) => {
          // Compare against specific unique item ID (e.g. 'cooked-meals', 'rice-grains', 'clothes')
          const isSelected = selectedCategory === c.id;
          const displayName =
            lang === 'te' ? c.name_te || c.name : lang === 'hi' ? c.name_hi || c.name : c.name;
          
          const IconComponent = iconMap[c.icon] || Package;

          return (
            <div
              key={c.id}
              onClick={() => onSelectCategory(isSelected ? null : c.id)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer border transition-all duration-300 ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500 shadow-md bg-emerald-50/40 -translate-y-1'
                  : 'border-slate-200/80 bg-white hover:border-emerald-400 hover:shadow-card hover:-translate-y-0.5'
              }`}
            >
              {/* Image Frame with Fallback Icon Badge */}
              <div className="h-28 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={c.image}
                  alt={displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* Visual Category Icon Badge */}
                <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-black/65 backdrop-blur-xs text-white flex items-center justify-center shadow-xs">
                  <IconComponent className="w-3.5 h-3.5 text-amber-300" />
                </div>

                {isSelected && (
                  <span className="absolute top-2 right-2 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </div>

              {/* Text Description */}
              <div className="p-3">
                <h3 className={`font-bold text-xs sm:text-sm transition-colors truncate ${
                  isSelected ? 'text-emerald-900 font-black' : 'text-slate-900 group-hover:text-emerald-800'
                }`}>
                  {displayName}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {c.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
