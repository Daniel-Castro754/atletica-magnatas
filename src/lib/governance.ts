import type {
  GovernanceCommitmentItem,
  GovernanceContact,
  GovernanceContent,
  GovernanceDocument,
  GovernanceMember,
  GovernanceRoleItem,
  GovernanceSectionConfig,
  GovernanceSectionId,
  GovernanceTerm,
} from '../types/governance';
import { getSupabaseConfig, setSupabaseConfig } from './supabase';

export const GOVERNANCE_STORAGE_KEY = 'magnatas_governance_content';

export const GOVERNANCE_SECTION_LABELS: Record<GovernanceSectionId, string> = {
  hero: 'Hero principal',
  current_board: 'Gestao atual',
  roles: 'Cargos e funcoes',
  term: 'Mandato atual',
  commitments: 'Compromissos de transparencia',
  documents: 'Documentos e informacoes uteis',
  contact: 'Contato institucional',
};

const GOVERNANCE_SECTION_IDS: GovernanceSectionId[] = [
  'hero',
  'current_board',
  'roles',
  'term',
  'commitments',
  'documents',
  'contact',
];

const DEFAULT_GOVERNANCE_CONTENT: GovernanceContent = {
  heroKicker: 'Institucional',
  title: 'Diretoria e Transparencia',
  subtitle:
    'Conheca a gestao atual da Atletica Magnatas, os cargos que sustentam a operacao da atletica e os compromissos institucionais com a comunidade academica.',
  introText:
    'A Atletica Magnatas acredita que organizacao, comunicacao clara e responsabilidade institucional fortalecem a confianca da comunidade academica. Esta pagina reune informacoes sobre a gestao atual, funcoes da diretoria e documentos relevantes.',
  sections: GOVERNANCE_SECTION_IDS.map((id) => ({ id, visible: true })),
  currentBoardKicker: 'Gestao atual',
  currentBoardTitle: 'Quem conduz a operacao da atletica neste mandato.',
  currentBoardText:
    'A diretoria atual organiza a rotina institucional, representa os estudantes e coordena as frentes que mantem a Magnatas ativa ao longo do ano.',
  members: [
    {
      id: 'governance-member-1',
      name: 'Ana Clara Martins',
      role: 'Presidente',
      photoUrl: 'https://picsum.photos/seed/magnatas-diretoria-presidente/500/500',
      bio: 'Coordena a diretoria, acompanha o planejamento geral e representa a atletica institucionalmente.',
      contactLabel: '@ana.magnatas',
      contactHref: 'https://instagram.com/ana.magnatas',
      displayOrder: 1,
      visible: true,
    },
    {
      id: 'governance-member-2',
      name: 'Lucas Ferreira',
      role: 'Vice-presidente',
      photoUrl: 'https://picsum.photos/seed/magnatas-diretoria-vice/500/500',
      bio: 'Apoia a presidencia, acompanha execucao interna e ajuda a integrar as frentes operacionais.',
      contactLabel: '@lucas.magnatas',
      contactHref: 'https://instagram.com/lucas.magnatas',
      displayOrder: 2,
      visible: true,
    },
    {
      id: 'governance-member-3',
      name: 'Marina Teixeira',
      role: 'Diretora de Eventos',
      photoUrl: 'https://picsum.photos/seed/magnatas-diretoria-eventos/500/500',
      bio: 'Cuida do calendario, da producao das experiencias da turma e da articulacao dos principais encontros.',
      contactLabel: '@marina.magnatas',
      contactHref: 'https://instagram.com/marina.magnatas',
      displayOrder: 3,
      visible: true,
    },
    {
      id: 'governance-member-4',
      name: 'Guilherme Costa',
      role: 'Tesoureiro',
      photoUrl: 'https://picsum.photos/seed/magnatas-diretoria-financeiro/500/500',
      bio: 'Acompanha fluxo financeiro, prestacao de contas e organizacao dos compromissos operacionais.',
      contactLabel: 'financeiro.magnatas@outlook.com',
      contactHref: 'mailto:financeiro.magnatas@outlook.com',
      displayOrder: 4,
      visible: true,
    },
  ],
  rolesKicker: 'Cargos e funcoes',
  rolesTitle: 'As frentes que sustentam a rotina institucional da Magnatas.',
  rolesText:
    'Cada cargo tem responsabilidades claras para garantir continuidade, organizacao e boa comunicacao com a comunidade academica.',
  roles: [
    {
      id: 'governance-role-1',
      title: 'Presidente',
      description: 'Coordena a diretoria, conduz alinhamentos institucionais e representa a atletica oficialmente.',
      displayOrder: 1,
      visible: true,
    },
    {
      id: 'governance-role-2',
      title: 'Vice-presidente',
      description: 'Acompanha a execucao do planejamento e garante continuidade das operacoes internas.',
      displayOrder: 2,
      visible: true,
    },
    {
      id: 'governance-role-3',
      title: 'Tesoureiro(a)',
      description: 'Organiza caixa, pagamentos, prestacao de contas e rotinas financeiras da gestao.',
      displayOrder: 3,
      visible: true,
    },
    {
      id: 'governance-role-4',
      title: 'Diretor(a) de Eventos',
      description: 'Planeja cronogramas, ativa a comunidade e acompanha a producao dos principais eventos.',
      displayOrder: 4,
      visible: true,
    },
    {
      id: 'governance-role-5',
      title: 'Diretor(a) de Produtos',
      description: 'Cuida da colecao oficial, do catalogo e da operacao da loja da atletica.',
      displayOrder: 5,
      visible: true,
    },
    {
      id: 'governance-role-6',
      title: 'Diretor(a) de Marketing',
      description: 'Conduz comunicacao, identidade visual e relacionamento digital da Magnatas.',
      displayOrder: 6,
      visible: true,
    },
  ],
  termKicker: 'Mandato atual',
  termTitle: 'Informacoes resumidas sobre a gestao vigente.',
  termText: 'Este bloco ajuda a registrar com clareza o ciclo atual da diretoria.',
  currentTerm: {
    managementName: 'Gestao 2026',
    mandateLabel: 'Mandato vigente de marco de 2026 ate marco de 2027.',
    startDate: '2026-03-01',
    endDate: '2027-03-01',
    notes: 'A composicao da diretoria pode ser atualizada sempre que houver transicao interna.',
  },
  commitmentsKicker: 'Compromissos de transparencia',
  commitmentsTitle: 'Como a Magnatas busca conduzir a gestao com responsabilidade institucional.',
  commitmentsText:
    'A transparencia da atletica se apoia em informacao acessivel, comunicacao responsavel e organizacao constante.',
  commitments: [
    {
      id: 'governance-commitment-1',
      title: 'Organizacao',
      description: 'Mantemos processos internos claros para sustentar a continuidade da gestao e das frentes da atletica.',
      displayOrder: 1,
      visible: true,
    },
    {
      id: 'governance-commitment-2',
      title: 'Comunicacao',
      description: 'Buscamos comunicar decisoes, agendas e encaminhamentos de maneira objetiva e acessivel.',
      displayOrder: 2,
      visible: true,
    },
    {
      id: 'governance-commitment-3',
      title: 'Prestacao de contas',
      description: 'Os registros financeiros e institucionais relevantes devem estar organizados e disponiveis quando cabivel.',
      displayOrder: 3,
      visible: true,
    },
    {
      id: 'governance-commitment-4',
      title: 'Representacao',
      description: 'A diretoria atua para representar os estudantes e fortalecer a presenca da Economia no ambiente universitario.',
      displayOrder: 4,
      visible: true,
    },
  ],
  documentsKicker: 'Documentos e informacoes uteis',
  documentsTitle: 'Materiais institucionais reunidos em um unico lugar.',
  documentsText:
    'Use esta area para disponibilizar regulamentos, editais, prestacoes de contas e outros arquivos ou links de interesse coletivo.',
  documents: [
    {
      id: 'governance-document-1',
      title: 'Estatuto da Atletica',
      description: 'Documento base com regras gerais de funcionamento da entidade.',
      category: 'Estatuto',
      date: '2026-03-10',
      href: '#',
      fileName: '',
      displayOrder: 1,
      visible: true,
    },
    {
      id: 'governance-document-2',
      title: 'Edital eleitoral',
      description: 'Publicacao com regras e cronograma do processo eleitoral vigente.',
      category: 'Edital',
      date: '2026-02-20',
      href: '#',
      fileName: '',
      displayOrder: 2,
      visible: true,
    },
  ],
  contactKicker: 'Contato institucional',
  contactTitle: 'Fale com a diretoria da Magnatas.',
  contactText:
    'Em caso de duvidas institucionais, prestacao de contas ou solicitacoes formais, utilize os canais abaixo.',
  contact: {
    email: 'diretoria.magnatas@outlook.com',
    instagram: 'https://instagram.com/atletica.magnatas',
    whatsapp: 'https://wa.me/5548999999999',
    closingText:
      'A diretoria segue disponivel para orientar a comunidade academica e fortalecer a relacao institucional da atletica com os estudantes.',
  },
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

function sanitizeBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

function sanitizeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function mergeOrderedSections(
  input: unknown,
  defaults: GovernanceSectionConfig[]
) {
  const defaultVisibilityById = new Map(
    defaults.map((section) => [section.id, section.visible] as const)
  );

  if (!Array.isArray(input)) {
    return defaults.map((section) => ({ ...section }));
  }

  const nextSections: GovernanceSectionConfig[] = [];
  const seenIds = new Set<GovernanceSectionId>();

  input.forEach((item) => {
    if (!item || typeof item !== 'object') {
      return;
    }

    const candidate = item as Record<string, unknown>;
    const sectionId = GOVERNANCE_SECTION_IDS.find((id) => id === candidate.id);

    if (!sectionId || seenIds.has(sectionId)) {
      return;
    }

    seenIds.add(sectionId);
    nextSections.push({
      id: sectionId,
      visible: sanitizeBoolean(
        candidate.visible,
        defaultVisibilityById.get(sectionId) ?? true
      ),
    });
  });

  GOVERNANCE_SECTION_IDS.forEach((sectionId) => {
    if (!seenIds.has(sectionId)) {
      nextSections.push({
        id: sectionId,
        visible: defaultVisibilityById.get(sectionId) ?? true,
      });
    }
  });

  return nextSections;
}

function sortByDisplayOrder<T extends { displayOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function mergeMembers(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_GOVERNANCE_CONTENT.members.map((item) => ({ ...item }));
  }

  return sortByDisplayOrder(
    input.map((item, index) => {
      const fallback = DEFAULT_GOVERNANCE_CONTENT.members[index] || {
        id: `governance-member-${index + 1}`,
        name: '',
        role: '',
        photoUrl: '',
        bio: '',
        contactLabel: '',
        contactHref: '',
        displayOrder: index + 1,
        visible: true,
      };
      const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

      return {
        id: sanitizeString(candidate.id, fallback.id),
        name: sanitizeString(candidate.name, fallback.name, true),
        role: sanitizeString(candidate.role, fallback.role, true),
        photoUrl: sanitizeString(candidate.photoUrl, fallback.photoUrl, true),
        bio: sanitizeString(candidate.bio, fallback.bio, true),
        contactLabel: sanitizeString(candidate.contactLabel, fallback.contactLabel, true),
        contactHref: sanitizeString(candidate.contactHref, fallback.contactHref, true),
        displayOrder: sanitizeNumber(candidate.displayOrder, fallback.displayOrder),
        visible: sanitizeBoolean(candidate.visible, fallback.visible),
      } satisfies GovernanceMember;
    })
  );
}

function mergeRoles(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_GOVERNANCE_CONTENT.roles.map((item) => ({ ...item }));
  }

  return sortByDisplayOrder(
    input.map((item, index) => {
      const fallback = DEFAULT_GOVERNANCE_CONTENT.roles[index] || {
        id: `governance-role-${index + 1}`,
        title: '',
        description: '',
        displayOrder: index + 1,
        visible: true,
      };
      const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

      return {
        id: sanitizeString(candidate.id, fallback.id),
        title: sanitizeString(candidate.title, fallback.title, true),
        description: sanitizeString(candidate.description, fallback.description, true),
        displayOrder: sanitizeNumber(candidate.displayOrder, fallback.displayOrder),
        visible: sanitizeBoolean(candidate.visible, fallback.visible),
      } satisfies GovernanceRoleItem;
    })
  );
}

