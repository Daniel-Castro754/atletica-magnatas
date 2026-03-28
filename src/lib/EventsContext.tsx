import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';

const POLL_SKIP_AFTER_WRITE_MS = 10_000;
import {
  clearStoredEventsConfig,
  cloneEventCategories,
  cloneEventList,
  cloneEventsPageContent,
  createEventFromDraft,
  defaultEventsConfig,
  getVisibleEvents,
  loadEventsConfig,
  mergeEventsConfig,
  patchEventRecord,
  persistEventsConfig,
  syncEventsFromSupabase,
} from './events';
import { supabase } from './supabase';
import type {
  EventCategoryDefinition,
  EventDraft,
  EventRecord,
  EventsConfig,
  EventsPageContent,
} from '../types/events';

const CLOUD_TIMEOUT = 4000;

type EventsContextValue = {
  config: EventsConfig;
  events: EventRecord[];
  visibleEvents: EventRecord[];
  categories: EventCategoryDefinition[];
  pageContent: EventsPageContent;
  createEvent: (draft: EventDraft) => EventRecord;
  updateEvent: (eventId: string, patch: Partial<EventDraft>) => void;
  deleteEvent: (eventId: string) => void;
  toggleEventVisible: (eventId: string) => void;
  toggleEventFeatured: (eventId: string) => void;
  saveConfig: (nextConfig: EventsConfig) => EventsConfig;
  replaceEvents: (nextEvents: EventRecord[]) => void;
  savePageContent: (pageContent: EventsPageContent) => EventsPageContent;
  saveCategories: (categories: EventCategoryDefinition[]) => EventCategoryDefinition[];
  savePageSetup: (pageContent: EventsPageContent, categories: EventCategoryDefinition[]) => EventsConfig;
  getEventById: (eventId: string) => EventRecord | null;
  resetEvents: () => EventsConfig;
  isInitialized: boolean;
};

const EventsContext = createContext<EventsContextValue | null>(null);

function persistNextConfig(config: EventsConfig) {
  return persistEventsConfig(mergeEventsConfig(config));
}

export function EventsProvider({ children }: PropsWithChildren) {
  const [isInitialized, setIsInitialized] = useState(!supabase);
  const [config, setConfig] = useState<EventsConfig>(() =>
    supabase ? defaultEventsConfig : loadEventsConfig()
  );
  const lastSavedAt = useRef(0);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      setConfig(loadEventsConfig());
      setIsInitialized(true);
    }, CLOUD_TIMEOUT);

    syncEventsFromSupabase()
      .then((cloudConfig) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setConfig(cloudConfig ?? loadEventsConfig());
        setIsInitialized(true);
      })
      .catch(() => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        setConfig(loadEventsConfig());
        setIsInitialized(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const intervalId = setInterval(() => {
      if (Date.now() - lastSavedAt.current < POLL_SKIP_AFTER_WRITE_MS) return;
      syncEventsFromSupabase().then((data) => {
        if (data) setConfig(data);
      });
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  function saveConfig(nextConfig: EventsConfig) {
    const persistedConfig = persistNextConfig(nextConfig);
    setConfig(persistedConfig);
    lastSavedAt.current = Date.now();
    return persistedConfig;
  }

  function createEvent(draft: EventDraft) {
    const nextEvent = createEventFromDraft(draft, config.events, config.categories);
    saveConfig({
      ...config,
      events: [...config.events, nextEvent],
    });

    return nextEvent;
  }

  function updateEvent(eventId: string, patch: Partial<EventDraft>) {
    saveConfig({
      ...config,
      events: config.events.map((event, index) =>
        event.id === eventId
          ? patchEventRecord(event, patch, index, config.categories)
          : event
      ),
    });
  }

  function deleteEvent(eventId: string) {
    saveConfig({
      ...config,
      events: config.events.filter((event) => event.id !== eventId),
    });
  }

  function toggleEventVisible(eventId: string) {
    updateEvent(eventId, {
      visible: !config.events.find((event) => event.id === eventId)?.visible,
    });
  }

  function toggleEventFeatured(eventId: string) {
    updateEvent(eventId, {
      featured: !config.events.find((event) => event.id === eventId)?.featured,
    });
  }

  function replaceEvents(nextEvents: EventRecord[]) {
    saveConfig({
      ...config,
      events: cloneEventList(nextEvents),
    });
  }

  function savePageContent(pageContent: EventsPageContent) {
    const persistedConfig = saveConfig({
      ...config,
      page: cloneEventsPageContent(pageContent),
    });

    return persistedConfig.page;
  }

  function saveCategories(categories: EventCategoryDefinition[]) {
    const persistedConfig = saveConfig({
      ...config,
      categories: cloneEventCategories(categories),
    });

    return persistedConfig.categories;
  }

  function savePageSetup(pageContent: EventsPageContent, categories: EventCategoryDefinition[]) {
    const persistedConfig = saveConfig({
      ...config,
      page: cloneEventsPageContent(pageContent),
      categories: cloneEventCategories(categories),
    });

    return persistedConfig;
  }

  function getEventById(eventId: string) {
    return config.events.find((event) => event.id === eventId) ?? null;
  }

  function resetEvents() {
    clearStoredEventsConfig();
    setConfig(defaultEventsConfig);
    return defaultEventsConfig;
  }

  const value = useMemo(
    () => ({
      config,
      events: cloneEventList(config.events),
      visibleEvents: getVisibleEvents(config.events),
      categories: cloneEventCategories(config.categories),
      pageContent: cloneEventsPageContent(config.page),
      createEvent,
      updateEvent,
      deleteEvent,
      toggleEventVisible,
      toggleEventFeatured,
      saveConfig,
      replaceEvents,
      savePageContent,
      saveCategories,
      savePageSetup,
      getEventById,
      resetEvents,
      isInitialized,
    }),
    [config, isInitialized]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function EventsPreviewProvider({
  config,
  children,
}: PropsWithChildren<{ config: EventsConfig }>) {
  const mergedConfig = useMemo(() => mergeEventsConfig(config), [config]);

  const value = useMemo(
    () => ({
      config: mergedConfig,
      events: cloneEventList(mergedConfig.events),
      visibleEvents: getVisibleEvents(mergedConfig.events),
      categories: cloneEventCategories(mergedConfig.categories),
      pageContent: cloneEventsPageContent(mergedConfig.page),
      createEvent: (draft: EventDraft) =>
        createEventFromDraft(draft, mergedConfig.events, mergedConfig.categories),
      updateEvent: () => undefined,
      deleteEvent: () => undefined,
      toggleEventVisible: () => undefined,
      toggleEventFeatured: () => undefined,
      saveConfig: (nextConfig: EventsConfig) => mergeEventsConfig(nextConfig),
      replaceEvents: () => undefined,
      savePageContent: (pageContent: EventsPageContent) => cloneEventsPageContent(pageContent),
      saveCategories: (categories: EventCategoryDefinition[]) => cloneEventCategories(categories),
      savePageSetup: (pageContent: EventsPageContent, categories: EventCategoryDefinition[]) =>
        mergeEventsConfig({
          ...mergedConfig,
          page: pageContent,
          categories,
        }),
      getEventById: (eventId: string) =>
        mergedConfig.events.find((event) => event.id === eventId) ?? null,
      resetEvents: () => defaultEventsConfig,
      isInitialized: true,
    }),
    [mergedConfig]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const context = useContext(EventsContext);

  if (!context) {
    throw new Error('useEvents deve ser usado dentro de EventsProvider');
  }

  return context;
}
