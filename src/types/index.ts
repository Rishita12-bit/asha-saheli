export type BeneficiaryCategory = 'ANC' | 'PNC' | 'NEWBORN' | 'ADOLESCENT';

export type RiskLevel = 'RED' | 'AMBER' | 'GREEN';

export interface RiskEvaluation {
  level: RiskLevel;
  title: string;
  titleHindi: string;
  reasons: string[];
  reasonsHindi: string[];
  nextAction: string;
  nextActionHindi: string;
  urgentReferral: boolean;
  facility: string;
}

export interface VisitRecord {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  husbandOrGuardianName: string;
  age: number;
  category: BeneficiaryCategory;
  contactNumber: string;
  villageArea: string;
  visitDate: string;
  gestationalWeeks?: number | null;
  gestationalMonths?: number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  hemoglobin?: number | null;
  weightKg?: number | null;
  symptoms: string[];
  symptomsHindi: string[];
  ifaTabletsGiven?: number | null;
  ttDoseGiven?: string | null;
  immunizationsGiven?: string[];
  voiceTranscript?: string;
  risk: RiskEvaluation;
  synced: boolean;
  notes?: string;
  adolescentData?: {
    schoolGoing: boolean;
    sanitaryNapkinsReceived: boolean;
    wifsBlueTabletsTaken: number;
    menstrualDisorderFlag: boolean;
  };
}

export interface DueListItem {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  category: BeneficiaryCategory;
  taskType: 'ANC_CHECKUP' | 'TT_INJECTION' | 'HBNC_VISIT' | 'IMMUNIZATION' | 'WIFS_SUPPLY';
  taskTitle: string;
  taskTitleHindi: string;
  dueDate: string;
  status: 'PENDING' | 'OVERDUE' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
  contactNumber: string;
  villageArea: string;
}

export interface ASHAProfile {
  name: string;
  idNumber: string;
  village: string;
  subCentre: string;
  block: string;
  district: string;
  populationCovered: number;
  households: number;
  anmName: string;
  anmPhone: string;
  moicDoctor: string;
  moicPhone: string;
  ambulance108: string;
}
