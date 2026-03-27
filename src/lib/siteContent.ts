import { sampleProducts } from './sampleProducts';
import {
  DEFAULT_HOME_TYPOGRAPHY,
  DEFAULT_MAGNATAS_TYPOGRAPHY,
  cloneHomeTypographyMap,
  cloneMagnatasTypographyMap,
  mergeHomeTypographyMap,
  mergeMagnatasTypographyMap,
} from './siteContentTypography';
import type {
  HomeContact,
  HomeContactKind,
  HomeContent,
  HomeCta,
  HomeCtaVariant,
  HomeHighlight,
  HomeHighlightIcon,
  HomeSectionConfig,
  HomeSectionId,
  MagnatasContent,
  MagnatasCta,
  MagnatasEvent,
  MagnatasHistoryItem,
  MagnatasImage,
  MagnatasModality,
  MagnatasPartner,
  MagnatasSectionConfig,
  MagnatasSectionId,
  SiteContentConfig,
} from '../types/siteContent';

export const SITE_CONTENT_STORAGE_KEY = 'magnatas_site_content';

type SiteContentMergeInput = {
  home?: Partial<HomeContent> | null;
  magnatas?: Partial<MagnatasContent> | null;
};

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  hero: 'Hero principal',
  highlights: 'Blocos institucionais',
  featured_products: 'Produtos em destaque',
  contact_highlights: 'Contatos e redes',
};

export const MAGNATAS_SECTION_LABELS: Record<MagnatasSectionId, string> = {
  hero: 'Hero principal',
  who_we_are: 'Quem somos',
  history: 'Historia',
  modalities: 'Modalidades',
  events: 'Eventos',
  partners: 'Parceiros',
  gallery: 'Galeria',
};

const HOME_SECTION_IDS: HomeSectionId[] = [
  'hero',
  'highlights',
  'featured_products',
  'contact_highlights',
];

const MAGNATAS_SECTION_IDS: MagnatasSectionId[] = [
  'hero',
  'who_we_are',
  'history',
  'modalities',
  'events',
  'partners',
  'gallery',
];

const CTA_VARIANTS: HomeCtaVariant[] = ['primary', 'secondary', 'outline'];
const HOME_HIGHLIGHT_ICONS: HomeHighlightIcon[] = [
  'shopping_bag',
  'trophy',
  'users',
  'megaphone',
];
const HOME_CONTACT_KINDS: HomeContactKind[] = ['instagram', 'whatsapp', 'email', 'link'];

