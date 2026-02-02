import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShieldCheck, CheckCircle, ArrowRight, Zap, 
  Lock, Link as LinkIcon, Users, Trash2, 
  Check, Star, Menu, X, Globe, PhoneCall
} from 'lucide-react';

// --- Configuration & Constants ---
const DEFAULT_WA = "60177473787";
const ADMIN_PIN = "8888";

const PRODUCTS = [
  {
    id: 'WP-PURI-V',
    category: 'Water Purifier',
    name: 'PuriCare™ Tankless',
    subName: { 
      cn: '无水箱净水机', 
      en: 'Tankless Self-Service',
      ms: 'Penapis Air Tanpa Tangki' 
    },
    image: 'https://www.lg.com/content/dam/channel/wcms/my/images/water-purifiers/wd516an_answ_e_my_c/gallery/dz-01.jpg',
    price: 60,
    isHot: true
  },
  {
    id: 'AC-V13ENS',
    category: 'Air Conditioner',
    name: 'DUALCOOL™ Premium',
    subName: { 
      cn: '双变频冷气机', 
      en: 'Inverter Smart AC',
      ms: 'Penyaman Udara Inverter' 
    },
    image: 'https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg',
    price: 45,
    isHot: true
  },
  {
    id: 'REF-SIDE',
    category: 'Refrigerator',
    name: 'Side-by-Side Inverter',
    subName: { 
      cn: '对开门变频冰箱', 
      en: 'Large Capacity Cooling',
      ms: 'Peti Sejuk Kapasiti Besar' 
    },
    image: 'https://www.lg.com/content/dam/channel/wcms/my/images/refrigerators/gr-b247sluv_asbp_e_my_c/gallery/dz-01.jpg',
    price: 150,
    isHot: false
  }
];

