
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Calendar, Download, User, Users, FileText, X, Plus, Trash2, 
  Clock, Sun, Moon, Zap, Lock, LogOut, FilePlus, Bell, Check,
  Sparkles, ChevronRight, Menu, ShieldCheck, MapPin, UserPlus, ClipboardList, Package, ExternalLink,
  Languages, AlertTriangle
} from 'lucide-react';
import { Agent, Memo, FormDoc, DayInfo, Tab, UserRole, CustomerRegistration } from './types';
import { AGENT_COLORS, LANGUAGES, LG_MAROON } from './constants';
import { optimizeScheduleWithAI } from './services/geminiService';

const COMMON_PRODUCTS = ["WashTower", "Styler", "CordZero", "Water Purifier", "Air Purifier", "Refrigerator", "Dishwasher", "Dryer"];
const FUZZY_DATES = ["這幾天", "本週末", "下週內", "下週末", "本月底", "下個月初"];

const App: React.FC = () => {
  // --- Auth State ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userCode, setUserCode] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- Localization State ---
  const [language, setLanguage] = useState<keyof typeof LANGUAGES>('zh');
  const t = LANGUAGES[language];

  // --- App State ---
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Schedule);
  const [selectedMonth, setSelectedMonth] = useState('2026-01');
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ 
    show: boolean; 
    action: (() => void) | null; 
    title: string; 
    message: string;
    isAI?: boolean;
  }>({ show: false, action: null, title: '', message: '' });

  // --- Leads State ---
  const [registrations, setRegistrations] = useState<CustomerRegistration[]>([
    { id: 1, agentName: 'Agent Alan', agentCode: 'M100200', customerName: 'Mr. Tan', customerInfo: '8812', productInterest: 'WashTower / V10', location: 'Lotus PR', expectedDate: '本週末', timestamp: '2025-12-01 10:30', status: 'Pending' },
    { id: 2, agentName: 'Agent Bella', agentCode: 'F300400', customerName: 'Ms. Lee', customerInfo: '0921', productInterest: 'Refrigerator (Double Door)', location: 'Brandshop Batu Pahat', expectedDate: '這幾天', timestamp: '2025-12-02 14:15', status: 'Pending' },
  ]);

  // --- Registration Form State ---
  const [newLead, setNewLead] = useState({
    customerName: '',
    customerInfo: '',
    productInterest: '',
    location: 'Lotus PR' as 'Lotus PR' | 'Brandshop Batu Pahat',
    expectedDate: ''
  });

  // --- Data States ---
  const [memos, setMemos] = useState<Memo[]>([
    { id: 1, title: '2025 十二月業績獎勵方案', content: '年度最強促銷正式啟動，請各位代理留意庫存。', date: '2025-11-25', isNew: true },
    { id: 2, title: '關於 WashTower 安裝高度的特別提醒', content: '安裝高度不宜超過 1.8m，以免影響用戶體驗。', date: '2025-11-20', isNew: false },
  ]);
  const [forms, setForms] = useState<FormDoc[]>([
    { id: 101, title: 'LM 代理入職申請表 (最新)', size: '1.2MB', url: '#' },
    { id: 102, title: 'Subscribe 續約/取消申請單', size: '0.9MB', url: '#' },
  ]);
  const [agents, setAgents] = useState<Agent[]>([
    { id: 1, name: 'Agent Alan', code: 'M100200', type: 'FT', colorIdx: 0, unavailable: { 2: [1] } },
    { id: 2, name: 'Agent Bella', code: 'F300400', type: 'PT', colorIdx: 1, unavailable: { 1: [1, 2] } },
    { id: 3, name: 'Agent Chris', code: 'M500600', type: 'FT', colorIdx: 2, unavailable: { 5: [2] } },
  ]);
  const [timetable, setTimetable] = useState<DayInfo[]>([]);

  // --- Auth Logic ---
  const handleLogin = async () => {
    setIsLoggingIn(true);
    const val = loginInput.trim().toUpperCase();
    
    // Simulate Login
    setTimeout(() => {
      if (val === 'LSM123') {
        setUserRole('LSM'); setUserCode('Admin'); setIsLoggedIn(true);
      } else if (/^[MF]\d{6}$/.test(val)) {
        setUserRole('LM'); setUserCode(val); setIsLoggedIn(true);
      } else {
        alert(t.invalidLogin);
      }
      setIsLoggingIn(false);
    }, 800);
  };

  // --- Lead Protection Logic ---
  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.customerName || !newLead.customerInfo || !newLead.expectedDate) {
      alert(t.fillAllInfo);
      return;
    }

    const currentAgent = agents.find(a => a.code === userCode) || { name: userRole === 'LSM' ? 'LSM Admin' : 'Agent', code: userCode };

    const reg: CustomerRegistration = {
      id: Date.now(),
      agentName: currentAgent.name,
      agentCode: currentAgent.code,
      customerName: newLead.customerName,
      customerInfo: newLead.customerInfo,
      productInterest: newLead.productInterest || 'N/A',
      location: newLead.location,
      expectedDate: newLead.expectedDate,
      timestamp: new Date().toLocaleString(language === 'zh' ? 'zh-TW' : language === 'en' ? 'en-US' : 'ms-MY', { hour12: false }),
      status: 'Pending'
    };

    setRegistrations([reg, ...registrations]);
    setNewLead({ customerName: '', customerInfo: '', productInterest: '', location: 'Lotus PR', expectedDate: '' });
    alert(t.leadSubmitted);
  };

  const deleteLead = (id: number) => {
    if (confirm(t.confirmDeleteLead)) {
      setRegistrations(registrations.filter(r => r.id !== id));
    }
  };

  // --- Schedule Logic ---
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

  const performBasicAutoGenerate = () => {
    let newTable: DayInfo[] = monthInfo.map(info => ({ ...info, slot1: [], slot2: [] }));
    
    // Sort agents to rotate start positions slightly for fairness
    const rotatedAgents = [...agents];

    newTable.forEach((day, index) => {
      // Rotate the agent list each day to distribute workload
      const offset = index % rotatedAgents.length;
      const dailyAgents = [...rotatedAgents.slice(offset), ...rotatedAgents.slice(0, offset)];

      const findEligibleAgents = (slotNum: number, alreadyAssignedToday: string[]) => {
        return dailyAgents.filter(agent => {
          if ((agent.unavailable[day.day] || []).includes(slotNum)) return false;
          if (alreadyAssignedToday.includes(agent.name)) return false;
          return true;
        });
      };

      // Assign Slot 1 (Min 1, Max 2)
      const eligible1 = findEligibleAgents(1, []);
      day.slot1 = eligible1.slice(0, 2).map(a => ({ name: a.name, color: AGENT_COLORS[a.colorIdx] }));
      
      // Assign Slot 2 (Min 1, Max 2)
      const eligible2 = findEligibleAgents(2, day.slot1.map(s => s.name));
      day.slot2 = eligible2.slice(0, 2).map(a => ({ name: a.name, color: AGENT_COLORS[a.colorIdx] }));
    });
    setTimetable(newTable);
    setConfirmModal({ ...confirmModal, show: false });
  };

  const handleAIScheduling = async () => {
    setIsGenerating(true);
    setConfirmModal({ ...confirmModal, show: false });
    const optimized = await optimizeScheduleWithAI(agents, monthInfo);
    setTimetable(optimized);
    setIsGenerating(false);
  };

  const toggleAvailability = (agentCode: string, day: number, slot: number) => {
    if (userRole === 'LM' && userCode !== agentCode) return;
    setAgents(prev => prev.map(a => {
      if (a.code === agentCode) {
        const current = a.unavailable[day] || [];
        const next = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot];
        const newUnavail = { ...a.unavailable };
        if (next.length === 0) delete newUnavail[day];
        else newUnavail[day] = next;
        return { ...a, unavailable: newUnavail };
      }
      return a;
    }));
  };

  // --- Management Logic ---
  const addMemo = () => {
    const title = prompt(t.memo + ": " + (language === 'zh' ? "標題" : "Title"));
    if (!title) return;
    const content = prompt(language === 'zh' ? "內容" : "Content") || "";
    setMemos([{ id: Date.now(), title, content, date: new Date().toISOString().split('T')[0], isNew: true }, ...memos]);
  };

  const deleteMemo = (id: number) => { 
    if (confirm(language === 'zh' ? "刪除此公告？" : "Delete memo?")) {
      setMemos(prev => prev.filter(m => m.id !== id));
    }
  };

  const addFormDoc = () => {
    const title = prompt(t.forms + ": " + (language === 'zh' ? "名稱" : "Name"));
    if (!title) return;
    const size = prompt(language === 'zh' ? "檔案大小 (如 1.2MB)" : "Size (e.g. 1.2MB)") || "1.0MB";
    setForms([{ id: Date.now(), title, size, url: "#" }, ...forms]);
  };

  const deleteFormDoc = (id: number) => {
    if (confirm(language === 'zh' ? "刪除此表單？" : "Delete form?")) {
      setForms(prev => prev.filter(f => f.id !== id));
    }
  };

  const addAgent = () => {
    const name = prompt(t.enterAgentName);
    if (!name) return;
    const code = prompt(t.enterAgentCode);
    if (!code) return;
    const isPT = confirm(t.isPTConfirm);
    setAgents([...agents, { id: Date.now(), name, code: code.toUpperCase(), type: isPT ? 'PT' : 'FT', colorIdx: agents.length % AGENT_COLORS.length, unavailable: {} }]);
  };

  const deleteAgent = (id: number) => {
    if (confirm(t.confirmDeleteAgent)) {
      setAgents(prev => prev.filter(a => a.id !== id));
    }
  };

  // --- Render Login ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-10 border border-white relative overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#A50034]"></div>
          
          <div className="flex justify-center gap-2 mb-6">
            {['zh', 'en', 'ms'].map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang as any)} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${language === lang ? 'bg-[#A50034] text-white shadow-md scale-105' : 'text-gray-400 hover:bg-gray-100'}`}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-[#A50034] rounded-[2rem] flex items-center justify-center text-white text-4xl font-black italic shadow-xl mb-6 animate-bounce">LG</div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">{t.title}</h1>
            <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">A Complete Home, Today.</p>
          </div>
          <div className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              <input 
                type="text" 
                placeholder={t.loginTitle} 
                className="w-full bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl pl-14 pr-5 py-5 text-sm font-bold focus:ring-2 focus:ring-[#A50034] outline-none transition-all" 
                value={loginInput} 
                onChange={e => setLoginInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <button 
              onClick={handleLogin} 
              disabled={isLoggingIn}
              className="w-full bg-[#A50034] text-white py-5 rounded-2xl font-black text-sm shadow-[0_10px_20px_rgba(165,0,52,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isLoggingIn ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ShieldCheck size={18} />}
              {t.loginBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 pb-28 font-sans select-none overflow-x-hidden">
      <header className="bg-white/95 backdrop-blur-xl border-b sticky top-0 z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md" style={{ backgroundColor: LG_MAROON }}>LG</div>
          <div className="flex flex-col">
             <span className="font-black tracking-tight text-xs uppercase leading-tight" style={{ color: LG_MAROON }}>{t.title}</span>
             <span className="text-[10px] font-bold text-gray-400 leading-none">{userCode} • {userRole}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-100">
            {['zh', 'en', 'ms'].map((lang) => (
              <button key={lang} onClick={() => setLanguage(lang as any)} className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all ${language === lang ? 'bg-white text-[#A50034] shadow-sm' : 'text-gray-400'}`}>
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
          <button onClick={() => setIsLoggedIn(false)} className="bg-gray-50 p-2.5 rounded-xl text-gray-400 hover:text-[#A50034] transition-colors"><LogOut size={20}/></button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Tab 1: Schedule */}
        {activeTab === Tab.Schedule && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-black text-gray-800 text-sm">
                  <Calendar size={18} style={{ color: LG_MAROON }} /> {selectedMonth}
                </div>
                <div className="flex gap-2">
                  {userRole === 'LSM' && (
                    <>
                      <button onClick={() => setConfirmModal({ show: true, title: t.quickGen, message: t.quickGenMsg, action: performBasicAutoGenerate })} className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-1.5 active:scale-95 transition-all">
                        <Zap size={14} fill="currentColor" /> {t.quickGen}
                      </button>
                      <button disabled={isGenerating} onClick={() => setConfirmModal({ show: true, title: t.generate, message: t.aiGenMsg, action: handleAIScheduling, isAI: true })} className={`text-white px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-lg active:scale-95 transition-all relative group`} style={{ backgroundColor: LG_MAROON }}>
                        <Sparkles size={14} fill="currentColor" className="group-hover:rotate-12 transition-transform" /> {isGenerating ? "..." : t.generate}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {timetable.map(d => (
              <div key={d.day} className={`bg-white rounded-[2.5rem] p-6 border shadow-sm transition-all ${d.isWeekend ? 'border-rose-100 ring-1 ring-rose-50' : 'border-gray-50'}`}>
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900">{d.day}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${d.isWeekend ? 'text-rose-500' : 'text-gray-400'}`}>{t.weekdays[d.dow]}</span>
                  </div>
                  {d.isWeekend && <span className="text-[8px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black uppercase">{t.peakDay}</span>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map(slotNum => {
                    const slotKey = `slot${slotNum}` as 'slot1' | 'slot2';
                    const shifts = d[slotKey] || [];
                    const isVacant = shifts.length === 0;
                    
                    return (
                      <div key={slotNum} className="space-y-3">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          {slotNum === 1 ? <Sun size={14} className="text-orange-400" /> : <Moon size={14} className="text-indigo-400" />} {t[slotKey]}
                        </div>
                        <div className="flex flex-col gap-2 min-h-[44px]">
                          {shifts.length > 0 ? shifts.map((s, i) => (
                            <div key={i} className={`${s.color.bg} ${s.color.text} text-[10px] font-black py-3 px-4 rounded-2xl shadow-sm truncate animate-in zoom-in duration-300`}>{s.name}</div>
                          )) : (
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl border border-red-100 text-red-500 animate-pulse">
                              <AlertTriangle size={12} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">{t.empty}</span>
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

        {/* Tab 2: Leads (Protection System) */}
        {activeTab === Tab.Leads && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -mr-12 -mt-12 flex items-center justify-center pt-8 pr-8 opacity-50">
                <ShieldCheck size={48} className="text-[#A50034]" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
                <ShieldCheck className="text-[#A50034]" /> {t.leadProtection}
              </h2>
              <p className="text-xs text-gray-400 font-bold mb-8">{t.aiThinking.split('。')[0]}</p>

              <form onSubmit={handleSubmitLead} className="space-y-5">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">{t.customerName}</label>
                    <input type="text" value={newLead.customerName} onChange={e => setNewLead({...newLead, customerName: e.target.value})} className="w-full bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#A50034] outline-none transition-all" placeholder="e.g. Mr. Tan" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">{t.customerInfo}</label>
                    <input type="text" value={newLead.customerInfo} onChange={e => setNewLead({...newLead, customerInfo: e.target.value})} className="w-full bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#A50034] outline-none transition-all" placeholder={t.customerInfo} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">{t.productInterest}</label>
                    <input 
                      type="text" 
                      value={newLead.productInterest} 
                      onChange={e => setNewLead({...newLead, productInterest: e.target.value})} 
                      className="w-full bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#A50034] outline-none transition-all" 
                      placeholder="e.g. WashTower, Refrigerator..." 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">{t.visitLocation}</label>
                      <select value={newLead.location} onChange={e => setNewLead({...newLead, location: e.target.value as any})} className="w-full bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-[#A50034] outline-none appearance-none transition-all">
                        <option value="Lotus PR">Lotus PR</option>
                        <option value="Brandshop Batu Pahat">Batu Pahat Brandshop</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">{t.visitDate}</label>
                      <input 
                        type="text" 
                        value={newLead.expectedDate} 
                        onChange={e => setNewLead({...newLead, expectedDate: e.target.value})} 
                        className="w-full bg-gray-50 border-0 ring-1 ring-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-[#A50034] outline-none transition-all" 
                        placeholder={t.visitDate} 
                      />
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all" style={{ backgroundColor: LG_MAROON }}>
                  <UserPlus size={18} /> {t.submitLead}
                </button>
              </form>
            </div>

            <div className="space-y-4">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                <ClipboardList size={14} /> {t.leadHistory} ({registrations.length})
              </h3>
              {registrations.map(lead => (
                <div key={lead.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm relative group animate-in fade-in duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#A50034]">
                        <User size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-gray-900 truncate">{lead.customerName}</h4>
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">{lead.customerInfo}</span>
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold"><MapPin size={10} className="text-[#A50034]" /> {lead.location}</span>
                          <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold"><Package size={10} className="text-blue-500" /> {lead.productInterest}</span>
                        </div>
                      </div>
                    </div>
                    {userRole === 'LSM' && (
                      <button onClick={() => deleteLead(lead.id)} className="text-gray-200 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
                    )}
                  </div>
                  
                  <div className="mt-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-50 grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.reportAgent}</span>
                      <span className="text-[10px] font-black text-gray-700">{lead.agentName}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.expectedVisit}</span>
                      <span className="text-[10px] font-black text-[#A50034]">{lead.expectedDate}</span>
                    </div>
                    <div className="flex flex-col col-span-2 pt-2 border-t border-gray-100">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.regDate}</span>
                      <span className="text-[10px] font-black text-gray-500 flex items-center gap-1">
                        <Clock size={10} /> {lead.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="absolute -top-2 -right-2">
                     <div className="bg-emerald-500 text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 border border-white">
                       <ShieldCheck size={10} /> {t.protectionActive}
                     </div>
                  </div>
                </div>
              ))}
              {registrations.length === 0 && (
                <div className="bg-white/50 rounded-[2rem] p-10 border border-dashed border-gray-200 text-center">
                   <p className="text-xs text-gray-400 font-bold italic">{t.noLeads}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Management */}
        {activeTab === Tab.Management && (
          <div className="space-y-8 pb-10">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight px-2">{userRole === 'LSM' ? t.adminConsole : t.docCenter}</h2>
            
            <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-xl space-y-8">
               {/* Memos Section */}
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2" style={{ color: LG_MAROON }}><Bell size={18} /> {t.memo}</h3>
                    {userRole === 'LSM' && (
                      <button onClick={addMemo} className="bg-black text-white px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all">
                        <Plus size={14} /> {t.upload}
                      </button>
                    )}
                 </div>
                 <div className="space-y-4">
                    {memos.map(m => (
                      <div key={m.id} className="p-5 bg-gray-50 rounded-[2rem] border border-gray-100 relative group transition-all hover:bg-white hover:shadow-md">
                         <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                               <div className="flex items-center gap-2">
                                  <p className="text-xs font-black text-gray-800">{m.title}</p>
                                  {m.isNew && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
                               </div>
                               <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{m.date}</p>
                            </div>
                            {userRole === 'LSM' && (
                              <button onClick={() => deleteMemo(m.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                            )}
                         </div>
                         {m.content && <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{m.content}</p>}
                      </div>
                    ))}
                 </div>
               </div>

               {/* Forms Section */}
               <div className="pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><FilePlus size={18} /> {t.forms}</h3>
                    {userRole === 'LSM' && (
                      <button onClick={addFormDoc} className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all">
                        <Plus size={14} /> {t.upload}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                     {forms.map(f => (
                       <div key={f.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-200 transition-all active:scale-[0.98]">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><Download size={24}/></div>
                             <div>
                                <p className="text-xs font-black text-gray-800">{f.title}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{f.size}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {userRole === 'LSM' && (
                              <button onClick={() => deleteFormDoc(f.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                            )}
                            <a href={f.url} target="_blank" rel="noopener noreferrer" className="font-black text-[10px] uppercase bg-red-50 px-3 py-2 rounded-xl active:bg-red-100 transition-colors flex items-center gap-1" style={{ color: LG_MAROON }}>
                              {t.get} <ExternalLink size={10} />
                            </a>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Agent Management Section */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center justify-between px-2">
                 <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{userRole === 'LSM' ? t.status : t.personalSettings}</h3>
                 {userRole === 'LSM' && <button onClick={addAgent} className="text-[10px] font-black uppercase tracking-widest" style={{ color: LG_MAROON }}>+ {language === 'zh' ? '新增' : 'Add'}</button>}
              </div>
              {agents.filter(a => userRole === 'LSM' || a.code === userCode).map(agent => (
                <div key={agent.id} className="bg-white rounded-[3.5rem] p-8 border border-gray-100 shadow-xl relative overflow-hidden group">
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${AGENT_COLORS[agent.colorIdx].bg}`}></div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-5">
                      <div className={`w-16 h-16 ${AGENT_COLORS[agent.colorIdx].bg} text-white rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-lg`}>
                        {agent.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-black text-gray-900 leading-none">{agent.name}</h3>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md border ${agent.type === 'FT' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-200'}`}>
                            {agent.type}
                          </span>
                        </div>
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{agent.code}</p>
                      </div>
                    </div>
                    {userRole === 'LSM' && <Trash2 size={22} className="text-gray-200 hover:text-red-500 cursor-pointer transition-colors" onClick={() => deleteAgent(agent.id)} />}
                  </div>
                  
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">{t.markUnavail}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {monthInfo.map(({ day, dow, isWeekend }) => {
                      const unavail = agent.unavailable[day] || [];
                      return (
                        <div key={day} className={`rounded-[1.5rem] border p-1.5 transition-all ${isWeekend ? 'bg-rose-50/50 border-rose-100' : 'bg-gray-50/50 border-gray-100 shadow-inner'}`}>
                          <div className={`text-center text-[10px] font-black py-1 mb-1.5 text-gray-400`}>{day} <span className="text-[8px] opacity-40">({t.weekdays[dow]})</span></div>
                          <div className="flex gap-2">
                            <button onClick={() => toggleAvailability(agent.code, day, 1)} className={`flex-1 aspect-square rounded-xl flex items-center justify-center transition-all ${unavail.includes(1) ? 'bg-[#A50034] text-white shadow-lg scale-105' : 'bg-white text-gray-200 border border-gray-100'}`}><Sun size={16} /></button>
                            <button onClick={() => toggleAvailability(agent.code, day, 2)} className={`flex-1 aspect-square rounded-xl flex items-center justify-center transition-all ${unavail.includes(2) ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-white text-gray-200 border border-gray-100'}`}><Moon size={16} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 flex justify-around items-center px-8 pb-10 pt-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <button onClick={() => setActiveTab(Tab.Schedule)} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === Tab.Schedule ? 'text-[#A50034]' : 'text-gray-400'}`}>
           <Calendar size={24} className={activeTab === Tab.Schedule ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
           <span className="text-[10px] font-black">{t.schedule}</span>
        </button>
        <button onClick={() => setActiveTab(Tab.Leads)} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === Tab.Leads ? 'text-[#A50034]' : 'text-gray-400'}`}>
           <ShieldCheck size={24} className={activeTab === Tab.Leads ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
           <span className="text-[10px] font-black">{t.leads}</span>
        </button>
        <button onClick={() => setActiveTab(Tab.Management)} className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${activeTab === Tab.Management ? 'text-[#A50034]' : 'text-gray-400'}`}>
           <Users size={24} className={activeTab === Tab.Management ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
           <span className="text-[10px] font-black">{userRole === 'LSM' ? '管理控制' : '文檔/帳號'}</span>
        </button>
      </footer>

      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-white w-full max-sm:max-w-xs rounded-[3.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] space-y-8 animate-in zoom-in duration-300 text-center relative overflow-hidden">
              {confirmModal.isAI && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 animate-pulse"></div>}
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner ${confirmModal.isAI ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-[#A50034]'}`}>
                {confirmModal.isAI ? <Sparkles size={36} /> : <Zap size={36} />}
              </div>
              <div>
                 <h3 className="text-2xl font-black text-gray-900">{confirmModal.title}</h3>
                 <p className="text-sm text-gray-500 font-bold mt-4 leading-relaxed">{confirmModal.message}</p>
              </div>
              <div className="flex flex-col gap-3">
                 <button onClick={() => confirmModal.action?.()} className={`w-full py-5 text-white rounded-3xl font-black text-sm shadow-xl active:scale-95 transition-all`} style={{ backgroundColor: LG_MAROON }}>{t.confirmBtn}</button>
                 <button onClick={() => setConfirmModal({ ...confirmModal, show: false })} className="w-full py-5 bg-gray-50 text-gray-400 rounded-3xl font-black text-xs active:scale-95">{t.backBtn}</button>
              </div>
           </div>
        </div>
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-8">
           <div className="relative mb-10">
             <div className="w-24 h-24 rounded-full border-4 border-gray-100 border-t-[#A50034] animate-spin"></div>
             <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#A50034] animate-pulse" size={32} />
           </div>
           <h2 className="text-2xl font-black text-gray-900 mb-2">Gemini is Thinking...</h2>
           <p className="text-sm text-gray-400 font-bold text-center max-w-xs leading-relaxed uppercase tracking-widest">{t.aiThinking}</p>
        </div>
      )}
    </div>
  );
};

export default App;
