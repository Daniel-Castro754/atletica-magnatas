import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicPageViewTracker from '../analytics/PublicPageViewTracker';
import { useAnalytics } from '../../lib/AnalyticsContext';
import type { CartItem, Product } from '../../types/cart';
import { initEasterEggs } from '../../utils/easterEggs';
import Footer from './Footer';
import Navbar from './Navbar';

function EasterEggsInit() {
  const location = useLocation();
  useEffect(() => initEasterEggs(), [location.pathname]);
  return null;
}

type CartContextValue = {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = 'magnatas_cart';

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(item: unknown): item is CartItem {
  if (!item || typeof item !== 'object') {
    return false;
  }

  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.productId === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.price === 'number' &&
    typeof candidate.imageUrl === 'string' &&
    typeof candidate.size === 'string' &&
    typeof candidate.quantity === 'number'
  );
}

function getInitialCart() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);
    return Array.isArray(parsedCart) ? parsedCart.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart deve ser usado dentro do shell publico com provider de carrinho');
  }

  return context;
}

export function PreviewCartProvider({ children }: PropsWithChildren) {
  const value = useMemo<CartContextValue>(
    () => ({
      cart: [],
      cartCount: 0,
      cartTotal: 0,
      addToCart: () => undefined,
      removeFromCart: () => undefined,
      updateQuantity: () => undefined,
      clearCart: () => undefined,
    }),
    []
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function CartProvider({ children }: PropsWithChildren) {
  const [cart, setCart] = useState<CartItem[]>(getInitialCart);
  const location = useLocation();
  const { trackAddToCart } = useAnalytics();

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      return;
    }
  }, [cart]);

  function addToCart(product: Product, size: string, quantity = 1) {
    const parsedQuantity = Number(quantity);
    const safeQuantity = Number.isFinite(parsedQuantity)
      ? Math.max(1, Math.floor(parsedQuantity))
      : 1;
    const safeSize = size || product.availableSizes[0] || 'UN';

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.productId === product.id && item.size === safeSize
      );

      if (!existingItem) {
        return [
          ...currentCart,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            size: safeSize,
            quantity: safeQuantity,
          },
        ];
      }

      return currentCart.map((item) =>
        item.productId === product.id && item.size === safeSize
          ? { ...item, quantity: item.quantity + safeQuantity }
          : item
      );
    });

    trackAddToCart(product, safeQuantity, location.pathname);
  }

  function removeFromCart(productId: string, size: string) {
    setCart((currentCart) =>
      currentCart.filter((item) => !(item.productId === productId && item.size === size))
    );
  }

  function updateQuantity(productId: string, size: string, quantity: number) {
    const parsedQuantity = Number(quantity);
    const safeQuantity = Number.isFinite(parsedQuantity) ? Math.floor(parsedQuantity) : 0;

    if (safeQuantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity: safeQuantity }
          : item
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const value: CartContextValue = {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function PublicShell({
  children,
  trackPageViews = false,
}: PropsWithChildren<{ trackPageViews?: boolean }>) {
  return (
    <div className="app-shell">
      <EasterEggsInit />
      {trackPageViews && <PublicPageViewTracker />}
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}

export default function AppLayout() {
  return (
    <CartProvider>
      <PublicShell trackPageViews>
        <Outlet />
      </PublicShell>
    </CartProvider>
  );
}
