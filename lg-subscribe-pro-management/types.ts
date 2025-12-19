
export type Role = 'LSM' | 'LM';
export type LanguageCode = 'zh' | 'en' | 'ms';

export interface AuthUser {
  role: Role;
  agentId?: string;
}

export interface Agent {
  id: string; // 修改为 string
  name: string;
  type: 'FT' | 'PT';
  unavailable: Record<number, number[]>; // day -> [slot1, slot2]
}

export interface DayInfo {
  day: number;
  dow: number;
  isWeekend: boolean;
}

export interface TimetableEntry extends DayInfo {
  slot1: string[];
  slot2: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  dims: string;
  notes: string;
  sellingPoints: string[];
}

export interface Translation {
  title: string;
  schedule: string;
  salesKit: string;
  aiCoach: string;
  agents: string;
  myAvailability: string;
  generate: string;
  ft: string;
  pt: string;
  slot1: string;
  slot2: string;
  searchPlaceholder: string;
  faq: string;
  forms: string;
  scripts: string;
  specs: string;
  aiPlaceholder: string;
  aiInstruction: string;
  am: string;
  pm: string;
  weekdays: string[];
  notes: string;
  copy: string;
  expertBtn: string;
  unavailable: string;
  thinking: string;
  noData: string;
  loginTitle: string;
  loginLsm: string;
  loginLm: string;
  passwordLabel: string;
  agentCodeLabel: string;
  loginBtn: string;
  loginError: string;
  logout: string;
  addAgent: string;
  agentName: string;
  agentType: string;
  saveAgent: string;
  cancel: string;
  deleteAgent: string;
  confirmDelete: string;
}
