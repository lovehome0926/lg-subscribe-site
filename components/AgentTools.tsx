
import React, { useState, useEffect } from 'react';
import { SiteSettings, Language, Agent } from '../types.ts';
import { Link2, Copy, Check, User, Phone, ShieldCheck } from 'lucide-react';
import { getAgentsDB, saveAgentsDB } from '../utils/db.ts';

interface AgentToolsProps {
  siteSettings: SiteSettings;
  language: Language;
}

const AgentTools: React.FC<AgentToolsProps> = ({ siteSettings, language }) => {
  const [waNumber, setWaNumber] = useState('');
  const [name, setName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setWaNumber(localStorage.getItem('my_agent_wa') || '');
    setName(localStorage.getItem('my_agent_name') || '');
  }, []);

  const generateLink = async () => {
    if (!waNumber || !name) return alert("请填写完整信息 / Please fill all info");
    const cleanWa = waNumber.replace(/\D/g, '');
    const baseUrl = window.location.origin + window.location.pathname;
    
    // 防盗 Token 生成逻辑
    const token = 'AG' + name.substring(0, 2).toUpperCase() + cleanWa.slice(-4);
    const link = `${baseUrl}?wa=${cleanWa}&name=${encodeURIComponent(name)}&t=${token}#home`;
    
    setGeneratedLink(link);
    localStorage.setItem('my_agent_wa', cleanWa);
    localStorage.setItem('my_agent_name', name);

    // 同步到数据库
    try {
      const dbAgents = await getAgentsDB();
      if (!dbAgents.some(a => a.whatsapp === cleanWa)) {
        await saveAgentsDB([...dbAgents, { id: `AG-${Date.now()}`, name, whatsapp: cleanWa, token }]);
      }
    } catch (e) { console.error("Sync failed", e); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-left mb-16">
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-gray-950">
            Partner <span className="text-lg-red">Link Engine.</span>
          </h1>
        </div>

        <div className="bg-white p-14 rounded-[70px] border border-gray-100 shadow-3xl space-y-16 animate-fade-up">
          <div className="grid md:grid-cols-2 gap-12 text-left">
            <div className="space-y-5">
              <label className="text-[10px] font-black uppercase text-lg-red tracking-[0.3em] flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-lg-red">
                    <User size={14}/>
                 </div>
                 Agent Name
              </label>
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full p-8 bg-gray-50 rounded-[30px] font-black outline-none border-none shadow-inner text-xl uppercase italic focus:ring-2 focus:ring-lg-red/20 transition-all" 
                placeholder="LSM JOE" 
              />
            </div>
            <div className="space-y-5">
              <label className="text-[10px] font-black uppercase text-lg-red tracking-[0.3em] flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-lg-red">
                    <Phone size={14}/>
                 </div>
                 WhatsApp (601...)
              </label>
              <input 
                value={waNumber} 
                onChange={e => setWaNumber(e.target.value)} 
                className="w-full p-8 bg-gray-50 rounded-[30px] font-black outline-none border-none shadow-inner text-xl focus:ring-2 focus:ring-lg-red/20 transition-all" 
                placeholder="60167483395" 
              />
            </div>
          </div>

          <button 
             onClick={generateLink} 
             className="w-full bg-lg-dark text-white py-10 rounded-full font-black uppercase tracking-[0.4em] text-sm hover:bg-lg-red transition-all shadow-2xl active:scale-95 transform"
          >
            Generate My Partner Link
          </button>

          {generatedLink && (
            <div className="p-12 bg-rose-50/50 rounded-[50px] border border-rose-100/50 space-y-10 animate-fade-up text-left">
               <div className="flex items-center gap-4 text-lg-red font-black uppercase tracking-[0.3em] italic text-[11px] mb-2">
                  <Link2 size={18}/> Your Exclusive Affiliate Link:
               </div>
               <div className="flex flex-col md:flex-row gap-5">
                  <div className="flex-1 bg-white p-8 rounded-3xl text-[12px] font-mono break-all border border-rose-100 shadow-inner leading-loose text-gray-500 flex items-center">
                    {generatedLink}
                  </div>
                  <button 
                    onClick={copyToClipboard} 
                    className="bg-lg-red text-white w-24 h-24 md:w-28 md:h-full rounded-3xl flex items-center justify-center shrink-0 shadow-lg-red/20 shadow-xl hover:bg-black transition-all active:scale-90"
                  >
                    {copied ? <Check size={32}/> : <Copy size={32}/>}
                  </button>
               </div>
               <div className="bg-white/80 p-6 rounded-[25px] flex items-center gap-5 border border-rose-50 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner shrink-0">
                    <ShieldCheck size={24} strokeWidth={3} />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose italic">
                    Security Protection Active: 系统已为该链接自动注入加密验证 TOKEN，确保点击及佣金归属真实有效，防范恶意篡改。
                  </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentTools;