function mergeCommitments(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_GOVERNANCE_CONTENT.commitments.map((item) => ({ ...item }));
  }

  return sortByDisplayOrder(
    input.map((item, index) => {
      const fallback = DEFAULT_GOVERNANCE_CONTENT.commitments[index] || {
        id: `governance-commitment-${index + 1}`,
        title: '',
        description: '',
        displayOrder: index + 1,
        visible: true,
      };
      const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

      return {
        id: sanitizeString(candidate.id, fallback.id),
        title: sanitizeString(candidate.title, fallback.title, true),
        description: sanitizeString(candidate.description, fallback.description, true),
        displayOrder: sanitizeNumber(candidate.displayOrder, fallback.displayOrder),
        visible: sanitizeBoolean(candidate.visible, fallback.visible),
      } satisfies GovernanceCommitmentItem;
    })
  );
}

function mergeDocuments(input: unknown) {
  if (!Array.isArray(input)) {
    return DEFAULT_GOVERNANCE_CONTENT.documents.map((item) => ({ ...item }));
  }

  return sortByDisplayOrder(
    input.map((item, index) => {
      const fallback = DEFAULT_GOVERNANCE_CONTENT.documents[index] || {
        id: `governance-document-${index + 1}`,
        title: '',
        description: '',
        category: 'Documento',
        date: '',
        href: '',
        fileName: '',
        displayOrder: index + 1,
        visible: true,
      };
      const candidate = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

      return {
        id: sanitizeString(candidate.id, fallback.id),
        title: sanitizeString(candidate.title, fallback.title, true),
        description: sanitizeString(candidate.description, fallback.description, true),
        category: sanitizeString(candidate.category, fallback.category, true),
        date: sanitizeString(candidate.date, fallback.date, true),
        href: sanitizeString(candidate.href, fallback.href, true),
        fileName: sanitizeString(candidate.fileName, fallback.fileName, true),
        displayOrder: sanitizeNumber(candidate.displayOrder, fallback.displayOrder),
        visible: sanitizeBoolean(candidate.visible, fallback.visible),
      } satisfies GovernanceDocument;
    })
  );
}

