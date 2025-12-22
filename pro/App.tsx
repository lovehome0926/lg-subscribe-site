
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar, Users, X, Plus, Trash2, Sun, Moon, LogOut, Check,
  Sparkles, ChevronRight, RefreshCw,
  Save, CheckCircle, Bell, Send, UserPlus, Info
} from 'lucide-react';
import { Agent, DayInfo, Tab, UserRole, CloudData } from './types';
import { AGENT_COLORS, LANGUAGES } from './constants';
import { optimizeScheduleWithAI } from './services/geminiService';

// --- 安全配置 (請將下方更換為您的實際金鑰) ---
const MASTER_BIN_ID = "67bcd61fe41b4d34e4999f8d"; 
const API_KEY = "$2a$10$w8T.N0GfW4UvV9fG9Y9U.OqN7m7m7m7m7m7m7m7m7m7m7m7m7m7m7";
const APP_VERSION = "v3.4-SECURE-STABLE";

const App: React.FC = () => {
  const [language, setLanguage] = useState<keyof typeof LANGUAGES>(() => {
    return (localStorage.getItem('lg_lang_choice') as any) || 'zh';
  });
  
  const t = LANGUAGES[language];

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userCode, setUserCode] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Schedule);
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [isFinalized, setIsFinalized] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [timetable, setTimetable] = useState<DayInfo[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [editSlot, setEditSlot] = useState<{ day: number, slotNum: number } | null>(null);

  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerCode, setNewPartnerCode] = useState('');
  const [newPartnerType, setNewPartnerType] = useState<'FT' | 'PT'>('FT');

  useEffect(() => {
    localStorage.setItem('lg_lang_choice', language);
  }, [language]);

  const fetchCloudData = async (showAlert = true) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${MASTER_BIN_ID}/latest?nocache=${Date.now()}`, {
        headers: { 'X-Master-Key': API_KEY }
      });
      if (!res.ok) throw new Error("API Error");
      const result = await res.json();
      const data = result.record as CloudData;

      if (data && data.agents) {
        setAgents(data.agents);
        setTimetable(data.timetable);
        setIsFinalized(data.isFinalized);
        setSelectedMonth(data.selectedMonth);
        return true;
      }
    } catch (e) {
      if (showAlert) alert(t.syncError);
    } finally {
      setIsSyncing(false);
    }
    return false;
  };

  const pushCloudData = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const payload: CloudData = { 
        agents, 
        timetable, 
        isFinalized, 
        selectedMonth, 
        lastUpdated: new Date().toISOString() 
      };
      await fetch(`https://api.jsonbin.io/v3/b/${MASTER_BIN_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
        body: JSON.stringify(payload)
      });
      if (!silent) {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
      }
    } catch (e) {
      alert(t.syncError);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogin = async () => {
    const val = loginInput.trim().toUpperCase();
    if (!val) return;

    setIsLoggingIn(true);
    
    if (val === 'LSM123') {
      await fetchCloudData(false);
      setUserRole('LSM');
      setUserCode('Admin');
      setIsLoggedIn(true);
      setIsLoggingIn(false);
      return;
    }

    const success = await fetchCloudData(true);
    if (!success) {
      setIsLoggingIn(false);
      return;
    }

    const found = agents.find(a => a.code === val);
    if (found) {
      setUserRole('LM');
      setUserCode(val);
      setIsLoggedIn(true);
    } else {
      alert(t.invalidLogin);
    }
    setIsLoggingIn(false);
  };

  const handleAddAgent = () => {
    if (!newPartnerName || !newPartnerCode) return alert(t.fillAllInfo);
    
    const newAgent: Agent = {
      id: Date.now(),
      name: newPartnerName,
      code: newPartnerCode.toUpperCase(),
      type: newPartnerType,
      colorIdx: agents.length % AGENT_COLORS.length,
      unavailable: {},
      hasSubmitted: false
    };

    setAgents([...agents, newAgent]);
    setNewPartnerName('');
    setNewPartnerCode('');
    setShowAddPartner(false);
    alert(t.partnerAdded);
  };

  const handleDeleteAgent = (id: number) => {
    if (confirm(t.confirmDeleteAgent)) {
      setAgents(agents.filter(a => a.id !== id));
    }
  };

  const resetAllSubmissionStatus = () => {
    if (confirm(t.resetConfirm)) {
      setAgents(agents.map(a => ({ ...a, hasSubmitted: false })));
      alert(t.syncDone);
    }
  };

  const handlePartnerSubmit = () => {
    setAgents(prev => prev.map(a => {
      if (a.code === userCode) return { ...a, hasSubmitted: true };
      return a;
    }));
    pushCloudData();
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

  const toggleAvailability = (day: number, slot: number) => {
    if (isFinalized && userRole === 'LM') return;
    setAgents(prev => prev.map(a => {
      if (a.code === userCode) {
        const currentUnavail = a.unavailable[day] || [];
        const nextUnavail = currentUnavail.includes(slot) ? currentUnavail.filter(s => s !== slot) : [...currentUnavail, slot];
        const newRecord = { ...a.unavailable };
        if (nextUnavail.length === 0) delete newRecord[day]; else newRecord[day] = nextUnavail;
        return { ...a, unavailable: newRecord, hasSubmitted: false };
      }
      return a;
    }));
  };

  const handleLSMEditSlot = (agent: Agent) => {
    if (!editSlot) return;
    const { day, slotNum } = editSlot;
    const slotKey = `slot${slotNum}` as 'slot1' | 'slot2';
    setTimetable(prev => prev.map(d => {
      if (d.day === day) {
        const currentShifts = d[slotKey] || [];
        const isAlreadyIn = currentShifts.some(s => s.name === agent.name);
        let newShifts = isAlreadyIn ? currentShifts.filter(s => s.name !== agent.name) : [...currentShifts, { name: agent.name, color: AGENT_COLORS[agent.colorIdx] }];
        return { ...d, [slotKey]: newShifts };
      }
      return d;
    }));
  };

  const currentUser = agents.find(a => a.code === userCode);

  const LanguageSelector = () => (
    <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
      {(['zh', 'en', 'ms'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
            language === lang ? 'bg-white text-[#A50034] shadow-sm' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-8 font-sans">
        <div className="w-full max-w-sm bg-white rounded-[4rem] shadow-2xl p-12 space-y-12 animate-in zoom-in">
           <div className="text-center space-y-4">
             <div className="w-24 h-24 bg-[#A50034] rounded-[2.5rem] mx-auto flex items-center justify-center text-white font-black text-3xl shadow-2xl animate-float">LG</div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{t.partnerPortal}</h1>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.supremeSystem}</p>
           </div>
           
           <div className="flex justify-center items-center gap-4">
              <LanguageSelector />
           </div>

           <div className="space-y-6">
              <input 
                type="password" placeholder={t.syncPlaceholder}
                className="w-full bg-gray-50 border-none rounded-3xl py-7 px-8 text-center text-2xl font-black focus:ring-4 focus:ring-[#A50034]/10 transition-all placeholder:text-gray-200"
                value={loginInput} onChange={(e) => setLoginInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button onClick={handleLogin} disabled={isLoggingIn} className="w-full bg-black text-white py-7 rounded-3xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-4 hover:bg-[#A50034]">
                {isLoggingIn ? <RefreshCw className="animate-spin"/> : <ChevronRight size={24}/>} {t.loginBtn}
              </button>
              <div className="text-center"><span className="text-[10px] font-black text-gray-300 uppercase">{APP_VERSION}</span></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 pb-48 font-sans select-none overflow-x-hidden">
      <header className="bg-white/95 backdrop-blur-3xl border-b sticky top-0 z-50 px-8 py-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg bg-[#A50034]">LG</div>
          <div className="flex flex-col">
             <div className="flex items-center gap-2">
                <span className="font-black text-xs uppercase text-[#A50034]">Supreme Sync</span>
                <div className={`w-2.5 h-2.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
             </div>
             <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
               {userRole === 'LSM' ? t.adminConsole : `${currentUser?.name} • ${isFinalized ? t.statusFinalized : t.statusDraft}`}
             </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button onClick={() => confirm(t.logoutConfirm) && setIsLoggedIn(false)} className="text-gray-300"><LogOut size={22}/></button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5 space-y-6">
        {activeTab === Tab.Schedule && (
          <>
            {!isFinalized && userRole === 'LM' && (
              <div className={`p-6 rounded-[2.5rem] flex items-center gap-5 transition-all ${currentUser?.hasSubmitted ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100 animate-bounce'}`}>
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${currentUser?.hasSubmitted ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    {currentUser?.hasSubmitted ? <Check /> : <Calendar />}
                 </div>
                 <div>
                    <h3 className={`font-black leading-tight ${currentUser?.hasSubmitted ? 'text-emerald-900' : 'text-amber-900'}`}>{currentUser?.hasSubmitted ? t.submittedStatus : t.pleaseFillAvail}</h3>
                    <p className={`text-[10px] font-bold uppercase mt-1 ${currentUser?.hasSubmitted ? 'text-emerald-600' : 'text-amber-600'}`}>{t.waitingSupreme}</p>
                 </div>
              </div>
            )}

            {isFinalized && userRole === 'LM' && (
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] flex items-center gap-5">
                 <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white"><CheckCircle /></div>
                 <div>
                    <h3 className="font-black text-emerald-900 leading-tight">{t.finalizedMsg}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase mt-1">{t.finalizedSub}</p>
                 </div>
              </div>
            )}

            {userRole === 'LSM' && (
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="font-black text-lg">{t.supremeConsole}</h2>
                    <button onClick={() => fetchCloudData()} className="p-3 bg-gray-50 rounded-xl text-gray-400 active:rotate-180 transition-all"><RefreshCw size={18}/></button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={async () => { setIsGenerating(true); setTimetable(await optimizeScheduleWithAI(agents, monthInfo)); setIsGenerating(false); }} className="bg-black text-white p-5 rounded-3xl font-black text-xs flex flex-col items-center gap-2">
                       <Sparkles size={20} /> {t.generate}
                    </button>
                    <button onClick={() => { setIsFinalized(!isFinalized); }} className={`p-5 rounded-3xl font-black text-xs flex flex-col items-center gap-2 ${isFinalized ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                       {isFinalized ? <X size={20} /> : <Bell size={20} />}
                       {isFinalized ? t.retract : t.publish}
                    </button>
                 </div>
                 <button onClick={() => pushCloudData()} className="w-full bg-[#A50034] text-white py-5 rounded-3xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all">
                    <Send size={18} /> {t.pushToAll}
                 </button>
              </div>
            )}

            <div className="space-y-4">
              {timetable.length > 0 ? timetable.map(d => (
                <div key={d.day} className={`bg-white rounded-[3rem] p-8 border ${d.isWeekend ? 'border-rose-100 shadow-rose-100/50' : 'border-gray-100'} shadow-sm`}>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-3xl font-black">{d.day}</span>
                    <span className="text-xs font-black text-gray-300 uppercase tracking-widest">{t.weekdays[d.dow]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2].map(slotNum => {
                      const shifts = d[`slot${slotNum}` as 'slot1' | 'slot2'] || [];
                      const isUnavail = currentUser?.unavailable[d.day]?.includes(slotNum);
                      return (
                        <div key={slotNum} className="space-y-3">
                          <div className="text-[10px] font-black text-gray-300 flex items-center gap-1 uppercase">
                            {slotNum === 1 ? <Sun size={14} className="text-orange-400" /> : <Moon size={14} className="text-indigo-400" />} {slotNum === 1 ? t.slot1 : t.slot2}
                          </div>
                          <div 
                            onClick={() => {
                              if (userRole === 'LSM') setEditSlot({ day: d.day, slotNum });
                              else toggleAvailability(d.day, slotNum);
                            }}
                            className={`min-h-[80px] rounded-[2rem] p-2 relative transition-all ${(!isFinalized || userRole === 'LSM') ? 'cursor-pointer hover:ring-2 ring-[#A50034]/10 bg-gray-50' : 'bg-gray-50/50'}`}
                          >
                            {isUnavail && <div className="absolute inset-0 bg-rose-500/20 rounded-[2rem] flex items-center justify-center z-10 animate-in fade-in"><X size={20} className="text-rose-600" /></div>}
                            {shifts.map((s, i) => (
                              <div key={i} className={`${s.color.bg} ${s.color.text} text-[10px] font-black p-3 rounded-2xl mb-1 truncate shadow-sm animate-in zoom-in`}>{s.name}</div>
                            ))}
                            {shifts.length === 0 && <div className="h-full flex items-center justify-center text-[9px] font-black text-gray-200 italic">{t.vacant}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-gray-50 rounded-[4rem] border-2 border-dashed border-gray-100">
                   <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
                   <p className="text-gray-300 font-bold">{t.waitingSupreme}</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === Tab.Management && (
          <div className="space-y-6 animate-in slide-in-from-right">
             {userRole === 'LSM' ? (
               <div className="bg-white rounded-[3rem] p-8 space-y-8 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center">
                    <h2 className="font-black text-xl">{t.partnerList}</h2>
                    <div className="flex gap-2">
                       <button onClick={resetAllSubmissionStatus} className="p-3 bg-gray-50 rounded-xl text-gray-400" title={t.resetStatus}><RefreshCw size={18}/></button>
                       <button onClick={() => setShowAddPartner(true)} className="p-3 bg-black text-white rounded-xl"><UserPlus size={18}/></button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {agents.map(a => (
                      <div key={a.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem]">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xs ${AGENT_COLORS[a.colorIdx].bg}`}>
                             {a.name.charAt(0)}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-black text-sm">{a.name} ({a.type})</span>
                              <span className="text-[10px] font-bold text-gray-400">{a.code}</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1 ${a.hasSubmitted ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                              {a.hasSubmitted ? <Check size={10}/> : <Info size={10}/>}
                              {a.hasSubmitted ? t.submittedStatus : t.pendingStatus}
                           </div>
                           <button onClick={() => handleDeleteAgent(a.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </div>
                    ))}
                    {agents.length === 0 && <div className="text-center py-10 text-gray-300 font-bold uppercase text-[10px]">{t.noLeads}</div>}
                  </div>
               </div>
             ) : (
               <div className="bg-white rounded-[3rem] p-10 space-y-6 text-center border border-gray-100">
                  <div className={`w-20 h-20 rounded-[2rem] mx-auto flex items-center justify-center text-white text-3xl font-black ${AGENT_COLORS[currentUser?.colorIdx || 0].bg}`}>
                    {currentUser?.name.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-black">{currentUser?.name}</h2>
                  <div className="flex justify-center gap-2">
                     <span className="px-4 py-2 bg-gray-100 rounded-full text-xs font-black uppercase text-gray-500">{currentUser?.type}</span>
                     <span className="px-4 py-2 bg-[#A50034]/10 rounded-full text-xs font-black uppercase text-[#A50034]">{currentUser?.code}</span>
                  </div>
                  <div className="pt-6 border-t border-gray-50 text-left">
                     <h3 className="font-black text-xs uppercase text-gray-300 mb-4">{t.personalSettings}</h3>
                     <div className="p-6 bg-gray-50 rounded-[2rem] flex items-center justify-between">
                        <span className="font-bold text-sm">{t.status}</span>
                        <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase ${currentUser?.hasSubmitted ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white animate-pulse'}`}>
                           {currentUser?.hasSubmitted ? t.submittedStatus : t.pendingStatus}
                        </div>
                     </div>
                  </div>
               </div>
             )}

             <div className="bg-white rounded-[3rem] p-10 border border-gray-100">
                <h3 className="font-black text-xs uppercase text-gray-300 mb-6">{t.management}</h3>
                <div className="grid grid-cols-2 gap-4">
                   <button onClick={() => pushCloudData()} className="p-6 bg-gray-50 rounded-[2rem] flex flex-col items-center gap-3 font-black text-xs hover:bg-gray-100 transition-colors">
                      <Save size={20} className="text-[#A50034]"/> {t.exportData}
                   </button>
                   <button onClick={() => fetchCloudData()} className="p-6 bg-gray-50 rounded-[2rem] flex flex-col items-center gap-3 font-black text-xs hover:bg-gray-100 transition-colors">
                      <RefreshCw size={20} className="text-sky-500"/> {t.importData}
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* 底部按鈕 */}
      {activeTab === Tab.Schedule && !isFinalized && userRole === 'LM' && (
        <div className="fixed bottom-32 left-0 right-0 px-8 flex flex-col gap-3">
           <button 
             onClick={handlePartnerSubmit} 
             className={`w-full py-6 rounded-[2rem] font-black shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all ${currentUser?.hasSubmitted ? 'bg-emerald-500 text-white' : 'bg-[#A50034] text-white'}`}
           >
             {currentUser?.hasSubmitted ? <CheckCircle size={20}/> : <Save size={20}/>} 
             {t.saveMyTime}
           </button>
        </div>
      )}

      {showSaveSuccess && (
        <div className="fixed inset-0 bg-white/90 z-[300] flex flex-col items-center justify-center animate-in zoom-in">
           <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl mb-6"><CheckCircle size={48} /></div>
           <h2 className="text-2xl font-black">{t.syncDone}</h2>
           <p className="text-gray-400 font-bold mt-2">{t.syncDoneMsg}</p>
        </div>
      )}
      
      {isGenerating && (
        <div className="fixed inset-0 bg-white/95 z-[200] flex flex-col items-center justify-center">
           <div className="w-20 h-20 border-4 border-gray-100 border-t-[#A50034] rounded-full animate-spin mb-8" />
           <h2 className="text-2xl font-black">{t.supremeThinking}</h2>
        </div>
      )}

      {showAddPartner && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[250] flex items-center justify-center p-8">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-8 shadow-2xl animate-in zoom-in">
              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black">{t.addPartner}</h3>
                 <button onClick={() => setShowAddPartner(false)}><X/></button>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black text-gray-300 uppercase mb-2 block">{t.partnerName}</label>
                    <input value={newPartnerName} onChange={e => setNewPartnerName(e.target.value)} className="w-full bg-gray-50 rounded-2xl p-4 font-bold border-none" placeholder="Ex: Cindy" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-gray-300 uppercase mb-2 block">{t.partnerCode}</label>
                    <input value={newPartnerCode} onChange={e => setNewPartnerCode(e.target.value)} className="w-full bg-gray-50 rounded-2xl p-4 font-bold border-none uppercase" placeholder="Ex: LM999" />
                 </div>
                 <div className="flex bg-gray-50 p-1 rounded-2xl">
                    <button onClick={() => setNewPartnerType('FT')} className={`flex-1 py-3 rounded-xl text-xs font-black ${newPartnerType === 'FT' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Full-Time</button>
                    <button onClick={() => setNewPartnerType('PT')} className={`flex-1 py-3 rounded-xl text-xs font-black ${newPartnerType === 'PT' ? 'bg-white shadow-sm' : 'text-gray-400'}`}>Part-Time</button>
                 </div>
              </div>
              <button onClick={handleAddAgent} className="w-full bg-black text-white py-5 rounded-[2rem] font-black">{t.confirmBtn}</button>
           </div>
        </div>
      )}

      {editSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-8 shadow-2xl animate-in slide-in-from-bottom">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-xl font-black text-gray-900">{t.confirmTitle} - {editSlot.day}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{editSlot.slotNum === 1 ? t.slot1 : t.slot2}</p>
                 </div>
                 <button onClick={() => setEditSlot(null)} className="p-3 bg-gray-50 rounded-2xl"><X size={24} /></button>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto px-1">
                 {agents.map(agent => {
                   const dayData = timetable.find(d => d.day === editSlot.day);
                   const isAssigned = (dayData?.[`slot${editSlot.slotNum}` as 'slot1' | 'slot2'] || []).some(s => s.name === agent.name);
                   const isUnavail = agent.unavailable[editSlot.day]?.includes(editSlot.slotNum);
                   return (
                     <button key={agent.id} onClick={() => handleLSMEditSlot(agent)} className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all border-2 ${isAssigned ? 'bg-[#A50034] border-[#A50034] text-white shadow-lg' : 'bg-gray-50 border-transparent text-gray-600'}`}>
                       <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${isAssigned ? 'bg-white' : AGENT_COLORS[agent.colorIdx].bg}`} />
                          <div className="flex flex-col items-start text-left">
                             <span className="font-black text-sm">{agent.name}</span>
                             {isUnavail && <span className={`text-[9px] font-bold uppercase ${isAssigned ? 'text-white/70' : 'text-rose-500 animate-pulse'}`}>⚠️ {t.markUnavail}</span>}
                          </div>
                       </div>
                       {isAssigned ? <Check size={20} /> : <Plus size={20} className="text-gray-300" />}
                     </button>
                   );
                 })}
              </div>
              <button onClick={() => { setEditSlot(null); pushCloudData(true); }} className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-sm shadow-xl">{t.confirmBtn}</button>
           </div>
        </div>
      )}

      {isSyncing && !isLoggedIn && (
        <div className="fixed inset-0 bg-[#A50034] z-[500] flex flex-col items-center justify-center text-white animate-in fade-in">
           <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mb-8" />
           <h2 className="text-2xl font-black">{t.syncingCloud}</h2>
           <p className="opacity-60 text-sm mt-2 font-bold uppercase tracking-widest">{t.syncingCloudSub}</p>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-gray-50 flex justify-around items-center px-12 pb-12 pt-6 z-50">
        <button onClick={() => setActiveTab(Tab.Schedule)} className={`flex flex-col items-center gap-2 transition-all ${activeTab === Tab.Schedule ? 'text-[#A50034] scale-110' : 'text-gray-200'}`}>
           <Calendar size={32} strokeWidth={2.5} /> <span className="text-[11px] font-black uppercase tracking-tighter">{t.schedule}</span>
        </button>
        <button onClick={() => setActiveTab(Tab.Management)} className={`flex flex-col items-center gap-2 transition-all ${activeTab === Tab.Management ? 'text-[#A50034] scale-110' : 'text-gray-200'}`}>
           <Users size={32} strokeWidth={2.5} /> <span className="text-[11px] font-black uppercase tracking-tighter">{userRole === 'LSM' ? t.management : t.personalSettings}</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
