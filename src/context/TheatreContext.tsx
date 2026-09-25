import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { MenuItem, Product, CartItem, Order, OrderStatus } from '../types';
import { INITIAL_MENU_ITEMS } from '../data/menuData';
import {
  createFirestoreOrder,
  updateFirestoreOrderStatus,
  subscribeToAllOrders,
  subscribeToSingleOrder,
} from '../firebase/ordersService';
import { testConnection } from '../firebase/config';

export type AppView =
  | 'landing'
  | 'menu'
  | 'cart'
  | 'payment'
  | 'order-success'
  | 'digital-bill'
  | 'admin';

interface PlaceOrderOptions {
  customerName: string;
  phoneNumber: string;
  paymentMethod?: string;
  customerNotes?: string;
  screenNumber?: string;
  seatNumber?: string;
}

interface TheatreContextType {
  theatreName: string;
  screenNumber: string;
  seatNumber: string;
  setSeatInfo: (screen: string, seat: string) => void;
  // Customer details
  customerName: string;
  phoneNumber: string;
  setCustomerDetails: (name: string, phone: string) => void;
  // Menu items (loaded locally, no MENU collection created or used)
  menuItems: MenuItem[];
  products: Product[];
  isMenuLoading: boolean;
  toggleItemAvailability: (id: string, available: boolean) => void;
  // Cart operations
  cart: CartItem[];
  addToCart: (product: MenuItem) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  // Navigation & Views
  currentView: AppView;
  navigateTo: (view: AppView) => void;
  // Orders (using existing Firestore ORDERS collection)
  orders: Order[];
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  placeOrder: (options: PlaceOrderOptions | string, legacyNotes?: string) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  // UI states
  isQrModalOpen: boolean;
  setIsQrModalOpen: (open: boolean) => void;
  isFirestoreLoading: boolean;
  firestoreError: string | null;
  isOnlineFirestore: boolean;
}

const TheatreContext = createContext<TheatreContextType | undefined>(undefined);

const ACTIVE_ORDER_STORAGE_KEY = 'namma_theatre_active_order_v1';
const ORDERS_BACKUP_STORAGE_KEY = 'namma_theatre_orders_backup_v1';
const CUSTOMER_NAME_KEY = 'namma_theatre_customer_name_v1';
const CUSTOMER_PHONE_KEY = 'namma_theatre_customer_phone_v1';

