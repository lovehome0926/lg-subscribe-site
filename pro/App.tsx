
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
  ChevronRight,
  HelpCircle,
  Clock,
  Lock,
  User,
  LogOut,
  Trash2
} from 'lucide-react';

import { 
  Role, 
  Language, 
  TabId, 
  SalesKitSubTab, 
  Agent, 
  DayInfo, 
  Translation,
  AuthState
} from './types';
import { LANGUAGES, PRODUCT_DATA, FAQ_DATA } from './constants';
import { callGeminiCoach } from './services/gemini';
import { NavItem } from './components/NavItem';

// 专属颜色调色盘 (高对比度，确保易读)
const AGENT_COLORS = [
  { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
];

const App: React.FC = () => {
  // --- Auth State ---
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('lg_auth');
    return saved ? JSON.parse(saved) : { isLoggedIn: false, role: null, agentId: null };
  });

  useEffect(() => {
    localStorage.setItem('lg_auth', JSON.stringify(auth));
  }, [auth]);

  const [loginMode, setLoginMode] = useState<Role>('LSM');
  const [passwordInput, setPasswordInput] = useState('');
  const [agentCodeInput, setAgentCodeInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- App State ---
  const [activeTab, setActiveTab] = useState<TabId>('schedule');
  const [language, setLanguage] = useState<Language>('zh');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth] = useState('2026-01'); 
  const [salesKitSubTab, setSalesKitSubTab] = useState<SalesKitSubTab>('faq');
  
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const t: Translation = LANGUAGES[language] || LANGUAGES.zh;

  // --- Mock Agents Data ---
  const [agents, setAgents] = useState<Agent[]>([
    { id: 1, name: 'Kelvin', code: 'M123456', type: 'FT', unavailable: { 2: [1, 2], 5: [1] } },
    { id: 2, name: 'Sarah', code: 'F654321', type: 'PT', unavailable: { 1: [1, 2], 10: [1] } },
    { id: 3, name: 'Wei', code: 'M111222', type: 'FT', unavailable: { 7: [1, 2] } },
    { id: 4, name: 'Siti', code: 'F333444', type: 'PT', unavailable: { 15: [2] } },
    { id: 5, name: 'Jason', code: 'M999888', type: 'FT', unavailable: {} },
    { id: 6, name: 'Hana', code: 'F444555', type: 'PT', unavailable: {} },
  ]);

  // 获取当前登录用户的信息
  const currentUser = useMemo(() => {
    if (auth.role === 'Agent' && auth.agentId) {
      return agents.find(a => a.id === auth.agentId);
    }
    return null;
  }, [auth, agents]);

  // 根据姓名获取固定颜色
  const getAgentColor = useCallback((name: string) => {
    const index = agents.findIndex(a => a.name === name);
    return AGENT_COLORS[index % AGENT_COLORS.length] || AGENT_COLORS[0];
  }, [agents]);

  // --- Auth Logic ---
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

  // --- Schedule Logic ---
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

  // --- AI Logic ---
  const handleAiConsult = async () => {
    if (!aiInput.trim()) return;
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const result = await callGeminiCoach(aiInput, language);
      setAiResponse(result);
    } catch (err) {
      setAiResponse("System error: Unable to reach AI Mentor.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // --- Login Screen ---
  if (!auth.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#A50034] flex flex-col items-center justify-center p-6 max-w-lg mx-auto">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-[#A50034] mx-auto shadow-2xl mb-6 ring-4 ring-white/20">
              <span className="text-4xl font-black italic">LG</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Subscribe Pro</h1>
          </div>

          <div className="bg-white/10 backdrop-blur-xl p-1 rounded-2xl flex border border-white/20 shadow-inner">
            <button onClick={() => { setLoginMode('LSM'); setLoginError(''); }} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${loginMode === 'LSM' ? 'bg-white text-[#A50034]' : 'text-white'}`}>LSM</button>
            <button onClick={() => { setLoginMode('Agent'); setLoginError(''); }} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${loginMode === 'Agent' ? 'bg-white text-[#A50034]' : 'text-white'}`}>LM</button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">{loginMode === 'LSM' ? <Lock size={18} /> : <User size={18} />}</div>
              <input type={loginMode === 'LSM' ? 'password' : 'text'} placeholder={loginMode === 'LSM' ? t.passwordPlaceholder : t.agentCodePlaceholder} className="w-full bg-white/20 border border-white/30 rounded-2xl pl-12 pr-6 py-4 text-white font-bold outline-none" value={loginMode === 'LSM' ? passwordInput : agentCodeInput} onChange={(e) => loginMode === 'LSM' ? setPasswordInput(e.target.value) : setAgentCodeInput(e.target.value)} />
            </div>
            {loginError && <div className="text-white bg-black/20 p-3 rounded-xl text-xs font-bold animate-pulse flex gap-2"><AlertCircle size={14} />{loginError}</div>}
            <button type="submit" className="w-full bg-white text-[#A50034] py-5 rounded-2xl font-black uppercase shadow-2xl active:scale-95 transition-all">{t.loginBtn}</button>
          </form>
          
          <div className="flex justify-center gap-4">
            {(['zh', 'en', 'ms'] as Language[]).map(l => (
              <button key={l} onClick={() => setLanguage(l)} className={`text-[10px] font-black uppercase transition-all px-2 py-1 rounded ${language === l ? 'bg-white/20 text-white' : 'text-white/40'}`}>{l}</button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto shadow-2xl relative">
      <header className="bg-white border-b px-4 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#A50034] rounded-xl flex items-center justify-center text-white shadow-lg"><span className="text-xl font-black italic">LG</span></div>
          <div>
            <h1 className="text-sm font-black text-gray-900 leading-none">Subscribe Pro</h1>
            <div className="mt-1 flex items-center gap-1.5"><span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm bg-red-50 text-[#A50034]">{auth.role === 'LSM' ? 'LSM' : 'LM'}</span></div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"><LogOut size={16} /></button>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">
        <div className="p-4 space-y-6">
          
          {/* 1. 排班表 */}
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-[#A50034]" />
                  <span className="text-sm font-black text-gray-800">{selectedMonth}</span>
                </div>
                {auth.role === 'LSM' && (
                  <button onClick={autoGenerate} className="bg-[#A50034] text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg flex items-center gap-2">
                    <Zap size={14} fill="currentColor" /> {t.generate}
                  </button>
                )}
              </div>

              {/* 增强型 7 列日历网格 */}
              <div className="bg-white rounded-[2rem] border-2 border-slate-200 shadow-xl overflow-hidden">
                <div className="grid grid-cols-7 bg-slate-100/80 border-b-2 border-slate-200">
                  {t.weekdays.map(wd => (
                    <div key={wd} className="py-2.5 text-center text-[9px] font-black text-slate-500 uppercase tracking-tighter border-r border-slate-200 last:border-r-0">
                      {wd}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 bg-slate-50">
                  {monthInfo.padding.map((_, i) => (
                    <div key={`pad-${i}`} className="min-h-[150px] border-r border-b border-slate-200 bg-slate-100/30"></div>
                  ))}
                  {timetable.map(d => (
                    <div 
                      key={d.day} 
                      className={`min-h-[150px] border-r border-b border-slate-200 flex flex-col transition-all hover:bg-red-50/40 relative ${d.isWeekend ? 'bg-red-50/5' : 'bg-white'}`}
                    >
                      {/* 日期头部，明确的网格分界线 */}
                      <div className="p-1.5 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
                        <span className={`text-[10px] font-black ${d.isWeekend ? 'text-red-500' : 'text-slate-500'}`}>
                          {d.day}
                        </span>
                        {d.isWeekend && <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>}
                      </div>
                      
                      {/* AM 区域 */}
                      <div className="flex-1 flex flex-col p-1 gap-1 border-b border-slate-100">
                        <div className="flex items-center gap-0.5 opacity-40 mb-0.5">
                          <Sun size={8} className="text-orange-500" />
                          <span className="text-[6px] font-black text-orange-600 uppercase">AM</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {d.slot1.length > 0 ? d.slot1.map((name, i) => {
                            const colors = getAgentColor(name);
                            const isMe = currentUser && name === currentUser.name;
                            return (
                              <div 
                                key={i} 
                                className={`text-[8px] font-black px-1 py-0.5 rounded-[3px] truncate border shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${colors.bg} ${colors.text} ${isMe ? 'ring-1 ring-[#A50034] border-[#A50034]' : colors.border}`}
                              >
                                {name}{isMe ? ' (You)' : ''}
                              </div>
                            );
                          }) : <div className="h-4"></div>}
                        </div>
                      </div>

                      {/* PM 区域 */}
                      <div className="flex-1 flex flex-col p-1 gap-1">
                        <div className="flex items-center gap-0.5 opacity-40 mb-0.5">
                          <Moon size={8} className="text-indigo-500" />
                          <span className="text-[6px] font-black text-indigo-600 uppercase">PM</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {d.slot2.length > 0 ? d.slot2.map((name, i) => {
                            const colors = getAgentColor(name);
                            const isMe = currentUser && name === currentUser.name;
                            return (
                              <div 
                                key={i} 
                                className={`text-[8px] font-black px-1 py-0.5 rounded-[3px] truncate border shadow-[0_1px_2px_rgba(0,0,0,0.05)] brightness-95 ${colors.bg} ${colors.text} ${isMe ? 'ring-1 ring-[#A50034] border-[#A50034]' : colors.border}`}
                              >
                                {name}{isMe ? ' (You)' : ''}
                              </div>
                            );
                          }) : <div className="h-4"></div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 代理图例 */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                 <p className="text-[9px] font-black text-gray-400 uppercase mb-3 tracking-widest text-center">Team Members</p>
                 <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
                    {agents.map(a => {
                        const colors = getAgentColor(a.name);
                        const isMe = currentUser && a.id === currentUser.id;
                        return (
                          <div key={a.id} className="flex items-center gap-1.5">
                            <div className={`w-3 h-3 rounded-sm ${colors.bg} ${colors.border} border ${isMe ? 'ring-1 ring-[#A50034]' : ''}`}></div>
                            <span className={`text-[10px] font-black ${isMe ? 'text-[#A50034]' : 'text-gray-600'}`}>
                              {a.name}{isMe ? ' (You)' : ''}
                            </span>
                          </div>
                        )
                    })}
                 </div>
              </div>
            </div>
          )}

          {/* AI 教练视图 */}
          {activeTab === 'ai' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              <div className="bg-[#A50034] p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10"><Zap size={160} /></div>
                <div className="relative z-10">
                   <h2 className="text-2xl font-black mb-1 flex items-center gap-3"><Sparkles size={28} /> {t.aiCoach}</h2>
                   <p className="text-[11px] font-medium opacity-80 uppercase tracking-widest">{t.aiInstruction}</p>
                </div>
              </div>
              <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-50">
                <textarea className="w-full bg-gray-50 rounded-2xl p-5 text-sm font-semibold border-none outline-none min-h-[160px] resize-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#A50034]" placeholder={t.aiPlaceholder} value={aiInput} onChange={(e) => setAiInput(e.target.value)} />
                <button onClick={handleAiConsult} disabled={isAiLoading || !aiInput.trim()} className={`w-full mt-4 py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-sm shadow-xl transition-all ${isAiLoading ? 'bg-gray-100 text-gray-400' : 'bg-[#A50034] text-white active:scale-95'}`}>
                  {isAiLoading ? <span className="animate-pulse flex items-center gap-2"><Zap size={18} className="animate-bounce" /> {t.thinking}</span> : <><Send size={18} /> {t.expertBtn}</>}
                </button>
              </div>
              {aiResponse && (
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#A50034]/10 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-black text-xs text-gray-800 uppercase tracking-widest">Mentor Suggestions</span>
                    <button onClick={() => copyToClipboard(aiResponse)} className={`text-[10px] font-black px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${copyFeedback ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-[#A50034]'}`}>
                      {copyFeedback ? <CheckCircle2 size={12} /> : <Copy size={12} />} {copyFeedback ? 'Copied' : t.copy}
                    </button>
                  </div>
                  <div className="text-gray-700 text-sm font-semibold leading-relaxed whitespace-pre-wrap bg-gray-50 p-5 rounded-2xl border border-gray-100 italic">{aiResponse}</div>
                </div>
              )}
            </div>
          )}

          {/* 销售工具箱 */}
          {activeTab === 'salesKit' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A50034]" size={20} />
                <input type="text" placeholder={t.searchPlaceholder} className="w-full bg-white border-none ring-1 ring-gray-100 rounded-3xl pl-14 pr-6 py-4 text-sm font-bold shadow-xl outline-none focus:ring-2 focus:ring-[#A50034]" />
              </div>
              <div className="flex gap-2 p-1.5 bg-gray-200/50 backdrop-blur rounded-2xl">
                {(['faq', 'specs', 'scripts'] as SalesKitSubTab[]).map(tab => (
                  <button key={tab} onClick={() => setSalesKitSubTab(tab)} className={`flex-1 py-2.5 text-[11px] font-black rounded-xl uppercase tracking-wider transition-all ${salesKitSubTab === tab ? 'bg-white shadow-md text-[#A50034]' : 'text-gray-500'}`}>{t[tab]}</button>
                ))}
              </div>
              <div className="space-y-4">
                {salesKitSubTab === 'specs' && PRODUCT_DATA.map(p => (
                  <div key={p.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#A50034]"><Layers size={20} /></div>
                        <div><h3 className="font-black text-gray-800 text-sm">{p.name}</h3><p className="text-[10px] text-gray-400 font-bold uppercase">{p.id}</p></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                      <p className="text-[11px] font-bold text-gray-700 leading-tight">{p.dims}</p>
                      <p className="text-[11px] font-bold text-gray-600 italic border-t pt-2">{p.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 代理管理 / 我的可用性 */}
          {activeTab === 'agents' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-6">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                  {auth.role === 'LSM' ? t.agents : t.myAvailability}
                </h2>
                <Users size={18} className="text-gray-400" />
              </div>
              {agents.filter(a => auth.role === 'LSM' || a.id === auth.agentId).map(agent => (
                <div key={agent.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl mb-8 relative">
                  <div className="flex items-center gap-5 mb-8">
                    <div className={`w-16 h-16 ${getAgentColor(agent.name).bg} ${getAgentColor(agent.name).text} rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl ring-4 ring-white`}>
                      {agent.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 leading-none mb-2">
                        {agent.name}{currentUser && agent.id === currentUser.id ? ' (You)' : ''}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-white bg-gray-800 px-3 py-1 rounded-full font-black uppercase tracking-widest">{agent.type === 'FT' ? t.ft : t.pt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex gap-2">
                      <CalendarDays size={18} className="text-[#A50034]" /> Availability Settings
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {monthInfo.days.slice(0, 12).map(({ day, dow, isWeekend }) => {
                        const unavail = agent.unavailable[day] || [];
                        return (
                          <div key={day} className={`rounded-[1.5rem] border p-1.5 transition-all ${isWeekend ? 'bg-red-50/50' : 'bg-gray-50/50'} border-gray-100`}>
                            <div className="text-center text-[10px] font-black py-1.5 text-gray-500 flex flex-col items-center">
                              <span>{day}</span>
                              <span className="text-[8px] opacity-60 uppercase">{t.weekdays[dow]}</span>
                            </div>
                            <div className="flex gap-1.5 mt-2">
                              <button onClick={() => toggleSlot(agent.id, day, 1)} className={`flex-1 aspect-square rounded-xl flex items-center justify-center transition-all ${unavail.includes(1) ? 'bg-[#A50034] text-white shadow-md' : 'bg-white text-gray-200 border border-gray-100'}`}><Sun size={14} /></button>
                              <button onClick={() => toggleSlot(agent.id, day, 2)} className={`flex-1 aspect-square rounded-xl flex items-center justify-center transition-all ${unavail.includes(2) ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-200 border border-gray-100'}`}><Moon size={14} /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/80 backdrop-blur-2xl border-t border-gray-100 flex justify-around items-center px-4 pb-8 pt-3 z-50">
        <NavItem id="schedule" icon={Calendar} label={t.schedule} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="ai" icon={Sparkles} label={t.aiCoach} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="salesKit" icon={BookOpen} label={t.salesKit} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="agents" icon={Users} label={auth.role === 'LSM' ? t.agents : t.myAvailability} activeTab={activeTab} onClick={setActiveTab} />
      </footer>
    </div>
  );
};

export default App;
