import type {
  EventActionType,
  EventCategoryDefinition,
  EventDraft,
  EventPageSectionConfig,
  EventPageSectionId,
  EventRecord,
  EventsConfig,
  EventsPageContent,
} from '../types/events';
import {
  DEFAULT_EVENTS_TYPOGRAPHY,
  cloneEventsTypographyMap,
  mergeEventsTypographyMap,
} from './eventsTypography';

export const EVENTS_STORAGE_KEY = 'magnatas_events_config';

export const DEFAULT_EVENT_CATEGORIES: EventCategoryDefinition[] = [
  { id: 'festa', label: 'Festa', visible: true },
  { id: 'esporte', label: 'Esporte', visible: true },
  { id: 'recepcao', label: 'Recepcao', visible: true },
  { id: 'reuniao', label: 'Reuniao', visible: true },
  { id: 'campeonato', label: 'Campeonato', visible: true },
  { id: 'integracao', label: 'Integracao', visible: true },
  { id: 'academico', label: 'Academico', visible: true },
];

const EVENT_PAGE_SECTION_IDS: EventPageSectionId[] = [
  'hero',
  'featured_event',
  'filters',
  'calendar',
  'upcoming_list',
];

export const EVENT_PAGE_SECTION_LABELS: Record<EventPageSectionId, string> = {
  hero: 'Hero principal',
  featured_event: 'Proximo evento em destaque',
  filters: 'Filtros',
  calendar: 'Calendario',
  upcoming_list: 'Lista de proximos eventos',
};

export const EVENT_ACTION_TYPE_LABELS: Record<EventActionType, string> = {
  none: 'Sem acao',
  buy_ticket: 'Comprar ingresso',
  reserve_spot: 'Reservar vaga',
  external_link: 'Link externo',
};

export const EVENT_ACTION_DEFAULT_LABELS: Record<EventActionType, string> = {
  none: '',
  buy_ticket: 'Comprar ingresso',
  reserve_spot: 'Reservar vaga',
  external_link: 'Abrir link do evento',
};

function createSlug(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sanitizeString(value: unknown, fallback: string, allowEmpty = false) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue && allowEmpty) {
    return '';
  }

  return trimmedValue || fallback;
}

function sanitizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizeNumber(value: unknown, fallback: number | null) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === 'string') {
    const normalizedValue = Number(value.replace(',', '.').trim());
    return Number.isFinite(normalizedValue) ? normalizedValue : fallback;
  }

  return fallback;
}

function sanitizeDate(value: unknown, fallback: string) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return fallback;
  }

  const isoMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return trimmedValue;
  }

  const brMatch = trimmedValue.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }

  const parsedDate = new Date(trimmedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return fallback;
  }

  return [
    parsedDate.getFullYear(),
    String(parsedDate.getMonth() + 1).padStart(2, '0'),
    String(parsedDate.getDate()).padStart(2, '0'),
  ].join('-');
}

