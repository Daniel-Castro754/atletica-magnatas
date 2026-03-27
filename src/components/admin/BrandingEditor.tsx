import { useState, type FormEvent } from 'react';
import AdminImageUploadField from './AdminImageUploadField';
import AdminSplitPreviewFrame from './AdminSplitPreviewFrame';
import AdminTypographyControl from './AdminTypographyControl';
import { useAdminEditorPersistence } from './useAdminEditorPersistence';
import { ADMIN_DRAFT_STORAGE_KEYS, ADMIN_PREVIEW_ROUTES } from '../../lib/adminPreview';
import { useBranding } from '../../lib/BrandingContext';
import { mergeBrandingConfig, resolveBrandingConfig } from '../../lib/branding';
import {
  BRANDING_TYPOGRAPHY_GROUPS,
  cloneBrandingTypographyMap,
} from '../../lib/brandingTypography';
import { createTypographyClassName } from '../../lib/typography';
import type {
  BrandingConfig,
  BrandingColors,
  BrandingTypographySlot,
} from '../../types/branding';
import type { TextTypographyStyle } from '../../types/typography';

const LOGO_UPLOAD_OPTIONS = {
  maxWidth: 1200,
  maxHeight: 720,
  quality: 0.9,
};

const FAVICON_UPLOAD_OPTIONS = {
  maxWidth: 256,
  maxHeight: 256,
  quality: 0.92,
};

const HOME_COVER_UPLOAD_OPTIONS = {
  maxWidth: 1800,
  maxHeight: 1400,
  quality: 0.9,
};

function cloneBrandingConfig(config: BrandingConfig): BrandingConfig {
  return {
    ...config,
    colors: {
      ...config.colors,
    },
    typography: cloneBrandingTypographyMap(config.typography),
  };
}

type ColorField = keyof BrandingColors;
type TextField =
  | 'siteName'
  | 'shortName'
  | 'subtitle'
  | 'browserTitle'
  | 'customLogoUrl'
  | 'customFaviconUrl'
  | 'customHomeCoverUrl';

