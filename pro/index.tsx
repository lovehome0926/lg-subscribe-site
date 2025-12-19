import React, { useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Calendar, BookOpen, Sparkles, Users, User, LogOut, 
  Sun, Moon, Zap, Send, Copy, Info, ExternalLink, Search, 
  Layers, ChevronRight, MessageCircle, FileDown, Check, Globe
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- 基础配置 ---
const AGENT_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-emerald-50 text-emerald-700 border-emerald-100',
  'bg-amber-50 text-amber-700 border-amber-100',
  'bg-rose-50 text-rose-700 border-rose-100',
  'bg-indigo-50 text-indigo-700 border-indigo-100',
  'bg-teal-50 text-teal-700 border-teal-100',
  'bg-cyan-50 text-cyan-700 border-cyan-100'
];

const getAgentStyle = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AGENT_COLORS[Math.abs(hash) % AGENT_COLORS.length];
};

const LANGUAGES: Record<string, any> = {
  zh: { title: "LG Subscribe Pro", schedule: "排班", aiCoach: "AI教练", salesKit: "工具箱", login: "立即登录", agents: "管理", am: "早", pm: "晚", weekdays: ["日", "一", "二", "三", "四", "五", "六"] },
  en: { title: "LG Subscribe Pro", schedule: "Schedule", aiCoach: "AI Coach", salesKit: "Kit", login: "Sign In", agents: "Agents", am: "AM", pm: "PM", weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  ms: { title: "LG Subscribe Pro", schedule: "Jadual", aiCoach: "AI Coach", salesKit: "Kit Jualan", login: "Log Masuk", agents: "Ejen", am: "AM", pm: "PM", weekdays: ["Aha", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab"] }
};

const PRODUCT_DATA = [
  { id: "WU525BS", name: "LG PuriCare™ Tankless Water Purifier", category: "Water", dims: "Faucet: 40x192x375mm", notes: "180° Rotating Faucet." },
  { id: "WT2520NHEGR", name: "LG WashTower™ Objet", category: "Washer", dims: "600x1655x660mm", notes: "Min Height 1.7m." }
];

// --- 主程序 ---
const App = () => {
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState('zh');
  const [activeTab, setActiveTab] = useState('schedule');
  const [role, setRole] = useState<'LSM' | 'LM'>('LSM');
  const [aiInput, setAiInput] = useState('');
  const [aiRes, setAiRes] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const t = LANGUAGES[language];

  useEffect(() => {
    const fb = document.getElementById('loading-fallback');
    if (fb) {
      fb.style.opacity = '0';
      setTimeout(() => fb.remove(), 500);
    }
  }, []);

  const callAI = async () => {
    if (!aiInput.trim()) return;
    setLoading(true);
    setAiRes(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: `Answer sales question for LG Malaysia in ${language}: ${aiInput}` }] }],
        config: { tools: [{ googleSearch: {} }] }
      });
      setAiRes({
        text: result.text,
        sources: result.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web)
      });
    } catch (e) {
      setAiRes({ text: "AI 导师连接异常，请检查网络。" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans">
        <div className="w-full max-w-xs space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#A50034] rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto shadow-xl mb-4">LG</div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">LG Subscribe Pro</h1>
            <div className="mt-4 bg-gray-50 p-1 rounded-full flex gap-1 w-fit mx-auto border border-gray-100">
              {['zh', 'en', 'ms'].map(l => (
                <button key={l} onClick={() => setLanguage(l)} className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${language === l ? 'bg-white text-[#A50034] shadow-sm' : 'text-gray-300'}`}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-2xl">
            <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
              <button onClick={() => setRole('LSM')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${role === 'LSM' ? 'bg-white text-[#A50034] shadow-sm' : 'text-gray-400'}`}>LSM</button>
              <button onClick={() => setRole('LM')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${role === 'LM' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>LM</button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mb-6 font-bold uppercase tracking-widest leading-relaxed">Authorized Access Only<br/>authorized users only</p>
            <button onClick={() => setUser({ role })} className={`w-full py-4 rounded-xl text-white font-black text-xs shadow-lg active:scale-95 transition-all ${role === 'LSM' ? 'bg-[#A50034]' : 'bg-blue-600'}`}>
              {t.login}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans flex flex-col items-center">
      <header className="w-full max-w-md bg-white border-b sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#A50034] rounded flex items-center justify-center text-white font-black text-[10px]">LG</div>
          <span className="font-black text-[#A50034] text-[9px] uppercase tracking-wider">Subscribe Pro</span>
        </div>
        <button onClick={() => setUser(null)} className="text-gray-300 p-2"><LogOut size={16} /></button>
      </header>

      <main className="w-full max-w-md p-4">
        {activeTab === 'schedule' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-black text-gray-800">15</span>
                <span className="text-[10px] font-bold text-gray-300">JANUARY 2026</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-[8px] font-black text-gray-300 uppercase flex items-center gap-1"><Sun size={10} className="text-orange-400" /> {t.am}</div>
                  <div className={`p-2 rounded-xl border text-[10px] font-bold shadow-sm ${getAgentStyle('AgentAlex')}`}>Alex Tan</div>
                  <div className={`p-2 rounded-xl border text-[10px] font-bold shadow-sm ${getAgentStyle('AgentSiti')}`}>Siti Nor</div>
                </div>
                <div className="space-y-2">
                  <div className="text-[8px] font-black text-gray-300 uppercase flex items-center gap-1"><Moon size={10} className="text-blue-400" /> {t.pm}</div>
                  <div className={`p-2 rounded-xl border text-[10px] font-bold shadow-sm ${getAgentStyle('AgentKumar')}`}>Kumar V</div>
                  <div className={`p-2 rounded-xl border text-[10px] font-bold shadow-sm ${getAgentStyle('AgentMei')}`}>Mei Ling</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-50">
              <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="输入销售难题..." className="w-full bg-gray-50 rounded-xl p-4 text-[13px] font-bold border-0 outline-none min-h-[140px] resize-none focus:ring-1 focus:ring-[#A50034]" />
              <button onClick={callAI} disabled={loading || !aiInput} className={`w-full mt-3 py-4 rounded-xl text-white font-black text-xs shadow-lg transition-all ${loading ? 'bg-gray-300' : 'bg-[#A50034] active:scale-95'}`}>
                {loading ? "Thinking..." : "Consult AI Coach"}
              </button>
            </div>
            {aiRes && (
              <div className="bg-white p-6 rounded-[2rem] border border-red-50 shadow-sm animate-in fade-in">
                <div className="text-gray-700 text-[14px] font-medium leading-relaxed italic">{aiRes.text}</div>
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
             <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="text" placeholder="Search..." className="w-full bg-white rounded-2xl pl-10 pr-4 py-3 text-xs font-bold shadow-sm border-0 focus:ring-1 focus:ring-[#A50034]" />
             </div>
             {PRODUCT_DATA.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4 hover:border-red-100 transition-all">
                 <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#A50034] shadow-inner"><Layers size={22} /></div>
                 <div className="flex flex-col flex-1 truncate">
                   <span className="text-[13px] font-black text-gray-800 truncate">{p.name}</span>
                   <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">{p.id} • {p.category}</span>
                 </div>
                 <ChevronRight size={16} className="text-gray-200" />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-6 w-[92%] max-w-[380px] bg-white/95 backdrop-blur-2xl border border-gray-100 flex justify-around items-center px-2 py-2 z-50 rounded-[2rem] shadow-2xl left-1/2 -translate-x-1/2">
        {[
          { id: 'schedule', icon: Calendar, label: t.schedule },
          { id: 'ai', icon: Sparkles, label: t.aiCoach },
          { id: 'salesKit', icon: BookOpen, label: t.salesKit }
        ].map(tab => (
           <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center flex-1 py-1 transition-all ${activeTab === tab.id ? 'text-[#A50034]' : 'text-gray-300'}`}>
              <tab.icon size={18} className={activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
              <span className="text-[8px] mt-1 font-bold tracking-tight">{tab.label}</span>
           </button>
        ))}
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