const App = () => {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [lang, setLang] = useState<'cn' | 'en' | 'ms'>('cn');
  const [isAdmin, setIsAdmin] = useState(false);
  const [agents, setAgents] = useState<{name: string, wa: string}[]>(() => 
    JSON.parse(localStorage.getItem('lg_affiliates_v4') || '[]')
  );
  const [activeAgent, setActiveAgent] = useState<{name: string, wa: string} | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Affiliate logic: identify active agent from URL or session
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wa = params.get('wa');
    const name = params.get('name');
    
    if (wa) {
      // Direct referral link
      const agent = { name: name || 'Authorized Partner', wa: wa.replace(/\D/g, '') };
      setActiveAgent(agent);
      localStorage.setItem('last_active_agent', JSON.stringify(agent));
    } else {
      const saved = localStorage.getItem('last_active_agent');
      if (saved) setActiveAgent(JSON.parse(saved));
    }
  }, []);

  const t = {
    cn: { 
      hero: "科技定义优雅", 
      sub: "LG Subscribe 马来西亚认证合作伙伴。解锁极简高端生活。", 
      explore: "立即浏览展厅", 
      partner: "您的专属顾问", 
      showroom: "高端数字化展厅", 
      join: "想成为合作伙伴？", 
      inquire: "立即咨询",
      perMo: "月付低至"
    },
    en: { 
      hero: "ELEGANCE IN TECH", 
      sub: "LG Subscribe Malaysia Certified Partner. Premium living unlocked.", 
      explore: "Explore Showroom", 
      partner: "Your Consultant", 
      showroom: "Digital Showroom", 
      join: "Want to join us?", 
      inquire: "Inquire Now",
      perMo: "Monthly From"
    },
    ms: { 
      hero: "KEANGGUNAN TEKNOLOGI", 
      sub: "Rakan Kongsi Sah LG Subscribe Malaysia. Kehidupan premium kini dibuka.", 
      explore: "Teroka Koleksi", 
      partner: "Perunding Anda", 
      showroom: "Bilik Pameran Digital", 
      join: "Sertai Kami?", 
      inquire: "Hubungi Sekarang",
      perMo: "Bulanan Dari"
    }
  }[lang];

  const handleCopyLink = (agent: {name: string, wa: string}) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?wa=${agent.wa}&name=${encodeURIComponent(agent.name)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(agent.wa);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 h-20 premium-blur flex items-center px-6 justify-between border-b border-gray-100">
        <div className="flex items-center gap-10">
          <button onClick={() => setView('home')} className="hover:opacity-80 transition-opacity">
            <img src="https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png" className="h-6" alt="LG" />
          </button>
          <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <button onClick={() => setView('home')} className={view === 'home' ? 'text-lg-red' : 'hover:text-gray-950 transition-colors'}>Showroom</button>
            <button onClick={() => setView('admin')} className={view === 'admin' ? 'text-lg-red' : 'hover:text-gray-950 transition-colors'}>Admin</button>
          </div>
        </div>
        <div className="flex gap-2">
          {(['cn', 'en', 'ms'] as const).map(l => (
            <button 
              key={l} 
              onClick={() => setLang(l)} 
              className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${lang === l ? 'bg-lg-red text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </nav>

      {view === 'home' ? (
        <div className="pt-20">
          {/* Hero Section */}
          <section className="bg-lg-pearl py-24 md:py-40 px-6 overflow-hidden relative">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10 animate-fade-up">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                  <ShieldCheck size={14} className="text-lg-red"/> Certified LG Partner Malaysia
                </span>
                <h1 className="text-6xl md:text-[90px] font-black uppercase leading-[0.85] tracking-tighter text-gray-950">
                  {t.hero}
                </h1>
                <p className="text-gray-400 font-medium text-lg max-w-md">{t.sub}</p>
                <button 
                  onClick={() => document.getElementById('collection')?.scrollIntoView({behavior: 'smooth'})}
                  className="bg-lg-red text-white px-12 py-6 rounded-full font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-lg-dark transition-all"
                >
                  {t.explore}
                </button>
              </div>
              <div className="relative animate-fade-up" style={{animationDelay: '0.2s'}}>
                <div className="absolute inset-0 bg-white/60 blur-3xl rounded-full scale-75"></div>
                <img src="https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg" className="w-full h-auto drop-shadow-3xl relative z-10" alt="Hero Product" />
              </div>
            </div>
          </section>

          {/* Active Agent Floating Badge */}
          {activeAgent && (
            <div className="sticky top-24 z-40 flex justify-center px-6 -mt-10 pointer-events-none">
              <div className="premium-blur shadow-premium rounded-full px-10 py-5 flex items-center gap-8 pointer-events-auto animate-fade-up">
                <div className="flex items-center gap-5 border-r pr-8 border-gray-100">
                  <div className="w-12 h-12 bg-lg-red rounded-full flex items-center justify-center text-white shadow-lg"><Star size={22} fill="currentColor"/></div>
                  <div className="text-left">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">{t.partner}</span>
                    <span className="text-sm font-black uppercase text-gray-950 mt-1">{activeAgent.name}</span>
                  </div>
                </div>
                <a href={`https://wa.me/${activeAgent.wa}?text=Hi, I am interested in LG products from your showroom.`} target="_blank" className="text-[10px] font-black text-lg-red uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
                  {t.inquire} <ArrowRight size={14}/>
                </a>
              </div>
            </div>
          )}

          {/* Product Collection */}
          <section id="collection" className="py-32 max-w-7xl mx-auto px-6">
            <div className="text-center mb-24 animate-fade-up">
              <span className="text-lg-red font-black uppercase tracking-[0.5em] text-[10px] mb-4 block">{t.showroom}</span>
              <h2 className="text-5xl font-black uppercase tracking-tighter">Premium Collection.</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {PRODUCTS.map(p => (
                <div key={p.id} className="bg-white rounded-[40px] p-10 border border-gray-100 flex flex-col group hover:shadow-premium transition-all duration-700 animate-fade-up">
                  <div className="flex justify-between mb-8">
                     <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{p.category}</span>
                     {p.isHot && <span className="bg-lg-red text-white text-[8px] font-black px-3 py-1 rounded-full uppercase">Hot Sale</span>}
                  </div>
                  <div className="aspect-square mb-10 flex items-center justify-center relative">
                     <div className="absolute inset-0 bg-lg-pearl rounded-full scale-90 group-hover:scale-100 transition-transform duration-700"></div>
                     <img src={p.image} className="max-h-[85%] object-contain relative z-10 group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                  </div>
                  <h3 className="text-2xl font-black uppercase leading-none mb-2 group-hover:text-lg-red transition-colors">{p.name}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-10">{p.subName[lang]}</p>
                  <div className="mt-auto pt-8 border-t border-gray-50 flex items-end justify-between">
                     <div>
                       <span className="text-lg-red text-[10px] font-black uppercase tracking-widest block mb-1">{t.perMo}</span>
                       <div className="flex items-baseline gap-1">
                         <span className="text-4xl font-black text-gray-950 tracking-tighter">RM{p.price}</span>
                         <span className="text-[10px] font-bold text-gray-300 uppercase">/Mo</span>
                       </div>
                     </div>
                     <a href={`https://wa.me/${activeAgent?.wa || DEFAULT_WA}?text=Hi, I am interested in ${p.name} (${p.id})`} target="_blank" className="bg-gray-950 text-white p-5 rounded-full hover:bg-lg-red transition-all shadow-xl group-hover:translate-x-1">
                        <ArrowRight size={20} />
                     </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Recruitment */}
          <footer className="bg-lg-dark text-white py-32 px-6">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter max-w-3xl leading-[0.9]">
                {t.join} <br/>
                <span className="text-lg-red">Earn 13% Commission</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-10 opacity-60 text-[10px] font-bold uppercase tracking-widest">
                <span>Nationwide Coverage</span>
                <span>Direct Official Service</span>
                <span>Zero Inventory</span>
              </div>
              <a href={`https://wa.me/${DEFAULT_WA}?text=Hi, I want to inquire about the LG partner program.`} className="bg-white text-lg-dark px-16 py-6 rounded-full font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-lg-red hover:text-white transition-all">
                Contact for Partnership
              </a>
              <div className="pt-10 opacity-20 text-[9px] font-black uppercase tracking-widest border-t border-white/5 w-full">
                © 2025 LG Subscribe Digital Partner Hub Malaysia
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* Admin Console */
        <div className="pt-32 px-6 max-w-4xl mx-auto min-h-screen">
          {!isAdmin ? (
            <div className="text-center py-20 space-y-10">
               <div className="w-24 h-24 bg-lg-red/5 rounded-full flex items-center justify-center mx-auto text-lg-red"><Lock size={48} /></div>
               <h2 className="text-3xl font-black uppercase tracking-tighter">Admin Authorization</h2>
               <div className="space-y-4 max-w-xs mx-auto">
                 <button onClick={() => { if(prompt("Enter Admin PIN") === ADMIN_PIN) setIsAdmin(true) }} className="w-full bg-black text-white px-16 py-6 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-lg-red transition-colors">Unlock Dashboard</button>
               </div>
            </div>
          ) : (
            <div className="space-y-16 animate-fade-up pb-32">
               <div className="bg-lg-dark text-white p-12 rounded-[50px] shadow-3xl">
                  <div className="flex justify-between items-center mb-12">
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Affiliate Console</h1>
                    <button onClick={() => setIsAdmin(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10"><X size={20}/></button>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Agent Name</label>
                        <input id="pname" placeholder="e.g. Alex Wong" className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl outline-none text-sm font-bold focus:border-lg-red transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">WA Number</label>
                        <input id="pwa" placeholder="60123456789" className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl outline-none text-sm font-bold focus:border-lg-red transition-all" />
                     </div>
                     <div className="flex items-end">
                        <button onClick={() => {
                          const nInput = document.getElementById('pname') as HTMLInputElement;
                          const wInput = document.getElementById('pwa') as HTMLInputElement;
                          const n = nInput.value;
                          const w = wInput.value.replace(/\D/g, '');
                          if(!n || !w) return alert("Please fill all fields");
                          const updated = [...agents, { name: n, wa: w }];
                          setAgents(updated);
                          localStorage.setItem('lg_affiliates_v4', JSON.stringify(updated));
                          nInput.value = '';
                          wInput.value = '';
                        }} className="w-full bg-lg-red text-white py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-white hover:text-lg-red transition-all">Authorize Agent</button>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                    Active Partners <span className="text-sm px-4 py-1.5 bg-gray-100 rounded-full text-gray-400">{agents.length}</span>
                  </h3>
                  
                  <div className="grid gap-6">
                    {agents.map(a => (
                      <div key={a.wa} className="bg-white p-8 rounded-[40px] border border-gray-100 flex flex-col md:flex-row justify-between items-center shadow-sm hover:shadow-premium transition-all">
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-lg-red"><CheckCircle size={28}/></div>
                            <div>
                              <p className="font-black uppercase text-xl leading-none">{a.name}</p>
                              <p className="text-[10px] font-bold text-gray-300 mt-2 uppercase tracking-widest">WhatsApp: {a.wa}</p>
                            </div>
                         </div>
                         <div className="flex gap-3 mt-6 md:mt-0">
                            <button onClick={() => handleCopyLink(a)} className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-3 ${copiedId === a.wa ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-black hover:text-white'}`}>
                              {copiedId === a.wa ? <Check size={16}/> : <LinkIcon size={16}/>}
                              {copiedId === a.wa ? 'Copied' : 'Copy Promo Link'}
                            </button>
                            <button onClick={() => {
                              if(confirm("Confirm removal of this agent's authorization?")) {
                                const filtered = agents.filter(x => x.wa !== a.wa);
                                setAgents(filtered);
                                localStorage.setItem('lg_affiliates_v4', JSON.stringify(filtered));
                              }
                            }} className="p-4 bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 size={20}/>
                            </button>
                         </div>
                      </div>
                    ))}
                    {agents.length === 0 && (
                      <div className="py-20 text-center border-4 border-dashed rounded-[40px] border-gray-50 text-gray-300 font-black uppercase text-xs tracking-[0.5em]">
                        No authorized partners found
                      </div>
                    )}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}