function sanitizeTime(value: unknown, fallback: string, allowEmpty = false) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue && allowEmpty) {
    return '';
  }

  const timeMatch = trimmedValue.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) {
    return fallback;
  }

  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return fallback;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function sanitizeMediaUrl(value: unknown, fallback: string, allowEmpty = false) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue && allowEmpty) {
    return '';
  }

  if (!trimmedValue) {
    return fallback;
  }

  if (trimmedValue.startsWith('/')) {
    return trimmedValue;
  }

  if (trimmedValue.startsWith('data:image/') || trimmedValue.startsWith('blob:')) {
    return trimmedValue;
  }

  try {
    const parsedUrl = new URL(trimmedValue);

    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return trimmedValue;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function sanitizeExternalUrl(value: unknown, fallback: string, allowEmpty = false) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue && allowEmpty) {
    return '';
  }

  if (!trimmedValue) {
    return fallback;
  }

  if (trimmedValue.startsWith('/')) {
    return trimmedValue;
  }

  try {
    const parsedUrl = new URL(trimmedValue);

    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return trimmedValue;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function sanitizeActionType(value: unknown, fallback: EventActionType) {
  if (value === 'none' || value === 'buy_ticket' || value === 'reserve_spot' || value === 'external_link') {
    return value;
  }

  return fallback;
}

export function normalizeEventCategoryId(value: string) {
  return createSlug(value) || 'evento';
}

function mergeOrderedSections(
  input: unknown,
  defaults: EventPageSectionConfig[]
): EventPageSectionConfig[] {
  if (!Array.isArray(input)) {
    return defaults.map((section) => ({ ...section }));
  }

  const defaultVisibility = new Map(defaults.map((section) => [section.id, section.visible]));
  const sections: EventPageSectionConfig[] = [];
  const seenIds = new Set<EventPageSectionId>();

  input.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const candidate = item as Record<string, unknown>;
    const id = sanitizeString(candidate.id, '') as EventPageSectionId;

    if (!EVENT_PAGE_SECTION_IDS.includes(id) || seenIds.has(id)) {
      return;
    }

    seenIds.add(id);
    sections.push({
      id,
      visible: sanitizeBoolean(candidate.visible, defaultVisibility.get(id) ?? true),
    });
  });

  EVENT_PAGE_SECTION_IDS.forEach((id) => {
    if (!seenIds.has(id)) {
      sections.push({
        id,
        visible: defaultVisibility.get(id) ?? true,
      });
    }
  });

  return sections;
}

function cloneCategories(categories: EventCategoryDefinition[]) {
  return categories.map((category) => ({ ...category }));
}

function mergeCategories(input: unknown) {
  if (!Array.isArray(input)) {
    return cloneCategories(DEFAULT_EVENT_CATEGORIES);
  }

  const seenIds = new Set<string>();
  const mergedCategories: EventCategoryDefinition[] = [];

  input.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const fallback = DEFAULT_EVENT_CATEGORIES[index] || {
      id: `categoria-${index + 1}`,
      label: `Categoria ${index + 1}`,
      visible: true,
    };
    const candidate = item as Record<string, unknown>;
    const normalizedId = normalizeEventCategoryId(
      sanitizeString(candidate.id, sanitizeString(candidate.label, fallback.label))
    );

    if (!normalizedId || seenIds.has(normalizedId)) {
      return;
    }

    seenIds.add(normalizedId);
    mergedCategories.push({
      id: normalizedId,
      label: sanitizeString(candidate.label, fallback.label),
      visible: sanitizeBoolean(candidate.visible, fallback.visible),
    });
  });

  if (!mergedCategories.length) {
    return cloneCategories(DEFAULT_EVENT_CATEGORIES);
  }

  return mergedCategories;
}

const DEFAULT_EVENTS_PAGE_CONTENT: EventsPageContent = {
  heroKicker: 'Agenda Magnatas',
  title: 'Os proximos encontros, jogos e acoes da Atletica Magnatas em um so calendario.',
  subtitle:
    'A pagina de eventos organiza festa, recepcao, reuniao, integracao e compromissos esportivos para a turma acompanhar o que vem pela frente.',
  introText:
    'Aqui a diretoria destaca o calendario da Magnatas com clareza: o que acontece, quando acontece e como a comunidade pode participar sem depender de avisos soltos.',
  bannerImageUrl: 'https://picsum.photos/seed/magnatas-eventos-banner/1600/980',
  featuredSectionKicker: 'Em destaque',
  featuredSectionTitle: 'O proximo grande momento da Magnatas.',
  featuredSectionText:
    'Quando um evento e marcado como destaque, ele ganha prioridade na abertura da pagina para concentrar atencao e adesao.',
  filtersKicker: 'Filtros',
  filtersTitle: 'Escolha o tipo de evento que voce quer acompanhar.',
  filtersText:
    'A navegacao por categoria ajuda a separar calendario academico, encontros da diretoria, integracoes e eventos de torcida.',
  calendarSectionKicker: 'Calendario',
  calendarSectionTitle: 'Visao mensal dos eventos da comunidade.',
  calendarSectionText:
    'Datas com atividade ficam destacadas no calendario para facilitar leitura rapida do mes e planejamento da turma.',
  upcomingSectionKicker: 'Proximos eventos',
  upcomingSectionTitle: 'Tudo o que ja esta confirmado para os proximos dias.',
  upcomingSectionText:
    'A lista abaixo organiza os eventos futuros em ordem cronologica, com destaque para horario, local e categoria.',
  emptyStateTitle: 'Nenhum evento publicado para este recorte.',
  emptyStateText:
    'Assim que a diretoria publicar novos encontros, a agenda da Magnatas aparece aqui automaticamente.',
  sections: EVENT_PAGE_SECTION_IDS.map((id) => ({
    id,
    visible: true,
  })),
  typography: cloneEventsTypographyMap(DEFAULT_EVENTS_TYPOGRAPHY),
};

