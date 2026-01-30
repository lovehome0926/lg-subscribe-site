import React, { useState, useEffect } from 'react';
import { Copy, Check, Share2, Rocket, ShieldCheck, Zap, ArrowRight, UserCheck } from 'lucide-react';

const AgentTools: React.FC = () => {
  const [waNumber, setWaNumber] = useState('');
  const [name, setName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setWaNumber(localStorage.getItem('my_agent_wa') || '');
    setName(localStorage.getItem('my_agent_name') || '');
  }, []);

  const generateLink = () => {
    if (!waNumber || !name) {
      alert("Please enter both Name and WhatsApp.");
      return;
    }
    const cleanWa = waNumber.replace(/\D/g, '');
    const baseUrl = window.location.origin + window.location.pathname;
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
    <div className="container mx-auto px-6 py-32 max-w-6xl animate-in fade-in duration-1000">
      
      {/* Header Banner */}
      <div className="bg-[#05090f] text-white rounded-[60px] p-16 lg:p-24 shadow-3xl mb-16 relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-lg-red/20 to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="max-w-2xl space-y-8">
            <div className="flex items-center gap-4">
              <ShieldCheck className="text-lg-red" size={24} />
              <span className="text-lg-red text-[11px] font-black uppercase tracking-[0.8em]">Partner Program</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8]">
              Grow Your<br/><span className="text-lg-red">Empire.</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-sm leading-loose max-w-md">
              Generate your unique digital showroom link. All customer inquiries will be routed directly to your personal WhatsApp.
            </p>
          </div>
          <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center text-lg-red border border-white/10 animate-bounce-slow">
            <Rocket size={56} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        {/* Profile Card */}
        <div className="bg-white p-16 rounded-[60px] border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.05)] space-y-12">
           <div className="flex items-center justify-between">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Profile Setup</h3>
              <UserCheck className="text-gray-200" size={32} />
           </div>
           <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2 block">Display Name</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full p-7 bg-gray-50 rounded-[30px] outline-none font-black text-[15px] border border-transparent focus:border-lg-red focus:bg-white transition-all shadow-inner" 
                  placeholder="e.g. David LG Expert" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2 block">WhatsApp Number (Start with 60)</label>
                <input 
                  value={waNumber} 
                  onChange={e => setWaNumber(e.target.value)} 
                  className="w-full p-7 bg-gray-50 rounded-[30px] outline-none font-black text-[15px] border border-transparent focus:border-lg-red focus:bg-white transition-all shadow-inner" 
                  placeholder="60123456789" 
                />
              </div>
              <button 
                onClick={generateLink} 
                className="w-full group bg-lg-red text-white py-7 rounded-full font-black uppercase text-[12px] tracking-[0.4em] shadow-[0_20px_50px_rgba(230,0,68,0.25)] hover:scale-105 hover:bg-[#05090f] transition-all flex items-center justify-center gap-4"
              >
                Sync Profile <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </div>

        {/* Link Result / Preview */}
        <div className="flex flex-col gap-8">
          {generatedLink ? (
            <div className="bg-[#05090f] p-16 rounded-[60px] text-white shadow-3xl space-y-10 animate-in zoom-in-95 duration-700">
               <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Your Engine Link</h3>
                  <Zap className="text-amber-400" size={32} fill="currentColor" />
               </div>
               <div className="p-10 bg-white/5 rounded-[40px] font-mono text-[11px] break-all leading-relaxed border border-white/10 text-white/40 select-all shadow-inner">
                 {generatedLink}
               </div>
               <div className="flex flex-col gap-4">
                 <button 
                  onClick={copyToClipboard}
                  className={`w-full py-7 rounded-full font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-4 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-lg-red hover:text-white'}`}
                 >
                   {copied ? <><Check size={18}/> Link Secured</> : <><Copy size={18}/> Copy Your Link</>}
                 </button>
                 
                 <div className="pt-8 mt-4 border-t border-white/5 flex items-start gap-6">
                   <div className="w-12 h-12 bg-lg-red/20 rounded-[18px] flex items-center justify-center text-lg-red shrink-0">
                     <ShieldCheck size={24} />
                   </div>
                   <div className="space-y-2">
                     <p className="text-[12px] font-black uppercase tracking-widest text-white/80">Persistent Attribution</p>
                     <p className="text-[10px] text-white/30 font-bold uppercase leading-relaxed tracking-tight">
                       This link uses 30-day browser caching. Once a customer visits via your link, all inquiries are credited to you for 30 days.
                     </p>
                   </div>
                 </div>
               </div>
            </div>
          ) : (
            <div className="h-full border-4 border-dashed border-gray-100 rounded-[60px] flex flex-col items-center justify-center p-24 text-center group hover:border-lg-red/20 transition-all">
               <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-10 group-hover:scale-110 group-hover:bg-red-50 group-hover:text-lg-red transition-all duration-700">
                 <Share2 size={48}/>
               </div>
               <h4 className="text-2xl font-black uppercase text-gray-300">Awaiting Profile Sync</h4>
               <p className="text-[10px] text-gray-200 font-black uppercase tracking-[0.4em] mt-6 leading-loose max-w-xs">
                 Configure your downline details on the left to activate your engine.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentTools;