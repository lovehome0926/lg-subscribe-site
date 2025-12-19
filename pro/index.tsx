import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calendar, BookOpen, Sparkles, Users, User, LogOut, Globe, 
  Sun, Moon, Zap, Send, Copy, Info, ExternalLink, Search, 
  Layers, MessageCircle, FileDown, ChevronRight, Check, 
  Key, Hash, AlertCircle, ArrowRight, Plus, 
  Trash2, CalendarDays, CheckCircle2, UserPlus, X, Eye, EyeOff
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- 运行时标志位，防止 index.html 的监控脚本报错 ---
(window as any).__APP_MOUNTED__ = true;

// --- 类型定义 ---
type Role = 'LSM' | 'LM';
type LanguageCode = 'zh' | 'en' | 'ms';
interface AuthUser { role: Role; agentId?: string; }
interface Agent { id: string; name: string; type: 'FT' | 'PT'; unavailable: Record<number, number[]>; }
interface DayInfo { day: number; dow: number; isWeekend: boolean; }
interface TimetableEntry extends DayInfo { slot1: string[]; slot2: string[]; }

// --- 常量配置 ---
const SESSION_KEY = 'lg_pro_auth_v5';
const AGENTS_KEY = 'lg_pro_agents_v5';

// 代理商排班颜色库
const COLOR_PALETTE = [
  'bg-blue-50 text-blue-700 border-blue-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-amber-50 text-amber-700 border-amber-100',
  'bg-rose-50 text-rose-700 border-rose-100',
  'bg-indigo-50 text-indigo-700 border-indigo-100',
  'bg-teal-50 text-teal-700 border-teal-100',
  'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  'bg-orange-50 text-orange-700 border-orange-100',
];

const getAgentColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
};

const LANGUAGES: Record<LanguageCode, any> = {
  zh: {
    title: "LG Subscribe 专业管理", schedule: "排班表", salesKit: "销售工具", aiCoach: "AI 教练", agents: "团队管理",
    myAvailability: "填报时间", generate: "一键排班", ft: "全职", pt: "兼职", am: "早班", pm: "晚班",
    weekdays: ["日", "一", "二", "三", "四", "五", "六"], notes: "备注", copy: "复制", expertBtn: "获取专家建议",
    thinking: "AI 导师思考中...", loginTitle: "系统登录", loginLsm: "管理员 (LSM)", loginLm: "代理商 (LM)",
    passwordLabel: "输入访问密码", agentCodeLabel: "代理 ID (M/F)", loginBtn: "立即登录", loginError: "验证失败，请重新检查",
    logout: "退出登录", specs: "产品参数", faq: "问答库", scripts: "实战话术", unavailable: "休息时间",
    noData: "暂无数据", sources: "参考来源"
  },
  en: {
    title: "LG Subscribe Pro", schedule: "Timetable", salesKit: "Sales Kit", aiCoach: "AI Coach", agents: "Agents",
    myAvailability: "Availability", generate: "Auto-Gen", ft: "Full Time", pt: "Part Time", am: "AM Shift", pm: "PM Shift",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], notes: "Notes", copy: "Copy", expertBtn: "Get Advice",
    thinking: "AI Thinking...", loginTitle: "Login", loginLsm: "Manager", loginLm: "Agent",
    passwordLabel: "Access Password", agentCodeLabel: "Agent ID", loginBtn: "Sign In", loginError: "Auth Failed",
    logout: "Sign Out", specs: "Specs", faq: "FAQ", scripts: "Scripts", unavailable: "Unavailable",
    noData: "No Data", sources: "Sources"
  },
  ms: {
    title: "Sistem LG Subscribe", schedule: "Jadual", salesKit: "Kit Jualan", aiCoach: "Jurulatih AI", agents: "Ejen",
    myAvailability: "Masa Saya", generate: "Janakan", ft: "Sepenuh Masa", pt: "Sambilan", am: "Syif Pagi", pm: "Syif Malam",
    weekdays: ["Aha", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"], notes: "Nota", copy: "Salin", expertBtn: "Nasihat AI",
    thinking: "Sedang berfikir...", loginTitle: "Log Masuk", loginLsm: "Pengurus", loginLm: "Ejen",
    passwordLabel: "Kata Laluan", agentCodeLabel: "ID Ejen", loginBtn: "Log Masuk", loginError: "Gagal masuk",
    logout: "Log Keluar", specs: "Spec", faq: "FAQ", scripts: "Skrip", unavailable: "Cuti",
    noData: "Tiada rekod", sources: "Sumber"
  }
};

