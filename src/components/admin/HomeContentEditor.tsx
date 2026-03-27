import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import AdminImageUploadField from './AdminImageUploadField';
import AdminSplitPreviewFrame from './AdminSplitPreviewFrame';
import { useAdminEditorPersistence } from './useAdminEditorPersistence';
import { ADMIN_DRAFT_STORAGE_KEYS, ADMIN_PREVIEW_ROUTES } from '../../lib/adminPreview';
import { useProductCatalog } from '../../lib/ProductCatalogContext';
import { HOME_SECTION_LABELS, mergeSiteContent, replaceSiteNameToken } from '../../lib/siteContent';
import { useSiteContent } from '../../lib/SiteContentContext';
import { formatCurrency } from '../../lib/formatCurrency';
import { useBranding } from '../../lib/BrandingContext';
import type {
  HomeContact,
  HomeContactKind,
  HomeContent,
  HomeCta,
  HomeCtaVariant,
  HomeHighlight,
  HomeHighlightIcon,
  HomeSectionConfig,
} from '../../types/siteContent';

const CTA_VARIANTS: HomeCtaVariant[] = ['primary', 'secondary', 'outline'];
const HIGHLIGHT_ICONS: HomeHighlightIcon[] = [
  'shopping_bag',
  'trophy',
  'users',
  'megaphone',
];
const CONTACT_KINDS: HomeContactKind[] = ['instagram', 'whatsapp', 'email', 'link'];
const HOME_COVER_UPLOAD_OPTIONS = {
  maxWidth: 1800,
  maxHeight: 1400,
  quality: 0.9,
};

function cloneHomeContent(content: HomeContent): HomeContent {
  return {
    ...content,
    ctas: content.ctas.map((cta) => ({ ...cta })),
    sections: content.sections.map((section) => ({ ...section })),
    highlights: content.highlights.map((highlight) => ({ ...highlight })),
    featuredProductIds: [...content.featuredProductIds],
    contacts: content.contacts.map((contact) => ({ ...contact })),
    typography: { ...content.typography },
  };
}

