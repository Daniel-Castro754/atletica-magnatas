import { normalizeEventCategoryId } from './events';
import type {
  EventCategoryDefinition,
  EventDraft,
  EventImportIssue,
  EventImportPreview,
  EventImportPreviewRow,
} from '../types/events';

let xlsxModulePromise: Promise<typeof import('xlsx')> | null = null;

async function loadXlsxModule() {
  if (!xlsxModulePromise) {
    xlsxModulePromise = import('xlsx');
  }

  return xlsxModulePromise;
}

const TEMPLATE_COLUMNS = [
  'titulo',
  'descricao',
  'descricao_completa',
  'data',
  'hora_inicio',
  'hora_fim',
  'local',
  'categoria',
  'link',
  'destaque',
  'visivel',
] as const;

const HEADER_ALIASES: Record<string, string> = {
  titulo: 'titulo',
  title: 'titulo',
  descricao: 'descricao',
  descricao_curta: 'descricao',
  descricao_completa: 'descricao_completa',
  descricao_longa: 'descricao_completa',
  data: 'data',
  date: 'data',
  hora_inicio: 'hora_inicio',
  inicio: 'hora_inicio',
  hora_fim: 'hora_fim',
  fim: 'hora_fim',
  local: 'local',
  location: 'local',
  categoria: 'categoria',
  category: 'categoria',
  link: 'link',
  destaque: 'destaque',
  featured: 'destaque',
  visivel: 'visivel',
  visible: 'visivel',
};

function sanitizeCellValue(value: unknown) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function normalizeHeader(header: string) {
  return HEADER_ALIASES[header.trim().toLowerCase()] || header.trim().toLowerCase();
}

function isRowEmpty(row: Record<string, string>) {
  return Object.values(row).every((value) => !value.trim());
}

function parseBooleanValue(
  rawValue: string,
  fallback: boolean,
  field: string,
  issues: EventImportIssue[]
) {
  const normalizedValue = rawValue.trim().toLowerCase();

  if (!normalizedValue) {
    return fallback;
  }

  if (['sim', 's', 'true', '1', 'yes', 'y', 'x'].includes(normalizedValue)) {
    return true;
  }

  if (['nao', 'não', 'n', 'false', '0', 'no'].includes(normalizedValue)) {
    return false;
  }

  issues.push({
    field,
    tone: 'error',
    message: `Valor booleano invalido em ${field}. Use sim/nao, true/false ou 1/0.`,
  });

  return fallback;
}

function normalizeDateValue(rawValue: string) {
  const value = rawValue.trim();
  if (!value) {
    return '';
  }

  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return value;
  }

  const brMatch = value.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  return [
    parsedDate.getFullYear(),
    String(parsedDate.getMonth() + 1).padStart(2, '0'),
    String(parsedDate.getDate()).padStart(2, '0'),
  ].join('-');
}

function normalizeTimeValue(rawValue: string) {
  const value = rawValue.trim();
  if (!value) {
    return '';
  }

  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return '';
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return '';
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function normalizeLinkValue(rawValue: string) {
  const value = rawValue.trim();
  if (!value) {
    return '';
  }

  if (value.startsWith('/')) {
    return value;
  }

  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
      return value;
    }
  } catch {
    return '';
  }

  return '';
}

function resolveCategoryValue(
  rawValue: string,
  categories: EventCategoryDefinition[],
  issues: EventImportIssue[]
) {
  const value = rawValue.trim();

  if (!value) {
    issues.push({
      field: 'categoria',
      tone: 'warning',
      message: 'Categoria vazia. O sistema vai usar a primeira categoria ativa ao confirmar.',
    });

    return {
      categoryId: categories[0]?.id || 'integracao',
      suggestedCategory: null,
    };
  }

  const normalizedId = normalizeEventCategoryId(value);
  const matchedCategory =
    categories.find((category) => category.id === normalizedId) ||
    categories.find((category) => category.label.trim().toLowerCase() === value.toLowerCase());

  if (matchedCategory) {
    return {
      categoryId: matchedCategory.id,
      suggestedCategory: null,
    };
  }

  const suggestedCategory: EventCategoryDefinition = {
    id: normalizedId,
    label: value,
    visible: true,
  };

  issues.push({
    field: 'categoria',
    tone: 'warning',
    message: `Categoria nova detectada: ${value}. Ela sera criada junto com a importacao.`,
  });

  return {
    categoryId: suggestedCategory.id,
    suggestedCategory,
  };
}

