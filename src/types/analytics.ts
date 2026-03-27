import type { ProductCategory } from './cart';

export type AnalyticsEventName =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'begin_checkout'
  | 'pedido_enviado'
  | 'event_link_click';

export type AnalyticsPeriodDays = 7 | 30 | 90;

export type AnalyticsEventBase = {
  id: string;
  name: AnalyticsEventName;
  createdAt: string;
  pathname: string;
};

export type PageViewAnalyticsEvent = AnalyticsEventBase & {
  name: 'page_view';
  pageLabel: string;
};

export type ProductAnalyticsEvent = AnalyticsEventBase & {
  name: 'product_view' | 'add_to_cart';
  productId: string;
  productName: string;
  productCategory: ProductCategory;
  unitPrice: number;
  quantity: number;
};

export type CheckoutAnalyticsEvent = AnalyticsEventBase & {
  name: 'begin_checkout' | 'pedido_enviado';
  cartLineItems: number;
  cartItemsCount: number;
  cartTotal: number;
  orderId?: string;
};

export type EventLinkAnalyticsEvent = AnalyticsEventBase & {
  name: 'event_link_click';
  eventId: string;
  eventTitle: string;
  eventCategory: string;
  destination: string;
};

export type AnalyticsEvent =
  | PageViewAnalyticsEvent
  | ProductAnalyticsEvent
  | CheckoutAnalyticsEvent
  | EventLinkAnalyticsEvent;

export type AnalyticsEventPayload =
  | Omit<PageViewAnalyticsEvent, 'id' | 'createdAt'>
  | Omit<ProductAnalyticsEvent, 'id' | 'createdAt'>
  | Omit<CheckoutAnalyticsEvent, 'id' | 'createdAt'>
  | Omit<EventLinkAnalyticsEvent, 'id' | 'createdAt'>;

export type AnalyticsLeaderboardItem = {
  key: string;
  label: string;
  count: number;
  quantity?: number;
  secondaryLabel?: string;
};

export type AnalyticsTrendPoint = {
  date: string;
  total: number;
  byEvent: Partial<Record<AnalyticsEventName, number>>;
};

export type AnalyticsAlertTone = 'info' | 'warning' | 'success';

export type AnalyticsAlert = {
  id: string;
  tone: AnalyticsAlertTone;
  title: string;
  description: string;
};

export type AnalyticsDashboardSnapshot = {
  periodDays: AnalyticsPeriodDays;
  totalEvents: number;
  eventTotals: Partial<Record<AnalyticsEventName, number>>;
  pageViews: AnalyticsLeaderboardItem[];
  productViews: AnalyticsLeaderboardItem[];
  cartAdds: AnalyticsLeaderboardItem[];
  ordersSentCount: number;
  trends: AnalyticsTrendPoint[];
  activeEventNames: AnalyticsEventName[];
  alerts: AnalyticsAlert[];
};
