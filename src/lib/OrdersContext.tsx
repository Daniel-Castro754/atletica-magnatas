import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useAnalytics } from './AnalyticsContext';
import {
  clearStoredOrders,
  createSubmittedOrder,
  loadOrders,
  ORDER_STATUSES,
  persistOrders,
  syncOrdersFromSupabase,
  updateSubmittedOrderStatus,
} from './orders';
import { supabase } from './supabase';
import type { CartItem } from '../types/cart';
import type { OrderStatus, SubmitOrderDraft, SubmittedOrder } from '../types/order';

const CLOUD_TIMEOUT = 4000;

type OrdersContextValue = {
  orders: SubmittedOrder[];
  submitOrder: (draft: SubmitOrderDraft, cart: CartItem[], pathname: string) => SubmittedOrder;
  updateOrderStatus: (orderId: string, nextStatus: OrderStatus, note?: string) => void;
  clearOrders: () => void;
  /** Re-sincroniza pedidos do Supabase. Útil após login do admin. */
  refreshOrders: () => Promise<void>;
  isInitialized: boolean;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: PropsWithChildren) {
  const { trackPedidoEnviado } = useAnalytics();
  const [isInitialized, setIsInitialized] = useState(!supabase);
  const [orders, setOrders] = useState<SubmittedOrder[]>(() =>
    supabase ? [] : loadOrders()
  );

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      setOrders(loadOrders());
      setIsInitialized(true);
    }, CLOUD_TIMEOUT);

    syncOrdersFromSupabase()
      .then((cloudOrders) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setOrders(cloudOrders ?? loadOrders());
        setIsInitialized(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setOrders(loadOrders());
        setIsInitialized(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  const actions = useMemo(
    () => ({
      submitOrder(draft: SubmitOrderDraft, cart: CartItem[], pathname: string) {
        const nextOrder = createSubmittedOrder(draft, cart);

        setOrders((currentOrders) => persistOrders([nextOrder, ...currentOrders]));

        trackPedidoEnviado({
          pathname,
          cartLineItems: nextOrder.lineItemsCount,
          cartItemsCount: nextOrder.itemsCount,
          cartTotal: nextOrder.totals.total,
          orderId: nextOrder.id,
        });

        return nextOrder;
      },
      updateOrderStatus(orderId: string, nextStatus: OrderStatus, note?: string) {
        if (!ORDER_STATUSES.includes(nextStatus)) {
          return;
        }

        setOrders((currentOrders) =>
          persistOrders(
            currentOrders.map((order) =>
              order.id === orderId
                ? updateSubmittedOrderStatus(order, nextStatus, note)
                : order
            )
          )
        );
      },
      clearOrders() {
        clearStoredOrders();
        setOrders([]);
      },
      async refreshOrders() {
        const cloudOrders = await syncOrdersFromSupabase();
        if (cloudOrders !== null) setOrders(cloudOrders);
      },
    }),
    [trackPedidoEnviado]
  );

  const value = useMemo(
    () => ({
      orders,
      isInitialized,
      ...actions,
    }),
    [actions, orders, isInitialized]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);

  if (!context) {
    throw new Error('useOrders deve ser usado dentro de OrdersProvider');
  }

  return context;
}