const PRODUCT_DATA = [
  { id: "WU525BS", name: "LG PuriCare™ Water Purifier", category: "Water", dims: "Faucet: 40x192x375mm", notes: "Requires drain. 180° swivel.", sellingPoints: ["Tankless", "Auto Sterilize"] },
  { id: "WT2520NHEGR", name: "LG WashTower™ Objet", category: "Washer", dims: "600x1655x660mm", notes: "Min height 1.7m.", sellingPoints: ["AI DD™", "TurboWash™"] }
];

// --- 主组件 ---
const App = () => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [language, setLanguage] = useState<LanguageCode>('zh');
  const [activeTab, setActiveTab] = useState('schedule');
  const [idInput, setIdInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>('LSM');
  const [error, setError] = useState(false);
  
  const [aiInput, setAiInput] = useState('');
  const [aiRes, setAiRes] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem(AGENTS_KEY);
    return saved ? JSON.parse(saved) : [
      { id: 'M1001', name: 'Alex Tan', type: 'FT', unavailable: {} },
      { id: 'F1002', name: 'Siti Nor', type: 'PT', unavailable: {} },
      { id: 'M1003', name: 'Kumar V', type: 'FT', unavailable: {} }
    ];
  });
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

  const t = LANGUAGES[language] || LANGUAGES.zh;

  const monthInfo = useMemo(() => {
    const date = new Date(2026, 1, 0); 
    return Array.from({ length: date.getDate() }, (_, i) => {
      const d = i + 1;
      const dow = new Date(2026, 0, d).getDay();
      return { day: d, dow, isWeekend: dow === 0 || dow === 6 };
    });
  }, []);

  useEffect(() => {
    setTimetable(monthInfo.map(i => ({ ...i, slot1: [], slot2: [] })));
    // 移除 Loading 遮罩
    const fb = document.getElementById('loading-fallback');
    if (fb) { fb.style.opacity = '0'; setTimeout(() => fb.style.display = 'none', 400); }
  }, [monthInfo]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    const val = idInput.trim();
    if (role === 'LSM') {
      if (val === 'Joecindy@1123') {
        const u: AuthUser = { role: 'LSM' };
        setUser(u); localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      } else setError(true);
    } else {
      const agent = agents.find(a => a.id.toUpperCase() === val.toUpperCase());
      if (agent) {
        const u: AuthUser = { role: 'LM', agentId: agent.id };
        setUser(u); localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      } else setError(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    setIdInput('');
  };

  const handleAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiRes(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const prompt = `Sales handle for LG Subscribe Malaysia: "${aiInput}". Response in ${language}. Professional tone.`;
      const res = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { tools: [{ googleSearch: {} }] }
      });
      setAiRes({ 
        text: res.text, 
        sources: res.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web)
      });
    } catch (e) { 
      setAiRes({ text: "AI 导师暂时不可用，请稍后再试或检查网络。" }); 
    } finally { setAiLoading(false); }
  };

  const autoGenerate = () => {
    const nt = monthInfo.map(i => {
      const s1 = agents.filter(a => !(a.unavailable[i.day] || []).includes(1)).slice(0, 2);
      const s1Names = s1.map(a => a.name);
      const s2 = agents.filter(a => !(a.unavailable[i.day] || []).includes(2) && !s1Names.includes(a.name)).slice(0, 2);
      return { ...i, slot1: s1Names, slot2: s2.map(a => a.name) };
    });
    setTimetable(nt);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-xs space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#A50034] rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl mb-4">LG</div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">{t.loginTitle}</h1>
            <div className="mt-4 bg-gray-50 p-1 rounded-full flex gap-1 w-fit mx-auto border border-gray-100">
              {['zh', 'en', 'ms'].map(l => (
                <button key={l} onClick={() => setLanguage(l as any)} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${language === l ? 'bg-white text-[#A50034] shadow-sm' : 'text-gray-300'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-2xl">
            <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
              <button onClick={() => { setRole('LSM'); setError(false); }} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${role === 'LSM' ? 'bg-white text-[#A50034] shadow-sm' : 'text-gray-400'}`}>{t.loginLsm}</button>
              <button onClick={() => { setRole('LM'); setError(false); }} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${role === 'LM' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>{t.loginLm}</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest pl-1">
                  {role === 'LSM' ? t.passwordLabel : t.agentCodeLabel}
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                    {role === 'LSM' ? <Key size={16}/> : <Hash size={16}/>}
                  </div>
                  <input 
                    type={(role === 'LSM' && !showPassword) ? "password" : "text"} 
                    value={idInput} 
                    onChange={e => setIdInput(e.target.value)} 
                    placeholder={role === 'LSM' ? "Admin Access" : "e.g. M1001"} 
                    className="w-full bg-gray-50 rounded-xl pl-10 pr-10 py-3.5 text-xs font-bold border-0 outline-none focus:ring-2 focus:ring-[#A50034]" 
                  />
                  {role === 'LSM' && (
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
              </div>
              {error && <div className="text-red-500 text-[10px] font-bold text-center bg-red-50 p-2 rounded-lg">{t.loginError}</div>}
              <button type="submit" className={`w-full py-3.5 rounded-xl text-white font-black text-xs shadow-lg active:scale-95 transition-all ${role === 'LSM' ? 'bg-[#A50034]' : 'bg-blue-600'}`}>
                {t.loginBtn}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 flex flex-col items-center">
      <header className="w-full max-w-md bg-white border-b sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#A50034] rounded flex items-center justify-center text-white font-black text-[10px]">LG</div>
          <span className="font-black text-[#A50034] text-[9px] uppercase tracking-wider">Subscribe Pro</span>
        </div>
        <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 transition-colors p-2"><LogOut size={16} /></button>
      </header>

      <main className="w-full max-w-md p-4 space-y-4">
        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
               <span className="text-xs font-black text-gray-800">2026-01 Schedule</span>
               {user.role === 'LSM' && (
                 <button onClick={autoGenerate} className="bg-[#A50034] text-white px-4 py-2 rounded-xl text-[9px] font-black shadow-lg flex items-center gap-1 active:scale-90">
                   <Zap size={12}/>{t.generate}
                 </button>
               )}
            </div>
            {timetable.map(d => (
              <div key={d.day} className={`bg-white rounded-[2rem] p-5 border ${d.isWeekend ? 'bg-red-50/20 border-red-50' : 'border-gray-50 shadow-sm'}`}>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-black text-gray-800">{d.day}</span>
                  <span className={`text-[10px] font-bold ${d.isWeekend ? 'text-red-500' : 'text-gray-300'}`}>{t.weekdays[d.dow]}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[8px] font-black text-gray-300 uppercase"><Sun size={10} className="text-orange-400"/> {t.am}</div>
                    <div className="space-y-1">{d.slot1.length ? d.slot1.map((n, i) => {
                      const agent = agents.find(a => a.name === n);
                      return <div key={i} className={`p-2 rounded-xl border font-bold text-[10px] truncate shadow-sm transition-all ${getAgentColor(agent?.id || n)}`}>{n}</div>
                    }) : <div className="text-[9px] text-gray-200 italic ml-1">---</div>}</div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[8px] font-black text-gray-300 uppercase"><Moon size={10} className="text-blue-400"/> {t.pm}</div>
                    <div className="space-y-1">{d.slot2.length ? d.slot2.map((n, i) => {
                      const agent = agents.find(a => a.name === n);
                      return <div key={i} className={`p-2 rounded-xl border font-bold text-[10px] truncate shadow-sm transition-all ${getAgentColor(agent?.id || n)}`}>{n}</div>
                    }) : <div className="text-[9px] text-gray-200 italic ml-1">---</div>}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-5 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-gradient-to-br from-[#A50034] to-[#E60045] p-7 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
               <h2 className="text-xl font-black mb-1 flex items-center gap-2 relative z-10"><Sparkles size={20} /> {t.aiCoach}</h2>
               <p className="text-[10px] font-bold opacity-80 uppercase leading-relaxed relative z-10">Real-time Sales Mentor</p>
               <Zap className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
            </div>
            <div className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-50">
              <textarea 
                value={aiInput} 
                onChange={e => setAiInput(e.target.value)} 
                placeholder={t.aiPlaceholder} 
                className="w-full bg-gray-50 rounded-xl p-4 text-[13px] font-medium border-0 outline-none min-h-[140px] resize-none focus:ring-2 focus:ring-[#A50034]" 
              />
              <button onClick={handleAI} disabled={aiLoading || !aiInput} className={`w-full mt-3 py-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs text-white shadow-lg transition-all ${aiLoading ? 'bg-gray-300' : 'bg-[#A50034] active:scale-95'}`}>
                {aiLoading ? "Thinking..." : <><Send size={14}/> {t.expertBtn}</>}
              </button>
            </div>
            {aiRes && (
              <div className="bg-white rounded-3xl p-6 border border-red-50 shadow-sm animate-in fade-in duration-500">
                <div className="text-gray-700 text-[14px] font-medium italic leading-relaxed whitespace-pre-wrap">{aiRes.text}</div>
                {aiRes.sources && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                    {aiRes.sources.map((s: any, i: number) => (
                      <a key={i} href={s.uri} target="_blank" className="flex items-center justify-between p-2 bg-red-50/30 rounded-lg text-[10px] font-bold text-[#A50034]">
                        {s.title || "Reference"}<ExternalLink size={10} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'salesKit' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="text" placeholder={t.searchPlaceholder} className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-xs font-bold shadow-sm border-0 focus:ring-1 focus:ring-[#A50034]" />
             </div>
             {PRODUCT_DATA.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-gray-800">{p.name}</span>
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">{p.id}</span>
                  </div>
                  <span className="text-[8px] font-black bg-red-50 text-[#A50034] px-2 py-0.5 rounded-full uppercase tracking-widest">{p.category}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl space-y-1 text-[10px] font-medium border border-gray-100">
                   <p className="text-gray-400">SIZE: <span className="text-gray-600 font-bold">{p.dims}</span></p>
                   <p className="text-[#A50034]">NOTE: <span className="italic">{p.notes}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h2 className="text-xl font-black text-gray-800 px-2">{user.role === 'LSM' ? t.agents : t.myAvailability}</h2>
            {agents.filter(a => user.role === 'LSM' || a.id === user.agentId).map(a => (
              <div key={a.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mb-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ${getAgentColor(a.id)}`}>{a.name[0]}</div>
                  <div>
                    <h3 className="font-black text-gray-800 text-lg tracking-tight">{a.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${a.type === 'FT' ? 'text-[#A50034]' : 'text-blue-600'}`}>{a.type}</span>
                      <span className="text-[9px] text-gray-300 font-bold">ID: {a.id}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {monthInfo.slice(0, 12).map(m => {
                    const un = a.unavailable[m.day] || [];
                    return (
                      <div key={m.day} className="bg-gray-50 p-2 rounded-2xl border border-gray-100 text-center">
                        <div className="text-[8px] font-black text-gray-300 mb-1">{m.day} ({t.weekdays[m.dow]})</div>
                        <div className="flex gap-1">
                          <button onClick={() => {
                            const updated = agents.map(ag => ag.id === a.id ? { ...ag, unavailable: { ...ag.unavailable, [m.day]: un.includes(1) ? un.filter(x => x !== 1) : [...un, 1] } } : ag);
                            setAgents(updated); localStorage.setItem(AGENTS_KEY, JSON.stringify(updated));
                          }} className={`flex-1 aspect-square rounded-lg flex items-center justify-center transition-all ${un.includes(1) ? 'bg-[#A50034] text-white shadow-md' : 'bg-white text-gray-200 border border-gray-100'}`}><Sun size={12}/></button>
                          <button onClick={() => {
                            const updated = agents.map(ag => ag.id === a.id ? { ...ag, unavailable: { ...ag.unavailable, [m.day]: un.includes(2) ? un.filter(x => x !== 2) : [...un, 2] } } : ag);
                            setAgents(updated); localStorage.setItem(AGENTS_KEY, JSON.stringify(updated));
                          }} className={`flex-1 aspect-square rounded-lg flex items-center justify-center transition-all ${un.includes(2) ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-200 border border-gray-100'}`}><Moon size={12}/></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-6 w-[90%] max-w-[380px] bg-white/95 backdrop-blur-2xl border border-white/20 flex justify-around items-center px-2 py-2 z-50 rounded-[2rem] shadow-2xl left-1/2 -translate-x-1/2">
        {[
          { id: 'schedule', icon: Calendar, label: t.schedule },
          { id: 'ai', icon: Sparkles, label: t.aiCoach },
          { id: 'salesKit', icon: BookOpen, label: t.salesKit },
          { id: 'agents', icon: Users, label: user.role === 'LSM' ? t.agents : t.myAvailability }
        ].map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center flex-1 py-1 transition-all ${activeTab === item.id ? 'text-[#A50034]' : 'text-gray-300'}`}>
            <item.icon size={18} className={activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
            <span className="text-[8px] mt-1 font-bold">{item.label}</span>
          </button>
        ))}
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
