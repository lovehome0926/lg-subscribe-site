
import React, { useState, useMemo } from 'react';
import { CalendarDays, Sun, Moon, Plus, AlertCircle, CheckCircle2, UserPlus, X, Trash2 } from 'lucide-react';
import { Translation, Agent, Role, DayInfo } from '../types';

interface AgentManagementProps {
  role: Role;
  translations: Translation;
  agents: Agent[];
  monthInfo: DayInfo[];
  onToggleSlot: (agentId: string, day: number, slot: number) => void;
  onAddAgent?: (agent: Omit<Agent, 'unavailable'>) => void;
  onDeleteAgent?: (agentId: string) => void;
}

export const AgentManagement: React.FC<AgentManagementProps> = ({ role, translations, agents, monthInfo, onToggleSlot, onAddAgent, onDeleteAgent }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'FT' | 'PT'>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newId, setNewId] = useState('');
  const [newType, setNewType] = useState<'FT' | 'PT'>('FT');

  const filteredAgents = useMemo(() => {
    return agents.filter(a => {
      if (filterType === 'ALL') return true;
      return a.type === filterType;
    });
  }, [agents, filterType]);

  const getWeekIndex = (day: number) => {
    const dayInfo = monthInfo.find(m => m.day === day);
    if (!dayInfo) return 0;
    const firstDayDow = monthInfo[0].dow;
    return Math.floor((day + firstDayDow - 1) / 7);
  };

  const checkPTValidity = (agent: Agent) => {
    if (agent.type !== 'PT') return { valid: true, message: '' };

    const weeklyStats: Record<number, { total: number; weekends: number; weekdays: number }> = {};
    
    monthInfo.forEach(m => {
      const week = getWeekIndex(m.day);
      if (!weeklyStats[week]) weeklyStats[week] = { total: 0, weekends: 0, weekdays: 0 };
      
      const unavail = agent.unavailable[m.day] || [];
      const workableCount = 2 - unavail.length;
      
      if (workableCount > 0) {
        weeklyStats[week].total += workableCount;
        if (m.isWeekend) weeklyStats[week].weekends += workableCount;
        else weeklyStats[week].weekdays += workableCount;
      }
    });

    for (const week in weeklyStats) {
      const stats = weeklyStats[week];
      if (stats.total > 2) {
        return { valid: false, message: `Week ${Number(week) + 1}: Max 2 work slots allowed for PT.` };
      }
      if (stats.total > 0 && stats.weekdays === 0 && stats.weekends > 0) {
        return { valid: false, message: `Week ${Number(week) + 1}: Cannot only choose weekend slots.` };
      }
    }

    return { valid: true, message: 'Availability valid' };
  };

  const handleSaveAgent = () => {
    if (!newName || !newId) return;
    if (onAddAgent) {
      onAddAgent({
        id: newId.toUpperCase(),
        name: newName,
        type: newType,
      });
      setIsAdding(false);
      setNewName('');
      setNewId('');
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (onDeleteAgent && window.confirm(`${translations.confirmDelete}\n(${name} - ${id})`)) {
      onDeleteAgent(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xl font-black text-gray-800">
            {role === 'LSM' ? translations.agents : translations.myAvailability}
          </h2>
          {role === 'LSM' && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#A50034] text-white p-2 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2 text-xs font-black"
            >
              <Plus size={16} /> {translations.addAgent}
            </button>
          )}
        </div>
        
        {role === 'LSM' && (
          <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
            {(['ALL', 'FT', 'PT'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-1.5 text-[10px] font-black rounded-xl transition-all ${filterType === type ? 'bg-white shadow-sm text-[#A50034]' : 'text-gray-400'}`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-[2rem] p-6 border-2 border-[#A50034] shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-gray-800 flex items-center gap-2">
              <UserPlus size={18} className="text-[#A50034]" /> {translations.addAgent}
            </h3>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{translations.agentName}</label>
              <input 
                type="text" value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full bg-gray-50 border-0 ring-1 ring-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#A50034]"
                placeholder="E.g. John Doe"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent ID (Mxxxx / Fxxxx)</label>
              <input 
                type="text" value={newId} onChange={e => setNewId(e.target.value)}
                className="w-full bg-gray-50 border-0 ring-1 ring-gray-100 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#A50034]"
                placeholder="E.g. M001234"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{translations.agentType}</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setNewType('FT')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${newType === 'FT' ? 'bg-[#A50034] text-white border-[#A50034] shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                >
                  {translations.ft}
                </button>
                <button 
                  onClick={() => setNewType('PT')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${newType === 'PT' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                >
                  {translations.pt}
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleSaveAgent}
                className="flex-[2] bg-[#A50034] text-white py-3 rounded-xl text-xs font-black shadow-lg active:scale-95 transition-all"
              >
                {translations.saveAgent}
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl text-xs font-black active:scale-95 transition-all"
              >
                {translations.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {filteredAgents.length === 0 && !isAdding && (
        <div className="text-center py-20 text-gray-400 font-bold">{translations.noData}</div>
      )}

      {filteredAgents.map(agent => {
        const { valid, message } = checkPTValidity(agent);
        return (
          <div key={agent.id} className={`bg-white rounded-[2rem] p-6 border transition-all shadow-xl mb-6 ${!valid ? 'border-orange-200' : 'border-gray-100'}`}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4 font-black">
                <div className={`w-12 h-12 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg border-2 border-white shrink-0 ${agent.type === 'FT' ? 'bg-[#A50034]' : 'bg-blue-600'}`}>
                  {agent.name[0]}
                </div>
                <div>
                  <h3 className="text-gray-800 tracking-tight">{agent.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase tracking-widest font-black ${agent.type === 'FT' ? 'text-[#A50034]' : 'text-blue-600'}`}>
                      {agent.type === 'FT' ? translations.ft : translations.pt}
                    </span>
                    <span className="text-[10px] text-gray-300 font-black">ID: {agent.id}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                {role === 'LSM' && (
                  <button 
                    onClick={() => handleDelete(agent.id, agent.name)}
                    className="p-2 text-gray-300 hover:text-red-500 active:scale-90 transition-all"
                    title={translations.deleteAgent}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                {agent.type === 'PT' && (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${valid ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {valid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                    {valid ? 'OK' : 'Limit'}
                  </div>
                )}
              </div>
            </div>

            {!valid && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-2 text-orange-700 text-[10px] font-bold">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-5">
               <p className="text-[11px] font-black text-gray-400 flex items-center gap-2 uppercase tracking-widest px-1">
                 <CalendarDays size={16} className={agent.type === 'FT' ? 'text-[#A50034]' : 'text-blue-600'} /> {translations.unavailable}
               </p>
               <div className="grid grid-cols-4 gap-3">
                 {monthInfo.slice(0, 12).map(({ day, dow, isWeekend }) => {
                   const unavail = agent.unavailable[day] || [];
                   return (
                     <div key={day} className={`rounded-2xl border p-1 transition-all ${isWeekend ? 'bg-red-50/50' : 'bg-gray-50/30'} border-gray-100`}>
                       <div className="text-center text-[10px] font-black py-1 text-gray-400">{day} ({translations.weekdays[dow]})</div>
                       <div className="flex gap-1 mt-1">
                         <button 
                           onClick={() => onToggleSlot(agent.id, day, 1)}
                           className={`flex-1 aspect-square rounded-xl flex items-center justify-center transition-all ${unavail.includes(1) ? (agent.type === 'FT' ? 'bg-[#A50034]' : 'bg-blue-600') + ' text-white shadow-lg' : 'bg-white text-gray-200 border border-gray-100'}`}
                         >
                           <Sun size={12} />
                         </button>
                         <button 
                           onClick={() => onToggleSlot(agent.id, day, 2)}
                           className={`flex-1 aspect-square rounded-xl flex items-center justify-center transition-all ${unavail.includes(2) ? (agent.type === 'FT' ? 'bg-[#E60045]' : 'bg-blue-800') + ' text-white shadow-lg' : 'bg-white text-gray-200 border border-gray-100'}`}
                         >
                           <Moon size={12} />
                         </button>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