const DEFAULT_EVENT_DRAFTS: EventDraft[] = [
  {
    title: 'Recepcao oficial de calouros de Economia',
    shortDescription:
      'Encontro de boas-vindas com apresentacao da diretoria, integracao da turma e ambientacao da Magnatas.',
    fullDescription:
      'A recepcao oficial abre o semestre com apresentacao da atletica, orientacoes praticas, dinamicas de integracao e momento para aproximar calouros da comunidade que ja vive a rotina do curso.',
    date: '2026-03-22',
    startTime: '19:00',
    endTime: '22:00',
    location: 'Espaco de convivencia da UNESC',
    categoryId: 'recepcao',
    imageUrl: 'https://picsum.photos/seed/magnatas-evento-recepcao/1200/800',
    externalUrl: '',
    actionType: 'none',
    actionLabel: '',
    actionUrl: '',
    ticketPrice: null,
    ticketEnabled: false,
    soldOut: false,
    externalTicketProvider: '',
    featured: true,
    visible: true,
  },
  {
    title: 'Reuniao aberta de planejamento da bateria e torcida',
    shortDescription:
      'Momento para alinhar proximos jogos, presenca da arquibancada e producao de materiais da torcida.',
    fullDescription:
      'A diretoria abre a reuniao para estudantes que querem participar da bateria, ajudar na organizacao da arquibancada ou contribuir com ideias para fortalecer a presenca da Magnatas nos proximos compromissos.',
    date: '2026-03-27',
    startTime: '18:30',
    endTime: '20:00',
    location: 'Sala do centro academico',
    categoryId: 'reuniao',
    imageUrl: 'https://picsum.photos/seed/magnatas-evento-reuniao/1200/800',
    externalUrl: '',
    actionType: 'none',
    actionLabel: '',
    actionUrl: '',
    ticketPrice: null,
    ticketEnabled: false,
    soldOut: false,
    externalTicketProvider: '',
    featured: false,
    visible: true,
  },
  {
    title: 'Torneio interno de futsal entre fases',
    shortDescription:
      'Partidas amistosas para integrar as fases do curso e movimentar a agenda esportiva da atletica.',
    fullDescription:
      'O torneio interno aproxima veteranos e calouros em uma programacao esportiva leve, com times mistos, arquibancada organizada e oportunidade de reforcar o senso de pertencimento da turma.',
    date: '2026-04-05',
    startTime: '14:00',
    endTime: '18:00',
    location: 'Ginasio universitario',
    categoryId: 'esporte',
    imageUrl: 'https://picsum.photos/seed/magnatas-evento-futsal/1200/800',
    externalUrl: '',
    actionType: 'none',
    actionLabel: '',
    actionUrl: '',
    ticketPrice: null,
    ticketEnabled: false,
    soldOut: false,
    externalTicketProvider: '',
    featured: false,
    visible: true,
  },
];

function createDefaultEvent(index: number): EventRecord {
  const fallbackDraft = DEFAULT_EVENT_DRAFTS[index] || DEFAULT_EVENT_DRAFTS[0]!;
  const now = new Date().toISOString();

  return {
    id: `${normalizeEventCategoryId(fallbackDraft.title)}-${index + 1}`,
    createdAt: now,
    updatedAt: now,
    ...fallbackDraft,
  };
}

function createEventId(title: string, date: string, index: number) {
  const slug = normalizeEventCategoryId(`${title}-${date}`);
  return slug || `evento-${index + 1}`;
}

