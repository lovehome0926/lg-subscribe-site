import React, { useState, useEffect } from 'react';
import { Copy, Check, Share2, Rocket, ShieldCheck, Zap, ArrowRight, UserCheck, DollarSign, Target } from 'lucide-react';

const AgentTools: React.FC = () => {
  const [waNumber, setWaNumber] = useState('');
  const [name, setName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // 模拟计算器
  const [estSales, setEstSales] = useState(5);
  const avgCommission = 350; // 假设平均每台佣金 RM350

  useEffect(() => {
    setWaNumber(localStorage.getItem('my_agent_wa') || '');
    setName(localStorage.getItem('my_agent_name') || '');
    window.scrollTo(0, 0);
  }, []);

  const generateLink = () => {
    if (!waNumber || !name) {
      alert("Please fill in both fields.");
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
    <div className="container mx-auto px-6 py-24 md:py-32 max-w-7xl animate-in fade-in duration-1000">
      
      {/* Header Banner - More Dynamic */}
      <div className="bg-[#05090f] text-white rounded-[40px] md:rounded-[80px] p-10 md:p-24 shadow-3xl mb-16 relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-lg-red/30 to-transparent skew-x-12 translate-x-32"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="max-w-2xl space-y-8 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <ShieldCheck className="text-lg-red" size={24} />
              <span className="text-lg-red text-[10px] font-black uppercase tracking-[0.6em]">Partner Engine 2.0</span>
            </div>
            <h1 className="text-5xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-4">
              Your Business,<br/><span className="text-lg-red">Your Empire.</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[11px] md:text-sm leading-loose max-w-md mx-auto md:mx-0">
              Generate your personalized showroom. All inquiries go directly to your WhatsApp. Commission is automatically attributed to you.
            </p>
          </div>
          <div className="hidden md:flex w-40 h-40 bg-white/5 rounded-full items-center justify-center text-lg-red border border-white/10 animate-pulse">
            <Rocket size={64} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Left: Configuration & Link */}
        <div className="space-y-12">
          <div className="bg-white p-10 md:p-16 rounded-[60px] border border-gray-100 shadow-xl space-y-12">
             <div className="flex items-center justify-between">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">1. Activate Showroom</h3>
                <UserCheck className="text-lg-red" size={32} />
             </div>
             <div className="space-y-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2 block">Agent Full Name</label>
                  <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full p-6 md:p-8 bg-gray-50 rounded-[30px] outline-none font-black text-lg border border-transparent focus:border-lg-red focus:bg-white transition-all shadow-inner" 
                    placeholder="e.g. Michael Tan" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2 block">WhatsApp (e.g. 60123456789)</label>
                  <input 
                    value={waNumber} 
                    onChange={e => setWaNumber(e.target.value)} 
                    className="w-full p-6 md:p-8 bg-gray-50 rounded-[30px] outline-none font-black text-lg border border-transparent focus:border-lg-red focus:bg-white transition-all shadow-inner" 
                    placeholder="601XXXXXXXX" 
                  />
                </div>
                <button 
                  onClick={generateLink} 
                  className="w-full group bg-lg-red text-white py-8 rounded-full font-black uppercase text-[12px] tracking-[0.4em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-4"
                >
                  Generate My Showroom <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                </button>
             </div>
          </div>

          {generatedLink && (
            <div className="bg-lg-dark p-10 md:p-16 rounded-[60px] text-white shadow-3xl space-y-10 animate-in zoom-in-95 duration-700">
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">2. Your Unique Link</h3>
                  <Zap className="text-amber-400" size={32} fill="currentColor" />
               </div>
               <div className="p-8 bg-white/5 rounded-[35px] font-mono text-[10px] md:text-[11px] break-all leading-relaxed border border-white/10 text-white/50 select-all shadow-inner">
                 {generatedLink}
               </div>
               <button 
                onClick={copyToClipboard}
                className={`w-full py-8 rounded-full font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-4 transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-lg-red hover:text-white'}`}
               >
                 {copied ? <><Check size={18}/> Link Copied!</> : <><Copy size={18}/> Copy & Start Promoting</>}
               </button>
               <div className="pt-8 border-t border-white/5 flex gap-6 items-start">
                  <div className="w-12 h-12 bg-lg-red/20 rounded-2xl flex items-center justify-center text-lg-red shrink-0">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-white/90">30-Day Attribution</p>
                    <p className="text-[10px] text-white/30 font-bold mt-2 uppercase leading-relaxed">
                      Once a customer clicks your link, they are tagged to you for 30 days. No matter what they browse, you get the credit.
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Right: Commission Simulator */}
        <div className="space-y-12">
          <div className="bg-white p-10 md:p-16 rounded-[60px] border border-gray-100 shadow-xl space-y-10">
            <div className="flex items-center gap-4">
              <DollarSign className="text-lg-red" size={32} />
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Earnings Simulator</h3>
            </div>
            
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                   <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Target Monthly Sales</label>
                   <span className="text-4xl font-black text-gray-950">{estSales} <span className="text-sm text-gray-300">UNITS</span></span>
                </div>
                <input 
                  type="range" min="1" max="50" step="1" 
                  value={estSales} 
                  onChange={e => setEstSales(Number(e.target.value))}
                  className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-lg-red"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gray-50 p-8 rounded-[40px] flex justify-between items-center shadow-inner">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">Monthly Commission</p>
                      <p className="text-3xl font-black text-gray-950">RM { (estSales * avgCommission).toLocaleString() }</p>
                   </div>
                   <Target className="text-gray-200" size={32} />
                </div>
                
                <div className="bg-lg-red text-white p-10 rounded-[45px] relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl -translate-y-10 translate-x-10"></div>
                   <div className="relative z-10 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Estimated Annual Income</p>
                      <p className="text-5xl md:text-6xl font-black tracking-tighter">RM { (estSales * avgCommission * 12).toLocaleString() }</p>
                   </div>
                </div>
              </div>

              <div className="p-8 border border-dashed border-gray-100 rounded-[35px] space-y-4">
                <p className="text-[11px] font-black uppercase text-gray-400 text-center tracking-widest">Included Incentives</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['13% Basic', '3M Rental', 'Volume Bonus'].map(v => (
                    <span key={v} className="bg-gray-50 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-gray-100 text-gray-500">{v}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#05090f] p-10 md:p-16 rounded-[60px] text-white space-y-8">
             <h4 className="text-xl font-black uppercase tracking-tighter">Quick Strategy</h4>
             <ul className="space-y-6">
               <li className="flex gap-5">
                 <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-black">1</div>
                 <p className="text-[11px] font-bold text-white/50 uppercase tracking-tight">Share your link in WhatsApp groups and Facebook Community.</p>
               </li>
               <li className="flex gap-5">
                 <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-black">2</div>
                 <p className="text-[11px] font-bold text-white/50 uppercase tracking-tight">Explain the RM1 / Day promotion to attract high volume.</p>
               </li>
               <li className="flex gap-5">
                 <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[10px] font-black">3</div>
                 <p className="text-[11px] font-bold text-white/50 uppercase tracking-tight">Direct customers to specific products using your link hash.</p>
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentTools;