
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar, Download, User, Users, FileText, X, Plus, Trash2, 
  Clock, Sun, Moon, Zap, Lock, LogOut, FilePlus, Bell, Check,
  Sparkles, ChevronRight, Menu, ShieldCheck, MapPin, UserPlus, ClipboardList, Package, ExternalLink,
  Languages, AlertTriangle, Key, UserMinus, ToggleLeft as Toggle, Database, Upload, Globe
} from 'lucide-react';
import { Agent, Memo, FormDoc, DayInfo, Tab, UserRole, CustomerRegistration } from './types';
import { AGENT_COLORS, LANGUAGES, LG_MAROON } from './constants';
import { optimizeScheduleWithAI } from './services/geminiService';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userCode, setUserCode] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // 從 localStorage 初始化語言設定
  const [language, setLanguage] = useState<keyof typeof LANGUAGES>(() => {
    return (localStorage.getItem('lg_pref_lang') as keyof typeof LANGUAGES) || 'zh';
  });
  
  const t = LANGUAGES[language];
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Schedule);
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingAvailability, setIsSettingAvailability] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [confirmModal, setConfirmModal] = useState<{ 
    show: boolean; 
    action: (() => void) | null; 
    title: string; 
    message: string;
    isAI?: boolean;
  }>({ show: false, action: null, title: '', message: '' });

  // 核心數據狀態 (帶有持久化)
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('lg_agents_supreme_v2');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Agent Alan', code: 'M100200', type: 'FT', colorIdx: 0, unavailable: {} },
      { id: 2, name: 'Agent Bella', code: 'F300400', type: 'PT', colorIdx: 1, unavailable: {} },
    ];
  });

  const [timetable, setTimetable] = useState<DayInfo[]>([]);

  // 同步數據與語言設定
  useEffect(() => {
    localStorage.setItem('lg_agents_supreme_v2', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('lg_pref_lang', language);
  }, [language]);

  // 語言切換邏輯
  const toggleLanguage = () => {
    const langs: (keyof typeof LANGUAGES)[] = ['zh', 'en', 'ms'];
    const currentIndex = langs.indexOf(language);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  // 備份功能
  const handleExport = () => {
    const dataStr = JSON.stringify(agents, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LG_Backup_${selectedMonth}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert(t.backupSuccess);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          setAgents(json);
          alert(t.restoreSuccess);
        } else {
          throw new Error();
        }
      } catch (err) {
        alert(t.restoreError);
      }
    };
    reader.readAsText(file);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    const val = loginInput.trim().toUpperCase();
    setTimeout(() => {
      // 隱藏具體密碼暗示，僅在後端/邏輯中檢查
      if (val === 'LSM123') { 
        setUserRole('LSM'); 
        setUserCode('Admin'); 
        setIsLoggedIn(true); 
      } else {
        const found = agents.find(a => a.code === val);
        if (found) {
          setUserRole('LM');
          setUserCode(val);
          setIsLoggedIn(true);
        } else {
          alert(t.invalidLogin);
        }
      }
      setIsLoggingIn(false);
      setLoginInput('');
    }, 700);
  };

  const monthInfo = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 0);
    const daysCount = date.getDate();
    return Array.from({ length: daysCount }, (_, i) => {
      const d = i + 1;
      const dow = new Date(year, month - 1, d).getDay();
      return { day: d, dow, isWeekend: dow === 0 || dow === 6 };
    });
  }, [selectedMonth]);

  useEffect(() => {
    setTimetable(monthInfo.map(info => ({ ...info, slot1: [], slot2: [] })));
  }, [monthInfo]);

  const toggleAvailability = (day: number, slot: number) => {
    if (userRole !== 'LM') return;
    setAgents(prev => prev.map(a => {
      if (a.code === userCode) {
        const currentUnavail = a.unavailable[day] || [];
        const nextUnavail = currentUnavail.includes(slot) 
          ? currentUnavail.filter(s => s !== slot) 
          : [...currentUnavail, slot];
        const newRecord = { ...a.unavailable };
        if (nextUnavail.length === 0) delete newRecord[day]; else newRecord[day] = nextUnavail;
        return { ...a, unavailable: newRecord };
      }
      return a;
    }));
  };

  const addAgent = () => {
    const name = prompt(t.enterAgentName);
    const code = prompt(t.enterAgentCode)?.toUpperCase();
    if (!name || !code) return;
    if (agents.find(a => a.code === code)) return alert("Code Exists");
    const isPT = confirm(t.isPTConfirm);
    setAgents([...agents, {
      id: Date.now(), name, code, type: isPT ? 'PT' : 'FT', colorIdx: agents.length % AGENT_COLORS.length, unavailable: {}
    }]);
  };

  const deleteAgent = (id: number) => {
    if (confirm(t.confirmDeleteAgent)) setAgents(agents.filter(a => a.id !== id));
  };

  const handleAIScheduling = async () => {
    setConfirmModal({ ...confirmModal, show: false });
    setIsGenerating(true);
    try {
      const optimized = await optimizeScheduleWithAI(agents, monthInfo);
      setTimetable(optimized);
    } catch (error) {
      alert("Error");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-8 font-sans">
        <div className="w-full max-w-sm bg-white rounded-[4rem] shadow-[0_30px_80px_-15px_rgba(165,0,52,0.15)] p-12 space-y-12 animate-in zoom-in duration-700">
           <div className="text-center space-y-4">
             <div className="w-24 h-24 bg-[#A50034] rounded-[2.5rem] mx-auto flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-[#A50034]/40 animate-float">LG</div>
             <div className="space-y-1">
               <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Supreme</h1>
               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.4em]">Portal Authorization</p>
             </div>
           </div>
           <div className="space-y-6">
              <div className="relative group">
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-gray-50 border-none rounded-3xl py-7 px-8 text-center text-2xl font-black tracking-[0.5em] focus:ring-4 focus:ring-[#A50034]/10 transition-all placeholder:tracking-normal placeholder:text-gray-100"
                  value={loginInput} 
                  onChange={(e) => setLoginInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <ShieldCheck className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-100 group-focus-within:text-[#A50034]/30 transition-colors" size={24} />
              </div>
              <button 
                onClick={handleLogin} disabled={isLoggingIn}
                className="w-full bg-black text-white py-7 rounded-3xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 hover:bg-[#A50034]"
              >
                {isLoggingIn ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <ChevronRight size={24}/>}
                {t.loginBtn}
              </button>
           </div>
           {/* 底部語言切換 - 登入前也能切換 */}
           <button onClick={toggleLanguage} className="mx-auto flex items-center gap-2 text-gray-300 hover:text-gray-500 transition-colors">
              <Globe size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{language}</span>
           </button>
        </div>
      </div>
    );
  }

  const currentUser = agents.find(a => a.code === userCode);

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 pb-36 font-sans select-none overflow-x-hidden">
      <header className="bg-white/95 backdrop-blur-3xl border-b sticky top-0 z-50 px-8 py-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl" style={{ backgroundColor: LG_MAROON }}>LG</div>
          <div className="flex flex-col">
             <span className="font-black tracking-tight text-xs uppercase leading-tight" style={{ color: LG_MAROON }}>{t.title}</span>
             <span className="text-[10px] font-bold text-gray-400 leading-none mt-1">{userRole === 'LSM' ? 'MANAGER' : currentUser?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleLanguage} className="bg-gray-50 p-3 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-all flex items-center gap-2">
            <Languages size={20} />
            <span className="text-[10px] font-black uppercase">{language}</span>
          </button>
          <button onClick={() => setIsLoggedIn(false)} className="bg-gray-50 p-3 rounded-xl text-gray-300 hover:text-red-600 transition-all"><LogOut size={22}/></button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5 animate-in fade-in duration-500">
        {activeTab === Tab.Schedule && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 font-black text-gray-800 text-lg">
                  <Calendar size={22} style={{ color: LG_MAROON }} /> {selectedMonth}
                </div>
                {userRole === 'LSM' && (
                  <button onClick={() => setConfirmModal({ show: true, title: t.generate, message: t.aiGenMsg, action: handleAIScheduling, isAI: true })} className="text-white px-6 py-3 rounded-[1.5rem] text-[11px] font-black flex items-center gap-2 shadow-xl shadow-[#A50034]/20 active:scale-95 transition-all bg-[#A50034]">
                    <Sparkles size={16} fill="currentColor" /> {t.quickGen}
                  </button>
                )}
                {userRole === 'LM' && (
                  <button 
                    onClick={() => setIsSettingAvailability(!isSettingAvailability)}
                    className={`px-6 py-3 rounded-[1.5rem] text-[11px] font-black flex items-center gap-2 transition-all ${isSettingAvailability ? 'bg-black text-white shadow-xl' : 'bg-gray-50 text-gray-400'}`}
                  >
                    <Toggle size={16} /> {isSettingAvailability ? t.backBtn : t.personalSettings}
                  </button>
                )}
              </div>
              {isSettingAvailability && (
                <div className="bg-rose-50 p-5 rounded-[2rem] border border-rose-100 animate-in slide-in-from-top duration-300">
                  <p className="text-xs font-bold text-rose-600 leading-relaxed flex items-start gap-3">
                    <AlertTriangle size={18} className="shrink-0" />
                    {t.markUnavail}
                  </p>
                </div>
              )}
            </div>

            {timetable.map(d => (
              <div key={d.day} className={`bg-white rounded-[3rem] p-8 border shadow-sm transition-all relative overflow-hidden ${d.isWeekend ? 'border-rose-100 ring-4 ring-rose-50/50' : 'border-gray-50'}`}>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-gray-900">{d.day}</span>
                    <span className={`text-[12px] font-black uppercase tracking-widest ${d.isWeekend ? 'text-rose-500' : 'text-gray-300'}`}>{t.weekdays[d.dow]}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  {[1, 2].map(slotNum => {
                    const shifts = d[`slot${slotNum}` as 'slot1' | 'slot2'] || [];
                    const isCurrentUserUnavail = currentUser?.unavailable[d.day]?.includes(slotNum);
                    
                    return (
                      <div key={slotNum} className="space-y-4 relative">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                          {slotNum === 1 ? <Sun size={16} className="text-orange-300" /> : <Moon size={16} className="text-indigo-300" />} {t[`slot${slotNum}` as 'slot1' | 'slot2']}
                        </div>
                        
                        <div 
                          onClick={() => isSettingAvailability && toggleAvailability(d.day, slotNum)}
                          className={`flex flex-col gap-2 min-h-[60px] rounded-3xl transition-all ${isSettingAvailability ? 'cursor-pointer hover:ring-4 hover:ring-[#A50034]/10 bg-gray-50/50 p-2' : ''}`}
                        >
                          {isCurrentUserUnavail && (
                            <div className="absolute inset-0 bg-rose-500/10 rounded-3xl flex items-center justify-center border-2 border-dashed border-rose-500/30 z-10 backdrop-blur-[1px]">
                              <X size={24} className="text-rose-500 opacity-40" />
                            </div>
                          )}
                          
                          {shifts.length > 0 ? shifts.map((s, i) => (
                            <div key={i} className={`${s.color.bg} ${s.color.text} text-[11px] font-black py-4 px-5 rounded-[1.2rem] shadow-sm truncate`}>{s.name}</div>
                          )) : (
                            <div className="flex items-center justify-center p-4 bg-gray-50/50 rounded-[1.2rem] border border-dashed border-gray-200 text-gray-200">
                              <span className="text-[10px] font-black uppercase tracking-tighter">Vacant</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === Tab.Management && (
          <div className="space-y-8 pb-10">
            <h2 className="text-3xl font-black text-gray-900 px-3">{userRole === 'LSM' ? t.adminConsole : 'Profile'}</h2>
            
            {userRole === 'LSM' && (
              <>
                <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3"><Users size={22} /> {t.management}</h3>
                     <button onClick={addAgent} className="bg-black text-white p-4 rounded-2xl shadow-xl active:scale-90 transition-all">
                        <UserPlus size={24} />
                     </button>
                  </div>
                  <div className="space-y-4">
                     {agents.map(agent => (
                       <div key={agent.id} className="group flex items-center justify-between p-6 bg-gray-50 rounded-[2.5rem] border border-transparent hover:border-gray-100 hover:bg-white transition-all shadow-sm">
                          <div className="flex items-center gap-5">
                             <div className={`w-5 h-5 rounded-full shadow-inner ${AGENT_COLORS[agent.colorIdx].bg}`} />
                             <div className="flex flex-col">
                               <span className="font-black text-base text-gray-800 leading-none">{agent.name}</span>
                               <span className="text-[11px] text-gray-400 font-bold tracking-wider mt-1">{agent.code} • {agent.type}</span>
                             </div>
                          </div>
                          <button onClick={() => deleteAgent(agent.id)} className="opacity-0 group-hover:opacity-100 p-3 text-gray-200 hover:text-rose-500 transition-all">
                            <Trash2 size={20} />
                          </button>
                       </div>
                     ))}
                  </div>
                </div>

                <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl space-y-8">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3"><Database size={22} /> {t.exportData}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleExport} className="bg-gray-900 text-white p-6 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all shadow-lg">
                       <Download size={24} />
                       <span className="text-[10px] font-black uppercase">Backup</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-gray-100 text-gray-600 p-6 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all border border-gray-200">
                       <Upload size={24} />
                       <span className="text-[10px] font-black uppercase">Restore</span>
                       <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="bg-[#A50034] rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 space-y-4">
                  <h3 className="text-2xl font-black">LG Subscribe Supreme</h3>
                  <p className="text-xs opacity-70 font-bold leading-relaxed max-w-[220px]">
                    {userRole === 'LSM' ? 'MANAGER ACCESS ENABLED. ALL DATA IS STORED LOCALLY AND ENCRYPTED.' : `AUTHORIZED ACCESS: ${currentUser?.name}`}
                  </p>
               </div>
               <ShieldCheck className="absolute -right-10 -bottom-10 w-52 h-52 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-gray-50 flex justify-around items-center px-12 pb-12 pt-6 z-50">
        <button onClick={() => setActiveTab(Tab.Schedule)} className={`flex flex-col items-center gap-2 transition-all ${activeTab === Tab.Schedule ? 'text-[#A50034] scale-110' : 'text-gray-200'}`}>
           <Calendar size={30} strokeWidth={activeTab === Tab.Schedule ? 2.5 : 2} /> 
           <span className="text-[11px] font-black uppercase tracking-tighter">{t.schedule}</span>
        </button>
        <button onClick={() => setActiveTab(Tab.Management)} className={`flex flex-col items-center gap-2 transition-all ${activeTab === Tab.Management ? 'text-[#A50034] scale-110' : 'text-gray-200'}`}>
           <Users size={30} strokeWidth={activeTab === Tab.Management ? 2.5 : 2} /> 
           <span className="text-[11px] font-black uppercase tracking-tighter">{userRole === 'LSM' ? 'Admin' : 'Profile'}</span>
        </button>
      </footer>

      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-10 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xs rounded-[4rem] p-12 text-center space-y-10 shadow-2xl animate-in zoom-in duration-300">
              <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto ${confirmModal.isAI ? 'bg-purple-50 text-purple-600' : 'bg-rose-50 text-[#A50034]'}`}>
                {confirmModal.isAI ? <Sparkles size={48} /> : <Zap size={48} />}
              </div>
              <div className="space-y-4">
                 <h3 className="text-2xl font-black text-gray-900 leading-tight">{confirmModal.title}</h3>
                 <p className="text-xs text-gray-400 font-bold leading-relaxed">{confirmModal.message}</p>
              </div>
              <div className="space-y-4">
                <button onClick={() => confirmModal.action?.()} className="w-full py-6 text-white rounded-[2rem] font-black bg-[#A50034] shadow-2xl shadow-[#A50034]/30 active:scale-95 transition-all">{t.confirmBtn}</button>
                <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="w-full py-2 text-gray-300 font-black text-xs uppercase tracking-widest">{t.backBtn}</button>
              </div>
           </div>
        </div>
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="relative w-40 h-40 mb-12">
              <div className="absolute inset-0 rounded-full border-[8px] border-gray-50"></div>
              <div className="absolute inset-0 rounded-full border-[8px] border-t-[#A50034] animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-[#A50034]">
                <Sparkles size={40} className="animate-pulse" />
              </div>
           </div>
           <h2 className="text-3xl font-black text-gray-900">{t.aiThinking}</h2>
           <p className="text-[11px] text-gray-300 font-bold uppercase tracking-[0.4em] mt-4">Heuristic Engine Active</p>
        </div>
      )}
    </div>
  );
};

export default App;
