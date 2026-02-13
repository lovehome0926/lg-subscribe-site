
import React, { useState, useEffect } from 'react';
import { Product, Agent, SiteSettings, Language, PromotionTemplate, ProductPlan, ProductVariant, BenefitItem, HpOption, Multilingual, CategoryItem } from '../types.ts';
import { processProductAI, translateTextAI } from '../utils/ai.ts';
import { Trash2, X, Search, Edit3, UploadCloud, Flame, Check, Tag, Info, User, Phone, Copy, Sparkles, Image as ImageIcon, Ticket, RotateCcw, Share2, MapPin, LayoutGrid, Sparkle, Save, Calendar, Plus, ExternalLink, Link2, ShieldCheck, HelpCircle, ArrowRight, Download, RefreshCw, Languages, Mail, FileText, Database, Settings, Globe } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  setProducts: (p: Product[]) => Promise<void>;
  authorizedAgents: Agent[];
  setAuthorizedAgents: (a: Agent[]) => Promise<void>;
  categories: CategoryItem[];
  language: Language;
  siteSettings: SiteSettings;
  updateSiteSettings: (s: SiteSettings) => Promise<void>;
  onReset: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, setProducts, authorizedAgents, setAuthorizedAgents, language, siteSettings, updateSiteSettings, onReset
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'agents' | 'promo' | 'settings' | 'tools'>('inventory');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromotionTemplate | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [promoProductSearch, setPromoProductSearch] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isTranslating, setIsTranslating] = useState<string | null>(null);

  const [toolsWa, setToolsWa] = useState(localStorage.getItem('my_agent_wa') || '');
  const [toolsName, setToolsName] = useState(localStorage.getItem('my_agent_name') || '');
  const [genLink, setGenLink] = useState('');
  const [copied, setCopied] = useState(false);

  const updateField = (f: string, v: any) => editingProduct && setEditingProduct({...editingProduct, [f]: v});

  const handleFileUpload = (callback: (base64: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => callback(re.target?.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const copyAgentLink = (agent: Agent) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}?wa=${agent.whatsapp}&name=${encodeURIComponent(agent.name)}&t=${agent.token}#home`;
    navigator.clipboard.writeText(link);
    alert(`已拷贝代理链接: ${agent.name}`);
  };

  const translateFeature = async (index: number) => {
    if (!editingProduct) return;
    const source = editingProduct.features[index].cn;
    if (!source) return alert("请先输入中文后再点击翻译按钮");
    setIsTranslating(`f-${index}`);
    const res = await translateTextAI(source);
    if (res) {
      const next = [...editingProduct.features];
      next[index] = res;
      updateField('features', next);
    }
    setIsTranslating(null);
  };

  const handleImportAI = async () => {
    if (!importUrl) return alert("请输入 URL");
    setIsImporting(true);
    try {
      const resStr = await processProductAI(importUrl);
      if (resStr) {
        const res = JSON.parse(resStr.replace(/```json/g, '').replace(/```/g, '').trim());
        if (editingProduct && res) {
          setEditingProduct({...editingProduct, ...res, modelId: (res.modelId || '').toUpperCase()});
        }
      }
    } catch (e) { alert("AI 同步失败，请手动填写。"); }
    finally { setIsImporting(false); }
  };

  const renderMultilingualInput = (
    label: string, 
    value: Multilingual, 
    onChange: (next: Multilingual) => void,
    isLarge: boolean = false,
    theme: 'red' | 'gray' = 'red'
  ) => (
    <div className="space-y-4 text-left">
      <label className={`text-[10px] font-black uppercase ${theme === 'red' ? 'text-lg-red' : 'text-gray-300'} ml-4 italic tracking-widest`}>{label}</label>
      <div className={`bg-gray-50/50 rounded-[35px] border border-gray-100 p-6 space-y-4 shadow-inner`}>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 text-gray-400">CN</span>
          <input 
            value={value?.cn || ''} 
            onChange={e => onChange({...value, cn: e.target.value})} 
            className={`flex-1 bg-transparent border-none outline-none font-black text-gray-950 ${isLarge ? 'text-2xl italic' : 'text-sm'}`}
            placeholder="输入中文内容..."
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 text-gray-400">EN</span>
          <input 
            value={value?.en || ''} 
            onChange={e => onChange({...value, en: e.target.value})} 
            className={`flex-1 bg-transparent border-none outline-none font-bold text-gray-400 ${isLarge ? 'text-lg italic' : 'text-[12px]'}`}
            placeholder="Enter English content..."
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 text-gray-400">MS</span>
          <input 
            value={value?.ms || ''} 
            onChange={e => onChange({...value, ms: e.target.value})} 
            className={`flex-1 bg-transparent border-none outline-none font-bold text-gray-400 ${isLarge ? 'text-lg italic' : 'text-[12px]'}`}
            placeholder="Masukkan kandungan Melayu..."
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9fa] min-h-screen pt-28 pb-20 text-left">
      <div className="bg-lg-dark text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="italic font-black text-left">
            <h1 className="text-3xl uppercase tracking-tighter leading-none text-white">LG HUB TERMINAL.</h1>
            <p className="text-lg-red text-[10px] uppercase tracking-[0.4em] mt-2">ADMIN & MARKETING CENTER</p>
          </div>
          <div className="flex bg-[#0a0f18] p-2 rounded-full border border-white/5 overflow-x-auto no-scrollbar">
            {['inventory', 'agents', 'promo', 'settings', 'tools'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-lg-red text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>{tab}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'inventory' && (
          <div className="space-y-12 animate-fade-up">
            <div className="flex justify-between items-end gap-6">
              <div className="flex-1 max-w-lg relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-6 py-5 rounded-[25px] border-none shadow-sm bg-white font-bold" placeholder="搜索型号或名称..." />
              </div>
              <button onClick={() => setEditingProduct({ id: `SKU-${Date.now()}`, name: '', modelId: '', category: siteSettings.categories[0].id, subName: {en:'',cn:'',ms:''}, description: '', image: '', normalPrice: 0, promoPrice: 0, promoText: '', warranty: '', plans: [], features: [], painPoints: [], variants: [], isHotSale: false, isNew: false, hpOptions: [] })} className="bg-lg-red text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">Add SKU</button>
            </div>
            <div className="grid gap-6">
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[40px] flex items-center gap-8 group hover:border-lg-red transition-all shadow-sm">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden shrink-0"><img src={p.image} className="max-h-full object-contain" /></div>
                  <div className="flex-1">
                    <h4 className="font-black uppercase italic leading-tight text-gray-950 text-xl">{p.name}</h4>
                    <p className="text-[12px] font-black text-lg-red uppercase tracking-widest mt-1">MODEL: {p.modelId || p.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProduct({...p})} className="p-4 bg-gray-50 rounded-full text-gray-400 hover:text-black transition-all"><Edit3 size={18}/></button>
                    <button onClick={() => { if(confirm("确定删除吗?")) setProducts(products.filter(x => x.id !== p.id)); }} className="p-4 bg-red-50 text-red-300 rounded-full hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
           <div className="space-y-12 animate-fade-up text-left">
              <header className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-950">Authorized Partners.</h2>
                <button onClick={() => {
                  const n = prompt("Agent Name?"); const w = prompt("WhatsApp (601...)");
                  if(n && w) setAuthorizedAgents([...authorizedAgents, {id: Date.now().toString(), name: n, whatsapp: w, token: 'AG'+n.substring(0,2).toUpperCase()+w.slice(-4)}]);
                }} className="bg-black text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest">+ NEW AGENT</button>
              </header>
              <div className="grid md:grid-cols-3 gap-8">
                 {authorizedAgents.map(a => (
                   <div key={a.whatsapp} className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col gap-6 group hover:border-lg-red transition-all">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-lg-red shadow-inner shrink-0"><User size={28}/></div>
                         <div className="flex-1">
                            <h4 className="font-black uppercase italic leading-tight text-gray-950">{a.name}</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">WA: {a.whatsapp}</p>
                         </div>
                         <button onClick={() => setAuthorizedAgents(authorizedAgents.filter(x => x.whatsapp !== a.whatsapp))} className="text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                      </div>
                      <button onClick={() => copyAgentLink(a)} className="w-full py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all shadow-sm"><Copy size={16}/> Copy Partner Link</button>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'promo' && (
           <div className="space-y-12 animate-fade-up text-left">
              <header className="flex justify-between items-center">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-950">Promotions.</h2>
                 <button onClick={() => setEditingPromo({ id: `PR-${Date.now()}`, type: 'percentage', title: {en:'',cn:'',ms:''}, applicableProductIds: [], value: 0, endDate: '', content: {en:'',cn:'',ms:''}, color: 'rose' })} className="bg-lg-red text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3"><Ticket size={16}/> Create Promo</button>
              </header>
              <div className="grid md:grid-cols-3 gap-8">
                 {(siteSettings.promoTemplates || []).map(p => (
                   <div key={p.id} className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100 space-y-6 relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-${p.color || 'rose'}-50 rounded-bl-[100px] -mr-4 -mt-4 opacity-50`}></div>
                      <h4 className="font-black uppercase italic text-gray-950 leading-tight text-lg">
                         {p.title[language] || p.title.cn || p.title.en || 'Untitled Promo'}
                      </h4>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Expires: {p.endDate}</p>
                      <div className="flex gap-2">
                         <button onClick={() => setEditingPromo(p)} className="flex-1 py-3 bg-gray-50 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:bg-black hover:text-white transition-all">Edit</button>
                         <button onClick={() => updateSiteSettings({...siteSettings, promoTemplates: siteSettings.promoTemplates.filter(x => x.id !== p.id)})} className="p-3 bg-red-50 text-red-200 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="space-y-10 animate-fade-up max-w-7xl mx-auto text-left">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-4xl font-black italic uppercase text-gray-950 tracking-tighter">Hub Settings.</h2>
                <div className="flex gap-4">
                  <button onClick={() => {
                    const blob = new Blob([JSON.stringify({ siteSettings, products, authorizedAgents }, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `HUB_BACKUP_${new Date().toISOString().split('T')[0]}.json`; a.click();
                  }} className="bg-black text-white px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl"><Download size={14}/> Backup All</button>
                  <button onClick={() => {
                    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
                    input.onchange = (e: any) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = async (re) => {
                          const data = JSON.parse(re.target?.result as string);
                          if(data.siteSettings) updateSiteSettings(data.siteSettings);
                          if(data.products) setProducts(data.products);
                          if(data.authorizedAgents) setAuthorizedAgents(data.authorizedAgents);
                          alert("Restore Success");
                        };
                        reader.readAsText(file);
                      }
                    };
                    input.click();
                  }} className="bg-gray-100 text-gray-400 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-md"><RefreshCw size={14}/> Restore</button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 space-y-10">
                  <h3 className="text-xl font-black italic uppercase border-b pb-6 text-gray-950">1. Branding & Hero</h3>
                  <div className="grid grid-cols-2 gap-8 text-left">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-gray-300 ml-4 tracking-widest">SITE LOGO</label>
                      <div onClick={() => handleFileUpload(b => updateSiteSettings({...siteSettings, logoUrl: b}))} className="aspect-video bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer p-4">
                         {siteSettings.logoUrl ? <img src={siteSettings.logoUrl} className="max-h-full object-contain" /> : <UploadCloud className="text-gray-200" />}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-gray-300 ml-4 tracking-widest">HERO BACKGROUND</label>
                      <div onClick={() => handleFileUpload(b => updateSiteSettings({...siteSettings, heroImageUrl: b}))} className="aspect-video bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer">
                         {siteSettings.heroImageUrl ? <img src={siteSettings.heroImageUrl} className="w-full h-full object-cover" /> : <UploadCloud className="text-gray-200" />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 space-y-10">
                  <h3 className="text-xl font-black italic uppercase border-b pb-6 text-gray-950">2. Product Categories</h3>
                  <div className="flex flex-wrap gap-4 text-left">
                    {siteSettings.categories.map(c => (
                      <div key={c.id} className="bg-gray-50 pl-6 pr-3 py-3 rounded-full border border-gray-100 flex items-center gap-3 text-[10px] font-black uppercase shadow-sm">
                        {c.label.cn} ({c.id}) 
                        <button onClick={() => setEditingCategory(c)} className="text-gray-300 hover:text-black transition-colors"><Edit3 size={14}/></button>
                        <button onClick={() => updateSiteSettings({...siteSettings, categories: siteSettings.categories.filter(x => x.id !== c.id)})} className="text-red-200 hover:text-red-500 transition-colors"><X size={14}/></button>
                      </div>
                    ))}
                    <button onClick={() => setEditingCategory({ id: '', label: { en: '', cn: '', ms: '' } })} className="bg-lg-red text-white px-8 py-3 rounded-full text-[10px] font-black shadow-lg hover:bg-black transition-all">+ ADD</button>
                  </div>
                </div>

                <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 md:col-span-2 space-y-10">
                   <h3 className="text-xl font-black italic uppercase border-b pb-6 text-gray-950">3. Three Key Benefits</h3>
                   <div className="grid md:grid-cols-3 gap-10 text-left">
                      {[0, 1, 2].map((idx) => {
                         const b = (siteSettings.benefits && siteSettings.benefits[idx]) || {
                           number: `0${idx + 1}`,
                           title: { en: '', cn: '', ms: '' },
                           description: { en: '', cn: '', ms: '' },
                           image: ''
                         } as BenefitItem;
                         
                         return (
                         <div key={idx} className="bg-gray-50/50 rounded-[40px] p-8 space-y-6 border border-gray-100 shadow-sm">
                            <div onClick={() => handleFileUpload(img => {
                               const next = [...(siteSettings.benefits || [])];
                               while (next.length <= idx) {
                                 next.push({ number: `0${next.length + 1}`, title: { en: '', cn: '', ms: '' }, description: { en: '', cn: '', ms: '' }, image: '' });
                               }
                               next[idx] = { ...next[idx], image: img };
                               updateSiteSettings({...siteSettings, benefits: next});
                            })} className="aspect-[4/3] bg-white rounded-3xl overflow-hidden cursor-pointer flex items-center justify-center border border-gray-100 shadow-inner">
                               {b.image ? <img src={b.image} className="w-full h-full object-cover" /> : <UploadCloud className="text-gray-200" />}
                            </div>
                            <div className="space-y-4">
                               {renderMultilingualInput("Benefit Title", b.title, (next) => {
                                 const nextBenefits = [...(siteSettings.benefits || [])];
                                 while (nextBenefits.length <= idx) nextBenefits.push({ number: `0${nextBenefits.length + 1}`, title: { en: '', cn: '', ms: '' }, description: { en: '', cn: '', ms: '' }, image: '' });
                                 nextBenefits[idx] = { ...nextBenefits[idx], title: next };
                                 updateSiteSettings({...siteSettings, benefits: nextBenefits});
                               }, false, 'gray')}
                               {renderMultilingualInput("Benefit Desc", b.description, (next) => {
                                 const nextBenefits = [...(siteSettings.benefits || [])];
                                 while (nextBenefits.length <= idx) nextBenefits.push({ number: `0${nextBenefits.length + 1}`, title: { en: '', cn: '', ms: '' }, description: { en: '', cn: '', ms: '' }, image: '' });
                                 nextBenefits[idx] = { ...nextBenefits[idx], description: next };
                                 updateSiteSettings({...siteSettings, benefits: nextBenefits});
                               }, false, 'gray')}
                            </div>
                         </div>
                         );
                      })}
                   </div>
                </div>

                <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 md:col-span-2 space-y-10">
                   <h3 className="text-xl font-black italic uppercase border-b pb-6 text-gray-950">4. Footer & Contact Info</h3>
                   <div className="grid md:grid-cols-2 gap-10 text-left">
                      <div className="space-y-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-300 ml-4 tracking-widest">OFFICE EMAIL</label>
                            <input value={siteSettings.officeEmail} onChange={e => updateSiteSettings({...siteSettings, officeEmail: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-sm border-none shadow-inner" placeholder="partner@lg-subscribe.com.my" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-300 ml-4 tracking-widest">OFFICE PHONE</label>
                            <input value={siteSettings.officePhone || ''} onChange={e => updateSiteSettings({...siteSettings, officePhone: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-sm border-none shadow-inner" placeholder="e.g. +60123456789" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-lg-red ml-4 italic tracking-widest">STORE LOCATION & MAPS</label>
                            <input value={siteSettings.siteAddress || ''} onChange={e => updateSiteSettings({...siteSettings, siteAddress: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-[12px] border-none shadow-inner mb-4" placeholder="Physical Address..." />
                            <input value={siteSettings.googleMapsUrl || ''} onChange={e => updateSiteSettings({...siteSettings, googleMapsUrl: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-[12px] border-none shadow-inner" placeholder="Google Maps URL..." />
                         </div>
                      </div>
                      <div className="space-y-8">
                        {renderMultilingualInput("HUB DESCRIPTION (FOOTER)", siteSettings.siteDescription || {en:'',cn:'',ms:''}, (next) => updateSiteSettings({...siteSettings, siteDescription: next}))}
                      </div>
                   </div>
                </div>

                <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 md:col-span-2 space-y-10">
                   <h3 className="text-xl font-black italic uppercase border-b pb-6 text-gray-950 italic">5. 加入资讯 (JOIN US INFO)</h3>
                   <div className="space-y-12 text-left">
                      {renderMultilingualInput("JOIN US TAGLINE", siteSettings.joinUsTagline || {en:'',cn:'',ms:''}, (next) => updateSiteSettings({...siteSettings, joinUsTagline: next}), true)}
                      <div className="grid md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 italic tracking-widest">RECRUITMENT WA (601...)</label>
                            <input value={siteSettings.recruitmentWa} onChange={e => updateSiteSettings({...siteSettings, recruitmentWa: e.target.value.replace(/\D/g, '')})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-xl border-none shadow-inner outline-none" placeholder="601..." />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 italic tracking-widest">PARTNER REWARDS</label>
                            <div className="space-y-3">
                               {(siteSettings.joinUsBenefits || []).map((b, idx) => (
                                  <div key={idx} className="bg-gray-50 p-6 rounded-[35px] border border-gray-100 flex flex-col gap-3 shadow-sm relative group">
                                     <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-gray-300">CN</span>
                                        <input value={b.cn} onChange={e => {const n = [...siteSettings.joinUsBenefits]; n[idx].cn = e.target.value; updateSiteSettings({...siteSettings, joinUsBenefits: n});}} className="flex-1 bg-transparent border-none outline-none font-black text-sm" placeholder="佣金描述 (CN)" />
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-gray-300">EN</span>
                                        <input value={b.en} onChange={e => {const n = [...siteSettings.joinUsBenefits]; n[idx].en = e.target.value; updateSiteSettings({...siteSettings, joinUsBenefits: n});}} className="flex-1 bg-transparent border-none outline-none font-bold text-[11px] text-gray-400" placeholder="Reward Desc (EN)" />
                                     </div>
                                     <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-gray-300">MS</span>
                                        <input value={b.ms} onChange={e => {const n = [...siteSettings.joinUsBenefits]; n[idx].ms = e.target.value; updateSiteSettings({...siteSettings, joinUsBenefits: n});}} className="flex-1 bg-transparent border-none outline-none font-bold text-[11px] text-gray-400" placeholder="Ganjaran (MS)" />
                                     </div>
                                     <button onClick={() => updateSiteSettings({...siteSettings, joinUsBenefits: siteSettings.joinUsBenefits.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                  </div>
                               ))}
                               <button onClick={() => updateSiteSettings({...siteSettings, joinUsBenefits: [...(siteSettings.joinUsBenefits || []), {en:'New Perk', cn:'新福利', ms:'Kelebihan Baru'}]})} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-[35px] text-gray-300 font-black text-[10px] uppercase hover:border-lg-red transition-all">+ Add Reward</button>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        )}

        {activeTab === 'tools' && (
           <div className="space-y-12 animate-fade-up text-left">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-950">Partner Link Engine.</h2>
              <div className="bg-white p-14 rounded-[60px] shadow-3xl space-y-12 max-w-4xl border border-gray-100">
                <div className="grid md:grid-cols-2 gap-10 text-left">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-lg-red ml-4 italic tracking-[0.2em]">Agent Name</label>
                    <input value={toolsName} onChange={e => setToolsName(e.target.value)} className="w-full p-6 bg-gray-50 rounded-[25px] font-black outline-none border-none shadow-inner italic uppercase" placeholder="LSM JOE" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-lg-red ml-4 italic tracking-[0.2em]">WhatsApp (601...)</label>
                    <input value={toolsWa} onChange={e => setToolsWa(e.target.value)} className="w-full p-6 bg-gray-50 rounded-[25px] font-black outline-none border-none shadow-inner" placeholder="60167483395" />
                  </div>
                </div>
                <button onClick={() => {
                   if(!toolsWa || !toolsName) return alert("Fill all info");
                   const cleanWa = toolsWa.replace(/\D/g, '');
                   const token = 'AG' + toolsName.substring(0, 2).toUpperCase() + cleanWa.slice(-4);
                   const link = `${window.location.origin}${window.location.pathname}?wa=${cleanWa}&name=${encodeURIComponent(toolsName)}&t=${token}#home`;
                   setGenLink(link);
                   localStorage.setItem('my_agent_wa', cleanWa);
                   localStorage.setItem('my_agent_name', toolsName);
                   if (!authorizedAgents.some(a => a.whatsapp === cleanWa)) setAuthorizedAgents([...authorizedAgents, {id: Date.now().toString(), name: toolsName, whatsapp: cleanWa, token}]);
                }} className="w-full bg-black text-white py-10 rounded-full font-black uppercase tracking-[0.4em] text-sm hover:bg-lg-red transition-all shadow-xl">Generate My Partner Link</button>
                {genLink && (
                  <div className="p-10 bg-rose-50/50 rounded-[40px] border border-rose-100/30 flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 bg-white p-6 rounded-2xl text-[12px] font-mono break-all border border-rose-100 shadow-inner leading-loose">{genLink}</div>
                    <button onClick={() => {navigator.clipboard.writeText(genLink); setCopied(true); setTimeout(()=>setCopied(false), 2000);}} className="bg-lg-red text-white p-8 rounded-2xl shrink-0 shadow-lg hover:bg-black transition-all">{copied ? <Check size={32}/> : <Copy size={32}/>}</button>
                  </div>
                )}
              </div>
           </div>
        )}

        {editingProduct && (
          <div className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#f8f9fa] rounded-[60px] w-full max-w-[1400px] min-h-[90vh] p-10 md:p-14 relative animate-fade-up shadow-3xl my-10 flex flex-col gap-12 text-left">
              <button onClick={() => setEditingProduct(null)} className="absolute top-10 right-10 p-4 bg-white rounded-full hover:bg-lg-red hover:text-white transition-all shadow-md z-50 text-gray-300"><X size={24}/></button>
              
              <div className="bg-white p-8 rounded-[45px] shadow-sm flex items-center gap-8">
                <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-lg-red shrink-0 shadow-inner"><Sparkles size={28} className="animate-pulse" /></div>
                <div className="flex-1 text-left">
                  <p className="text-[10px] font-black uppercase text-gray-300 mb-2 ml-4 italic">IMPORT SELLING POINTS FROM LG OFFICIAL URL</p>
                  <div className="flex gap-4">
                    <input value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="Paste LG URL..." className="flex-1 p-6 bg-gray-50 rounded-[25px] border-none shadow-inner font-bold text-[13px] outline-none" />
                    <button onClick={handleImportAI} disabled={isImporting} className="bg-black text-white px-12 py-6 rounded-[25px] font-black text-[12px] uppercase shadow-xl hover:bg-lg-red transition-all">{isImporting ? 'Syncing...' : 'AI 导入'}</button>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-16 flex-1 text-left">
                <div className="space-y-12">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-300 ml-4 italic tracking-widest">SKU Name</label>
                    <input value={editingProduct.name} onChange={e => updateField('name', e.target.value)} className="w-full p-8 bg-white rounded-[35px] font-black text-2xl border-none shadow-sm outline-none" placeholder="Product Name" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-300 ml-4 italic tracking-widest">Main Model Code</label>
                    <input value={editingProduct.modelId || editingProduct.id} onChange={e => updateField('modelId', e.target.value)} className="w-full p-8 bg-white rounded-[35px] font-black text-3xl text-lg-red uppercase italic border-none shadow-sm outline-none" placeholder="MODEL-CODE" />
                  </div>

                  {renderMultilingualInput("Sub-name / Tagline", editingProduct.subName || {en:'',cn:'',ms:''}, (next) => updateField('subName', next), false, 'red')}

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-300 ml-4 italic tracking-widest">Category</label>
                    <select value={editingProduct.category} onChange={e => updateField('category', e.target.value)} className="w-full p-6 bg-white rounded-[25px] font-black text-sm border-none shadow-sm outline-none cursor-pointer appearance-none">
                      {siteSettings.categories.map(c => <option key={c.id} value={c.id}>{c.label.cn}</option>)}
                    </select>
                  </div>

                  <div className="bg-white/50 p-8 rounded-[40px] border border-white shadow-sm space-y-8">
                     <h3 className="text-sm font-black italic uppercase text-lg-red text-center tracking-widest">HP OPTIONS CONFIG</h3>
                     <div className="space-y-4">
                        {(editingProduct.hpOptions || []).map((hp, i) => (
                           <div key={i} className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-50 flex flex-col gap-4 relative">
                              <div className="flex gap-4 items-center">
                                <input value={hp.value} onChange={e => {const n = [...editingProduct.hpOptions!]; n[i].value = e.target.value; updateField('hpOptions', n);}} className="w-20 p-4 bg-gray-50 rounded-2xl text-[11px] font-black text-center" placeholder="1.0HP" />
                                <input value={hp.modelId || ''} onChange={e => {const n = [...editingProduct.hpOptions!]; n[i].modelId = e.target.value; updateField('hpOptions', n);}} className="flex-1 p-4 bg-gray-50 rounded-2xl text-[11px] font-black italic uppercase" placeholder="SKU CODE" />
                                <button onClick={() => updateField('hpOptions', editingProduct.hpOptions!.filter((_, idx) => idx !== i))} className="text-red-200 hover:text-red-500"><Trash2 size={16}/></button>
                              </div>
                              <div className="flex flex-col gap-1">
                                 <label className="text-[8px] font-black uppercase text-gray-300 ml-4 tracking-widest">RENTAL OFFSET (+RM):</label>
                                 <input type="number" value={hp.rentalOffset || 0} onChange={e => {const n = [...editingProduct.hpOptions!]; n[i].rentalOffset = Number(e.target.value); updateField('hpOptions', n);}} className="p-4 bg-gray-50 rounded-2xl text-[13px] font-black outline-none border-none shadow-inner" />
                              </div>
                           </div>
                        ))}
                        <button onClick={() => updateField('hpOptions', [...(editingProduct.hpOptions || []), {label:{en:'1.0HP',cn:'1.0HP',ms:'1.0HP'}, value:'1.0HP', modelId:'', rentalOffset:0}])} className="w-full py-6 border-2 border-dashed border-gray-200 rounded-[35px] text-gray-300 font-black text-[10px] uppercase tracking-widest hover:border-lg-red transition-all">+ Add HP Option</button>
                     </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-300 ml-4 italic tracking-widest">Main Image</label>
                    <div onClick={() => handleFileUpload(b => updateField('image', b))} className="aspect-square bg-white rounded-[60px] border border-white flex items-center justify-center overflow-hidden cursor-pointer shadow-sm group">
                      {editingProduct.image ? <img src={editingProduct.image} className="max-h-[85%] object-contain transition-transform group-hover:scale-105" /> : <UploadCloud size={64} className="text-gray-200" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                   <div className="space-y-8">
                      <h3 className="text-2xl font-black italic uppercase text-gray-950 px-4">Variants</h3>
                      <div className="space-y-4">
                        {(editingProduct.variants || []).map((v, i) => (
                           <div key={i} className="p-6 bg-white rounded-[40px] border border-white shadow-sm flex flex-col gap-4 group relative overflow-hidden">
                              <div className="flex gap-4 items-center">
                                <div onClick={() => handleFileUpload(b => { const n = [...editingProduct.variants!]; n[i].image = b; updateField('variants', n); })} className="w-16 h-16 bg-gray-50 rounded-[20px] overflow-hidden cursor-pointer shrink-0 flex items-center justify-center">
                                   {v.image ? <img src={v.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-200" size={20}/>}
                                </div>
                                <div className="flex-1 space-y-2">
                                   <input value={v.name} onChange={e => { const n = [...editingProduct.variants!]; n[i].name = e.target.value; updateField('variants', n); }} className="w-full p-4 bg-gray-50 rounded-2xl text-[11px] font-black outline-none border-none shadow-inner" placeholder="Variant Color Name" />
                                   <input value={v.modelId || ''} onChange={e => { const n = [...editingProduct.variants!]; n[i].modelId = e.target.value; updateField('variants', n); }} className="w-full p-4 bg-gray-50 rounded-2xl text-[11px] font-black italic uppercase outline-none border-none shadow-inner" placeholder="SKU CODE" />
                                </div>
                                <button onClick={() => updateField('variants', editingProduct.variants!.filter((_, idx) => idx !== i))} className="text-red-200 hover:text-red-500 transition-colors"><X size={20}/></button>
                              </div>
                           </div>
                        ))}
                        <button onClick={() => updateField('variants', [...(editingProduct.variants || []), {name:'', image:'', modelId:'', colorCode:'#FFFFFF'}])} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-[45px] text-gray-300 font-black text-[12px] uppercase tracking-widest hover:border-lg-red transition-all">+ Add Variant</button>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="flex justify-between items-center px-4">
                         <h3 className="text-xl font-black italic uppercase">Features</h3>
                         <span className="text-[9px] text-gray-300 uppercase italic">CN Input Then Translate</span>
                      </div>
                      <div className="space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar pr-2">
                        {(editingProduct.features || []).map((f, i) => (
                           <div key={i} className="bg-white p-6 rounded-[30px] shadow-sm relative space-y-4 border border-white group">
                              <div className="flex gap-2">
                                 <input value={f.cn} onChange={e => {const n = [...editingProduct.features]; n[i].cn = e.target.value; updateField('features', n);}} className="flex-1 p-4 bg-gray-50 rounded-2xl text-[12px] font-bold" placeholder="输入中文..." />
                                 <button onClick={() => translateFeature(i)} className="p-4 bg-lg-dark text-white rounded-2xl hover:bg-lg-red transition-all shadow-md">
                                    {isTranslating === `f-${i}` ? <RefreshCw className="animate-spin" size={16}/> : <Languages size={16}/>}
                                 </button>
                              </div>
                              <input value={f.en} onChange={e => {const n = [...editingProduct.features]; n[i].en = e.target.value; updateField('features', n);}} className="w-full p-4 bg-gray-50/50 rounded-2xl text-[10px] font-bold text-gray-400" placeholder="English..." />
                              <button onClick={() => updateField('features', editingProduct.features.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 p-2 bg-white text-red-200 rounded-full shadow-sm hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                           </div>
                        ))}
                        <button onClick={() => updateField('features', [...(editingProduct.features || []), {en:'', cn:'', ms:''}])} className="w-full py-5 border-2 border-dashed border-gray-200 rounded-[35px] text-gray-300 font-black text-[11px] uppercase tracking-widest hover:border-lg-red transition-all">+ Add Feature</button>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col h-full">
                   <h3 className="text-2xl font-black italic uppercase text-center mb-8 text-gray-950 tracking-tighter">Subscription Plans</h3>
                   <div className="flex-1 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-2 p-1">
                        {(editingProduct.plans || []).map((p, i) => (
                           <div key={i} className="p-8 bg-white rounded-[50px] shadow-sm border border-white space-y-6 relative group">
                              <div className="grid grid-cols-2 gap-6">
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-300 ml-4 italic tracking-widest">Price (RM)</label>
                                    <input type="number" value={p.price} onChange={e => {const n = [...editingProduct.plans]; n[i].price = Number(e.target.value); updateField('plans', n);}} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-2xl border-none outline-none shadow-inner" />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-300 ml-4 italic tracking-widest">Maintenance</label>
                                    <select value={p.maintenanceType} onChange={e => {const n = [...editingProduct.plans]; n[i].maintenanceType = e.target.value as any; updateField('plans', n);}} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-sm border-none shadow-sm cursor-pointer">
                                       <option value="Regular Visit">Regular Visit</option>
                                       <option value="Self Service">Self Service</option>
                                       <option value="Combine Maintenance">Combine Maintenance</option>
                                       <option value="No Service">No Service</option>
                                    </select>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-300 ml-4 italic tracking-widest">Service Interval</label>
                                    <select value={p.serviceInterval} onChange={e => {const n = [...editingProduct.plans]; n[i].serviceInterval = e.target.value as any; updateField('plans', n);}} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-sm border-none shadow-sm cursor-pointer">
                                       <option value="None">None</option>
                                       <option value="3m">3m</option>
                                       <option value="4m">4m</option>
                                       <option value="6m">6m</option>
                                       <option value="12m">12m</option>
                                       <option value="24m">24m</option>
                                    </select>
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-300 ml-4 italic tracking-widest">Term (Years)</label>
                                    <select value={p.termYears} onChange={e => {const n = [...editingProduct.plans]; n[i].termYears = e.target.value === 'Outright' ? 'Outright' : Number(e.target.value); updateField('plans', n);}} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-sm border-none shadow-sm cursor-pointer">
                                       <option value={7}>7 Years Plan</option>
                                       <option value={5}>5 Years Plan</option>
                                       <option value={3}>3 Years Plan</option>
                                       <option value="Outright">Outright</option>
                                    </select>
                                 </div>
                              </div>
                              <button onClick={() => updateField('plans', editingProduct.plans.filter((_, idx) => idx !== i))} className="w-full py-3 text-rose-200 text-[10px] font-black uppercase italic hover:text-lg-red transition-colors">Delete Plan</button>
                           </div>
                        ))}
                        <button onClick={() => updateField('plans', [...(editingProduct.plans || []), {termYears:7, maintenanceType:'Regular Visit', serviceInterval:'4m', price:85}])} className="w-full py-10 border-4 border-dashed border-gray-200 rounded-[50px] text-gray-300 font-black text-[12px] uppercase tracking-widest hover:border-lg-red transition-all">+ Add Plan</button>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 mt-8">
                      <button onClick={() => updateField('isHotSale', !editingProduct.isHotSale)} className={`py-5 rounded-[30px] font-black text-[12px] uppercase border transition-all flex items-center justify-center gap-2 ${editingProduct.isHotSale ? 'bg-white border-rose-100 text-lg-red shadow-lg' : 'bg-gray-50 border-transparent text-gray-300'}`}>{editingProduct.isHotSale && <Flame size={16}/>} Hot Sale</button>
                      <button onClick={() => updateField('isNew', !editingProduct.isNew)} className={`py-5 rounded-[30px] font-black text-[12px] uppercase border transition-all flex items-center justify-center gap-2 ${editingProduct.isNew ? 'bg-white border-lg-dark text-lg-dark shadow-lg' : 'bg-gray-50 border-transparent text-gray-300'}`}>{editingProduct.isNew && <Sparkle size={16}/>} New Release</button>
                   </div>

                   <button onClick={async () => {
                       const final = {...editingProduct, modelId: (editingProduct.modelId || editingProduct.id).toUpperCase()};
                       const next = products.some(p => p.id === final.id) ? products.map(p => p.id === final.id ? final : p) : [final, ...products];
                       await setProducts(next);
                       setEditingProduct(null);
                   }} className="mt-8 w-full bg-lg-red text-white py-11 rounded-full font-black uppercase tracking-[0.4em] text-lg shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-4 group">SAVE PRODUCT <ArrowRight className="group-hover:translate-x-2 transition-transform"/></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {editingCategory && (
           <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 text-left">
              <div className="bg-white rounded-[50px] w-full max-w-2xl p-12 relative shadow-3xl">
                <button onClick={() => setEditingCategory(null)} className="absolute top-10 right-10 p-3 bg-gray-100 rounded-full hover:bg-lg-red hover:text-white transition-all"><X size={24}/></button>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-950 mb-10">Configure Category</h2>
                <div className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-gray-300 ml-4 tracking-widest">Category ID (System Key - EN)</label>
                      <input value={editingCategory.id} onChange={e => setEditingCategory({...editingCategory, id: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black border-none shadow-inner outline-none" placeholder="e.g. Water Purifier" />
                   </div>
                   {renderMultilingualInput("Category Display Name", editingCategory.label, (next) => setEditingCategory({...editingCategory, label: next}))}
                </div>
                <button onClick={() => {
                   if(!editingCategory.id) return alert("ID is required");
                   const next = siteSettings.categories.some(x => x.id === editingCategory.id) 
                      ? siteSettings.categories.map(x => x.id === editingCategory.id ? editingCategory : x) 
                      : [...siteSettings.categories, editingCategory];
                   updateSiteSettings({...siteSettings, categories: next});
                   setEditingCategory(null);
                }} className="mt-12 w-full bg-lg-red text-white py-8 rounded-full font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">SAVE CATEGORY</button>
              </div>
           </div>
        )}

        {editingPromo && (
           <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 text-left">
              <div className="bg-white rounded-[60px] w-full max-w-6xl p-12 relative shadow-3xl text-left overflow-y-auto max-h-[95vh] no-scrollbar">
                <button onClick={() => { setEditingPromo(null); setPromoProductSearch(''); }} className="absolute top-10 right-10 p-3 bg-gray-100 rounded-full hover:bg-lg-red hover:text-white transition-all"><X size={24}/></button>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-gray-950 mb-14 flex items-center gap-4"><Tag size={32}/> PROMO CONFIGURATION.</h2>
                <div className="grid md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      {renderMultilingualInput("Promo Title", editingPromo.title, (next) => setEditingPromo({...editingPromo, title: next}))}
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-gray-300 ml-4 tracking-widest">Promo Type</label>
                         <div className="flex bg-gray-50 p-1.5 rounded-[25px] border border-gray-100">
                            {[
                               { id: 'percentage', label: '百分比折扣 (%)' },
                               { id: 'fixed_discount', label: '定额折扣 (RM)' },
                               { id: 'fixed_price', label: '一口价 (RM)' }
                            ].map((t) => (
                               <button 
                                 key={t.id} 
                                 onClick={() => setEditingPromo({...editingPromo, type: t.id as any})}
                                 className={`flex-1 py-3 px-4 rounded-[20px] text-[9px] font-black uppercase transition-all ${editingPromo.type === t.id ? 'bg-white text-lg-red shadow-md' : 'text-gray-400'}`}
                               >
                                 {t.label}
                               </button>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-gray-300 ml-4 tracking-widest">End Date</label>
                         <input type="date" value={editingPromo.endDate} onChange={e => setEditingPromo({...editingPromo, endDate: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black border-none shadow-inner outline-none" />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-gray-300 ml-4 tracking-widest">Discount Value (%, RM or Fix Price)</label>
                         <input type="number" value={editingPromo.value} onChange={e => setEditingPromo({...editingPromo, value: Number(e.target.value)})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black outline-none border-none shadow-inner" />
                      </div>
                      <div className={`space-y-3 transition-all duration-500 ${editingPromo.type === 'percentage' ? 'opacity-100' : 'opacity-30'}`}>
                         <label className="text-[10px] font-black uppercase text-gray-300 ml-4 tracking-widest">Duration (First X Months)</label>
                         <input 
                            disabled={editingPromo.type !== 'percentage'}
                            type="number" 
                            value={editingPromo.durationMonths || 0} 
                            onChange={e => setEditingPromo({...editingPromo, durationMonths: Number(e.target.value)})} 
                            className="w-full p-6 bg-gray-50 rounded-[25px] font-black outline-none border-none shadow-inner" 
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase text-gray-300 ml-4 tracking-widest">Select Promo Theme Color</label>
                         <div className="flex gap-4 p-6 bg-gray-50 rounded-[30px] border border-white shadow-inner">
                           {['cyan', 'rose', 'amber', 'blue', 'emerald'].map(c => (
                             <button key={c} onClick={() => setEditingPromo({...editingPromo, color: c as any})} className={`w-12 h-12 rounded-full border-2 ${editingPromo.color === c ? 'border-black scale-125 shadow-xl' : 'border-transparent opacity-50'} bg-${c}-400 transition-all`}></button>
                           ))}
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-black uppercase text-lg-red ml-4 italic tracking-widest flex justify-between">
                          <span>Select Applicable Products:</span>
                          <span className="text-gray-400">Selected: {editingPromo.applicableProductIds.length}</span>
                        </label>
                        <div className="relative">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                          <input 
                            value={promoProductSearch} 
                            onChange={e => setPromoProductSearch(e.target.value)} 
                            placeholder="搜索产品进行筛选..." 
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 rounded-[25px] border-none shadow-inner font-bold text-[12px] outline-none"
                          />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-[50px] shadow-inner max-h-[580px] overflow-y-auto space-y-3 no-scrollbar border border-white/50 text-left">
                         {products
                           .filter(p => p.name.toLowerCase().includes(promoProductSearch.toLowerCase()) || p.id.toLowerCase().includes(promoProductSearch.toLowerCase()) || p.modelId?.toLowerCase().includes(promoProductSearch.toLowerCase()))
                           .map(p => (
                            <div key={p.id} 
                               onClick={() => {
                                  const nextIds = editingPromo.applicableProductIds.includes(p.id) 
                                    ? editingPromo.applicableProductIds.filter(id => id !== p.id)
                                    : [...editingPromo.applicableProductIds, p.id];
                                  setEditingPromo({...editingPromo, applicableProductIds: nextIds});
                               }}
                               className={`flex items-center gap-5 p-5 rounded-[30px] cursor-pointer transition-all border-2 ${editingPromo.applicableProductIds.includes(p.id) ? 'bg-white border-lg-red shadow-xl scale-[1.01]' : 'bg-transparent border-transparent opacity-50 hover:opacity-100'}`}
                            >
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${editingPromo.applicableProductIds.includes(p.id) ? 'bg-lg-red text-white' : 'bg-gray-200 text-gray-400'}`}>
                                  <Check size={18} strokeWidth={4} />
                               </div>
                               <div className="flex-1 overflow-hidden">
                                  <p className="text-[11px] font-black uppercase text-gray-950 truncate">{p.name}</p>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase italic truncate">{p.modelId || p.id}</p>
                               </div>
                            </div>
                         ))}
                         {products.filter(p => p.name.toLowerCase().includes(promoProductSearch.toLowerCase()) || p.id.toLowerCase().includes(promoProductSearch.toLowerCase())).length === 0 && (
                           <div className="py-12 text-center text-gray-300 font-black uppercase text-[10px]">No matches found</div>
                         )}
                      </div>
                   </div>
                </div>
                <button onClick={() => {
                   const next = (siteSettings.promoTemplates || []).some(x => x.id === editingPromo.id) ? siteSettings.promoTemplates.map(x => x.id === editingPromo.id ? editingPromo : x) : [...(siteSettings.promoTemplates || []), editingPromo];
                   updateSiteSettings({...siteSettings, promoTemplates: next});
                   setEditingPromo(null);
                   setPromoProductSearch('');
                }} className="mt-16 w-full bg-lg-red text-white py-11 rounded-full font-black uppercase tracking-[0.4em] text-sm shadow-2xl hover:bg-black transition-all">PUBLISH PROMOTION</button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
