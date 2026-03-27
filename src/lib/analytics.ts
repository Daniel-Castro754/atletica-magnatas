import { getProductStockStatus } from './ProductCatalogContext';
import { PRODUCT_CATEGORY_LABELS } from './productConstants';
import type {
  AnalyticsAlert,
  AnalyticsDashboardSnapshot,
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsEventPayload,
  AnalyticsLeaderboardItem,
  AnalyticsPeriodDays,
  AnalyticsTrendPoint,
} from '../types/analytics';
import type { Product } from '../types/cart';
import type { SubmittedOrder } from '../types/order';

export const ANALYTICS_STORAGE_KEY = 'magnatas_analytics_events';

export const ANALYTICS_EVENT_LABELS: Record<AnalyticsEventName, string> = {
  page_view: 'Page view',
  product_view: 'Produto visto',
  add_to_cart: 'Add to cart',
  begin_checkout: 'Inicio de checkout',
  pedido_enviado: 'Pedido enviado',
  event_link_click: 'Clique em evento',
};

export type AnalyticsTrackOptions = {
  dedupeWindowMs?: number;
};

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function padNumber(value: number) {
  return String(value).padStart(2, '0');
}

function toDayKey(date: Date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function isFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value);
}

function sanitizeString(value: unknown, fallback = '') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();
  return trimmedValue || fallback;
}

function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.name !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    typeof candidate.pathname !== 'string'
  ) {
    return false;
  }

  switch (candidate.name) {
    case 'page_view':
      return typeof candidate.pageLabel === 'string';
    case 'product_view':
    case 'add_to_cart':
      return (
        typeof candidate.productId === 'string' &&
        typeof candidate.productName === 'string' &&
        typeof candidate.productCategory === 'string' &&
        isFiniteNumber(candidate.unitPrice) &&
        isFiniteNumber(candidate.quantity)
      );
    case 'begin_checkout':
    case 'pedido_enviado':
      return (
        isFiniteNumber(candidate.cartLineItems) &&
        isFiniteNumber(candidate.cartItemsCount) &&
        isFiniteNumber(candidate.cartTotal)
      );
    case 'event_link_click':
      return (
        typeof candidate.eventId === 'string' &&
        typeof candidate.eventTitle === 'string' &&
        typeof candidate.eventCategory === 'string' &&
        typeof candidate.destination === 'string'
      );
    default:
      return false;
  }
}

export function resolvePublicPageLabel(pathname: string) {
  if (pathname === '/') {
    return 'Home';
  }

  if (pathname === '/loja') {
    return 'Loja';
  }

  if (pathname === '/carrinho') {
    return 'Carrinho';
  }

  if (pathname === '/magnatas') {
    return 'Institucional';
  }

  if (pathname === '/eventos') {
    return 'Eventos';
  }

  if (pathname.startsWith('/eventos/')) {
    return 'Evento';
  }

  if (pathname.startsWith('/produto/')) {
    return 'Produto';
  }

  return pathname;
}

export function createAnalyticsEvent(payload: AnalyticsEventPayload): AnalyticsEvent {
  return {
    ...payload,
    id: createId('analytics'),
    createdAt: new Date().toISOString(),
  } as AnalyticsEvent;
}

function assertUnreachableAnalyticsPayload(value: never): never {
  throw new Error(`Unsupported analytics event payload: ${JSON.stringify(value)}`);
}

function createEventFingerprint(payload: AnalyticsEventPayload) {
  switch (payload.name) {
    case 'page_view':
      return `${payload.name}|${payload.pathname}|${payload.pageLabel}`;
    case 'product_view':
    case 'add_to_cart':
      return [
        payload.name,
        payload.pathname,
        payload.productId,
        payload.productName,
        payload.productCategory,
        payload.unitPrice,
        payload.quantity,
      ].join('|');
    case 'begin_checkout':
      return [
        payload.name,
        payload.pathname,
        payload.cartLineItems,
        payload.cartItemsCount,
        payload.cartTotal,
      ].join('|');
    case 'pedido_enviado':
      return [
        payload.name,
        payload.pathname,
        payload.cartLineItems,
        payload.cartItemsCount,
        payload.cartTotal,
        payload.orderId || '',
      ].join('|');
    case 'event_link_click':
      return [
        payload.name,
        payload.pathname,
        payload.eventId,
        payload.eventTitle,
        payload.eventCategory,
        payload.destination,
      ].join('|');
    default:
      return assertUnreachableAnalyticsPayload(payload);
  }
}

