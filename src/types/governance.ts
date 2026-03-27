export type GovernanceSectionId =
  | 'hero'
  | 'current_board'
  | 'roles'
  | 'term'
  | 'commitments'
  | 'documents'
  | 'contact';

export type GovernanceSectionConfig = {
  id: GovernanceSectionId;
  visible: boolean;
};

export type GovernanceMember = {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
  bio: string;
  contactLabel: string;
  contactHref: string;
  displayOrder: number;
  visible: boolean;
};

export type GovernanceRoleItem = {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
  visible: boolean;
};

export type GovernanceCommitmentItem = {
  id: string;
  title: string;
  description: string;
  displayOrder: number;
  visible: boolean;
};

export type GovernanceDocument = {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  href: string;
  fileName: string;
  displayOrder: number;
  visible: boolean;
};

export type GovernanceTerm = {
  managementName: string;
  mandateLabel: string;
  startDate: string;
  endDate: string;
  notes: string;
};

export type GovernanceContact = {
  email: string;
  instagram: string;
  whatsapp: string;
  closingText: string;
};

export type GovernanceContent = {
  heroKicker: string;
  title: string;
  subtitle: string;
  introText: string;
  sections: GovernanceSectionConfig[];
  currentBoardKicker: string;
  currentBoardTitle: string;
  currentBoardText: string;
  members: GovernanceMember[];
  rolesKicker: string;
  rolesTitle: string;
  rolesText: string;
  roles: GovernanceRoleItem[];
  termKicker: string;
  termTitle: string;
  termText: string;
  currentTerm: GovernanceTerm;
  commitmentsKicker: string;
  commitmentsTitle: string;
  commitmentsText: string;
  commitments: GovernanceCommitmentItem[];
  documentsKicker: string;
  documentsTitle: string;
  documentsText: string;
  documents: GovernanceDocument[];
  contactKicker: string;
  contactTitle: string;
  contactText: string;
  contact: GovernanceContact;
};
