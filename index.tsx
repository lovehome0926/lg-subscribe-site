import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ShieldCheck, CheckCircle, ArrowRight, Zap, 
  Lock, Link as LinkIcon, Users, Trash2, 
  Copy, Check, MessageSquare, Menu, X, Star
} from 'lucide-react';

// --- Constants ---
const DEFAULT_WA = "60177473787";
const ADMIN_PIN = "8888";

const PRODUCTS = [
  {
    id: 'WP-PURI-V',
    category: 'Water Purifier',
    name: 'PuriCare™ Self-Service',
    subName: { cn: '无水箱净水机', en: 'Tankless Water Purifier', ms: 'Penapis Air Tanpa Tangki' },
    image: 'https://www.lg.com/content/dam/channel/wcms/my/images/water-purifiers/wd516an_answ_e_my_c/gallery/dz-01.jpg',
    price: 60,
    isHot: true,
    features: ['Auto Sterilization', 'Voice Guidance', 'Tankless Technology']
  },
  {
    id: 'AC-V13ENS',
    category: 'Air Conditioner',
    name: 'DUALCOOL™ Premium',
    subName: { cn: '双变频冷气机', en: 'Inverter Air Conditioner', ms: 'Penyaman Udara Inverter' },
    image: 'https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg',
    price: 45,
    isHot: true,
    features: ['Fast Cooling', 'Energy Saving', 'Fine Dust Filter']
  },
  {
    id: 'REF-SIDE',
    category: 'Refrigerator',
    name: 'Side-by-Side Inverter',
    subName: { cn: '对开门变频冰箱', en: 'Large Capacity Refrigerator', ms: 'Peti Sejuk Inverter' },
    image: 'https://www.lg.com/content/dam/channel/wcms/my/images/refrigerators/gr-b247sluv_asbp_e_my_c/gallery/dz-01.jpg',
    price: 150,
    isHot: false,
    features: ['Linear Cooling™', 'Large Capacity', 'Quiet Performance']
  }
];

// --- Components ---