const DEFAULT_HOME_CONTENT: HomeContent = {
  heroKicker: 'Atletica de Ciencias Economicas - UNESC',
  title:
    'A {siteName} coloca Economia em movimento dentro do campus, nas arquibancadas e nos eventos.',
  subtitle:
    'Torcida, colecao oficial e recepcao com identidade propria para quem vive Ciencias Economicas com presenca.',
  institutionalText:
    'A home da {siteName} apresenta a atletica como ponto de encontro da turma: uma marca que organiza a energia do curso em jogos, campanhas, acolhimento de calouros e experiencias que permanecem na memoria de quem passa pela UNESC.',
  coverImageUrl: '/Esquilos%20magnatas%20com%20estilo%20luxuoso.png',
  coverKicker: 'Presenca oficial',
  coverTitle:
    'Azul, vermelho e preto para transformar pertencimento em imagem reconhecivel.',
  coverText:
    'Cada detalhe visual da {siteName} ajuda a unificar turma, diretoria e torcida em uma mesma assinatura.',
  ctas: [
    {
      id: 'home-cta-loja',
      label: 'Explorar a loja',
      href: '/loja',
      variant: 'primary',
      visible: true,
    },
    {
      id: 'home-cta-magnatas',
      label: 'Ver institucional',
      href: '/magnatas',
      variant: 'secondary',
      visible: true,
    },
  ],
  sections: [
    { id: 'hero', visible: true },
    { id: 'highlights', visible: true },
    { id: 'featured_products', visible: true },
    { id: 'contact_highlights', visible: true },
  ],
  highlightsSectionKicker: 'Vivencia atleticana',
  highlightsSectionTitle: 'O que a {siteName} destaca logo na chegada ao site.',
  highlightsSectionText:
    'Os blocos abaixo resumem a proposta institucional da home e ajudam a direcionar o olhar para o que a atletica entrega no curso.',
  highlights: [
    {
      id: 'home-highlight-colecao',
      title: 'Colecao oficial com identidade forte',
      description:
        'Produtos desenhados para fazer a marca da {siteName} circular no campus, nos jogos e nos encontros da turma.',
      icon: 'shopping_bag',
      visible: true,
    },
    {
      id: 'home-highlight-recepcao',
      title: 'Recepcao e integracao com assinatura propria',
      description:
        'A experiencia de quem chega em Economia comeca com acolhimento, simbolos e memoria coletiva construidos pela atletica.',
      icon: 'users',
      visible: true,
    },
    {
      id: 'home-highlight-jogos',
      title: 'Presenca em jogos, baterias e campanhas',
      description:
        'A {siteName} organiza energia, representacao e narrativa visual para que a turma seja vista e lembrada.',
      icon: 'trophy',
      visible: true,
    },
  ],
  featuredSectionKicker: 'Produtos em destaque',
  featuredSectionTitle: 'Os itens que melhor representam a vitrine da {siteName}.',
  featuredSectionText:
    'A diretoria pode escolher manualmente o que aparece aqui para destacar lancamentos, produtos institucionais e itens mais procurados.',
  featuredProductIds: sampleProducts
    .filter((product) => product.featured)
    .slice(0, 3)
    .map((product) => product.id),
  featuredCtaLabel: 'Ver catalogo completo',
  featuredCtaHref: '/loja',
  contactsSectionKicker: 'Canais em destaque',
  contactsSectionTitle: 'Onde a comunidade encontra a {siteName} fora da pagina inicial.',
  contactsSectionText:
    'As redes e contatos abaixo ajudam a conectar atendimento, divulgacao de eventos e relacionamento da diretoria com a turma.',
  contacts: [
    {
      id: 'home-contact-instagram',
      label: 'Instagram oficial',
      value: '@magnatas.economia',
      href: 'https://instagram.com/magnatas.economia',
      kind: 'instagram',
      visible: true,
    },
    {
      id: 'home-contact-whatsapp',
      label: 'WhatsApp da diretoria',
      value: 'Atendimento para produtos e acoes',
      href: 'https://wa.me/5548999999999',
      kind: 'whatsapp',
      visible: true,
    },
    {
      id: 'home-contact-email',
      label: 'Contato institucional',
      value: 'diretoria.magnatas@outlook.com',
      href: 'mailto:diretoria.magnatas@outlook.com',
      kind: 'email',
      visible: true,
    },
  ],
  typography: cloneHomeTypographyMap(DEFAULT_HOME_TYPOGRAPHY),
};