function mergeTerm(input: unknown): GovernanceTerm {
  const candidate = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const fallback = DEFAULT_GOVERNANCE_CONTENT.currentTerm;

  return {
    managementName: sanitizeString(candidate.managementName, fallback.managementName, true),
    mandateLabel: sanitizeString(candidate.mandateLabel, fallback.mandateLabel, true),
    startDate: sanitizeString(candidate.startDate, fallback.startDate, true),
    endDate: sanitizeString(candidate.endDate, fallback.endDate, true),
    notes: sanitizeString(candidate.notes, fallback.notes, true),
  };
}

function mergeContact(input: unknown): GovernanceContact {
  const candidate = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const fallback = DEFAULT_GOVERNANCE_CONTENT.contact;

  return {
    email: sanitizeString(candidate.email, fallback.email, true),
    instagram: sanitizeString(candidate.instagram, fallback.instagram, true),
    whatsapp: sanitizeString(candidate.whatsapp, fallback.whatsapp, true),
    closingText: sanitizeString(candidate.closingText, fallback.closingText, true),
  };
}

export const defaultGovernanceContent = DEFAULT_GOVERNANCE_CONTENT;

export function mergeGovernanceContent(input?: Partial<GovernanceContent> | null): GovernanceContent {
  return {
    heroKicker: sanitizeString(input?.heroKicker, DEFAULT_GOVERNANCE_CONTENT.heroKicker, true),
    title: sanitizeString(input?.title, DEFAULT_GOVERNANCE_CONTENT.title, true),
    subtitle: sanitizeString(input?.subtitle, DEFAULT_GOVERNANCE_CONTENT.subtitle, true),
    introText: sanitizeString(input?.introText, DEFAULT_GOVERNANCE_CONTENT.introText, true),
    sections: mergeOrderedSections(input?.sections, DEFAULT_GOVERNANCE_CONTENT.sections),
    currentBoardKicker: sanitizeString(
      input?.currentBoardKicker,
      DEFAULT_GOVERNANCE_CONTENT.currentBoardKicker,
      true
    ),
    currentBoardTitle: sanitizeString(
      input?.currentBoardTitle,
      DEFAULT_GOVERNANCE_CONTENT.currentBoardTitle,
      true
    ),
    currentBoardText: sanitizeString(
      input?.currentBoardText,
      DEFAULT_GOVERNANCE_CONTENT.currentBoardText,
      true
    ),
    members: mergeMembers(input?.members),
    rolesKicker: sanitizeString(input?.rolesKicker, DEFAULT_GOVERNANCE_CONTENT.rolesKicker, true),
    rolesTitle: sanitizeString(input?.rolesTitle, DEFAULT_GOVERNANCE_CONTENT.rolesTitle, true),
    rolesText: sanitizeString(input?.rolesText, DEFAULT_GOVERNANCE_CONTENT.rolesText, true),
    roles: mergeRoles(input?.roles),
    termKicker: sanitizeString(input?.termKicker, DEFAULT_GOVERNANCE_CONTENT.termKicker, true),
    termTitle: sanitizeString(input?.termTitle, DEFAULT_GOVERNANCE_CONTENT.termTitle, true),
    termText: sanitizeString(input?.termText, DEFAULT_GOVERNANCE_CONTENT.termText, true),
    currentTerm: mergeTerm(input?.currentTerm),
    commitmentsKicker: sanitizeString(
      input?.commitmentsKicker,
      DEFAULT_GOVERNANCE_CONTENT.commitmentsKicker,
      true
    ),
    commitmentsTitle: sanitizeString(
      input?.commitmentsTitle,
      DEFAULT_GOVERNANCE_CONTENT.commitmentsTitle,
      true
    ),
    commitmentsText: sanitizeString(
      input?.commitmentsText,
      DEFAULT_GOVERNANCE_CONTENT.commitmentsText,
      true
    ),
    commitments: mergeCommitments(input?.commitments),
    documentsKicker: sanitizeString(
      input?.documentsKicker,
      DEFAULT_GOVERNANCE_CONTENT.documentsKicker,
      true
    ),
    documentsTitle: sanitizeString(
      input?.documentsTitle,
      DEFAULT_GOVERNANCE_CONTENT.documentsTitle,
      true
    ),
    documentsText: sanitizeString(
      input?.documentsText,
      DEFAULT_GOVERNANCE_CONTENT.documentsText,
      true
    ),
    documents: mergeDocuments(input?.documents),
    contactKicker: sanitizeString(
      input?.contactKicker,
      DEFAULT_GOVERNANCE_CONTENT.contactKicker,
      true
    ),
    contactTitle: sanitizeString(
      input?.contactTitle,
      DEFAULT_GOVERNANCE_CONTENT.contactTitle,
      true
    ),
    contactText: sanitizeString(
      input?.contactText,
      DEFAULT_GOVERNANCE_CONTENT.contactText,
      true
    ),
    contact: mergeContact(input?.contact),
  };
}

