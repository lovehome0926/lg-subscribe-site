
import React, { useState, useMemo } from 'react';
import { Product, Agent, SiteSettings, Language, PromotionTemplate, ProductPlan, ProductVariant, Store, HpOption, BenefitItem } from '../types.ts';
import { CATEGORIES } from '../constants.ts';
import { processProductAI } from '../utils/ai.ts';
import { Trash2, X, Search, Edit3, UploadCloud, MapPin, Flame, Plus, Check, Mail, Globe, Layers, ListChecks, Calendar, Tag, Info, Link2, User, Phone, Copy, Sparkles, Image as ImageIcon, Ticket, Download, RotateCcw, Layout, FileText, Share2 } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  setProducts: (p: Product[]) => Promise<void>;
  authorizedAgents: Agent[];
  setAuthorizedAgents: (a: Agent[]) => Promise<void>;
  categories: string[];
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
  const [searchQuery, setSearchQuery] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (callback: (base64: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
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

  const handleExportData = () => {
    const data = { products, siteSettings, version: '17.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LG_HUB_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (re) => {
      try {
        const data = JSON.parse(re.target?.result as string);
        if (data.products) await setProducts(data.products);
        if (data.siteSettings) await updateSiteSettings(data.siteSettings);
        alert("Restore Successful!");
        window.location.reload();
      } catch (err) { alert("Invalid File."); }
    };
    reader.readAsText(file);
  };

  const handleImportAI = async () => {
    if (!importUrl) return alert("URL required");
    setIsImporting(true);
    try {
      const resultStr = await processProductAI(importUrl);
      const result = JSON.parse(resultStr);
      if (editingProduct && result) {
        setEditingProduct({
          ...editingProduct,
          name: result.name || editingProduct.name,
          modelId: result.modelId || editingProduct.modelId,
          features: result.features || editingProduct.features,
          painPoints: result.painPoints || editingProduct.painPoints,
          subName: result.subName || editingProduct.subName,
          category: result.category || editingProduct.category,
        });
      }
    } catch (e) { alert("AI Error"); } finally { setIsImporting(false); }
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    const next = products.some(p => p.id === editingProduct.id) ? products.map(p => p.id === editingProduct.id ? editingProduct : p) : [editingProduct, ...products];
    await setProducts(next);
    setEditingProduct(null);
  };

  const handleSavePromo = async () => {
    if (!editingPromo) return;
    const existing = siteSettings.promoTemplates || [];
    const next = existing.some(t => t.id === editingPromo.id) ? existing.map(t => t.id === editingPromo.id ? editingPromo : t) : [editingPromo, ...existing];
    await updateSiteSettings({...siteSettings, promoTemplates: next});
    setEditingPromo(null);
  };

  // Define toggleProductInPromo to handle selection/deselection of products in a promotion template
  const toggleProductInPromo = (productId: string) => {
    if (!editingPromo) return;
    const currentIds = editingPromo.applicableProductIds || [];
    const nextIds = currentIds.includes(productId)
      ? currentIds.filter(id => id !== productId)
      : [...currentIds, productId];
    setEditingPromo({ ...editingPromo, applicableProductIds: nextIds });
  };

  const updateField = (f: string, v: any) => editingProduct && setEditingProduct({...editingProduct, [f]: v});

  return (
    <div className="bg-white min-h-screen pt-28 pb-20">
      <div className="bg-lg-dark text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="italic font-black text-center md:text-left">
            <h1 className="text-3xl uppercase tracking-tighter leading-none">LG HUB TERMINAL.</h1>
            <p className="text-lg-red text-[10px] uppercase tracking-[0.4em] mt-2">ADMIN & MARKETING CENTER</p>
          </div>
          <div className="flex bg-[#0a0f18] p-2 rounded-full border border-white/5 overflow-x-auto no-scrollbar max-w-full">
            {['inventory', 'agents', 'promo', 'settings', 'tools'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-lg-red text-white' : 'text-gray-500 hover:text-white'}`}>{tab}</button>
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
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-6 py-5 rounded-[25px] border-none shadow-sm bg-gray-50 font-bold" placeholder="Search SKU..." />
              </div>
              <button onClick={() => setEditingProduct({ id: `P-${Date.now()}`, name: '', modelId: '', category: siteSettings.categories[0], subName: {en:'',cn:'',ms:''}, description: '', image: '', normalPrice: 0, promoPrice: 0, promoText: '', warranty: '', plans: [], features: [], painPoints: [], variants: [], isHotSale: false })} className="bg-lg-red text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">Add SKU</button>
            </div>
            <div className="grid gap-6">
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                <div key={p.id} className="bg-gray-50 p-8 rounded-[40px] flex items-center gap-8 group hover:border-lg-red transition-all">
                  <div className="w-20 h-20 bg-white rounded-2xl p-4 flex items-center justify-center overflow-hidden shrink-0 relative border border-white"><img src={p.image} className="max-h-full object-contain" /></div>
                  <div className="flex-1">
                    <h4 className="font-black uppercase italic leading-tight">{p.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{p.category} | {p.modelId || 'No Code'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProduct(p)} className="p-4 bg-white rounded-full text-gray-400 hover:text-black shadow-sm transition-all"><Edit3 size={18}/></button>
                    <button onClick={() => { if(confirm("Delete?")) setProducts(products.filter(x => x.id !== p.id)); }} className="p-4 bg-red-50 text-red-300 rounded-full hover:bg-red-500 hover:text-white"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promo' && (
          <div className="space-y-12 animate-fade-up">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-950">Promotions.</h2>
                <button onClick={() => setEditingPromo({ id: `T-${Date.now()}`, type: 'percentage', title: {en:'OFFER',cn:'限时特惠',ms:'PROMO'}, applicableProductIds: [], durationMonths: 9, value: 50, endDate: '2026-02-28', content: {en:'',cn:'',ms:''}, color: 'cyan' })} className="bg-lg-red text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">+ CREATE PROMO</button>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {(siteSettings.promoTemplates || []).map(promo => (
                 <div key={promo.id} className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-xl space-y-6 group hover:border-lg-red transition-all">
                    <div className="flex justify-between items-center border-b pb-6">
                      <div className="flex items-center gap-3"><Ticket className="text-lg-red" size={20} /><h4 className="text-lg font-black italic uppercase text-gray-950 leading-none">{promo.title[language]}</h4></div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingPromo(promo)} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-black transition-all"><Edit3 size={16}/></button>
                        <button onClick={() => updateSiteSettings({...siteSettings, promoTemplates: siteSettings.promoTemplates.filter(x => x.id !== promo.id)})} className="p-3 bg-gray-50 rounded-full text-red-300 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End: {promo.endDate} | {promo.value}% Off</p>
                 </div>
               ))}
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-16 animate-fade-up">
             <header className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Hub Settings.</h2>
                <div className="flex gap-4">
                   <button onClick={handleExportData} className="flex items-center gap-3 bg-black text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg"><Download size={14}/> Backup All</button>
                   <label className="flex items-center gap-3 bg-white border border-gray-100 text-gray-400 px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-sm cursor-pointer">
                      <RotateCcw size={14}/> Restore <input type="file" onChange={handleImportData} className="hidden" accept=".json" />
                   </label>
                </div>
             </header>

             <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 space-y-10">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter border-b pb-6">1. Branding & Hero</h3>
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">SITE LOGO</label>
                         <div onClick={() => handleFileUpload(b => updateSiteSettings({...siteSettings, logoUrl: b}))} className="aspect-video bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer">
                            {siteSettings.logoUrl ? <img src={siteSettings.logoUrl} className="max-h-12" /> : <UploadCloud className="text-gray-200" />}
                         </div>
                      </div>
                      <div className="space-y-4">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">HERO BACKGROUND</label>
                         <div onClick={() => handleFileUpload(b => updateSiteSettings({...siteSettings, heroImageUrl: b}))} className="aspect-video bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer">
                            {siteSettings.heroImageUrl ? <img src={siteSettings.heroImageUrl} className="w-full h-full object-cover" /> : <UploadCloud className="text-gray-200" />}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 space-y-10">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter border-b pb-6">2. Product Categories</h3>
                   <div className="flex flex-wrap gap-3">
                      {siteSettings.categories.map((cat, i) => (
                        <div key={i} className="flex items-center gap-2 bg-gray-50 pl-6 pr-3 py-3 rounded-full border border-gray-100">
                           <span className="text-[10px] font-black uppercase tracking-widest">{cat}</span>
                           <button onClick={() => updateSiteSettings({...siteSettings, categories: siteSettings.categories.filter(c => c !== cat)})} className="p-2 text-red-300"><X size={14}/></button>
                        </div>
                      ))}
                      <button onClick={() => { const name = prompt("Name?"); if(name) updateSiteSettings({...siteSettings, categories: [...siteSettings.categories, name]}); }} className="px-6 py-3 bg-lg-red text-white rounded-full font-black text-[10px] tracking-widest">+ ADD</button>
                   </div>
                </div>

                <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 space-y-10 md:col-span-2">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter border-b pb-6">3. Three Key Benefits</h3>
                   <div className="grid md:grid-cols-3 gap-8">
                      {[0, 1, 2].map(idx => {
                        const benefit = siteSettings.benefits[idx] || { number: `0${idx+1}`, title: {en:'',cn:'',ms:''}, description: {en:'',cn:'',ms:''}, image: '' };
                        return (
                          <div key={idx} className="bg-gray-50 p-8 rounded-[40px] space-y-6">
                             <div onClick={() => handleFileUpload(b => {
                                const next = [...siteSettings.benefits];
                                next[idx] = { ...benefit, image: b };
                                updateSiteSettings({...siteSettings, benefits: next});
                             })} className="aspect-[4/3] bg-white rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center cursor-pointer shadow-inner">
                                {benefit.image ? <img src={benefit.image} className="w-full h-full object-cover" /> : <UploadCloud className="text-gray-200" size={32} />}
                             </div>
                             <input value={benefit.title.cn} onChange={e => {
                                const next = [...siteSettings.benefits];
                                next[idx] = { ...benefit, title: { ...benefit.title, cn: e.target.value } };
                                updateSiteSettings({...siteSettings, benefits: next});
                             }} className="w-full p-4 bg-white rounded-2xl font-black text-xs" placeholder="Title (CN)" />
                             <textarea value={benefit.description.cn} onChange={e => {
                                const next = [...siteSettings.benefits];
                                next[idx] = { ...benefit, description: { ...benefit.description, cn: e.target.value } };
                                updateSiteSettings({...siteSettings, benefits: next});
                             }} className="w-full p-4 bg-white rounded-2xl font-bold text-[11px] h-24" placeholder="Description (CN)" />
                          </div>
                        );
                      })}
                   </div>
                </div>

                <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 space-y-10 md:col-span-2">
                   <h3 className="text-xl font-black italic uppercase tracking-tighter border-b pb-6">4. Footer & Contact Info</h3>
                   <div className="grid md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">OFFICE EMAIL</label>
                            <input value={siteSettings.officeEmail} onChange={e => updateSiteSettings({...siteSettings, officeEmail: e.target.value})} className="w-full p-5 bg-gray-50 rounded-[20px] font-bold" />
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">OFFICE PHONE</label>
                            <input value={siteSettings.officePhone || ""} onChange={e => updateSiteSettings({...siteSettings, officePhone: e.target.value})} className="w-full p-5 bg-gray-50 rounded-[20px] font-bold" placeholder="e.g. +60123456789" />
                         </div>
                      </div>
                      <div className="space-y-6">
                         <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">HUB DESCRIPTION (FOOTER)</label>
                         <textarea value={siteSettings.siteDescription.cn} onChange={e => updateSiteSettings({...siteSettings, siteDescription: {...siteSettings.siteDescription, cn: e.target.value}})} className="w-full p-6 bg-gray-50 rounded-[35px] font-bold text-sm h-full min-h-[200px]" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* SKU Editor Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[50px] w-full max-w-7xl min-h-[90vh] p-10 md:p-14 relative animate-fade-up shadow-3xl my-10">
            <button onClick={() => setEditingProduct(null)} className="absolute top-10 right-10 p-3 bg-gray-100 rounded-full hover:bg-lg-red hover:text-white"><X size={24}/></button>
            <header className="mb-14"><h2 className="text-5xl font-black uppercase italic tracking-tighter text-gray-950 leading-none">EDIT SKU.</h2></header>
            <div className="mb-16 bg-gray-50/50 p-6 rounded-[35px] border border-gray-100 flex gap-6 items-center">
               <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-lg-red shrink-0 shadow-sm"><Sparkles size={28} className="animate-pulse" /></div>
               <div className="flex-1"><input value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="粘贴官网产品链接，AI 自动抓取型号与卖点..." className="w-full p-4 bg-white rounded-2xl border-none shadow-inner font-bold text-xs" /></div>
               <button onClick={handleImportAI} disabled={isImporting} className="px-12 py-5 bg-black text-white rounded-[20px] font-black uppercase text-[11px] tracking-widest shadow-xl">AI 导入</button>
            </div>
            <div className="grid md:grid-cols-3 gap-16">
               <div className="space-y-10">
                  <div className="space-y-4"><label className="text-[10px] font-black uppercase text-gray-400 ml-1">SKU NAME</label><input value={editingProduct.name} onChange={e => updateField('name', e.target.value)} className="w-full p-6 bg-gray-50 rounded-[25px] border-none font-bold text-xl shadow-inner" /></div>
                  <div className="space-y-4"><label className="text-[10px] font-black uppercase text-gray-400 ml-1">MAIN MODEL CODE</label><input value={editingProduct.modelId} onChange={e => updateField('modelId', e.target.value)} className="w-full p-5 bg-gray-50 rounded-[20px] border-none font-black text-lg text-lg-red shadow-inner" /></div>
                  <div className="space-y-4">
                     <div onClick={() => handleFileUpload(b => updateField('image', b))} className="aspect-[4/3] bg-gray-50 rounded-[45px] border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner">
                        {editingProduct.image ? <img src={editingProduct.image} className="max-h-[80%] object-contain" /> : <UploadCloud size={64} className="text-gray-200" />}
                     </div>
                  </div>
               </div>
               <div className="space-y-10">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">VARIANTS & MODEL ID</h3>
                  <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-3 no-scrollbar pb-10">
                     {(editingProduct.variants || []).map((v, i) => (
                        <div key={i} className="p-8 bg-gray-50 rounded-[40px] space-y-5 border border-gray-100 shadow-sm relative group">
                           <div className="flex gap-6">
                              <div className="w-24 h-24 bg-white rounded-3xl overflow-hidden shadow-inner shrink-0 relative border border-gray-100">
                                 {v.image ? <img src={v.image} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto mt-7 text-gray-200" size={36} />}
                                 <button onClick={() => handleFileUpload(b => { const next = [...(editingProduct.variants || [])]; next[i].image = b; updateField('variants', next); })} className="absolute inset-0 bg-black/20 text-white opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"><UploadCloud size={20}/></button>
                              </div>
                              <div className="flex-1 space-y-3">
                                 <input value={v.name} onChange={e => { const next = [...(editingProduct.variants || [])]; next[i].name = e.target.value; updateField('variants', next); }} className="w-full p-3 bg-white rounded-xl text-[12px] font-black shadow-sm" placeholder="Color Name" />
                                 <input value={v.modelId} onChange={e => { const next = [...(editingProduct.variants || [])]; next[i].modelId = e.target.value; updateField('variants', next); }} className="w-full p-3 bg-white rounded-xl text-[12px] font-black text-lg-red uppercase border-2 border-transparent focus:border-lg-red shadow-sm" placeholder="MODEL CODE" />
                              </div>
                              <button onClick={() => updateField('variants', editingProduct.variants?.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-red-300 hover:text-red-500"><Trash2 size={18}/></button>
                           </div>
                        </div>
                     ))}
                     <button onClick={() => updateField('variants', [...(editingProduct.variants || []), {name:'', image:'', modelId:''}])} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-[40px] text-gray-300 font-black uppercase text-[11px] tracking-widest hover:border-lg-red hover:text-lg-red transition-all flex items-center justify-center gap-4"><Plus size={20}/> + ADD VARIANT</button>
                  </div>
               </div>
               <div className="space-y-10 flex flex-col">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">SUBSCRIPTION PLANS</h3>
                  <div className="space-y-5 flex-1 max-h-[50vh] overflow-y-auto no-scrollbar pr-3">
                     {(editingProduct.plans || []).map((p, i) => (
                        <div key={i} className="p-8 bg-gray-50/80 rounded-[45px] space-y-6 border border-white shadow-sm">
                           <div className="grid grid-cols-2 gap-5">
                              <div className="space-y-2.5">
                                 <label className="text-[9px] font-black uppercase text-gray-400 ml-1">PRICE (RM)</label>
                                 <input type="number" value={p.price} onChange={e => { const next = [...editingProduct.plans]; next[i].price = Number(e.target.value); updateField('plans', next); }} className="w-full p-4 bg-white rounded-2xl font-black text-sm" />
                              </div>
                              <div className="space-y-2.5">
                                 <label className="text-[9px] font-black uppercase text-gray-400 ml-1">SERVICE INTERVAL</label>
                                 <select value={p.serviceInterval} onChange={e => { const next = [...editingProduct.plans]; next[i].serviceInterval = e.target.value as any; updateField('plans', next); }} className="w-full p-4 bg-white rounded-2xl font-black text-xs outline-none">
                                    <option value="None">None</option><option value="3m">3m</option><option value="4m">4m</option><option value="6m">6m</option><option value="12m">12m</option>
                                 </select>
                              </div>
                           </div>
                           <div className="space-y-2.5">
                              <label className="text-[9px] font-black uppercase text-gray-400 ml-1">MAINTENANCE TYPE</label>
                              <select value={p.maintenanceType} onChange={e => { const next = [...editingProduct.plans]; next[i].maintenanceType = e.target.value as any; updateField('plans', next); }} className="w-full p-4 bg-white rounded-2xl font-black text-xs outline-none">
                                 <option value="No Service">No Service</option><option value="Self Service">Self Service</option><option value="Regular Visit">Regular Visit</option><option value="Combined">Combined</option><option value="None">None</option>
                              </select>
                           </div>
                        </div>
                     ))}
                     <button onClick={() => updateField('plans', [...(editingProduct.plans || []), {termYears:7, maintenanceType:'Regular Visit', serviceInterval:'4m', price:85}])} className="w-full py-6 bg-gray-50/50 rounded-3xl font-black text-[10px] uppercase tracking-widest text-gray-300 hover:text-lg-red transition-all">+ ADD PLAN</button>
                  </div>
                  <button onClick={handleSaveProduct} className="mt-12 w-full bg-[#e60044] text-white py-12 rounded-[40px] font-black uppercase tracking-[0.4em] text-sm shadow-3xl hover:bg-black transition-all">SAVE PRODUCT</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Promo Configuration Modal */}
      {editingPromo && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[60px] w-full max-w-4xl min-h-[85vh] p-12 md:p-16 relative animate-fade-up shadow-3xl my-8">
             <button onClick={() => setEditingPromo(null)} className="absolute top-10 right-10 p-3 bg-gray-100 rounded-full hover:bg-lg-red hover:text-white"><X size={24}/></button>
             <header className="mb-14 flex items-center gap-4"><Tag className="text-lg-red" size={28}/><h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-950 leading-none">PROMO CONFIGURATION.</h2></header>
             <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-10">
                   <div className="space-y-4"><label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">PROMO TITLE (ENGLISH)</label><input value={editingPromo.title.en} onChange={e => setEditingPromo({...editingPromo, title: {...editingPromo.title, en: e.target.value}})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-lg" /></div>
                   <div className="space-y-4"><label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">END DATE</label><div className="relative"><input type="date" value={editingPromo.endDate} onChange={e => setEditingPromo({...editingPromo, endDate: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-lg pr-16 shadow-sm" /><Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" size={24} /></div></div>
                </div>
                <div className="grid md:grid-cols-2 gap-10">
                   <div className="space-y-4"><label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">DISCOUNT (%)</label><input type="number" value={editingPromo.value} onChange={e => setEditingPromo({...editingPromo, value: Number(e.target.value)})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-xl shadow-sm" /></div>
                   <div className="space-y-4"><label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">DURATION (MONTHS)</label><input type="number" value={editingPromo.durationMonths} onChange={e => setEditingPromo({...editingPromo, durationMonths: Number(e.target.value)})} className="w-full p-6 bg-gray-50 rounded-[25px] font-black text-xl shadow-sm" /></div>
                </div>
                <div className="space-y-6">
                   <label className="text-[10px] font-black uppercase text-lg-red tracking-[0.4em] ml-1">SELECT PRODUCTS:</label>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto no-scrollbar pr-2 pb-6">
                      {products.map(p => {
                         const isSelected = editingPromo.applicableProductIds.includes(p.id);
                         return (<button key={p.id} onClick={() => toggleProductInPromo(p.id)} className={`flex items-center gap-4 p-5 rounded-[25px] border-2 transition-all text-left ${isSelected ? 'border-lg-red bg-rose-50/30' : 'border-gray-50 bg-white'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-lg-red text-white shadow-lg' : 'bg-gray-50 border border-gray-100'}`}><Check size={18} strokeWidth={4} /></div><p className={`text-[11px] font-black uppercase truncate tracking-tight ${isSelected ? 'text-gray-950' : 'text-gray-400'}`}>{p.name}</p></button>);
                      })}
                   </div>
                </div>
                <button onClick={handleSavePromo} className="w-full bg-[#e60044] text-white py-12 rounded-[40px] font-black uppercase tracking-[0.4em] text-sm shadow-3xl hover:bg-black transition-all">PUBLISH PROMOTION</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
