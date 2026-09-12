import React, { useState } from 'react';
import { X, Check, Sparkles, Smartphone, ShoppingBag } from 'lucide-react';
import { Product } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';

interface ProductCustomizeModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductCustomizeModal: React.FC<ProductCustomizeModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCartOpen } = useStore();
  const [phoneModel, setPhoneModel] = useState('');
  const [chainText, setChainText] = useState('');
  const [photoNote, setPhotoNote] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const isPhoneCase = product.category === 'phone_cases';
  const isChain = product.category === 'custom_chains';
  const isPictureFrame = product.category === 'picture_frames';

  const handleAdd = () => {
    addToCart(product, quantity, {
      phoneModel: isPhoneCase ? (phoneModel.trim() || 'Any Model (Specified in WhatsApp)') : undefined,
      chainText: isChain ? chainText.trim() : undefined,
      photoNote: photoNote.trim() || undefined,
    });
    setAdded(true);
    setTimeout(() => {
      onClose();
      setIsCartOpen(true);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="customize-modal-card"
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="relative p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <h3 className="font-serif font-bold text-base text-stone-900">
              Customize & Add Item
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4">
          <div className="flex gap-3">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-xl object-cover border border-stone-200 shrink-0"
            />
            <div>
              <h4 className="font-serif font-bold text-stone-900 text-sm">{product.name}</h4>
              <p className="text-xs text-stone-500 mt-0.5">{product.size || product.category.replace('_', ' ')}</p>
              <div className="text-amber-700 font-extrabold text-base mt-1">
                GH₵ {product.price}
              </div>
            </div>
          </div>

          {/* Form fields based on product type */}
          {isPhoneCase && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Your Phone Brand & Exact Model <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                value={phoneModel}
                onChange={(e) => setPhoneModel(e.target.value)}
                placeholder="e.g. iPhone 14 Pro, Samsung S23, Tecno Camon 20"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          )}

          {isChain && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Name or Text to Engrave (Optional)
              </label>
              <input
                type="text"
                value={chainText}
                onChange={(e) => setChainText(e.target.value)}
                placeholder="e.g. 'Nana Ama' or Date '24-12-2023'"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Photo / Design Instructions
            </label>
            <textarea
              rows={2}
              value={photoNote}
              onChange={(e) => setPhotoNote(e.target.value)}
              placeholder="e.g., Portrait orientation, add golden sparkles, or 'I will attach picture on WhatsApp'"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              💡 You will be able to send your high-resolution photo directly to NAB’s FRAMES via WhatsApp after checkout!
            </p>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <span className="text-xs font-semibold text-stone-700">Quantity</span>
            <div className="flex items-center gap-3 bg-stone-100 px-3 py-1.5 rounded-xl">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="text-stone-600 hover:text-stone-900 font-bold px-1"
              >
                -
              </button>
              <span className="text-xs font-bold text-stone-900">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="text-stone-600 hover:text-stone-900 font-bold px-1"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-600">
            Total: <span className="font-extrabold text-stone-900 text-sm">GH₵ {product.price * quantity}</span>
          </div>
          <button
            id="modal-add-to-cart-btn"
            onClick={handleAdd}
            disabled={!product.inStock || product.stock === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all shadow-sm disabled:opacity-50"
          >
            {added ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Added!
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
