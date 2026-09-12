import React, { useState } from 'react';
import { ShoppingBag, Check, Sparkles, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';
import { ProductCustomizeModal } from './ProductCustomizeModal.tsx';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isCustomizable = product.category === 'phone_cases' || product.category === 'custom_chains';
  const isOutOfStock = !product.inStock || product.stock <= 0;

  const handleQuickAdd = () => {
    if (isCustomizable) {
      setIsCustomizeOpen(true);
      return;
    }

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <>
      <div 
        id={`product-card-${product.id}`}
        className="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
      >
        {/* Product Image and Badges */}
        <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
            {product.badge && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-900/90 text-amber-300 backdrop-blur-xs tracking-wider uppercase">
                {product.badge}
              </span>
            )}
            {product.withRing !== undefined && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-xs ${
                product.withRing 
                  ? 'bg-amber-100/95 text-amber-900 border border-amber-300/60' 
                  : 'bg-stone-100/95 text-stone-700 border border-stone-300/60'
              }`}>
                {product.withRing ? '⭕ With Ring' : 'Flat (No Ring)'}
              </span>
            )}
          </div>

          {/* Stock Indicator Pill */}
          <div className="absolute top-2.5 right-2.5">
            {isOutOfStock ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                Out of Stock
              </span>
            ) : product.stock <= 5 ? (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-600 text-white shadow-xs">
                Only {product.stock} left
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/90 text-emerald-800 shadow-xs backdrop-blur-xs border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                In Stock ({product.stock})
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif font-bold text-stone-900 text-sm leading-snug line-clamp-2">
                {product.name}
              </h3>
            </div>
            
            {product.size && (
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                Size: {product.size}
              </p>
            )}

            <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price & Action Row */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-stone-400 font-semibold block uppercase tracking-wider">Price</span>
              <span className="font-serif font-extrabold text-stone-900 text-base">
                GH₵ {product.price}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {isCustomizable ? (
                <button
                  id={`btn-customize-${product.id}`}
                  onClick={() => setIsCustomizeOpen(true)}
                  disabled={isOutOfStock}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs disabled:opacity-40"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Customize</span>
                </button>
              ) : (
                <button
                  id={`btn-add-cart-${product.id}`}
                  onClick={handleQuickAdd}
                  disabled={isOutOfStock}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-40 ${
                    justAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isCustomizeOpen && (
        <ProductCustomizeModal
          product={product}
          onClose={() => setIsCustomizeOpen(false)}
        />
      )}
    </>
  );
};