const DEFAULT_MAGNATAS_CONTENT: MagnatasContent = {
  heroKicker: 'Identidade que representa Economia',
  title:
    'A {siteName} conecta esporte, recepcao e presenca universitaria em torno da turma de Ciencias Economicas.',
  subtitle:
    'Mais do que uma marca em camiseta, a atletica organiza memoria coletiva, torcida e experiencias que acompanham a graduacao do primeiro semestre ate os jogos e eventos do curso.',
  heroImageUrl: 'https://picsum.photos/seed/magnatas-hero-editorial/1400/980',
  ctas: [
    {
      id: 'magnatas-cta-loja',
      label: 'Ver a colecao oficial',
      href: '/loja',
      variant: 'primary',
      visible: true,
    },
    {
      id: 'magnatas-cta-instagram',
      label: 'Acompanhar no Instagram',
      href: 'https://instagram.com/magnatas.economia',
      variant: 'outline',
      visible: true,
    },
  ],
  sections: [
    { id: 'hero', visible: true },
    { id: 'who_we_are', visible: true },
    { id: 'history', visible: true },
    { id: 'modalities', visible: true },
    { id: 'events', visible: true },
    { id: 'partners', visible: true },
    { id: 'gallery', visible: true },
  ],
  whoWeAreKicker: 'Quem somos',
  whoWeAreTitle: 'A diretoria que transforma pertencimento em movimento.',
  whoWeAreText:
    'A {siteName} nasce da vontade de dar rosto, voz e energia a Ciencias Economicas na UNESC. A atletica articula recepcao de calouros, presenca em competicoes, campanhas de integracao e uma identidade visual capaz de fazer a turma se reconhecer dentro e fora do campus.',
  historyKicker: 'Historia',
  historyTitle: 'Como a {siteName} construiu presenca dentro da vivencia universitaria.',
  historyIntro:
    'A pagina institucional tambem pode registrar marcos, ciclos de diretoria e momentos que consolidaram a atletica como parte da memoria do curso.',
  historyItems: [
    {
      id: 'magnatas-history-1',
      title: 'Origem na integracao da turma',
      description:
        'A {siteName} surgiu para unir quem chegava ao curso com quem ja vivia a rotina de Economia, criando simbolos e rituais de pertencimento.',
      visible: true,
    },
    {
      id: 'magnatas-history-2',
      title: 'Consolidacao em jogos e campanhas',
      description:
        'Com o tempo, a atletica passou a organizar a presenca do curso em jogos, baterias, campanhas e eventos internos.',
      visible: true,
    },
    {
      id: 'magnatas-history-3',
      title: 'Marca reconhecida no campus',
      description:
        'A identidade visual, os produtos oficiais e a participacao da diretoria fizeram a {siteName} se tornar uma assinatura reconhecivel para a turma.',
      visible: true,
    },
  ],
  modalitiesKicker: 'Modalidades',
  modalitiesTitle: 'As frentes esportivas e de representacao que mobilizam a turma.',
  modalitiesIntro:
    'As modalidades nao precisam ficar restritas a um unico formato. A diretoria pode usar este bloco para mostrar esportes, torcida organizada e outras frentes universitarias.',
  modalities: [
    {
      id: 'magnatas-modality-1',
      title: 'Futsal',
      description:
        'Treinos, jogos amistosos e competicoes em que a {siteName} leva o nome de Economia para a quadra.',
      visible: true,
    },
    {
      id: 'magnatas-modality-2',
      title: 'Volei',
      description:
        'Uma modalidade que fortalece integracao, preparo coletivo e representacao do curso em eventos universitarios.',
      visible: true,
    },
    {
      id: 'magnatas-modality-3',
      title: 'Torcida e bateria',
      description:
        'A energia da arquibancada, os cantos e a atmosfera criada pela turma tambem fazem parte da identidade atleticana.',
      visible: true,
    },
  ],
  eventsKicker: 'Eventos',
  eventsTitle: 'Momentos em que a {siteName} aparece como organizadora e anfitria.',
  eventsIntro:
    'Este bloco ajuda a mostrar eventos de recepcao, integracao, jogos e acoes especiais conduzidas pela diretoria.',
  events: [
    {
      id: 'magnatas-event-1',
      title: 'Recepcao de calouros',
      description:
        'Acolhimento de novos estudantes com identidade visual forte, aproximacao da turma e memoria desde os primeiros dias.',
      imageUrl: 'https://picsum.photos/seed/magnatas-evento-calouros/900/700',
      visible: true,
    },
    {
      id: 'magnatas-event-2',
      title: 'Intercurso e jogos universitarios',
      description:
        'Dias em que a presenca da {siteName} organiza torcida, representacao e orgulho coletivo em torno de Economia.',
      imageUrl: 'https://picsum.photos/seed/magnatas-evento-jogos/900/700',
      visible: true,
    },
    {
      id: 'magnatas-event-3',
      title: 'Campanhas e encontros da diretoria',
      description:
        'Acoes que fortalecem o relacionamento com a turma, ampliam visibilidade e mantem a atletica ativa durante o semestre.',
      imageUrl: 'https://picsum.photos/seed/magnatas-evento-campanhas/900/700',
      visible: true,
    },
  ],
  partnersKicker: 'Parceiros',
  partnersTitle: 'As conexoes que ajudam a {siteName} a ampliar alcance e experiencia.',
  partnersIntro:
    'Parceiros podem incluir curso, centro academico, marcas locais e apoiadores que caminham ao lado da atletica.',
  partners: [
    {
      id: 'magnatas-partner-1',
      name: 'Centro Academico de Economia',
      description:
        'Parceiro institucional em integracao da turma, divulgacao e articulacao de acoes para estudantes.',
      logoUrl: 'https://picsum.photos/seed/magnatas-parceiro-ca/400/400',
      href: '/magnatas',
      visible: true,
    },
    {
      id: 'magnatas-partner-2',
      name: 'Negocios que apoiam a turma',
      description:
        'Empreendimentos locais que contribuem para eventos, materiais e experiencias promovidas pela diretoria.',
      logoUrl: 'https://picsum.photos/seed/magnatas-parceiro-negocios/400/400',
      href: '/magnatas',
      visible: true,
    },
    {
      id: 'magnatas-partner-3',
      name: 'Rede de ex-atleticanos',
      description:
        'Pessoas que mantem o vinculo com a historia da {siteName} e ajudam a preservar memoria, apoio e continuidade.',
      logoUrl: 'https://picsum.photos/seed/magnatas-parceiro-alumni/400/400',
      href: '/magnatas',
      visible: true,
    },
  ],
  galleryKicker: 'Imagens',
  galleryTitle: 'Registros que ajudam a contar a atmosfera da {siteName}.',
  galleryIntro:
    'A galeria pode destacar momentos de jogos, eventos, recepcao e bastidores para deixar a pagina institucional mais viva e conectada com a identidade da {siteName}.',
  images: [
    {
      id: 'magnatas-image-1',
      title: 'Torcida em dia de jogo',
      imageUrl: 'https://picsum.photos/seed/magnatas-galeria-torcida/900/700',
      visible: true,
    },
    {
      id: 'magnatas-image-2',
      title: 'Diretoria e integracao da turma',
      imageUrl: 'https://picsum.photos/seed/magnatas-galeria-diretoria/900/700',
      visible: true,
    },
    {
      id: 'magnatas-image-3',
      title: 'Colecao e identidade visual',
      imageUrl: 'https://picsum.photos/seed/magnatas-galeria-colecao/900/700',
      visible: true,
    },
  ],
  typography: cloneMagnatasTypographyMap(DEFAULT_MAGNATAS_TYPOGRAPHY),
};

