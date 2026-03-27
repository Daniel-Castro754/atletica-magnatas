import type { EventsTypographySlot } from '../types/events';
import type { TextTypographyStyle, TypographyStyleMap } from '../types/typography';
import { cloneTypographyMap, normalizeTextTypographyStyle } from './typography';

type TypographyFieldDefinition<T extends string> = {
  slot: T;
  label: string;
  previewText: string;
  defaultStyle: TextTypographyStyle;
};

type TypographyGroup<T extends string> = {
  id: string;
  label: string;
  description: string;
  fields: TypographyFieldDefinition<T>[];
};

const KICKER_STYLE: TextTypographyStyle = { fontFamily: 'sans_compact', fontSize: 'sm' };
const TITLE_STYLE: TextTypographyStyle = { fontFamily: 'serif_display', fontSize: 'xl' };
const SECTION_TITLE_STYLE: TextTypographyStyle = {
  fontFamily: 'serif_display',
  fontSize: 'lg',
};
const BODY_STYLE: TextTypographyStyle = { fontFamily: 'sans_clean', fontSize: 'md' };
const EMPHASIS_STYLE: TextTypographyStyle = {
  fontFamily: 'serif_editorial',
  fontSize: 'lg',
};

export const EVENTS_TYPOGRAPHY_GROUPS: TypographyGroup<EventsTypographySlot>[] = [
  {
    id: 'hero',
    label: 'Tipografia do hero',
    description: 'Controla o topo da pagina publica de eventos.',
    fields: [
      { slot: 'hero_kicker', label: 'Kicker do hero', previewText: 'Agenda Magnatas', defaultStyle: KICKER_STYLE },
      { slot: 'hero_title', label: 'Titulo principal', previewText: 'Calendario oficial da atletica', defaultStyle: TITLE_STYLE },
      { slot: 'hero_subtitle', label: 'Subtitulo', previewText: 'Jogos, festas e integracoes em um so lugar.', defaultStyle: { fontFamily: 'sans_clean', fontSize: 'lg' } },
      { slot: 'hero_intro', label: 'Texto de apoio', previewText: 'Texto institucional da pagina de eventos.', defaultStyle: BODY_STYLE },
    ],
  },
  {
    id: 'sections',
    label: 'Tipografia das secoes',
    description: 'Controla titulos e descricoes dos blocos publicos da agenda.',
    fields: [
      { slot: 'featured_section_kicker', label: 'Kicker do destaque', previewText: 'Em destaque', defaultStyle: KICKER_STYLE },
      { slot: 'featured_section_title', label: 'Titulo do destaque', previewText: 'O proximo grande momento', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'featured_section_text', label: 'Texto do destaque', previewText: 'Texto de apoio do bloco destacado.', defaultStyle: BODY_STYLE },
      { slot: 'filters_kicker', label: 'Kicker dos filtros', previewText: 'Filtros', defaultStyle: KICKER_STYLE },
      { slot: 'filters_title', label: 'Titulo dos filtros', previewText: 'Escolha o tipo de evento', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'filters_text', label: 'Texto dos filtros', previewText: 'Resumo rapido dos filtros.', defaultStyle: BODY_STYLE },
      { slot: 'calendar_kicker', label: 'Kicker do calendario', previewText: 'Calendario', defaultStyle: KICKER_STYLE },
      { slot: 'calendar_title', label: 'Titulo do calendario', previewText: 'Visao mensal da agenda', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'calendar_text', label: 'Texto do calendario', previewText: 'Texto auxiliar do calendario.', defaultStyle: BODY_STYLE },
      { slot: 'upcoming_kicker', label: 'Kicker da lista', previewText: 'Proximos eventos', defaultStyle: KICKER_STYLE },
      { slot: 'upcoming_title', label: 'Titulo da lista', previewText: 'Tudo o que ja esta confirmado', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'upcoming_text', label: 'Texto da lista', previewText: 'Resumo da lista de eventos futuros.', defaultStyle: BODY_STYLE },
    ],
  },
  {
    id: 'cards',
    label: 'Tipografia dos eventos',
    description: 'Controla titulos, descricoes e estado vazio dos cards/eventos do dia.',
    fields: [
      { slot: 'event_title', label: 'Titulo do evento', previewText: 'Recepcao oficial de calouros', defaultStyle: EMPHASIS_STYLE },
      { slot: 'event_description', label: 'Descricao do evento', previewText: 'Descricao curta ou completa do evento.', defaultStyle: BODY_STYLE },
      { slot: 'empty_state_title', label: 'Titulo do estado vazio', previewText: 'Nenhum evento publicado', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'empty_state_text', label: 'Texto do estado vazio', previewText: 'A agenda aparece aqui assim que a diretoria publicar.', defaultStyle: BODY_STYLE },
    ],
  },
];

function flattenTypographyFields<T extends string>(groups: TypographyGroup<T>[]) {
  return groups.flatMap((group) => group.fields);
}

function createTypographyDefaults<T extends string>(
  groups: TypographyGroup<T>[]
): TypographyStyleMap<T> {
  return flattenTypographyFields(groups).reduce<TypographyStyleMap<T>>((accumulator, field) => {
    accumulator[field.slot] = field.defaultStyle;
    return accumulator;
  }, {} as TypographyStyleMap<T>);
}

function mergeTypographyMap<T extends string>(
  input: unknown,
  groups: TypographyGroup<T>[]
): TypographyStyleMap<T> {
  const defaults = createTypographyDefaults(groups);
  const candidate: Partial<TypographyStyleMap<T>> =
    input && typeof input === 'object' ? (input as Partial<TypographyStyleMap<T>>) : {};

  return flattenTypographyFields(groups).reduce<TypographyStyleMap<T>>((accumulator, field) => {
    accumulator[field.slot] = normalizeTextTypographyStyle(
      candidate[field.slot],
      defaults[field.slot]
    );
    return accumulator;
  }, {} as TypographyStyleMap<T>);
}

export const DEFAULT_EVENTS_TYPOGRAPHY = createTypographyDefaults(EVENTS_TYPOGRAPHY_GROUPS);

export function cloneEventsTypographyMap(map: TypographyStyleMap<EventsTypographySlot>) {
  return cloneTypographyMap(map);
}

export function mergeEventsTypographyMap(input: unknown) {
  return mergeTypographyMap(input, EVENTS_TYPOGRAPHY_GROUPS);
}
