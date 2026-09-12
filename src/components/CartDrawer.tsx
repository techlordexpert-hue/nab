import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, MapPin, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    cartCount, 
    cartTotal, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQty, 
    removeFromCart, 
    clearCart,
    placeOrder,
    settings 
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isCartOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      setErrorMsg('Please enter a valid WhatsApp phone number (e.g. 0246782648)');
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      setErrorMsg('Please enter your delivery town/address');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await placeOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'pickup' ? `Agona Nkwanta (${settings.location})` : deliveryAddress.trim(),
        customerNotes: customerNotes.trim(),
      });

      // Prepare WhatsApp message
      const lines = [
        `Hello ${settings.brandName}! 🖼️`,
        `I would like to place an order:`,
        `*Order ID:* ${order.id}`,
        `*Customer Name:* ${customerName}`,
        `*Phone:* ${customerPhone}`,
        `*Location/Delivery:* ${deliveryMethod === 'pickup' ? 'Self-Pickup at Agona Nkwanta' : deliveryAddress}`,
        ``,
        `*Items Ordered:*`,
        ...order.items.map(i => `• ${i.quantity}x ${i.name} — GH₵ ${i.price * i.quantity}`),
        ``,
        `*Total:* GH₵ ${order.total}`,
      ];

      if (customerNotes) {
        lines.push(``, `*Custom Photo / Framing Notes:* ${customerNotes}`);
      }

      lines.push(``, `I am sending this order from your mobile app. Please confirm!`);

      const waUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;

      // Open WhatsApp
      window.open(waUrl, '_blank');

      setIsCartOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)} 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-900" />
              <h2 className="font-serif font-bold text-base text-stone-900">
                Your Shopping Cart ({cartCount})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-stone-800 text-sm">Your cart is empty</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Browse our picture frames, canvas split frames, custom chains, and phone cases to get started.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.cartId}
                      className="flex gap-3 p-3 bg-stone-50 border border-stone-200 rounded-2xl"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-serif font-bold text-xs text-stone-900 truncate">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.cartId)}
                            className="text-stone-400 hover:text-rose-600 p-1 shrink-0"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.size && (
                          <p className="text-[11px] text-stone-500">{item.size}</p>
                        )}
                        {item.customDetails?.phoneModel && (
                          <p className="text-[11px] text-amber-800 font-medium">
                            Model: {item.customDetails.phoneModel}
                          </p>
                        )}
                        {item.customDetails?.chainText && (
                          <p className="text-[11px] text-amber-800 font-medium">
                            Text: "{item.customDetails.chainText}"
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/60">
                          <span className="font-bold text-xs text-stone-900">
                            GH₵ {item.price * item.quantity}
                          </span>

                          <div className="flex items-center gap-2 bg-white border border-stone-200 px-2 py-0.5 rounded-lg">
                            <button
                              onClick={() => updateCartQty(item.cartId, -1)}
                              className="text-stone-600 hover:text-stone-900 p-0.5"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-stone-900 px-1">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateCartQty(item.cartId, 1)}
                              className="text-stone-600 hover:text-stone-900 p-0.5"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout & Customer Details Form */}
                <form id="cart-order-form" onSubmit={handleSubmitOrder} className="pt-3 border-t border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-xs text-stone-900 uppercase tracking-wider">
                      Customer & Delivery Details
                    </h4>
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-[11px] text-stone-400 hover:text-rose-600"
                    >
                      Empty Cart
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Your Full Name <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Kwame Mensah"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      WhatsApp Phone Number <span className="text-amber-600">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 0246782648"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      NAB’s FRAMES will contact you via WhatsApp for photo previews.
                    </p>
                  </div>

                  {/* Delivery Mode */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Fulfillment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                          deliveryMethod === 'pickup'
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <div className="font-bold">Agona Nkwanta Pickup</div>
                        <div className="text-[10px] opacity-80 mt-0.5">Free local pickup</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`p-2 rounded-xl text-xs font-semibold border text-left transition-all ${
                          deliveryMethod === 'delivery'
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <div className="font-bold">Delivery Service</div>
                        <div className="text-[10px] opacity-80 mt-0.5">Across Ghana</div>
                      </button>
                    </div>
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Delivery Address / Town <span className="text-amber-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="e.g. Takoradi, Tarkwa, Accra, or landmark in Agona Nkwanta"
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Custom Instructions / Photo Note
                    </label>
                    <textarea
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="e.g. 'I will send pictures on WhatsApp' or preferred frame border color"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                    />
                  </div>

                  {/* Summary & Submit */}
                  <div className="pt-2 border-t border-stone-200 space-y-2">
                    <div className="flex justify-between items-center text-xs text-stone-600">
                      <span>Subtotal</span>
                      <span className="font-bold text-stone-900">GH₵ {cartTotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-stone-600">
                      <span>Fulfillment</span>
                      <span className="font-semibold text-emerald-700">
                        {deliveryMethod === 'pickup' ? 'Free (Agona Nkwanta)' : 'Standard Courier'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-extrabold text-stone-900 pt-1 border-t border-stone-100">
                      <span>Total Amount</span>
                      <span className="font-serif text-lg text-amber-900">GH₵ {cartTotal}</span>
                    </div>

                    <button
                      id="btn-place-whatsapp-order"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{isSubmitting ? 'Processing Order...' : 'Place Order via WhatsApp (0246782648)'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    
                    <p className="text-[10px] text-center text-stone-400">
                      Direct connection to NAB’s FRAMES WhatsApp: 0246782648
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