export const defaultSiteContent: SiteContentConfig = {
  home: DEFAULT_HOME_CONTENT,
  magnatas: DEFAULT_MAGNATAS_CONTENT,
};

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

export function hasVisibleText(value: string | null | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

function sanitizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizeStringList(value: unknown, fallback: string[], allowEmpty = false) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  const list = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  if (!list.length && allowEmpty) {
    return [];
  }

  return list.length ? list : [...fallback];
}

function sanitizeEnum<T extends string>(value: unknown, allowedValues: T[], fallback: T) {
  if (typeof value === 'string' && allowedValues.includes(value as T)) {
    return value as T;
  }

  return fallback;
}

function mergeOrderedSections<T extends string>(
  input: unknown,
  defaults: Array<{ id: T; visible: boolean }>,
  allIds: T[]
) {
  const defaultVisibilityById = new Map(
    defaults.map((section) => [section.id, section.visible] as const)
  );

  if (!Array.isArray(input)) {
    return defaults.map((section) => ({ ...section }));
  }

  const normalizedSections: Array<{ id: T; visible: boolean }> = [];
  const seenIds = new Set<T>();

  input.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const candidate = item as Record<string, unknown>;
    const sectionId = sanitizeEnum(candidate.id, allIds, allIds[0]);

    if (seenIds.has(sectionId)) {
      return;
    }

    seenIds.add(sectionId);
    normalizedSections.push({
      id: sectionId,
      visible: sanitizeBoolean(
        candidate.visible,
        defaultVisibilityById.get(sectionId) ?? true
      ),
    });
  });

  allIds.forEach((sectionId) => {
    if (!seenIds.has(sectionId)) {
      normalizedSections.push({
        id: sectionId,
        visible: defaultVisibilityById.get(sectionId) ?? true,
      });
    }
  });

  return normalizedSections;
}

function mergeHomeCtas(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_HOME_CONTENT.ctas.map((cta) => ({ ...cta }));
  }

  return input.map((item, index) => {
    const fallback = DEFAULT_HOME_CONTENT.ctas[index] || {
      id: `home-cta-${index + 1}`,
      label: `CTA ${index + 1}`,
      href: '/',
      variant: 'outline' as HomeCtaVariant,
      visible: true,
    };
    const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      id: sanitizeString(candidate.id, fallback.id),
      label: sanitizeString(candidate.label, fallback.label, true),
      href: sanitizeString(candidate.href, fallback.href, true),
      variant: sanitizeEnum(candidate.variant, CTA_VARIANTS, fallback.variant),
      visible: sanitizeBoolean(candidate.visible, fallback.visible),
    } satisfies HomeCta;
  });
}

