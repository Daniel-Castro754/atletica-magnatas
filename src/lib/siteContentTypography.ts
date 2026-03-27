import type { HomeTypographySlot, MagnatasTypographySlot } from '../types/siteContent';
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
const BODY_EMPHASIS_STYLE: TextTypographyStyle = {
  fontFamily: 'serif_editorial',
  fontSize: 'lg',
};
const CTA_STYLE: TextTypographyStyle = { fontFamily: 'sans_compact', fontSize: 'md' };

export const HOME_TYPOGRAPHY_GROUPS: TypographyGroup<HomeTypographySlot>[] = [
  {
    id: 'hero',
    label: 'Tipografia do hero',
    description: 'Controla a abertura principal da Home e a chamada sobre a capa.',
    fields: [
      { slot: 'hero_kicker', label: 'Kicker do hero', previewText: 'Presenca oficial', defaultStyle: KICKER_STYLE },
      { slot: 'hero_title', label: 'Titulo principal', previewText: 'Atletica Magnatas', defaultStyle: TITLE_STYLE },
      { slot: 'hero_subtitle', label: 'Subtitulo', previewText: 'Economia em movimento.', defaultStyle: { fontFamily: 'sans_clean', fontSize: 'lg' } },
      { slot: 'hero_text', label: 'Texto institucional', previewText: 'Texto de apoio do hero.', defaultStyle: BODY_STYLE },
      { slot: 'hero_cover_kicker', label: 'Kicker da capa', previewText: 'Colecao oficial', defaultStyle: KICKER_STYLE },
      { slot: 'hero_cover_title', label: 'Titulo da capa', previewText: 'A marca que a turma reconhece.', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'hero_cover_text', label: 'Texto da capa', previewText: 'Cada detalhe reforca a identidade.', defaultStyle: BODY_STYLE },
      { slot: 'hero_cta', label: 'CTAs do hero', previewText: 'Explorar a loja', defaultStyle: CTA_STYLE },
    ],
  },
  {
    id: 'highlights',
    label: 'Tipografia dos blocos',
    description: 'Aplica aos textos da secao institucional e dos cards da Home.',
    fields: [
      { slot: 'highlights_section_kicker', label: 'Kicker da secao', previewText: 'Vivencia atleticana', defaultStyle: KICKER_STYLE },
      { slot: 'highlights_section_title', label: 'Titulo da secao', previewText: 'O que a Home destaca.', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'highlights_section_text', label: 'Texto da secao', previewText: 'Resumo institucional da secao.', defaultStyle: BODY_STYLE },
      { slot: 'highlight_card_title', label: 'Titulo dos cards', previewText: 'Colecao oficial', defaultStyle: BODY_EMPHASIS_STYLE },
      { slot: 'highlight_card_description', label: 'Descricao dos cards', previewText: 'Descricao do bloco institucional.', defaultStyle: BODY_STYLE },
    ],
  },
  {
    id: 'featured',
    label: 'Tipografia da vitrine',
    description: 'Controla os textos da secao de produtos em destaque.',
    fields: [
      { slot: 'featured_section_kicker', label: 'Kicker da vitrine', previewText: 'Produtos em destaque', defaultStyle: KICKER_STYLE },
      { slot: 'featured_section_title', label: 'Titulo da vitrine', previewText: 'Itens da colecao oficial', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'featured_section_text', label: 'Texto da vitrine', previewText: 'Selecao destacada pela diretoria.', defaultStyle: BODY_STYLE },
      { slot: 'featured_cta', label: 'CTA da vitrine', previewText: 'Ver catalogo completo', defaultStyle: CTA_STYLE },
    ],
  },
  {
    id: 'contacts',
    label: 'Tipografia dos contatos',
    description: 'Controla os textos da secao de redes e contato na Home.',
    fields: [
      { slot: 'contacts_section_kicker', label: 'Kicker da secao', previewText: 'Canais em destaque', defaultStyle: KICKER_STYLE },
      { slot: 'contacts_section_title', label: 'Titulo da secao', previewText: 'Onde a comunidade encontra a atletica.', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'contacts_section_text', label: 'Texto da secao', previewText: 'Texto de apoio dos contatos.', defaultStyle: BODY_STYLE },
      { slot: 'contact_label', label: 'Rotulo dos canais', previewText: 'Instagram oficial', defaultStyle: { fontFamily: 'sans_compact', fontSize: 'md' } },
      { slot: 'contact_value', label: 'Valor dos canais', previewText: '@magnatas.economia', defaultStyle: BODY_STYLE },
    ],
  },
];

