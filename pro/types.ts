
export type UserRole = 'LSM' | 'LM' | null;

export interface Agent {
  id: number;
  name: string;
  code: string;
  type: 'FT' | 'PT';
  colorIdx: number;
  unavailable: Record<number, number[]>; // day -> [slot1, slot2]
  hasSubmitted?: boolean; // Tracking if the partner has finished their submission
}

export interface DayInfo {
  day: number;
  dow: number;
  isWeekend: boolean;
  slot1: ShiftSlot[];
  slot2: ShiftSlot[];
}

export interface ShiftSlot {
  name: string;
  color: {
    bg: string;
    text: string;
  };
}

export enum Tab {
  Schedule = 'schedule',
  Management = 'management'
}

export interface CloudData {
  agents: Agent[];
  timetable: DayInfo[];
  isFinalized: boolean;
  selectedMonth: string;
  lastUpdated: string;
}