function mergeHomeHighlights(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_HOME_CONTENT.highlights.map((highlight) => ({ ...highlight }));
  }

  return input.map((item, index) => {
    const fallback = DEFAULT_HOME_CONTENT.highlights[index] || {
      id: `home-highlight-${index + 1}`,
      title: `Bloco ${index + 1}`,
      description: 'Descricao institucional da home.',
      icon: HOME_HIGHLIGHT_ICONS[index % HOME_HIGHLIGHT_ICONS.length],
      visible: true,
    };
    const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      id: sanitizeString(candidate.id, fallback.id),
      title: sanitizeString(candidate.title, fallback.title, true),
      description: sanitizeString(candidate.description, fallback.description, true),
      icon: sanitizeEnum(candidate.icon, HOME_HIGHLIGHT_ICONS, fallback.icon),
      visible: sanitizeBoolean(candidate.visible, fallback.visible),
    } satisfies HomeHighlight;
  });
}

function mergeHomeContacts(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_HOME_CONTENT.contacts.map((contact) => ({ ...contact }));
  }

  return input.map((item, index) => {
    const fallback = DEFAULT_HOME_CONTENT.contacts[index] || {
      id: `home-contact-${index + 1}`,
      label: `Contato ${index + 1}`,
      value: 'Canal da atletica',
      href: '/magnatas',
      kind: 'link' as HomeContactKind,
      visible: true,
    };
    const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      id: sanitizeString(candidate.id, fallback.id),
      label: sanitizeString(candidate.label, fallback.label, true),
      value: sanitizeString(candidate.value, fallback.value, true),
      href: sanitizeString(candidate.href, fallback.href, true),
      kind: sanitizeEnum(candidate.kind, HOME_CONTACT_KINDS, fallback.kind),
      visible: sanitizeBoolean(candidate.visible, fallback.visible),
    } satisfies HomeContact;
  });
}

function mergeHomeContent(input?: Partial<HomeContent> | null): HomeContent {
  const legacyInput = (input || {}) as Record<string, unknown>;

  return {
    heroKicker: sanitizeString(
      input?.heroKicker ?? legacyInput.kicker,
      DEFAULT_HOME_CONTENT.heroKicker,
      true
    ),
    title: sanitizeString(input?.title, DEFAULT_HOME_CONTENT.title, true),
    subtitle: sanitizeString(input?.subtitle, DEFAULT_HOME_CONTENT.subtitle, true),
    institutionalText: sanitizeString(
      input?.institutionalText ?? legacyInput.lead,
      DEFAULT_HOME_CONTENT.institutionalText,
      true
    ),
    coverImageUrl: sanitizeString(
      input?.coverImageUrl,
      DEFAULT_HOME_CONTENT.coverImageUrl,
      true
    ),
    coverKicker: sanitizeString(input?.coverKicker, DEFAULT_HOME_CONTENT.coverKicker, true),
    coverTitle: sanitizeString(
      input?.coverTitle ?? legacyInput.secondaryTitle,
      DEFAULT_HOME_CONTENT.coverTitle,
      true
    ),
    coverText: sanitizeString(
      input?.coverText ?? legacyInput.secondaryLead,
      DEFAULT_HOME_CONTENT.coverText,
      true
    ),
    ctas: mergeHomeCtas(input?.ctas),
    sections: mergeOrderedSections(
      input?.sections,
      DEFAULT_HOME_CONTENT.sections,
      HOME_SECTION_IDS
    ) as HomeSectionConfig[],
    highlightsSectionKicker: sanitizeString(
      input?.highlightsSectionKicker,
      DEFAULT_HOME_CONTENT.highlightsSectionKicker,
      true
    ),
    highlightsSectionTitle: sanitizeString(
      input?.highlightsSectionTitle,
      DEFAULT_HOME_CONTENT.highlightsSectionTitle,
      true
    ),
    highlightsSectionText: sanitizeString(
      input?.highlightsSectionText,
      DEFAULT_HOME_CONTENT.highlightsSectionText,
      true
    ),
    highlights: mergeHomeHighlights(input?.highlights),
    featuredSectionKicker: sanitizeString(
      input?.featuredSectionKicker ?? legacyInput.featuredKicker,
      DEFAULT_HOME_CONTENT.featuredSectionKicker,
      true
    ),
    featuredSectionTitle: sanitizeString(
      input?.featuredSectionTitle ?? legacyInput.featuredTitle,
      DEFAULT_HOME_CONTENT.featuredSectionTitle,
      true
    ),
    featuredSectionText: sanitizeString(
      input?.featuredSectionText,
      DEFAULT_HOME_CONTENT.featuredSectionText,
      true
    ),
    featuredProductIds: sanitizeStringList(
      Array.isArray(input?.featuredProductIds)
        ? input.featuredProductIds
        : DEFAULT_HOME_CONTENT.featuredProductIds,
      DEFAULT_HOME_CONTENT.featuredProductIds,
      true
    ),
    featuredCtaLabel: sanitizeString(
      input?.featuredCtaLabel,
      DEFAULT_HOME_CONTENT.featuredCtaLabel,
      true
    ),
    featuredCtaHref: sanitizeString(
      input?.featuredCtaHref,
      DEFAULT_HOME_CONTENT.featuredCtaHref,
      true
    ),
    contactsSectionKicker: sanitizeString(
      input?.contactsSectionKicker,
      DEFAULT_HOME_CONTENT.contactsSectionKicker,
      true
    ),
    contactsSectionTitle: sanitizeString(
      input?.contactsSectionTitle,
      DEFAULT_HOME_CONTENT.contactsSectionTitle,
      true
    ),
    contactsSectionText: sanitizeString(
      input?.contactsSectionText,
      DEFAULT_HOME_CONTENT.contactsSectionText,
      true
    ),
    contacts: mergeHomeContacts(input?.contacts),
    typography: mergeHomeTypographyMap(input?.typography),
  };
}