export default function HomeContentEditor() {
  const { content, defaultContent, saveContent } = useSiteContent();
  const { products } = useProductCatalog();
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
  } = useAdminEditorPersistence<HomeContent>({
    draftStorageKey: ADMIN_DRAFT_STORAGE_KEYS.home,
    sourceValue: content.home,
    sanitizeDraft: (candidate) =>
      cloneHomeContent(mergeSiteContent({ home: candidate as Partial<HomeContent> }).home),
    onSave: (nextHome) => {
      const persistedContent = saveContent({
        ...content,
        home: nextHome,
      });
      return cloneHomeContent(persistedContent.home);
    },
    onReset: () => {
      const persistedContent = saveContent({
        ...content,
        home: defaultContent.home,
      });
      return cloneHomeContent(persistedContent.home);
    },
    saveSuccessMessage: 'Conteudo da Home salvo e publicado na area publica.',
    resetSuccessMessage: 'Conteudo da Home restaurado para o padrao configurado.',
  });

  function updateField(field: keyof Omit<HomeContent, 'ctas' | 'sections' | 'highlights' | 'featuredProductIds' | 'contacts'>, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateCta(index: number, patch: Partial<HomeCta>) {
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
          id: `home-cta-${current.ctas.length + 1}`,
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

  function updateHighlight(index: number, patch: Partial<HomeHighlight>) {
    setFormState((current) => ({
      ...current,
      highlights: current.highlights.map((highlight, currentIndex) =>
        currentIndex === index ? { ...highlight, ...patch } : highlight
      ),
    }));
  }

  function addHighlight() {
    setFormState((current) => ({
      ...current,
      highlights: [
        ...current.highlights,
        {
          id: `home-highlight-${current.highlights.length + 1}`,
          title: '',
          description: '',
          icon: 'megaphone',
          visible: true,
        },
      ],
    }));
  }

  function removeHighlight(index: number) {
    setFormState((current) => ({
      ...current,
      highlights: current.highlights.filter((_, currentIndex) => currentIndex !== index),
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

  function updateSection(index: number, patch: Partial<HomeSectionConfig>) {
    setFormState((current) => ({
      ...current,
      sections: current.sections.map((section, currentIndex) =>
        currentIndex === index ? { ...section, ...patch } : section
      ),
    }));
  }

  function toggleFeaturedProduct(productId: string) {
    setFormState((current) => {
      const isSelected = current.featuredProductIds.includes(productId);

      return {
        ...current,
        featuredProductIds: isSelected
          ? current.featuredProductIds.filter((id) => id !== productId)
          : [...current.featuredProductIds, productId],
      };
    });
  }

  function updateContact(index: number, patch: Partial<HomeContact>) {
    setFormState((current) => ({
      ...current,
      contacts: current.contacts.map((contact, currentIndex) =>
        currentIndex === index ? { ...contact, ...patch } : contact
      ),
    }));
  }

  function addContact() {
    setFormState((current) => ({
      ...current,
      contacts: [
        ...current.contacts,
        {
          id: `home-contact-${current.contacts.length + 1}`,
          label: '',
          value: '',
          href: '',
          kind: 'link',
          visible: true,
        },
      ],
    }));
  }

  function removeContact(index: number) {
    setFormState((current) => ({
      ...current,
      contacts: current.contacts.filter((_, currentIndex) => currentIndex !== index),
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
          <p className="kicker">Editor da Home</p>
          <h2 className="section-title">Hero, CTAs, secoes, produtos e contatos.</h2>
          <p className="lead">
            Use o token <code>{'{siteName}'}</code> quando quiser inserir automaticamente o
            nome atual da marca. A tipografia dos textos publicos agora e herdada de
            <strong>Aparencia</strong> para manter consistencia; aqui voce foca no conteudo.
            Campos textuais podem ficar vazios; o site publico oculta apenas o trecho correspondente.
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
            ? 'As edicoes ficam guardadas como rascunho local ate voce salvar.'
            : 'A Home publica ja esta sincronizada com o ultimo conteudo salvo.'}
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
                  <h3 className="section-title">Titulo, subtitulo, texto e capa.</h3>
                </div>
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
              <span className="field-label">Titulo principal</span>
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

            <label className="field field-full">
              <span className="field-label">Texto institucional</span>
              <textarea
                className="input textarea"
                value={formState.institutionalText}
                onChange={(event) => updateField('institutionalText', event.target.value)}
              />
            </label>

            <AdminImageUploadField
              label="Imagem de capa"
              value={formState.coverImageUrl}
              onChange={(value) => updateField('coverImageUrl', value)}
              previewAlt={formState.coverTitle || formState.title}
              helperText="Envie a capa editorial da Home. Se remover a imagem, a pagina usa automaticamente a capa definida em Aparencia."
              fallbackPreviewUrl={resolvedBranding.homeCoverUrl}
              previewClassName="admin-upload-cover-image"
              uploadOptions={HOME_COVER_UPLOAD_OPTIONS}
              onUploadStatus={setEditorStatus}
            />

          </div>

            </section>

        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">CTAs</p>
              <h3 className="section-title">Botoes principais da Home.</h3>
            </div>

            <button type="button" className="button button-outline" onClick={addCta}>
              <Plus size={16} />
              Adicionar CTA
            </button>
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
              <h3 className="section-title">Visibilidade e sequencia da Home.</h3>
            </div>
          </div>

          <div className="admin-sort-list">
            {formState.sections.map((section, index) => (
              <article key={section.id} className="card admin-sort-item">
                <div>
                  <strong>{HOME_SECTION_LABELS[section.id]}</strong>
                  <p className="muted">
                    Controle se esta secao aparece e em qual ordem ela entra na Home.
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
                    aria-label="Mover secao para cima"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => moveSection(index, 'down')}
                    disabled={index === formState.sections.length - 1}
                    aria-label="Mover secao para baixo"
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
              <p className="kicker">Blocos visiveis</p>
              <h3 className="section-title">Blocos institucionais da Home.</h3>
            </div>

            <button type="button" className="button button-outline" onClick={addHighlight}>
              <Plus size={16} />
              Adicionar bloco
            </button>
          </div>

          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker da secao</span>
              <input
                className="input"
                type="text"
                value={formState.highlightsSectionKicker}
                onChange={(event) =>
                  updateField('highlightsSectionKicker', event.target.value)
                }
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo da secao</span>
              <textarea
                className="input textarea"
                value={formState.highlightsSectionTitle}
                onChange={(event) =>
                  updateField('highlightsSectionTitle', event.target.value)
                }
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto da secao</span>
              <textarea
                className="input textarea"
                value={formState.highlightsSectionText}
                onChange={(event) =>
                  updateField('highlightsSectionText', event.target.value)
                }
              />
            </label>
          </div>

          <div className="admin-edit-grid">
            {formState.highlights.map((highlight, index) => (
              <article key={highlight.id} className="card admin-subcard">
                <div className="admin-inline-actions">
                  <p className="kicker">Bloco {index + 1}</p>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removeHighlight(index)}
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
                    value={highlight.title}
                    onChange={(event) => updateHighlight(index, { title: event.target.value })}
                  />
                </label>

                <label className="field">
                  <span className="field-label">Descricao</span>
                  <textarea
                    className="input textarea"
                    value={highlight.description}
                    onChange={(event) =>
                      updateHighlight(index, { description: event.target.value })
                    }
                  />
                </label>

                <label className="field">
                  <span className="field-label">Icone</span>
                  <select
                    className="input"
                    value={highlight.icon}
                    onChange={(event) =>
                      updateHighlight(index, {
                        icon: event.target.value as HomeHighlightIcon,
                      })
                    }
                  >
                    {HIGHLIGHT_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-check">
                  <input
                    type="checkbox"
                    checked={highlight.visible}
                    onChange={(event) =>
                      updateHighlight(index, { visible: event.target.checked })
                    }
                  />
                  <span>Bloco visivel</span>
                </label>
              </article>
            ))}
          </div>

        </section>

        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Produtos em destaque</p>
              <h3 className="section-title">Selecione os itens exibidos na Home.</h3>
            </div>
          </div>

          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker da vitrine</span>
              <input
                className="input"
                type="text"
                value={formState.featuredSectionKicker}
                onChange={(event) =>
                  updateField('featuredSectionKicker', event.target.value)
                }
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo da vitrine</span>
              <textarea
                className="input textarea"
                value={formState.featuredSectionTitle}
                onChange={(event) =>
                  updateField('featuredSectionTitle', event.target.value)
                }
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto da vitrine</span>
              <textarea
                className="input textarea"
                value={formState.featuredSectionText}
                onChange={(event) =>
                  updateField('featuredSectionText', event.target.value)
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Rotulo do CTA</span>
              <input
                className="input"
                type="text"
                value={formState.featuredCtaLabel}
                onChange={(event) => updateField('featuredCtaLabel', event.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">Destino do CTA</span>
              <input
                className="input"
                type="text"
                value={formState.featuredCtaHref}
                onChange={(event) => updateField('featuredCtaHref', event.target.value)}
              />
            </label>
          </div>

          <div className="admin-selection-grid">
            {products.map((product) => {
              const isSelected = formState.featuredProductIds.includes(product.id);

              return (
                <article
                  key={product.id}
                  className={
                    isSelected
                      ? 'card admin-selection-card admin-selection-card-active'
                      : 'card admin-selection-card'
                  }
                >
                  <img src={product.imageUrl} alt={product.name} className="admin-selection-thumb" />
                  <div className="admin-selection-copy">
                    <strong>{product.name}</strong>
                    <span>{formatCurrency(product.price)}</span>
                  </div>
                  <button
                    type="button"
                    className={isSelected ? 'button button-secondary' : 'button button-outline'}
                    onClick={() => toggleFeaturedProduct(product.id)}
                  >
                    {isSelected ? 'Selecionado' : 'Destacar'}
                  </button>
                </article>
              );
            })}
          </div>

        </section>

        <section className="card admin-subcard">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Contatos e redes</p>
              <h3 className="section-title">Canais destacados na Home.</h3>
            </div>

            <button type="button" className="button button-outline" onClick={addContact}>
              <Plus size={16} />
              Adicionar contato
            </button>
          </div>

          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker da secao</span>
              <input
                className="input"
                type="text"
                value={formState.contactsSectionKicker}
                onChange={(event) =>
                  updateField('contactsSectionKicker', event.target.value)
                }
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo da secao</span>
              <textarea
                className="input textarea"
                value={formState.contactsSectionTitle}
                onChange={(event) =>
                  updateField('contactsSectionTitle', event.target.value)
                }
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto da secao</span>
              <textarea
                className="input textarea"
                value={formState.contactsSectionText}
                onChange={(event) =>
                  updateField('contactsSectionText', event.target.value)
                }
              />
            </label>
          </div>

          <div className="admin-contact-channels-grid">
            {formState.contacts.map((contact, index) => (
              <article key={contact.id} className="card admin-subcard">
                <div className="admin-inline-actions">
                  <p className="kicker">Canal {index + 1}</p>
                  <label className="admin-check" style={{ marginLeft: 'auto' }}>
                    <input
                      type="checkbox"
                      checked={contact.visible}
                      onChange={(event) => updateContact(index, { visible: event.target.checked })}
                    />
                    <span>Visivel</span>
                  </label>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => removeContact(index)}
                  >
                    <Trash2 size={16} />
                    Remover
                  </button>
                </div>

                <div className="admin-contact-channel-fields">
                  <label className="field">
                    <span className="field-label">Rotulo</span>
                    <input
                      className="input"
                      type="text"
                      value={contact.label}
                      onChange={(event) => updateContact(index, { label: event.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Tipo</span>
                    <select
                      className="input"
                      value={contact.kind}
                      onChange={(event) =>
                        updateContact(index, { kind: event.target.value as HomeContactKind })
                      }
                    >
                      {CONTACT_KINDS.map((kind) => (
                        <option key={kind} value={kind}>
                          {kind}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">Valor exibido</span>
                    <input
                      className="input"
                      type="text"
                      value={contact.value}
                      onChange={(event) => updateContact(index, { value: event.target.value })}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Link</span>
                    <input
                      className="input"
                      type="text"
                      value={contact.href}
                      onChange={(event) => updateContact(index, { href: event.target.value })}
                    />
                  </label>
                </div>
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

        </div>

        {isSplitPreviewOpen && (
          <AdminSplitPreviewFrame
            title="Home publica"
            description="O lado direito acompanha o rascunho atual da Home sem precisar salvar antes."
            src={ADMIN_PREVIEW_ROUTES.home}
          />
        )}
      </div>
    </section>
  );
}
