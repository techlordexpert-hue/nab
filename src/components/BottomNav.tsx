import React from 'react';
import { Layers, ShoppingBag, Search, Shield, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const BottomNav: React.FC = () => {
  const { 
    cartCount, 
    setIsCartOpen, 
    setIsTrackOpen, 
    setIsAdminOpen,
    settings,
    setActiveCategory
  } = useStore();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2 px-4 sm:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Showcase / Shop */}
        <button
          id="bottom-nav-shop"
          onClick={() => {
            setActiveCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-stone-600 hover:text-stone-900 focus:text-stone-900 transition-colors py-1"
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Showcase</span>
        </button>

        {/* Cart */}
        <button
          id="bottom-nav-cart"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-stone-600 hover:text-stone-900 focus:text-stone-900 transition-colors py-1"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-amber-500 text-stone-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Cart</span>
        </button>

        {/* Track Order */}
        <button
          id="bottom-nav-track"
          onClick={() => setIsTrackOpen(true)}
          className="flex flex-col items-center gap-0.5 text-stone-600 hover:text-stone-900 focus:text-stone-900 transition-colors py-1"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Track</span>
        </button>

        {/* WhatsApp Direct */}
        <a
          id="bottom-nav-whatsapp"
          href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Hello ${settings.brandName}, I'm reaching out from your mobile web app.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-0.5 text-emerald-700 hover:text-emerald-800 transition-colors py-1"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[10px] font-semibold">WhatsApp</span>
        </a>

        {/* Admin */}
        <button
          id="bottom-nav-admin"
          onClick={() => setIsAdminOpen(true)}
          className="flex flex-col items-center gap-0.5 text-stone-400 hover:text-stone-800 transition-colors py-1"
          title="Owner Admin Panel"
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Admin</span>
        </button>
      </div>
    </nav>
  );
};