function mergeMagnatasCtas(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_MAGNATAS_CONTENT.ctas.map((cta) => ({ ...cta }));
  }

  return input.map((item, index) => {
    const fallback = DEFAULT_MAGNATAS_CONTENT.ctas[index] || {
      id: `magnatas-cta-${index + 1}`,
      label: `CTA ${index + 1}`,
      href: '/magnatas',
      variant: 'outline' as HomeCtaVariant,
      visible: true,
    };
    const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      id: sanitizeString(candidate.id, fallback.id),
      label: sanitizeString(candidate.label, fallback.label, true),
      href: sanitizeString(candidate.href, fallback.href, true),
      variant: sanitizeEnum(candidate.variant, CTA_VARIANTS, fallback.variant),
      visible: sanitizeBoolean(candidate.visible, fallback.visible),
    } satisfies MagnatasCta;
  });
}

function mergeMagnatasHistoryItems(input: unknown, legacyTimeline?: unknown) {
  const source = Array.isArray(input) ? input : legacyTimeline;

  if (!Array.isArray(source)) {
    return DEFAULT_MAGNATAS_CONTENT.historyItems.map((item) => ({ ...item }));
  }

  return source.map((item, index) => {
    const fallback = DEFAULT_MAGNATAS_CONTENT.historyItems[index] || {
      id: `magnatas-history-${index + 1}`,
      title: `Marco ${index + 1}`,
      description: 'Descreva um momento importante da trajetoria da atletica.',
      visible: true,
    };
    const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      id: sanitizeString(candidate.id, fallback.id),
      title: sanitizeString(candidate.title, fallback.title, true),
      description: sanitizeString(candidate.description, fallback.description, true),
      visible: sanitizeBoolean(candidate.visible, fallback.visible),
    } satisfies MagnatasHistoryItem;
  });
}

function mergeMagnatasModalities(input: unknown, legacyValues?: unknown) {
  const source = Array.isArray(input) ? input : legacyValues;

  if (!Array.isArray(source)) {
    return DEFAULT_MAGNATAS_CONTENT.modalities.map((item) => ({ ...item }));
  }

  return source.map((item, index) => {
    const fallback = DEFAULT_MAGNATAS_CONTENT.modalities[index] || {
      id: `magnatas-modality-${index + 1}`,
      title: `Modalidade ${index + 1}`,
      description: 'Descreva a frente esportiva ou de representacao.',
      visible: true,
    };
    const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      id: sanitizeString(candidate.id, fallback.id),
      title: sanitizeString(candidate.title, fallback.title, true),
      description: sanitizeString(candidate.description, fallback.description, true),
      visible: sanitizeBoolean(candidate.visible, fallback.visible),
    } satisfies MagnatasModality;
  });
}