export function loadGovernanceContent() {
  if (typeof window === 'undefined') {
    return defaultGovernanceContent;
  }

  try {
    const savedContent = window.localStorage.getItem(GOVERNANCE_STORAGE_KEY);
    if (!savedContent) {
      return defaultGovernanceContent;
    }

    return mergeGovernanceContent(JSON.parse(savedContent) as Partial<GovernanceContent>);
  } catch {
    return defaultGovernanceContent;
  }
}

export function persistGovernanceContent(content: GovernanceContent) {
  const mergedContent = mergeGovernanceContent(content);

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(GOVERNANCE_STORAGE_KEY, JSON.stringify(mergedContent));
    } catch {
      return mergedContent;
    }
  }

  setSupabaseConfig(GOVERNANCE_STORAGE_KEY, mergedContent);
  return mergedContent;
}

export async function syncGovernanceFromSupabase(): Promise<GovernanceContent | null> {
  const cloudData = await getSupabaseConfig<Partial<GovernanceContent>>(GOVERNANCE_STORAGE_KEY);
  if (!cloudData) return null;
  const merged = mergeGovernanceContent(cloudData);
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GOVERNANCE_STORAGE_KEY, JSON.stringify(merged));
    }
  } catch {}
  return merged;
}

export function clearStoredGovernanceContent() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(GOVERNANCE_STORAGE_KEY);
    } catch {
      return;
    }
  }
}
