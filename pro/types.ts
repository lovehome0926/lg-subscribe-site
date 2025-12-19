
export type Role = 'LSM' | 'Agent';
export type Language = 'zh' | 'en' | 'ms';
export type TabId = 'schedule' | 'ai' | 'salesKit' | 'agents';
export type SalesKitSubTab = 'faq' | 'specs' | 'scripts';

export interface AuthState {
  isLoggedIn: boolean;
  role: Role | null;
  agentId: number | null;
}

export interface UnavailableSlots {
  [day: number]: number[]; // day index -> [1, 2] for Morning/Evening
}

export interface Agent {
  id: number;
  name: string;
  code: string;
  type: 'FT' | 'PT';
  unavailable: UnavailableSlots;
}

export interface DayInfo {
  day: number;
  dow: number;
  isWeekend: boolean;
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
  thinking: string;
  loginLSM: string;
  loginAgent: string;
  passwordPlaceholder: string;
  agentCodePlaceholder: string;
  loginBtn: string;
  logout: string;
}