function mergeMagnatasEvents(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_MAGNATAS_CONTENT.events.map((event) => ({ ...event }));
  }

  return input.map((item, index) => {
    const fallback = DEFAULT_MAGNATAS_CONTENT.events[index] || {
      id: `magnatas-event-${index + 1}`,
      title: `Evento ${index + 1}`,
      description: 'Descreva o evento realizado pela atletica.',
      imageUrl: 'https://picsum.photos/seed/magnatas-event-default/900/700',
      visible: true,
    };
    const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      id: sanitizeString(candidate.id, fallback.id),
      title: sanitizeString(candidate.title, fallback.title, true),
      description: sanitizeString(candidate.description, fallback.description, true),
      imageUrl: sanitizeString(candidate.imageUrl, fallback.imageUrl, true),
      visible: sanitizeBoolean(candidate.visible, fallback.visible),
    } satisfies MagnatasEvent;
  });
}

function mergeMagnatasPartners(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_MAGNATAS_CONTENT.partners.map((partner) => ({ ...partner }));
  }

  return input.map((item, index) => {
    const fallback = DEFAULT_MAGNATAS_CONTENT.partners[index] || {
      id: `magnatas-partner-${index + 1}`,
      name: `Parceiro ${index + 1}`,
      description: 'Descreva como este parceiro contribui com a atletica.',
      logoUrl: 'https://picsum.photos/seed/magnatas-partner-default/400/400',
      href: '/magnatas',
      visible: true,
    };
    const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      id: sanitizeString(candidate.id, fallback.id),
      name: sanitizeString(candidate.name, fallback.name, true),
      description: sanitizeString(candidate.description, fallback.description, true),
      logoUrl: sanitizeString(candidate.logoUrl, fallback.logoUrl, true),
      href: sanitizeString(candidate.href, fallback.href, true),
      visible: sanitizeBoolean(candidate.visible, fallback.visible),
    } satisfies MagnatasPartner;
  });
}

function mergeMagnatasImages(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_MAGNATAS_CONTENT.images.map((image) => ({ ...image }));
  }

  return input.map((item, index) => {
    const fallback = DEFAULT_MAGNATAS_CONTENT.images[index] || {
      id: `magnatas-image-${index + 1}`,
      title: `Imagem ${index + 1}`,
      imageUrl: 'https://picsum.photos/seed/magnatas-gallery-default/900/700',
      visible: true,
    };
    const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

    return {
      id: sanitizeString(candidate.id, fallback.id),
      title: sanitizeString(candidate.title, fallback.title, true),
      imageUrl: sanitizeString(candidate.imageUrl, fallback.imageUrl, true),
      visible: sanitizeBoolean(candidate.visible, fallback.visible),
    } satisfies MagnatasImage;
  });
}

