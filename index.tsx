import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ArrowRight, ShieldCheck, CheckCircle, Zap, 
  Trash2, Plus, Edit3, Power, Database, 
  X, Copy, UserPlus, Phone, Globe
} from 'lucide-react';

// --- Configuration & Constants ---
const STORE_KEY = 'lg_pro_hub_v21';
const DEFAULT_CATEGORIES = ['Water Purifier', 'Air Purifier', 'Air Conditioner', 'Washer & Dryer', 'Refrigerator', 'TV & Soundbar'];
const MARQUEE_IMAGE = 'https://i.ibb.co/Lhyx4VCH/temp-Image6o-Zc-Wh.avif';

const DICT = {
  cn: {
    heroSub: "LG Subscribe 认证合作伙伴。以极简方案解锁顶尖家电。",
    explore: "浏览展厅",
    contactNow: "立即咨询",
    monthly: "月供低至",
    adminTitle: "管理终端",
    inventory: "库存管理",
    siteConfig: "全局配置",
    affiliates: "代理授权",
    promo: "促销策略",
    backup: "数据备份",
    categories: "分类管理",
    whatIsTitle: "什么是 LG Subscribe？",
    whatIsDesc: "LG Subscribe 是一项全方位家电订阅服务，旨在通过高性价比的方式助您完善家居配置。从冰箱到电视，让您的家焕发温馨活力。",
    agentCenter: "代理中心 (合作伙伴入口)",
    agentDesc: "输入您的信息，生成专属推广链接。所有的咨询佣金将归您所有。",
    generateBtn: "生成专属推广链接",
    copyBtn: "复制推广链接",
    copied: "已复制到剪贴板！",
    partnerNote: "官方认证顾问为您服务",
    noProducts: "当前分类暂无产品",
    settings: "系统设置",
    firstMonths: "首 {n} 个月优惠"
  },
  en: {
    heroSub: "Certified LG Partner. Unlock premium living with flexible subscription plans.",
    explore: "Explore Hub",
    contactNow: "Inquire Now",
    monthly: "From RM",
    adminTitle: "Admin Console",
    inventory: "Inventory",
    siteConfig: "Settings",
    affiliates: "Affiliates",
    promo: "Promotions",
    backup: "Backup",
    categories: "Categories",
    whatIsTitle: "What is LG Subscribe?",
    whatIsDesc: "LG Subscribe is a comprehensive appliance subscription service designed to help you complete your home affordably.",
    agentCenter: "Agent Hub (Partner Entry)",
    agentDesc: "Enter your details to generate a unique marketing link. Commissions go directly to you.",
    generateBtn: "Generate My Link",
    copyBtn: "Copy Link",
    copied: "Link copied!",
    partnerNote: "Certified Partner Support",
    noProducts: "No products in this category",
    settings: "Settings",
    firstMonths: "First {n} Months Offer"
  },
  ms: {
    heroSub: "Rakan Kongsi Sah LG Subscribe Malaysia. Alami kehidupan premium dengan pelan langganan fleksibel.",
    explore: "Teroka",
    contactNow: "Tanya Sekarang",
    monthly: "Dari RM",
    adminTitle: "Konsol Admin",
    inventory: "Inventori",
    siteConfig: "Tetapan",
    affiliates: "Ejen",
    promo: "Promosi",
    backup: "Sandaran",
    categories: "Kategori",
    whatIsTitle: "Apakah LG Subscribe?",
    whatIsDesc: "LG Subscribe adalah perkhidmatan langganan perkakas rumah untuk melengkapkan kediaman dengan kos efektif.",
    agentCenter: "Pusat Ejen",
    agentDesc: "Masukkan maklumat anda untuk menjana pautan promosi peribadi. Komisen milik anda.",
    generateBtn: "Jana Pautan Saya",
    copyBtn: "Salin Pautan",
    copied: "Pautan disalin!",
    partnerNote: "Sokongan Rakan Kongsi Sah",
    noProducts: "Tiada produk dalam kategori ini",
    settings: "Tetapan",
    firstMonths: "Tawaran {n} Bulan Pertama"
  }
};

