import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
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
} from './events';
import type {
  EventCategoryDefinition,
  EventDraft,
  EventRecord,
  EventsConfig,
  EventsPageContent,
} from '../types/events';

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
};

const EventsContext = createContext<EventsContextValue | null>(null);

function persistNextConfig(config: EventsConfig) {
  return persistEventsConfig(mergeEventsConfig(config));
}

export function EventsProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState<EventsConfig>(loadEventsConfig);

  function saveConfig(nextConfig: EventsConfig) {
    const persistedConfig = persistNextConfig(nextConfig);
    setConfig(persistedConfig);
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
    }),
    [config]
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