export const TheatreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theatreName = 'Namma Cinemas (Express Screen)';

  // Customer Name & Phone
  const [customerName, setCustomerName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(CUSTOMER_NAME_KEY) || '';
      } catch {
        // ignore
      }
    }
    return '';
  });

  const [phoneNumber, setPhoneNumber] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(CUSTOMER_PHONE_KEY) || '';
      } catch {
        // ignore
      }
    }
    return '';
  });

  const setCustomerDetails = useCallback((name: string, phone: string) => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    setCustomerName(cleanName);
    setPhoneNumber(cleanPhone);
    try {
      if (cleanName) localStorage.setItem(CUSTOMER_NAME_KEY, cleanName);
      if (cleanPhone) localStorage.setItem(CUSTOMER_PHONE_KEY, cleanPhone);
    } catch {
      // ignore
    }
  }, []);

  // Screen & Seat selection
  const [screenNumber, setScreenNumber] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const scr = params.get('screen');
      if (scr) return scr.trim();
      try {
        const saved = localStorage.getItem('namma_theatre_screen_v1');
        if (saved) return saved;
      } catch {
        // ignore
      }
    }
    return '1';
  });

  const [seatNumber, setSeatNumber] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('seat');
      if (s) return s.trim().toUpperCase();
      try {
        const saved = localStorage.getItem('namma_theatre_seat_v1');
        if (saved) return saved;
      } catch {
        // ignore
      }
    }
    return '';
  });

  // Current View
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view');
      const seatParam = params.get('seat');

      if (seatParam && seatParam.trim()) {
        return 'menu';
      }

      if (
        pathname.includes('/menu') ||
        pathname === '/me' ||
        pathname.startsWith('/me/') ||
        viewParam === 'menu'
      ) {
        return 'menu';
      }
      if (pathname.includes('/cart') || viewParam === 'cart') {
        return 'cart';
      }
      if (pathname.includes('/payment') || viewParam === 'payment') {
        return 'payment';
      }
      if (pathname.includes('/admin') || viewParam === 'admin') {
        return 'admin';
      }
      if (
        pathname.includes('/digital-bill') ||
        pathname.includes('/bill') ||
        viewParam === 'bill' ||
        viewParam === 'digital-bill'
      ) {
        return 'digital-bill';
      }
      if (pathname.includes('/order-success') || viewParam === 'order-success') {
        return 'order-success';
      }
    }
    return 'landing';
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Firestore status
  const [isFirestoreLoading, setIsFirestoreLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isOnlineFirestore, setIsOnlineFirestore] = useState(false);

  // Menu items: loaded directly from existing local catalog (NO MENU collection used)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const isMenuLoading = false;
  const products = menuItems;

  const toggleItemAvailability = useCallback((id: string, available: boolean) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, available } : item))
    );
  }, []);

  // Real-time Orders from existing Firestore ORDERS collection
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_BACKUP_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Active Customer Order
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Parse URL query params on navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const pathname = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const seatParam = params.get('seat');
      const screenParam = params.get('screen');
      const viewParam = params.get('view');

      if (screenParam) {
        setScreenNumber(screenParam.trim());
      }
      if (seatParam) {
        setSeatNumber(seatParam.trim().toUpperCase());
      }

      if (
        seatParam ||
        pathname.includes('/menu') ||
        pathname === '/me' ||
        pathname.startsWith('/me/') ||
        viewParam === 'menu'
      ) {
        setCurrentView('menu');
      } else if (pathname.includes('/cart') || viewParam === 'cart') {
        setCurrentView('cart');
      } else if (pathname.includes('/admin') || viewParam === 'admin') {
        setCurrentView('admin');
      } else if (pathname.includes('/payment') || viewParam === 'payment') {
        setCurrentView('payment');
      } else if (
        pathname.includes('/digital-bill') ||
        pathname.includes('/bill') ||
        viewParam === 'bill' ||
        viewParam === 'digital-bill'
      ) {
        setCurrentView('digital-bill');
      } else if (pathname.includes('/order-success') || viewParam === 'order-success') {
        setCurrentView('order-success');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Check initial Firestore network reachability
  useEffect(() => {
    testConnection().then((connected) => {
      setIsOnlineFirestore(connected);
    });
  }, []);

  // Subscribe to all orders in existing Firestore ORDERS collection (preserves historical docs)
  useEffect(() => {
    setIsFirestoreLoading(true);

    const unsubscribe = subscribeToAllOrders(
      (firestoreOrders) => {
        setIsFirestoreLoading(false);
        setIsOnlineFirestore(true);
        setFirestoreError(null);
        setOrders(firestoreOrders);
        try {
          localStorage.setItem(ORDERS_BACKUP_STORAGE_KEY, JSON.stringify(firestoreOrders));
        } catch {
          // ignore
        }
      },
      (err) => {
        setIsFirestoreLoading(false);
        setFirestoreError(err.message || 'Firestore connection error');
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Listen to the active order in real-time
  useEffect(() => {
    if (!activeOrder?.orderId) return;

    const unsub = subscribeToSingleOrder(activeOrder.orderId, (updated) => {
      if (updated) {
        setActiveOrder(updated);
        try {
          localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    });

    return () => {
      unsub();
    };
  }, [activeOrder?.orderId]);

  // Save active order to localStorage whenever it changes
  useEffect(() => {
    try {
      if (activeOrder) {
        localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(activeOrder));
      } else {
        localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [activeOrder]);

  const setSeatInfo = useCallback((screen: string, seat: string) => {
    const cleanSeat = seat.trim().toUpperCase();
    const cleanScreen = screen.trim() || '1';
    setScreenNumber(cleanScreen);
    setSeatNumber(cleanSeat);

    try {
      if (cleanSeat) localStorage.setItem('namma_theatre_seat_v1', cleanSeat);
      if (cleanScreen) localStorage.setItem('namma_theatre_screen_v1', cleanScreen);
    } catch {
      // ignore
    }

    const url = new URL(window.location.href);
    if (cleanSeat) {
      url.searchParams.set('seat', cleanSeat);
    } else {
      url.searchParams.delete('seat');
    }
    if (cleanScreen) {
      url.searchParams.set('screen', cleanScreen);
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  const navigateTo = useCallback((view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (view === 'menu') {
          url.pathname = '/menu';
        } else if (view === 'landing') {
          url.pathname = '/';
        }
        window.history.pushState({}, '', url.toString());
      } catch {
        // ignore
      }
    }
  }, []);

  // Cart operations (Requirement 4)
  const addToCart = useCallback((product: MenuItem) => {
    if (!product.available) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  // GST 5%
  const taxAmount = useMemo(() => {
    return Math.round(subtotal * 0.05 * 10) / 10;
  }, [subtotal]);

  const totalAmount = useMemo(() => {
    return subtotal + taxAmount;
  }, [subtotal, taxAmount]);

  /**
   * Places an order and creates a NEW document inside the existing Firestore ORDERS collection.
   * Does NOT delete or modify any existing historical documents.
   */
  const placeOrder = async (
    optionsOrMethod: PlaceOrderOptions | string,
    legacyNotes?: string
  ): Promise<Order> => {
    let options: PlaceOrderOptions;
    if (typeof optionsOrMethod === 'string') {
      options = {
        paymentMethod: optionsOrMethod,
        customerName: customerName || 'Guest Patron',
        phoneNumber: phoneNumber || '',
        customerNotes: legacyNotes,
      };
    } else {
      options = optionsOrMethod;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `NTF-${randomSuffix}`;

    const resolvedSeat = (options.seatNumber || seatNumber || 'B12').trim().toUpperCase();
    const resolvedScreen = (options.screenNumber || screenNumber || '1').trim();
    const resolvedCustName = (options.customerName || customerName || 'Guest Patron').trim();
    const resolvedPhone = (options.phoneNumber || phoneNumber || '').trim();

    if (resolvedCustName) setCustomerName(resolvedCustName);
    if (resolvedPhone) setPhoneNumber(resolvedPhone);

    const itemsRecord = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity,
      isVeg: item.product.isVeg,
    }));

    const newOrder: Order = {
      orderId: newOrderId,
      customerName: resolvedCustName,
      phoneNumber: resolvedPhone,
      customerDetails: {
        name: resolvedCustName,
        phone: resolvedPhone,
      },
      seatNumber: resolvedSeat,
      screenNumber: resolvedScreen,
      theatreName,
      items: itemsRecord,
      subtotal,
      taxAmount,
      totalAmount,
      total: totalAmount,
      orderStatus: 'Pending',
      status: 'Pending',
      paymentStatus: 'demo_paid',
      paymentMethod: options.paymentMethod || 'UPI (GPAY)',
      createdAt: new Date().toISOString(),
      customerNotes: options.customerNotes?.trim() || undefined,
    };

    // Save as a NEW document strictly inside the existing ORDERS collection
    await createFirestoreOrder(newOrder);

    // Update active order and clear cart
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.orderId !== newOrderId)]);
    setActiveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  /**
   * Updates order status in the existing Firestore ORDERS collection.
   */
  const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
    await updateFirestoreOrderStatus(orderId, status);
    setOrders((prev) =>
      prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: status, status } : o))
    );
    if (activeOrder?.orderId === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, orderStatus: status, status } : null));
    }
  };

  return (
    <TheatreContext.Provider
      value={{
        theatreName,
        screenNumber,
        seatNumber,
        setSeatInfo,
        customerName,
        phoneNumber,
        setCustomerDetails,
        menuItems,
        products,
        isMenuLoading,
        toggleItemAvailability,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        taxAmount,
        totalAmount,
        currentView,
        navigateTo,
        orders,
        activeOrder,
        setActiveOrder,
        placeOrder,
        updateOrderStatus,
        isQrModalOpen,
        setIsQrModalOpen,
        isFirestoreLoading,
        firestoreError,
        isOnlineFirestore,
      }}
    >
      {children}
    </TheatreContext.Provider>
  );
};

export const useTheatre = (): TheatreContextType => {
  const context = useContext(TheatreContext);
  if (!context) {
    throw new Error('useTheatre must be used within a TheatreProvider');
  }
  return context;
};