export function findRecentDuplicateEvent(
  events: AnalyticsEvent[],
  payload: AnalyticsEventPayload,
  options?: AnalyticsTrackOptions
) {
  const dedupeWindowMs = options?.dedupeWindowMs ?? 0;

  if (dedupeWindowMs <= 0) {
    return null;
  }

  const fingerprint = createEventFingerprint(payload);
  const now = Date.now();

  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    const eventTimestamp = new Date(event.createdAt).getTime();

    if (now - eventTimestamp > dedupeWindowMs) {
      break;
    }

    const candidatePayload = { ...event };
    delete (candidatePayload as Partial<AnalyticsEvent>).id;
    delete (candidatePayload as Partial<AnalyticsEvent>).createdAt;

    if (createEventFingerprint(candidatePayload as AnalyticsEventPayload) === fingerprint) {
      return event;
    }
  }

  return null;
}

export function loadAnalyticsEvents() {
  if (typeof window === 'undefined') {
    return [] as AnalyticsEvent[];
  }

  try {
    const savedEvents = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);

    if (!savedEvents) {
      return [] as AnalyticsEvent[];
    }

    const parsedEvents = JSON.parse(savedEvents);
    return Array.isArray(parsedEvents) ? parsedEvents.filter(isAnalyticsEvent) : [];
  } catch {
    return [] as AnalyticsEvent[];
  }
}

export function persistAnalyticsEvents(events: AnalyticsEvent[]) {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events));
    } catch {
      return events;
    }
  }

  return events;
}

export function clearStoredAnalyticsEvents() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    } catch {
      return;
    }
  }
}

export function filterEventsByPeriod(events: AnalyticsEvent[], periodDays: AnalyticsPeriodDays) {
  const cutoffDate = new Date();
  cutoffDate.setHours(0, 0, 0, 0);
  cutoffDate.setDate(cutoffDate.getDate() - (periodDays - 1));
  const cutoffTimestamp = cutoffDate.getTime();

  return events.filter((event) => new Date(event.createdAt).getTime() >= cutoffTimestamp);
}

function filterOrdersByPeriod(orders: SubmittedOrder[], periodDays: AnalyticsPeriodDays) {
  const cutoffDate = new Date();
  cutoffDate.setHours(0, 0, 0, 0);
  cutoffDate.setDate(cutoffDate.getDate() - (periodDays - 1));
  const cutoffTimestamp = cutoffDate.getTime();

  return orders.filter((order) => new Date(order.createdAt).getTime() >= cutoffTimestamp);
}

function sortLeaderboard(items: AnalyticsLeaderboardItem[]) {
  return [...items].sort((a, b) => {
    const quantityDiff = (b.quantity ?? 0) - (a.quantity ?? 0);

    if (quantityDiff !== 0) {
      return quantityDiff;
    }

    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.label.localeCompare(b.label, 'pt-BR');
  });
}

function buildPageViewLeaderboard(events: AnalyticsEvent[]) {
  const counts = new Map<string, AnalyticsLeaderboardItem>();

  events.forEach((event) => {
    if (event.name !== 'page_view') {
      return;
    }

    const existing = counts.get(event.pathname);
    if (!existing) {
      counts.set(event.pathname, {
        key: event.pathname,
        label: event.pageLabel,
        count: 1,
        secondaryLabel: event.pathname,
      });
      return;
    }

    existing.count += 1;
  });

  return sortLeaderboard([...counts.values()]).slice(0, 8);
}

function buildProductLeaderboard(
  events: AnalyticsEvent[],
  eventName: 'product_view' | 'add_to_cart'
) {
  const counts = new Map<string, AnalyticsLeaderboardItem>();

  events.forEach((event) => {
    if (event.name !== eventName) {
      return;
    }

    const existing = counts.get(event.productId);
    const quantity = event.quantity || 0;

    if (!existing) {
      counts.set(event.productId, {
        key: event.productId,
        label: event.productName,
        count: 1,
        quantity,
        secondaryLabel: PRODUCT_CATEGORY_LABELS[event.productCategory],
      });
      return;
    }

    existing.count += 1;
    existing.quantity = (existing.quantity ?? 0) + quantity;
  });

  return sortLeaderboard([...counts.values()]).slice(0, 8);
}

function buildTrendPoints(
  events: AnalyticsEvent[],
  periodDays: AnalyticsPeriodDays
): AnalyticsTrendPoint[] {
  const buckets = new Map<string, AnalyticsTrendPoint>();

  for (let offset = periodDays - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - offset);
    const dayKey = toDayKey(date);

    buckets.set(dayKey, {
      date: dayKey,
      total: 0,
      byEvent: {},
    });
  }

  events.forEach((event) => {
    const dayKey = toDayKey(new Date(event.createdAt));
    const bucket = buckets.get(dayKey);

    if (!bucket) {
      return;
    }

    bucket.total += 1;
    bucket.byEvent[event.name] = (bucket.byEvent[event.name] || 0) + 1;
  });

  return [...buckets.values()];
}

