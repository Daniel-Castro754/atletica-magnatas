import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AdminImageUploadField from './AdminImageUploadField';
import AdminSplitPreviewFrame from './AdminSplitPreviewFrame';
import { useAdminEditorPersistence } from './useAdminEditorPersistence';
import { ADMIN_DRAFT_STORAGE_KEYS, ADMIN_PREVIEW_ROUTES } from '../../lib/adminPreview';
import { useBranding } from '../../lib/BrandingContext';
import {
  MAGNATAS_SECTION_LABELS,
  mergeSiteContent,
  replaceSiteNameToken,
} from '../../lib/siteContent';
import { useSiteContent } from '../../lib/SiteContentContext';
import type {
  HomeCtaVariant,
  MagnatasContent,
  MagnatasCta,
  MagnatasEvent,
  MagnatasHistoryItem,
  MagnatasImage,
  MagnatasModality,
  MagnatasPartner,
  MagnatasSectionConfig,
} from '../../types/siteContent';

const CTA_VARIANTS: HomeCtaVariant[] = ['primary', 'secondary', 'outline'];
const HERO_UPLOAD_OPTIONS = {
  maxWidth: 1800,
  maxHeight: 1400,
  quality: 0.9,
};
const CONTENT_IMAGE_UPLOAD_OPTIONS = {
  maxWidth: 1600,
  maxHeight: 1200,
  quality: 0.88,
};
const PARTNER_LOGO_UPLOAD_OPTIONS = {
  maxWidth: 600,
  maxHeight: 600,
  quality: 0.9,
};

function cloneMagnatasContent(content: MagnatasContent): MagnatasContent {
  return {
    ...content,
    ctas: content.ctas.map((cta) => ({ ...cta })),
    sections: content.sections.map((section) => ({ ...section })),
    historyItems: content.historyItems.map((item) => ({ ...item })),
    modalities: content.modalities.map((item) => ({ ...item })),
    events: content.events.map((item) => ({ ...item })),
    partners: content.partners.map((item) => ({ ...item })),
    images: content.images.map((item) => ({ ...item })),
    typography: { ...content.typography },
  };
}

