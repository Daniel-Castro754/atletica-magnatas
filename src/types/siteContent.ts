import type { TypographyStyleMap } from './typography';

export type HomeCtaVariant = 'primary' | 'secondary' | 'outline';

export type HomeHighlightIcon = 'shopping_bag' | 'trophy' | 'users' | 'megaphone';

export type HomeContactKind = 'instagram' | 'whatsapp' | 'email' | 'link';

export type HomeSectionId =
  | 'hero'
  | 'highlights'
  | 'featured_products'
  | 'contact_highlights';

export type HomeSectionConfig = {
  id: HomeSectionId;
  visible: boolean;
};

export type HomeTypographySlot =
  | 'hero_kicker'
  | 'hero_title'
  | 'hero_subtitle'
  | 'hero_text'
  | 'hero_cover_kicker'
  | 'hero_cover_title'
  | 'hero_cover_text'
  | 'hero_cta'
  | 'highlights_section_kicker'
  | 'highlights_section_title'
  | 'highlights_section_text'
  | 'highlight_card_title'
  | 'highlight_card_description'
  | 'featured_section_kicker'
  | 'featured_section_title'
  | 'featured_section_text'
  | 'featured_cta'
  | 'contacts_section_kicker'
  | 'contacts_section_title'
  | 'contacts_section_text'
  | 'contact_label'
  | 'contact_value';

export type HomeCta = {
  id: string;
  label: string;
  href: string;
  variant: HomeCtaVariant;
  visible: boolean;
};

export type HomeHighlight = {
  id: string;
  title: string;
  description: string;
  icon: HomeHighlightIcon;
  visible: boolean;
};

export type HomeContact = {
  id: string;
  label: string;
  value: string;
  href: string;
  kind: HomeContactKind;
  visible: boolean;
};

export type HomeContent = {
  heroKicker: string;
  title: string;
  subtitle: string;
  institutionalText: string;
  coverImageUrl: string;
  coverKicker: string;
  coverTitle: string;
  coverText: string;
  ctas: HomeCta[];
  sections: HomeSectionConfig[];
  highlightsSectionKicker: string;
  highlightsSectionTitle: string;
  highlightsSectionText: string;
  highlights: HomeHighlight[];
  featuredSectionKicker: string;
  featuredSectionTitle: string;
  featuredSectionText: string;
  featuredProductIds: string[];
  featuredCtaLabel: string;
  featuredCtaHref: string;
  contactsSectionKicker: string;
  contactsSectionTitle: string;
  contactsSectionText: string;
  contacts: HomeContact[];
  typography: TypographyStyleMap<HomeTypographySlot>;
};

export type MagnatasSectionId =
  | 'hero'
  | 'who_we_are'
  | 'history'
  | 'modalities'
  | 'events'
  | 'partners'
  | 'gallery';

export type MagnatasSectionConfig = {
  id: MagnatasSectionId;
  visible: boolean;
};

export type MagnatasTypographySlot =
  | 'hero_kicker'
  | 'hero_title'
  | 'hero_subtitle'
  | 'hero_cta'
  | 'who_we_are_kicker'
  | 'who_we_are_title'
  | 'who_we_are_text'
  | 'history_kicker'
  | 'history_title'
  | 'history_intro'
  | 'history_item_title'
  | 'history_item_description'
  | 'modalities_kicker'
  | 'modalities_title'
  | 'modalities_intro'
  | 'modality_title'
  | 'modality_description'
  | 'events_kicker'
  | 'events_title'
  | 'events_intro'
  | 'event_title'
  | 'event_description'
  | 'partners_kicker'
  | 'partners_title'
  | 'partners_intro'
  | 'partner_name'
  | 'partner_description'
  | 'gallery_kicker'
  | 'gallery_title'
  | 'gallery_intro'
  | 'gallery_image_title';

export type MagnatasCta = {
  id: string;
  label: string;
  href: string;
  variant: HomeCtaVariant;
  visible: boolean;
};

export type MagnatasHistoryItem = {
  id: string;
  title: string;
  description: string;
  visible: boolean;
};

export type MagnatasModality = {
  id: string;
  title: string;
  description: string;
  visible: boolean;
};

export type MagnatasEvent = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  visible: boolean;
};

export type MagnatasPartner = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  href: string;
  visible: boolean;
};

export type MagnatasImage = {
  id: string;
  title: string;
  imageUrl: string;
  visible: boolean;
};

export type MagnatasContent = {
  heroKicker: string;
  title: string;
  subtitle: string;
  heroImageUrl: string;
  ctas: MagnatasCta[];
  sections: MagnatasSectionConfig[];
  whoWeAreKicker: string;
  whoWeAreTitle: string;
  whoWeAreText: string;
  historyKicker: string;
  historyTitle: string;
  historyIntro: string;
  historyItems: MagnatasHistoryItem[];
  modalitiesKicker: string;
  modalitiesTitle: string;
  modalitiesIntro: string;
  modalities: MagnatasModality[];
  eventsKicker: string;
  eventsTitle: string;
  eventsIntro: string;
  events: MagnatasEvent[];
  partnersKicker: string;
  partnersTitle: string;
  partnersIntro: string;
  partners: MagnatasPartner[];
  galleryKicker: string;
  galleryTitle: string;
  galleryIntro: string;
  images: MagnatasImage[];
  typography: TypographyStyleMap<MagnatasTypographySlot>;
};

export type SiteContentConfig = {
  home: HomeContent;
  magnatas: MagnatasContent;
};
