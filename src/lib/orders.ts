import type { CartItem } from '../types/cart';
import type {
  LegacySubmittedOrder,
  OrderItem,
  OrderPaymentGateway,
  OrderPaymentInfo,
  OrderPaymentMode,
  OrderPaymentStatus,
  OrderStatus,
  OrderStatusHistoryEntry,
  OrdersStoragePayload,
  SubmitOrderDraft,
  SubmittedOrder,
} from '../types/order';

export const ORDER_STORAGE_KEY = 'magnatas_orders';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pedido_enviado: 'Pedido enviado',
  pedido_recebido: 'Pedido recebido',
  em_preparacao: 'Em preparacao',
  concluido: 'Concluido',
  cancelado: 'Cancelado',
};

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  not_started: 'Nao iniciado',
  awaiting_payment: 'Aguardando pagamento',
  pending_confirmation: 'Confirmacao pendente',
  paid: 'Pago',
  failed: 'Falhou',
  refunded: 'Estornado',
};

export const ORDER_PAYMENT_MODE_LABELS: Record<OrderPaymentMode, string> = {
  manual_review: 'Fluxo manual',
  gateway_checkout: 'Checkout em gateway',
};

export const ORDER_PAYMENT_GATEWAY_LABELS: Record<OrderPaymentGateway, string> = {
  manual: 'Manual',
  mercado_pago: 'Mercado Pago',
  stripe: 'Stripe',
  pagseguro: 'PagSeguro',
  custom: 'Customizado',
};

export const ORDER_STATUSES: OrderStatus[] = [
  'pedido_enviado',
  'pedido_recebido',
  'em_preparacao',
  'concluido',
  'cancelado',
];

const ORDER_PAYMENT_MODES: OrderPaymentMode[] = ['manual_review', 'gateway_checkout'];
const ORDER_PAYMENT_GATEWAYS: OrderPaymentGateway[] = [
  'manual',
  'mercado_pago',
  'stripe',
  'pagseguro',
  'custom',
];
const ORDER_PAYMENT_STATUSES: OrderPaymentStatus[] = [
  'not_started',
  'awaiting_payment',
  'pending_confirmation',
  'paid',
  'failed',
  'refunded',
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeString(value: unknown, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();
  return trimmedValue || fallback;
}

function sanitizeNumber(value: unknown, fallback = 0) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(0, Math.round(parsedValue * 100) / 100);
}

function sanitizeInteger(value: unknown, fallback = 0, min = 0) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(min, Math.floor(parsedValue));
}

function sanitizeEnum<T extends string>(value: unknown, allowedValues: T[], fallback: T) {
  if (typeof value === 'string' && allowedValues.includes(value as T)) {
    return value as T;
  }

  return fallback;
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.productId === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.price === 'number' &&
    typeof candidate.imageUrl === 'string' &&
    typeof candidate.size === 'string' &&
    typeof candidate.quantity === 'number'
  );
}

function isLegacySubmittedOrder(value: unknown): value is LegacySubmittedOrder {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.customerName === 'string' &&
    typeof candidate.contact === 'string' &&
    typeof candidate.notes === 'string' &&
    candidate.status === 'sent' &&
    typeof candidate.itemsCount === 'number' &&
    typeof candidate.total === 'number' &&
    Array.isArray(candidate.items) &&
    candidate.items.every(isCartItem)
  );
}

function isStoragePayload(value: unknown): value is OrdersStoragePayload {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return candidate.version === 2 && Array.isArray(candidate.orders);
}