function buildPreviewRow(
  rowNumber: number,
  raw: Record<string, string>,
  categories: EventCategoryDefinition[]
): EventImportPreviewRow {
  const issues: EventImportIssue[] = [];
  const title = raw.titulo?.trim() || '';
  const date = normalizeDateValue(raw.data || '');
  const startTime = normalizeTimeValue(raw.hora_inicio || '');
  const endTime = normalizeTimeValue(raw.hora_fim || '');
  const link = normalizeLinkValue(raw.link || '');
  const { categoryId, suggestedCategory } = resolveCategoryValue(raw.categoria || '', categories, issues);

  if (!title) {
    issues.push({
      field: 'titulo',
      tone: 'error',
      message: 'Titulo e obrigatorio.',
    });
  }

  if (!date) {
    issues.push({
      field: 'data',
      tone: 'error',
      message: 'Data obrigatoria ou em formato invalido. Use YYYY-MM-DD ou DD/MM/YYYY.',
    });
  }

  if ((raw.hora_inicio || '').trim() && !startTime) {
    issues.push({
      field: 'hora_inicio',
      tone: 'error',
      message: 'Hora de inicio invalida. Use HH:mm.',
    });
  }

  if ((raw.hora_fim || '').trim() && !endTime) {
    issues.push({
      field: 'hora_fim',
      tone: 'error',
      message: 'Hora de fim invalida. Use HH:mm.',
    });
  }

  if ((raw.link || '').trim() && !link) {
    issues.push({
      field: 'link',
      tone: 'error',
      message: 'Link invalido. Use uma URL http(s) ou um caminho interno iniciado com /.',
    });
  }

  if (!startTime) {
    issues.push({
      field: 'hora_inicio',
      tone: 'warning',
      message: 'Hora de inicio vazia. O sistema vai usar 19:00.',
    });
  }

  const featured = parseBooleanValue(raw.destaque || '', false, 'destaque', issues);
  const visible = parseBooleanValue(raw.visivel || '', true, 'visivel', issues);
  const hasErrors = issues.some((issue) => issue.tone === 'error');

  if (hasErrors) {
    return {
      rowNumber,
      raw,
      draft: null,
      issues,
      suggestedCategory,
    };
  }

  return {
    rowNumber,
    raw,
    draft: {
      title,
      shortDescription: raw.descricao?.trim() || '',
      fullDescription: raw.descricao_completa?.trim() || '',
      date,
      startTime: startTime || '19:00',
      endTime,
      location: raw.local?.trim() || '',
      categoryId,
      imageUrl: '',
      externalUrl: link,
      actionType: 'none',
      actionLabel: '',
      actionUrl: '',
      ticketPrice: null,
      ticketEnabled: false,
      soldOut: false,
      externalTicketProvider: '',
      featured,
      visible,
    } satisfies EventDraft,
    issues,
    suggestedCategory,
  };
}

async function readSpreadsheetRows(file: File) {
  const fileBuffer = await file.arrayBuffer();
  const XLSX = await loadXlsxModule();
  const workbook = XLSX.read(fileBuffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    return [] as Record<string, string>[];
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
  });

  return rawRows.map((row) =>
    Object.entries(row).reduce(
      (accumulator, [header, value]) => {
        accumulator[normalizeHeader(header)] = sanitizeCellValue(value);
        return accumulator;
      },
      {} as Record<string, string>
    )
  );
}

export async function buildEventImportPreview(
  file: File,
  categories: EventCategoryDefinition[]
): Promise<EventImportPreview> {
  const rows = await readSpreadsheetRows(file);
  const acceptedRows = rows
    .filter((row) => !isRowEmpty(row))
    .map((row, index) => buildPreviewRow(index + 2, row, categories));

  const validRows = acceptedRows.filter((row) => row.draft !== null);
  const invalidRows = acceptedRows.filter((row) => row.draft === null);
  const categoriesToCreate = validRows.reduce<EventCategoryDefinition[]>((accumulator, row) => {
    if (!row.suggestedCategory) {
      return accumulator;
    }

    if (categories.some((category) => category.id === row.suggestedCategory?.id)) {
      return accumulator;
    }

    if (accumulator.some((category) => category.id === row.suggestedCategory?.id)) {
      return accumulator;
    }

    accumulator.push(row.suggestedCategory);
    return accumulator;
  }, []);

  return {
    fileName: file.name,
    acceptedRows,
    validRows,
    invalidRows,
    categoriesToCreate,
  };
}

export function extractDraftsFromImportPreview(preview: EventImportPreview) {
  return preview.validRows
    .map((row) => row.draft)
    .filter((draft): draft is EventDraft => draft !== null);
}

export async function downloadEventImportTemplate() {
  const XLSX = await loadXlsxModule();
  const worksheet = XLSX.utils.json_to_sheet([
    {
      titulo: 'Recepcao oficial de calouros',
      descricao: 'Boas-vindas da diretoria e integracao da turma.',
      descricao_completa: 'Momento completo de apresentacao da atletica e aproximacao dos estudantes.',
      data: '2026-03-22',
      hora_inicio: '19:00',
      hora_fim: '22:00',
      local: 'Espaco de convivencia da UNESC',
      categoria: 'recepcao',
      link: 'https://exemplo.com/evento',
      destaque: 'sim',
      visivel: 'sim',
    },
  ], {
    header: [...TEMPLATE_COLUMNS],
    skipHeader: false,
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Eventos');
  XLSX.writeFile(workbook, 'modelo-eventos-magnatas.xlsx');
}

export function getEventImportAcceptedColumns() {
  return [...TEMPLATE_COLUMNS];
}
