
export type UserRole = 'LSM' | 'LM' | null;

export interface Agent {
  id: number;
  name: string;
  code: string;
  type: 'FT' | 'PT';
  colorIdx: number;
  unavailable: Record<number, number[]>; // day -> [slot1, slot2]
}

export interface Memo {
  id: number;
  title: string;
  date: string;
  isNew: boolean;
  content?: string;
}

export interface FormDoc {
  id: number;
  title: string;
  size: string;
  url: string;
}

export interface CustomerRegistration {
  id: number;
  agentName: string;
  agentCode: string;
  customerName: string;
  customerInfo: string; // phone last 4 or other identifier
  productInterest: string; // New field for product mention
  location: 'Lotus PR' | 'Brandshop Batu Pahat';
  expectedDate: string;
  timestamp: string;
  status: 'Pending' | 'Closed';
}

export interface ShiftSlot {
  name: string;
  color: {
    bg: string;
    text: string;
  };
}

export interface DayInfo {
  day: number;
  dow: number;
  isWeekend: boolean;
  slot1: ShiftSlot[];
  slot2: ShiftSlot[];
}

export enum Tab {
  Schedule = 'schedule',
  Management = 'management',
  Leads = 'leads'
}
