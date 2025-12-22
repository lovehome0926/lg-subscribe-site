import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar, Download, User, Users, FileText, X, Plus, Trash2, 
  Clock, Sun, Moon, Zap, Lock, LogOut, FilePlus, Bell, Check,
  Sparkles, ChevronRight, Menu, ShieldCheck, MapPin, UserPlus, ClipboardList, Package, ExternalLink,
  Languages, AlertTriangle, Key, UserMinus, ToggleLeft as Toggle, Database, Upload, Globe, Cloud, RefreshCw,
  CheckCircle2, Wifi, WifiOff
} from 'lucide-react';
import { Agent, DayInfo, Tab, UserRole } from './types';
import { AGENT_COLORS, LANGUAGES, LG_MAROON } from './constants';
import { optimizeScheduleWithAI } from './services/geminiService';

const App: React.FC = () => {
  // --- 基礎狀態 ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userCode, setUserCode] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [language, setLanguage] = useState<keyof typeof LANGUAGES>(() => {
    return (localStorage.getItem('lg_pref_lang') as keyof typeof LANGUAGES) || 'zh';
  });
  
  const t = LANGUAGES[language];
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Schedule);
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingAvailability, setIsSettingAvailability] = useState(false);
  
  // --- 同步核心狀態 ---
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSynced, setLastSynced] = useState<string | null>(localStorage.getItem('lg_last_sync'));
  const [syncKey, setSyncKey] = useState(() => localStorage.getItem('lg_sync_key') || '');
  const [remoteBinId, setRemoteBinId] = useState(() => localStorage.getItem('lg_remote_bin_id') || '');
  
  // 關鍵：用來防止自動同步循環的 Ref
  const isInternalUpdate = useRef(false);
  const lastSyncHash = useRef('');

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('lg_agents_supreme_v2');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Agent Alan', code: 'M100200', type: 'FT', colorIdx: 0, unavailable: {} },
      { id: 2, name: 'Agent Bella', code: 'F300400', type: 'PT', colorIdx: 1, unavailable: {} },
    ];
  });

  const [timetable, setTimetable] = useState<DayInfo[]>(() => {
    const saved = localStorage.getItem('lg_timetable_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // --- 同步邏輯實作 ---
  
  // 計算資料指紋，用來判斷資料是否有實質變動
  const getDataHash = (a: Agent[], t: DayInfo[]) => JSON.stringify({ a, t }).length;

  const handleCloudPush = async (silent = false) => {
    if (!syncKey || syncKey.length < 3) return;
    if (!silent) setSyncStatus('syncing');

    try {
      const payload = { agents, timetable, timestamp: new Date().toISOString() };
      let url = 'https://api.jsonbin.io/v3/b';
      let method = 'POST';

      if (remoteBinId) {
        url = `https://api.jsonbin.io/v3/b/${remoteBinId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': '$2a$10$w8T.N0GfW4UvV9fG9Y9U.OqN7m7m7m7m7m7m7m7m7m7m7m7m7m7m7', // 公共 Key 模擬
          'X-Bin-Private': 'false'
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.metadata?.id) {
        setRemoteBinId(result.metadata.id);
        localStorage.setItem('lg_remote_bin_id', result.metadata.id);
      }
      
      const now = new Date().toLocaleTimeString();
      setLastSynced(now);
      localStorage.setItem('lg_last_sync', now);
      setSyncStatus('success');
      lastSyncHash.current = String(getDataHash(agents, timetable));
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (e) {
      setSyncStatus('error');
    }
  };

  const handleCloudPull = async (silent = false) => {
    if (!remoteBinId) return;
    if (!silent) setSyncStatus('syncing');

    try {
      const res = await fetch(`https://api.jsonbin.io/v3/b/${remoteBinId}/latest`, {
        headers: { 'X-Master-Key': '$2a$10$w8T.N0GfW4UvV9fG9Y9U.OqN7m7m7m7m7m7m7m7m7m7m7m7m7m7m7' }
      });
      const result = await res.json();
      const data = result.record;

      if (data && data.agents) {
        const newHash = String(getDataHash(data.agents, data.timetable));
        // 只有在雲端資料真的不一樣時才更新本地狀態
        if (newHash !== lastSyncHash.current) {
          isInternalUpdate.current = true;
          setAgents(data.agents);
          setTimetable(data.timetable);
          lastSyncHash.current = newHash;
          setLastSynced(new Date().toLocaleTimeString());
          if (!silent) setSyncStatus('success');
        } else {
          if (!silent) setSyncStatus('idle');
        }
      }
    } catch (e) {
      setSyncStatus('error');
    }
  };

  // 1. 監聽本地變動 -> 自動上傳 (Debounced)
  useEffect(() => {
    if (!isLoggedIn || !syncKey) return;
    
    // 如果是剛從雲端下載的更新，不要再傳回去
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    const currentHash = String(getDataHash(agents, timetable));
    if (currentHash === lastSyncHash.current) return;

    const timer = setTimeout(() => {
      handleCloudPush(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [agents, timetable, isLoggedIn]);

  // 2. 設定輪詢 (Polling) -> 自動從雲端抓取他人更新
  useEffect(() => {
    if (!isLoggedIn || !remoteBinId) return;

    const interval = setInterval(() => {
      handleCloudPull(true);
    }, 15000); // 每 15 秒檢查一次

    return () => clearInterval(interval);
  }, [isLoggedIn, remoteBinId]);

  // 3. 初始載入
  useEffect(() => {
    if (isLoggedIn && remoteBinId) {
      handleCloudPull();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('lg_agents_supreme_v2', JSON.stringify(agents));
    localStorage.setItem('lg_timetable_v2', JSON.stringify(timetable));
    localStorage.setItem('lg_sync_key', syncKey);
  }, [agents, timetable, syncKey]);

  // --- 登入與業務邏輯 ---
  const handleLogin = async () => {
    setIsLoggingIn(true);
    const val = loginInput.trim().toUpperCase();
    setTimeout(() => {
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
    if (timetable.length === 0) {
      setTimetable(monthInfo.map(info => ({ ...info, slot1: [], slot2: [] })));
    }
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

  const currentUser = agents.find(a => a.code === userCode);

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
              <input 
                type="password" 
                placeholder="Agent Code" 
                className="w-full bg-gray-50 border-none rounded-3xl py-7 px-8 text-center text-2xl font-black tracking-[0.2em] focus:ring-4 focus:ring-[#A50034]/10 transition-all placeholder:tracking-normal placeholder:text-gray-100"
                value={loginInput} 
                onChange={(e) => setLoginInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button 
                onClick={handleLogin} disabled={isLoggingIn}
                className="w-full bg-black text-white py-7 rounded-3xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 hover:bg-[#A50034]"
              >
                {isLoggingIn ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <ChevronRight size={24}/>}
                {t.loginBtn}
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 pb-36 font-sans select-none overflow-x-hidden">
      <header className="bg-white/95 backdrop-blur-3xl border-b sticky top-0 z-50 px-8 py-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl bg-[#A50034]">LG</div>
          <div className="flex flex-col">
             <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-xs uppercase leading-tight text-[#A50034]">{t.title}</span>
                {/* 即時同步指示燈 */}
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : 
                  syncStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                }`} title={syncStatus} />
             </div>
             <span className="text-[10px] font-bold text-gray-400 leading-none mt-1">
               {userRole === 'LSM' ? 'MANAGER' : currentUser?.name} • {syncKey ? 'LIVE SYNC' : 'LOCAL ONLY'}
             </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsLoggedIn(false)} className="bg-gray-50 p-3 rounded-xl text-gray-300 hover:text-red-600 transition-all"><LogOut size={22}/></button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-5 animate-in fade-in duration-500">
        {activeTab === Tab.Schedule && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 font-black text-gray-800 text-lg">
                  <Calendar size={22} className="text-[#A50034]" /> {selectedMonth}
                </div>
                {userRole === 'LSM' && (
                  // Fix: Expression of type 'void' cannot be tested for truthiness on line 299 by using a block statement
                  <button 
                    onClick={async () => {
                      setIsGenerating(true);
                      const res = await optimizeScheduleWithAI(agents, monthInfo);
                      setTimetable(res);
                      setIsGenerating(false);
                    }} 
                    className="text-white px-6 py-3 rounded-[1.5rem] text-[11px] font-black flex items-center gap-2 shadow-xl shadow-[#A50034]/20 bg-[#A50034]"
                  >
                    <Sparkles size={16} fill="currentColor" /> {t.quickGen}
                  </button>
                )}
                {userRole === 'LM' && (
                  <button onClick={() => setIsSettingAvailability(!isSettingAvailability)} className={`px-6 py-3 rounded-[1.5rem] text-[11px] font-black flex items-center gap-2 transition-all ${isSettingAvailability ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}>
                    <Toggle size={16} /> {isSettingAvailability ? t.backBtn : t.personalSettings}
                  </button>
                )}
              </div>
              {isSettingAvailability && (
                <div className="bg-rose-50 p-5 rounded-[2rem] border border-rose-100 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                   <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                   <p className="text-[10px] font-bold text-rose-600">{t.markUnavail}</p>
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
                      <div key={slotNum} className="space-y-4">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                          {slotNum === 1 ? <Sun size={16} className="text-orange-300" /> : <Moon size={16} className="text-indigo-300" />} {t[`slot${slotNum}` as 'slot1' | 'slot2']}
                        </div>
                        <div 
                          onClick={() => isSettingAvailability && toggleAvailability(d.day, slotNum)}
                          className={`flex flex-col gap-2 min-h-[70px] rounded-3xl transition-all p-2 relative overflow-hidden ${isSettingAvailability ? 'cursor-pointer hover:bg-gray-100 bg-gray-50 ring-2 ring-transparent active:ring-[#A50034]' : 'bg-gray-50/50'}`}
                        >
                          {isCurrentUserUnavail && (
                            <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-[1px] flex items-center justify-center z-10 border-2 border-rose-500/30 rounded-3xl">
                              <X size={24} className="text-rose-600" />
                            </div>
                          )}
                          {shifts.length > 0 ? shifts.map((s, i) => (
                            <div key={i} className={`${s.color.bg} ${s.color.text} text-[11px] font-black py-4 px-5 rounded-[1.2rem] shadow-sm truncate`}>{s.name}</div>
                          )) : <div className="text-[9px] text-gray-200 text-center py-5 font-black">VACANT</div>}
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
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-gray-900 px-3">{userRole === 'LSM' ? 'Admin' : 'Profile'}</h2>
            
            <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl space-y-8 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-sky-600 uppercase tracking-widest flex items-center gap-3"><Cloud size={22} /> {t.cloudSync}</h3>
                {syncStatus === 'syncing' && <RefreshCw size={18} className="text-sky-500 animate-spin" />}
              </div>

              <div className="space-y-5">
                 <div className="relative">
                   <input 
                     type="text" 
                     value={syncKey} 
                     onChange={(e) => setSyncKey(e.target.value)}
                     placeholder="Enter Sync Code (e.g. LG-STORE-1)"
                     className="w-full bg-gray-50 border-none rounded-2xl py-6 px-8 font-black text-gray-700 focus:ring-4 focus:ring-sky-50 transition-all placeholder:text-gray-200"
                   />
                   <Key size={20} className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-200" />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleCloudPush()} className="bg-sky-500 text-white p-6 rounded-[2rem] flex flex-col items-center gap-2 active:scale-95 transition-all shadow-xl shadow-sky-100">
                       <Upload size={24} /> <span className="text-[10px] font-black">FORCE PUSH</span>
                    </button>
                    <button onClick={() => handleCloudPull()} className="bg-white text-sky-500 border-2 border-sky-500 p-6 rounded-[2rem] flex flex-col items-center gap-2 active:scale-95">
                       <Download size={24} /> <span className="text-[10px] font-black">FORCE PULL</span>
                    </button>
                 </div>
                 
                 <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[9px] font-black text-gray-300 uppercase tracking-widest">
                    <span>ID: {remoteBinId || 'Not Linked'}</span>
                    <span>Last Sync: {lastSynced || 'Never'}</span>
                 </div>
              </div>
            </div>

            {userRole === 'LSM' && (
              <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3"><Users size={22} /> {t.management}</h3>
                  <button onClick={() => {
                    const name = prompt(t.enterAgentName);
                    const code = prompt(t.enterAgentCode)?.toUpperCase();
                    if(name && code) setAgents([...agents, { id: Date.now(), name, code, type: confirm(t.isPTConfirm) ? 'PT' : 'FT', colorIdx: agents.length % AGENT_COLORS.length, unavailable: {} }]);
                  }} className="p-3 bg-black text-white rounded-xl active:scale-90 transition-all"><Plus size={20} /></button>
                </div>
                <div className="space-y-3">
                   {agents.map(agent => (
                     <div key={agent.id} className="group flex items-center justify-between p-5 bg-gray-50 rounded-[2rem] hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                        <div className="flex items-center gap-4">
                           <div className={`w-3 h-3 rounded-full ${AGENT_COLORS[agent.colorIdx].bg}`} />
                           <div className="flex flex-col">
                              <span className="font-black text-sm text-gray-800 leading-none">{agent.name}</span>
                              <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{agent.code} • {agent.type}</span>
                           </div>
                        </div>
                        <button onClick={() => confirm(t.confirmDeleteAgent) && setAgents(agents.filter(a => a.id !== agent.id))} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-rose-500"><Trash2 size={16}/></button>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-gray-50 flex justify-around items-center px-12 pb-12 pt-6 z-50">
        <button onClick={() => setActiveTab(Tab.Schedule)} className={`flex flex-col items-center gap-2 transition-all ${activeTab === Tab.Schedule ? 'text-[#A50034] scale-110' : 'text-gray-200'}`}>
           <Calendar size={32} strokeWidth={2.5} /> 
           <span className="text-[11px] font-black uppercase tracking-tighter">{t.schedule}</span>
        </button>
        <button onClick={() => setActiveTab(Tab.Management)} className={`flex flex-col items-center gap-2 transition-all ${activeTab === Tab.Management ? 'text-[#A50034] scale-110' : 'text-gray-200'}`}>
           <Users size={32} strokeWidth={2.5} /> 
           <span className="text-[11px] font-black uppercase tracking-tighter">{userRole === 'LSM' ? 'Admin' : 'Profile'}</span>
        </button>
      </footer>

      {isGenerating && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center animate-in fade-in">
           <div className="w-20 h-20 border-4 border-gray-100 border-t-[#A50034] rounded-full animate-spin mb-8" />
           <h2 className="text-2xl font-black text-gray-900">{t.aiThinking}</h2>
        </div>
      )}
    </div>
  );
};

export default App;