export const MAGNATAS_TYPOGRAPHY_GROUPS: TypographyGroup<MagnatasTypographySlot>[] = [
  {
    id: 'hero',
    label: 'Tipografia do hero',
    description: 'Controla o hero principal e os CTAs da pagina institucional.',
    fields: [
      { slot: 'hero_kicker', label: 'Kicker do hero', previewText: 'Identidade que representa Economia', defaultStyle: KICKER_STYLE },
      { slot: 'hero_title', label: 'Titulo principal', previewText: 'Atletica Magnatas', defaultStyle: TITLE_STYLE },
      { slot: 'hero_subtitle', label: 'Subtitulo', previewText: 'Texto de apresentacao da pagina.', defaultStyle: { fontFamily: 'sans_clean', fontSize: 'lg' } },
      { slot: 'hero_cta', label: 'CTAs do hero', previewText: 'Conhecer a colecao', defaultStyle: CTA_STYLE },
    ],
  },
  {
    id: 'who_we_are',
    label: 'Tipografia de quem somos',
    description: 'Controla o bloco institucional principal da pagina.',
    fields: [
      { slot: 'who_we_are_kicker', label: 'Kicker', previewText: 'Quem somos', defaultStyle: KICKER_STYLE },
      { slot: 'who_we_are_title', label: 'Titulo', previewText: 'A diretoria em movimento', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'who_we_are_text', label: 'Texto', previewText: 'Texto institucional da atletica.', defaultStyle: BODY_STYLE },
    ],
  },
  {
    id: 'history',
    label: 'Tipografia da historia',
    description: 'Controla a secao cronologica e os marcos publicados.',
    fields: [
      { slot: 'history_kicker', label: 'Kicker da secao', previewText: 'Historia', defaultStyle: KICKER_STYLE },
      { slot: 'history_title', label: 'Titulo da secao', previewText: 'Como a atletica construiu presenca', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'history_intro', label: 'Texto de apoio', previewText: 'Introducao da secao.', defaultStyle: BODY_STYLE },
      { slot: 'history_item_title', label: 'Titulo dos marcos', previewText: 'Origem na integracao da turma', defaultStyle: BODY_EMPHASIS_STYLE },
      { slot: 'history_item_description', label: 'Descricao dos marcos', previewText: 'Descricao de um marco cronologico.', defaultStyle: BODY_STYLE },
    ],
  },
  {
    id: 'modalities',
    label: 'Tipografia das modalidades',
    description: 'Controla a apresentacao das frentes esportivas e seus cards.',
    fields: [
      { slot: 'modalities_kicker', label: 'Kicker da secao', previewText: 'Modalidades', defaultStyle: KICKER_STYLE },
      { slot: 'modalities_title', label: 'Titulo da secao', previewText: 'Frentes esportivas e de representacao', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'modalities_intro', label: 'Texto de apoio', previewText: 'Introducao das modalidades.', defaultStyle: BODY_STYLE },
      { slot: 'modality_title', label: 'Titulo dos cards', previewText: 'Futsal', defaultStyle: BODY_EMPHASIS_STYLE },
      { slot: 'modality_description', label: 'Descricao dos cards', previewText: 'Descricao da modalidade.', defaultStyle: BODY_STYLE },
    ],
  },
  {
    id: 'events',
    label: 'Tipografia dos eventos',
    description: 'Controla a secao de eventos e os textos de cada card.',
    fields: [
      { slot: 'events_kicker', label: 'Kicker da secao', previewText: 'Eventos', defaultStyle: KICKER_STYLE },
      { slot: 'events_title', label: 'Titulo da secao', previewText: 'Momentos em destaque', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'events_intro', label: 'Texto de apoio', previewText: 'Introducao dos eventos.', defaultStyle: BODY_STYLE },
      { slot: 'event_title', label: 'Titulo dos eventos', previewText: 'Recepcao de calouros', defaultStyle: BODY_EMPHASIS_STYLE },
      { slot: 'event_description', label: 'Descricao dos eventos', previewText: 'Descricao do evento publicado.', defaultStyle: BODY_STYLE },
    ],
  },
  {
    id: 'partners',
    label: 'Tipografia dos parceiros',
    description: 'Controla a secao de parceiros e os textos dos cards.',
    fields: [
      { slot: 'partners_kicker', label: 'Kicker da secao', previewText: 'Parceiros', defaultStyle: KICKER_STYLE },
      { slot: 'partners_title', label: 'Titulo da secao', previewText: 'Conexoes que ampliam a experiencia', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'partners_intro', label: 'Texto de apoio', previewText: 'Introducao dos parceiros.', defaultStyle: BODY_STYLE },
      { slot: 'partner_name', label: 'Nome dos parceiros', previewText: 'Centro Academico de Economia', defaultStyle: BODY_EMPHASIS_STYLE },
      { slot: 'partner_description', label: 'Descricao dos parceiros', previewText: 'Descricao do parceiro.', defaultStyle: BODY_STYLE },
    ],
  },
  {
    id: 'gallery',
    label: 'Tipografia da galeria',
    description: 'Controla os textos da galeria institucional.',
    fields: [
      { slot: 'gallery_kicker', label: 'Kicker da secao', previewText: 'Imagens', defaultStyle: KICKER_STYLE },
      { slot: 'gallery_title', label: 'Titulo da secao', previewText: 'Registros da atmosfera da atletica', defaultStyle: SECTION_TITLE_STYLE },
      { slot: 'gallery_intro', label: 'Texto de apoio', previewText: 'Introducao da galeria.', defaultStyle: BODY_STYLE },
      { slot: 'gallery_image_title', label: 'Titulo das imagens', previewText: 'Torcida em dia de jogo', defaultStyle: BODY_EMPHASIS_STYLE },
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

export const DEFAULT_HOME_TYPOGRAPHY = createTypographyDefaults(HOME_TYPOGRAPHY_GROUPS);
export const DEFAULT_MAGNATAS_TYPOGRAPHY = createTypographyDefaults(MAGNATAS_TYPOGRAPHY_GROUPS);

export function cloneHomeTypographyMap(map: TypographyStyleMap<HomeTypographySlot>) {
  return cloneTypographyMap(map);
}

export function cloneMagnatasTypographyMap(map: TypographyStyleMap<MagnatasTypographySlot>) {
  return cloneTypographyMap(map);
}

export function mergeHomeTypographyMap(input: unknown) {
  return mergeTypographyMap(input, HOME_TYPOGRAPHY_GROUPS);
}

export function mergeMagnatasTypographyMap(input: unknown) {
  return mergeTypographyMap(input, MAGNATAS_TYPOGRAPHY_GROUPS);
}
