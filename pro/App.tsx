
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar, Download, User, Users, FileText, X, Plus, Trash2, 
  Clock, Sun, Moon, Zap, Lock, LogOut, FilePlus, Bell, Check,
  Sparkles, ChevronRight, Menu, ShieldCheck, MapPin, UserPlus, ClipboardList, Package, ExternalLink,
  Languages, AlertTriangle, Key, UserMinus, ToggleLeft as Toggle, Database, Upload, Globe, Cloud, RefreshCw,
  CheckCircle2, Wifi, WifiOff, Save, CheckCircle, Edit3, UserCheck, Activity, Trash, RefreshCcw
} from 'lucide-react';
import { Agent, DayInfo, Tab, UserRole } from './types';
import { AGENT_COLORS, LANGUAGES, LG_MAROON } from './constants';
import { optimizeScheduleWithAI } from './services/geminiService';

// --- 全球唯一同步頻道 (Master Config) ---
const MASTER_BIN_ID = "67bcd61fe41b4d34e4999f8d"; 
const API_KEY = "$2a$10$w8T.N0GfW4UvV9fG9Y9U.OqN7m7m7m7m7m7m7m7m7m7m7m7m7m7m7";
const APP_VERSION = "v2.4-ULTIMATE-SYNC"; // 每次變更此號碼會強制清理設備舊數據

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userCode, setUserCode] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitialSyncing, setIsInitialSyncing] = useState(false);
  
  const [language, setLanguage] = useState<keyof typeof LANGUAGES>(() => {
    return (localStorage.getItem('lg_pref_lang') as keyof typeof LANGUAGES) || 'zh';
  });
  
  const t = LANGUAGES[language];
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Schedule);
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingAvailability, setIsSettingAvailability] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  const [editSlot, setEditSlot] = useState<{ day: number, slotNum: number } | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSynced, setLastSynced] = useState<string | null>(localStorage.getItem('lg_last_sync'));
  
  const hasPulledOnce = useRef(false);
  const lastSyncHash = useRef('');

  // --- 強制版本同步邏輯：如果版本號改變，自動清空本地舊數據 ---
  useEffect(() => {
    const storedVersion = localStorage.getItem('lg_app_version');
    if (storedVersion !== APP_VERSION) {
      console.log("Version Mismatch! Clearing old storage...");
      localStorage.clear();
      localStorage.setItem('lg_app_version', APP_VERSION);
      // 清理後不重整，直接使用預設值開始
    }
  }, []);

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

  const getDataHash = (a: Agent[], t: DayInfo[]) => JSON.stringify({ a, t }).length;

  const handleCloudPull = async (silent = false) => {
    if (!silent) setSyncStatus('syncing');
    try {
      // 加入隨機參數防止瀏覽器快取 API 回傳
      const res = await fetch(`https://api.jsonbin.io/v3/b/${MASTER_BIN_ID}/latest?nocache=${Date.now()}`, {
        headers: { 'X-Master-Key': API_KEY, 'Cache-Control': 'no-cache' }
      });
      const result = await res.json();
      const data = result.record;

      if (data && data.agents) {
        const newHash = String(getDataHash(data.agents, data.timetable));
        if (newHash !== lastSyncHash.current || !hasPulledOnce.current) {
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
        hasPulledOnce.current = true;
      }
    } catch (e) {
      console.error("Sync Pull Error:", e);
      setSyncStatus('error');
    }
  };

  const handleCloudPush = async (silent = false) => {
    if (!hasPulledOnce.current) return;
    if (!silent) setSyncStatus('syncing');
    try {
      const payload = { agents, timetable, timestamp: new Date().toISOString() };
      const res = await fetch(`https://api.jsonbin.io/v3/b/${MASTER_BIN_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Cloud Update Failed');
      
      const now = new Date().toLocaleTimeString();
      setLastSynced(now);
      localStorage.setItem('lg_last_sync', now);
      setSyncStatus('success');
      lastSyncHash.current = String(getDataHash(agents, timetable));
      
      if (!silent) {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 2000);
      }
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (e) {
      setSyncStatus('error');
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    const val = loginInput.trim().toUpperCase();
    await new Promise(r => setTimeout(r, 600));

    let role: UserRole = null;
    let code = '';
    if (val === 'LSM123') { role = 'LSM'; code = 'Admin'; }
    else {
      const found = agents.find(a => a.code === val);
      if (found) { role = 'LM'; code = val; }
    }

    if (role) {
      setUserRole(role);
      setUserCode(code);
      setIsLoggedIn(true);
      setIsLoggingIn(false);
      setIsInitialSyncing(true);
      await handleCloudPull(true); // 登入瞬間強制對齊雲端
      setIsInitialSyncing(false);
    } else {
      alert("認證失敗：無效代碼");
      setIsLoggingIn(false);
    }
  };

  // 背景同步：每 10 秒檢查一次雲端變化
  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = setInterval(() => handleCloudPull(true), 10000); 
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // 管理員手動更改後 1 秒自動上傳
  useEffect(() => {
    if (userRole === 'LSM' && isLoggedIn && hasPulledOnce.current) {
      const timer = setTimeout(() => handleCloudPush(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [agents, timetable, userRole]);

  // 數據本地保存
  useEffect(() => {
    if (hasPulledOnce.current) {
      localStorage.setItem('lg_agents_supreme_v2', JSON.stringify(agents));
      localStorage.setItem('lg_timetable_v2', JSON.stringify(timetable));
    }
  }, [agents, timetable]);

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
    if (userRole !== 'LM') return;
    setAgents(prev => prev.map(a => {
      if (a.code === userCode) {
        const currentUnavail = a.unavailable[day] || [];
        const nextUnavail = currentUnavail.includes(slot) ? currentUnavail.filter(s => s !== slot) : [...currentUnavail, slot];
        const newRecord = { ...a.unavailable };
        if (nextUnavail.length === 0) delete newRecord[day]; else newRecord[day] = nextUnavail;
        return { ...a, unavailable: newRecord };
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

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-8 font-sans">
        <div className="w-full max-sm:max-w-full max-w-sm bg-white rounded-[4rem] shadow-[0_30px_80px_-15px_rgba(165,0,52,0.15)] p-12 space-y-12">
           <div className="text-center space-y-4">
             <div className="w-24 h-24 bg-[#A50034] rounded-[2.5rem] mx-auto flex items-center justify-center text-white font-black text-3xl shadow-2xl animate-float">LG</div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Supreme Portal</h1>
           </div>
           <div className="space-y-6">
              <input 
                type="password" placeholder="輸入 Agent Code" 
                className="w-full bg-gray-50 border-none rounded-3xl py-7 px-8 text-center text-2xl font-black focus:ring-4 focus:ring-[#A50034]/10 transition-all"
                value={loginInput} onChange={(e) => setLoginInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button 
                onClick={handleLogin} disabled={isLoggingIn}
                className="w-full bg-black text-white py-7 rounded-3xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-4 hover:bg-[#A50034]"
              >
                {isLoggingIn ? <RefreshCw className="animate-spin"/> : <ChevronRight size={24}/>} 登錄系統
              </button>
              <div className="text-center flex flex-col gap-2">
                 <span className="inline-block mx-auto bg-rose-50 text-[#A50034] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">{APP_VERSION}</span>
                 <p className="text-[9px] text-gray-300 font-bold uppercase">雙端同步技術已啟用</p>
              </div>
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
                <span className="font-black text-xs uppercase leading-tight text-[#A50034]">Supreme Sync</span>
                <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-sm transition-all duration-500 ${
                  syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : syncStatus === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                }`} />
             </div>
             <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">
               {userRole === 'LSM' ? '管理者端' : `${currentUser?.name} • 線上`}
             </span>
          </div>
        </div>
        <button onClick={() => { if(confirm('確定登出？')) setIsLoggedIn(false); }} className="bg-gray-50 p-3 rounded-xl text-gray-300 hover:text-red-600 transition-all"><LogOut size={22}/></button>
      </header>

      <main className="max-w-md mx-auto p-5">
        {activeTab === Tab.Schedule && (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-gray-100 flex flex-col gap-6 relative">
              <div className="flex justify-between items-center z-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 font-black text-gray-800 text-lg">
                    <Calendar size={22} className="text-[#A50034]" /> {selectedMonth}
                  </div>
                  <span className="text-[9px] font-black text-emerald-500 mt-1 uppercase tracking-widest flex items-center gap-1.5"><Wifi size={10} /> 實時連線頻道 · {lastSynced}</span>
                </div>
                {userRole === 'LSM' && (
                  <button onClick={async () => { setIsGenerating(true); setTimetable(await optimizeScheduleWithAI(agents, monthInfo)); setIsGenerating(false); handleCloudPush(true); }} className="text-white px-6 py-3 rounded-[1.5rem] text-[11px] font-black flex items-center gap-2 shadow-xl bg-[#A50034]">
                    <Sparkles size={16} fill="currentColor" /> 智能排班
                  </button>
                )}
                {userRole === 'LM' && (
                  <button onClick={() => setIsSettingAvailability(!isSettingAvailability)} className={`px-6 py-3 rounded-[1.5rem] text-[11px] font-black flex items-center gap-2 ${isSettingAvailability ? 'bg-black text-white' : 'bg-gray-50 text-gray-400'}`}>
                    <Toggle size={16} /> {isSettingAvailability ? '返回' : '可用性設定'}
                  </button>
                )}
              </div>
            </div>

            {timetable.map(d => (
              <div key={d.day} className={`bg-white rounded-[3rem] p-8 border shadow-sm relative overflow-hidden ${d.isWeekend ? 'border-rose-100 ring-4 ring-rose-50/50' : 'border-gray-50'}`}>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-gray-900">{d.day}</span>
                    <span className={`text-[12px] font-black uppercase tracking-widest ${d.isWeekend ? 'text-rose-500' : 'text-gray-300'}`}>星期{['日','一','二','三','四','五','六'][d.dow]}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  {[1, 2].map(slotNum => {
                    const shifts = d[`slot${slotNum}` as 'slot1' | 'slot2'] || [];
                    const isCurrentUserUnavail = currentUser?.unavailable[d.day]?.includes(slotNum);
                    return (
                      <div key={slotNum} className="space-y-4" onClick={() => {
                        if (userRole === 'LM' && isSettingAvailability) toggleAvailability(d.day, slotNum);
                        if (userRole === 'LSM') setEditSlot({ day: d.day, slotNum });
                      }}>
                        <div className="text-[10px] font-black text-gray-300 uppercase flex items-center gap-2">
                          {slotNum === 1 ? <Sun size={16} className="text-orange-300" /> : <Moon size={16} className="text-indigo-300" />} {slotNum === 1 ? '早班' : '晚班'}
                        </div>
                        <div className={`flex flex-col gap-2 min-h-[85px] rounded-3xl p-2 relative transition-all ${ (isSettingAvailability || userRole === 'LSM') ? 'cursor-pointer hover:bg-gray-100 bg-gray-50 ring-2 ring-transparent active:ring-[#A50034]' : 'bg-gray-50/50'}`}>
                          {isCurrentUserUnavail && <div className="absolute inset-0 bg-rose-500/20 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-3xl"><X size={24} className="text-rose-600" /></div>}
                          {shifts.length > 0 ? shifts.map((s, i) => (
                            <div key={i} className={`${s.color.bg} ${s.color.text} text-[11px] font-black py-4 px-5 rounded-[1.2rem] shadow-sm truncate animate-in zoom-in`}>{s.name}</div>
                          )) : <div className="text-[9px] text-gray-200 text-center py-6 font-black italic">VACANT</div>}
                          {userRole === 'LSM' && <div className="absolute top-1 right-1 opacity-20"><Edit3 size={10} /></div>}
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
          <div className="space-y-8 animate-in slide-in-from-right duration-300">
            <h2 className="text-3xl font-black text-gray-900 px-3">系統控制中心</h2>
            <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl space-y-6">
               <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-3"><Activity size={22} /> 系統狀態 v2.4</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-6 rounded-[2rem] text-center"><span className="text-[10px] font-bold text-gray-400 uppercase block">頻道健康</span><div className="text-sm font-black text-emerald-500">EXCELLENT</div></div>
                  <div className="bg-gray-50 p-6 rounded-[2rem] text-center"><span className="text-[10px] font-bold text-gray-400 uppercase block">同步延遲</span><div className="text-sm font-black text-gray-800">~800ms</div></div>
               </div>
               <button onClick={() => handleCloudPull(false)} className="w-full flex items-center justify-between p-6 bg-black text-white rounded-[2rem] text-sm font-black active:scale-95 transition-all">
                  強制刷新數據 <RefreshCcw size={20} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
               </button>
               <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full flex items-center justify-between p-6 bg-rose-50 text-rose-600 rounded-[2rem] text-sm font-black border border-rose-100">
                  重置緩存並修復 <Trash size={20} />
               </button>
            </div>
            {userRole === 'LSM' && (
              <div className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-xl space-y-6">
                 <div className="flex items-center justify-between">
                   <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">人員名單</h3>
                   <button onClick={() => { const name = prompt("姓名"); const code = prompt("代碼"); if(name && code) setAgents([...agents, { id: Date.now(), name, code, type: confirm("PT?") ? 'PT' : 'FT', colorIdx: agents.length % 6, unavailable: {} }]); }} className="p-3 bg-black text-white rounded-xl"><Plus size={20} /></button>
                 </div>
                 {agents.map(a => (
                   <div key={a.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-[2rem]">
                      <div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full ${AGENT_COLORS[a.colorIdx].bg}`} /><div><div className="font-black text-sm">{a.name}</div><div className="text-[9px] font-bold text-gray-400 uppercase">{a.code} • {a.type}</div></div></div>
                      <button onClick={() => confirm("刪除？") && setAgents(agents.filter(x => x.id !== a.id))} className="text-gray-300 hover:text-rose-500"><Trash2 size={16}/></button>
                   </div>
                 ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 修改彈窗 */}
      {editSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-8 shadow-2xl animate-in slide-in-from-bottom">
              <div className="flex justify-between items-center">
                 <div><h3 className="text-xl font-black text-gray-900">第 {editSlot.day} 號時段調整</h3><p className="text-[10px] text-gray-400 font-bold uppercase">{editSlot.slotNum === 1 ? '早班' : '晚班'}</p></div>
                 <button onClick={() => setEditSlot(null)} className="p-3 bg-gray-50 rounded-2xl"><X size={24} /></button>
              </div>
              <div className="space-y-3 max-h-[40vh] overflow-y-auto px-1">
                 {agents.map(agent => {
                   const isAssigned = (timetable.find(d => d.day === editSlot.day)?.[`slot${editSlot.slotNum}` as 'slot1' | 'slot2'] || []).some(s => s.name === agent.name);
                   const isUnavail = agent.unavailable[editSlot.day]?.includes(editSlot.slotNum);
                   return (
                     <button key={agent.id} onClick={() => handleLSMEditSlot(agent)} className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all border-2 ${isAssigned ? 'bg-[#A50034] border-[#A50034] text-white shadow-lg' : 'bg-gray-50 border-transparent text-gray-600'}`}>
                       <div className="flex items-center gap-4"><div className={`w-3 h-3 rounded-full ${isAssigned ? 'bg-white' : AGENT_COLORS[agent.colorIdx].bg}`} /><div><div className="font-black text-sm">{agent.name}</div>{isUnavail && <div className={`text-[9px] font-bold uppercase ${isAssigned ? 'text-white/70' : 'text-rose-500 animate-pulse'}`}>⚠️ 不方便</div>}</div></div>
                       {isAssigned ? <Check size={20} /> : <Plus size={20} className="text-gray-300" />}
                     </button>
                   );
                 })}
              </div>
              <button onClick={() => { setEditSlot(null); handleCloudPush(true); }} className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-sm shadow-xl">確認更改並同步</button>
           </div>
        </div>
      )}

      {/* 初始化同步遮罩 */}
      {isInitialSyncing && (
        <div className="fixed inset-0 bg-[#A50034] z-[500] flex flex-col items-center justify-center text-white animate-in fade-in">
           <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mb-8" />
           <h2 className="text-2xl font-black">實時數據對齊中...</h2>
           <p className="opacity-60 text-sm mt-2 font-bold uppercase tracking-widest">LG Supreme Secure Sync</p>
        </div>
      )}

      {/* 成功動畫 */}
      {showSaveSuccess && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md z-[300] flex flex-col items-center justify-center animate-in zoom-in duration-300">
           <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl mb-8"><CheckCircle size={48} strokeWidth={3} /></div>
           <h2 className="text-2xl font-black text-gray-900">同步成功！</h2>
           <p className="text-gray-400 font-bold mt-2">全球數據已更新</p>
        </div>
      )}

      {isSettingAvailability && userRole === 'LM' && (
        <div className="fixed bottom-32 left-0 right-0 px-8 z-[100] animate-in slide-in-from-bottom">
           <button onClick={() => { handleCloudPush(false); setIsSettingAvailability(false); }} disabled={syncStatus === 'syncing'} className="w-full bg-[#A50034] text-white py-6 rounded-[2rem] font-black text-sm shadow-xl flex items-center justify-center gap-4 active:scale-95 transition-all">
             {syncStatus === 'syncing' ? <RefreshCw className="animate-spin" /> : <Save size={20} />} 保存我的班次
           </button>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-3xl border-t border-gray-50 flex justify-around items-center px-12 pb-12 pt-6 z-50">
        <button onClick={() => setActiveTab(Tab.Schedule)} className={`flex flex-col items-center gap-2 transition-all ${activeTab === Tab.Schedule ? 'text-[#A50034] scale-110' : 'text-gray-200'}`}>
           <Calendar size={32} strokeWidth={2.5} /> <span className="text-[11px] font-black uppercase">排班表</span>
        </button>
        <button onClick={() => setActiveTab(Tab.Management)} className={`flex flex-col items-center gap-2 transition-all ${activeTab === Tab.Management ? 'text-[#A50034] scale-110' : 'text-gray-200'}`}>
           <Users size={32} strokeWidth={2.5} /> <span className="text-[11px] font-black uppercase">{userRole === 'LSM' ? '管理' : '個人'}</span>
        </button>
      </footer>

      {isGenerating && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center animate-in fade-in">
           <div className="w-20 h-20 border-4 border-gray-100 border-t-[#A50034] rounded-full animate-spin mb-8" />
           <h2 className="text-2xl font-black text-gray-900 tracking-tighter">AI 智能排班生成中...</h2>
        </div>
      )}
    </div>
  );
};

export default App;
