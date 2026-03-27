import { createContext, useContext, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import {
  createAnalyticsEvent,
  clearStoredAnalyticsEvents,
  findRecentDuplicateEvent,
  getSafePathname,
  loadAnalyticsEvents,
  persistAnalyticsEvents,
  resolvePublicPageLabel,
  type AnalyticsTrackOptions,
} from './analytics';
import type { Product } from '../types/cart';
import type { AnalyticsEvent, AnalyticsEventPayload } from '../types/analytics';

type CheckoutAnalyticsDetails = {
  pathname: string;
  cartLineItems: number;
  cartItemsCount: number;
  cartTotal: number;
  orderId?: string;
};

type AnalyticsContextValue = {
  events: AnalyticsEvent[];
  trackEvent: (payload: AnalyticsEventPayload, options?: AnalyticsTrackOptions) => AnalyticsEvent;
  trackPageView: (pathname: string) => AnalyticsEvent;
  trackProductView: (product: Product, pathname: string) => AnalyticsEvent;
  trackAddToCart: (product: Product, quantity: number, pathname: string) => AnalyticsEvent;
  trackEventLinkClick: (
    eventId: string,
    eventTitle: string,
    eventCategory: string,
    destination: string,
    pathname: string
  ) => AnalyticsEvent;
  trackBeginCheckout: (details: CheckoutAnalyticsDetails) => AnalyticsEvent;
  trackPedidoEnviado: (details: CheckoutAnalyticsDetails) => AnalyticsEvent;
  clearAnalytics: () => void;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: PropsWithChildren) {
  const [events, setEvents] = useState<AnalyticsEvent[]>(loadAnalyticsEvents);
  const eventsRef = useRef(events);

  const actions = useMemo(
    () => {
      function trackEvent(payload: AnalyticsEventPayload, options?: AnalyticsTrackOptions) {
        const duplicateEvent = findRecentDuplicateEvent(eventsRef.current, payload, options);

        if (duplicateEvent) {
          return duplicateEvent;
        }

        const nextEvent = createAnalyticsEvent(payload);

        setEvents((currentEvents) => {
          const nextEvents = [...currentEvents, nextEvent];
          eventsRef.current = nextEvents;
          persistAnalyticsEvents(nextEvents);
          return nextEvents;
        });

        return nextEvent;
      }

      function trackPageView(pathname: string) {
        const safePathname = getSafePathname(pathname);

        return trackEvent({
          name: 'page_view',
          pathname: safePathname,
          pageLabel: resolvePublicPageLabel(safePathname),
        }, {
          dedupeWindowMs: 1500,
        });
      }

      function trackProductView(product: Product, pathname: string) {
        return trackEvent({
          name: 'product_view',
          pathname: getSafePathname(pathname),
          productId: product.id,
          productName: product.name,
          productCategory: product.category,
          unitPrice: product.price,
          quantity: 1,
        }, {
          dedupeWindowMs: 1500,
        });
      }

      function trackAddToCart(product: Product, quantity: number, pathname: string) {
        return trackEvent({
          name: 'add_to_cart',
          pathname: getSafePathname(pathname),
          productId: product.id,
          productName: product.name,
          productCategory: product.category,
          unitPrice: product.price,
          quantity,
        });
      }

      function trackEventLinkClick(
        eventId: string,
        eventTitle: string,
        eventCategory: string,
        destination: string,
        pathname: string
      ) {
        return trackEvent({
          name: 'event_link_click',
          pathname: getSafePathname(pathname),
          eventId,
          eventTitle,
          eventCategory,
          destination,
        });
      }

      function trackBeginCheckout(details: CheckoutAnalyticsDetails) {
        return trackEvent({
          name: 'begin_checkout',
          pathname: getSafePathname(details.pathname),
          cartLineItems: details.cartLineItems,
          cartItemsCount: details.cartItemsCount,
          cartTotal: details.cartTotal,
        });
      }

      function trackPedidoEnviado(details: CheckoutAnalyticsDetails) {
        return trackEvent({
          name: 'pedido_enviado',
          pathname: getSafePathname(details.pathname),
          cartLineItems: details.cartLineItems,
          cartItemsCount: details.cartItemsCount,
          cartTotal: details.cartTotal,
          orderId: details.orderId,
        });
      }

      function clearAnalytics() {
        clearStoredAnalyticsEvents();
        eventsRef.current = [];
        setEvents([]);
      }

      return {
        trackEvent,
        trackPageView,
        trackProductView,
        trackAddToCart,
        trackEventLinkClick,
        trackBeginCheckout,
        trackPedidoEnviado,
        clearAnalytics,
      };
    },
    []
  );

  const value = useMemo(
    () => ({
      events,
      ...actions,
    }),
    [actions, events]
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error('useAnalytics deve ser usado dentro de AnalyticsProvider');
  }

  return context;
}