function buildAlerts(
  events: AnalyticsEvent[],
  orders: SubmittedOrder[],
  products: Product[],
  productViews: AnalyticsLeaderboardItem[],
  cartAdds: AnalyticsLeaderboardItem[]
) {
  const alerts: AnalyticsAlert[] = [];
  const pageViewsCount = events.filter((event) => event.name === 'page_view').length;
  const productViewsCount = events.filter((event) => event.name === 'product_view').length;
  const cartAddsCount = events.filter((event) => event.name === 'add_to_cart').length;
  const checkoutBeginsCount = events.filter((event) => event.name === 'begin_checkout').length;

  if (pageViewsCount > 0 && productViewsCount === 0) {
    alerts.push({
      id: 'visitas-sem-produtos',
      tone: 'warning',
      title: 'Ha visitas sem aprofundamento na loja',
      description:
        'As paginas publicas receberam acessos no periodo, mas nenhum produto foi aberto em detalhe.',
    });
  }

  if (productViewsCount > 0 && cartAddsCount === 0) {
    alerts.push({
      id: 'produtos-sem-carrinho',
      tone: 'warning',
      title: 'Produtos vistos ainda nao viraram carrinho',
      description:
        'Ja existem visualizacoes de produto, mas nenhum item foi adicionado ao carrinho neste periodo.',
    });
  }

  if (cartAddsCount > 0 && orders.length === 0) {
    alerts.push({
      id: 'carrinho-sem-pedido',
      tone: 'info',
      title: 'Existe intencao de compra sem pedido enviado',
      description:
        'Houve adicoes ao carrinho, mas nenhum pedido foi enviado e persistido ate agora.',
    });
  }

  if (checkoutBeginsCount > orders.length && orders.length > 0) {
    alerts.push({
      id: 'checkout-incompleto',
      tone: 'info',
      title: 'Parte dos checkouts nao virou pedido enviado',
      description:
        'Nem todo inicio de checkout foi concluido com envio de pedido. Vale revisar clareza do fluxo e contato.',
    });
  }

  const mostViewedWithoutCart = productViews.find(
    (item) => !cartAdds.some((cartAdd) => cartAdd.key === item.key)
  );

  if (mostViewedWithoutCart && mostViewedWithoutCart.count >= 2) {
    alerts.push({
      id: 'produto-visto-sem-carrinho',
      tone: 'info',
      title: `Atencao para ${mostViewedWithoutCart.label}`,
      description:
        'Este produto esta entre os mais vistos, mas ainda nao apareceu nas adicoes ao carrinho no mesmo periodo.',
    });
  }

  const lowStockHotProduct = cartAdds.find((item) => {
    const product = products.find((candidate) => candidate.id === item.key);
    return product && getProductStockStatus(product.stock) !== 'in_stock';
  });

  if (lowStockHotProduct) {
    alerts.push({
      id: 'produto-quente-com-estoque-curto',
      tone: 'warning',
      title: 'Produto com procura e estoque sensivel',
      description:
        `${lowStockHotProduct.label} esta recebendo adicoes ao carrinho enquanto opera com estoque baixo ou zerado.`,
    });
  }

  if (orders.length > 0) {
    alerts.push({
      id: 'pedidos-reais',
      tone: 'success',
      title: 'Pedidos reais ja estao entrando no painel',
      description:
        'Os eventos de pedido enviado estao acompanhados por pedidos persistidos, entao o funil ja tem uma base operacional real.',
    });
  }

  return alerts.slice(0, 4);
}

export function buildAnalyticsDashboardSnapshot({
  events,
  orders,
  products,
  periodDays,
}: {
  events: AnalyticsEvent[];
  orders: SubmittedOrder[];
  products: Product[];
  periodDays: AnalyticsPeriodDays;
}): AnalyticsDashboardSnapshot {
  const filteredEvents = filterEventsByPeriod(events, periodDays);
  const filteredOrders = filterOrdersByPeriod(orders, periodDays);
  const pageViews = buildPageViewLeaderboard(filteredEvents);
  const productViews = buildProductLeaderboard(filteredEvents, 'product_view');
  const cartAdds = buildProductLeaderboard(filteredEvents, 'add_to_cart');
  const trends = buildTrendPoints(filteredEvents, periodDays);
  const eventCounts = filteredEvents.reduce(
    (counts, event) => ({
      ...counts,
      [event.name]: (counts[event.name] || 0) + 1,
    }),
    {} as Partial<Record<AnalyticsEventName, number>>
  );
  const activeEventNames = (Object.keys(eventCounts) as AnalyticsEventName[]).filter(
    (eventName) => (eventCounts[eventName] || 0) > 0
  );

  return {
    periodDays,
    totalEvents: filteredEvents.length,
    eventTotals: eventCounts,
    pageViews,
    productViews,
    cartAdds,
    ordersSentCount: filteredOrders.length,
    trends,
    activeEventNames,
    alerts: buildAlerts(filteredEvents, filteredOrders, products, productViews, cartAdds),
  };
}

export function formatAnalyticsDateLabel(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

export function formatAnalyticsDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function getSafePathname(pathname: string) {
  return sanitizeString(pathname, '/');
}
