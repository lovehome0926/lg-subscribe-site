
import React, { useState, useEffect } from 'react';
import { SiteSettings, Language } from '../types.ts';
import { Link2, Copy, Check, User, Phone } from 'lucide-react';

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

  const generateLink = () => {
    if (!waNumber || !name) return alert("请填写完整信息 / Please fill all info");
    const cleanWa = waNumber.replace(/\D/g, '');
    const baseUrl = window.location.origin + window.location.pathname;
    // 生成链接：包含 wa 和 name 参数
    const link = `${baseUrl}?wa=${cleanWa}&name=${encodeURIComponent(name)}#home`;
    setGeneratedLink(link);
    localStorage.setItem('my_agent_wa', cleanWa);
    localStorage.setItem('my_agent_name', name);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-lg-dark text-white rounded-[50px] p-12 md:p-20 shadow-3xl mb-12">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">Partner <span className="text-lg-red">Link Engine.</span></h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest leading-loose">输入您的资料，生成专属推广链接。客户通过此链接访问后，商城所有咨询将导向您的 WhatsApp。</p>
        </div>

        <div className="bg-white p-12 rounded-[50px] border border-gray-100 shadow-2xl space-y-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-lg-red tracking-widest flex items-center gap-2"><User size={12}/> Agent Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full p-6 bg-gray-50 rounded-[25px] font-black outline-none focus:ring-2 focus:ring-lg-red" placeholder="例如：Alex Wong" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-lg-red tracking-widest flex items-center gap-2"><Phone size={12}/> WhatsApp Number</label>
              <input value={waNumber} onChange={e => setWaNumber(e.target.value)} className="w-full p-6 bg-gray-50 rounded-[25px] font-black outline-none focus:ring-2 focus:ring-lg-red" placeholder="例如：60123456789" />
            </div>
          </div>

          <button onClick={generateLink} className="w-full bg-black text-white py-8 rounded-full font-black uppercase tracking-widest hover:bg-lg-red transition-all shadow-xl active:scale-95 transition-transform">Generate My Partner Link</button>

          {generatedLink && (
            <div className="p-8 bg-rose-50 rounded-[35px] border border-rose-100 space-y-6 animate-fade-up">
               <p className="text-[10px] font-black text-lg-red uppercase tracking-widest">您的专属推广链接 (已生成)：</p>
               <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 bg-white p-6 rounded-2xl text-[11px] font-mono break-all border border-rose-200 shadow-inner">{generatedLink}</div>
                  <button onClick={copyToClipboard} className="bg-lg-red text-white p-6 rounded-2xl flex items-center justify-center shrink-0 shadow-lg hover:bg-black transition-colors">
                    {copied ? <Check size={24}/> : <Copy size={24}/>}
                  </button>
               </div>
               <p className="text-[10px] font-bold text-rose-300 italic">复制上方链接，分发至社交媒体。通过此链接访问的客户，其所有咨询将自动带有您的推广标识。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentTools;
