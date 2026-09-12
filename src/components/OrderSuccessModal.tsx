import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, ExternalLink, MessageCircle, Search, X } from 'lucide-react';
import { Order } from '../types.ts';
import { useStore } from '../context/StoreContext.tsx';

interface OrderSuccessModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  const { settings, setActiveOrderToTrack, setIsTrackOpen } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTrackDirectly = () => {
    setActiveOrderToTrack(order);
    onClose();
    setIsTrackOpen(true);
  };

  const getWhatsAppUrl = () => {
    const lines = [
      `Hello ${settings.brandName}! 🖼️`,
      `I just placed an order on your mobile store:`,
      `*Order ID:* ${order.id}`,
      `*Customer:* ${order.customerName}`,
      `*Phone:* ${order.customerPhone}`,
      `*Delivery/Pickup:* ${order.deliveryMethod === 'pickup' ? 'Pickup at Agona Nkwanta' : order.deliveryAddress}`,
      ``,
      `*Items:*`,
      ...order.items.map(i => `• ${i.quantity}x ${i.name} (GH₵ ${i.price * i.quantity})`),
      ``,
      `*Total:* GH₵ ${order.total}`,
    ];

    if (order.customerNotes) {
      lines.push(``, `*Notes:* ${order.customerNotes}`);
    }

    lines.push(``, `Please verify and confirm my order. Thank you!`);

    return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="order-success-card"
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4"
      >
        {/* Success Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h3 className="font-serif font-bold text-xl text-stone-900">
            Order Submitted!
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Your order has been logged in NAB’s FRAMES system and dispatched to our WhatsApp team.
          </p>
        </div>

        {/* Order ID Box */}
        <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Tracking Code</span>
            <div className="font-mono font-black text-stone-900 text-lg tracking-wider">
              {order.id}
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Order Summary Recap */}
        <div className="bg-amber-50/70 p-3 rounded-xl text-left text-xs border border-amber-200/60 space-y-1">
          <div className="flex justify-between font-medium text-stone-700">
            <span>Customer:</span>
            <span className="font-bold text-stone-900">{order.customerName}</span>
          </div>
          <div className="flex justify-between font-medium text-stone-700">
            <span>Contact:</span>
            <span className="font-bold text-stone-900">{order.customerPhone}</span>
          </div>
          <div className="flex justify-between font-medium text-stone-700">
            <span>Pickup / Delivery:</span>
            <span className="font-bold text-stone-900">
              {order.deliveryMethod === 'pickup' ? 'Agona Nkwanta' : 'Delivery'}
            </span>
          </div>
          <div className="flex justify-between font-medium text-stone-700 pt-1 border-t border-amber-200">
            <span>Total Payable:</span>
            <span className="font-extrabold text-amber-900">GH₵ {order.total}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open in WhatsApp (0246782648)</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>

          <button
            id="btn-track-from-success"
            onClick={handleTrackDirectly}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Order Progress</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
