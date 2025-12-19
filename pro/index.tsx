import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calendar, BookOpen, Sparkles, Users, User, LogOut, Globe, 
  Sun, Moon, Zap, Send, Copy, Info, ExternalLink, Search, 
  Layers, MessageCircle, FileDown, ChevronRight, Check, 
  ShieldCheck, Key, Hash, AlertCircle, ArrowRight, Plus, 
  Trash2, CalendarDays, CheckCircle2, UserPlus, X 
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- 标志应用已启动，解除 HTML 里的超时检测 ---
(window as any).__APP_MOUNTED__ = true;

// --- 类型定义 ---
type Role = 'LSM' | 'LM';
type LanguageCode = 'zh' | 'en' | 'ms';
interface AuthUser { role: Role; agentId?: string; }
interface Agent { id: string; name: string; type: 'FT' | 'PT'; unavailable: Record<number, number[]>; }
interface DayInfo { day: number; dow: number; isWeekend: boolean; }
interface TimetableEntry extends DayInfo { slot1: string[]; slot2: string[]; }
interface Product { id: string; name: string; category: string; dims: string; notes: string; sellingPoints: string[]; }
interface GroundingSource { title: string; uri: string; }
interface AICoachResponse { text: string; sources?: GroundingSource[]; }

// --- 常量数据 ---
const LANGUAGES: Record<LanguageCode, any> = {
  zh: {
    title: "LG Subscribe 专业管理", schedule: "排班表", salesKit: "销售工具", aiCoach: "AI 教练", agents: "团队管理",
    myAvailability: "填报时间", generate: "一键排班", ft: "全职", pt: "兼职", am: "早", pm: "晚",
    weekdays: ["日", "一", "二", "三", "四", "五", "六"], notes: "备注", copy: "复制话术", expertBtn: "获取专家建议",
    unavailable: "不可用时间", thinking: "AI 正在分析并思考中...", noData: "暂无数据", loginTitle: "系统登录",
    loginLsm: "管理员 (LSM)", loginLm: "代理商 (LM)", passwordLabel: "管理员密码", agentCodeLabel: "代理商代码 (Mxxxxxx)",
    loginBtn: "立即登录", loginError: "验证失败，请检查输入", logout: "退出登录", addAgent: "添加新代理",
    agentName: "代理姓名", agentType: "代理类型", saveAgent: "保存代理", cancel: "取消", deleteAgent: "删除代理",
    confirmDelete: "确定要删除该代理吗？", sources: "参考来源", specs: "产品参数", faq: "问答库", scripts: "实战话术", forms: "下载表格",
    searchPlaceholder: "搜索产品、常见问题...", aiPlaceholder: "例如：客户说家里空间不够，如何推荐 WashTower？",
    aiInstruction: "AI 导师已深度学习 LG 手册，为您提供实时建议"
  },
  en: {
    title: "LG Subscribe Pro", schedule: "Timetable", salesKit: "Sales Kit", aiCoach: "AI Coach", agents: "Agents",
    myAvailability: "Availability", generate: "Auto-Gen", ft: "Full Time", pt: "Part Time", am: "AM", pm: "PM",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], notes: "Notes", copy: "Copy Script", expertBtn: "Get Advice",
    unavailable: "Unavailable", thinking: "Analyzing market...", noData: "No data", loginTitle: "System Login",
    loginLsm: "Manager (LSM)", loginLm: "Agent (LM)", passwordLabel: "Admin Password", agentCodeLabel: "Agent ID",
    loginBtn: "Sign In", loginError: "Auth failed", logout: "Sign Out", addAgent: "Add Agent",
    agentName: "Name", agentType: "Type", saveAgent: "Save", cancel: "Cancel", deleteAgent: "Delete",
    confirmDelete: "Are you sure?", sources: "Sources", specs: "Specs", faq: "FAQ", scripts: "Scripts", forms: "Forms",
    searchPlaceholder: "Search specs, FAQ...", aiPlaceholder: "E.g.: 'Kitchen too small, how to answer?'",
    aiInstruction: "AI Mentor provides strategic responses based on LG logic"
  },
  ms: {
    title: "Sistem LG Subscribe", schedule: "Jadual", salesKit: "Kit Jualan", aiCoach: "Jurulatih AI", agents: "Ejen",
    myAvailability: "Masa Saya", generate: "Janakan", ft: "Sepenuh Masa", pt: "Sambilan", am: "AM", pm: "PM",
    weekdays: ["Aha", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"], notes: "Nota", copy: "Salin", expertBtn: "Nasihat AI",
    unavailable: "Cuti", thinking: "Menganalisis...", noData: "Tiada rekod", loginTitle: "Log Masuk",
    loginLsm: "Pengurus (LSM)", loginLm: "Ejen (LM)", passwordLabel: "Kata Laluan Admin", agentCodeLabel: "ID Ejen",
    loginBtn: "Log Masuk", loginError: "Gagal log masuk", logout: "Log Keluar", addAgent: "Tambah Ejen",
    agentName: "Nama", agentType: "Jenis", saveAgent: "Simpan", cancel: "Batal", deleteAgent: "Padam",
    confirmDelete: "Pasti padam?", sources: "Sumber", specs: "Spec", faq: "FAQ", scripts: "Skrip", forms: "Borang",
    searchPlaceholder: "Cari produk...", aiPlaceholder: "Cth: 'Dapur sempit, macam mana jawab?'",
    aiInstruction: "Mentor AI beri cadangan profesional LG"
  }
};