function mergeEventRecord(
  input: unknown,
  fallback: EventRecord,
  index: number,
  categories: EventCategoryDefinition[]
): EventRecord {
  const candidate = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const categoryFallback = categories.find((category) => category.id === fallback.categoryId);
  const fallbackCategoryId = sanitizeString(candidate.category, fallback.categoryId, true);
  const rawCategoryId = sanitizeString(
    candidate.categoryId,
    fallbackCategoryId,
    true
  );
  const normalizedCategoryId = rawCategoryId
    ? normalizeEventCategoryId(rawCategoryId)
    : fallback.categoryId;
  const safeCategoryId = categories.some((category) => category.id === normalizedCategoryId)
    ? normalizedCategoryId
    : categoryFallback?.id || categories[0]?.id || fallback.categoryId;
  const title = sanitizeString(candidate.title, fallback.title);
  const date = sanitizeDate(candidate.date, fallback.date);
  const generatedId = createEventId(title, date, index);

  return {
    id: sanitizeString(candidate.id, fallback.id || generatedId),
    title,
    shortDescription: sanitizeString(
      candidate.shortDescription ?? candidate.description,
      fallback.shortDescription,
      true
    ),
    fullDescription: sanitizeString(
      candidate.fullDescription,
      fallback.fullDescription,
      true
    ),
    date,
    startTime: sanitizeTime(candidate.startTime ?? candidate.time, fallback.startTime),
    endTime: sanitizeTime(candidate.endTime, fallback.endTime, true),
    location: sanitizeString(candidate.location, fallback.location, true),
    categoryId: safeCategoryId,
    imageUrl: sanitizeMediaUrl(candidate.imageUrl, fallback.imageUrl, true),
    externalUrl: sanitizeExternalUrl(
      candidate.externalUrl ?? candidate.link,
      fallback.externalUrl,
      true
    ),
    actionType: sanitizeActionType(candidate.actionType, fallback.actionType),
    actionLabel: sanitizeString(candidate.actionLabel, fallback.actionLabel, true),
    actionUrl: sanitizeExternalUrl(candidate.actionUrl, fallback.actionUrl, true),
    ticketPrice: sanitizeNumber(candidate.ticketPrice, fallback.ticketPrice),
    ticketEnabled: sanitizeBoolean(candidate.ticketEnabled, fallback.ticketEnabled),
    soldOut: sanitizeBoolean(candidate.soldOut, fallback.soldOut),
    externalTicketProvider: sanitizeString(
      candidate.externalTicketProvider,
      fallback.externalTicketProvider,
      true
    ),
    featured: sanitizeBoolean(candidate.featured, fallback.featured),
    visible: sanitizeBoolean(candidate.visible, fallback.visible),
    createdAt: sanitizeString(candidate.createdAt, fallback.createdAt || new Date().toISOString()),
    updatedAt: sanitizeString(candidate.updatedAt, new Date().toISOString()),
  };
}

function getDefaultEvents() {
  return DEFAULT_EVENT_DRAFTS.map((draft, index) => {
    const now = new Date().toISOString();

    return {
      ...draft,
      id: createEventId(draft.title, draft.date, index),
      createdAt: now,
      updatedAt: now,
    };
  });
}

export const defaultEventsConfig: EventsConfig = {
  page: DEFAULT_EVENTS_PAGE_CONTENT,
  categories: DEFAULT_EVENT_CATEGORIES,
  events: getDefaultEvents(),
};