function mergeMagnatasContent(input?: Partial<MagnatasContent> | null): MagnatasContent {
  const legacyInput = (input || {}) as Record<string, unknown>;

  return {
    heroKicker: sanitizeString(
      input?.heroKicker ?? legacyInput.kicker,
      DEFAULT_MAGNATAS_CONTENT.heroKicker,
      true
    ),
    title: sanitizeString(input?.title, DEFAULT_MAGNATAS_CONTENT.title, true),
    subtitle: sanitizeString(
      input?.subtitle ?? legacyInput.lead,
      DEFAULT_MAGNATAS_CONTENT.subtitle,
      true
    ),
    heroImageUrl: sanitizeString(
      input?.heroImageUrl,
      DEFAULT_MAGNATAS_CONTENT.heroImageUrl,
      true
    ),
    ctas: mergeMagnatasCtas(input?.ctas),
    sections: mergeOrderedSections(
      input?.sections,
      DEFAULT_MAGNATAS_CONTENT.sections,
      MAGNATAS_SECTION_IDS
    ) as MagnatasSectionConfig[],
    whoWeAreKicker: sanitizeString(
      input?.whoWeAreKicker,
      DEFAULT_MAGNATAS_CONTENT.whoWeAreKicker,
      true
    ),
    whoWeAreTitle: sanitizeString(
      input?.whoWeAreTitle,
      DEFAULT_MAGNATAS_CONTENT.whoWeAreTitle,
      true
    ),
    whoWeAreText: sanitizeString(
      input?.whoWeAreText ?? legacyInput.lead,
      DEFAULT_MAGNATAS_CONTENT.whoWeAreText,
      true
    ),
    historyKicker: sanitizeString(
      input?.historyKicker,
      DEFAULT_MAGNATAS_CONTENT.historyKicker,
      true
    ),
    historyTitle: sanitizeString(
      input?.historyTitle ?? legacyInput.timelineTitle,
      DEFAULT_MAGNATAS_CONTENT.historyTitle,
      true
    ),
    historyIntro: sanitizeString(
      input?.historyIntro,
      DEFAULT_MAGNATAS_CONTENT.historyIntro,
      true
    ),
    historyItems: mergeMagnatasHistoryItems(input?.historyItems, legacyInput.timeline),
    modalitiesKicker: sanitizeString(
      input?.modalitiesKicker,
      DEFAULT_MAGNATAS_CONTENT.modalitiesKicker,
      true
    ),
    modalitiesTitle: sanitizeString(
      input?.modalitiesTitle,
      DEFAULT_MAGNATAS_CONTENT.modalitiesTitle,
      true
    ),
    modalitiesIntro: sanitizeString(
      input?.modalitiesIntro,
      DEFAULT_MAGNATAS_CONTENT.modalitiesIntro,
      true
    ),
    modalities: mergeMagnatasModalities(input?.modalities, legacyInput.values),
    eventsKicker: sanitizeString(
      input?.eventsKicker,
      DEFAULT_MAGNATAS_CONTENT.eventsKicker,
      true
    ),
    eventsTitle: sanitizeString(
      input?.eventsTitle,
      DEFAULT_MAGNATAS_CONTENT.eventsTitle,
      true
    ),
    eventsIntro: sanitizeString(
      input?.eventsIntro,
      DEFAULT_MAGNATAS_CONTENT.eventsIntro,
      true
    ),
    events: mergeMagnatasEvents(input?.events),
    partnersKicker: sanitizeString(
      input?.partnersKicker,
      DEFAULT_MAGNATAS_CONTENT.partnersKicker,
      true
    ),
    partnersTitle: sanitizeString(
      input?.partnersTitle,
      DEFAULT_MAGNATAS_CONTENT.partnersTitle,
      true
    ),
    partnersIntro: sanitizeString(
      input?.partnersIntro,
      DEFAULT_MAGNATAS_CONTENT.partnersIntro,
      true
    ),
    partners: mergeMagnatasPartners(input?.partners),
    galleryKicker: sanitizeString(
      input?.galleryKicker,
      DEFAULT_MAGNATAS_CONTENT.galleryKicker,
      true
    ),
    galleryTitle: sanitizeString(
      input?.galleryTitle,
      DEFAULT_MAGNATAS_CONTENT.galleryTitle,
      true
    ),
    galleryIntro: sanitizeString(
      input?.galleryIntro,
      DEFAULT_MAGNATAS_CONTENT.galleryIntro,
      true
    ),
    images: mergeMagnatasImages(input?.images),
    typography: mergeMagnatasTypographyMap(input?.typography),
  };
}

export function mergeSiteContent(input?: SiteContentMergeInput | null): SiteContentConfig {
  return {
    home: mergeHomeContent(input?.home),
    magnatas: mergeMagnatasContent(input?.magnatas),
  };
}

export function loadSiteContent() {
  if (typeof window === 'undefined') {
    return defaultSiteContent;
  }

  try {
    const savedContent = window.localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
    if (!savedContent) {
      return defaultSiteContent;
    }

    const parsedContent = JSON.parse(savedContent) as Partial<SiteContentConfig>;
    return mergeSiteContent(parsedContent);
  } catch {
    return defaultSiteContent;
  }
}

export function persistSiteContent(content: SiteContentConfig) {
  const mergedContent = mergeSiteContent(content);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(mergedContent));
    } catch {
      return mergedContent;
    }
  }

  return mergedContent;
}

export function clearStoredSiteContent() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(SITE_CONTENT_STORAGE_KEY);
    } catch {
      return;
    }
  }
}

export function replaceSiteNameToken(value: string, siteName: string) {
  return value.replace(/\{siteName\}/g, siteName);
}
