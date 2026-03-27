import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { useAnalytics } from './AnalyticsContext';
import {
  clearStoredOrders,
  createSubmittedOrder,
  loadOrders,
  ORDER_STATUSES,
  persistOrders,
  updateSubmittedOrderStatus,
} from './orders';
import type { CartItem } from '../types/cart';
import type { OrderStatus, SubmitOrderDraft, SubmittedOrder } from '../types/order';

type OrdersContextValue = {
  orders: SubmittedOrder[];
  submitOrder: (draft: SubmitOrderDraft, cart: CartItem[], pathname: string) => SubmittedOrder;
  updateOrderStatus: (orderId: string, nextStatus: OrderStatus, note?: string) => void;
  clearOrders: () => void;
};

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: PropsWithChildren) {
  const { trackPedidoEnviado } = useAnalytics();
  const [orders, setOrders] = useState<SubmittedOrder[]>(loadOrders);

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
    }),
    [trackPedidoEnviado]
  );

  const value = useMemo(
    () => ({
      orders,
      ...actions,
    }),
    [actions, orders]
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
