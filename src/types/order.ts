import type { CartItem } from './cart';

export type OrderStatus =
  | 'pedido_enviado'
  | 'pedido_recebido'
  | 'em_preparacao'
  | 'concluido'
  | 'cancelado';

export type OrderPaymentMode = 'manual_review' | 'gateway_checkout';

export type OrderPaymentGateway =
  | 'manual'
  | 'mercado_pago'
  | 'stripe'
  | 'pagseguro'
  | 'custom';

export type OrderPaymentStatus =
  | 'not_started'
  | 'awaiting_payment'
  | 'pending_confirmation'
  | 'paid'
  | 'failed'
  | 'refunded';

export type OrderCurrency = 'BRL';

export type SubmitOrderDraft = {
  customerName: string;
  contact: string;
  notes: string;
};

export type OrderCustomer = {
  name: string;
  contact: string;
  notes: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderTotals = {
  subtotal: number;
  discounts: number;
  shipping: number;
  total: number;
  currency: OrderCurrency;
};

export type OrderStatusHistoryEntry = {
  status: OrderStatus;
  changedAt: string;
  note?: string;
};

export type OrderPaymentInfo = {
  mode: OrderPaymentMode;
  gateway: OrderPaymentGateway;
  status: OrderPaymentStatus;
  amount: number;
  currency: OrderCurrency;
  providerReference?: string;
  checkoutUrl?: string;
  paidAt?: string;
  updatedAt: string;
  metadata: Record<string, string>;
};

export type SubmittedOrder = {
  id: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  lineItemsCount: number;
  itemsCount: number;
  totals: OrderTotals;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryEntry[];
  payment: OrderPaymentInfo;
  source: 'storefront_web';
};

export type OrdersStoragePayload = {
  version: 2;
  orders: SubmittedOrder[];
};

export type LegacySubmittedOrder = {
  id: string;
  createdAt: string;
  customerName: string;
  contact: string;
  notes: string;
  items: CartItem[];
  itemsCount: number;
  total: number;
  status: 'sent';
};
