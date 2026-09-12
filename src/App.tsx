import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { Header } from './components/Header.tsx';
import { CategoryFilter } from './components/CategoryFilter.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { OrderTrackerModal } from './components/OrderTrackerModal.tsx';
import { OrderSuccessModal } from './components/OrderSuccessModal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { 
  Phone, 
  MapPin, 
  MessageCircle, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Truck,
  CheckCircle2
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    products, 
    activeCategory, 
    searchQuery, 
    settings, 
    setIsTrackOpen,
    lastPlacedOrder,
    setLastPlacedOrder,
    setIsAdminOpen
  } = useStore();

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      p.name.toLowerCase().includes(q) || 
      (p.size && p.size.toLowerCase().includes(q)) || 
      p.description.toLowerCase().includes(q) ||
      (p.withRing ? 'with ring' : 'without ring').includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 pb-20 sm:pb-12">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-4 space-y-6">
        {/* Brand Showcase Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-stone-900 text-white p-5 sm:p-7 shadow-lg border border-stone-800">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Premium Framing & Customization in Agona Nkwanta</span>
            </div>

            <h2 className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-white leading-tight">
              Crafting Memories That Last a Lifetime
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Explore our handcrafted portrait frames with rings, multi-panel canvas splits, personalized keepsake chains, and custom-printed phone cases.
            </p>

            {/* Service Badges */}
            <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-stone-300">
              <span className="flex items-center gap-1 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700">
                <MapPin className="w-3 h-3 text-amber-400" />
                Agona Nkwanta
              </span>
              <span className="flex items-center gap-1 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700">
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                WhatsApp: 0246782648
              </span>
              <span className="flex items-center gap-1 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700">
                <Truck className="w-3 h-3 text-sky-400" />
                Pickup & Ghana-wide Delivery
              </span>
            </div>

            {/* Quick Hero Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Hello ${settings.brandName}, I'd like to make an inquiry.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>

              <button
                onClick={() => setIsTrackOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition-all border border-stone-700"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </button>
            </div>
          </div>

          {/* Decorative subtle ambient backdrop glow */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Category Filters & Search */}
        <CategoryFilter />

        {/* Product Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-stone-900">
              {activeCategory === 'all' 
                ? 'Featured Catalog' 
                : activeCategory === 'picture_frames' 
                ? 'Picture Frames (With & Without Ring)' 
                : activeCategory === 'canvas_frames' 
                ? 'Canvas Wall Art Frames' 
                : activeCategory === 'custom_chains' 
                ? 'Personalized Chains & Pendants' 
                : 'Customized Phone Cases'}
            </h3>
            <span className="text-xs text-stone-500 font-medium">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-stone-200 p-8 space-y-2">
              <p className="text-sm font-semibold text-stone-800">No items match your search</p>
              <p className="text-xs text-stone-500">
                Try searching for sizes like "10 by 12", "12 by 16", "with ring", or "canvas".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Official Size & Price Reference Guide */}
        <section className="bg-white rounded-3xl p-5 border border-stone-200 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-serif font-bold text-sm text-stone-900">
                Official Price Reference Guide
              </h4>
              <p className="text-xs text-stone-500">
                Verified workshop pricing at Agona Nkwanta for picture frames and canvas splits.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Cedis (GH₵)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Picture Frames Pricing Table */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-2">
              <span className="font-bold text-stone-900 block pb-1 border-b border-stone-200">
                🖼️ Picture Frames
              </span>
              <div className="space-y-1.5 font-medium text-stone-700">
                <div className="flex justify-between">
                  <span>10 by 12 with ring</span>
                  <span className="font-extrabold text-stone-900">GH₵ 95</span>
                </div>
                <div className="flex justify-between">
                  <span>10 by 12 without ring</span>
                  <span className="font-extrabold text-stone-900">GH₵ 85</span>
                </div>
                <div className="flex justify-between">
                  <span>12 by 16 with ring</span>
                  <span className="font-extrabold text-stone-900">GH₵ 140</span>
                </div>
                <div className="flex justify-between">
                  <span>12 by 16 without ring</span>
                  <span className="font-extrabold text-stone-900">GH₵ 130</span>
                </div>
                <div className="flex justify-between">
                  <span>15 by 19 with ring</span>
                  <span className="font-extrabold text-stone-900">GH₵ 200</span>
                </div>
                <div className="flex justify-between">
                  <span>15 by 19 without ring</span>
                  <span className="font-extrabold text-stone-900">GH₵ 185</span>
                </div>
                <div className="flex justify-between">
                  <span>16 by 20 with ring</span>
                  <span className="font-extrabold text-stone-900">GH₵ 230</span>
                </div>
              </div>
            </div>

            {/* Canvas Frames & Custom Items Table */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-2">
              <span className="font-bold text-stone-900 block pb-1 border-b border-stone-200">
                🎨 Canvas Frames & Custom Items
              </span>
              <div className="space-y-1.5 font-medium text-stone-700">
                <div className="flex justify-between">
                  <span>Canvas 3 in 1</span>
                  <span className="font-extrabold text-stone-900">GH₵ 250</span>
                </div>
                <div className="flex justify-between">
                  <span>Canvas 4 in 1</span>
                  <span className="font-extrabold text-stone-900">GH₵ 300</span>
                </div>
                <div className="flex justify-between">
                  <span>Canvas 5 in 1</span>
                  <span className="font-extrabold text-stone-900">GH₵ 400</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-stone-200">
                  <span>Custom Photo / Name Chains</span>
                  <span className="font-extrabold text-stone-900">From GH₵ 110</span>
                </div>
                <div className="flex justify-between">
                  <span>Custom Phone Cases</span>
                  <span className="font-extrabold text-stone-900">From GH₵ 70</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Information & Order Process Steps */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              1
            </div>
            <h5 className="font-serif font-bold text-stone-900">Choose Item & Size</h5>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Select your preferred frame size (with or without ring), canvas split, or custom accessory.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              2
            </div>
            <h5 className="font-serif font-bold text-stone-900">WhatsApp Checkout</h5>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Orders automatically format and send to 0246782648 on WhatsApp with your Order Reference ID.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              3
            </div>
            <h5 className="font-serif font-bold text-stone-900">Track & Receive</h5>
            <p className="text-stone-500 text-[11px] leading-relaxed">
              Follow framing progress in real time. Pick up at Agona Nkwanta or receive door delivery.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 pb-8 text-center text-xs text-stone-500 space-y-2 border-t border-stone-200">
          <div className="flex items-center justify-center gap-1 font-serif font-bold text-stone-800 text-sm">
            <span>{settings.brandName}</span>
            <span>•</span>
            <span className="font-sans font-medium text-xs">{settings.location}</span>
          </div>

          <p className="text-[11px]">
            Direct Contact & WhatsApp: <a href={`tel:${settings.contactNumber}`} className="text-stone-800 font-bold underline">{settings.contactNumber}</a>
          </p>

          <div className="pt-1">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-[11px] text-stone-400 hover:text-stone-700 underline"
            >
              Owner Portal (Update Prices & Stock on Smartphone)
            </button>
          </div>
        </footer>
      </main>

      {/* Slide-overs and Modals */}
      <CartDrawer />
      <OrderTrackerModal />
      <AdminPanel />
      {lastPlacedOrder && (
        <OrderSuccessModal
          order={lastPlacedOrder}
          onClose={() => setLastPlacedOrder(null)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
