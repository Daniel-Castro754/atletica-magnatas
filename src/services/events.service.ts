import { StorageService } from './storage.service';
import type { EventRecord, EventCategoryDefinition } from '../types/events';

const EVENTS_KEY = 'magnatas_events';
const CATEGORIES_KEY = 'magnatas_event_categories';

export const EventsService = {
  getAll(): EventRecord[] {
    return StorageService.get<EventRecord[]>(EVENTS_KEY) ?? [];
  },

  save(events: EventRecord[]): boolean {
    return StorageService.set(EVENTS_KEY, events);
  },

  getCategories(): EventCategoryDefinition[] {
    return StorageService.get<EventCategoryDefinition[]>(CATEGORIES_KEY) ?? [];
  },

  saveCategories(categories: EventCategoryDefinition[]): boolean {
    return StorageService.set(CATEGORIES_KEY, categories);
  },
};
