import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  PencilLine,
  Plus,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import AdminImageUploadField from '../../components/admin/AdminImageUploadField';
import {
  useAdminEditorPersistence,
  type AdminEditorStatus,
  type AdminEditorStatusTone,
} from '../../components/admin/useAdminEditorPersistence';
import { ADMIN_DRAFT_STORAGE_KEYS } from '../../lib/adminPreview';
import {
  buildEventImportPreview,
  downloadEventImportTemplate,
  extractDraftsFromImportPreview,
  getEventImportAcceptedColumns,
} from '../../lib/eventSpreadsheet';
import { useEvents } from '../../lib/EventsContext';
import {
  EVENT_ACTION_TYPE_LABELS,
  EVENT_PAGE_SECTION_LABELS,
  cloneEventCategories,
  cloneEventsPageContent,
  createEmptyEventDraft,
  createEventFromDraft,
  defaultEventsConfig,
  formatEventDateLabel,
  formatEventMonthLabel,
  formatEventTimeRange,
  getEventActionConfig,
  getEventActionLabel,
  getEventCategoryLabel,
  getEventStatusKey,
  getEventStatusLabel,
  mergeEventsPageContent,
  normalizeEventCategoryId,
} from '../../lib/events';
import { formatCurrency } from '../../lib/formatCurrency';
import type {
  EventActionType,
  EventCategoryDefinition,
  EventDraft,
  EventImportPreview,
  EventPageSectionConfig,
  EventRecord,
  EventsPageContent,
} from '../../types/events';

const EVENT_IMAGE_UPLOAD_OPTIONS = {
  maxWidth: 1600,
  maxHeight: 1200,
  quality: 0.9,
};

const EVENTS_BANNER_UPLOAD_OPTIONS = {
  maxWidth: 1800,
  maxHeight: 1400,
  quality: 0.9,
};

const IMPORT_ACCEPT =
  '.xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv';
const CATEGORY_DRAFT_PREFIX = 'draft-category-';

type VisibilityFilter = 'all' | 'visible' | 'hidden';
type EventsTab = 'events' | 'categories' | 'import';

function createEventDraftFromRecord(event: EventRecord): EventDraft {
  return {
    title: event.title,
    shortDescription: event.shortDescription,
    fullDescription: event.fullDescription,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    categoryId: event.categoryId,
    imageUrl: event.imageUrl,
    externalUrl: event.externalUrl,
    actionType: event.actionType,
    actionLabel: event.actionLabel,
    actionUrl: event.actionUrl,
    ticketPrice: event.ticketPrice,
    ticketEnabled: event.ticketEnabled,
    soldOut: event.soldOut,
    externalTicketProvider: event.externalTicketProvider,
    featured: event.featured,
    visible: event.visible,
  };
}

