import type { TypographyStyleMap } from './typography';

export type EventCategoryDefinition = {
  id: string;
  label: string;
  visible: boolean;
};

export type EventActionType =
  | 'none'
  | 'buy_ticket'
  | 'reserve_spot'
  | 'external_link';

export type EventRecord = {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  categoryId: string;
  imageUrl: string;
  externalUrl: string;
  actionType: EventActionType;
  actionLabel: string;
  actionUrl: string;
  ticketPrice: number | null;
  ticketEnabled: boolean;
  soldOut: boolean;
  externalTicketProvider: string;
  featured: boolean;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EventDraft = Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>;

export type EventPageSectionId =
  | 'hero'
  | 'featured_event'
  | 'filters'
  | 'calendar'
  | 'upcoming_list';

export type EventPageSectionConfig = {
  id: EventPageSectionId;
  visible: boolean;
};

export type EventsTypographySlot =
  | 'hero_kicker'
  | 'hero_title'
  | 'hero_subtitle'
  | 'hero_intro'
  | 'featured_section_kicker'
  | 'featured_section_title'
  | 'featured_section_text'
  | 'filters_kicker'
  | 'filters_title'
  | 'filters_text'
  | 'calendar_kicker'
  | 'calendar_title'
  | 'calendar_text'
  | 'upcoming_kicker'
  | 'upcoming_title'
  | 'upcoming_text'
  | 'event_title'
  | 'event_description'
  | 'empty_state_title'
  | 'empty_state_text';

export type EventsPageContent = {
  heroKicker: string;
  title: string;
  subtitle: string;
  introText: string;
  bannerImageUrl: string;
  featuredSectionKicker: string;
  featuredSectionTitle: string;
  featuredSectionText: string;
  filtersKicker: string;
  filtersTitle: string;
  filtersText: string;
  calendarSectionKicker: string;
  calendarSectionTitle: string;
  calendarSectionText: string;
  upcomingSectionKicker: string;
  upcomingSectionTitle: string;
  upcomingSectionText: string;
  emptyStateTitle: string;
  emptyStateText: string;
  sections: EventPageSectionConfig[];
  typography: TypographyStyleMap<EventsTypographySlot>;
};

export type EventsConfig = {
  page: EventsPageContent;
  categories: EventCategoryDefinition[];
  events: EventRecord[];
};

export type EventImportIssue = {
  field: string;
  message: string;
  tone: 'error' | 'warning';
};

export type EventImportPreviewRow = {
  rowNumber: number;
  raw: Record<string, string>;
  draft: EventDraft | null;
  issues: EventImportIssue[];
  suggestedCategory: EventCategoryDefinition | null;
};

export type EventImportPreview = {
  fileName: string;
  acceptedRows: EventImportPreviewRow[];
  validRows: EventImportPreviewRow[];
  invalidRows: EventImportPreviewRow[];
  categoriesToCreate: EventCategoryDefinition[];
};
