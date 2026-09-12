import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Order, StoreSettings, OrderStatus, ProductCategory } from '../types.ts';
import { initialProducts, initialSettings } from '../data/initialProducts.ts';

interface StoreContextType {
  products: Product[];
  settings: StoreSettings;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  activeCategory: ProductCategory | 'all';
  searchQuery: string;
  isCartOpen: boolean;
  isTrackOpen: boolean;
  isAdminOpen: boolean;
  adminPin: string;
  isAdminAuthenticated: boolean;
  activeOrderToTrack: Order | null;
  lastPlacedOrder: Order | null;
  isConnectedLive: boolean;
  lastUpdateNotification: string | null;

  // Actions
  setActiveCategory: (cat: ProductCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsTrackOpen: (open: boolean) => void;
  setIsAdminOpen: (open: boolean) => void;
  setActiveOrderToTrack: (order: Order | null) => void;
  setLastPlacedOrder: (order: Order | null) => void;
  
  addToCart: (product: Product, quantity?: number, customDetails?: CartItem['customDetails']) => void;
  updateCartQty: (cartId: string, delta: number) => void;
  removeFromCart: (cartId: string) => void;
  clearCart: () => void;
  
  placeOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryMethod: 'pickup' | 'delivery';
    deliveryAddress: string;
    customerNotes?: string;
  }) => Promise<Order>;

  trackOrder: (query: string) => Promise<Order[]>;
  
  // Admin actions
  verifyAdminPin: (pin: string) => Promise<{ success: boolean; message?: string }>;
  changeAdminPin: (currentPin: string, newPin: string) => Promise<{ success: boolean; message: string }>;
  logoutAdmin: () => void;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  addProduct: (productData: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<boolean>;
  fetchAllOrders: () => Promise<Order[]>;
  resetCatalog: () => Promise<boolean>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('nab_frames_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('nab_admin_pin') || '';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [activeOrderToTrack, setActiveOrderToTrack] = useState<Order | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [isConnectedLive, setIsConnectedLive] = useState<boolean>(false);
  const [lastUpdateNotification, setLastUpdateNotification] = useState<string | null>(null);

  // Sync cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nab_frames_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Initial fetch of products and settings
  const fetchProductsAndSettings = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/settings')
      ]);
      if (pRes.ok) {
        const prodData = await pRes.json();
        setProducts(prodData);
      }
      if (sRes.ok) {
        const setData = await sRes.json();
        setSettings(prev => ({ ...prev, ...setData }));
      }
    } catch (err) {
      console.warn('Using local catalog fallback:', err);
    }
  };

  useEffect(() => {
    fetchProductsAndSettings();

    // Auto verify saved admin pin
    if (adminPin) {
      verifyAdminPin(adminPin);
    }

    // Set up Server-Sent Events (SSE) for instant cross-device updates
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource('/api/events');

      eventSource.onopen = () => {
        setIsConnectedLive(true);
      };

      eventSource.addEventListener('init', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.products) setProducts(payload.products);
          if (payload.settings) setSettings(prev => ({ ...prev, ...payload.settings }));
        } catch (err) {
          console.error('Error parsing init event:', err);
        }
      });

      // When admin updates prices/stocks on smartphone, all customer screens update instantly!
      eventSource.addEventListener('products_updated', (e: MessageEvent) => {
        try {
          const updated = JSON.parse(e.data);
          if (Array.isArray(updated)) {
            setProducts(updated);
            setLastUpdateNotification('Prices & stock updated in real-time');
            setTimeout(() => setLastUpdateNotification(null), 3000);
          }
        } catch (err) {
          console.error('Error in products_updated event:', err);
        }
      });

      // When order status is updated by admin, tracking screens update in real-time
      eventSource.addEventListener('order_updated', (e: MessageEvent) => {
        try {
          const order = JSON.parse(e.data);
          setActiveOrderToTrack(current => (current && current.id === order.id ? order : current));
          setLastPlacedOrder(current => (current && current.id === order.id ? order : current));
        } catch (err) {
          console.error('Error in order_updated event:', err);
        }
      });

      eventSource.onerror = () => {
        setIsConnectedLive(false);
      };
    } catch (err) {
      console.warn('SSE not available:', err);
    }

    // Fallback periodic poll to guarantee fresh data even on mobile sleep wake-ups
    const pollInterval = setInterval(() => {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setProducts(data);
        })
        .catch(() => {});
    }, 12000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, []);

  // Cart operations
  const addToCart = (product: Product, quantity = 1, customDetails?: CartItem['customDetails']) => {
    setCart(prev => {
      const cartId = `${product.id}-${customDetails?.phoneModel || ''}-${customDetails?.chainText || ''}-${customDetails?.photoNote || ''}`;
      const existing = prev.find(item => item.cartId === cartId);
      if (existing) {
        return prev.map(item =>
          item.cartId === cartId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          cartId,
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          quantity,
          image: product.image,
          size: product.size,
          withRing: product.withRing,
          customDetails,
        }
      ];
    });
  };

  const updateCartQty = (cartId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.cartId === cartId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Order Placement
  const placeOrder = async (orderData: {
    customerName: string;
    customerPhone: string;
    deliveryMethod: 'pickup' | 'delivery';
    deliveryAddress: string;
    customerNotes?: string;
  }): Promise<Order> => {
    const payload = {
      ...orderData,
      items: cart.map(item => ({
        productId: item.productId,
        name: item.name + (item.customDetails?.phoneModel ? ` (${item.customDetails.phoneModel})` : '') + (item.customDetails?.chainText ? ` (Engraving: "${item.customDetails.chainText}")` : ''),
        price: item.price,
        quantity: item.quantity,
        customNote: item.customDetails?.photoNote || '',
      })),
      subtotal: cartTotal,
      total: cartTotal,
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const createdOrder: Order = await response.json();
    setLastPlacedOrder(createdOrder);
    clearCart();
    return createdOrder;
  };

  // Order Tracking
  const trackOrder = async (query: string): Promise<Order[]> => {
    const res = await fetch(`/api/orders/track/${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error('No orders found with that ID or Phone number.');
    }
    const orders: Order[] = await res.json();
    if (orders.length > 0) {
      setActiveOrderToTrack(orders[0]);
    }
    return orders;
  };

  // Admin Features
  const verifyAdminPin = async (pin: string): Promise<{ success: boolean; message?: string }> => {
    const cleanPin = pin.trim();
    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: cleanPin }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const pinToSave = data.activePin || cleanPin;
        setAdminPin(pinToSave);
        setIsAdminAuthenticated(true);
        localStorage.setItem('nab_admin_pin', pinToSave);
        return { success: true };
      }
      setIsAdminAuthenticated(false);
      return { 
        success: false, 
        message: data.message || 'Incorrect password. Default is 2648 or contact number 0246782648.' 
      };
    } catch {
      // Mobile network or offline fallback
      if (cleanPin === '2648' || cleanPin === '0246782648' || (settings.adminPin && cleanPin === settings.adminPin)) {
        setAdminPin(cleanPin);
        setIsAdminAuthenticated(true);
        localStorage.setItem('nab_admin_pin', cleanPin);
        return { success: true };
      }
      setIsAdminAuthenticated(false);
      return { 
        success: false, 
        message: 'Could not connect to server. Please check your internet connection or try default 2648.' 
      };
    }
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setAdminPin('');
    localStorage.removeItem('nab_admin_pin');
  };

  const changeAdminPin = async (currentPin: string, newPin: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/admin/change-pin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
        },
        body: JSON.stringify({ currentPin, newPin }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminPin(newPin);
        localStorage.setItem('nab_admin_pin', newPin);
        return { success: true, message: data.message || 'PIN changed successfully.' };
      }
      return { success: false, message: data.message || 'Failed to change PIN.' };
    } catch {
      return { success: false, message: 'Server connection error.' };
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const addProduct = async (productData: Partial<Product>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
        },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        await fetchProductsAndSettings();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-pin': adminPin,
        },
      });
      if (res.ok) {
        await fetchProductsAndSettings();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': adminPin,
        },
        body: JSON.stringify({ status, note }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        if (activeOrderToTrack?.id === orderId) {
          setActiveOrderToTrack(updatedOrder);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const fetchAllOrders = async (): Promise<Order[]> => {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: {
          'x-admin-pin': adminPin,
        },
      });
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch {
      return [];
    }
  };

  const resetCatalog = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/reset-catalog', {
        method: 'POST',
        headers: {
          'x-admin-pin': adminPin,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.products) setProducts(data.products);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        settings,
        cart,
        cartCount,
        cartTotal,
        activeCategory,
        searchQuery,
        isCartOpen,
        isTrackOpen,
        isAdminOpen,
        adminPin,
        isAdminAuthenticated,
        activeOrderToTrack,
        lastPlacedOrder,
        isConnectedLive,
        lastUpdateNotification,
        setActiveCategory,
        setSearchQuery,
        setIsCartOpen,
        setIsTrackOpen,
        setIsAdminOpen,
        setActiveOrderToTrack,
        setLastPlacedOrder,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        placeOrder,
        trackOrder,
        verifyAdminPin,
        changeAdminPin,
        logoutAdmin,
        updateProduct,
        addProduct,
        deleteProduct,
        updateOrderStatus,
        fetchAllOrders,
        resetCatalog,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