export function mergeEventsPageContent(input?: Partial<EventsPageContent> | null): EventsPageContent {
  return {
    heroKicker: sanitizeString(input?.heroKicker, DEFAULT_EVENTS_PAGE_CONTENT.heroKicker, true),
    title: sanitizeString(input?.title, DEFAULT_EVENTS_PAGE_CONTENT.title, true),
    subtitle: sanitizeString(input?.subtitle, DEFAULT_EVENTS_PAGE_CONTENT.subtitle, true),
    introText: sanitizeString(input?.introText, DEFAULT_EVENTS_PAGE_CONTENT.introText, true),
    bannerImageUrl: sanitizeMediaUrl(
      input?.bannerImageUrl,
      DEFAULT_EVENTS_PAGE_CONTENT.bannerImageUrl,
      true
    ),
    featuredSectionKicker: sanitizeString(
      input?.featuredSectionKicker,
      DEFAULT_EVENTS_PAGE_CONTENT.featuredSectionKicker,
      true
    ),
    featuredSectionTitle: sanitizeString(
      input?.featuredSectionTitle,
      DEFAULT_EVENTS_PAGE_CONTENT.featuredSectionTitle,
      true
    ),
    featuredSectionText: sanitizeString(
      input?.featuredSectionText,
      DEFAULT_EVENTS_PAGE_CONTENT.featuredSectionText,
      true
    ),
    filtersKicker: sanitizeString(
      input?.filtersKicker,
      DEFAULT_EVENTS_PAGE_CONTENT.filtersKicker,
      true
    ),
    filtersTitle: sanitizeString(
      input?.filtersTitle,
      DEFAULT_EVENTS_PAGE_CONTENT.filtersTitle,
      true
    ),
    filtersText: sanitizeString(
      input?.filtersText,
      DEFAULT_EVENTS_PAGE_CONTENT.filtersText,
      true
    ),
    calendarSectionKicker: sanitizeString(
      input?.calendarSectionKicker,
      DEFAULT_EVENTS_PAGE_CONTENT.calendarSectionKicker,
      true
    ),
    calendarSectionTitle: sanitizeString(
      input?.calendarSectionTitle,
      DEFAULT_EVENTS_PAGE_CONTENT.calendarSectionTitle,
      true
    ),
    calendarSectionText: sanitizeString(
      input?.calendarSectionText,
      DEFAULT_EVENTS_PAGE_CONTENT.calendarSectionText,
      true
    ),
    upcomingSectionKicker: sanitizeString(
      input?.upcomingSectionKicker,
      DEFAULT_EVENTS_PAGE_CONTENT.upcomingSectionKicker,
      true
    ),
    upcomingSectionTitle: sanitizeString(
      input?.upcomingSectionTitle,
      DEFAULT_EVENTS_PAGE_CONTENT.upcomingSectionTitle,
      true
    ),
    upcomingSectionText: sanitizeString(
      input?.upcomingSectionText,
      DEFAULT_EVENTS_PAGE_CONTENT.upcomingSectionText,
      true
    ),
    emptyStateTitle: sanitizeString(
      input?.emptyStateTitle,
      DEFAULT_EVENTS_PAGE_CONTENT.emptyStateTitle,
      true
    ),
    emptyStateText: sanitizeString(
      input?.emptyStateText,
      DEFAULT_EVENTS_PAGE_CONTENT.emptyStateText,
      true
    ),
    sections: mergeOrderedSections(input?.sections, DEFAULT_EVENTS_PAGE_CONTENT.sections),
    typography: mergeEventsTypographyMap(input?.typography),
  };
}

function sortEvents(events: EventRecord[]) {
  return [...events].sort((firstEvent, secondEvent) => {
    const firstTimestamp = getEventStartDateTime(firstEvent).getTime();
    const secondTimestamp = getEventStartDateTime(secondEvent).getTime();

    if (firstTimestamp === secondTimestamp) {
      return firstEvent.title.localeCompare(secondEvent.title, 'pt-BR');
    }

    return firstTimestamp - secondTimestamp;
  });
}

export function mergeEventsConfig(input?: Partial<EventsConfig> | null): EventsConfig {
  const categories = mergeCategories(input?.categories);
  const fallbackEvents = defaultEventsConfig.events;
  const sourceEvents = Array.isArray(input?.events) ? input.events : fallbackEvents;

  const events = sourceEvents.map((event, index) => {
    const fallback = fallbackEvents[index] || createDefaultEvent(index);
    return mergeEventRecord(event, fallback, index, categories);
  });

  return {
    page: mergeEventsPageContent(input?.page),
    categories,
    events: sortEvents(events),
  };
}