export default function BrandingEditor() {
  const { branding, saveBranding, resetBranding } = useBranding();
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
  } = useAdminEditorPersistence<BrandingConfig>({
    draftStorageKey: ADMIN_DRAFT_STORAGE_KEYS.branding,
    sourceValue: branding,
    sanitizeDraft: (candidate) => cloneBrandingConfig(mergeBrandingConfig(candidate as Partial<BrandingConfig>)),
    onSave: saveBranding,
    onReset: resetBranding,
    saveSuccessMessage:
      'Branding salvo. Navbar, footer, home, favicon, cores e tipografia foram atualizados.',
    resetSuccessMessage: 'Branding restaurado para o padrao configurado do projeto.',
  });
  const previewBranding = resolveBrandingConfig(formState);

  function updateField(field: TextField, value: string) {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateColor(field: ColorField, value: string) {
    setFormState((current) => ({
      ...current,
      colors: {
        ...current.colors,
        [field]: value,
      },
    }));
  }

  function updateTypography(slot: BrandingTypographySlot, value: TextTypographyStyle) {
    setFormState((current) => ({
      ...current,
      typography: {
        ...current.typography,
        [slot]: value,
      },
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSave();
  }

  function handleResetClick() {
    void handleReset();
  }

  function renderTypographyGroup(groupId: string) {
    const group = BRANDING_TYPOGRAPHY_GROUPS.find((item) => item.id === groupId);

    if (!group) {
      return null;
    }

    return (
      <div className="admin-typography-panel">
        <div className="admin-typography-copy">
          <p className="kicker">Tipografia</p>
          <h3 className="section-title">{group.label}</h3>
          <p className="muted">{group.description}</p>
        </div>

        <div className="admin-typography-grid">
          {group.fields.map((field) => (
            <AdminTypographyControl
              key={field.slot}
              label={field.label}
              value={formState.typography[field.slot]}
              previewText={field.previewText}
              onChange={(value) => updateTypography(field.slot, value)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="card branding-editor">
      <div className="page-header branding-header">
        <div>
          <p className="kicker">Branding</p>
          <h2 className="section-title">Base configuravel da identidade visual.</h2>
          <p className="lead">
            Logo, favicon, capa principal, paleta e tipografia global agora saem de uma
            configuracao central. As imagens podem ser enviadas direto do computador e,
            se removidas, o projeto volta para as artes padrao geradas automaticamente.
            Nome curto, subtitulo e titulo da aba podem ficar vazios; o nome principal
            da marca continua sendo a referencia obrigatoria.
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
            ? 'As alteracoes ficam em rascunho local ate voce salvar.'
            : 'O site publico ja esta refletindo o ultimo branding salvo.'}
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
            <div className="branding-grid">
          <label className="field">
            <span className="field-label">Nome do site (obrigatorio)</span>
            <input
              className="input"
              type="text"
              value={formState.siteName}
              onChange={(event) => updateField('siteName', event.target.value)}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Nome curto</span>
            <input
              className="input"
              type="text"
              value={formState.shortName}
              onChange={(event) => updateField('shortName', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">Subtitulo</span>
            <input
              className="input"
              type="text"
              value={formState.subtitle}
              onChange={(event) => updateField('subtitle', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">Titulo da aba</span>
            <input
              className="input"
              type="text"
              value={formState.browserTitle}
              onChange={(event) => updateField('browserTitle', event.target.value)}
            />
          </label>

            <AdminImageUploadField
              label="Logo principal"
              value={formState.customLogoUrl}
              onChange={(value) => updateField('customLogoUrl', value)}
              previewAlt={`Logo ${formState.siteName || previewBranding.siteName}`}
              helperText="Envie o arquivo do logo principal da marca. Ao remover, o sistema volta para a arte padrao."
              fallbackPreviewUrl={previewBranding.logoUrl}
              previewClassName="branding-preview-image"
              uploadOptions={LOGO_UPLOAD_OPTIONS}
              onUploadStatus={setEditorStatus}
            />

            <AdminImageUploadField
              label="Favicon"
              value={formState.customFaviconUrl}
              onChange={(value) => updateField('customFaviconUrl', value)}
              previewAlt={`Favicon ${formState.siteName || previewBranding.siteName}`}
              helperText="Envie um icone quadrado para a aba do navegador. Ao remover, o sistema gera um favicon automaticamente."
              fallbackPreviewUrl={previewBranding.faviconUrl}
              previewClassName="branding-favicon-preview"
              uploadOptions={FAVICON_UPLOAD_OPTIONS}
              onUploadStatus={setEditorStatus}
            />

          </div>

        {renderTypographyGroup('brand_signature')}
        {renderTypographyGroup('site_global')}

        <div className="branding-color-grid">
          {(
            [
              ['primary', 'Cor primaria'],
              ['accent', 'Cor de destaque'],
              ['support', 'Cor de apoio'],
              ['background', 'Cor de fundo'],
            ] as [ColorField, string][]
          ).map(([field, label]) => (
            <label key={field} className="field">
              <span className="field-label">{label}</span>
              <div className="color-control">
                <input
                  className="color-input"
                  type="color"
                  value={formState.colors[field]}
                  onChange={(event) => updateColor(field, event.target.value)}
                />
                <input
                  className="input"
                  type="text"
                  value={formState.colors[field]}
                  onChange={(event) => updateColor(field, event.target.value)}
                />
              </div>
            </label>
          ))}
        </div>

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
            <div className="branding-preview-grid">
              <article className="card branding-preview-card">
                <p className="kicker">Logo atual</p>
                <img
                  className="branding-preview-image"
                  src={previewBranding.logoUrl}
                  alt={`Logo ${previewBranding.siteName}`}
                />
              </article>

              <article className="card branding-preview-card">
                <p className="kicker">Favicon</p>
                <img
                  className="branding-favicon-preview"
                  src={previewBranding.faviconUrl}
                  alt={`Favicon ${previewBranding.siteName}`}
                />
              </article>

              <article className="card branding-preview-card">
                <p className="kicker">Assinatura da marca</p>
                <div className="branding-type-preview">
                  {formState.shortName.trim() && (
                    <span
                      className={createTypographyClassName(
                        formState.typography.brand_tag,
                        'brand-tag branding-brand-tag-preview'
                      )}
                    >
                      {formState.shortName}
                    </span>
                  )}
                  <strong
                    className={createTypographyClassName(
                      formState.typography.brand_title,
                      'branding-brand-title-preview'
                    )}
                  >
                    {formState.siteName}
                  </strong>
                  {formState.subtitle.trim() && (
                    <span
                      className={createTypographyClassName(
                        formState.typography.brand_subtitle,
                        'branding-brand-subtitle-preview'
                      )}
                    >
                      {formState.subtitle}
                    </span>
                  )}
                </div>
              </article>

              <article className="card branding-preview-card">
                <p className="kicker">Tipografia global</p>
                <div className="branding-type-preview">
                  <strong
                    className={createTypographyClassName(
                      formState.typography.site_title,
                      'branding-brand-title-preview'
                    )}
                  >
                    Titulo global do site
                  </strong>
                  <span
                    className={createTypographyClassName(
                      formState.typography.site_subtitle,
                      'branding-brand-subtitle-preview'
                    )}
                  >
                    Subtitulo global para Home, Institucional e Eventos
                  </span>
                  <span
                    className={createTypographyClassName(
                      formState.typography.site_description,
                      'branding-brand-subtitle-preview'
                    )}
                  >
                    Descricoes e textos de apoio seguem este estilo por padrao.
                  </span>
                </div>
              </article>

              <article className="card branding-preview-card branding-preview-cover">
                <p className="kicker">Capa principal</p>
                <div
                  className="branding-cover-preview"
                  style={{ backgroundImage: `url("${previewBranding.homeCoverUrl}")` }}
                />
              </article>

              <article className="card branding-preview-card">
                <p className="kicker">Paleta</p>
                <div className="branding-palette">
                  {Object.entries(formState.colors).map(([key, value]) => (
                    <div key={key} className="branding-color-token">
                      <span className="branding-color-swatch" style={{ backgroundColor: value }} />
                      <div>
                        <strong>{key}</strong>
                        <span>{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}
        </div>

        {isSplitPreviewOpen && (
          <AdminSplitPreviewFrame
            title="Aparencia publica"
            description="O preview da direita reaproveita a interface publica real com o branding atual do formulario."
            src={ADMIN_PREVIEW_ROUTES.branding}
          />
        )}
      </div>
    </section>
  );
}
