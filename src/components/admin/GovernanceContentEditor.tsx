import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import AdminImageUploadField from './AdminImageUploadField';
import { useAdminEditorPersistence } from './useAdminEditorPersistence';
import { ADMIN_DRAFT_STORAGE_KEYS } from '../../lib/adminPreview';
import { uploadFileToProjectStorage } from '../../lib/fileUpload';
import { useGovernance } from '../../lib/GovernanceContext';
import { GOVERNANCE_SECTION_LABELS, mergeGovernanceContent } from '../../lib/governance';
import type {
  GovernanceCommitmentItem,
  GovernanceContent,
  GovernanceDocument,
  GovernanceMember,
  GovernanceRoleItem,
  GovernanceSectionConfig,
} from '../../types/governance';

const MEMBER_IMAGE_UPLOAD_OPTIONS = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.84,
};

function createEntityId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeOrderedItems<T extends { displayOrder: number }>(items: T[]) {
  return items.map((item, index) => ({
    ...item,
    displayOrder: index + 1,
  }));
}

function moveItem<T>(items: T[], index: number, direction: 'up' | 'down') {
  const nextIndex = direction === 'up' ? index - 1 : index + 1;

  if (nextIndex < 0 || nextIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(index, 1);
  nextItems.splice(nextIndex, 0, movedItem);
  return nextItems;
}

function createEmptyMember(length: number): GovernanceMember {
  return {
    id: createEntityId('governance-member'),
    name: '',
    role: '',
    photoUrl: '',
    bio: '',
    contactLabel: '',
    contactHref: '',
    displayOrder: length + 1,
    visible: true,
  };
}

function createEmptyRole(length: number): GovernanceRoleItem {
  return {
    id: createEntityId('governance-role'),
    title: '',
    description: '',
    displayOrder: length + 1,
    visible: true,
  };
}

function createEmptyCommitment(length: number): GovernanceCommitmentItem {
  return {
    id: createEntityId('governance-commitment'),
    title: '',
    description: '',
    displayOrder: length + 1,
    visible: true,
  };
}

function createEmptyDocument(length: number): GovernanceDocument {
  return {
    id: createEntityId('governance-document'),
    title: '',
    description: '',
    category: 'Documento',
    date: '',
    href: '',
    fileName: '',
    displayOrder: length + 1,
    visible: true,
  };
}

function SectionCopyFields({
  kicker,
  title,
  text,
  onKickerChange,
  onTitleChange,
  onTextChange,
}: {
  kicker: string;
  title: string;
  text: string;
  onKickerChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onTextChange: (value: string) => void;
}) {
  return (
    <div className="admin-governance-grid">
      <label className="field">
        <span className="field-label">Kicker da secao</span>
        <input className="input" type="text" value={kicker} onChange={(event) => onKickerChange(event.target.value)} />
      </label>
      <label className="field">
        <span className="field-label">Titulo da secao</span>
        <input className="input" type="text" value={title} onChange={(event) => onTitleChange(event.target.value)} />
      </label>
      <label className="field field-full">
        <span className="field-label">Texto de apoio</span>
        <textarea className="input textarea admin-governance-textarea-short" value={text} onChange={(event) => onTextChange(event.target.value)} />
      </label>
    </div>
  );
}

function ItemShell({
  title,
  subtitle,
  visible,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  onRemove,
  disableMoveUp,
  disableMoveDown,
  children,
}: {
  title: string;
  subtitle?: string;
  visible: boolean;
  onToggleVisible: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
  children: ReactNode;
}) {
  return (
    <article className="card admin-governance-item">
      <div className="admin-governance-item-head">
        <div className="admin-governance-item-title">
          <strong>{title}</strong>
          {subtitle ? <span className="muted">{subtitle}</span> : null}
        </div>
        <div className="admin-governance-item-actions">
          <span className={visible ? 'pill pill-accent' : 'pill'}>{visible ? 'Visivel' : 'Oculto'}</span>
          <button type="button" className="icon-button" onClick={onToggleVisible} aria-label={visible ? 'Ocultar item' : 'Exibir item'}>
            {visible ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button type="button" className="icon-button" onClick={onMoveUp} disabled={disableMoveUp} aria-label="Mover para cima">
            <ArrowUp size={16} />
          </button>
          <button type="button" className="icon-button" onClick={onMoveDown} disabled={disableMoveDown} aria-label="Mover para baixo">
            <ArrowDown size={16} />
          </button>
          <button type="button" className="icon-button admin-product-action-button-danger" onClick={onRemove} aria-label="Remover item">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {children}
    </article>
  );
}

export default function GovernanceContentEditor() {
  const { content, saveContent, resetContent } = useGovernance();
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(null);

  const { formState, setFormState, isDirty, isSaving, status, handleSave, handleReset, setEditorStatus } =
    useAdminEditorPersistence<GovernanceContent>({
      draftStorageKey: ADMIN_DRAFT_STORAGE_KEYS.governance,
      sourceValue: content,
      sanitizeDraft: (candidate) => mergeGovernanceContent(candidate as Partial<GovernanceContent>),
      onSave: saveContent,
      onReset: resetContent,
      saveSuccessMessage: 'Diretoria e Transparencia salva e publicada.',
      resetSuccessMessage: 'Conteudo de Diretoria e Transparencia restaurado para o padrao.',
    });

  const visibleSections = formState.sections.filter((section) => section.visible).length;
  const visibleMembers = formState.members.filter((item) => item.visible).length;
  const visibleDocuments = formState.documents.filter((item) => item.visible).length;

  function updateField<K extends keyof GovernanceContent>(field: K, value: GovernanceContent[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function updateSections(updater: (sections: GovernanceSectionConfig[]) => GovernanceSectionConfig[]) {
    setFormState((current) => ({ ...current, sections: updater(current.sections) }));
  }

  function updateMembers(updater: (items: GovernanceMember[]) => GovernanceMember[]) {
    setFormState((current) => ({ ...current, members: normalizeOrderedItems(updater(current.members)) }));
  }

  function updateRoles(updater: (items: GovernanceRoleItem[]) => GovernanceRoleItem[]) {
    setFormState((current) => ({ ...current, roles: normalizeOrderedItems(updater(current.roles)) }));
  }

  function updateCommitments(updater: (items: GovernanceCommitmentItem[]) => GovernanceCommitmentItem[]) {
    setFormState((current) => ({ ...current, commitments: normalizeOrderedItems(updater(current.commitments)) }));
  }

  function updateDocuments(updater: (items: GovernanceDocument[]) => GovernanceDocument[]) {
    setFormState((current) => ({ ...current, documents: normalizeOrderedItems(updater(current.documents)) }));
  }

  async function handleDocumentUpload(documentId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingDocumentId(documentId);
    try {
      const asset = await uploadFileToProjectStorage(file);
      updateDocuments((documents) => documents.map((document) => (
        document.id === documentId ? { ...document, href: asset.url, fileName: asset.fileName } : document
      )));
      setEditorStatus(`Arquivo "${asset.fileName}" anexado ao documento.`, 'success');
    } catch (error) {
      setEditorStatus(error instanceof Error ? error.message : 'Nao foi possivel enviar o arquivo.', 'error');
    } finally {
      setUploadingDocumentId(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSave();
  }

  return (
    <section className="admin-page-grid">
      <article className="card admin-page-intro admin-products-page-head">
        <div className="admin-products-page-summary">
          <p className="kicker">Diretoria</p>
          <h2 className="section-title">Diretoria e Transparencia</h2>
          <p className="muted">Edite a gestao atual, cargos, compromissos, documentos e contato institucional em uma area unica e facil de manter.</p>
        </div>
        <div className="admin-products-page-actions">
          <span className="pill">{visibleSections} secoes visiveis</span>
          <span className="pill pill-accent">{visibleMembers} membros publicados</span>
          <span className="pill">{visibleDocuments} documentos visiveis</span>
        </div>
      </article>

      {status && <div className={`status-banner status-banner-${status.tone}`}>{status.message}</div>}

      <form className="admin-governance-form" onSubmit={handleSubmit}>
        <article className="card admin-subcard admin-governance-card">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Hero simples</p>
              <h3 className="section-title">Apresentacao da pagina</h3>
            </div>
            {isDirty ? <span className="pill">Rascunho alterado</span> : null}
          </div>
          <div className="admin-governance-grid">
            <label className="field">
              <span className="field-label">Titulo da pagina</span>
              <input className="input" type="text" value={formState.title} onChange={(event) => updateField('title', event.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Eyebrow / kicker</span>
              <input className="input" type="text" value={formState.heroKicker} onChange={(event) => updateField('heroKicker', event.target.value)} />
            </label>
            <label className="field field-full">
              <span className="field-label">Subtitulo</span>
              <textarea className="input textarea admin-governance-textarea-short" value={formState.subtitle} onChange={(event) => updateField('subtitle', event.target.value)} />
            </label>
            <label className="field field-full">
              <span className="field-label">Texto institucional de abertura</span>
              <textarea className="input textarea admin-governance-textarea-medium" value={formState.introText} onChange={(event) => updateField('introText', event.target.value)} />
            </label>
          </div>
        </article>

        <article className="card admin-subcard admin-governance-card">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Estrutura</p>
              <h3 className="section-title">Ordem e visibilidade das secoes</h3>
            </div>
          </div>
          <div className="admin-stack-list">
            {formState.sections.map((section, index) => (
              <article key={section.id} className="card admin-sort-item admin-governance-sort-item">
                <div>
                  <strong>{GOVERNANCE_SECTION_LABELS[section.id]}</strong>
                  <p className="muted">A pagina publica segue esta ordem para exibir os blocos institucionais.</p>
                </div>
                <label className="admin-check">
                  <input type="checkbox" checked={section.visible} onChange={(event) => updateSections((sections) => sections.map((item, currentIndex) => currentIndex === index ? { ...item, visible: event.target.checked } : item))} />
                  <span>Secao visivel</span>
                </label>
                <div className="admin-inline-actions">
                  <button type="button" className="icon-button" onClick={() => updateSections((sections) => moveItem(sections, index, 'up'))} disabled={index === 0} aria-label="Mover secao para cima"><ArrowUp size={16} /></button>
                  <button type="button" className="icon-button" onClick={() => updateSections((sections) => moveItem(sections, index, 'down'))} disabled={index === formState.sections.length - 1} aria-label="Mover secao para baixo"><ArrowDown size={16} /></button>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="card admin-subcard admin-governance-card">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Gestao atual</p>
              <h3 className="section-title">Membros da diretoria</h3>
            </div>
            <button type="button" className="button button-outline" onClick={() => {
              updateMembers((items) => [...items, createEmptyMember(items.length)]);
              setEditorStatus('Novo membro adicionado ao rascunho.', 'info');
            }}>
              <Plus size={16} />
              Adicionar membro
            </button>
          </div>

          <SectionCopyFields
            kicker={formState.currentBoardKicker}
            title={formState.currentBoardTitle}
            text={formState.currentBoardText}
            onKickerChange={(value) => updateField('currentBoardKicker', value)}
            onTitleChange={(value) => updateField('currentBoardTitle', value)}
            onTextChange={(value) => updateField('currentBoardText', value)}
          />

          <div className="admin-governance-list">
            {formState.members.map((member, index) => (
              <ItemShell
                key={member.id}
                title={member.name.trim() || 'Novo membro'}
                subtitle={member.role.trim() || 'Cargo nao informado'}
                visible={member.visible}
                onToggleVisible={() => updateMembers((items) => items.map((item, currentIndex) => currentIndex === index ? { ...item, visible: !item.visible } : item))}
                onMoveUp={() => updateMembers((items) => moveItem(items, index, 'up'))}
                onMoveDown={() => updateMembers((items) => moveItem(items, index, 'down'))}
                onRemove={() => updateMembers((items) => items.filter((_, currentIndex) => currentIndex !== index))}
                disableMoveUp={index === 0}
                disableMoveDown={index === formState.members.length - 1}
              >
                <div className="admin-governance-member-grid">
                  <div className="admin-governance-grid">
                    <label className="field">
                      <span className="field-label">Nome</span>
                      <input className="input" type="text" value={member.name} onChange={(event) => updateMembers((items) => items.map((item, currentIndex) => currentIndex === index ? { ...item, name: event.target.value } : item))} />
                    </label>
                    <label className="field">
                      <span className="field-label">Cargo</span>
                      <input className="input" type="text" value={member.role} onChange={(event) => updateMembers((items) => items.map((item, currentIndex) => currentIndex === index ? { ...item, role: event.target.value } : item))} />
                    </label>
                    <label className="field">
                      <span className="field-label">Rotulo de contato</span>
                      <input className="input" type="text" value={member.contactLabel} onChange={(event) => updateMembers((items) => items.map((item, currentIndex) => currentIndex === index ? { ...item, contactLabel: event.target.value } : item))} placeholder="@usuario ou email" />
                    </label>
                    <label className="field">
                      <span className="field-label">Link do contato</span>
                      <input className="input" type="text" value={member.contactHref} onChange={(event) => updateMembers((items) => items.map((item, currentIndex) => currentIndex === index ? { ...item, contactHref: event.target.value } : item))} placeholder="https://instagram.com/... ou mailto:" />
                    </label>
                    <label className="field field-full">
                      <span className="field-label">Mini bio / funcao</span>
                      <textarea className="input textarea admin-governance-textarea-short" value={member.bio} onChange={(event) => updateMembers((items) => items.map((item, currentIndex) => currentIndex === index ? { ...item, bio: event.target.value } : item))} />
                    </label>
                  </div>

                  <AdminImageUploadField
                    label="Foto do membro"
                    value={member.photoUrl}
                    onChange={(value) => updateMembers((items) => items.map((item, currentIndex) => currentIndex === index ? { ...item, photoUrl: value } : item))}
                    previewAlt={member.name || 'Foto do membro'}
                    helperText="Use retrato simples e limpo. A foto aparece nos cards da pagina publica."
                    fieldClassName="field field-full"
                    previewWrapperClassName="admin-image-upload-preview admin-governance-member-preview"
                    previewClassName="admin-image-upload-main admin-governance-member-image"
                    uploadOptions={MEMBER_IMAGE_UPLOAD_OPTIONS}
                    onUploadStatus={(message, tone) => setEditorStatus(tone === 'success' ? 'Foto do membro carregada no rascunho.' : message, tone ?? 'info')}
                  />
                </div>
              </ItemShell>
            ))}
          </div>
        </article>
        <div className="admin-governance-split">
          <article className="card admin-subcard admin-governance-card">
            <div className="admin-section-header">
              <div>
                <p className="kicker">Mandato atual</p>
                <h3 className="section-title">Informacoes da gestao vigente</h3>
              </div>
            </div>
            <SectionCopyFields
              kicker={formState.termKicker}
              title={formState.termTitle}
              text={formState.termText}
              onKickerChange={(value) => updateField('termKicker', value)}
              onTitleChange={(value) => updateField('termTitle', value)}
              onTextChange={(value) => updateField('termText', value)}
            />
            <div className="admin-governance-grid">
              <label className="field">
                <span className="field-label">Nome da gestao</span>
                <input className="input" type="text" value={formState.currentTerm.managementName} onChange={(event) => updateField('currentTerm', { ...formState.currentTerm, managementName: event.target.value })} />
              </label>
              <label className="field">
                <span className="field-label">Resumo do mandato</span>
                <input className="input" type="text" value={formState.currentTerm.mandateLabel} onChange={(event) => updateField('currentTerm', { ...formState.currentTerm, mandateLabel: event.target.value })} />
              </label>
              <label className="field">
                <span className="field-label">Data de inicio</span>
                <input className="input" type="date" value={formState.currentTerm.startDate} onChange={(event) => updateField('currentTerm', { ...formState.currentTerm, startDate: event.target.value })} />
              </label>
              <label className="field">
                <span className="field-label">Data de fim</span>
                <input className="input" type="date" value={formState.currentTerm.endDate} onChange={(event) => updateField('currentTerm', { ...formState.currentTerm, endDate: event.target.value })} />
              </label>
              <label className="field field-full">
                <span className="field-label">Observacoes</span>
                <textarea className="input textarea admin-governance-textarea-short" value={formState.currentTerm.notes} onChange={(event) => updateField('currentTerm', { ...formState.currentTerm, notes: event.target.value })} />
              </label>
            </div>
          </article>

          <article className="card admin-subcard admin-governance-card">
            <div className="admin-section-header">
              <div>
                <p className="kicker">Contato institucional</p>
                <h3 className="section-title">Canais formais da diretoria</h3>
              </div>
            </div>
            <SectionCopyFields
              kicker={formState.contactKicker}
              title={formState.contactTitle}
              text={formState.contactText}
              onKickerChange={(value) => updateField('contactKicker', value)}
              onTitleChange={(value) => updateField('contactTitle', value)}
              onTextChange={(value) => updateField('contactText', value)}
            />
            <div className="admin-governance-grid">
              <label className="field">
                <span className="field-label">E-mail institucional</span>
                <input className="input" type="email" value={formState.contact.email} onChange={(event) => updateField('contact', { ...formState.contact, email: event.target.value })} />
              </label>
              <label className="field">
                <span className="field-label">Instagram</span>
                <input className="input" type="text" value={formState.contact.instagram} onChange={(event) => updateField('contact', { ...formState.contact, instagram: event.target.value })} />
              </label>
              <label className="field">
                <span className="field-label">WhatsApp</span>
                <input className="input" type="text" value={formState.contact.whatsapp} onChange={(event) => updateField('contact', { ...formState.contact, whatsapp: event.target.value })} />
              </label>
              <label className="field field-full">
                <span className="field-label">Texto final</span>
                <textarea className="input textarea admin-governance-textarea-short" value={formState.contact.closingText} onChange={(event) => updateField('contact', { ...formState.contact, closingText: event.target.value })} />
              </label>
            </div>
          </article>
        </div>
        <article className="card admin-subcard admin-governance-card">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Cargos e funcoes</p>
              <h3 className="section-title">Lista de cargos da diretoria</h3>
            </div>
            <button type="button" className="button button-outline" onClick={() => {
              updateRoles((items) => [...items, createEmptyRole(items.length)]);
              setEditorStatus('Novo cargo adicionado ao rascunho.', 'info');
            }}>
              <Plus size={16} />
              Adicionar cargo
            </button>
          </div>

          <SectionCopyFields
            kicker={formState.rolesKicker}
            title={formState.rolesTitle}
            text={formState.rolesText}
            onKickerChange={(value) => updateField('rolesKicker', value)}
            onTitleChange={(value) => updateField('rolesTitle', value)}
            onTextChange={(value) => updateField('rolesText', value)}
          />

          <div className="admin-governance-list">
            {formState.roles.map((role, index) => (
              <ItemShell
                key={role.id}
                title={role.title.trim() || 'Novo cargo'}
                visible={role.visible}
                onToggleVisible={() => updateRoles((items) => items.map((item, currentIndex) => currentIndex === index ? { ...item, visible: !item.visible } : item))}
                onMoveUp={() => updateRoles((items) => moveItem(items, index, 'up'))}
                onMoveDown={() => updateRoles((items) => moveItem(items, index, 'down'))}
                onRemove={() => updateRoles((items) => items.filter((_, currentIndex) => currentIndex !== index))}
                disableMoveUp={index === 0}
                disableMoveDown={index === formState.roles.length - 1}
              >
                <div className="admin-governance-grid">
                  <label className="field">
                    <span className="field-label">Nome do cargo</span>
                    <input className="input" type="text" value={role.title} onChange={(event) => updateRoles((items) => items.map((item, currentIndex) => currentIndex === index ? { ...item, title: event.target.value } : item))} />
                  </label>
                  <label className="field field-full">
                    <span className="field-label">Descricao da funcao</span>
                    <textarea className="input textarea admin-governance-textarea-short" value={role.description} onChange={(event) => updateRoles((items) => items.map((item, currentIndex) => currentIndex === index ? { ...item, description: event.target.value } : item))} />
                  </label>
                </div>
              </ItemShell>
            ))}
          </div>
        </article>
        <article className="card admin-subcard admin-governance-card">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Compromissos de transparencia</p>
              <h3 className="section-title">Texto institucional e pilares de conduta</h3>
            </div>
            <button type="button" className="button button-outline" onClick={() => {
              updateCommitments((items) => [...items, createEmptyCommitment(items.length)]);
              setEditorStatus('Novo compromisso adicionado ao rascunho.', 'info');
            }}>
              <Plus size={16} />
              Adicionar compromisso
            </button>
          </div>

          <SectionCopyFields
            kicker={formState.commitmentsKicker}
            title={formState.commitmentsTitle}
            text={formState.commitmentsText}
            onKickerChange={(value) => updateField('commitmentsKicker', value)}
            onTitleChange={(value) => updateField('commitmentsTitle', value)}
            onTextChange={(value) => updateField('commitmentsText', value)}
          />

          <div className="admin-governance-list">
            {formState.commitments.map((item, index) => (
              <ItemShell
                key={item.id}
                title={item.title.trim() || 'Novo compromisso'}
                visible={item.visible}
                onToggleVisible={() => updateCommitments((items) => items.map((current, currentIndex) => currentIndex === index ? { ...current, visible: !current.visible } : current))}
                onMoveUp={() => updateCommitments((items) => moveItem(items, index, 'up'))}
                onMoveDown={() => updateCommitments((items) => moveItem(items, index, 'down'))}
                onRemove={() => updateCommitments((items) => items.filter((_, currentIndex) => currentIndex !== index))}
                disableMoveUp={index === 0}
                disableMoveDown={index === formState.commitments.length - 1}
              >
                <div className="admin-governance-grid">
                  <label className="field">
                    <span className="field-label">Titulo</span>
                    <input className="input" type="text" value={item.title} onChange={(event) => updateCommitments((items) => items.map((current, currentIndex) => currentIndex === index ? { ...current, title: event.target.value } : current))} />
                  </label>
                  <label className="field field-full">
                    <span className="field-label">Descricao</span>
                    <textarea className="input textarea admin-governance-textarea-short" value={item.description} onChange={(event) => updateCommitments((items) => items.map((current, currentIndex) => currentIndex === index ? { ...current, description: event.target.value } : current))} />
                  </label>
                </div>
              </ItemShell>
            ))}
          </div>
        </article>
        <article className="card admin-subcard admin-governance-card">
          <div className="admin-section-header">
            <div>
              <p className="kicker">Documentos e informacoes uteis</p>
              <h3 className="section-title">Arquivos, editais, atas e registros</h3>
            </div>
            <button type="button" className="button button-outline" onClick={() => {
              updateDocuments((items) => [...items, createEmptyDocument(items.length)]);
              setEditorStatus('Novo documento adicionado ao rascunho.', 'info');
            }}>
              <Plus size={16} />
              Adicionar documento
            </button>
          </div>

          <SectionCopyFields
            kicker={formState.documentsKicker}
            title={formState.documentsTitle}
            text={formState.documentsText}
            onKickerChange={(value) => updateField('documentsKicker', value)}
            onTitleChange={(value) => updateField('documentsTitle', value)}
            onTextChange={(value) => updateField('documentsText', value)}
          />

          <div className="admin-governance-list">
            {formState.documents.map((document, index) => {
              const uploadInputId = `governance-document-upload-${document.id}`;
              const isUploading = uploadingDocumentId === document.id;

              return (
                <ItemShell
                  key={document.id}
                  title={document.title.trim() || 'Novo documento'}
                  subtitle={document.category.trim() || 'Sem categoria'}
                  visible={document.visible}
                  onToggleVisible={() => updateDocuments((items) => items.map((current, currentIndex) => currentIndex === index ? { ...current, visible: !current.visible } : current))}
                  onMoveUp={() => updateDocuments((items) => moveItem(items, index, 'up'))}
                  onMoveDown={() => updateDocuments((items) => moveItem(items, index, 'down'))}
                  onRemove={() => updateDocuments((items) => items.filter((_, currentIndex) => currentIndex !== index))}
                  disableMoveUp={index === 0}
                  disableMoveDown={index === formState.documents.length - 1}
                >
                  <div className="admin-governance-grid">
                    <label className="field">
                      <span className="field-label">Titulo</span>
                      <input className="input" type="text" value={document.title} onChange={(event) => updateDocuments((items) => items.map((current, currentIndex) => currentIndex === index ? { ...current, title: event.target.value } : current))} />
                    </label>
                    <label className="field">
                      <span className="field-label">Categoria</span>
                      <input className="input" type="text" value={document.category} onChange={(event) => updateDocuments((items) => items.map((current, currentIndex) => currentIndex === index ? { ...current, category: event.target.value } : current))} placeholder="Estatuto, edital, ata..." />
                    </label>
                    <label className="field">
                      <span className="field-label">Data</span>
                      <input className="input" type="date" value={document.date} onChange={(event) => updateDocuments((items) => items.map((current, currentIndex) => currentIndex === index ? { ...current, date: event.target.value } : current))} />
                    </label>
                    <label className="field">
                      <span className="field-label">Nome do arquivo</span>
                      <input className="input" type="text" value={document.fileName} onChange={(event) => updateDocuments((items) => items.map((current, currentIndex) => currentIndex === index ? { ...current, fileName: event.target.value } : current))} placeholder="Opcional para links externos" />
                    </label>
                    <label className="field field-full">
                      <span className="field-label">Descricao curta</span>
                      <textarea className="input textarea admin-governance-textarea-short" value={document.description} onChange={(event) => updateDocuments((items) => items.map((current, currentIndex) => currentIndex === index ? { ...current, description: event.target.value } : current))} />
                    </label>
                    <label className="field field-full">
                      <span className="field-label">Link ou arquivo</span>
                      <input className="input" type="text" value={document.href} onChange={(event) => updateDocuments((items) => items.map((current, currentIndex) => currentIndex === index ? { ...current, href: event.target.value } : current))} placeholder="Cole um link externo ou envie um arquivo local" />
                    </label>
                  </div>

                  <div className="admin-governance-upload-row">
                    <label htmlFor={uploadInputId} className="button button-outline admin-upload-button">
                      <Upload size={16} />
                      {isUploading ? 'Enviando...' : 'Enviar arquivo'}
                    </label>
                    <input id={uploadInputId} className="sr-only" type="file" onChange={(event) => void handleDocumentUpload(document.id, event)} disabled={isUploading} />
                    <p className="muted">Arquivos locais pequenos podem ser anexados. Para PDFs maiores, prefira usar link externo.</p>
                  </div>
                </ItemShell>
              );
            })}
          </div>
        </article>

        <div className="admin-drawer-actions admin-governance-actions">
          <button type="submit" className="button" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar alteracoes'}</button>
          <button type="button" className="button button-outline" onClick={() => void handleReset()} disabled={isSaving}>Restaurar padrao</button>
        </div>
      </form>
    </section>
  );
}
