
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  BookOpen, 
  Search, 
  Users, 
  Sun, 
  Moon, 
  Sparkles, 
  Send, 
  Zap, 
  Layers, 
  CalendarDays,
  Copy,
  CheckCircle2,
  AlertCircle,
  Lock,
  User,
  LogOut,
  Plus,
  Trash2,
  X,
  ChevronRight,
  Info,
  ArrowRight,
  ExternalLink,
  Globe,
  Clock
} from 'lucide-react';

import { 
  Role, 
  Language, 
  TabId, 
  SalesKitSubTab, 
  Agent, 
  DayInfo, 
  Translation,
  AuthState,
  Product
} from './types.ts';
import { LANGUAGES, PRODUCT_DATA, FAQ_DATA } from './constants.tsx';
import { callGeminiCoach } from './services/gemini.ts';
import { NavItem } from './components/NavItem.tsx';

const AGENT_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
];

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const saved = localStorage.getItem('lg_auth');
      return saved ? JSON.parse(saved) : { isLoggedIn: false, role: null, agentId: null };
    } catch {
      return { isLoggedIn: false, role: null, agentId: null };
    }
  });

  useEffect(() => {
    localStorage.setItem('lg_auth', JSON.stringify(auth));
  }, [auth]);

  const [loginMode, setLoginMode] = useState<Role>('LSM');
  const [passwordInput, setPasswordInput] = useState('');
  const [agentCodeInput, setAgentCodeInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<TabId>('schedule');
  const [language, setLanguage] = useState<Language>('zh');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth] = useState('2026-01'); 
  const [salesKitSubTab, setSalesKitSubTab] = useState<SalesKitSubTab>('specs');
  
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState<{ text: string, sources: any[] }>({ text: '', sources: [] });
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // LSM 代理管理相关
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentType, setNewAgentType] = useState<'FT' | 'PT'>('FT');

  const t: Translation = LANGUAGES[language] || LANGUAGES.zh;

  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem('lg_agents');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Kelvin', code: 'M100001', type: 'FT', unavailable: { 2: [1, 2], 5: [1] } },
      { id: 2, name: 'Sarah', code: 'F200002', type: 'PT', unavailable: { 1: [1, 2], 10: [1] } },
      { id: 3, name: 'Wei', code: 'M100003', type: 'FT', unavailable: { 7: [1, 2] } },
      { id: 4, name: 'Siti', code: 'F200004', type: 'PT', unavailable: { 15: [2] } },
    ];
  });

  useEffect(() => {
    localStorage.setItem('lg_agents', JSON.stringify(agents));
  }, [agents]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return PRODUCT_DATA;
    return PRODUCT_DATA.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const getAgentColor = useCallback((name: string) => {
    const index = agents.findIndex(a => a.name === name);
    return AGENT_COLORS[index % AGENT_COLORS.length] || AGENT_COLORS[0];
  }, [agents]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (loginMode === 'LSM') {
      if (passwordInput === 'Joecindy@1123') {
        setAuth({ isLoggedIn: true, role: 'LSM', agentId: null });
      } else {
        setLoginError(language === 'zh' ? '密码错误' : 'Incorrect Password');
      }
    } else {
      const agent = agents.find(a => a.code.toUpperCase() === agentCodeInput.trim().toUpperCase());
      if (agent) {
        setAuth({ isLoggedIn: true, role: 'Agent', agentId: agent.id });
      } else {
        setLoginError(language === 'zh' ? 'Agent Code 无效' : 'Invalid Agent Code');
      }
    }
  };

  const handleLogout = () => {
    setAuth({ isLoggedIn: false, role: null, agentId: null });
    localStorage.removeItem('lg_auth');
    setPasswordInput('');
    setAgentCodeInput('');
  };

  const monthInfo = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 0);
    const daysCount = date.getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const days = Array.from({ length: daysCount }, (_, i) => {
      const d = i + 1;
      const dow = new Date(year, month - 1, d).getDay();
      return { day: d, dow, isWeekend: dow === 0 || dow === 6 };
    });
    const padding = Array.from({ length: firstDayOfMonth }, (_, i) => null);
    return { days, padding };
  }, [selectedMonth]);

  const [timetable, setTimetable] = useState<DayInfo[]>([]);

  useEffect(() => {
    setTimetable(monthInfo.days.map(info => ({ ...info, slot1: [], slot2: [] })));
  }, [monthInfo.days]);

  const autoGenerate = useCallback(() => {
    let newTable: DayInfo[] = monthInfo.days.map(info => ({ ...info, slot1: [], slot2: [] }));
    newTable.forEach(d => {
      const available1 = agents.filter(a => !(a.unavailable[d.day] || []).includes(1));
      d.slot1 = available1.slice(0, 2).map(a => a.name);
      const available2 = agents.filter(a => !(a.unavailable[d.day] || []).includes(2) && !d.slot1.includes(a.name));
      d.slot2 = available2.slice(0, 2).map(a => a.name);
    });
    setTimetable(newTable);
  }, [monthInfo.days, agents]);

  const toggleSlot = useCallback((agentId: number, day: number, slot: number) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        const current = a.unavailable[day] || [];
        const next = current.includes(slot) ? current.filter(s => s !== slot) : [...current, slot];
        const newUnavail = { ...a.unavailable };
        if (next.length === 0) delete newUnavail[day];
        else newUnavail[day] = next;
        return { ...a, unavailable: newUnavail };
      }
      return a;
    }));
  }, []);

  const addAgent = () => {
    if (!newAgentName.trim()) return;
    const newId = agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1;
    const prefix = newAgentType === 'FT' ? 'M' : 'F';
    const newCode = `${prefix}${100000 + newId}`;
    setAgents(prev => [...prev, { id: newId, name: newAgentName.trim(), code: newCode, type: newAgentType, unavailable: {} }]);
    setNewAgentName('');
    setShowAddModal(false);
  };

  const deleteAgent = (id: number) => {
    if (window.confirm(t.confirmDelete)) {
      setAgents(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleAiConsult = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || aiInput;
    if (!finalPrompt.trim()) return;
    
    setActiveTab('ai');
    setIsAiLoading(true);
    setAiResponse({ text: '', sources: [] });
    setAiInput(finalPrompt);

    try {
      const result = await callGeminiCoach(finalPrompt, language);
      setAiResponse(result);
    } catch (err) {
      setAiResponse({ text: "Network error. Please try again later.", sources: [] });
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  if (!auth.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#A50034] flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-[#A50034] mx-auto shadow-2xl mb-6 ring-4 ring-white/20">
              <span className="text-4xl font-black italic">LG</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Subscribe Pro</h1>
          </div>
          <div className="bg-white/10 backdrop-blur-xl p-1 rounded-2xl flex border border-white/20 shadow-inner">
            <button onClick={() => setLoginMode('LSM')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${loginMode === 'LSM' ? 'bg-white text-[#A50034]' : 'text-white'}`}>LSM</button>
            <button onClick={() => setLoginMode('Agent')} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${loginMode === 'Agent' ? 'bg-white text-[#A50034]' : 'text-white'}`}>LM</button>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">{loginMode === 'LSM' ? <Lock size={18} /> : <User size={18} />}</div>
              <input type={loginMode === 'LSM' ? 'password' : 'text'} placeholder={loginMode === 'LSM' ? t.passwordPlaceholder : t.agentCodePlaceholder} className="w-full bg-white/20 border border-white/30 rounded-2xl pl-12 pr-6 py-4 text-white font-bold outline-none placeholder:text-white/40" value={loginMode === 'LSM' ? passwordInput : agentCodeInput} onChange={(e) => loginMode === 'LSM' ? setPasswordInput(e.target.value) : setAgentCodeInput(e.target.value)} />
            </div>
            {loginError && <div className="text-white bg-black/20 p-3 rounded-xl text-xs font-bold animate-shake flex gap-2 items-center"><AlertCircle size={14} />{loginError}</div>}
            <button type="submit" className="w-full bg-white text-[#A50034] py-5 rounded-2xl font-black uppercase shadow-2xl active:scale-95 transition-all">{t.loginBtn}</button>
          </form>
          <div className="flex justify-center gap-4">
            {(['zh', 'en', 'ms'] as Language[]).map(l => (
              <button key={l} onClick={() => setLanguage(l)} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${language === l ? 'bg-white/20 text-white' : 'text-white/40'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col max-w-lg mx-auto shadow-2xl relative border-x border-gray-100">
      <header className="bg-white/80 backdrop-blur-md border-b px-5 py-5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#A50034] rounded-xl flex items-center justify-center text-white shadow-lg"><span className="text-xl font-black italic">LG</span></div>
          <div>
            <h1 className="text-sm font-black text-gray-900 leading-none">Subscribe Pro</h1>
            <span className="text-[8px] font-black uppercase px-2 py-0.5 mt-1 inline-block rounded-sm bg-red-50 text-[#A50034] border border-red-100">{auth.role === 'LSM' ? 'Manager' : 'LM'}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-gray-400"><LogOut size={16} /></button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="p-2 md:p-3 space-y-4">
          
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-4">
              {/* 控制栏 */}
              <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-md border border-gray-200">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
                  <Calendar size={14} className="text-[#A50034]" />
                  <span className="text-[10px] font-black text-gray-800 tracking-tight">{selectedMonth}</span>
                </div>
                {auth.role === 'LSM' && (
                  <button onClick={autoGenerate} className="bg-[#A50034] text-white px-5 py-2.5 rounded-xl text-[10px] font-black shadow-lg flex items-center gap-2 active:scale-95 transition-all">
                    <Zap size={12} fill="currentColor" /> {t.generate}
                  </button>
                )}
              </div>
              
              {/* 日历网格 */}
              <div className="bg-white rounded-[2rem] border-2 border-gray-300 shadow-2xl overflow-hidden">
                {/* 星期标题 */}
                <div className="grid grid-cols-7 bg-gray-200 border-b-2 border-gray-300">
                  {t.weekdays.map(wd => (
                    <div key={wd} className="py-2.5 text-center text-[11px] font-black text-gray-700 uppercase tracking-tighter">{wd}</div>
                  ))}
                </div>
                
                {/* 日历天数 */}
                <div className="grid grid-cols-7 bg-gray-100">
                  {/* 填充月前空白 */}
                  {monthInfo.padding.map((_, i) => (
                    <div key={`pad-${i}`} className="min-h-[110px] border-r border-b border-gray-200 bg-gray-200/20"></div>
                  ))}
                  
                  {/* 实际日期单元格 */}
                  {timetable.map(d => (
                    <div key={d.day} className={`min-h-[120px] border-r border-b-2 border-gray-200 flex flex-col transition-all relative ${d.isWeekend ? 'bg-red-50/40' : 'bg-white'}`}>
                      {/* 日期头部 - 居中且适当放大 */}
                      <div className={`py-2 flex justify-center items-center border-b relative ${d.isWeekend ? 'bg-red-200/40 border-red-300' : 'bg-gray-200/30 border-gray-200'}`}>
                        <span className={`text-[16px] font-black leading-none drop-shadow-sm ${d.isWeekend ? 'text-red-700' : 'text-gray-900'}`}>{d.day}</span>
                        {d.isWeekend && <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-sm"></div>}
                      </div>
                      
                      {/* 早晚班区块 */}
                      <div className="flex-1 flex flex-col p-1.5 gap-1.5">
                        
                        {/* 早班 AM 区块 */}
                        <div className="flex-1 rounded-lg bg-orange-100 border-2 border-orange-300 p-1 flex flex-col gap-0.5 relative group/slot">
                          <Sun size={10} className="text-orange-500 absolute top-0.5 right-0.5 opacity-40" />
                          {d.slot1.length > 0 ? d.slot1.map((name, i) => (
                            <div key={i} className={`text-[7.5px] font-black px-1 py-0.5 rounded-md border shadow-sm truncate animate-in zoom-in duration-200 ${getAgentColor(name).bg} ${getAgentColor(name).text} ${getAgentColor(name).border}`}>
                              {name}
                            </div>
                          )) : <div className="text-[6px] text-gray-300 font-bold italic text-center py-1">--</div>}
                        </div>

                        {/* 晚班 PM 区块 */}
                        <div className="flex-1 rounded-lg bg-indigo-100 border-2 border-indigo-300 p-1 flex flex-col gap-0.5 relative group/slot">
                          <Moon size={10} className="text-indigo-500 absolute top-0.5 right-0.5 opacity-40" />
                          {d.slot2.length > 0 ? d.slot2.map((name, i) => (
                            <div key={i} className={`text-[7.5px] font-black px-1 py-0.5 rounded-md border shadow-sm truncate animate-in zoom-in duration-200 brightness-95 ${getAgentColor(name).bg} ${getAgentColor(name).text} ${getAgentColor(name).border}`}>
                              {name}
                            </div>
                          )) : <div className="text-[6px] text-gray-300 font-bold italic text-center py-1">--</div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 底部备注提示 */}
              <div className="bg-white p-3 rounded-2xl border-2 border-gray-100 flex items-center gap-4 shadow-sm">
                <div className="flex items-center gap-2 text-[10px] font-black text-orange-800 uppercase bg-orange-200/60 px-3 py-2 rounded-lg border border-orange-300">
                  <Sun size={12} fill="currentColor" /> AM 10-4
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-indigo-800 uppercase bg-indigo-200/60 px-3 py-2 rounded-lg border border-indigo-300">
                  <Moon size={12} fill="currentColor" /> PM 4-10
                </div>
                <div className="ml-auto flex items-center gap-1.5 text-[9px] font-black text-gray-500">
                  <Info size={12} /> STORE DUTY
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-6">
              <div className="bg-gradient-to-br from-[#A50034] to-[#E60045] p-8 rounded-[3rem] text-white shadow-xl shadow-red-100 relative overflow-hidden">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-3"><Sparkles size={28} /> {t.aiCoach}</h2>
                <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest">{t.aiInstruction}</p>
                <div className="mt-4 flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full w-fit border border-white/20">
                  <Globe size={12} className="animate-pulse" />
                  <span className="text-[9px] font-black uppercase">Live Knowledge Auto-Learn</span>
                </div>
              </div>
              <div className="bg-white rounded-[2.5rem] p-7 shadow-xl border border-gray-50">
                <textarea 
                  className="w-full bg-gray-50 rounded-3xl p-6 text-sm font-semibold border-none outline-none min-h-[160px] resize-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#A50034]" 
                  placeholder={t.aiPlaceholder} 
                  value={aiInput} 
                  onChange={(e) => setAiInput(e.target.value)} 
                />
                <button onClick={() => handleAiConsult()} disabled={isAiLoading || !aiInput.trim()} className={`w-full mt-6 py-5 rounded-3xl flex items-center justify-center gap-3 font-black text-sm shadow-xl transition-all ${isAiLoading ? 'bg-gray-100 text-gray-400' : 'bg-[#A50034] text-white active:scale-95 shadow-red-200'}`}>
                  {isAiLoading ? <span className="animate-pulse flex items-center gap-2"><Clock size={16} /> {t.thinking}</span> : <><Send size={18} /> {t.expertBtn}</>}
                </button>
              </div>
              {aiResponse.text && (
                <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border-l-4 border-[#A50034] space-y-6 animate-in zoom-in fade-in duration-500">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">Winning Advice</span>
                    <button onClick={() => copyToClipboard(aiResponse.text)} className={`text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 transition-all ${copyFeedback ? 'bg-green-50 text-green-600' : 'bg-red-50 text-[#A50034]'}`}>
                      {copyFeedback ? <CheckCircle2 size={12} /> : <Copy size={12} />} {copyFeedback ? 'Copied' : t.copy}
                    </button>
                  </div>
                  <div className="text-gray-700 text-[13px] font-semibold leading-relaxed whitespace-pre-wrap italic border-gray-50 p-2">{aiResponse.text}</div>
                  
                  {aiResponse.sources.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2"><Globe size={14} className="text-blue-500" /> Sources Found</p>
                      <div className="flex flex-col gap-2">
                        {aiResponse.sources.map((src, i) => (
                          <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-blue-600 flex items-center gap-2 hover:bg-blue-50 p-2 rounded-xl transition-all truncate border border-transparent hover:border-blue-100">
                            <ExternalLink size={12} /> {src.title || "Latest Product Detail"}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'salesKit' && (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-6">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input type="text" placeholder={t.searchPlaceholder} className="w-full bg-white border-none ring-1 ring-gray-100 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-bold shadow-xl outline-none focus:ring-2 focus:ring-[#A50034] transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Microwave', 'WashTower', 'Water Purifier', 'Dishwasher'].map(tag => (
                  <button key={tag} onClick={() => setSearchQuery(tag)} className="bg-white px-5 py-2.5 rounded-full text-[10px] font-black text-gray-400 border border-gray-100 whitespace-nowrap shadow-sm hover:border-[#A50034] hover:text-[#A50034] transition-all active:scale-95">{tag}</button>
                ))}
              </div>
              
              <div className="flex gap-2 p-1.5 bg-gray-100/80 rounded-[1.5rem] border border-white">
                {(['specs', 'faq', 'scripts'] as SalesKitSubTab[]).map(tab => (
                  <button key={tab} onClick={() => setSalesKitSubTab(tab)} className={`flex-1 py-3 text-[10px] font-black rounded-xl uppercase transition-all ${salesKitSubTab === tab ? 'bg-white shadow-lg text-[#A50034]' : 'text-gray-500'}`}>{t[tab]}</button>
                ))}
              </div>

              <div className="space-y-6">
                {salesKitSubTab === 'specs' && (
                  <>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(p => (
                        <div key={p.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
                          <div className="h-56 relative overflow-hidden">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6 right-6 text-white">
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">{p.category}</p>
                               <h3 className="text-lg font-black leading-tight">{p.name}</h3>
                            </div>
                          </div>
                          <div className="p-7 space-y-6">
                            <div className="flex flex-wrap gap-2">
                               {p.sellingPoints.map(sp => (
                                 <span key={sp} className="text-[9px] font-black px-3 py-1.5 bg-red-50 text-[#A50034] rounded-full border border-red-100 flex items-center gap-1.5"><Zap size={10} fill="currentColor" /> {sp}</span>
                               ))}
                            </div>
                            <div className="bg-gray-50 p-6 rounded-[2rem] space-y-4 border border-gray-100">
                              <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest"><Layers size={14} /> Spec Sheet</div>
                              <p className="text-xs font-bold text-gray-700 ml-1">{p.dims}</p>
                              <div className="h-px bg-gray-200" />
                              <div className="flex items-start gap-3 text-red-600/90 italic">
                                <Info size={14} className="mt-0.5 flex-shrink-0" />
                                <p className="text-[11px] font-bold leading-relaxed">{p.notes}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-[3rem] p-10 border border-dashed border-gray-200 flex flex-col items-center text-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 shadow-inner"><Search size={32} /></div>
                        <p className="text-sm font-black text-gray-800">{t.noProductFound}</p>
                        <p className="text-xs text-gray-400 mt-2 font-medium">AI can live-learn about "{searchQuery}" instantly.</p>
                        <button 
                          onClick={() => handleAiConsult(`Professional spec guide for LG ${searchQuery}: Key selling points, dimensions, and subscription benefits in Malaysia market.`)}
                          className="mt-8 flex items-center gap-3 bg-gradient-to-r from-[#A50034] to-[#E60045] text-white px-8 py-5 rounded-[2rem] font-black text-sm shadow-2xl active:scale-95 transition-all shadow-red-200"
                        >
                          <Sparkles size={18} /> {t.askAiAboutProduct} <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {salesKitSubTab === 'faq' && FAQ_DATA.map((f, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex gap-4 hover:bg-gray-50/50 transition-all">
                    <div className="w-10 h-10 bg-red-50 text-[#A50034] rounded-2xl flex-shrink-0 flex items-center justify-center font-black italic">Q</div>
                    <div>
                      <p className="text-sm font-black text-gray-800 mb-2 leading-snug">{f.q}</p>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed">{f.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-6">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-xl font-black text-gray-900 tracking-tight">{auth.role === 'LSM' ? 'Agent Fleet' : t.myAvailability}</h2>
                {auth.role === 'LSM' && (
                  <button onClick={() => setShowAddModal(true)} className="w-12 h-12 bg-[#A50034] text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-[#820029]"><Plus size={24} /></button>
                )}
              </div>

              <div className="grid gap-6">
                {agents.filter(a => auth.role === 'LSM' || a.id === auth.agentId).map(agent => (
                  <div key={agent.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-5">
                        <div className={`w-16 h-16 ${getAgentColor(agent.name).bg} ${getAgentColor(agent.name).text} rounded-3xl flex items-center justify-center text-2xl font-black shadow-inner`}>{agent.name[0]}</div>
                        <div>
                          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            {agent.name}
                            {auth.agentId === agent.id && <span className="text-[8px] bg-green-100 text-green-700 px-2 py-0.5 rounded-sm font-black tracking-widest uppercase">Me</span>}
                          </h3>
                          <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1.5">{agent.type === 'FT' ? 'Full Time' : 'Part Time'} • {agent.code}</div>
                        </div>
                      </div>
                      {auth.role === 'LSM' && (
                        <button onClick={() => deleteAgent(agent.id)} className="p-3 bg-gray-50 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={18} /></button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-4 gap-3">
                      {monthInfo.days.slice(0, 12).map(({ day, dow, isWeekend }) => {
                        const unavail = agent.unavailable[day] || [];
                        const isEditable = auth.role === 'LSM' || auth.agentId === agent.id;
                        return (
                          <div key={day} className={`rounded-[1.5rem] border-2 p-2.5 transition-all ${isWeekend ? 'bg-red-50/40 border-red-100' : 'bg-gray-50/50 border-gray-200 shadow-inner'}`}>
                            <div className="text-center text-[10px] font-black py-1 text-gray-600 mb-1.5">{day}<span className="text-[7px] block opacity-50 uppercase">{t.weekdays[dow]}</span></div>
                            <div className="flex flex-col gap-2">
                              <button disabled={!isEditable} onClick={() => toggleSlot(agent.id, day, 1)} className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all border-2 ${unavail.includes(1) ? 'bg-orange-500 border-orange-600 text-white shadow-md' : 'bg-white text-gray-300 border-gray-100'}`}><Sun size={14} /></button>
                              <button disabled={!isEditable} onClick={() => toggleSlot(agent.id, day, 2)} className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all border-2 ${unavail.includes(2) ? 'bg-indigo-600 border-indigo-700 text-white shadow-md' : 'bg-white text-gray-300 border-gray-100'}`}><Moon size={14} /></button>
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
        </div>
      </main>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500">
              <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3"><Plus className="text-[#A50034]" /> {t.addAgent}</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.agentName}</label>
                  <input type="text" value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold mt-2 outline-none focus:ring-2 focus:ring-[#A50034] transition-all" placeholder="Agent Name..." />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.agentType}</label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button onClick={() => setNewAgentType('FT')} className={`py-3.5 rounded-2xl text-[11px] font-black uppercase transition-all ${newAgentType === 'FT' ? 'bg-[#A50034] text-white shadow-lg shadow-red-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>Full Time</button>
                    <button onClick={() => setNewAgentType('PT')} className={`py-3.5 rounded-2xl text-[11px] font-black uppercase transition-all ${newAgentType === 'PT' ? 'bg-[#A50034] text-white shadow-lg shadow-red-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>Part Time</button>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                   <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-sm uppercase transition-all">Cancel</button>
                   <button onClick={addAgent} className="flex-1 py-4 bg-[#A50034] text-white rounded-2xl font-black text-sm uppercase shadow-xl active:scale-95 transition-all shadow-red-200">Create</button>
                </div>
              </div>
           </div>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center px-4 pb-10 pt-4 z-50">
        <NavItem id="schedule" icon={Calendar} label={t.schedule} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="ai" icon={Sparkles} label={t.aiCoach} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="salesKit" icon={BookOpen} label={t.salesKit} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="agents" icon={Users} label={auth.role === 'LSM' ? 'Agents' : t.myAvailability} activeTab={activeTab} onClick={setActiveTab} />
      </footer>
    </div>
  );
};

export default App;