function createOrderCode(createdAt: string) {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const stamp = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MAG-${year}${month}${day}-${stamp}`;
}

function createOrderStatusHistoryEntry(
  status: OrderStatus,
  changedAt: string,
  note?: string
): OrderStatusHistoryEntry {
  const safeNote = sanitizeString(note);

  return safeNote ? { status, changedAt, note: safeNote } : { status, changedAt };
}

function createDefaultPaymentInfo(amount: number, updatedAt: string): OrderPaymentInfo {
  return {
    mode: 'manual_review',
    gateway: 'manual',
    status: 'not_started',
    amount,
    currency: 'BRL',
    updatedAt,
    metadata: {},
  };
}

function createOrderItemFromCartItem(item: CartItem, index: number): OrderItem {
  const quantity = sanitizeInteger(item.quantity, 1, 1);
  const unitPrice = sanitizeNumber(item.price, 0);

  return {
    id: `${item.productId}-${item.size}-${index + 1}`,
    productId: sanitizeString(item.productId, `produto-${index + 1}`),
    name: sanitizeString(item.name, `Produto ${index + 1}`),
    imageUrl: sanitizeString(item.imageUrl),
    size: sanitizeString(item.size, 'UN'),
    quantity,
    unitPrice,
    lineTotal: Math.round(unitPrice * quantity * 100) / 100,
  };
}

function createOrderItemsFromCart(cart: CartItem[]) {
  return cart.map((item, index) => createOrderItemFromCartItem(item, index));
}

function normalizeOrderItem(input: unknown, index: number): OrderItem {
  const candidate = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const quantity = sanitizeInteger(candidate.quantity, 1, 1);
  const unitPrice = sanitizeNumber(candidate.unitPrice ?? candidate.price, 0);

  return {
    id: sanitizeString(candidate.id, `item-${index + 1}`),
    productId: sanitizeString(candidate.productId, `produto-${index + 1}`),
    name: sanitizeString(candidate.name, `Produto ${index + 1}`),
    imageUrl: sanitizeString(candidate.imageUrl),
    size: sanitizeString(candidate.size, 'UN'),
    quantity,
    unitPrice,
    lineTotal: sanitizeNumber(candidate.lineTotal, unitPrice * quantity),
  };
}

function buildTotalsFromItems(items: OrderItem[], rawTotal?: unknown) {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const total = sanitizeNumber(rawTotal, subtotal);

  return {
    subtotal,
    discounts: 0,
    shipping: 0,
    total,
    currency: 'BRL' as const,
  };
}

function migrateLegacyOrder(order: LegacySubmittedOrder): SubmittedOrder {
  const createdAt = sanitizeString(order.createdAt, new Date().toISOString());
  const items = createOrderItemsFromCart(order.items);
  const totals = buildTotalsFromItems(items, order.total);
  const status: OrderStatus = 'pedido_enviado';

  return {
    id: sanitizeString(order.id, createId('pedido')),
    code: createOrderCode(createdAt),
    createdAt,
    updatedAt: createdAt,
    customer: {
      name: sanitizeString(order.customerName, 'Cliente Magnatas'),
      contact: sanitizeString(order.contact, 'Contato nao informado'),
      notes: sanitizeString(order.notes),
    },
    items,
    lineItemsCount: items.length,
    itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totals,
    status,
    statusHistory: [createOrderStatusHistoryEntry(status, createdAt, 'Migrado do formato legado')],
    payment: createDefaultPaymentInfo(totals.total, createdAt),
    source: 'storefront_web',
  };
}

function normalizePaymentInfo(input: unknown, fallbackAmount: number, updatedAt: string): OrderPaymentInfo {
  const candidate = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const metadataCandidate =
    candidate.metadata && typeof candidate.metadata === 'object'
      ? (candidate.metadata as Record<string, unknown>)
      : {};

  const metadata = Object.fromEntries(
    Object.entries(metadataCandidate)
      .map(([key, value]) => [key, typeof value === 'string' ? value : ''])
      .filter((entry) => entry[0] && entry[1])
  );

  return {
    mode: sanitizeEnum(candidate.mode, ORDER_PAYMENT_MODES, 'manual_review'),
    gateway: sanitizeEnum(candidate.gateway, ORDER_PAYMENT_GATEWAYS, 'manual'),
    status: sanitizeEnum(candidate.status, ORDER_PAYMENT_STATUSES, 'not_started'),
    amount: sanitizeNumber(candidate.amount, fallbackAmount),
    currency: 'BRL',
    providerReference: sanitizeString(candidate.providerReference),
    checkoutUrl: sanitizeString(candidate.checkoutUrl),
    paidAt: sanitizeString(candidate.paidAt),
    updatedAt: sanitizeString(candidate.updatedAt, updatedAt),
    metadata,
  };
}

function normalizeStatusHistory(
  input: unknown,
  fallbackStatus: OrderStatus,
  createdAt: string
) {
  if (!Array.isArray(input) || !input.length) {
    return [createOrderStatusHistoryEntry(fallbackStatus, createdAt)];
  }

  const entries = input
    .map((entry) => {
      const candidate =
        entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};
      const status = sanitizeEnum(candidate.status, ORDER_STATUSES, fallbackStatus);
      const changedAt = sanitizeString(candidate.changedAt, createdAt);
      const note = sanitizeString(candidate.note);
      return createOrderStatusHistoryEntry(status, changedAt, note);
    })
    .filter(Boolean);

  return entries.length ? entries : [createOrderStatusHistoryEntry(fallbackStatus, createdAt)];
}

function normalizeSubmittedOrder(input: unknown): SubmittedOrder | null {
  if (isLegacySubmittedOrder(input)) {
    return migrateLegacyOrder(input);
  }

  if (!input || typeof input !== 'object') {
    return null;
  }

  const candidate = input as Record<string, unknown>;
  const createdAt = sanitizeString(candidate.createdAt, new Date().toISOString());
  const updatedAt = sanitizeString(candidate.updatedAt, createdAt);
  const itemsSource = Array.isArray(candidate.items) ? candidate.items : [];
  const items = itemsSource.map((item, index) => normalizeOrderItem(item, index));
  const status = sanitizeEnum(candidate.status, ORDER_STATUSES, 'pedido_enviado');
  const totalsCandidate =
    candidate.totals && typeof candidate.totals === 'object'
      ? (candidate.totals as Record<string, unknown>)
      : {};
  const totals = {
    ...buildTotalsFromItems(items, candidate.total),
    subtotal: sanitizeNumber(totalsCandidate.subtotal, items.reduce((sum, item) => sum + item.lineTotal, 0)),
    discounts: sanitizeNumber(totalsCandidate.discounts, 0),
    shipping: sanitizeNumber(totalsCandidate.shipping, 0),
    total: sanitizeNumber(
      totalsCandidate.total,
      sanitizeNumber(candidate.total, items.reduce((sum, item) => sum + item.lineTotal, 0))
    ),
    currency: 'BRL' as const,
  };

  const customerCandidate =
    candidate.customer && typeof candidate.customer === 'object'
      ? (candidate.customer as Record<string, unknown>)
      : {};

  return {
    id: sanitizeString(candidate.id, createId('pedido')),
    code: sanitizeString(candidate.code, createOrderCode(createdAt)),
    createdAt,
    updatedAt,
    customer: {
      name: sanitizeString(
        customerCandidate.name ?? candidate.customerName,
        'Cliente Magnatas'
      ),
      contact: sanitizeString(
        customerCandidate.contact ?? candidate.contact,
        'Contato nao informado'
      ),
      notes: sanitizeString(customerCandidate.notes ?? candidate.notes),
    },
    items,
    lineItemsCount: sanitizeInteger(candidate.lineItemsCount, items.length, 0),
    itemsCount: sanitizeInteger(
      candidate.itemsCount,
      items.reduce((sum, item) => sum + item.quantity, 0),
      0
    ),
    totals,
    status,
    statusHistory: normalizeStatusHistory(candidate.statusHistory, status, createdAt),
    payment: normalizePaymentInfo(candidate.payment, totals.total, updatedAt),
    source: 'storefront_web',
  };
}

function sortOrders(orders: SubmittedOrder[]) {
  return [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createSubmittedOrder(draft: SubmitOrderDraft, cart: CartItem[]): SubmittedOrder {
  const createdAt = new Date().toISOString();
  const items = createOrderItemsFromCart(cart);
  const totals = buildTotalsFromItems(items);
  const status: OrderStatus = 'pedido_enviado';

  return {
    id: createId('pedido'),
    code: createOrderCode(createdAt),
    createdAt,
    updatedAt: createdAt,
    customer: {
      name: sanitizeString(draft.customerName, 'Cliente Magnatas'),
      contact: sanitizeString(draft.contact, 'Contato nao informado'),
      notes: sanitizeString(draft.notes),
    },
    items,
    lineItemsCount: items.length,
    itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totals,
    status,
    statusHistory: [
      createOrderStatusHistoryEntry(
        status,
        createdAt,
        'Pedido enviado pelo formulario da loja'
      ),
    ],
    payment: createDefaultPaymentInfo(totals.total, createdAt),
    source: 'storefront_web',
  };
}

export function updateSubmittedOrderStatus(
  order: SubmittedOrder,
  nextStatus: OrderStatus,
  note?: string
): SubmittedOrder {
  if (order.status === nextStatus && !sanitizeString(note)) {
    return order;
  }

  const updatedAt = new Date().toISOString();

  return {
    ...order,
    status: nextStatus,
    updatedAt,
    statusHistory: [
      createOrderStatusHistoryEntry(nextStatus, updatedAt, note),
      ...order.statusHistory,
    ],
    payment: {
      ...order.payment,
      updatedAt,
    },
  };
}

export function loadOrders() {
  if (typeof window === 'undefined') {
    return [] as SubmittedOrder[];
  }

  try {
    const savedOrders = window.localStorage.getItem(ORDER_STORAGE_KEY);

    if (!savedOrders) {
      return [] as SubmittedOrder[];
    }

    const parsed = JSON.parse(savedOrders) as unknown;
    const ordersSource = isStoragePayload(parsed)
      ? parsed.orders
      : Array.isArray(parsed)
        ? parsed
        : [];

    return sortOrders(
      ordersSource
        .map((order) => normalizeSubmittedOrder(order))
        .filter((order): order is SubmittedOrder => Boolean(order))
    );
  } catch {
    return [] as SubmittedOrder[];
  }
}

export function persistOrders(orders: SubmittedOrder[]) {
  const normalizedOrders = sortOrders(
    orders
      .map((order) => normalizeSubmittedOrder(order))
      .filter((order): order is SubmittedOrder => Boolean(order))
  );

  if (typeof window !== 'undefined') {
    try {
      const payload: OrdersStoragePayload = {
        version: 2,
        orders: normalizedOrders,
      };

      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      return normalizedOrders;
    }
  }

  return normalizedOrders;
}

export function clearStoredOrders() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(ORDER_STORAGE_KEY);
    } catch {
      return;
    }
  }
}