function isValidUrl(value: string) {
  if (!value.trim()) {
    return true;
  }

  if (value.startsWith('/')) {
    return true;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

function buildMonthFilterOptions(events: EventRecord[]) {
  const seenValues = new Set<string>();

  return events.reduce<Array<{ value: string; label: string }>>((accumulator, event) => {
    const value = event.date.slice(0, 7);

    if (!value || seenValues.has(value)) {
      return accumulator;
    }

    seenValues.add(value);
    const [year, month] = value.split('-').map(Number);
    accumulator.push({
      value,
      label: formatEventMonthLabel(new Date(year || 0, (month || 1) - 1, 1)),
    });

    return accumulator;
  }, []);
}

function cloneCategoryDrafts(source: EventCategoryDefinition[]) {
  return source.map((category) => ({ ...category }));
}

function createCategoryDraft(index: number): EventCategoryDefinition {
  return {
    id: `${CATEGORY_DRAFT_PREFIX}${Date.now()}-${index + 1}`,
    label: '',
    visible: true,
  };
}

function createStatus(message: string, tone: AdminEditorStatusTone = 'info'): AdminEditorStatus {
  return {
    tone,
    message,
  };
}

function parseTicketPriceValue(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue.replace(',', '.'));
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function normalizeCategoryDrafts(categories: EventCategoryDefinition[]) {
  const seenIds = new Set<string>();
  const seenLabels = new Set<string>();
  const preparedCategories: EventCategoryDefinition[] = [];
  const idMap = new Map<string, string>();
  const errors: string[] = [];

  categories.forEach((category, index) => {
    const label = category.label.trim();

    if (!label) {
      errors.push(`Categoria ${index + 1}: informe um nome para salvar.`);
      return;
    }

    const normalizedLabel = label.toLowerCase();
    if (seenLabels.has(normalizedLabel)) {
      errors.push(`A categoria "${label}" esta repetida.`);
      return;
    }

    const nextId =
      category.id.startsWith(CATEGORY_DRAFT_PREFIX) || !category.id.trim()
        ? normalizeEventCategoryId(label || `categoria-${index + 1}`)
        : category.id;

    if (seenIds.has(nextId)) {
      errors.push(`A categoria "${label}" gera um identificador duplicado.`);
      return;
    }

    seenLabels.add(normalizedLabel);
    seenIds.add(nextId);
    idMap.set(category.id, nextId);
    preparedCategories.push({
      id: nextId,
      label,
      visible: category.visible,
    });
  });

  if (!preparedCategories.length) {
    errors.push('Mantenha pelo menos uma categoria cadastrada.');
  }

  return {
    preparedCategories,
    idMap,
    errors,
  };
}

export default function AdminEventsPage() {
  const {
    config,
    events,
    categories,
    pageContent,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventFeatured,
    toggleEventVisible,
    saveConfig,
    saveCategories,
    savePageContent,
  } = useEvents();

  const [selectedEventId, setSelectedEventId] = useState<string | null>(events[0]?.id || null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEventSaving, setIsEventSaving] = useState(false);
  const [eventStatus, setEventStatus] = useState<AdminEditorStatus | null>(null);
  const [importStatus, setImportStatus] = useState<AdminEditorStatus | null>(null);
  const [categoryStatus, setCategoryStatus] = useState<AdminEditorStatus | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportReading, setIsImportReading] = useState(false);
  const [isImportSaving, setIsImportSaving] = useState(false);
  const [importPreview, setImportPreview] = useState<EventImportPreview | null>(null);
  const [categoryFormState, setCategoryFormState] = useState<EventCategoryDefinition[]>(
    cloneEventCategories(categories)
  );
  const [activeTab, setActiveTab] = useState<EventsTab>('events');

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? null,
    [events, selectedEventId]
  );

  const selectedEventSnapshot = useMemo(
    () =>
      selectedEvent
        ? createEventDraftFromRecord(selectedEvent)
        : createEmptyEventDraft(categories),
    [categories, selectedEvent]
  );
  const [eventFormState, setEventFormState] = useState<EventDraft>(selectedEventSnapshot);

  useEffect(() => {
    setEventFormState(selectedEventSnapshot);
  }, [selectedEvent?.id, selectedEvent?.updatedAt, selectedEventSnapshot]);

  useEffect(() => {
    setCategoryFormState(cloneEventCategories(categories));
  }, [categories]);

  useEffect(() => {
    if (!events.length && !isEditorOpen) {
      setSelectedEventId(null);
      return;
    }

    if (!selectedEventId) {
      return;
    }

    const stillExists = events.some((event) => event.id === selectedEventId);
    if (!stillExists) {
      setSelectedEventId(events[0]?.id || null);
    }
  }, [events, isEditorOpen, selectedEventId]);

  useEffect(() => {
    if (!isEditorOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsEditorOpen(false);
      }
    }

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isEditorOpen]);

  const {
    formState: pageFormState,
    setFormState: setPageFormState,
    isDirty: isPageDirty,
    isSaving: isPageSaving,
    status: pageStatus,
    handleSave: handleSavePageContent,
    handleReset: handleResetPageContent,
    setEditorStatus: setPageEditorStatus,
  } = useAdminEditorPersistence<EventsPageContent>({
    draftStorageKey: ADMIN_DRAFT_STORAGE_KEYS.events,
    sourceValue: pageContent,
    sanitizeDraft: (candidate) =>
      cloneEventsPageContent(mergeEventsPageContent(candidate as Partial<EventsPageContent>)),
    onSave: savePageContent,
    onReset: () => savePageContent(defaultEventsConfig.page),
    saveSuccessMessage: 'Pagina publica de eventos salva e publicada.',
    resetSuccessMessage: 'Textos e banner da pagina de eventos restaurados para o padrao.',
  });

  const monthOptions = useMemo(() => buildMonthFilterOptions(events), [events]);
  const acceptedColumns = useMemo(() => getEventImportAcceptedColumns(), []);

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return events.filter((event) => {
      if (selectedCategoryFilter !== 'all' && event.categoryId !== selectedCategoryFilter) {
        return false;
      }

      if (visibilityFilter === 'visible' && !event.visible) {
        return false;
      }

      if (visibilityFilter === 'hidden' && event.visible) {
        return false;
      }

      if (monthFilter !== 'all' && !event.date.startsWith(monthFilter)) {
        return false;
      }

      if (
        normalizedSearch &&
        ![event.title, event.shortDescription, event.location, event.categoryId]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      ) {
        return false;
      }

      return true;
    });
  }, [events, monthFilter, searchTerm, selectedCategoryFilter, visibilityFilter]);

  const eventSummary = useMemo(() => {
    const published = events.filter((event) => event.visible).length;
    const featured = events.filter((event) => event.featured && event.visible).length;
    const withAction = events.filter((event) => {
      const action = getEventActionConfig(event);
      return event.ticketEnabled && action.canRender;
    }).length;

    return {
      total: events.length,
      published,
      featured,
      withAction,
    };
  }, [events]);
  const isEventDirty =
    JSON.stringify(eventFormState) !== JSON.stringify(selectedEventSnapshot);
  const isCategoryDirty =
    JSON.stringify(categoryFormState) !== JSON.stringify(categories);
  const currentCategoryLabel = getEventCategoryLabel(eventFormState.categoryId, categories);
  const liveEventAction = getEventActionConfig(eventFormState);
  const liveEventStatusKey = getEventStatusKey(eventFormState);
  const liveEventStatusLabel = getEventStatusLabel(eventFormState);
  const liveEventActionLabel = getEventActionLabel(eventFormState);

  function updateEventField<K extends keyof EventDraft>(field: K, value: EventDraft[K]) {
    setEventFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openNewEventEditor() {
    setSelectedEventId(null);
    setEventFormState(createEmptyEventDraft(categories));
    setEventStatus(null);
    setIsEditorOpen(true);
  }

  function openExistingEventEditor(event: EventRecord) {
    setSelectedEventId(event.id);
    setEventFormState(createEventDraftFromRecord(event));
    setEventStatus(null);
    setIsEditorOpen(true);
  }

  function closeEventEditor() {
    setIsEditorOpen(false);
    setEventStatus(null);
  }

  function validateEventDraft(draft: EventDraft) {
    const errors: string[] = [];

    if (!draft.title.trim()) {
      errors.push('O titulo do evento e obrigatorio.');
    }

    if (!draft.date.trim()) {
      errors.push('A data do evento e obrigatoria.');
    }

    if (!draft.startTime.trim()) {
      errors.push('A hora de inicio e obrigatoria.');
    }

    if (!categories.some((category) => category.id === draft.categoryId)) {
      errors.push('Selecione uma categoria valida para o evento.');
    }

    if (!isValidUrl(draft.externalUrl)) {
      errors.push('O link externo precisa ser uma URL http(s) valida ou um caminho interno.');
    }

    if (!isValidUrl(draft.actionUrl)) {
      errors.push('O link da acao principal precisa ser uma URL http(s) valida ou um caminho interno.');
    }

    if (draft.ticketPrice !== null && draft.ticketPrice < 0) {
      errors.push('O preco do ingresso nao pode ser negativo.');
    }

    return errors;
  }

  async function persistEventDraft() {
    const validationErrors = validateEventDraft(eventFormState);
    if (validationErrors.length) {
      setEventStatus(createStatus(validationErrors.join(' '), 'error'));
      return false;
    }

    setIsEventSaving(true);
    setEventStatus(createStatus('Salvando alteracoes do evento...', 'info'));

    await new Promise<void>((resolve) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      window.requestAnimationFrame(() => resolve());
    });

    if (!selectedEvent) {
      const createdEvent = createEvent(eventFormState);
      setSelectedEventId(createdEvent.id);
      setEventStatus(
        createStatus(`Evento "${createdEvent.title}" criado com sucesso.`, 'success')
      );
      setIsEventSaving(false);
      return true;
    }

    updateEvent(selectedEvent.id, eventFormState);
    setEventStatus(
      createStatus(`Evento "${eventFormState.title}" atualizado com sucesso.`, 'success')
    );
    setIsEventSaving(false);
    return true;
  }

  async function handleSaveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const saved = await persistEventDraft();
      if (saved) {
        setIsEditorOpen(false);
      }
    } finally {
      setIsEventSaving(false);
    }
  }

  function handleDeleteEvent(targetEvent: EventRecord | null = selectedEvent) {
    if (!targetEvent) {
      return;
    }

    const confirmed = window.confirm(
      `Deseja excluir o evento "${targetEvent.title}" da agenda?`
    );

    if (!confirmed) {
      return;
    }

    const remainingEvents = events.filter((event) => event.id !== targetEvent.id);
    deleteEvent(targetEvent.id);

    if (selectedEventId === targetEvent.id) {
      setSelectedEventId(remainingEvents[0]?.id || null);
    }

    setIsEditorOpen(false);
    setEventStatus(createStatus(`Evento "${targetEvent.title}" removido.`, 'success'));
  }

  function handleToggleEventVisible(targetEvent: EventRecord) {
    toggleEventVisible(targetEvent.id);

    if (selectedEventId === targetEvent.id) {
      setEventFormState((current) => ({
        ...current,
        visible: !targetEvent.visible,
      }));
    }

    setEventStatus(
      createStatus(
        targetEvent.visible
          ? `Evento "${targetEvent.title}" ocultado da pagina publica.`
          : `Evento "${targetEvent.title}" publicado novamente.`,
        'success'
      )
    );
  }

  function handleToggleEventFeatured(targetEvent: EventRecord) {
    toggleEventFeatured(targetEvent.id);

    if (selectedEventId === targetEvent.id) {
      setEventFormState((current) => ({
        ...current,
        featured: !targetEvent.featured,
      }));
    }

    setEventStatus(
      createStatus(
        targetEvent.featured
          ? `Evento "${targetEvent.title}" deixou de ser destaque.`
          : `Evento "${targetEvent.title}" agora aparece em destaque.`,
        'success'
      )
    );
  }

  function updateCategory(index: number, patch: Partial<EventCategoryDefinition>) {
    setCategoryFormState((current) =>
      current.map((category, currentIndex) =>
        currentIndex === index ? { ...category, ...patch } : category
      )
    );
  }

  function addCategory() {
    setCategoryFormState((current) => [...current, createCategoryDraft(current.length)]);
    setCategoryStatus(createStatus('Nova categoria adicionada ao rascunho.', 'info'));
  }

  function removeCategory(index: number) {
    const targetCategory = categoryFormState[index];

    if (!targetCategory) {
      return;
    }

    const categoryInUse = events.some((event) => event.categoryId === targetCategory.id);
    if (categoryInUse) {
      setCategoryStatus(
        createStatus(
          `A categoria "${targetCategory.label || 'sem nome'}" esta em uso por eventos ja salvos.`,
          'error'
        )
      );
      return;
    }

    if (categoryFormState.length <= 1) {
      setCategoryStatus(createStatus('Mantenha pelo menos uma categoria cadastrada.', 'error'));
      return;
    }

    setCategoryFormState((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setCategoryStatus(createStatus('Categoria removida do rascunho atual.', 'info'));
  }

  function syncDraftCategoryId(
    idMap: Map<string, string>,
    nextCategories: EventCategoryDefinition[]
  ) {
    setEventFormState((current) => {
      const mappedCategoryId = idMap.get(current.categoryId) ?? current.categoryId;
      const safeCategoryId = nextCategories.some((category) => category.id === mappedCategoryId)
        ? mappedCategoryId
        : (nextCategories[0]?.id ?? current.categoryId);

      return {
        ...current,
        categoryId: safeCategoryId,
      };
    });
  }

  function handleSaveCategories() {
    const { preparedCategories, idMap, errors } = normalizeCategoryDrafts(categoryFormState);

    if (errors.length) {
      setCategoryStatus(createStatus(errors.join(' '), 'error'));
      return;
    }

    const persistedCategories = saveCategories(preparedCategories);
    setCategoryFormState(cloneCategoryDrafts(persistedCategories));
    syncDraftCategoryId(idMap, persistedCategories);
    setCategoryStatus(createStatus('Categorias salvas e aplicadas aos filtros.', 'success'));
  }

  function handleResetCategories() {
    setCategoryFormState(cloneCategoryDrafts(categories));
    setCategoryStatus(createStatus('Categorias restauradas para o ultimo estado salvo.', 'info'));
  }

  function updatePageField<K extends Exclude<keyof EventsPageContent, 'sections'>>(
    field: K,
    value: EventsPageContent[K]
  ) {
    setPageFormState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function movePageSection(index: number, direction: 'up' | 'down') {
    setPageFormState((current) => {
      const nextIndex = direction === 'up' ? index - 1 : index + 1;

      if (nextIndex < 0 || nextIndex >= current.sections.length) {
        return current;
      }

      const sections = [...current.sections];
      const [movedSection] = sections.splice(index, 1);
      sections.splice(nextIndex, 0, movedSection);

      return {
        ...current,
        sections,
      };
    });
  }

  function updatePageSection(index: number, patch: Partial<EventPageSectionConfig>) {
    setPageFormState((current) => ({
      ...current,
      sections: current.sections.map((section, currentIndex) =>
        currentIndex === index ? { ...section, ...patch } : section
      ),
    }));
  }

  function handlePageFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void handleSavePageContent();
  }

  async function handleSpreadsheetChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setIsImportReading(true);
    setImportStatus(createStatus('Lendo planilha e validando linhas...', 'info'));

    try {
      const preview = await buildEventImportPreview(file, categoryFormState);
      setImportPreview(preview);

      if (!preview.acceptedRows.length) {
        setImportStatus(
          createStatus('A planilha foi lida, mas nao ha linhas preenchidas para importar.', 'error')
        );
        return;
      }

      if (preview.invalidRows.length) {
        setImportStatus(
          createStatus(
            `${preview.validRows.length} linha(s) prontas para importacao e ${preview.invalidRows.length} linha(s) com erro.`,
            'info'
          )
        );
        return;
      }

      setImportStatus(
        createStatus(
          `${preview.validRows.length} linha(s) validadas e prontas para confirmar.`,
          'success'
        )
      );
    } catch (error) {
      setImportPreview(null);
      setImportStatus(
        createStatus(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel ler a planilha enviada.',
          'error'
        )
      );
    } finally {
      setIsImportReading(false);
    }
  }

  async function handleConfirmImport() {
    if (!importPreview || !importPreview.validRows.length) {
      setImportStatus(createStatus('Nenhuma linha valida pronta para importar.', 'error'));
      return;
    }

    setIsImportSaving(true);
    setImportStatus(createStatus('Salvando eventos importados...', 'info'));

    try {
      const nextCategoryDrafts = cloneCategoryDrafts(categoryFormState);

      importPreview.categoriesToCreate.forEach((category) => {
        const alreadyExists = nextCategoryDrafts.some(
          (currentCategory) =>
            currentCategory.id === category.id ||
            currentCategory.label.trim().toLowerCase() === category.label.trim().toLowerCase()
        );

        if (!alreadyExists) {
          nextCategoryDrafts.push({ ...category });
        }
      });

      const { preparedCategories, idMap, errors } = normalizeCategoryDrafts(nextCategoryDrafts);
      if (errors.length) {
        setImportStatus(createStatus(errors.join(' '), 'error'));
        return;
      }

      const importedDrafts = extractDraftsFromImportPreview(importPreview).map((draft) => ({
        ...draft,
        categoryId: idMap.get(draft.categoryId) ?? draft.categoryId,
      }));

      const importedEvents = importedDrafts.reduce<EventRecord[]>((accumulator, draft) => {
        const createdEvent = createEventFromDraft(
          draft,
          [...events, ...accumulator],
          preparedCategories
        );
        accumulator.push(createdEvent);
        return accumulator;
      }, []);

      const persistedConfig = saveConfig({
        ...config,
        categories: preparedCategories,
        events: [...events, ...importedEvents],
      });

      setCategoryFormState(cloneCategoryDrafts(persistedConfig.categories));
      syncDraftCategoryId(idMap, persistedConfig.categories);
      setImportPreview(null);
      setSelectedEventId(importedEvents[0]?.id ?? selectedEventId);
      setImportStatus(
        createStatus(
          `${importedEvents.length} evento(s) importado(s) e publicados no sistema.`,
          'success'
        )
      );
      setCategoryStatus(
        createStatus('Categorias sincronizadas junto com a importacao da planilha.', 'success')
      );
    } catch (error) {
      setImportStatus(
        createStatus(
          error instanceof Error
            ? error.message
            : 'Nao foi possivel concluir a importacao.',
          'error'
        )
      );
    } finally {
      setIsImportSaving(false);
    }
  }

  return (
    <>
      <section className="admin-page-grid">
        <article className="card admin-page-intro admin-products-page-head">
          <div className="admin-products-page-summary">
            <p className="kicker">Eventos</p>
            <h2 className="section-title">Gerenciar Eventos</h2>
            <p className="muted">
              Cadastre, edite e acompanhe a agenda com uma operacao mais direta e compacta.
            </p>
          </div>

          <div className="admin-products-page-actions admin-events-page-actions">
            <span className="pill pill-accent">{eventSummary.total} cadastrados</span>
            <span className="pill">{eventSummary.published} visiveis</span>
            <span className="pill">{eventSummary.featured} em destaque</span>
            <span className="pill">{eventSummary.withAction} com acao ativa</span>
            <button type="button" className="button" onClick={openNewEventEditor}>
              <Plus size={16} />
              Novo evento
            </button>
          </div>
        </article>

        {eventStatus && !isEditorOpen && (
          <div className={`status-banner status-banner-${eventStatus.tone}`}>
            {eventStatus.message}
          </div>
        )}

        <article className="card admin-products-shell admin-events-shell">
          <div className="admin-products-tabs" role="tablist" aria-label="Secoes de eventos">
            <button
              type="button"
              role="tab"
              className={
                activeTab === 'events'
                  ? 'admin-products-tab admin-products-tab-active'
                  : 'admin-products-tab'
              }
              aria-selected={activeTab === 'events'}
              onClick={() => setActiveTab('events')}
            >
              Eventos
            </button>
            <button
              type="button"
              role="tab"
              className={
                activeTab === 'categories'
                  ? 'admin-products-tab admin-products-tab-active'
                  : 'admin-products-tab'
              }
              aria-selected={activeTab === 'categories'}
              onClick={() => setActiveTab('categories')}
            >
              Categorias
              {isCategoryDirty && (
                <span className="admin-tab-dirty-dot" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              role="tab"
              className={
                activeTab === 'import'
                  ? 'admin-products-tab admin-products-tab-active'
                  : 'admin-products-tab'
              }
              aria-selected={activeTab === 'import'}
              onClick={() => setActiveTab('import')}
            >
              Importacao
              {importPreview && (
                <span className="admin-tab-dirty-dot" aria-hidden="true" />
              )}
            </button>
          </div>

          {activeTab === 'events' && (
            <>
              <header className="admin-products-header">
                <div className="admin-products-filters admin-events-filters">
                  <label className="field">
                    <span className="field-label">Buscar evento</span>
                    <input
                      className="input"
                      type="search"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Nome, local ou descricao"
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Categoria</span>
                    <select
                      className="input"
                      value={selectedCategoryFilter}
                      onChange={(event) => setSelectedCategoryFilter(event.target.value)}
                    >
                      <option value="all">Todas</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">Visibilidade</span>
                    <select
                      className="input"
                      value={visibilityFilter}
                      onChange={(event) =>
                        setVisibilityFilter(event.target.value as VisibilityFilter)
                      }
                    >
                      <option value="all">Todos</option>
                      <option value="visible">Visiveis</option>
                      <option value="hidden">Ocultos</option>
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">Mes</span>
                    <select
                      className="input"
                      value={monthFilter}
                      onChange={(event) => setMonthFilter(event.target.value)}
                    >
                      <option value="all">Todos os meses</option>
                      {monthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="button-row admin-products-header-actions">
                  <button type="button" className="button" onClick={openNewEventEditor}>
                    <Plus size={16} />
                    Novo evento
                  </button>
                </div>
              </header>

              <div className="admin-table-wrap admin-products-table-wrap admin-events-table-wrap">
                <table className="admin-table admin-products-table admin-events-table">
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Evento</th>
                      <th>Data</th>
                      <th>Hora</th>
                      <th>Local</th>
                      <th>Categoria</th>
                      <th>Status</th>
                      <th className="admin-events-actions-col">Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.length === 0 && (
                      <tr>
                        <td colSpan={8}>
                          <div className="admin-empty-state admin-table-empty">
                            <h3 className="section-title">Nenhum evento encontrado.</h3>
                            <p className="muted">
                              Ajuste os filtros atuais ou cadastre um novo evento.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}

                    {filteredEvents.map((event) => {
                      const categoryLabel = getEventCategoryLabel(event.categoryId, categories);
                      const eventStatusKey = getEventStatusKey(event);
                      const eventStatusLabel = getEventStatusLabel(event);
                      const eventAction = getEventActionConfig(event);
                      const hasTicketAction = event.ticketEnabled && eventAction.canRender;

                      return (
                        <tr key={event.id}>
                          <td>
                            <div className="admin-event-table-photo">
                              {event.imageUrl ? (
                                <img
                                  src={event.imageUrl}
                                  alt={event.title}
                                  className="admin-event-table-thumb"
                                />
                              ) : (
                                <div className="admin-event-thumb-placeholder admin-event-table-thumb-placeholder">
                                  <CalendarDays size={16} />
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="admin-event-table-main">
                              <strong>{event.title}</strong>
                              {event.shortDescription ? (
                                <span>{event.shortDescription}</span>
                              ) : null}
                            </div>
                          </td>
                          <td className="admin-events-col-compact">
                            {formatEventDateLabel(event.date)}
                          </td>
                          <td className="admin-events-col-compact">
                            {formatEventTimeRange(event)}
                          </td>
                          <td>
                            <div className="admin-event-table-meta">
                              <span>{event.location || '-'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="pill admin-events-pill-category">
                              {categoryLabel}
                            </span>
                          </td>
                          <td>
                            <div className="admin-event-table-status">
                              <span
                                className={`pill event-status-pill event-status-pill-${eventStatusKey}`}
                              >
                                {eventStatusLabel}
                              </span>
                              <span
                                className={
                                  event.visible
                                    ? 'pill admin-events-pill-visible'
                                    : 'pill admin-events-pill-hidden'
                                }
                              >
                                {event.visible ? 'Visivel' : 'Oculto'}
                              </span>
                              {event.featured ? (
                                <span className="pill event-status-pill-featured">Destaque</span>
                              ) : null}
                              {hasTicketAction ? (
                                <span className="pill">Ingresso ativo</span>
                              ) : null}
                              {event.ticketEnabled ? (
                                <span className="pill">
                                  {typeof event.ticketPrice === 'number' &&
                                  event.ticketPrice > 0
                                    ? 'Pago'
                                    : 'Gratuito'}
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="admin-events-actions-col">
                            <div className="admin-event-row-actions">
                              <button
                                type="button"
                                className="icon-button admin-product-action-button admin-product-action-button-edit"
                                onClick={() => openExistingEventEditor(event)}
                                aria-label={`Editar ${event.title}`}
                                title="Editar evento"
                              >
                                <PencilLine size={16} />
                              </button>
                              <a
                                href={`/eventos/${event.id}`}
                                className="icon-button admin-product-action-button"
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Abrir ${event.title} na pagina publica`}
                                title="Abrir pagina publica"
                              >
                                <ExternalLink size={16} />
                              </a>
                              <button
                                type="button"
                                className={
                                  event.featured
                                    ? 'icon-button admin-product-action-button admin-event-action-button-active'
                                    : 'icon-button admin-product-action-button'
                                }
                                onClick={() => handleToggleEventFeatured(event)}
                                aria-label={
                                  event.featured ? 'Remover destaque' : 'Marcar destaque'
                                }
                                title={event.featured ? 'Remover destaque' : 'Marcar destaque'}
                              >
                                <Star size={16} />
                              </button>
                              <button
                                type="button"
                                className={
                                  event.visible
                                    ? 'icon-button admin-product-action-button admin-event-action-button-active'
                                    : 'icon-button admin-product-action-button'
                                }
                                onClick={() => handleToggleEventVisible(event)}
                                aria-label={
                                  event.visible ? 'Ocultar evento' : 'Publicar evento'
                                }
                                title={event.visible ? 'Ocultar evento' : 'Publicar evento'}
                              >
                                {event.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                              </button>
                              <button
                                type="button"
                                className="icon-button admin-product-action-button admin-product-action-button-danger"
                                onClick={() => handleDeleteEvent(event)}
                                aria-label={`Excluir ${event.title}`}
                                title="Excluir evento"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'categories' && (
            <div className="admin-events-tab-panel">
              <div className="page-header page-header-stack">
                <div>
                  <p className="kicker">Categorias</p>
                  <h3 className="section-title">Tipos de evento usados no calendario.</h3>
                  <p className="muted">
                    Estas categorias alimentam os filtros publicos e a importacao por planilha.
                  </p>
                </div>
              </div>

              {categoryStatus && (
                <div className={`status-banner status-banner-${categoryStatus.tone}`}>
                  {categoryStatus.message}
                </div>
              )}

              <div className="admin-stack-list">
                {categoryFormState.map((category, index) => (
                  <article key={category.id} className="card admin-inline-card">
                    <label className="field">
                      <span className="field-label">Nome da categoria</span>
                      <input
                        className="input"
                        type="text"
                        value={category.label}
                        onChange={(event) =>
                          updateCategory(index, { label: event.target.value })
                        }
                        placeholder="Ex: Festa"
                      />
                    </label>

                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={category.visible}
                        onChange={(event) =>
                          updateCategory(index, { visible: event.target.checked })
                        }
                      />
                      <span>Disponivel como filtro publico</span>
                    </label>

                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => removeCategory(index)}
                    >
                      <Trash2 size={16} />
                      Remover
                    </button>
                  </article>
                ))}
              </div>

              <div className="button-row">
                <button type="button" className="button button-outline" onClick={addCategory}>
                  <Plus size={16} />
                  Nova categoria
                </button>
                <button type="button" className="button" onClick={handleSaveCategories}>
                  Salvar categorias
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={handleResetCategories}
                >
                  Descartar rascunho
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="admin-events-tab-panel">
              <div className="page-header page-header-stack">
                <div>
                  <p className="kicker">Importacao</p>
                  <h3 className="section-title">
                    Suba uma planilha e confirme so depois da validacao.
                  </h3>
                  <p className="muted">
                    O fluxo aceita <code>.xlsx</code> e <code>.csv</code>, identifica erros por
                    linha e so salva o que estiver pronto para entrar na agenda.
                  </p>
                </div>
              </div>

              {importStatus && (
                <div className={`status-banner status-banner-${importStatus.tone}`}>
                  {importStatus.message}
                </div>
              )}

              <div className="check-list admin-check-list">
                <span>Colunas aceitas: {acceptedColumns.join(', ')}</span>
              </div>

              <div className="button-row">
                <label className="button button-outline">
                  <UploadCloud size={16} />
                  {isImportReading ? 'Lendo planilha...' : 'Selecionar planilha'}
                  <input
                    className="sr-only"
                    type="file"
                    accept={IMPORT_ACCEPT}
                    onChange={handleSpreadsheetChange}
                    disabled={isImportReading || isImportSaving}
                  />
                </label>

                <button
                  type="button"
                  className="button button-outline"
                  onClick={downloadEventImportTemplate}
                >
                  <Download size={16} />
                  Baixar modelo
                </button>

                <button
                  type="button"
                  className="button"
                  onClick={() => void handleConfirmImport()}
                  disabled={
                    !importPreview?.validRows.length || isImportSaving || isImportReading
                  }
                >
                  {isImportSaving ? 'Salvando importacao...' : 'Confirmar importacao'}
                </button>
              </div>

              {importPreview && (
                <div className="admin-import-preview">
                  <div className="badge-row">
                    <span className="pill">{importPreview.fileName}</span>
                    <span className="pill">Validas: {importPreview.validRows.length}</span>
                    <span className="pill">Com erro: {importPreview.invalidRows.length}</span>
                    {importPreview.categoriesToCreate.length > 0 && (
                      <span className="pill">
                        Novas categorias: {importPreview.categoriesToCreate.length}
                      </span>
                    )}
                  </div>

                  {importPreview.categoriesToCreate.length > 0 && (
                    <div className="badge-row">
                      {importPreview.categoriesToCreate.map((category) => (
                        <span key={category.id} className="pill pill-accent">
                          Criar categoria: {category.label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Linha</th>
                          <th>Titulo</th>
                          <th>Data</th>
                          <th>Categoria</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.acceptedRows.map((row) => (
                          <tr key={`import-row-${row.rowNumber}`}>
                            <td>{row.rowNumber}</td>
                            <td>{row.draft?.title || row.raw.titulo || '-'}</td>
                            <td>{row.draft?.date || row.raw.data || '-'}</td>
                            <td>{row.draft?.categoryId || row.raw.categoria || '-'}</td>
                            <td>
                              <div className="admin-import-row-status">
                                <span className={row.draft ? 'pill pill-accent' : 'pill'}>
                                  {row.draft
                                    ? 'Pronto para importar'
                                    : 'Corrigir antes de salvar'}
                                </span>
                                {row.issues.map((issue, index) => (
                                  <span
                                    key={`${row.rowNumber}-${issue.field}-${index}`}
                                    className={
                                      issue.tone === 'error' ? 'pill admin-pill-error' : 'pill'
                                    }
                                  >
                                    {issue.field}: {issue.message}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </article>
      <article className="card admin-subcard">
        <div className="page-header page-header-stack">
          <div>
            <p className="kicker">Pagina publica de eventos</p>
            <h3 className="section-title">Textos, banner e secoes da rota /eventos.</h3>
            <p className="muted">
              Esta configuracao controla o hero, os textos auxiliares, a mensagem de estado vazio
              e a visibilidade das secoes do calendario publico. A tipografia global desta pagina
              agora e herdada de <strong>Aparencia</strong>.
            </p>
          </div>
        </div>

        <div className="admin-editor-toolbar">
          <span
            className={
              isPageDirty
                ? 'admin-editor-state admin-editor-state-dirty'
                : 'admin-editor-state admin-editor-state-clean'
            }
          >
            {isPageDirty ? 'Alteracoes nao salvas' : 'Tudo salvo nesta guia'}
          </span>
          <span className="muted">
            {isPageDirty
              ? 'O rascunho fica local ate voce publicar.'
              : 'A pagina publica ja mostra o ultimo conteudo salvo.'}
          </span>
        </div>

        {pageStatus && (
          <div className={`status-banner status-banner-${pageStatus.tone}`}>
            {pageStatus.message}
          </div>
        )}

        <form className="branding-form" onSubmit={handlePageFormSubmit}>
          <div className="branding-grid">
            <label className="field">
              <span className="field-label">Kicker do hero</span>
              <input
                className="input"
                type="text"
                value={pageFormState.heroKicker}
                onChange={(event) => updatePageField('heroKicker', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Titulo principal</span>
              <input
                className="input"
                type="text"
                value={pageFormState.title}
                onChange={(event) => updatePageField('title', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Subtitulo</span>
              <textarea
                className="input textarea"
                value={pageFormState.subtitle}
                onChange={(event) => updatePageField('subtitle', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto de introducao</span>
              <textarea
                className="input textarea"
                value={pageFormState.introText}
                onChange={(event) => updatePageField('introText', event.target.value)}
              />
            </label>

            <AdminImageUploadField
              label="Banner da pagina"
              value={pageFormState.bannerImageUrl}
              onChange={(value) => updatePageField('bannerImageUrl', value)}
              previewAlt="Banner da pagina de eventos"
              helperText="A imagem principal do hero publico de eventos."
              fallbackPreviewUrl={defaultEventsConfig.page.bannerImageUrl}
              uploadOptions={EVENTS_BANNER_UPLOAD_OPTIONS}
              onUploadStatus={(message, tone) =>
                setPageEditorStatus(
                  tone === 'success'
                    ? 'Banner carregado no rascunho. Salve a pagina para publicar a nova imagem.'
                    : message,
                  tone ?? 'info'
                )
              }
            />

            <label className="field">
              <span className="field-label">Kicker do destaque</span>
              <input
                className="input"
                type="text"
                value={pageFormState.featuredSectionKicker}
                onChange={(event) =>
                  updatePageField('featuredSectionKicker', event.target.value)
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Titulo do destaque</span>
              <input
                className="input"
                type="text"
                value={pageFormState.featuredSectionTitle}
                onChange={(event) =>
                  updatePageField('featuredSectionTitle', event.target.value)
                }
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto do destaque</span>
              <textarea
                className="input textarea"
                value={pageFormState.featuredSectionText}
                onChange={(event) =>
                  updatePageField('featuredSectionText', event.target.value)
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Kicker dos filtros</span>
              <input
                className="input"
                type="text"
                value={pageFormState.filtersKicker}
                onChange={(event) => updatePageField('filtersKicker', event.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">Titulo dos filtros</span>
              <input
                className="input"
                type="text"
                value={pageFormState.filtersTitle}
                onChange={(event) => updatePageField('filtersTitle', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto dos filtros</span>
              <textarea
                className="input textarea"
                value={pageFormState.filtersText}
                onChange={(event) => updatePageField('filtersText', event.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">Kicker do calendario</span>
              <input
                className="input"
                type="text"
                value={pageFormState.calendarSectionKicker}
                onChange={(event) =>
                  updatePageField('calendarSectionKicker', event.target.value)
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Titulo do calendario</span>
              <input
                className="input"
                type="text"
                value={pageFormState.calendarSectionTitle}
                onChange={(event) =>
                  updatePageField('calendarSectionTitle', event.target.value)
                }
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto do calendario</span>
              <textarea
                className="input textarea"
                value={pageFormState.calendarSectionText}
                onChange={(event) =>
                  updatePageField('calendarSectionText', event.target.value)
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Kicker da lista de proximos eventos</span>
              <input
                className="input"
                type="text"
                value={pageFormState.upcomingSectionKicker}
                onChange={(event) =>
                  updatePageField('upcomingSectionKicker', event.target.value)
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Titulo da lista</span>
              <input
                className="input"
                type="text"
                value={pageFormState.upcomingSectionTitle}
                onChange={(event) =>
                  updatePageField('upcomingSectionTitle', event.target.value)
                }
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto da lista</span>
              <textarea
                className="input textarea"
                value={pageFormState.upcomingSectionText}
                onChange={(event) =>
                  updatePageField('upcomingSectionText', event.target.value)
                }
              />
            </label>

            <label className="field">
              <span className="field-label">Titulo do estado vazio</span>
              <input
                className="input"
                type="text"
                value={pageFormState.emptyStateTitle}
                onChange={(event) => updatePageField('emptyStateTitle', event.target.value)}
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Texto do estado vazio</span>
              <textarea
                className="input textarea"
                value={pageFormState.emptyStateText}
                onChange={(event) => updatePageField('emptyStateText', event.target.value)}
              />
            </label>
          </div>

          <article className="card admin-subcard admin-events-sections-card">
            <div className="admin-subcard-head">
              <CalendarDays size={18} />
              <strong>Ordem e visibilidade das secoes</strong>
            </div>

            <div className="admin-stack-list">
              {pageFormState.sections.map((section, index) => (
                <article key={section.id} className="card admin-inline-card">
                  <div>
                    <strong>{EVENT_PAGE_SECTION_LABELS[section.id]}</strong>
                    <p className="muted">Controle a ordem e se esta parte aparece em /eventos.</p>
                  </div>

                  <label className="admin-check">
                    <input
                      type="checkbox"
                      checked={section.visible}
                      onChange={(event) =>
                        updatePageSection(index, { visible: event.target.checked })
                      }
                    />
                    <span>Secao visivel</span>
                  </label>

                  <div className="admin-inline-actions">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => movePageSection(index, 'up')}
                      disabled={index === 0}
                      aria-label="Mover secao para cima"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => movePageSection(index, 'down')}
                      disabled={index === pageFormState.sections.length - 1}
                      aria-label="Mover secao para baixo"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <div className="button-row">
            <button type="submit" className="button" disabled={isPageSaving}>
              {isPageSaving ? 'Salvando...' : 'Salvar alteracoes'}
            </button>
            <button
              type="button"
              className="button button-outline"
              onClick={() => void handleResetPageContent()}
              disabled={isPageSaving}
            >
              Restaurar padrao
            </button>
          </div>
        </form>
      </article>
      </section>

      {isEditorOpen && (
        <div className="admin-drawer-backdrop" onClick={closeEventEditor}>
          <aside
            className="admin-drawer admin-event-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={selectedEvent ? 'Editar evento' : 'Novo evento'}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="admin-drawer-head">
              <div>
                <p className="kicker">Eventos</p>
                <h3 className="section-title">
                  {selectedEvent ? 'Editar evento' : 'Novo evento'}
                </h3>
                <p className="muted">
                  Edicao mais direta para agenda, publicacao, CTA e imagem principal.
                </p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={closeEventEditor}
                aria-label="Fechar editor de evento"
              >
                <X size={16} />
              </button>
            </div>

            {eventStatus && (
              <div className={`status-banner status-banner-${eventStatus.tone}`}>
                {eventStatus.message}
              </div>
            )}

            <form className="admin-event-drawer-form" onSubmit={handleSaveEvent}>
              <div className="admin-event-drawer-grid">
                <section className="card admin-subcard admin-event-form-card">
                  <div className="admin-section-header admin-event-section-head">
                    <div>
                      <p className="kicker">Bloco 1</p>
                      <h4 className="section-title">Informacoes principais</h4>
                    </div>
                    {isEventDirty && <span className="pill">Rascunho alterado</span>}
                  </div>

                  <div className="branding-grid admin-event-form-grid">
                    <label className="field field-full">
                      <span className="field-label">Titulo (obrigatorio)</span>
                      <input
                        className="input"
                        type="text"
                        value={eventFormState.title}
                        onChange={(event) => updateEventField('title', event.target.value)}
                        required
                      />
                    </label>

                    <label className="field field-full">
                      <span className="field-label">Descricao curta</span>
                      <textarea
                        className="input textarea admin-event-textarea-short"
                        value={eventFormState.shortDescription}
                        onChange={(event) => updateEventField('shortDescription', event.target.value)}
                      />
                    </label>

                    <label className="field field-full">
                      <span className="field-label">Descricao completa</span>
                      <textarea
                        className="input textarea admin-event-textarea-long"
                        value={eventFormState.fullDescription}
                        onChange={(event) => updateEventField('fullDescription', event.target.value)}
                      />
                    </label>
                  </div>
                </section>

                <section className="card admin-subcard admin-event-form-card">
                  <div className="admin-section-header admin-event-section-head">
                    <div>
                      <p className="kicker">Bloco 2</p>
                      <h4 className="section-title">Data e local</h4>
                    </div>
                  </div>

                  <div className="branding-grid admin-event-form-grid">
                    <label className="field">
                      <span className="field-label">Data</span>
                      <input
                        className="input"
                        type="date"
                        value={eventFormState.date}
                        onChange={(event) => updateEventField('date', event.target.value)}
                        required
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Hora inicio</span>
                      <input
                        className="input"
                        type="time"
                        value={eventFormState.startTime}
                        onChange={(event) => updateEventField('startTime', event.target.value)}
                        required
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Hora fim</span>
                      <input
                        className="input"
                        type="time"
                        value={eventFormState.endTime}
                        onChange={(event) => updateEventField('endTime', event.target.value)}
                      />
                    </label>

                    <label className="field field-full">
                      <span className="field-label">Local</span>
                      <input
                        className="input"
                        type="text"
                        value={eventFormState.location}
                        onChange={(event) => updateEventField('location', event.target.value)}
                        placeholder="Ex: Ginasio universitario"
                      />
                    </label>

                    <label className="field field-full">
                      <span className="field-label">Categoria</span>
                      <select
                        className="input"
                        value={eventFormState.categoryId}
                        onChange={(event) => updateEventField('categoryId', event.target.value)}
                      >
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </section>

                <section className="card admin-subcard admin-event-form-card">
                  <div className="admin-section-header admin-event-section-head">
                    <div>
                      <p className="kicker">Bloco 3</p>
                      <h4 className="section-title">Publicacao e destaque</h4>
                    </div>
                  </div>

                  <div className="admin-checkbox-row admin-event-status-row">
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={eventFormState.visible}
                        onChange={(event) => updateEventField('visible', event.target.checked)}
                      />
                      <span>Visivel na pagina publica</span>
                    </label>

                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={eventFormState.featured}
                        onChange={(event) => updateEventField('featured', event.target.checked)}
                      />
                      <span>Marcar como destaque</span>
                    </label>

                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={eventFormState.ticketEnabled}
                        onChange={(event) => updateEventField('ticketEnabled', event.target.checked)}
                      />
                      <span>Botao principal ativo</span>
                    </label>

                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={eventFormState.soldOut}
                        onChange={(event) => updateEventField('soldOut', event.target.checked)}
                      />
                      <span>Evento esgotado</span>
                    </label>
                  </div>
                </section>

                <section className="card admin-subcard admin-event-form-card">
                  <div className="admin-section-header admin-event-section-head">
                    <div>
                      <p className="kicker">Bloco 4</p>
                      <h4 className="section-title">CTA e ingresso</h4>
                    </div>
                  </div>

                  <div className="branding-grid admin-event-form-grid">
                    <label className="field">
                      <span className="field-label">Tipo de acao</span>
                      <select
                        className="input"
                        value={eventFormState.actionType}
                        onChange={(event) =>
                          updateEventField('actionType', event.target.value as EventActionType)
                        }
                      >
                        {Object.entries(EVENT_ACTION_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span className="field-label">Rotulo do botao</span>
                      <input
                        className="input"
                        type="text"
                        value={eventFormState.actionLabel}
                        onChange={(event) => updateEventField('actionLabel', event.target.value)}
                        placeholder="Ex: Comprar ingresso"
                      />
                    </label>

                    <label className="field field-full">
                      <span className="field-label">Link da acao principal</span>
                      <input
                        className="input"
                        type="text"
                        value={eventFormState.actionUrl}
                        onChange={(event) => updateEventField('actionUrl', event.target.value)}
                        placeholder="Checkout, pagina externa ou rota interna"
                      />
                    </label>

                    <label className="field field-full">
                      <span className="field-label">Link externo de apoio</span>
                      <input
                        className="input"
                        type="text"
                        value={eventFormState.externalUrl}
                        onChange={(event) => updateEventField('externalUrl', event.target.value)}
                        placeholder="Pagina com mais informacoes"
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Preco</span>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={eventFormState.ticketPrice ?? ''}
                        onChange={(event) =>
                          updateEventField('ticketPrice', parseTicketPriceValue(event.target.value))
                        }
                        placeholder="Opcional"
                      />
                    </label>

                    <label className="field">
                      <span className="field-label">Plataforma externa</span>
                      <input
                        className="input"
                        type="text"
                        value={eventFormState.externalTicketProvider}
                        onChange={(event) =>
                          updateEventField('externalTicketProvider', event.target.value)
                        }
                        placeholder="Ex: Sympla"
                      />
                    </label>
                  </div>
                </section>

                <section className="card admin-subcard admin-event-form-card">
                  <div className="admin-section-header admin-event-section-head">
                    <div>
                      <p className="kicker">Bloco 5</p>
                      <h4 className="section-title">Imagem e resumo</h4>
                    </div>
                  </div>

                  <AdminImageUploadField
                    label="Imagem principal"
                    value={eventFormState.imageUrl}
                    onChange={(value) => updateEventField('imageUrl', value)}
                    previewAlt={eventFormState.title || 'Imagem do evento'}
                    helperText="Usada no destaque, nos cards da agenda e na pagina do evento."
                    uploadOptions={EVENT_IMAGE_UPLOAD_OPTIONS}
                    onUploadStatus={(message, tone) =>
                      setEventStatus(
                        createStatus(
                          tone === 'success'
                            ? 'Imagem carregada no rascunho do evento. Salve para publicar.'
                            : message,
                          tone ?? 'info'
                        )
                      )
                    }
                  />

                  <div className="admin-events-preview-card">
                    <div className="admin-events-preview-grid">
                      {eventFormState.imageUrl ? (
                        <img
                          src={eventFormState.imageUrl}
                          alt={eventFormState.title || 'Preview do evento'}
                          className="admin-events-preview-image"
                        />
                      ) : (
                        <div className="admin-event-thumb-placeholder admin-events-preview-placeholder">
                          <CalendarDays size={24} />
                        </div>
                      )}

                      <div className="admin-events-preview-copy">
                        <div className="badge-row">
                          <span className="pill">{currentCategoryLabel}</span>
                          <span className={`pill event-status-pill event-status-pill-${liveEventStatusKey}`}>
                            {liveEventStatusLabel}
                          </span>
                          {eventFormState.featured ? <span className="pill">Destaque</span> : null}
                        </div>
                        <h4>{eventFormState.title || 'Titulo do evento'}</h4>
                        {eventFormState.shortDescription ? (
                          <p className="muted">{eventFormState.shortDescription}</p>
                        ) : null}
                        <div className="events-meta-list">
                          {eventFormState.date ? (
                            <span>
                              <CalendarDays size={16} />
                              {formatEventDateLabel(eventFormState.date)}
                            </span>
                          ) : null}
                          {eventFormState.startTime ? <span>{formatEventTimeRange(eventFormState)}</span> : null}
                          {eventFormState.location ? <span>{eventFormState.location}</span> : null}
                        </div>
                        {typeof eventFormState.ticketPrice === 'number' && eventFormState.ticketPrice > 0 ? (
                          <strong className="event-inline-price">
                            {formatCurrency(eventFormState.ticketPrice)}
                          </strong>
                        ) : null}
                        {selectedEvent ? (
                          <a
                            href={`/eventos/${selectedEvent.id}`}
                            className="button button-outline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Ver pagina publica
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="admin-drawer-actions">
                <button type="button" className="button button-outline" onClick={closeEventEditor}>
                  Cancelar
                </button>
                {selectedEvent && (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => handleDeleteEvent(selectedEvent)}
                  >
                    <Trash2 size={16} />
                    Excluir
                  </button>
                )}
                <button type="submit" className="button" disabled={isEventSaving}>
                  {isEventSaving
                    ? 'Salvando...'
                    : selectedEvent
                      ? 'Salvar alteracoes'
                      : 'Criar evento'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