export default function MagnatasContentEditor() {
  const { content, defaultContent, saveContent } = useSiteContent();
  const { resolvedBranding } = useBranding();
  const [isSplitPreviewOpen, setIsSplitPreviewOpen] = useState(false);
  const {
    formState,
    setFormState,
    isDirty,
    isSaving,
    status,
    handleSave,
    handleReset,
    setEditorStatus,
  } = useAdminEditorPersistence<MagnatasContent>({
    draftStorageKey: ADMIN_DRAFT_STORAGE_KEYS.magnatas,
    sourceValue: content.magnatas,
    sanitizeDraft: (candidate) =>
      cloneMagnatasContent(
        mergeSiteContent({ magnatas: candidate as Partial<MagnatasContent> }).magnatas
      ),
    onSave: (nextMagnatas) => {
      const persistedContent = saveContent({
        ...content,
        magnatas: nextMagnatas,
      });
      return cloneMagnatasContent(persistedContent.magnatas);
    },
    onReset: () => {
      const persistedContent = saveContent({
        ...content,
        magnatas: defaultContent.magnatas,
      });
      return cloneMagnatasContent(persistedContent.magnatas);
    },
    saveSuccessMessage: 'Conteudo da pagina institucional salvo e publicado.',
    resetSuccessMessage: 'Conteudo da pagina institucional restaurado para o padrao configurado.',
  });

  function updateField<
    K extends keyof Omit<
      MagnatasContent,
      'ctas' | 'sections' | 'historyItems' | 'modalities' | 'events' | 'partners' | 'images'
    >
  >(field: K, value: MagnatasContent[K]) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateCta(index: number, patch: Partial<MagnatasCta>) {
    setFormState((current) => ({
      ...current,
      ctas: current.ctas.map((cta, currentIndex) =>
        currentIndex === index ? { ...cta, ...patch } : cta
      ),
    }));
  }

  function addCta() {
    setFormState((current) => ({
      ...current,
      ctas: [
        ...current.ctas,
        {
          id: `magnatas-cta-${current.ctas.length + 1}`,
          label: '',
          href: '',
          variant: 'outline',
          visible: true,
        },
      ],
    }));
  }

  function removeCta(index: number) {
    setFormState((current) => ({
      ...current,
      ctas: current.ctas.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function moveSection(index: number, direction: 'up' | 'down') {
    setFormState((current) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.sections.length) {
        return current;
      }

      const sections = [...current.sections];
      const [movedSection] = sections.splice(index, 1);
      sections.splice(targetIndex, 0, movedSection);

      return {
        ...current,
        sections,
      };
    });
  }

  function updateSection(index: number, patch: Partial<MagnatasSectionConfig>) {
    setFormState((current) => ({
      ...current,
      sections: current.sections.map((section, currentIndex) =>
        currentIndex === index ? { ...section, ...patch } : section
      ),
    }));
  }

  function updateHistoryItem(index: number, patch: Partial<MagnatasHistoryItem>) {
    setFormState((current) => ({
      ...current,
      historyItems: current.historyItems.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function addHistoryItem() {
    setFormState((current) => ({
      ...current,
      historyItems: [
        ...current.historyItems,
        {
          id: `magnatas-history-${current.historyItems.length + 1}`,
          title: '',
          description: '',
          visible: true,
        },
      ],
    }));
  }

  function removeHistoryItem(index: number) {
    setFormState((current) => ({
      ...current,
      historyItems: current.historyItems.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateModality(index: number, patch: Partial<MagnatasModality>) {
    setFormState((current) => ({
      ...current,
      modalities: current.modalities.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function addModality() {
    setFormState((current) => ({
      ...current,
      modalities: [
        ...current.modalities,
        {
          id: `magnatas-modality-${current.modalities.length + 1}`,
          title: '',
          description: '',
          visible: true,
        },
      ],
    }));
  }

  function removeModality(index: number) {
    setFormState((current) => ({
      ...current,
      modalities: current.modalities.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateEvent(index: number, patch: Partial<MagnatasEvent>) {
    setFormState((current) => ({
      ...current,
      events: current.events.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function addEvent() {
    setFormState((current) => ({
      ...current,
      events: [
        ...current.events,
        {
          id: `magnatas-event-${current.events.length + 1}`,
          title: '',
          description: '',
          imageUrl: '',
          visible: true,
        },
      ],
    }));
  }

  function removeEvent(index: number) {
    setFormState((current) => ({
      ...current,
      events: current.events.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updatePartner(index: number, patch: Partial<MagnatasPartner>) {
    setFormState((current) => ({
      ...current,
      partners: current.partners.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function addPartner() {
    setFormState((current) => ({
      ...current,
      partners: [
        ...current.partners,
        {
          id: `magnatas-partner-${current.partners.length + 1}`,
          name: '',
          description: '',
          logoUrl: '',
          href: '',
          visible: true,
        },
      ],
    }));
  }

  function removePartner(index: number) {
    setFormState((current) => ({
      ...current,
      partners: current.partners.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function updateImage(index: number, patch: Partial<MagnatasImage>) {
    setFormState((current) => ({
      ...current,
      images: current.images.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      ),
    }));
  }

  function addImage() {
    setFormState((current) => ({
      ...current,
      images: [
        ...current.images,
        {
          id: `magnatas-image-${current.images.length + 1}`,
          title: '',
          imageUrl: '',
          visible: true,
        },
      ],
    }));
  }

  function removeImage(index: number) {
    setFormState((current) => ({
      ...current,
      images: current.images.filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSave();
  }

  function handleResetClick() {
    void handleReset();
  }

  return (
    <section className="card admin-form-section">
      <div className="admin-section-header">
        <div>
          <p className="kicker">Editor Institucional</p>
          <h2 className="section-title">Hero, historia, modalidades, eventos e parceiros da area institucional.</h2>
          <p className="lead">
            Tudo o que aparece em <code>/magnatas</code> como pagina institucional pode ser
            ajustado aqui sem abrir codigo. O token <code>{'{siteName}'}</code> continua
            disponivel, e a tipografia publica agora e herdada de <strong>Aparencia</strong>
            para reduzir microconfiguracoes repetidas. Os campos textuais podem ser salvos
            em branco sem remover o bloco.
          </p>
        </div>
      </div>

      <div className="admin-editor-toolbar">
        <span
          className={
            isDirty
              ? 'admin-editor-state admin-editor-state-dirty'
              : 'admin-editor-state admin-editor-state-clean'
          }
        >
          {isDirty ? 'Alteracoes nao salvas' : 'Tudo salvo nesta guia'}
        </span>
        <span className="muted">
          {isDirty
            ? 'Hero, eventos, parceiros e galeria ficam em rascunho local ate o salvamento.'
            : 'A pagina institucional publica ja esta refletindo o ultimo conteudo salvo.'}
        </span>
        <button
          type="button"
          className="button button-outline"
          onClick={() => setIsSplitPreviewOpen((currentValue) => !currentValue)}
        >
          {isSplitPreviewOpen ? 'Fechar preview' : 'Dividir tela'}
        </button>
      </div>

      {status && <div className={`status-banner status-banner-${status.tone}`}>{status.message}</div>}

      <div
        className={
          isSplitPreviewOpen
            ? 'admin-visual-editor-shell admin-visual-editor-shell-split'
            : 'admin-visual-editor-shell'
        }
      >
        <div className="admin-visual-editor-main">
          <form className="branding-form" onSubmit={handleSubmit}>
        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Hero principal</p>
              <h3 className="section-title">Titulo, subtitulo, imagem e CTAs.</h3>
            </div>

            <button type="button" className="button button-outline" onClick={addCta}>
              <Plus size={16} />
              Adicionar CTA
            </button>
          </div>

          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker</span>
              <input
                className="input"
                type="text"
                value={formState.heroKicker}
                onChange={(event) => updateField('heroKicker', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo</span>
              <textarea
                className="input textarea"
                value={formState.title}
                onChange={(event) => updateField('title', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Subtitulo</span>
              <textarea
                className="input textarea"
                value={formState.subtitle}
                onChange={(event) => updateField('subtitle', event.target.value)}
              />
            </label>

            <AdminImageUploadField
              label="Imagem principal"
              value={formState.heroImageUrl}
              onChange={(value) => updateField('heroImageUrl', value)}
              previewAlt={formState.title}
              helperText="Envie a imagem principal da pagina institucional. Se remover, a pagina usa a capa principal definida no branding."
              fallbackPreviewUrl={resolvedBranding.homeCoverUrl}
              previewClassName="admin-upload-cover-image"
              uploadOptions={HERO_UPLOAD_OPTIONS}
              onUploadStatus={setEditorStatus}
            />
          </div>

          <div className="admin-edit-grid">
            {formState.ctas.map((cta, index) => (
              <article key={cta.id} className="card admin-subcard">
                <div className="admin-inline-actions">
                  <p className="kicker">CTA {index + 1}</p>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removeCta(index)}
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>

                <label className="field">
                  <span className="field-label">Rotulo</span>
                  <input
                    className="input"
                    type="text"
                    value={cta.label}
                    onChange={(event) => updateCta(index, { label: event.target.value })}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Destino</span>
                  <input
                    className="input"
                    type="text"
                    value={cta.href}
                    onChange={(event) => updateCta(index, { href: event.target.value })}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Estilo</span>
                  <select
                    className="input"
                    value={cta.variant}
                    onChange={(event) =>
                      updateCta(index, { variant: event.target.value as HomeCtaVariant })
                    }
                  >
                    {CTA_VARIANTS.map((variant) => (
                      <option key={variant} value={variant}>
                        {variant}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={cta.visible}
                    onChange={(event) => updateCta(index, { visible: event.target.checked })}
                  />
                  <span>CTA visivel</span>
                </label>
              </article>
            ))}
          </div>
        </section>

        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Ordem das secoes</p>
              <h3 className="section-title">Visibilidade e sequencia da pagina.</h3>
            </div>
          </div>

          <div className="admin-sort-list">
            {formState.sections.map((section, index) => (
              <article key={section.id} className="card admin-sort-item">
                <div>
                  <strong>{MAGNATAS_SECTION_LABELS[section.id]}</strong>
                  <p className="muted">
                    Controle a ordem de leitura e a visibilidade desta secao na pagina institucional publica.
                  </p>
                </div>

                <div className="admin-inline-actions">
                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={section.visible}
                      onChange={(event) =>
                        updateSection(index, { visible: event.target.checked })
                      }
                    />
                    <span>Visivel</span>
                  </label>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => moveSection(index, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === formState.sections.length - 1}
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Quem somos</p>
              <h3 className="section-title">Texto institucional da atletica.</h3>
            </div>
          </div>

          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker</span>
              <input
                className="input"
                type="text"
                value={formState.whoWeAreKicker}
                onChange={(event) => updateField('whoWeAreKicker', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo</span>
              <textarea
                className="input textarea"
                value={formState.whoWeAreTitle}
                onChange={(event) => updateField('whoWeAreTitle', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Quem somos</span>
              <textarea
                className="input textarea"
                value={formState.whoWeAreText}
                onChange={(event) => updateField('whoWeAreText', event.target.value)}
              />
            </label>
          </div>

        </section>

        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Historia</p>
              <h3 className="section-title">Linha editorial e marcos da atletica.</h3>
            </div>

            <button type="button" className="button button-outline" onClick={addHistoryItem}>
              <Plus size={16} />
              Adicionar marco
            </button>
          </div>

          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker</span>
              <input
                className="input"
                type="text"
                value={formState.historyKicker}
                onChange={(event) => updateField('historyKicker', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo</span>
              <textarea
                className="input textarea"
                value={formState.historyTitle}
                onChange={(event) => updateField('historyTitle', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto de apoio</span>
              <textarea
                className="input textarea"
                value={formState.historyIntro}
                onChange={(event) => updateField('historyIntro', event.target.value)}
              />
            </label>
          </div>

          <div className="admin-edit-grid">
            {formState.historyItems.map((item, index) => (
              <article key={item.id} className="card admin-subcard">
                <div className="admin-inline-actions">
                  <p className="kicker">Marco {index + 1}</p>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removeHistoryItem(index)}
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>

                <label className="field">
                  <span className="field-label">Titulo</span>
                  <input
                    className="input"
                    type="text"
                    value={item.title}
                    onChange={(event) =>
                      updateHistoryItem(index, { title: event.target.value })
                    }
                  />
                </label>

                <label className="field">
                  <span className="field-label">Descricao</span>
                  <textarea
                    className="input textarea"
                    value={item.description}
                    onChange={(event) =>
                      updateHistoryItem(index, { description: event.target.value })
                    }
                  />
                </label>

                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(event) =>
                      updateHistoryItem(index, { visible: event.target.checked })
                    }
                  />
                  <span>Marco visivel</span>
                </label>
              </article>
            ))}
          </div>

        </section>

        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Modalidades</p>
              <h3 className="section-title">Frentes esportivas e de representacao.</h3>
            </div>

            <button type="button" className="button button-outline" onClick={addModality}>
              <Plus size={16} />
              Adicionar modalidade
            </button>
          </div>

          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker</span>
              <input
                className="input"
                type="text"
                value={formState.modalitiesKicker}
                onChange={(event) => updateField('modalitiesKicker', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo</span>
              <textarea
                className="input textarea"
                value={formState.modalitiesTitle}
                onChange={(event) => updateField('modalitiesTitle', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto de apoio</span>
              <textarea
                className="input textarea"
                value={formState.modalitiesIntro}
                onChange={(event) => updateField('modalitiesIntro', event.target.value)}
              />
            </label>
          </div>

          <div className="admin-edit-grid">
            {formState.modalities.map((item, index) => (
              <article key={item.id} className="card admin-subcard">
                <div className="admin-inline-actions">
                  <p className="kicker">Modalidade {index + 1}</p>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removeModality(index)}
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>

                <label className="field">
                  <span className="field-label">Titulo</span>
                  <input
                    className="input"
                    type="text"
                    value={item.title}
                    onChange={(event) => updateModality(index, { title: event.target.value })}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Descricao</span>
                  <textarea
                    className="input textarea"
                    value={item.description}
                    onChange={(event) =>
                      updateModality(index, { description: event.target.value })
                    }
                  />
                </label>

                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(event) =>
                      updateModality(index, { visible: event.target.checked })
                    }
                  />
                  <span>Modalidade visivel</span>
                </label>
              </article>
            ))}
          </div>

        </section>

        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Eventos</p>
              <h3 className="section-title">Eventos e acoes em destaque.</h3>
            </div>

            <button type="button" className="button button-outline" onClick={addEvent}>
              <Plus size={16} />
              Adicionar evento
            </button>
          </div>

          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker</span>
              <input
                className="input"
                type="text"
                value={formState.eventsKicker}
                onChange={(event) => updateField('eventsKicker', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo</span>
              <textarea
                className="input textarea"
                value={formState.eventsTitle}
                onChange={(event) => updateField('eventsTitle', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto de apoio</span>
              <textarea
                className="input textarea"
                value={formState.eventsIntro}
                onChange={(event) => updateField('eventsIntro', event.target.value)}
              />
            </label>
          </div>

          <div className="admin-edit-grid">
            {formState.events.map((item, index) => (
              <article key={item.id} className="card admin-subcard">
                <div className="admin-inline-actions">
                  <p className="kicker">Evento {index + 1}</p>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removeEvent(index)}
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>

                <label className="field">
                  <span className="field-label">Titulo</span>
                  <input
                    className="input"
                    type="text"
                    value={item.title}
                    onChange={(event) => updateEvent(index, { title: event.target.value })}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Descricao</span>
                  <textarea
                    className="input textarea"
                    value={item.description}
                    onChange={(event) =>
                      updateEvent(index, { description: event.target.value })
                    }
                  />
                </label>

                <AdminImageUploadField
                  label="Imagem do evento"
                  value={item.imageUrl}
                  onChange={(value) => updateEvent(index, { imageUrl: value })}
                  previewAlt={item.title}
                  helperText="Envie a foto que representa este evento. Se remover, o card fica sem imagem personalizada."
                  previewClassName="admin-media-thumb"
                  uploadOptions={CONTENT_IMAGE_UPLOAD_OPTIONS}
                  onUploadStatus={setEditorStatus}
                />

                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(event) =>
                      updateEvent(index, { visible: event.target.checked })
                    }
                  />
                  <span>Evento visivel</span>
                </label>
              </article>
            ))}
          </div>

        </section>

        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Parceiros</p>
              <h3 className="section-title">Apoiadores, redes e conexoes da atletica.</h3>
            </div>

            <button type="button" className="button button-outline" onClick={addPartner}>
              <Plus size={16} />
              Adicionar parceiro
            </button>
          </div>

          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker</span>
              <input
                className="input"
                type="text"
                value={formState.partnersKicker}
                onChange={(event) => updateField('partnersKicker', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo</span>
              <textarea
                className="input textarea"
                value={formState.partnersTitle}
                onChange={(event) => updateField('partnersTitle', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto de apoio</span>
              <textarea
                className="input textarea"
                value={formState.partnersIntro}
                onChange={(event) => updateField('partnersIntro', event.target.value)}
              />
            </label>
          </div>

          <div className="admin-edit-grid">
            {formState.partners.map((item, index) => (
              <article key={item.id} className="card admin-subcard">
                <div className="admin-inline-actions">
                  <p className="kicker">Parceiro {index + 1}</p>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removePartner(index)}
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>

                <label className="field">
                  <span className="field-label">Nome</span>
                  <input
                    className="input"
                    type="text"
                    value={item.name}
                    onChange={(event) => updatePartner(index, { name: event.target.value })}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Descricao</span>
                  <textarea
                    className="input textarea"
                    value={item.description}
                    onChange={(event) =>
                      updatePartner(index, { description: event.target.value })
                    }
                  />
                </label>

                <AdminImageUploadField
                  label="Logo do parceiro"
                  value={item.logoUrl}
                  onChange={(value) => updatePartner(index, { logoUrl: value })}
                  previewAlt={item.name}
                  helperText="Envie o logo ou selo visual do parceiro. Se remover, o card mostra apenas o nome e a descricao."
                  previewClassName="admin-logo-thumb"
                  uploadOptions={PARTNER_LOGO_UPLOAD_OPTIONS}
                  onUploadStatus={setEditorStatus}
                />

                <label className="field">
                  <span className="field-label">Link</span>
                  <input
                    className="input"
                    type="text"
                    value={item.href}
                    onChange={(event) => updatePartner(index, { href: event.target.value })}
                  />
                </label>

                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(event) =>
                      updatePartner(index, { visible: event.target.checked })
                    }
                  />
                  <span>Parceiro visivel</span>
                </label>
              </article>
            ))}
          </div>

        </section>

        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Galeria</p>
              <h3 className="section-title">Imagens da pagina institucional.</h3>
            </div>

            <button type="button" className="button button-outline" onClick={addImage}>
              <Plus size={16} />
              Adicionar imagem
            </button>
          </div>

          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker</span>
              <input
                className="input"
                type="text"
                value={formState.galleryKicker}
                onChange={(event) => updateField('galleryKicker', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo</span>
              <textarea
                className="input textarea"
                value={formState.galleryTitle}
                onChange={(event) => updateField('galleryTitle', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto de apoio</span>
              <textarea
                className="input textarea"
                value={formState.galleryIntro}
                onChange={(event) => updateField('galleryIntro', event.target.value)}
              />
            </label>
          </div>

          <div className="admin-edit-grid">
            {formState.images.map((item, index) => (
              <article key={item.id} className="card admin-subcard">
                <div className="admin-inline-actions">
                  <p className="kicker">Imagem {index + 1}</p>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removeImage(index)}
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>

                <label className="field">
                  <span className="field-label">Titulo</span>
                  <input
                    className="input"
                    type="text"
                    value={item.title}
                    onChange={(event) => updateImage(index, { title: event.target.value })}
                  />
                </label>

                <AdminImageUploadField
                  label="Imagem da galeria"
                  value={item.imageUrl}
                  onChange={(value) => updateImage(index, { imageUrl: value })}
                  previewAlt={item.title}
                  helperText="Envie a foto que entra nesta posicao da galeria. Se remover, o item permanece sem imagem ate novo upload."
                  previewClassName="admin-media-thumb"
                  uploadOptions={CONTENT_IMAGE_UPLOAD_OPTIONS}
                  onUploadStatus={setEditorStatus}
                />

                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={item.visible}
                    onChange={(event) => updateImage(index, { visible: event.target.checked })}
                  />
                  <span>Imagem visivel</span>
                </label>
              </article>
            ))}
          </div>

        </section>

            <div className="button-row">
              <button type="submit" className="button" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
              </button>
              <button
                type="button"
                className="button button-outline"
                onClick={handleResetClick}
                disabled={isSaving}
              >
                Restaurar padrao
              </button>
            </div>
          </form>

          {!isSplitPreviewOpen && (
            <div className="card admin-preview-card">
              <p className="kicker">Resumo do preview</p>
              <h3>{replaceSiteNameToken(formState.title, resolvedBranding.siteName)}</h3>
              <p className="muted">
                {replaceSiteNameToken(formState.subtitle, resolvedBranding.siteName)}
              </p>
              <div
                className="branding-cover-preview"
                style={{
                  backgroundImage: `url("${formState.heroImageUrl || resolvedBranding.homeCoverUrl}")`,
                }}
              />
              <ul className="check-list">
                <li>{formState.sections.filter((section) => section.visible).length} secoes visiveis.</li>
                <li>{formState.ctas.filter((cta) => cta.visible).length} CTAs ativos.</li>
                <li>{formState.historyItems.filter((item) => item.visible).length} marcos publicados.</li>
                <li>{formState.images.filter((item) => item.visible).length} imagens na galeria.</li>
              </ul>
            </div>
          )}
        </div>

        {isSplitPreviewOpen && (
          <AdminSplitPreviewFrame
            title="Pagina Institucional"
            description="O preview da direita acompanha o rascunho institucional enquanto voce edita."
            src={ADMIN_PREVIEW_ROUTES.magnatas}
          />
        )}
      </div>
    </section>
  );
}
