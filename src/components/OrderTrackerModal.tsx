import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, Clock, Hammer, Truck, Check, Package, MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { Order, OrderStatus } from '../types.ts';

export const OrderTrackerModal: React.FC = () => {
  const { 
    isTrackOpen, 
    setIsTrackOpen, 
    activeOrderToTrack, 
    setActiveOrderToTrack, 
    trackOrder,
    settings 
  } = useStore();

  const [searchCode, setSearchCode] = useState('');
  const [ordersFound, setOrdersFound] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If an active order was selected (e.g. from success modal or direct click)
  useEffect(() => {
    if (activeOrderToTrack) {
      setOrdersFound([activeOrderToTrack]);
      setSearchCode(activeOrderToTrack.id);
    }
  }, [activeOrderToTrack]);

  if (!isTrackOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const results = await trackOrder(searchCode.trim());
      setOrdersFound(results);
      if (results.length > 0) {
        setActiveOrderToTrack(results[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'No orders found for this code or phone number.');
      setOrdersFound([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentOrder = ordersFound[0] || activeOrderToTrack;

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 1;
      case 'confirmed': return 2;
      case 'production': return 3;
      case 'ready': return 4;
      case 'completed': return 5;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const steps = [
    { num: 1, key: 'pending', label: 'Order Received', icon: <Clock className="w-4 h-4" /> },
    { num: 2, key: 'confirmed', label: 'Confirmed', icon: <CheckCircle2 className="w-4 h-4" /> },
    { num: 3, key: 'production', label: 'In Framing', icon: <Hammer className="w-4 h-4" /> },
    { num: 4, key: 'ready', label: 'Ready / Dispatch', icon: <Truck className="w-4 h-4" /> },
    { num: 5, key: 'completed', label: 'Completed', icon: <Check className="w-4 h-4" /> },
  ];

  const currentStep = currentOrder ? getStatusStep(currentOrder.status) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="order-tracker-card"
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col justify-between"
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 flex items-center justify-center font-bold text-xs">
              NF
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-stone-900">
                Track Your Order
              </h3>
              <p className="text-[11px] text-stone-500">
                Real-time status updates from NAB’s FRAMES
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsTrackOpen(false)}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Section */}
        <div className="p-4 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="tracker-search-input"
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter Order ID (e.g. NF-2648) or Phone number"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 uppercase"
              />
            </div>
            <button
              id="tracker-search-btn"
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Track'}
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* If No search yet and no order */}
          {!currentOrder && !isLoading && !errorMsg && (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-stone-800">
                Enter your Order Code (e.g., NF-2648)
              </p>
              <p className="text-[11px] text-stone-500 max-w-xs mx-auto">
                Or enter the phone number you used when placing your order to check real-time workshop progress.
              </p>
            </div>
          )}

          {/* Active Order Details */}
          {currentOrder && (
            <div className="space-y-4 pt-1">
              {/* Order Header Card */}
              <div className="p-4 bg-stone-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Order Reference
                  </span>
                  <h4 className="font-mono font-black text-lg tracking-wider">
                    {currentOrder.id}
                  </h4>
                  <div className="text-[11px] text-stone-300 mt-0.5">
                    Customer: <span className="text-white font-medium">{currentOrder.customerName}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                    currentOrder.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : currentOrder.status === 'production'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : currentOrder.status === 'ready'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}>
                    {currentOrder.status.toUpperCase()}
                  </span>
                  <div className="text-[11px] text-stone-300 mt-1">
                    Total: <span className="font-bold text-amber-400">GH₵ {currentOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-700">
                  <span>Workshop Progression</span>
                  <span className="text-amber-700">
                    Step {currentStep} of 5
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{ width: `${(Math.max(1, currentStep) / 5) * 100}%` }}
                  />
                </div>

                {/* Steps Icons */}
                <div className="grid grid-cols-5 gap-1 text-center pt-1">
                  {steps.map((step) => {
                    const isDone = currentStep >= step.num;
                    const isCurrent = currentStep === step.num;
                    return (
                      <div key={step.key} className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone 
                            ? 'bg-stone-900 text-amber-400' 
                            : 'bg-stone-200 text-stone-400'
                        } ${isCurrent ? 'ring-2 ring-amber-500 ring-offset-2 scale-110' : ''}`}>
                          {step.icon}
                        </div>
                        <span className={`text-[9px] mt-1 font-semibold leading-tight line-clamp-2 ${
                          isDone ? 'text-stone-900' : 'text-stone-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Timeline History */}
              <div className="space-y-2">
                <h5 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-wider">
                  Timeline Activity
                </h5>
                <div className="space-y-2">
                  {currentOrder.timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-2.5 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{item.title}</span>
                          <span className="text-[10px] text-stone-400">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-stone-600 text-[11px] mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <h5 className="text-xs font-semibold text-stone-700">Order Items</h5>
                <div className="space-y-1">
                  {currentOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-stone-800">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-semibold">GH₵ {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-1.5 border-t border-stone-200 text-xs text-stone-500 flex justify-between">
                  <span>Fulfillment:</span>
                  <span className="font-medium text-stone-800">
                    {currentOrder.deliveryMethod === 'pickup' ? `Self-Pickup (${settings.location})` : currentOrder.deliveryAddress}
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Follow-up button */}
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                  `Hello NAB’s FRAMES, I am checking on my Order ${currentOrder.id} (${currentOrder.customerName}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message NAB’s FRAMES about this Order</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
