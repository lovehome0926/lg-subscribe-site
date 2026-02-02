import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ArrowRight, ShieldCheck, CheckCircle, Zap, 
  Trash2, Plus, Edit3, Database, 
  X, Copy, UserPlus, Phone, Globe, Sparkles
} from 'lucide-react';

// --- Types ---
interface Multilingual { cn: string; en: string; ms: string; }
interface Product {
  id: string;
  category: string;
  name: string;
  subName: Multilingual;
  image: string;
  price: number;
}
interface Agent { wa: string; name: string; }

// --- Constants & Data ---
const STORE_KEY = 'lg_pro_hub_v23';
const DEFAULT_CATEGORIES = ['Water Purifier', 'Air Purifier', 'Air Conditioner', 'Washer & Dryer', 'Refrigerator', 'TV & Soundbar'];

const DICT = {
  cn: {
    heroSub: "LG Subscribe 认证合作伙伴。以极简方案解锁顶尖家电。",
    explore: "浏览展厅",
    contactNow: "立即咨询",
    monthly: "月供低至",
    adminTitle: "管理终端",
    inventory: "库存管理",
    promo: "促销策略",
    backup: "数据备份",
    categories: "分类管理",
    agentCenter: "代理合作中心",
    agentDesc: "下线代理专用：输入您的姓名和WhatsApp，生成您的专属商城链接。所有的客户咨询和佣金都归您！",
    generateBtn: "生成专属推广链接",
    copyBtn: "复制链接",
    copied: "已复制到剪贴板！",
    partnerNote: "官方认证顾问为您服务",
    noProducts: "当前分类暂无产品",
    settings: "系统设置",
    all: "全部产品",
    heroTitle: "科技让生活更优雅"
  },
  en: {
    heroSub: "Certified LG Partner. Unlock premium living with flexible subscription plans.",
    explore: "Explore Hub",
    contactNow: "Inquire Now",
    monthly: "From RM",
    adminTitle: "Admin Console",
    inventory: "Inventory",
    promo: "Promotions",
    backup: "Backup",
    categories: "Categories",
    agentCenter: "Agent Partner Center",
    agentDesc: "For Affiliates: Enter your info to generate a unique marketing link. All commissions go directly to you!",
    generateBtn: "Generate My Link",
    copyBtn: "Copy Link",
    copied: "Link copied!",
    partnerNote: "Certified Partner Support",
    noProducts: "No products in this category",
    settings: "Settings",
    all: "All",
    heroTitle: "ELEGANCE IN EVERY DETAIL"
  },
  ms: {
    heroSub: "Rakan Kongsi Sah LG Subscribe Malaysia. Alami kehidupan premium dengan pelan fleksibel.",
    explore: "Teroka",
    contactNow: "Tanya Sekarang",
    monthly: "Dari RM",
    adminTitle: "Konsol Admin",
    inventory: "Inventori",
    promo: "Promosi",
    backup: "Sandaran",
    categories: "Kategori",
    agentCenter: "Pusat Rakan Niaga",
    agentDesc: "Untuk Ejen: Masukkan maklumat anda untuk menjana pautan promosi peribadi. Komisen milik anda!",
    generateBtn: "Jana Pautan Saya",
    copyBtn: "Salin Pautan",
    copied: "Pautan disalin!",
    partnerNote: "Sokongan Rakan Kongsi Sah",
    noProducts: "Tiada produk dalam kategori ini",
    settings: "Tetapan",
    all: "Semua",
    heroTitle: "KEANGGUNAN DALAM PERINCIAN"
  }
};

