import React from 'react';
import { SERVICE_CATEGORIES } from '../data/categories';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

interface CategoriesPageProps {
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onSelectCategory }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs uppercase font-semibold text-emerald-800 tracking-wider">
          Therapeutic Disciplines
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
          Certified Wellness Therapies in Delhi NCR
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Every category is strictly bounded by genuine healthcare, ayurvedic, musculoskeletal rehabilitation, and certified mindfulness standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICE_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/9] w-full bg-stone-100 overflow-hidden">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Licensed Practitioners Only</span>
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  {cat.name}
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => onSelectCategory(cat.id)}
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Find Specialists in {cat.name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
