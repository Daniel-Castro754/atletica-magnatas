import type { BrandingTypographySlot } from '../types/branding';
import type { TextTypographyStyle, TypographyStyleMap } from '../types/typography';
import {
  cloneTypographyMap,
  createTypographyClassName,
  normalizeTextTypographyStyle,
} from './typography';

type BrandingTypographyFieldDefinition = {
  slot: BrandingTypographySlot;
  label: string;
  previewText: string;
  defaultStyle: TextTypographyStyle;
};

type BrandingTypographyGroup = {
  id: string;
  label: string;
  description: string;
  fields: BrandingTypographyFieldDefinition[];
};

export type SiteTypographyKind = 'title' | 'subtitle' | 'description';

const TAG_STYLE: TextTypographyStyle = {
  fontFamily: 'sans_compact',
  fontSize: 'sm',
};

const TITLE_STYLE: TextTypographyStyle = {
  fontFamily: 'serif_display',
  fontSize: 'lg',
};

const SUBTITLE_STYLE: TextTypographyStyle = {
  fontFamily: 'sans_clean',
  fontSize: 'sm',
};

const SITE_TITLE_STYLE: TextTypographyStyle = {
  fontFamily: 'serif_display',
  fontSize: 'lg',
};

const SITE_SUBTITLE_STYLE: TextTypographyStyle = {
  fontFamily: 'sans_clean',
  fontSize: 'md',
};

const SITE_DESCRIPTION_STYLE: TextTypographyStyle = {
  fontFamily: 'sans_clean',
  fontSize: 'sm',
};

export const BRANDING_TYPOGRAPHY_GROUPS: BrandingTypographyGroup[] = [
  {
    id: 'brand_signature',
    label: 'Tipografia da assinatura',
    description: 'Controla como o nome da marca aparece na navbar, no footer e nas areas institucionais da identidade.',
    fields: [
      {
        slot: 'brand_tag',
        label: 'Tag curta da marca',
        previewText: 'A.A.A.E. Economia',
        defaultStyle: TAG_STYLE,
      },
      {
        slot: 'brand_title',
        label: 'Nome principal da marca',
        previewText: 'Atletica Magnatas',
        defaultStyle: TITLE_STYLE,
      },
      {
        slot: 'brand_subtitle',
        label: 'Subtitulo institucional',
        previewText: 'Ciencias Economicas - UNESC',
        defaultStyle: SUBTITLE_STYLE,
      },
    ],
  },
  {
    id: 'site_global',
    label: 'Tipografia global do site',
    description:
      'Controla os grupos principais de texto do site publico. Home, Institucional e Eventos herdam estes estilos automaticamente.',
    fields: [
      {
        slot: 'site_title',
        label: 'Titulos',
        previewText: 'Titulos das secoes e chamadas principais',
        defaultStyle: SITE_TITLE_STYLE,
      },
      {
        slot: 'site_subtitle',
        label: 'Subtitulos',
        previewText: 'Subtitulos e linhas de apoio mais curtas',
        defaultStyle: SITE_SUBTITLE_STYLE,
      },
      {
        slot: 'site_description',
        label: 'Descricoes',
        previewText: 'Descricoes, introducoes e textos de apoio',
        defaultStyle: SITE_DESCRIPTION_STYLE,
      },
    ],
  },
];

const SITE_TYPOGRAPHY_SLOT_MAP: Record<SiteTypographyKind, BrandingTypographySlot> = {
  title: 'site_title',
  subtitle: 'site_subtitle',
  description: 'site_description',
};

function flattenFields(groups: BrandingTypographyGroup[]) {
  return groups.flatMap((group) => group.fields);
}

function createDefaults(groups: BrandingTypographyGroup[]) {
  return flattenFields(groups).reduce((accumulator, field) => {
    accumulator[field.slot] = field.defaultStyle;
    return accumulator;
  }, {} as TypographyStyleMap<BrandingTypographySlot>);
}

export const DEFAULT_BRANDING_TYPOGRAPHY = createDefaults(BRANDING_TYPOGRAPHY_GROUPS);

export function cloneBrandingTypographyMap(
  map: TypographyStyleMap<BrandingTypographySlot>
) {
  return cloneTypographyMap(map);
}

export function mergeBrandingTypographyMap(input: unknown) {
  const defaults = DEFAULT_BRANDING_TYPOGRAPHY;
  const candidate =
    input && typeof input === 'object'
      ? (input as Partial<TypographyStyleMap<BrandingTypographySlot>>)
      : {};

  return flattenFields(BRANDING_TYPOGRAPHY_GROUPS).reduce((accumulator, field) => {
    accumulator[field.slot] = normalizeTextTypographyStyle(
      candidate[field.slot],
      defaults[field.slot]
    );
    return accumulator;
  }, {} as TypographyStyleMap<BrandingTypographySlot>);
}

export function getSiteTypographyStyle(
  map: TypographyStyleMap<BrandingTypographySlot>,
  kind: SiteTypographyKind
) {
  return map[SITE_TYPOGRAPHY_SLOT_MAP[kind]];
}

export function createSiteTypographyClassName(
  map: TypographyStyleMap<BrandingTypographySlot>,
  kind: SiteTypographyKind,
  baseClassName = ''
) {
  return createTypographyClassName(getSiteTypographyStyle(map, kind), baseClassName);
}
