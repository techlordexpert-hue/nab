import React from 'react';
import { ShoppingBag, Phone, MapPin, Search, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const Header: React.FC = () => {
  const { 
    settings, 
    cartCount, 
    setIsCartOpen, 
    setIsTrackOpen, 
    setIsAdminOpen, 
    isConnectedLive,
    lastUpdateNotification
  } = useStore();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Real-time price update notification banner */}
      {lastUpdateNotification && (
        <div className="bg-amber-500 text-stone-950 text-xs font-semibold px-4 py-1.5 text-center flex items-center justify-center gap-1.5 transition-all">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>{lastUpdateNotification}</span>
        </div>
      )}

      {/* Main Top Header */}
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* Logo Mark */}
          <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-serif font-black text-xl shadow-sm border border-stone-800">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-black text-lg sm:text-xl text-stone-900 tracking-tight leading-none">
                {settings.brandName}
              </h1>
              {isConnectedLive && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200" title="Connected to instant live updates">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-amber-600" />
                {settings.location}
              </span>
              <span className="text-stone-300">•</span>
              <a 
                href={`tel:${settings.contactNumber}`} 
                className="text-stone-700 hover:text-amber-600 transition-colors flex items-center gap-1"
              >
                <Phone className="w-2.5 h-2.5" />
                {settings.contactNumber}
              </a>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Track Order Button */}
          <button
            id="header-track-btn"
            onClick={() => setIsTrackOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            Track Order
          </button>

          {/* Admin shortcut */}
          <button
            id="header-admin-btn"
            onClick={() => setIsAdminOpen(true)}
            title="Owner Admin Panel (Update Prices & Stock)"
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <Shield className="w-4 h-4" />
          </button>

          {/* Shopping Cart Button */}
          <button
            id="header-cart-btn"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all flex items-center justify-center shadow-sm"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