export function loadEventsConfig() {
  if (typeof window === 'undefined') {
    return defaultEventsConfig;
  }

  try {
    const savedValue = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!savedValue) {
      return defaultEventsConfig;
    }

    return mergeEventsConfig(JSON.parse(savedValue) as Partial<EventsConfig>);
  } catch {
    return defaultEventsConfig;
  }
}

export function persistEventsConfig(config: EventsConfig) {
  const mergedConfig = mergeEventsConfig(config);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(mergedConfig));
    } catch {
      return mergedConfig;
    }
  }

  return mergedConfig;
}

export function clearStoredEventsConfig() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(EVENTS_STORAGE_KEY);
    } catch {
      return;
    }
  }
}

export function cloneEventsPageContent(content: EventsPageContent): EventsPageContent {
  return {
    ...content,
    sections: content.sections.map((section) => ({ ...section })),
    typography: cloneEventsTypographyMap(content.typography),
  };
}

export function cloneEventCategories(categories: EventCategoryDefinition[]) {
  return categories.map((category) => ({ ...category }));
}

export function cloneEventList(events: EventRecord[]) {
  return events.map((event) => ({ ...event }));
}

export function createEmptyEventDraft(categories: EventCategoryDefinition[]): EventDraft {
  return {
    title: '',
    shortDescription: '',
    fullDescription: '',
    date: '',
    startTime: '19:00',
    endTime: '',
    location: '',
    categoryId: categories[0]?.id || DEFAULT_EVENT_CATEGORIES[0]!.id,
    imageUrl: '',
    externalUrl: '',
    actionType: 'none',
    actionLabel: '',
    actionUrl: '',
    ticketPrice: null,
    ticketEnabled: false,
    soldOut: false,
    externalTicketProvider: '',
    featured: false,
    visible: true,
  };
}

