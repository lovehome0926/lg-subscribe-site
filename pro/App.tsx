
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar, Download, User, Users, FileText, X, Plus, Trash2, 
  Clock, Sun, Moon, Zap, Lock, LogOut, FilePlus, Bell, Check,
  Sparkles, ChevronRight, Menu, ShieldCheck, MapPin, UserPlus, ClipboardList, Package, ExternalLink,
  Languages, AlertTriangle, Key, UserMinus, ToggleLeft as Toggle, Database, Upload, Globe, Cloud, RefreshCw,
  CheckCircle2, Wifi, WifiOff, Save, CheckCircle
} from 'lucide-react';
import { Agent, DayInfo, Tab, UserRole } from './types';
import { AGENT_COLORS, LANGUAGES, LG_MAROON } from './constants';
import { optimizeScheduleWithAI } from './services/geminiService';

const DEFAULT_SYNC_KEY = "LG_SUPREME_GLOBAL_CHANNEL_V1";

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
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  // --- 同步核心狀態 (全自動) ---
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSynced, setLastSynced] = useState<string | null>(localStorage.getItem('lg_last_sync'));
  const [remoteBinId, setRemoteBinId] = useState(() => localStorage.getItem('lg_remote_bin_id') || '');
  
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

  // --- 自動同步邏輯 ---
  const getDataHash = (a: Agent[], t: DayInfo[]) => JSON.stringify({ a, t }).length;

  const handleCloudPush = async (silent = false) => {
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
          'X-Master-Key': '$2a$10$w8T.N0GfW4UvV9fG9Y9U.OqN7m7m7m7m7m7m7m7m7m7m7m7m7m7m7',
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
      
      if (!silent) {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2500);
      }
      
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
        if (newHash !== lastSyncHash.current) {
          isInternalUpdate.current = true;
          setAgents(data.agents);
          setTimetable(data.timetable);
          lastSyncHash.current = newHash;
          const now = new Date().toLocaleTimeString();
          setLastSynced(now);
          localStorage.setItem('lg_last_sync', now);
          if (!silent) setSyncStatus('success');
        } else {
          if (!silent) setSyncStatus('idle');
        }
      }
    } catch (e) {
      setSyncStatus('error');
    }
  };

  // 背景自動同步 (每 10 秒檢查一次雲端)
  useEffect(() => {
    if (!isLoggedIn || !remoteBinId) return;
    const interval = setInterval(() => {
      handleCloudPull(true);
    }, 10000); 
    return () => clearInterval(interval);
  }, [isLoggedIn, remoteBinId]);

  // 管理員專屬：每當 AI 生成或修改人員時，自動備份到雲端
  useEffect(() => {
    if (userRole === 'LSM' && isLoggedIn) {
      const timer = setTimeout(() => {
        handleCloudPush(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [agents, timetable, userRole]);

  // 初始載入時連線雲端
  useEffect(() => {
    if (isLoggedIn && remoteBinId) handleCloudPull();
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('lg_agents_supreme_v2', JSON.stringify(agents));
    localStorage.setItem('lg_timetable_v2', JSON.stringify(timetable));
  }, [agents, timetable]);

  // --- 業務邏輯 ---
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
        <div className="w-full max-sm:max-w-full max-w-sm bg-white rounded-[4rem] shadow-[0_30px_80px_-15px_rgba(165,0,52,0.15)] p-12 space-y-12 animate-in zoom-in duration-700">
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
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 pb-48 font-sans select-none overflow-x-hidden">
      <header className="bg-white/95 backdrop-blur-3xl border-b sticky top-0 z-50 px-8 py-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-xl bg-[#A50034]">LG</div>
          <div className="flex flex-col">
             <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-xs uppercase leading-tight text-[#A50034]">{t.title}</span>
                <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-sm transition-colors duration-500 ${
                  syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : 
                  syncStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                }`} />
             </div>
             <span className="text-[10px] font-bold text-gray-400 leading-none mt-1 uppercase tracking-tighter">
               {userRole === 'LSM' ? 'Manager Console' : `${currentUser?.name} • 線上同步中`}
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
            <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col gap-6 relative overflow-hidden">
              <div className="flex justify-between items-center z-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 font-black text-gray-800 text-lg">
                    <Calendar size={22} className="text-[#A50034]" /> {selectedMonth}
                  </div>
                  {lastSynced && <span className="text-[9px] font-black text-emerald-500 mt-1 uppercase tracking-widest flex items-center gap-1.5"><Wifi size={10} /> 已連線 · {lastSynced}</span>}
                </div>
                {userRole === 'LSM' && (
                  <button 
                    onClick={async () => {
                      setIsGenerating(true);
                      const res = await optimizeScheduleWithAI(agents, monthInfo);
                      setTimetable(res);
                      setIsGenerating(false);
                      // AI 生成後自動保存到雲端
                      handleCloudPush(true);
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
                   <p className="text-[10px] font-bold text-rose-600">請點選你「不可以」上班的時間，系統會自動避開。</p>
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
            <h2 className="text-3xl font-black text-gray-900 px-3">{userRole === 'LSM' ? '管理控制台' : '我的帳戶'}</h2>
            
            <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3"><Users size={22} /> 人員名單</h3>
                  {userRole === 'LSM' && (
                    <button onClick={() => {
                      const name = prompt(t.enterAgentName);
                      const code = prompt(t.enterAgentCode)?.toUpperCase();
                      if(name && code) setAgents([...agents, { id: Date.now(), name, code, type: confirm(t.isPTConfirm) ? 'PT' : 'FT', colorIdx: agents.length % AGENT_COLORS.length, unavailable: {} }]);
                    }} className="p-3 bg-black text-white rounded-xl active:scale-90 transition-all"><Plus size={20} /></button>
                  )}
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
                        {userRole === 'LSM' && (
                          <button onClick={() => confirm(t.confirmDeleteAgent) && setAgents(agents.filter(a => a.id !== agent.id))} className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-rose-500"><Trash2 size={16}/></button>
                        )}
                     </div>
                   ))}
                </div>
            </div>

            <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl space-y-6">
               <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3"><Database size={22} /> 數據工具</h3>
               <button onClick={() => {
                 const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({agents, timetable}));
                 const downloadAnchorNode = document.createElement('a');
                 downloadAnchorNode.setAttribute("href", dataStr);
                 downloadAnchorNode.setAttribute("download", `lg_backup_${new Date().toLocaleDateString()}.json`);
                 document.body.appendChild(downloadAnchorNode);
                 downloadAnchorNode.click();
                 downloadAnchorNode.remove();
               }} className="w-full flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] text-sm font-black text-gray-700 hover:bg-gray-100 transition-all">
                  匯出備份資料 <Download size={20} />
               </button>
            </div>
          </div>
        )}
      </main>

      {/* 代理專用：保存並同步按鈕 */}
      {isSettingAvailability && userRole === 'LM' && (
        <div className="fixed bottom-32 left-0 right-0 px-8 z-[100] animate-in slide-in-from-bottom duration-500">
           <button 
             onClick={() => {
               handleCloudPush(false);
               setIsSettingAvailability(false);
             }}
             disabled={syncStatus === 'syncing'}
             className="w-full bg-[#A50034] text-white py-6 rounded-[2rem] font-black text-sm shadow-[0_20px_40px_rgba(165,0,52,0.3)] flex items-center justify-center gap-4 active:scale-95 transition-all"
           >
             {syncStatus === 'syncing' ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
             保存並同步排班資料
           </button>
        </div>
      )}

      {/* 成功動畫 */}
      {showSaveSuccess && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[300] flex flex-col items-center justify-center animate-in zoom-in duration-300">
           <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 mb-8">
              <CheckCircle size={48} strokeWidth={3} />
           </div>
           <h2 className="text-2xl font-black text-gray-900">同步成功！</h2>
           <p className="text-gray-400 font-bold mt-2">主管現在可以看到你的最新狀態了</p>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-gray-50 flex justify-around items-center px-12 pb-12 pt-6 z-50">
        <button onClick={() => setActiveTab(Tab.Schedule)} className={`flex flex-col items-center gap-2 transition-all ${activeTab === Tab.Schedule ? 'text-[#A50034] scale-110' : 'text-gray-200'}`}>
           <Calendar size={32} strokeWidth={2.5} /> 
           <span className="text-[11px] font-black uppercase tracking-tighter">{t.schedule}</span>
        </button>
        <button onClick={() => setActiveTab(Tab.Management)} className={`flex flex-col items-center gap-2 transition-all ${activeTab === Tab.Management ? 'text-[#A50034] scale-110' : 'text-gray-200'}`}>
           <Users size={32} strokeWidth={2.5} /> 
           <span className="text-[11px] font-black uppercase tracking-tighter">{userRole === 'LSM' ? '管理' : '個人'}</span>
        </button>
      </footer>

      {isGenerating && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center animate-in fade-in">
           <div className="w-20 h-20 border-4 border-gray-100 border-t-[#A50034] rounded-full animate-spin mb-8" />
           <h2 className="text-2xl font-black text-gray-900">正在智能優化排班...</h2>
        </div>
      )}
    </div>
  );
};

export default App;