const App = () => {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [lang, setLang] = useState<'cn' | 'en' | 'ms'>('cn');
  const [activeTab, setActiveTab] = useState('inventory');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORE_KEY + '_pro');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'PuriCare™ Self-Running', category: 'Water Purifier', price: 60, image: 'https://www.lg.com/content/dam/channel/wcms/my/images/water-purifiers/wd516an_answ_e_my_c/gallery/dz-01.jpg', subName: { cn: '智能直饮净水机', en: 'Self-Running Water Purifier', ms: 'Penulen Air Pintar' } },
      { id: '2', name: 'DualCool™ Premium', category: 'Air Conditioner', price: 45, image: 'https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg', subName: { cn: '双变频冷气机', en: 'Dual Inverter AC', ms: 'Penyaman Udara Inverter' } }
    ];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORE_KEY + '_cat');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [agentForm, setAgentForm] = useState({ name: '', wa: '' });
  const [generatedLink, setGeneratedLink] = useState('');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    localStorage.setItem(STORE_KEY + '_pro', JSON.stringify(products));
    localStorage.setItem(STORE_KEY + '_cat', JSON.stringify(categories));
  }, [products, categories]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const wa = params.get('wa');
    const name = params.get('name');
    if (wa) {
      setActiveAgent({ wa: wa.replace(/\D/g, ''), name: name || 'Certified Partner' });
    }
  }, []);

  const t = DICT[lang];
  const contactWA = activeAgent ? activeAgent.wa : '60177473787';

  const filteredProducts = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  const handleGenerateAgentLink = () => {
    if (!agentForm.name || !agentForm.wa) return alert("请完整填写姓名和电话");
    const cleanWa = agentForm.wa.replace(/\D/g, '');
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('wa', cleanWa);
    url.searchParams.set('name', agentForm.name);
    setGeneratedLink(url.toString());
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return (
    <div className="min-h-screen hero-gradient">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 h-20 premium-blur flex items-center px-6 justify-between shadow-sm">
        <button onClick={() => setView('home')} className="hover:opacity-80 transition-opacity">
          <img src="https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png" className="h-6" alt="Logo" />
        </button>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex bg-gray-50 p-1 rounded-full border border-gray-100">
            {(['cn', 'en', 'ms'] as const).map(l => (
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
            onClick={() => { const p = prompt("Admin PIN"); if(p === '8888') setView('admin'); }} 
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

          {/* Hero */}
          <section className="bg-lg-pearl py-24 px-6 text-center relative overflow-hidden">
            <div className="max-w-4xl mx-auto relative z-10">
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-[0.85] text-lg-dark">
                {t.heroTitle}
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg font-medium">{t.heroSub}</p>
              <div className="relative group max-w-4xl mx-auto mt-12">
                <div className="absolute inset-0 bg-lg-red/5 rounded-[40px] blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <img src="https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg" className="w-full drop-shadow-2xl rounded-3xl relative z-10 transition-transform duration-1000 group-hover:scale-[1.01]" alt="Hero" />
              </div>
            </div>
          </section>

          {/* Showroom */}
          <section id="catalog" className="py-32 container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
               <div className="space-y-4">
                  <span className="text-lg-red font-black uppercase tracking-[0.6em] text-[10px]">Digital Showroom</span>
                  <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">{t.all}.</h2>
               </div>
               <div className="flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-2">
                  <button onClick={() => setActiveCategory('All')} className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === 'All' ? 'bg-lg-dark text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{t.all}</button>
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-lg-dark text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{cat}</button>
                  ))}
               </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
               {filteredProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-[45px] p-10 border border-gray-100 flex flex-col group hover:shadow-premium transition-all">
                     <div className="aspect-square mb-10 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-gray-50 rounded-full scale-90 opacity-50 transition-transform group-hover:scale-100"></div>
                        <img src={p.image} className="max-h-[85%] object-contain relative z-10 transition-transform group-hover:scale-110 duration-700" alt={p.name} />
                     </div>
                     <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1 group-hover:text-lg-red transition-colors">{p.name}</h3>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">{p.subName?.[lang] || ''}</p>
                     <div className="mt-auto pt-8 border-t border-gray-50 flex items-end justify-between">
                        <div>
                           <span className="text-lg-red text-[10px] font-black uppercase block mb-1">{t.monthly}</span>
                           <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-black tracking-tighter text-lg-dark">RM{p.price}</span>
                           </div>
                        </div>
                        <a href={`https://wa.me/${contactWA}?text=I am interested in ${p.name}`} target="_blank" className="bg-lg-dark text-white p-5 rounded-full hover:bg-lg-red transition-all shadow-xl"><ArrowRight size={24} /></a>
                     </div>
                  </div>
               ))}
               {filteredProducts.length === 0 && (
                 <div className="col-span-full py-40 text-center border-4 border-dashed border-gray-50 rounded-[50px]">
                    <span className="text-gray-300 font-black uppercase tracking-[0.5em]">{t.noProducts}</span>
                 </div>
               )}
            </div>
          </section>

          {/* Agent Tools */}
          <section className="bg-lg-dark py-32 px-6">
            <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-3xl rounded-[60px] p-12 md:p-20 border border-white/10 shadow-3xl text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{t.agentCenter}</h2>
                <p className="text-gray-400 font-medium">{t.agentDesc}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <input className="bg-white/10 border-white/10 text-white placeholder:text-gray-600 focus:border-lg-red" placeholder="您的姓名 (例如: 代理阿峰)" value={agentForm.name} onChange={e => setAgentForm({...agentForm, name: e.target.value})} />
                <input className="bg-white/10 border-white/10 text-white placeholder:text-gray-600 focus:border-lg-red" placeholder="WhatsApp (例如: 60123456789)" value={agentForm.wa} onChange={e => setAgentForm({...agentForm, wa: e.target.value})} />
              </div>
              <button onClick={handleGenerateAgentLink} className="w-full bg-lg-red text-white py-6 rounded-full font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-white hover:text-lg-red transition-all">{t.generateBtn}</button>
              {generatedLink && (
                <div className="p-8 bg-black/40 rounded-[35px] border border-white/5 flex flex-col md:flex-row items-center gap-6 animate-fade-up">
                  <div className="flex-grow text-white text-[10px] font-mono break-all opacity-60 text-left">{generatedLink}</div>
                  <button onClick={copyLink} className={`shrink-0 px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all ${copyFeedback ? 'bg-green-500 text-white' : 'bg-white text-lg-dark hover:bg-lg-red hover:text-white'}`}>{copyFeedback ? <><CheckCircle size={14}/> {t.copied}</> : <><Copy size={14}/> {t.copyBtn}</>}</button>
                </div>
              )}
            </div>
          </section>

          <footer className="bg-white py-16 px-6 text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-300 border-t border-gray-50 uppercase">© 2026 LG SUBSCRIBE DIGITAL HUB</footer>
        </main>
      ) : (
        /* Admin */
        <div className="pt-32 px-6 max-w-7xl mx-auto pb-32 space-y-12 animate-fade-up">
           <div className="flex flex-wrap gap-4 border-b pb-8 items-center">
              <h1 className="text-2xl font-black uppercase tracking-tighter mr-8">{t.adminTitle}</h1>
              {['inventory', 'categories', 'backup'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-lg-red text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:text-lg-dark'}`}>{DICT[lang][tab as keyof typeof t] || tab}</button>
              ))}
              <button onClick={() => setView('home')} className="ml-auto text-gray-300 hover:text-lg-red font-black uppercase text-[10px] tracking-widest">Exit</button>
           </div>

           {activeTab === 'inventory' && (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="admin-card flex items-center gap-6 group bg-white p-6 rounded-[35px] border border-gray-100 shadow-sm">
                     <div className="w-16 h-16 bg-gray-50 rounded-2xl p-2 shrink-0"><img src={p.image} className="w-full h-full object-contain" /></div>
                     <div className="flex-grow">
                        <p className="font-black uppercase text-sm leading-none mb-1">{p.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{p.category} • RM{p.price}</p>
                     </div>
                     <button onClick={() => setEditingProduct({...p})} className="p-3 bg-gray-50 rounded-full hover:bg-lg-red hover:text-white transition-all"><Edit3 size={16}/></button>
                  </div>
                ))}
                <button 
                  onClick={() => setEditingProduct({ id: Date.now().toString(), category: categories[0], name: 'New Product', image: '', price: 0, subName: { cn:'', en:'', ms:'' } })} 
                  className="border-4 border-dashed border-gray-100 rounded-[35px] flex items-center justify-center text-gray-200 hover:text-lg-red hover:border-lg-red aspect-[3/1] transition-all group"
                >
                   <Plus size={32}/>
                </button>
             </div>
           )}

           {activeTab === 'categories' && (
             <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 max-w-2xl">
                <div className="flex gap-4 mb-8">
                   <input id="newCat" className="flex-grow" placeholder="Category Name" />
                   <button onClick={() => {
                     const v = (document.getElementById('newCat') as HTMLInputElement).value;
                     if(v) setCategories([...categories, v]);
                   }} className="bg-lg-dark text-white px-8 rounded-2xl font-black uppercase text-[10px]">Add</button>
                </div>
                <div className="space-y-4">
                   {categories.map(c => (
                     <div key={c} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                        <span className="font-bold uppercase text-xs">{c}</span>
                        <button onClick={() => setCategories(categories.filter(x => x !== c))} className="text-gray-300 hover:text-lg-red transition-colors"><Trash2 size={18}/></button>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'backup' && (
             <div className="bg-lg-pearl p-20 rounded-[70px] text-center space-y-8 shadow-inner">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl text-lg-red"><Database size={32}/></div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">System Backup</h2>
                <button onClick={() => {
                   const data = { products, categories };
                   const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a'); a.href = url; a.download = `lg_backup.json`; a.click();
                }} className="bg-lg-dark text-white px-16 py-6 rounded-full font-black uppercase text-[11px] tracking-[0.4em]">Export JSON</button>
             </div>
           )}
        </div>
      )}

      {/* Editing Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-lg-dark/60 backdrop-blur-md" onClick={() => setEditingProduct(null)}></div>
           <div className="bg-white w-full max-w-4xl rounded-[60px] p-12 relative z-10 shadow-3xl max-h-[90vh] overflow-y-auto no-scrollbar space-y-12">
              <div className="flex justify-between items-center border-b pb-8 border-gray-100">
                 <h3 className="text-4xl font-black uppercase tracking-tighter">Edit Product</h3>
                 <button onClick={() => setEditingProduct(null)} className="p-3 text-gray-400 hover:text-lg-red bg-gray-100 rounded-full transition-all"><X size={24}/></button>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase">Image URL</label>
                    <input className="w-full" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} />
                    {editingProduct.image && <img src={editingProduct.image} className="max-h-40 mx-auto object-contain" />}
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-300 uppercase">Category</label>
                    <select className="w-full" value={editingProduct.category} onChange={e=>setEditingProduct({...editingProduct, category:e.target.value})}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select>
                    <label className="text-[10px] font-black text-gray-300 uppercase">Name</label>
                    <input className="w-full" value={editingProduct.name} onChange={e=>setEditingProduct({...editingProduct, name:e.target.value})} />
                    <label className="text-[10px] font-black text-gray-300 uppercase">Price (RM)</label>
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
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}