const App = () => {
  const [view, setView] = useState('home');
  const [lang, setLang] = useState('cn');
  const [activeTab, setActiveTab] = useState('inventory');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  const [agentInput, setAgentInput] = useState({ name: '', wa: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [activeAgent, setActiveAgent] = useState(null);

  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem(STORE_KEY + '_pro') || '[]'));
  const [categories, setCategories] = useState(() => JSON.parse(localStorage.getItem(STORE_KEY + '_cat') || JSON.stringify(DEFAULT_CATEGORIES)));
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem(STORE_KEY + '_set') || JSON.stringify({
    logo: 'https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png',
    heroImage: 'https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg',
    heroTitle: { cn: '科技定义 优雅生活', en: 'ELEGANCE IN TECH', ms: 'KEANGGUNAN TEKNOLOGI' },
    contactPhone: '60177473787',
    adminPin: '8888'
  })));
  const [templates, setTemplates] = useState(() => JSON.parse(localStorage.getItem(STORE_KEY + '_tpl') || '[]'));
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORE_KEY + '_pro', JSON.stringify(products));
    localStorage.setItem(STORE_KEY + '_cat', JSON.stringify(categories));
    localStorage.setItem(STORE_KEY + '_set', JSON.stringify(settings));
    localStorage.setItem(STORE_KEY + '_tpl', JSON.stringify(templates));
  }, [products, categories, settings, templates]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wa = params.get('wa');
    const name = params.get('name');
    if (wa) {
      setActiveAgent({ 
        wa: wa.replace(/\D/g, ''), 
        name: name || 'Certified Partner' 
      });
    }
  }, []);

  const t = DICT[lang];

  const handleGenerateLink = () => {
    if (!agentInput.name || !agentInput.wa) return alert("Please fill in both name and phone number");
    const cleanWa = agentInput.wa.replace(/\D/g, '');
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('wa', cleanWa);
    url.searchParams.set('name', agentInput.name);
    setGeneratedLink(url.toString());
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const calculatePromo = (basePrice, productId) => {
    const now = new Date();
    const activePromo = templates.find(tpl => {
      if (!tpl.isActive) return false;
      const isTarget = tpl.applyToAll || (tpl.targetProductIds && tpl.targetProductIds.includes(productId));
      const notExpired = !tpl.endDate || new Date(tpl.endDate) > now;
      return isTarget && notExpired;
    });

    if (!activePromo) return { price: basePrice, label: null };

    let final = basePrice;
    if (activePromo.type === 'percent') final = basePrice * (1 - activePromo.value / 100);
    else if (activePromo.type === 'fixed') final = basePrice - activePromo.value;
    else if (activePromo.type === 'direct') final = activePromo.value;

    const label = activePromo.promoDuration && activePromo.promoDuration !== 'full' 
      ? t.firstMonths.replace('{n}', activePromo.promoDuration)
      : null;

    return { price: Math.ceil(final), label };
  };

  const filteredProducts = activeCategoryFilter === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategoryFilter);

  return (
    <div className="min-h-screen hero-gradient">
      <nav className="fixed top-0 w-full z-50 h-20 premium-blur border-b border-gray-100 flex items-center px-6 justify-between shadow-sm">
        <button onClick={() => setView('home')} className="hover:opacity-80 transition-opacity">
          <img src={settings.logo} className="h-6" alt="Logo" />
        </button>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-gray-50 p-1 rounded-full border border-gray-100">
            {['cn', 'en', 'ms'].map(l => (
              <button 
                key={l} 
                onClick={() => setLang(l)} 
                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${lang === l ? 'bg-lg-red text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button 
            onClick={() => { const p = prompt("Admin PIN"); if(p === settings.adminPin) setView('admin'); }} 
            className="p-2.5 text-gray-300 hover:text-lg-red transition-colors"
          >
            <ShieldCheck size={20} />
          </button>
        </div>
      </nav>

      {view === 'home' ? (
        <main className="pt-20 animate-fade-up">
          {activeAgent && (
            <div className="bg-lg-red text-white py-3 px-6 text-center text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3">
              <UserPlus size={14} /> {activeAgent.name} • {t.partnerNote}
            </div>
          )}

          <section className="bg-lg-pearl py-24 px-6 text-center relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-[0.85] text-lg-dark">
                {settings.heroTitle[lang]}
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg font-medium">{t.heroSub}</p>
              <div className="relative group max-w-4xl mx-auto mt-12">
                <div className="absolute inset-0 bg-lg-red/5 rounded-[40px] blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <img src={settings.heroImage} className="w-full drop-shadow-2xl rounded-3xl relative z-10 transition-transform duration-1000 group-hover:scale-[1.01]" alt="Hero" />
              </div>
            </div>
          </section>

          <section id="catalog" className="py-32 container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
               <div className="space-y-4">
                  <span className="text-lg-red font-black uppercase tracking-[0.6em] text-[10px]">Digital Showroom</span>
                  <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">Premium Collection.</h2>
               </div>
               <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-2">
                  <button onClick={() => setActiveCategoryFilter('All')} className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategoryFilter === 'All' ? 'bg-lg-dark text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>All</button>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategoryFilter(cat)} className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategoryFilter === cat ? 'bg-lg-dark text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{cat}</button>
                  ))}
               </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
               {filteredProducts.map(p => {
                  const promo = calculatePromo(p.price, p.id);
                  return (
                    <div key={p.id} className="bg-white rounded-[45px] p-10 border border-gray-100 flex flex-col group hover:shadow-premium transition-all">
                       <div className="aspect-square mb-10 flex items-center justify-center relative">
                          <div className="absolute inset-0 bg-gray-50 rounded-full scale-90 opacity-50 transition-transform group-hover:scale-100"></div>
                          <img src={p.image} className="max-h-[85%] object-contain relative z-10 transition-transform group-hover:scale-110 duration-700" alt={p.name} />
                       </div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 group-hover:text-lg-red transition-colors">{p.name}</h3>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">{p.subName[lang]}</p>
                       <div className="mt-auto pt-8 border-t border-gray-50 flex items-end justify-between">
                          <div>
                             {promo.label && <span className="text-lg-red text-[8px] font-black uppercase block mb-1 animate-pulse">{promo.label}</span>}
                             <span className="text-lg-red text-[10px] font-black uppercase block mb-1">{t.monthly}</span>
                             <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black tracking-tighter text-lg-dark">RM{promo.price}</span>
                             </div>
                          </div>
                          <a href={`https://wa.me/${activeAgent?.wa || settings.contactPhone}?text=I am interested in ${p.name}`} className="bg-lg-dark text-white p-5 rounded-full hover:bg-lg-red transition-all shadow-xl"><ArrowRight size={24} /></a>
                       </div>
                    </div>
                  );
               })}
               {filteredProducts.length === 0 && (
                 <div className="col-span-full py-40 text-center border-4 border-dashed border-gray-50 rounded-[50px]">
                    <span className="text-gray-300 font-black uppercase tracking-[0.5em]">{t.noProducts}</span>
                 </div>
               )}
            </div>
          </section>

          <section className="bg-lg-dark py-32 px-6">
            <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-3xl rounded-[60px] p-12 md:p-20 border border-white/10 shadow-3xl text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{t.agentCenter}</h2>
                <p className="text-gray-400 font-medium">{t.agentDesc}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <input className="bg-white/10 border-white/10 text-white placeholder:text-gray-600 focus:border-lg-red" placeholder="Your Name" value={agentInput.name} onChange={e => setAgentInput({...agentInput, name: e.target.value})} />
                <input className="bg-white/10 border-white/10 text-white placeholder:text-gray-600 focus:border-lg-red" placeholder="WhatsApp (e.g. 60123456789)" value={agentInput.wa} onChange={e => setAgentInput({...agentInput, wa: e.target.value})} />
              </div>
              <button onClick={handleGenerateLink} className="w-full bg-lg-red text-white py-6 rounded-full font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-white hover:text-lg-red transition-all">{t.generateBtn}</button>
              {generatedLink && (
                <div className="p-8 bg-black/40 rounded-[35px] border border-white/5 flex flex-col md:flex-row items-center gap-6 animate-fade-up">
                  <div className="flex-grow text-white text-[10px] font-mono break-all opacity-60 text-left">{generatedLink}</div>
                  <button onClick={copyToClipboard} className={`shrink-0 px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all ${copyFeedback ? 'bg-green-500 text-white' : 'bg-white text-lg-dark hover:bg-lg-red hover:text-white'}`}>{copyFeedback ? <><CheckCircle size={14}/> {t.copied}</> : <><Copy size={14}/> {t.copyBtn}</>}</button>
                </div>
              )}
            </div>
          </section>

          <footer className="bg-white py-16 px-6 text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 border-t border-gray-50">© 2026 LG SUBSCRIBE DIGITAL HUB • MALAYSIA</footer>
        </main>
      ) : (
        <div className="pt-32 px-6 max-w-7xl mx-auto pb-32 space-y-12 animate-fade-up">
           <div className="flex flex-wrap gap-4 border-b pb-8 items-center">
              <h1 className="text-2xl font-black uppercase tracking-tighter mr-8">{t.adminTitle}</h1>
              {['inventory', 'categories', 'promo', 'settings', 'backup'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-lg-red text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:text-lg-dark'}`}>{DICT[lang][tab] || tab}</button>
              ))}
              <button onClick={() => setView('home')} className="ml-auto text-gray-300 hover:text-lg-red font-black uppercase text-[10px] tracking-widest">Exit</button>
           </div>
           {activeTab === 'inventory' && (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="admin-card flex items-center gap-6 group">
                     <div className="w-16 h-16 bg-gray-50 rounded-2xl p-2 shrink-0"><img src={p.image} className="w-full h-full object-contain" /></div>
                     <div className="flex-grow">
                        <p className="font-black uppercase text-sm leading-none mb-1">{p.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{p.category} • RM{p.price}</p>
                     </div>
                     <button onClick={() => setEditingProduct({...p})} className="p-3 bg-gray-50 rounded-full hover:bg-lg-red hover:text-white transition-all"><Edit3 size={16}/></button>
                  </div>
                ))}
                <button onClick={() => setEditingProduct({ id: Date.now().toString(), category: categories[0], name: 'New Product', subName:{cn:'',en:'',ms:''}, image: '', price: 0 })} className="border-4 border-dashed border-gray-100 rounded-[35px] flex items-center justify-center text-gray-200 hover:text-lg-red hover:border-lg-red aspect-[3/1] transition-all group"><Plus size={32}/></button>
             </div>
           )}
           {activeTab === 'settings' && (
             <div className="bg-gray-50 p-12 rounded-[50px] grid md:grid-cols-2 gap-8 border border-gray-200">
                <div className="space-y-4"><label className="text-[10px] font-black text-gray-400 uppercase ml-4">Site Logo URL</label><input className="w-full" value={settings.logo} onChange={e=>setSettings({...settings, logo:e.target.value})} /></div>
                <div className="space-y-4"><label className="text-[10px] font-black text-gray-400 uppercase ml-4">Admin PIN</label><input className="w-full" value={settings.adminPin} onChange={e=>setSettings({...settings, adminPin:e.target.value})} /></div>
                {['cn','en','ms'].map(l => (
                   <div key={l} className="space-y-2"><label className="text-[9px] font-black text-gray-400 uppercase ml-4">Hero Title ({l})</label><input className="w-full font-bold" value={settings.heroTitle[l]} onChange={e=>setSettings({...settings, heroTitle:{...settings.heroTitle, [l]:e.target.value}})} /></div>
                ))}
             </div>
           )}
           {activeTab === 'backup' && (
             <div className="bg-lg-pearl p-20 rounded-[70px] text-center space-y-8 shadow-inner">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl text-lg-red"><Database size={32}/></div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">System Backup</h2>
                <button onClick={() => {
                   const data = { products, categories, settings, templates };
                   const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a'); a.href = url; a.download = `lg_hub_backup.json`; a.click();
                }} className="bg-lg-dark text-white px-16 py-6 rounded-full font-black uppercase text-[11px] tracking-[0.4em]">Export JSON</button>
             </div>
           )}
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-lg-dark/60 backdrop-blur-md" onClick={() => setEditingProduct(null)}></div>
           <div className="bg-white w-full max-w-4xl rounded-[60px] p-12 relative z-10 shadow-3xl max-h-[90vh] overflow-y-auto space-y-12">
              <div className="flex justify-between items-center border-b pb-8 border-gray-100">
                 <h3 className="text-4xl font-black uppercase tracking-tighter">Edit Product</h3>
                 <button onClick={() => setEditingProduct(null)} className="p-3 text-gray-400 hover:text-lg-red bg-gray-100 rounded-full transition-all"><X size={24}/></button>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase">Image URL</label>
                    <input className="w-full" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} />
                    {editingProduct.image && <img src={editingProduct.image} className="max-h-40 mx-auto" />}
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase">Category</label>
                    <select className="w-full" value={editingProduct.category} onChange={e=>setEditingProduct({...editingProduct, category:e.target.value})}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
                    <label className="text-[10px] font-black text-gray-300 uppercase">Name</label>
                    <input className="w-full" value={editingProduct.name} onChange={e=>setEditingProduct({...editingProduct, name:e.target.value})} />
                    <label className="text-[10px] font-black text-gray-300 uppercase">Price</label>
                    <input className="w-full" type="number" value={editingProduct.price} onChange={e=>setEditingProduct({...editingProduct, price:Number(e.target.value)})} />
                 </div>
              </div>
              <div className="flex gap-4 pt-12 border-t border-gray-100">
                 <button onClick={() => {
                     const updated = products.map(p => p.id === editingProduct.id ? editingProduct : p);
                     if(!products.some(p => p.id === editingProduct.id)) updated.push(editingProduct);
                     setProducts(updated); setEditingProduct(null);
                 }} className="flex-grow bg-lg-red text-white py-8 rounded-full font-black uppercase tracking-[0.5em] shadow-2xl hover:bg-lg-dark transition-all">Save Product</button>
                 <button onClick={() => { if(confirm("Delete?")) { setProducts(products.filter(p=>p.id!==editingProduct.id)); setEditingProduct(null); } }} className="px-10 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"><Trash2 size={24}/></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);