const PRODUCT_DATA: Product[] = [
  { id: "WU525BS", name: "LG PuriCare™ Tankless Water Purifier", category: "Water Purifier", dims: "Faucet: 40x192x375mm", notes: "Requires power/drain. 180° faucet.", sellingPoints: ["Tankless", "Auto Sterilize", "Compact"] },
  { id: "WT2520NHEGR", name: "LG WashTower™ Objet Collection", category: "Washer & Dryer", dims: "600 x 1655 x 660 mm", notes: "Min height 1.7m. Central control.", sellingPoints: ["AI DD™", "TurboWash™", "Stacked"] },
  { id: "GC-X24FFC7R", name: "LG InstaView™ Refrigerator", category: "Refrigerator", dims: "913 x 1790 x 735 mm", notes: "Need 5cm side space.", sellingPoints: ["Knock Twice", "LinearCooling", "UVnano"] }
];

// --- 辅助服务 (Gemini API) ---
const getAICoachResponse = async (prompt: string, language: LanguageCode): Promise<AICoachResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return { text: "API Key 缺失，请联系管理员。" };
  const ai = new GoogleGenAI({ apiKey });
  const langMap = { zh: 'Chinese', en: 'English', ms: 'Malay' };
  const systemPrompt = `You are an LG Subscribe Sales Mentor in Malaysia. Answer in ${langMap[language]}. Provide practical scripts and help handle objections about water purifiers, WashTower, and refrigerators.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: { systemInstruction: systemPrompt, temperature: 0.7, tools: [{ googleSearch: {} }] },
    });
    const text = response.text || "AI 导师暂时无法回复。";
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) chunks.forEach((c: any) => c.web && sources.push({ title: c.web.title || "Link", uri: c.web.uri }));
    return { text, sources: sources.length > 0 ? sources : undefined };
  } catch (error) { return { text: "AI 暂时不可用，请稍后再试。" }; }
};

// --- 组件部分 ---

const NavItem = ({ id, icon: Icon, label, activeTab, onClick }: any) => (
  <button onClick={() => onClick(id)} className={`flex flex-col items-center justify-center flex-1 py-3 transition-all ${activeTab === id ? 'text-[#A50034]' : 'text-gray-400'}`}>
    <Icon size={20} className={activeTab === id ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
    <span className="text-[10px] mt-1 font-bold">{label}</span>
    {activeTab === id && <div className="w-1 h-1 bg-[#A50034] rounded-full mt-1"></div>}
  </button>
);

const App = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [language, setLanguage] = useState<LanguageCode>('zh');
  const [idInput, setIdInput] = useState('');
  const [role, setRole] = useState<Role>('LSM');
  const [loginError, setLoginError] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([
    { id: 'M1001', name: 'Alex Tan', type: 'FT', unavailable: { 2: [1, 2] } },
    { id: 'F1002', name: 'Siti Nor', type: 'PT', unavailable: { 1: [1, 2] } }
  ]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiRes, setAiRes] = useState<AICoachResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [subTab, setSubTab] = useState('specs');
  const [search, setSearch] = useState('');

  const t = LANGUAGES[language];

  // 计算月份信息
  const monthInfo = useMemo<DayInfo[]>(() => {
    const date = new Date(2026, 1, 0); // 2026年1月
    return Array.from({ length: date.getDate() }, (_, i) => {
      const d = i + 1;
      const dow = new Date(2026, 0, d).getDay();
      return { day: d, dow, isWeekend: dow === 0 || dow === 6 };
    });
  }, []);

  useEffect(() => {
    if (timetable.length === 0) setTimetable(monthInfo.map(info => ({ ...info, slot1: [], slot2: [] })));
  }, [monthInfo]);

  // 模拟隐藏加载层
  useEffect(() => {
    const fallback = document.getElementById('loading-fallback');
    if (fallback) {
      fallback.style.opacity = '0';
      setTimeout(() => fallback.style.display = 'none', 500);
    }
  }, []);

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (role === 'LSM' && idInput === 'Joecindy@1123') {
      setUser({ role: 'LSM' });
    } else if (role === 'LM') {
      const agent = agents.find(a => a.id.toUpperCase() === idInput.toUpperCase());
      if (agent) setUser({ role: 'LM', agentId: agent.id });
      else setLoginError(true);
    } else {
      setLoginError(true);
    }
  };

  const handleAiConsult = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    const res = await getAICoachResponse(aiInput, language);
    setAiRes(res);
    setAiLoading(false);
  };

  const generateSchedule = () => {
    const newTable = monthInfo.map(info => {
      const slot1 = agents.filter(a => !(a.unavailable[info.day] || []).includes(1)).slice(0, 2).map(a => a.name);
      const slot2 = agents.filter(a => !(a.unavailable[info.day] || []).includes(2) && !slot1.includes(a.name)).slice(0, 2).map(a => a.name);
      return { ...info, slot1, slot2 };
    });
    setTimetable(newTable);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#A50034] rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl mb-4">LG</div>
            <h1 className="text-2xl font-black text-gray-900">{t.loginTitle}</h1>
            <div className="flex justify-center mt-3">
              <select value={language} onChange={(e) => setLanguage(e.target.value as any)} className="text-xs font-bold text-gray-400 bg-white border border-gray-100 rounded-full px-3 py-1">
                <option value="zh">CN</option><option value="en">EN</option><option value="ms">BM</option>
              </select>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
            <div className="flex p-1 bg-gray-100 rounded-2xl mb-6">
              <button onClick={() => setRole('LSM')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${role === 'LSM' ? 'bg-white text-[#A50034] shadow-sm' : 'text-gray-400'}`}>LSM</button>
              <button onClick={() => setRole('LM')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${role === 'LM' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>LM</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{role === 'LSM' ? t.passwordLabel : t.agentCodeLabel}</label>
                <div className="relative">
                  {role === 'LSM' ? <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} /> : <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />}
                  <input type={role === 'LSM' ? "password" : "text"} value={idInput} onChange={e => setIdInput(e.target.value)} className="w-full bg-gray-50 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold border-0 outline-none focus:ring-2 focus:ring-[#A50034]" />
                </div>
              </div>
              {loginError && <div className="text-red-500 text-[10px] font-bold bg-red-50 p-3 rounded-xl flex items-center gap-2"><AlertCircle size={14}/>{t.loginError}</div>}
              <button type="submit" className={`w-full py-4 rounded-2xl text-white font-black text-sm shadow-lg active:scale-95 transition-all ${role === 'LSM' ? 'bg-[#A50034]' : 'bg-blue-600'}`}>{t.loginBtn}</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans select-none flex flex-col items-center">
      <header className="w-full max-w-md bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#A50034] rounded-lg flex items-center justify-center text-white font-black text-xs">LG</div>
          <span className="font-black text-[#A50034] text-[10px]">SUBSCRIBE PRO</span>
        </div>
        <div className="flex items-center gap-3">
          <Globe size={14} className="text-gray-400" />
          <select value={language} onChange={e => setLanguage(e.target.value as any)} className="text-[10px] font-black bg-transparent outline-none">
            <option value="zh">CN</option><option value="en">EN</option><option value="ms">BM</option>
          </select>
          <button onClick={() => setUser(null)} className="p-2 text-gray-400"><LogOut size={16} /></button>
        </div>
      </header>

      <main className="w-full max-w-md p-4 animate-in fade-in duration-300 space-y-4">
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
               <span className="text-xs font-black text-gray-800">2026-01 Timetable</span>
               {user.role === 'LSM' && <button onClick={generateSchedule} className="bg-[#A50034] text-white px-4 py-1.5 rounded-xl text-[10px] font-black shadow-md flex items-center gap-1"><Zap size={12}/>{t.generate}</button>}
            </div>
            {timetable.map(d => (
              <div key={d.day} className={`bg-white rounded-3xl p-5 border ${d.isWeekend ? 'bg-red-50/20 border-red-50' : 'border-gray-50'}`}>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-black">{d.day}</span>
                  <span className={`text-[10px] font-bold ${d.isWeekend ? 'text-red-500' : 'text-gray-400'}`}>{t.weekdays[d.dow]}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-black text-gray-400">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1"><Sun size={12} className="text-orange-400"/> AM</div>
                    <div className="space-y-1">{d.slot1.map((n, i) => <div key={i} className="bg-gray-50 text-gray-800 p-2 rounded-xl border border-gray-100">{n}</div>)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1"><Moon size={12} className="text-blue-500"/> PM</div>
                    <div className="space-y-1">{d.slot2.map((n, i) => <div key={i} className="bg-gray-50 text-gray-800 p-2 rounded-xl border border-gray-100">{n}</div>)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#A50034] to-[#E60045] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
               <h2 className="text-xl font-black mb-1 flex items-center gap-2"><Sparkles size={20} /> {t.aiCoach}</h2>
               <p className="text-[9px] font-bold opacity-80 uppercase">{t.aiInstruction}</p>
            </div>
            <div className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-50">
              <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder={t.aiPlaceholder} className="w-full bg-gray-50 rounded-2xl p-4 text-sm font-bold border-0 outline-none min-h-[140px] resize-none" />
              <button onClick={handleAiConsult} disabled={aiLoading || !aiInput} className={`w-full mt-4 py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm text-white shadow-lg ${aiLoading ? 'bg-gray-300' : 'bg-[#A50034] active:scale-95'}`}>
                {aiLoading ? t.thinking : <><Send size={18}/> {t.expertBtn}</>}
              </button>
            </div>
            {aiRes && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-red-50 animate-in fade-in slide-in-from-bottom-4">
                <div className="text-gray-700 text-[13px] font-medium italic whitespace-pre-wrap">{aiRes.text}</div>
                {aiRes.sources && (
                  <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                    {aiRes.sources.map((s, i) => <a key={i} href={s.uri} target="_blank" className="text-[10px] text-gray-400 flex items-center justify-between bg-gray-50 p-2 rounded-lg">{s.title}<ExternalLink size={10}/></a>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'salesKit' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input type="text" placeholder={t.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white border-0 ring-1 ring-gray-100 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold shadow-sm" />
            </div>
            <div className="flex p-1 bg-gray-100 rounded-2xl">
              {['specs', 'faq', 'scripts', 'forms'].map(s => <button key={s} onClick={() => setSubTab(s)} className={`flex-1 py-2 text-[10px] font-black rounded-xl ${subTab === s ? 'bg-white text-[#A50034]' : 'text-gray-400'}`}>{t[s]}</button>)}
            </div>
            {subTab === 'specs' && PRODUCT_DATA.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-black text-gray-800">{p.name}</span>
                  <span className="text-[8px] font-black bg-red-50 text-[#A50034] px-2 py-1 rounded-full">{p.category}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl text-[10px] text-gray-400 font-bold space-y-1">
                  <p>SIZE: {p.dims}</p><p className="text-[#A50034] italic">NOTES: {p.notes}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-800">{user.role === 'LSM' ? t.agents : t.myAvailability}</h2>
            {agents.filter(a => user.role === 'LSM' || a.id === user.agentId).map(a => (
              <div key={a.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl ${a.type === 'FT' ? 'bg-[#A50034]' : 'bg-blue-600'}`}>{a.name[0]}</div>
                  <div><h3 className="font-black text-gray-800">{a.name}</h3><span className="text-[10px] font-bold text-gray-300">ID: {a.id} • {a.type}</span></div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {monthInfo.slice(0, 12).map(m => {
                    const un = a.unavailable[m.day] || [];
                    return (
                      <div key={m.day} className="bg-gray-50 p-2 rounded-2xl border border-gray-100 text-center">
                        <div className="text-[8px] font-black text-gray-300">{m.day}</div>
                        <div className="flex gap-1 mt-1">
                          <div className={`w-full aspect-square rounded-lg flex items-center justify-center ${un.includes(1) ? 'bg-[#A50034] text-white' : 'bg-white text-gray-200'}`}><Sun size={10}/></div>
                          <div className={`w-full aspect-square rounded-lg flex items-center justify-center ${un.includes(2) ? 'bg-blue-600 text-white' : 'bg-white text-gray-200'}`}><Moon size={10}/></div>
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

      <footer className="fixed bottom-4 w-[92%] max-w-[400px] bg-white/90 backdrop-blur-xl border border-white/20 flex justify-around items-center px-2 py-1 z-50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        <NavItem id="schedule" icon={Calendar} label={t.schedule} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="ai" icon={Sparkles} label={t.aiCoach} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="salesKit" icon={BookOpen} label={t.salesKit} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="agents" icon={Users} label={user.role === 'LSM' ? t.agents : t.myAvailability} activeTab={activeTab} onClick={setActiveTab} />
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
