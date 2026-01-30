
import React, { useState, useEffect } from 'react';

const AgentTools: React.FC = () => {
  const [agentId, setAgentId] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [name, setName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    setAgentId(localStorage.getItem('my_agent_id') || '');
    setWaNumber(localStorage.getItem('my_agent_wa') || '');
    setName(localStorage.getItem('my_agent_name') || '');
  }, []);

  const generateLink = () => {
    if (!agentId || !waNumber || !name) {
      alert("Please fill in all details to generate your link.");
      return;
    }
    const baseUrl = window.location.origin + window.location.pathname;
    const cleanWa = waNumber.replace(/\D/g, '');
    const link = `${baseUrl}?agent=${encodeURIComponent(agentId)}&name=${encodeURIComponent(name)}&wa=${cleanWa}#home`;
    setGeneratedLink(link);
    
    localStorage.setItem('my_agent_id', agentId);
    localStorage.setItem('my_agent_wa', cleanWa);
    localStorage.setItem('my_agent_name', name);
  };

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    alert(msg);
  };

  return (
    <div className="container mx-auto px-6 py-24 max-w-6xl fade-in">
      <div className="bg-gray-950 text-white rounded-[70px] p-12 lg:p-20 shadow-3xl mb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-lg-red/10 skew-x-12 pointer-events-none"></div>
        <div className="relative z-10">
          <a href="#home" className="text-lg-red font-black text-[10px] uppercase tracking-widest mb-10 inline-block hover:scale-105 transition">← Back Showroom</a>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-6">AFFILIATE<br/><span className="text-lg-red italic">HUB.</span></h1>
          <p className="text-gray-500 text-lg font-medium max-w-md uppercase tracking-widest">Generate your unique store link and start earning commissions today.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 bg-white p-12 rounded-[60px] border border-gray-100 shadow-xl">
           <h3 className="text-2xl font-black uppercase tracking-tighter mb-10">Set Up Profile</h3>
           <div className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 block">Display Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold border border-transparent focus:border-lg-red transition" placeholder="e.g. LG Specialist Ali" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3 block">Your WhatsApp (601...)</label>
                <input value={waNumber} onChange={e => setWaNumber(e.target.value)} className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold border border-transparent focus:border-lg-red transition" placeholder="60123456789" />
              </div>
              <button onClick={generateLink} className="w-full bg-lg-red text-white py-6 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition active:scale-95">Generate Official Link</button>
           </div>
        </div>

        <div className="lg:col-span-7">
           {generatedLink ? (
             <div className="space-y-8">
                <div className="bg-white p-12 rounded-[60px] border border-gray-100 shadow-xl">
                   <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Your Store Link</h3>
                   <div className="p-8 bg-gray-50 rounded-[35px] font-mono text-[10px] break-all border border-gray-100 mb-8 select-all leading-relaxed text-gray-600">
                     {generatedLink}
                   </div>
                   <button onClick={() => copyToClipboard(generatedLink, "Link copied!")} className="w-full bg-gray-950 text-white py-6 rounded-full font-black text-[10px] uppercase tracking-widest">Copy Link</button>
                </div>
                <div className="bg-red-50 p-10 rounded-[60px] border border-red-100 flex items-center gap-6">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm">💰</div>
                   <div>
                      <h4 className="font-black uppercase text-sm tracking-tight">Commission Attribution</h4>
                      <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed mt-1">All sales signed through this link will be tracked to your ID. Guaranteed direct payment.</p>
                   </div>
                </div>
             </div>
           ) : (
             <div className="h-full border-4 border-dashed border-gray-50 rounded-[60px] flex flex-col items-center justify-center p-20 text-center">
                <div className="text-5xl opacity-10 mb-6">🚀</div>
                <h4 className="text-2xl font-black uppercase text-gray-200 tracking-tighter">Ready to Start?</h4>
                <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mt-2">Enter your details to generate your marketing engine.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AgentTools;
