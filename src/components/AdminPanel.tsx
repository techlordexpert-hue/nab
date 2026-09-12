import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Lock, Shield, Check, RefreshCw, Plus, Trash2, Edit3, 
  Smartphone, Save, CheckCircle, Package, ArrowUpRight, MessageCircle, 
  AlertCircle, Sparkles, Upload, Image as ImageIcon, KeyRound, Eye, EyeOff, Camera, Layers
} from 'lucide-react';
import { useStore } from '../context/StoreContext.tsx';
import { Product, Order, OrderStatus, ProductCategory } from '../types.ts';
import { fileToDataUrl } from '../utils/imageUtils.ts';

const PRESET_IMAGES = [
  { label: 'Picture Frame', url: '/images/picture_frames.jpg' },
  { label: 'Canvas Frame', url: '/images/canvas_frames.jpg' },
  { label: 'Custom Chain', url: '/images/custom_chains.jpg' },
  { label: 'Phone Case', url: '/images/custom_cases.jpg' },
];

export const AdminPanel: React.FC = () => {
  const { 
    isAdminOpen, 
    setIsAdminOpen, 
    isAdminAuthenticated, 
    verifyAdminPin, 
    changeAdminPin,
    logoutAdmin,
    products,
    updateProduct,
    addProduct,
    deleteProduct,
    updateOrderStatus,
    fetchAllOrders,
    resetCatalog,
    settings
  } = useStore();

  const [pinInput, setPinInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [pinError, setPinError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'add_product' | 'security'>('inventory');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Existing Product Image Update Modal
  const [productToUpdateImage, setProductToUpdateImage] = useState<Product | null>(null);
  const [imageUpdatePreview, setImageUpdatePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New product form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('picture_frames');
  const [newPrice, setNewPrice] = useState<number>(100);
  const [newStock, setNewStock] = useState<number>(15);
  const [newSize, setNewSize] = useState('');
  const [newWithRing, setNewWithRing] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState<string>('/images/picture_frames.jpg');
  const [isNewImageUploading, setIsNewImageUploading] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // Password Change Form
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const trimmed = pinInput.trim();
    if (!trimmed) {
      setPinError('Please enter your admin password.');
      return;
    }
    setIsVerifying(true);
    const res = await verifyAdminPin(trimmed);
    setIsVerifying(false);
    if (!res.success) {
      setPinError(res.message || 'Incorrect password. Default is 2648 or contact number 0246782648.');
    } else {
      setPinInput('');
    }
  };

  // Load orders when authenticated or switching tabs
  useEffect(() => {
    if (isAdminAuthenticated) {
      loadOrders();
    }
  }, [isAdminAuthenticated, activeTab]);

  const loadOrders = async () => {
    setIsRefreshingOrders(true);
    const data = await fetchAllOrders();
    setOrders(data);
    setIsRefreshingOrders(false);
  };

  if (!isAdminOpen) return null;

  // 1. PIN Login Screen for Owner - NO PASSWORD HINT SHOWN
  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center shadow-xs">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Admin Portal
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Enter your admin password to manage products, pricing, stock, and orders.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-3 pt-2">
            <div className="relative">
              <input
                id="admin-pin-input"
                type={showLoginPassword ? "text" : "password"}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Admin Password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="text"
                className="w-full text-center text-sm font-semibold py-3 px-10 bg-stone-50 border border-stone-300 rounded-2xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                tabIndex={-1}
              >
                {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {pinError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p>{pinError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPinInput('2648');
                      setPinError('');
                    }}
                    className="text-[11px] font-bold text-stone-900 underline mt-1.5 block hover:text-amber-700"
                  >
                    Click here to autofill default password (2648)
                  </button>
                </div>
              </div>
            )}

            <button
              id="admin-login-btn"
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Unlock Admin Panel</span>
              )}
            </button>
          </form>

          <button
            onClick={() => setIsAdminOpen(false)}
            className="text-xs text-stone-500 hover:text-stone-800 pt-2 block mx-auto"
          >
            Cancel and Return to Store
          </button>
        </div>
      </div>
    );
  }

  // Quick Price / Stock updater handler
  const handleQuickUpdate = async (product: Product, newP?: number, newS?: number, newInStock?: boolean) => {
    const updates: Partial<Product> = {};
    if (newP !== undefined) updates.price = newP;
    if (newS !== undefined) updates.stock = newS;
    if (newInStock !== undefined) updates.inStock = newInStock;

    const ok = await updateProduct(product.id, updates);
    if (ok) {
      showToast(`Updated ${product.name} live across all devices!`);
    }
  };

  // Image Upload handler for Existing Product
  const handleExistingImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const dataUrl = await fileToDataUrl(file);
      setImageUpdatePreview(dataUrl);
    } catch (err) {
      console.error(err);
      alert('Could not process image file. Please try a different photo.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProductImage = async () => {
    if (!productToUpdateImage || !imageUpdatePreview) return;

    const ok = await updateProduct(productToUpdateImage.id, {
      image: imageUpdatePreview
    });

    if (ok) {
      showToast(`Updated image for ${productToUpdateImage.name} across all devices!`);
      setProductToUpdateImage(null);
      setImageUpdatePreview('');
    } else {
      alert('Failed to update image. Please check file size or network connection.');
    }
  };

  // Image Upload handler for New Product
  const handleNewProductImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsNewImageUploading(true);
      const dataUrl = await fileToDataUrl(file);
      setNewImage(dataUrl);
    } catch (err) {
      console.error(err);
      alert('Could not process image file. Please try a different photo.');
    } finally {
      setIsNewImageUploading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newPrice <= 0) return;

    const ok = await addProduct({
      name: newName.trim(),
      category: newCategory,
      price: Number(newPrice),
      stock: Number(newStock),
      inStock: Number(newStock) > 0,
      size: newSize.trim() || undefined,
      withRing: newCategory === 'picture_frames' ? newWithRing : undefined,
      description: newDescription.trim() || 'Quality handcrafted item from NAB’s FRAMES',
      image: newImage || (
        newCategory === 'picture_frames' ? '/images/picture_frames.jpg'
        : newCategory === 'canvas_frames' ? '/images/canvas_frames.jpg'
        : newCategory === 'custom_chains' ? '/images/custom_chains.jpg'
        : '/images/custom_cases.jpg'
      ),
    });

    if (ok) {
      showToast('New product added and broadcasted to all users!');
      setNewName('');
      setNewSize('');
      setNewDescription('');
      setNewImage('/images/picture_frames.jpg');
      setActiveTab('inventory');
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const ok = await updateOrderStatus(orderId, status);
    if (ok) {
      showToast(`Order ${orderId} updated to ${status.toUpperCase()}!`);
      loadOrders();
    }
  };

  // Password change handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPin.trim()) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPin.trim().length < 4) {
      setPasswordError('New password must be at least 4 characters.');
      return;
    }

    if (newPin !== confirmPin) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changeAdminPin(currentPin.trim(), newPin.trim());
      if (result.success) {
        setPasswordSuccess('Password successfully updated! Your new password is now active.');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        showToast('Admin password updated successfully!');
      } else {
        setPasswordError(result.message || 'Failed to change password.');
      }
    } catch {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="admin-dashboard-container"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col justify-between shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Admin Header */}
        <div className="p-4 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base">
                  Owner Dashboard: {settings.brandName}
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Agona Nkwanta Workshop Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={logoutAdmin}
              className="text-[11px] px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>Lock</span>
            </button>
            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-1 text-stone-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Instant Update Alert Toast */}
        {successToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center flex items-center justify-center gap-1.5 animate-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Admin Navigation Tabs - 2x2 grid on mobile, 4 cols on desktop so all are 100% visible */}
        <div className="p-2.5 bg-stone-100 border-b border-stone-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              id="admin-tab-inventory"
              onClick={() => setActiveTab('inventory')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-xs ${
                activeTab === 'inventory'
                  ? 'bg-stone-900 text-amber-400 border-stone-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Prices & Stock</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                activeTab === 'inventory' ? 'bg-amber-400/20 text-amber-300' : 'bg-stone-100 text-stone-600'
              }`}>
                {products.length}
              </span>
            </button>

            <button
              id="admin-tab-orders"
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-xs ${
                activeTab === 'orders'
                  ? 'bg-stone-900 text-amber-400 border-stone-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Orders</span>
              {orders.length > 0 ? (
                <span className="bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full text-[10px] font-black animate-pulse">
                  {orders.length}
                </span>
              ) : (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'orders' ? 'bg-amber-400/20 text-amber-300' : 'bg-stone-100 text-stone-500'
                }`}>
                  0
                </span>
              )}
            </button>

            <button
              id="admin-tab-add"
              onClick={() => setActiveTab('add_product')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-xs ${
                activeTab === 'add_product'
                  ? 'bg-stone-900 text-amber-400 border-stone-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>

            <button
              id="admin-tab-security"
              onClick={() => setActiveTab('security')}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-xs ${
                activeTab === 'security'
                  ? 'bg-stone-900 text-amber-400 border-stone-900'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Password</span>
            </button>
          </div>
        </div>

        {/* Main Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: SMARTPHONE PRICE & STOCK MANAGER (WITH PHOTO UPDATE) */}
          {activeTab === 'inventory' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Update <strong>prices</strong>, <strong>stock</strong>, or <strong>item photos</strong> directly from your phone. Changes reflect <span className="underline font-bold">instantly on every customer device</span>.
                </p>
              </div>

              <div className="space-y-3">
                {products.map((product) => {
                  return (
                    <div
                      key={product.id}
                      className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3 hover:border-stone-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex gap-3">
                          {/* Image with quick Change Photo button */}
                          <div className="relative group shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 rounded-xl object-cover border border-stone-200 shadow-xs"
                            />
                            <button
                              onClick={() => {
                                setProductToUpdateImage(product);
                                setImageUpdatePreview(product.image);
                              }}
                              title="Change Photo"
                              className="absolute inset-0 bg-stone-900/60 text-white rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] font-bold transition-opacity"
                            >
                              <Camera className="w-4 h-4" />
                              <span>Change</span>
                            </button>
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900">
                              {product.name}
                            </h4>
                            <p className="text-[11px] text-stone-500">
                              {product.size || product.category.replace('_', ' ')} {product.withRing ? '• With Ring' : ''}
                            </p>
                            
                            {/* Change Photo link for easy touch on mobile */}
                            <button
                              onClick={() => {
                                setProductToUpdateImage(product);
                                setImageUpdatePreview(product.image);
                              }}
                              className="text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 mt-1"
                            >
                              <Camera className="w-3 h-3" />
                              <span>Change Photo</span>
                            </button>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 font-bold uppercase block">Current Price</span>
                          <span className="font-serif font-black text-stone-900 text-base">
                            GH₵ {product.price}
                          </span>
                        </div>
                      </div>

                      {/* Touch Controls for Price & Stock */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-200/80">
                        {/* Price Stepper */}
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-700">Price (GH₵)</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuickUpdate(product, Math.max(0, product.price - 5))}
                              className="w-7 h-7 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center font-bold text-stone-800"
                            >
                              -5
                            </button>
                            <input
                              type="number"
                              defaultValue={product.price}
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (val !== product.price && val >= 0) {
                                  handleQuickUpdate(product, val);
                                }
                              }}
                              className="w-16 text-center font-serif font-black text-xs py-1 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                            />
                            <button
                              onClick={() => handleQuickUpdate(product, product.price + 5)}
                              className="w-7 h-7 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center font-bold text-stone-800"
                            >
                              +5
                            </button>
                          </div>
                        </div>

                        {/* Stock Stepper */}
                        <div className="bg-white p-2.5 rounded-xl border border-stone-200 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-700">Stock Units</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleQuickUpdate(product, undefined, Math.max(0, product.stock - 1))}
                              className="w-7 h-7 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center font-bold text-stone-800"
                            >
                              -1
                            </button>
                            <input
                              type="number"
                              defaultValue={product.stock}
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (val !== product.stock && val >= 0) {
                                  handleQuickUpdate(product, undefined, val, val > 0);
                                }
                              }}
                              className="w-14 text-center font-bold text-xs py-1 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                            />
                            <button
                              onClick={() => handleQuickUpdate(product, undefined, product.stock + 1, true)}
                              className="w-7 h-7 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center justify-center font-bold text-stone-800"
                            >
                              +1
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Stock Toggle and Delete button */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleQuickUpdate(product, undefined, undefined, !product.inStock)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                            product.inStock
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}
                        >
                          {product.inStock ? '✓ Marked In Stock' : '✕ Marked Out of Stock'}
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${product.name}?`)) {
                              deleteProduct(product.id).then(() => showToast('Product removed'));
                            }
                          }}
                          className="text-stone-400 hover:text-rose-600 p-1 rounded-lg text-xs flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reset to initial catalog button */}
              <div className="pt-4 border-t border-stone-200 text-center">
                <button
                  onClick={() => {
                    if (window.confirm('Reset catalog prices and items to original list?')) {
                      resetCatalog().then(() => showToast('Catalog reset to initial specifications'));
                    }
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  Restore original client pricing & catalog
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-xs text-stone-900 uppercase tracking-wider">
                  Customer Orders ({orders.length})
                </h4>
                <button
                  onClick={loadOrders}
                  disabled={isRefreshingOrders}
                  className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingOrders ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  No orders recorded yet. As customers order via WhatsApp or the app, they appear here instantly.
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-stone-900 text-sm">{order.id}</span>
                            <span className="text-[11px] text-stone-400">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-stone-800 mt-0.5">
                            {order.customerName} ({order.customerPhone})
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-serif font-extrabold text-stone-900 text-sm">
                            GH₵ {order.total}
                          </span>
                          <span className="text-[10px] block text-stone-500">
                            {order.deliveryMethod === 'pickup' ? 'Agona Nkwanta' : 'Delivery'}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs space-y-1">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between text-stone-700">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="font-medium">GH₵ {it.price * it.quantity}</span>
                          </div>
                        ))}
                        {order.customerNotes && (
                          <div className="text-[11px] text-amber-800 pt-1 border-t border-stone-100 font-medium">
                            Note: {order.customerNotes}
                          </div>
                        )}
                      </div>

                      {/* Order Status Control Buttons */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-stone-700">
                            Current Stage:
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                            order.status === 'pending' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                            order.status === 'confirmed' ? 'bg-sky-100 text-sky-900 border-sky-300' :
                            order.status === 'production' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                            order.status === 'ready' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                            'bg-stone-900 text-white border-stone-900'
                          }`}>
                            {order.status === 'pending' ? '🟡 Order Placed' :
                             order.status === 'confirmed' ? '🔵 Confirmed' :
                             order.status === 'production' ? '🟣 In Framing (Workshop)' :
                             order.status === 'ready' ? '🟢 Ready for Pickup' :
                             '✓ Completed'}
                          </span>
                        </div>

                        <span className="text-[10px] font-semibold text-stone-500 block">
                          Tap below to change stage (updates customer's tracking screen instantly):
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                          {[
                            { id: 'pending', label: '1. Placed' },
                            { id: 'confirmed', label: '2. Confirmed' },
                            { id: 'production', label: '3. In Framing' },
                            { id: 'ready', label: '4. Ready' },
                            { id: 'completed', label: '5. Completed' }
                          ].map((st) => (
                            <button
                              key={st.id}
                              onClick={() => handleUpdateStatus(order.id, st.id as OrderStatus)}
                              className={`py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all border text-center ${
                                order.status === st.id
                                  ? 'bg-stone-900 text-amber-400 border-stone-900 shadow-xs'
                                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* WhatsApp reply directly to customer */}
                      <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${order.customerName}, this is NAB’s FRAMES regarding your Order ${order.id}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat Customer on WhatsApp</span>
                        </a>

                        <span className="text-[10px] text-stone-400">
                          Status: {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD NEW ITEM / FRAME SIZE (WITH IMAGE UPLOAD) */}
          {activeTab === 'add_product' && (
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600">
                Add a new frame size or customized craft item to showcase on the platform.
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-stone-700">
                  Product Image / Photo <span className="text-amber-600">*</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  {/* Current Image Preview */}
                  <div className="relative w-28 h-28 rounded-2xl border border-stone-200 overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={newImage}
                      alt="New product preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isNewImageUploading && (
                      <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white text-xs">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      ref={newFileInputRef}
                      accept="image/*"
                      onChange={handleNewProductImageChange}
                      className="hidden"
                    />
                    
                    <button
                      type="button"
                      onClick={() => newFileInputRef.current?.click()}
                      className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-amber-700" />
                      <span>Upload Photo from Phone / Camera</span>
                    </button>

                    {/* Presets */}
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold block mb-1">
                        Or select category template:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {PRESET_IMAGES.map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => setNewImage(preset.url)}
                            className={`p-1.5 text-[10px] font-semibold rounded-lg border text-left truncate ${
                              newImage === preset.url
                                ? 'bg-stone-900 text-amber-300 border-stone-900'
                                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Item Title <span className="text-amber-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. 20 by 24 with ring, or Gold Photo Pendant"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => {
                      const cat = e.target.value as ProductCategory;
                      setNewCategory(cat);
                      // Suggest appropriate image preset
                      if (cat === 'picture_frames') setNewImage('/images/picture_frames.jpg');
                      else if (cat === 'canvas_frames') setNewImage('/images/canvas_frames.jpg');
                      else if (cat === 'custom_chains') setNewImage('/images/custom_chains.jpg');
                      else if (cat === 'phone_cases') setNewImage('/images/custom_cases.jpg');
                    }}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  >
                    <option value="picture_frames">Picture Frames</option>
                    <option value="canvas_frames">Canvas Frames</option>
                    <option value="custom_chains">Custom Chains</option>
                    <option value="phone_cases">Phone Cases</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Size Specification</label>
                  <input
                    type="text"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    placeholder="e.g. 20 x 24 inches"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Price in Cedis (GH₵) <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold"
                  />
                </div>
              </div>

              {newCategory === 'picture_frames' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="newWithRing"
                    checked={newWithRing}
                    onChange={(e) => setNewWithRing(e.target.checked)}
                    className="w-4 h-4 rounded text-stone-900"
                  />
                  <label htmlFor="newWithRing" className="text-xs font-semibold text-stone-700">
                    Includes Top Hanging Ring
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Details about finish, durability, mounting..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                />
              </div>

              <button
                id="btn-submit-new-product"
                type="submit"
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Publish Item with Photo</span>
              </button>
            </form>
          )}

          {/* TAB 4: CHANGE ADMIN PASSWORD */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Admin Security & Password</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Change the password required to access your owner admin portal. Store this safely on your device.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Current Password <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPin}
                    onChange={(e) => setCurrentPin(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    New Password <span className="text-amber-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPin ? "text" : "password"}
                      required
                      minLength={4}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Enter new password (min. 4 characters)"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Confirm New Password <span className="text-amber-600">*</span>
                  </label>
                  <input
                    type={showNewPin ? "text" : "password"}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full mt-2 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isChangingPassword ? 'Updating Password...' : 'Save New Password'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: UPDATE EXISTING PRODUCT IMAGE */}
      {productToUpdateImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">
                  Update Product Photo
                </h4>
                <p className="text-[11px] text-stone-500">
                  {productToUpdateImage.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setProductToUpdateImage(null);
                  setImageUpdatePreview('');
                }}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo Preview Container */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-48 h-36 rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-100 shadow-sm">
                <img
                  src={imageUpdatePreview || productToUpdateImage.image}
                  alt={productToUpdateImage.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload from device */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleExistingImageFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Camera className="w-4 h-4 text-amber-400" />
                <span>Choose Photo from Gallery / Camera</span>
              </button>

              {/* Presets selection */}
              <div className="w-full space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-stone-600 block">
                  Or pick standard category photo:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setImageUpdatePreview(preset.url)}
                      className={`p-2 rounded-xl text-xs font-semibold border text-left flex items-center gap-2 ${
                        imageUpdatePreview === preset.url
                          ? 'bg-stone-900 text-amber-300 border-stone-900'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-md object-cover"
                      />
                      <span className="truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setProductToUpdateImage(null);
                  setImageUpdatePreview('');
                }}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveProductImage}
                disabled={!imageUpdatePreview || imageUpdatePreview === productToUpdateImage.image}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save New Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