export function createEventFromDraft(
  draft: EventDraft,
  existingEvents: EventRecord[],
  categories: EventCategoryDefinition[]
) {
  const fallback = createDefaultEvent(existingEvents.length);
  const normalizedDraft = mergeEventRecord(
    {
      ...draft,
      id: createEventId(draft.title || fallback.title, draft.date || fallback.date, existingEvents.length),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    fallback,
    existingEvents.length,
    categories
  );

  const existingIds = new Set(existingEvents.map((event) => event.id));

  if (!existingIds.has(normalizedDraft.id)) {
    return normalizedDraft;
  }

  let index = existingEvents.length + 1;
  let candidateId = `${normalizedDraft.id}-${index}`;

  while (existingIds.has(candidateId)) {
    index += 1;
    candidateId = `${normalizedDraft.id}-${index}`;
  }

  return {
    ...normalizedDraft,
    id: candidateId,
  };
}

export function patchEventRecord(
  currentEvent: EventRecord,
  patch: Partial<EventDraft>,
  index: number,
  categories: EventCategoryDefinition[]
) {
  return mergeEventRecord(
    {
      ...currentEvent,
      ...patch,
      updatedAt: new Date().toISOString(),
    },
    currentEvent,
    index,
    categories
  );
}

export function getEventStartDateTime(event: Pick<EventRecord, 'date' | 'startTime'>) {
  const [year, month, day] = event.date.split('-').map(Number);
  const [hours, minutes] = event.startTime.split(':').map(Number);

  return new Date(year || 0, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
}

export function getEventEndDateTime(
  event: Pick<EventRecord, 'date' | 'startTime' | 'endTime'>
) {
  if (!event.endTime) {
    return getEventStartDateTime(event);
  }

  const [year, month, day] = event.date.split('-').map(Number);
  const [hours, minutes] = event.endTime.split(':').map(Number);

  return new Date(year || 0, (month || 1) - 1, day || 1, hours || 0, minutes || 0, 0, 0);
}

export function isUpcomingEvent(event: EventRecord, referenceDate = new Date()) {
  return getEventEndDateTime(event).getTime() >= referenceDate.getTime();
}

export function getVisibleEvents(events: EventRecord[]) {
  return sortEvents(events.filter((event) => event.visible));
}

export function isExternalNavigationTarget(value: string) {
  return value.startsWith('http://') || value.startsWith('https://');
}

export function getEventCategoryLabel(
  categoryId: string,
  categories: EventCategoryDefinition[]
) {
  return categories.find((category) => category.id === categoryId)?.label || categoryId;
}

export function isEventClosed(
  event: Pick<EventRecord, 'date' | 'startTime' | 'endTime'>,
  referenceDate = new Date()
) {
  if (!event.date.trim() || !event.startTime.trim()) {
    return false;
  }

  return getEventEndDateTime(event).getTime() < referenceDate.getTime();
}

export function getEventActionLabel(
  event: Pick<EventRecord, 'actionType' | 'actionLabel'>
) {
  if (event.actionType === 'none') {
    return '';
  }

  const trimmedLabel = event.actionLabel.trim();
  return trimmedLabel || EVENT_ACTION_DEFAULT_LABELS[event.actionType];
}

export function getEventActionConfig(
  event: Pick<
    EventRecord,
    | 'actionType'
    | 'actionLabel'
    | 'actionUrl'
    | 'ticketEnabled'
    | 'soldOut'
    | 'date'
    | 'startTime'
    | 'endTime'
  >,
  referenceDate = new Date()
) {
  const isClosed = isEventClosed(event, referenceDate);
  const hasActionType = event.actionType !== 'none';
  const hasUrl = Boolean(event.actionUrl.trim());
  const label = getEventActionLabel(event);
  const canRender = event.ticketEnabled && hasActionType && (hasUrl || event.soldOut || isClosed);
  const isEnabled = canRender && hasUrl && !event.soldOut && !isClosed;

  return {
    canRender,
    isEnabled,
    isClosed,
    isSoldOut: event.soldOut,
    label,
    url: event.actionUrl.trim(),
    isExternal: hasUrl ? isExternalNavigationTarget(event.actionUrl.trim()) : false,
  };
}

export function getEventStatusKey(
  event: Pick<EventRecord, 'soldOut' | 'featured' | 'date' | 'startTime' | 'endTime'>
) {
  if (event.soldOut) {
    return 'sold_out' as const;
  }

  if (isEventClosed(event)) {
    return 'closed' as const;
  }

  if (event.featured) {
    return 'featured' as const;
  }

  return 'scheduled' as const;
}

export function getEventStatusLabel(
  event: Pick<EventRecord, 'soldOut' | 'featured' | 'date' | 'startTime' | 'endTime'>
) {
  const statusKey = getEventStatusKey(event);

  if (statusKey === 'sold_out') {
    return 'Esgotado';
  }

  if (statusKey === 'closed') {
    return 'Encerrado';
  }

  if (statusKey === 'featured') {
    return 'Destaque';
  }

  return 'Programado';
}

export function getUpcomingVisibleEvents(events: EventRecord[], referenceDate = new Date()) {
  return getVisibleEvents(events).filter((event) => isUpcomingEvent(event, referenceDate));
}

export function getFeaturedUpcomingEvent(events: EventRecord[], referenceDate = new Date()) {
  const upcomingEvents = getUpcomingVisibleEvents(events, referenceDate);

  return (
    upcomingEvents.find((event) => event.featured) ||
    upcomingEvents[0] ||
    null
  );
}

export function getEventsByMonth(events: EventRecord[], year: number, monthIndex: number) {
  return getVisibleEvents(events).filter((event) => {
    const eventDate = getEventStartDateTime(event);
    return eventDate.getFullYear() === year && eventDate.getMonth() === monthIndex;
  });
}

export function getEventsForDate(events: EventRecord[], dateKey: string) {
  return getVisibleEvents(events).filter((event) => event.date === dateKey);
}

export function formatEventDateLabel(value: string) {
  const [year, month, day] = value.split('-').map(Number);

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    weekday: 'short',
  }).format(new Date(year || 0, (month || 1) - 1, day || 1));
}

export function formatEventMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatEventTimeRange(event: Pick<EventRecord, 'startTime' | 'endTime'>) {
  if (event.endTime) {
    return `${event.startTime} - ${event.endTime}`;
  }

  return event.startTime;
}