const ProductCard = ({ product, lang, agent, t }) => {
  const waNumber = agent?.wa || DEFAULT_WA;
  const contactText = encodeURIComponent(`Hi ${agent?.name || 'LG Partner'}, I'm interested in ${product.name} (ID: ${product.id}). Can you provide more details?`);
  const waLink = `https://wa.me/${waNumber}?text=${contactText}`;

  return (
    <div className="bg-white rounded-[40px] p-8 border border-gray-100 flex flex-col h-full group hover:shadow-premium transition-all duration-700 animate-fade-up">
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{product.category}</span>
        {product.isHot && (
          <span className="bg-lg-red text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-lg-red/20 flex items-center gap-1">
            <Zap size={10} fill="currentColor" /> HOT
          </span>
        )}
      </div>

      <div className="aspect-square mb-10 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-lg-pearl rounded-full scale-90 group-hover:scale-100 transition-transform duration-700"></div>
        <img 
          src={product.image} 
          className="max-h-[85%] object-contain relative z-10 group-hover:scale-110 transition-transform duration-700" 
          alt={product.name} 
        />
      </div>

      <div className="space-y-2 mb-8">
        <h3 className="text-2xl font-black text-gray-950 uppercase leading-none tracking-tighter group-hover:text-lg-red transition-colors">{product.name}</h3>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
          {product.subName[lang]}
        </p>
      </div>

      <div className="mt-auto pt-8 border-t border-gray-50 flex items-end justify-between">
        <div>
          <span className="text-lg-red text-[10px] font-black uppercase tracking-widest block mb-1">
            {lang === 'cn' ? '月付低至' : lang === 'ms' ? 'Bulanan dari' : 'Monthly from'}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-gray-950 tracking-tighter">RM{product.price}</span>
          </div>
        </div>
        <a 
          href={waLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-gray-950 text-white p-5 rounded-full hover:bg-lg-red transition-all shadow-xl group-hover:translate-x-1"
        >
          <ArrowRight size={20} />
        </a>
      </div>
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState('cn');
  const [view, setView] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [agents, setAgents] = useState(() => JSON.parse(localStorage.getItem('lg_partners_v2') || '[]'));
  const [activeAgent, setActiveAgent] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Tracking Logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wa = params.get('wa');
    if (wa) {
      // Direct track from URL
      const found = agents.find(a => a.wa === wa);
      if (found) {
        setActiveAgent(found);
        localStorage.setItem('active_partner_session', JSON.stringify(found));
      } else {
        // Even if not in local list, trust the URL parameter
        const tempAgent = { name: params.get('name') || 'Authorized Partner', wa: wa };
        setActiveAgent(tempAgent);
      }
    } else {
      const cached = localStorage.getItem('active_partner_session');
      if (cached) setActiveAgent(JSON.parse(cached));
    }
  }, [agents]);

  const t = {
    cn: { 
      hero: "科技定义优雅", 
      sub: "LG Subscribe 马来西亚认证合作伙伴。解锁极简高端生活。",
      explore: "立即浏览", 
      agent: "您的专属顾问", 
      showroom: "数字化展厅",
      join: "合作伙伴计划",
      joinSub: "13% 基础佣金 • 全马推广 • 时间自由",
      adminTitle: "代理授权中心",
      addPartner: "授权新代理",
      pname: "代理姓名",
      pwa: "WA 号码 (601...)",
      copy: "复制推广链接"
    },
    en: { 
      hero: "ELEGANCE IN TECH", 
      sub: "LG Subscribe Malaysia Certified Partner. Unlock premium living.",
      explore: "Explore Now", 
      agent: "Your Consultant", 
      showroom: "Digital Showroom",
      join: "Partner Rewards",
      joinSub: "13% Commission • Nationwide • Flexible",
      adminTitle: "Partner Management",
      addPartner: "Authorize New Partner",
      pname: "Partner Name",
      pwa: "WA (601...)",
      copy: "Copy Link"
    },
    ms: { 
      hero: "KEANGGUNAN TEKNO", 
      sub: "Rakan Kongsi Sah LG Subscribe Malaysia. Alami kehidupan premium.",
      explore: "Terokai Sekarang", 
      agent: "Perunding Anda", 
      showroom: "Bilik Pameran",
      join: "Ganjaran Rakan",
      joinSub: "13% Komisyen • Seluruh Malaysia • Fleksibel",
      adminTitle: "Pengurusan Rakan",
      addPartner: "Daftar Rakan Baru",
      pname: "Nama Rakan",
      pwa: "No WA (601...)",
      copy: "Salin Pautan"
    }
  }[lang];

  const handleCopyLink = (agent) => {
    const link = `${window.location.origin}${window.location.pathname}?wa=${agent.wa}&name=${encodeURIComponent(agent.name)}`;
    navigator.clipboard.writeText(link);
    setCopiedId(agent.wa);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen selection:bg-lg-red selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 h-20 premium-blur flex items-center px-6 justify-between border-b border-gray-100">
        <div className="flex items-center gap-10">
          <button onClick={() => setView('home')}>
            <img src="https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png" className="h-6" alt="LG" />
          </button>
          <div className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-400">
            <button onClick={() => setView('home')} className={view === 'home' ? 'text-lg-red' : 'hover:text-gray-950 transition-colors'}>Showroom</button>
            <button onClick={() => setView('admin')} className={view === 'admin' ? 'text-lg-red' : 'hover:text-gray-950 transition-colors'}>Admin</button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-1 rounded-full flex gap-1">
            {['cn','en','ms'].map(l => (
              <button key={l} onClick={() => setLang(l)} className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${lang === l ? 'bg-white text-lg-red shadow-sm' : 'text-gray-400'}`}>{l}</button>
            ))}
          </div>
        </div>
      </nav>

      {view === 'home' ? (
        <div className="pt-20">
          {/* Hero Section */}
          <section className="bg-lg-pearl py-24 md:py-40 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10 animate-fade-up">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">
                  <ShieldCheck size={14} className="text-lg-red"/> Certified LG Partner
                </span>
                <h1 className="text-6xl md:text-[90px] font-black uppercase leading-[0.9] tracking-tighter text-gray-950 text-balance">
                  {t.hero}
                </h1>
                <p className="text-gray-400 font-medium text-lg max-w-md">{t.sub}</p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-lg-red text-white px-12 py-6 rounded-full font-black uppercase text-[11px] tracking-widest shadow-2xl hover:bg-lg-dark transition-all">
                    {t.explore}
                  </button>
                </div>
              </div>
              <div className="relative animate-fade-up" style={{animationDelay: '0.2s'}}>
                <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full scale-75"></div>
                <img 
                  src="https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg" 
                  className="w-full h-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.1)] relative z-10" 
                />
              </div>
            </div>
          </section>

          {/* Active Consultant Floating Sticky */}
          {activeAgent && (
            <div className="sticky top-24 z-40 flex justify-center px-6 -mt-10 pointer-events-none">
              <div className="premium-blur shadow-premium rounded-full px-10 py-5 flex items-center gap-10 pointer-events-auto animate-fade-up">
                <div className="flex items-center gap-5 border-r pr-10 border-gray-100">
                  <div className="w-12 h-12 bg-lg-red rounded-full flex items-center justify-center text-white shadow-lg"><Star size={22} fill="currentColor"/></div>
                  <div className="text-left">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">{t.agent}</span>
                    <span className="text-sm font-black uppercase text-gray-950">{activeAgent.name}</span>
                  </div>
                </div>
                <a 
                  href={`https://wa.me/${activeAgent.wa}`} 
                  target="_blank" 
                  className="text-[10px] font-black text-lg-red uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform"
                >
                  Contact Now <ArrowRight size={14}/>
                </a>
              </div>
            </div>
          )}

          {/* Product Gallery */}
          <section className="py-32 max-w-7xl mx-auto px-6">
            <div className="text-center md:text-left mb-20 animate-fade-up">
              <span className="text-lg-red font-black uppercase tracking-[0.5em] text-[10px] mb-4 block">{t.showroom}</span>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">Premium Selection.</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {PRODUCTS.map(p => <ProductCard key={p.id} product={p} lang={lang} agent={activeAgent} t={t} />)}
            </div>
          </section>

          {/* Recruitment Section */}
          <section className="bg-lg-dark text-white py-32 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-[60px] p-12 lg:p-24 text-gray-950 relative overflow-hidden shadow-2xl animate-fade-up">
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-gray-50/50 to-transparent skew-x-12 translate-x-32 pointer-events-none"></div>
                <div className="relative z-10 space-y-12">
                  <div className="space-y-4">
                    <span className="text-lg-red font-black text-[12px] uppercase tracking-[0.4em]">{t.join}</span>
                    <h2 className="text-4xl lg:text-8xl font-black uppercase leading-[0.85] tracking-tighter">Work Smart.<br/>Earn Stable.</h2>
                    <p className="text-gray-400 text-lg font-medium max-w-xl">{t.joinSub}</p>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-lg-pearl p-8 rounded-[40px] border border-gray-100">
                      <p className="text-[11px] font-black uppercase text-lg-red tracking-widest mb-4">13% Commission</p>
                      <p className="text-xl font-bold uppercase leading-tight">High basic payout for every successful signup.</p>
                    </div>
                    <div className="bg-lg-pearl p-8 rounded-[40px] border border-gray-100">
                      <p className="text-[11px] font-black uppercase text-lg-red tracking-widest mb-4">Volume Bonus</p>
                      <p className="text-xl font-bold uppercase leading-tight">Unlock up to RM 30,000 monthly target rewards.</p>
                    </div>
                    <div className="flex items-end">
                      <a href={`https://wa.me/60177473787?text=Hi, I'm interested in becoming an LG Subscribe Partner.`} className="bg-lg-red text-white w-full py-8 rounded-[40px] font-black uppercase tracking-widest text-sm shadow-xl hover:bg-lg-dark transition-all text-center">
                        Inquire Now
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-lg-dark text-white py-16 px-6 border-t border-white/5">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-40 gap-6 text-[10px] font-bold uppercase tracking-widest">
              <img src="https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png" className="h-5 brightness-200" alt="LG" />
              <p>© 2026 LG SUBSCRIBE DIGITAL PARTNER MALAYSIA.</p>
            </div>
          </footer>
        </div>
      ) : (
        /* Admin View */
        <div className="pt-32 px-6 max-w-5xl mx-auto min-h-screen animate-fade-up">
          {!isAdmin ? (
            <div className="text-center py-20 space-y-10">
              <div className="w-24 h-24 bg-lg-red/5 rounded-full flex items-center justify-center mx-auto text-lg-red border border-lg-red/10"><Lock size={48}/></div>
              <h2 className="text-4xl font-black uppercase tracking-tighter">System Terminal</h2>
              <button 
                onClick={() => { if(prompt("Auth PIN") === ADMIN_PIN) setIsAdmin(true) }} 
                className="bg-black text-white px-16 py-6 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-lg-red transition-all"
              >
                Unlock Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-16 pb-20">
              <div className="bg-lg-dark text-white p-12 rounded-[50px] shadow-3xl">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-black uppercase tracking-tighter">{t.adminTitle}</h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Partner link generation & commission tracking</p>
                  </div>
                  <Users size={32} className="text-lg-red" />
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">{t.pname}</label>
                    <input id="pname" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl outline-none text-sm font-bold focus:border-lg-red transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">{t.pwa}</label>
                    <input id="pwa" placeholder="60123456789" className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl outline-none text-sm font-bold focus:border-lg-red transition-all" />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={() => {
                        // Cast to HTMLInputElement to fix property 'value' does not exist on type 'HTMLElement'
                        const nameInput = document.getElementById('pname') as HTMLInputElement;
                        const waInput = document.getElementById('pwa') as HTMLInputElement;
                        const n = nameInput?.value;
                        const w = waInput?.value.replace(/\D/g, '');
                        if(!n || !w) return alert("Fill all info");
                        const updated = [...agents, { name: n, wa: w }];
                        setAgents(updated);
                        localStorage.setItem('lg_partners_v2', JSON.stringify(updated));
                        // Clear inputs by casting HTMLElement to HTMLInputElement
                        if (nameInput) nameInput.value = '';
                        if (waInput) waInput.value = '';
                      }} 
                      className="w-full bg-lg-red text-white py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-white hover:text-lg-red transition-all"
                    >
                      {t.addPartner}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  Partner Directory <span className="bg-gray-100 text-gray-400 text-xs px-3 py-1 rounded-full">{agents.length}</span>
                </h3>
                <div className="grid gap-6">
                  {agents.map(a => (
                    <div key={a.wa} className="bg-white p-8 rounded-[40px] border border-gray-100 flex justify-between items-center shadow-sm group hover:shadow-premium transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-lg-red border border-gray-100"><ShieldCheck size={28}/></div>
                        <div>
                          <p className="font-black uppercase text-xl text-gray-950 leading-none">{a.name}</p>
                          <p className="text-[10px] font-bold text-gray-300 mt-2 uppercase tracking-widest">WA: {a.wa}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleCopyLink(a)} 
                          className={`flex items-center gap-2 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${copiedId === a.wa ? 'bg-green-500 text-white shadow-green-200 shadow-xl' : 'bg-gray-100 text-gray-600 hover:bg-black hover:text-white shadow-sm'}`}
                        >
                          {copiedId === a.wa ? <><Check size={14}/> COPIED</> : <><LinkIcon size={14}/> {t.copy}</>}
                        </button>
                        <button 
                          onClick={() => {
                            if(confirm("Delete partner?")) {
                              const filtered = agents.filter(x => x.wa !== a.wa);
                              setAgents(filtered);
                              localStorage.setItem('lg_partners_v2', JSON.stringify(filtered));
                            }
                          }} 
                          className="p-4 bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  {agents.length === 0 && (
                    <div className="py-20 text-center border-4 border-dashed rounded-[50px] border-gray-50 text-gray-300 font-black uppercase tracking-[0.4em] text-xs">
                      No partners registered
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

const root = createRoot(document.getElementById('root'));
root.render(<App />);