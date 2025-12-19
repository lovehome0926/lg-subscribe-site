
import React from 'react';
import { Calendar, Sun, Moon, Zap } from 'lucide-react';
import { Translation, TimetableEntry, Role } from '../types';

interface ScheduleProps {
  role: Role;
  translations: Translation;
  timetable: TimetableEntry[];
  selectedMonth: string;
  onGenerate: () => void;
}

const AGENT_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-amber-50 text-amber-700 border-amber-100',
  'bg-rose-50 text-rose-700 border-rose-100',
  'bg-indigo-50 text-indigo-700 border-indigo-100',
  'bg-cyan-50 text-cyan-700 border-cyan-100',
  'bg-orange-50 text-orange-700 border-orange-100',
  'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  'bg-teal-50 text-teal-700 border-teal-100',
];

const getAgentColorClass = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AGENT_COLORS.length;
  return AGENT_COLORS[index];
};

export const Schedule: React.FC<ScheduleProps> = ({ role, translations, timetable, selectedMonth, onGenerate }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100 font-bold">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[#A50034]" />
          <span className="text-sm">{selectedMonth}</span>
        </div>
        {role === 'LSM' && (
          <button 
            onClick={onGenerate} 
            className="bg-[#A50034] text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <Zap size={14} /> {translations.generate}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {timetable.map((d) => (
          <div key={d.day} className={`bg-white rounded-3xl p-5 border transition-all ${d.isWeekend ? 'border-red-100 bg-red-50/10' : 'border-gray-50'}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-800">{d.day}</span>
                <span className={`text-[12px] font-bold ${d.isWeekend ? 'text-red-500' : 'text-gray-400'}`}>
                  {translations.weekdays[d.dow]}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Sun size={12} className="text-orange-400" /> {translations.am}
                </div>
                <div className="flex flex-col gap-1.5">
                  {d.slot1.length > 0 ? d.slot1.map((n, i) => (
                    <div 
                      key={i} 
                      className={`text-[11px] font-black py-2 px-3 rounded-xl border truncate shadow-sm transition-colors ${getAgentColorClass(n)}`}
                    >
                      {n}
                    </div>
                  )) : <div className="text-[10px] text-gray-300 italic px-1">--</div>}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <Moon size={12} className="text-blue-500" /> {translations.pm}
                </div>
                <div className="flex flex-col gap-1.5">
                  {d.slot2.length > 0 ? d.slot2.map((n, i) => (
                    <div 
                      key={i} 
                      className={`text-[11px] font-black py-2 px-3 rounded-xl border truncate shadow-sm transition-colors ${getAgentColorClass(n)}`}
                    >
                      {n}
                    </div>
                  )) : <div className="text-[10px] text-gray-300 italic px-1">--</div>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
