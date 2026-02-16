
import React, { useState, useRef } from 'react';
import { Product, Agent, CategoryItem, Language, SiteSettings, PromotionTemplate, Lead, FlashSaleConfig, ProductPlan, Multilingual, BenefitItem, ProductVariant, HpOption, PromoType } from '../types.ts';
import { 
  Plus, Trash2, Edit2, X, Ticket, 
  Settings, Users, Package, RefreshCw, 
  Zap, Download, UserCheck, Globe, Check, Search, Save, Languages,
  Image as ImageIcon, ArrowRight, LayoutGrid, Info, Tag, Share2, MousePointer2, Smartphone, Monitor, ChevronDown, Upload, Calendar, Timer, MapPin, Mail, Phone, ExternalLink, HardDriveDownload, HardDriveUpload
} from 'lucide-react';
import { translateTextAI } from '../utils/ai.ts';

interface AdminDashboardProps {
  products: Product[];
  setProducts: (products: Product[]) => void;
  authorizedAgents: Agent[];
  setAuthorizedAgents: (agents: Agent[]) => void;
  categories: CategoryItem[];
  language: Language;
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: SiteSettings) => void;
  onReset: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products = [],
  setProducts,
  authorizedAgents = [],
  setAuthorizedAgents,
  categories = [],
  language,
  siteSettings,
  updateSiteSettings,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'promo' | 'agents' | 'settings'>('inventory');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromotionTemplate | null>(null);
  const [originalProductId, setOriginalProductId] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState<number | null>(null);
  
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const benefitImageRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const variantImageInputRef = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Backup & Restore
  const handleBackup = () => {
    const data = { products, siteSettings, authorizedAgents, version: 1.0, timestamp: Date.now() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HUB_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products) setProducts(data.products);
        if (data.siteSettings) updateSiteSettings(data.siteSettings);
        if (data.authorizedAgents) setAuthorizedAgents(data.authorizedAgents);
        alert("Restore Successful!");
      } catch (err) { alert("Invalid Backup File"); }
    };
    reader.readAsText(file);
  };

  const handleEditProduct = (p: Product) => {
    setEditingProduct({
      ...p,
      modelId: p.modelId || p.id || '',
      features: Array.isArray(p.features) ? p.features : [],
      hpOptions: Array.isArray(p.hpOptions) ? p.hpOptions : [],
      plans: Array.isArray(p.plans) ? p.plans : [],
      variants: Array.isArray(p.variants) ? p.variants : []
    });
    setOriginalProductId(p.id);
  };

  const handleSavePromo = () => {
    if (!editingPromo) return;
    const currentPromos = siteSettings.promoTemplates || [];
    const nextPromos = currentPromos.some(t => t.id === editingPromo.id)
      ? currentPromos.map(t => t.id === editingPromo.id ? editingPromo : t)
      : [...currentPromos, editingPromo];
    
    updateSiteSettings({ ...siteSettings, promoTemplates: nextPromos });
    setEditingPromo(null);
  };

  const autoTranslateFeature = async (index: number) => {
    if (!editingProduct) return;
    const features = editingProduct.features || [];
    const text = features[index]?.cn;
    if (!text) return;
    setIsTranslating(index);
    const result = await translateTextAI(text);
    if (result) {
      const newFeatures = [...features];
      newFeatures[index] = { cn: text, en: result.en || '', ms: result.ms || '' };
      setEditingProduct({ ...editingProduct, features: newFeatures });
    }
    setIsTranslating(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: string, index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'main' && editingProduct) setEditingProduct({ ...editingProduct, image: base64 });
      if (type === 'variant' && editingProduct && index !== undefined) {
        const next = [...(editingProduct.variants || [])];
        next[index] = { ...next[index], image: base64 };
        setEditingProduct({ ...editingProduct, variants: next });
      }
      if (type === 'logo') updateSiteSettings({ ...siteSettings, logoUrl: base64 });
      if (type === 'hero') updateSiteSettings({ ...siteSettings, heroImageUrl: base64 });
      if (type === 'benefit' && index !== undefined) {
        const next = [...siteSettings.benefits];
        next[index] = { ...next[index], image: base64 };
        updateSiteSettings({ ...siteSettings, benefits: next });
      }
    };
    reader.readAsDataURL(file);
  };

  const saveProduct = () => {
    if (!editingProduct) return;
    const finalId = (editingProduct.modelId || editingProduct.id || "").toString().toUpperCase().trim();
    if (!finalId) return alert("Please enter Main Model Code / ID");

    const finalProduct = { ...editingProduct, id: finalId, modelId: finalId };
    let next;
    if (originalProductId) {
      next = products.map(p => p.id === originalProductId ? finalProduct : p);
    } else {
      next = [...products, finalProduct];
    }
    setProducts(next);
    setEditingProduct(null);
    setOriginalProductId(null);
  };

  const toggleFlashSale = () => {
    const nextActive = !siteSettings.flashSale?.isActive;
    updateSiteSettings({
      ...siteSettings, 
      flashSale: {
        ...(siteSettings.flashSale || {
          isActive: false, 
          productId: products[0]?.id || '', 
          launchDate: '', 
          quantity: 600, 
          title: {en:'',cn:'',ms:''}, 
          description: {en:'',cn:'',ms:''}
        }), 
        isActive: nextActive
      }
    });
    // 切换状态时清除 seen 标记，方便管理员预览
    sessionStorage.removeItem('flash_sale_seen');
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-[1600px] mx-auto bg-[#f8f9fa] min-h-screen font-sans text-left">
      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white p-6 md:p-10 rounded-[40px] md:rounded-[50px] shadow-sm border border-gray-100">
        <div className="text-left mb-6 md:mb-0">
           <h1 className="text-3xl font-black text-gray-950 italic tracking-tighter uppercase leading-none">HUB<span className="text-lg-red">TERMINAL.</span></h1>
           <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] mt-2 italic">ADMIN & MARKETING CENTER</p>
        </div>
        <div className="flex flex-wrap justify-center bg-[#f3f4f6] p-1.5 rounded-full shadow-inner gap-1">
          {[
            { id: 'inventory', icon: Package, label: 'INVENTORY' },
            { id: 'agents', icon: Users, label: 'AGENTS' },
            { id: 'promo', icon: Zap, label: 'PROMO' },
            { id: 'settings', icon: Settings, label: 'SETTINGS' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 md:px-10 py-3 md:py-4 rounded-full text-[9px] md:text-[10px] font-black tracking-widest uppercase transition-all ${activeTab === tab.id ? 'bg-lg-red text-white shadow-xl' : 'text-gray-400 hover:text-gray-950'}`}>
              {tab.label}
            </button>
          ))}
          <button onClick={() => window.location.hash = 'agent-tools'} className="flex items-center gap-2 px-6 md:px-10 py-3 md:py-4 rounded-full text-[10px] font-black tracking-widest uppercase text-gray-400 hover:text-lg-red">TOOLS</button>
        </div>
      </div>

      <div className="animate-fade-up">
        {activeTab === 'inventory' && (
          <div className="bg-white p-8 md:p-16 rounded-[50px] md:rounded-[70px] shadow-sm min-h-[600px] flex flex-col items-center">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 w-full mb-16">
                {(products || []).map(p => (
                  <div key={p.id} className="bg-gray-50/50 p-8 rounded-[40px] md:rounded-[60px] border border-gray-100 flex flex-col items-center group relative hover:bg-white hover:shadow-2xl transition-all h-[320px] justify-center">
                    <img src={p.image} className="h-32 md:h-40 object-contain mb-6 transition-transform group-hover:scale-110" />
                    <p className="font-black text-xs md:text-sm uppercase italic text-gray-950 truncate w-full text-center px-4">{p.name}</p>
                    <p className="text-[8px] md:text-[9px] font-black text-gray-300 mt-2 tracking-widest uppercase">{p.modelId || p.id}</p>
                    <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 rounded-[40px] md:rounded-[60px] backdrop-blur-sm flex items-center justify-center gap-4 transition-all">
                      <button onClick={() => handleEditProduct(p)} className="p-4 bg-lg-red text-white rounded-full shadow-lg hover:scale-110 transition-transform"><Edit2 size={18}/></button>
                      <button onClick={() => { if(confirm("Delete product?")) setProducts(products.filter(i => i.id !== p.id)) }} className="p-4 bg-black text-white rounded-full shadow-lg hover:scale-110 transition-transform"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
             </div>
             <button onClick={() => {
                const newId = `LG-NEW-${Date.now()}`;
                setEditingProduct({ id: newId, modelId: newId, name: '', category: categories[0]?.id || 'Water Purifier', subName: {en:'',cn:'',ms:''}, description: '', image: '', promoPrice: 0, normalPrice: 0, promoText: '', warranty: '', features: [{en:'',cn:'',ms:''}], painPoints: [], plans: [{ termYears: 5, maintenanceType: 'Regular Visit', serviceInterval: '4m', price: 0 }], hpOptions: [] });
             }}
               className="bg-lg-red text-white px-12 md:px-16 py-6 md:py-8 rounded-full font-black uppercase text-[10px] md:text-xs tracking-[0.4em] shadow-3xl hover:bg-black transition-all flex items-center gap-4">
               <Plus size={18}/> New Product
             </button>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="bg-white p-8 md:p-12 rounded-[50px] shadow-sm border border-gray-100 min-h-[500px]">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-gray-950">
                   <Users className="text-lg-red" size={24}/> PARTNER LIST
                </h3>
             </div>
             <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-gray-100">
                         <th className="py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest px-4">NAME</th>
                         <th className="py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest px-4">WHATSAPP</th>
                         <th className="py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest px-4">TOKEN</th>
                         <th className="py-6 text-[10px] font-black text-gray-300 uppercase tracking-widest px-4">ACTION</th>
                      </tr>
                   </thead>
                   <tbody>
                      {authorizedAgents.map(a => (
                         <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-6 px-4 font-black text-sm text-gray-950 italic uppercase">{a.name}</td>
                            <td className="py-6 px-4 font-black text-xs text-gray-500">{a.whatsapp}</td>
                            <td className="py-6 px-4 font-mono text-[10px] text-lg-red">{a.token || 'N/A'}</td>
                            <td className="py-6 px-4">
                               <button onClick={() => { if(confirm("Remove partner?")) setAuthorizedAgents(authorizedAgents.filter(ag => ag.id !== a.id)) }} className="p-3 text-gray-300 hover:text-lg-red transition-colors"><Trash2 size={16}/></button>
                            </td>
                         </tr>
                      ))}
                      {authorizedAgents.length === 0 && (
                        <tr>
                           <td colSpan={4} className="py-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs italic">No Partners Found. Partners appear here after generating their link.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeTab === 'promo' && (
          <div className="space-y-12">
            <div className="bg-white p-8 md:p-12 rounded-[50px] shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-gray-950">
                    <Zap className="text-lg-red fill-lg-red" size={24}/> FLASH SALE ENGINE
                  </h3>
                  <button onClick={toggleFlashSale} className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${siteSettings.flashSale?.isActive ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                    {siteSettings.flashSale?.isActive ? 'LIVE ACTIVE' : 'SYSTEM OFFLINE'}
                  </button>
               </div>
               
               {siteSettings.flashSale && (
                 <div className="grid lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">SELECT PRODUCT</label>
                       <select value={siteSettings.flashSale.productId} onChange={e => updateSiteSettings({...siteSettings, flashSale: {...siteSettings.flashSale!, productId: e.target.value}})} className="w-full p-8 bg-gray-50 rounded-[35px] font-black text-xl italic outline-none border-none cursor-pointer appearance-none">
                          {(products || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                       </select>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">LAUNCH DATE</label>
                             <input type="date" value={siteSettings.flashSale.launchDate} onChange={e => updateSiteSettings({...siteSettings, flashSale: {...siteSettings.flashSale!, launchDate: e.target.value}})} className="w-full p-6 bg-gray-50 rounded-[30px] font-black italic outline-none border-none"/>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">QUANTITY</label>
                             <input type="number" value={siteSettings.flashSale.quantity} onChange={e => updateSiteSettings({...siteSettings, flashSale: {...siteSettings.flashSale!, quantity: Number(e.target.value)}})} className="w-full p-6 bg-gray-50 rounded-[30px] font-black italic outline-none border-none"/>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-6 bg-rose-50/50 p-6 rounded-[35px] border border-rose-100">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-lg-red tracking-[0.4em] ml-4 italic">WAS PRICE (RM)</label>
                             <input type="number" value={siteSettings.flashSale.customWasPrice || ''} onChange={e => updateSiteSettings({...siteSettings, flashSale: {...siteSettings.flashSale!, customWasPrice: Number(e.target.value)}})} className="w-full p-6 bg-white rounded-[25px] font-black italic shadow-inner outline-none border-none" placeholder="150"/>
                          </div>
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-lg-red tracking-[0.4em] ml-4 italic">PROMO PRICE (RM)</label>
                             <input type="number" value={siteSettings.flashSale.customPromoPrice || ''} onChange={e => updateSiteSettings({...siteSettings, flashSale: {...siteSettings.flashSale!, customPromoPrice: Number(e.target.value)}})} className="w-full p-6 bg-white rounded-[25px] font-black italic shadow-inner outline-none border-none" placeholder="88"/>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">FLASH TITLE (CN)</label>
                       <input value={siteSettings.flashSale.title?.cn || ''} onChange={e => updateSiteSettings({...siteSettings, flashSale: {...siteSettings.flashSale!, title: {...(siteSettings.flashSale!.title || {en:'',cn:'',ms:''}), cn: e.target.value}}})} className="w-full p-8 bg-gray-50 rounded-[35px] font-black text-xl italic outline-none border-none" placeholder="抢购标题..."/>
                       <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">DESCRIPTION (CN)</label>
                       <textarea value={siteSettings.flashSale.description?.cn || ''} onChange={e => updateSiteSettings({...siteSettings, flashSale: {...siteSettings.flashSale!, description: {...(siteSettings.flashSale!.description || {en:'',cn:'',ms:''}), cn: e.target.value}}})} className="w-full p-8 bg-gray-50 rounded-[35px] font-black text-lg italic outline-none border-none resize-none h-40" placeholder="抢购规则/卖点..."/>
                    </div>
                 </div>
               )}
            </div>

            <div className="bg-white p-12 rounded-[50px] shadow-sm border border-gray-100 min-h-[500px]">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-gray-950 text-left">
                    <Ticket className="text-lg-red fill-lg-red" size={24}/> PROMO TEMPLATES
                  </h3>
                  <button onClick={() => setEditingPromo({ id: `PROMO-${Date.now()}`, type: 'percentage', title: {en:'',cn:'',ms:''}, applicableProductIds: [], value: 0, endDate: '', content: {en:'',cn:'',ms:''}, color: 'rose' })} className="bg-lg-red text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-3">
                    <Plus size={14}/> CREATE NEW TEMPLATE
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(siteSettings.promoTemplates || []).map(promo => (
                    <div key={promo.id} className="bg-white p-8 rounded-[45px] border border-gray-100 flex flex-col justify-between group transition-all shadow-sm hover:shadow-2xl">
                       <div className="flex justify-between items-start mb-6">
                          <div className={`p-4 rounded-2xl bg-${promo.color || 'rose'}-500 text-white shadow-lg`}>
                             <Tag size={20}/>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => setEditingPromo(promo)} className="p-3 bg-white text-gray-400 rounded-full shadow-sm hover:text-lg-red transition-all"><Edit2 size={16}/></button>
                             <button onClick={() => { if(confirm("Remove template?")) updateSiteSettings({...siteSettings, promoTemplates: (siteSettings.promoTemplates || []).filter(t => t.id !== promo.id)}) }} className="p-3 bg-white text-gray-400 rounded-full shadow-sm hover:text-lg-red transition-all"><Trash2 size={16}/></button>
                          </div>
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] mb-2">
                             {promo.type === 'percentage' ? `${promo.value}% OFF ${promo.durationMonths ? `(${promo.durationMonths}M)` : ''}` : `RM ${promo.value} OFF`}
                          </p>
                          <h4 className="text-xl font-black italic uppercase text-gray-950 leading-none mb-4">{promo.title?.cn || 'Untitled Promo'}</h4>
                          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                             <Calendar size={12}/> END: {promo.endDate || 'NO LIMIT'}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-12">
            {/* HUB SETTINGS Header */}
            <div className="flex justify-between items-center bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
               <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-950">HUB <span className="text-lg-red">SETTINGS.</span></h2>
               <div className="flex gap-4">
                  <button onClick={handleBackup} className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-lg hover:bg-lg-red transition-all">
                    <HardDriveDownload size={14}/> BACKUP ALL
                  </button>
                  <label className="bg-gray-100 text-gray-400 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 cursor-pointer hover:bg-white hover:text-lg-red transition-all border border-gray-100 shadow-sm">
                    <HardDriveUpload size={14}/> RESTORE
                    <input type="file" className="hidden" accept=".json" onChange={handleRestore} />
                  </label>
               </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10">
               {/* Column 1: Branding & Categories */}
               <div className="lg:col-span-4 space-y-10">
                  {/* BRANDING */}
                  <div className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100 space-y-8">
                     <h3 className="text-[14px] font-black uppercase text-gray-950 tracking-[0.4em] italic mb-4">1. BRANDING & HERO</h3>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">SITE LOGO</label>
                           <div onClick={() => logoInputRef.current?.click()} className="aspect-square bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-100 flex items-center justify-center p-6 cursor-pointer hover:border-lg-red transition-all">
                              {siteSettings.logoUrl ? <img src={siteSettings.logoUrl} className="max-h-full object-contain" /> : <Plus size={32} className="text-gray-200" />}
                              <input type="file" ref={logoInputRef} className="hidden" onChange={e => handleImageUpload(e, 'logo')} />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">HERO BACKGROUND</label>
                           <div onClick={() => heroInputRef.current?.click()} className="aspect-square bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer hover:border-lg-red transition-all">
                              {siteSettings.heroImageUrl ? <img src={siteSettings.heroImageUrl} className="w-full h-full object-cover" /> : <Plus size={32} className="text-gray-200" />}
                              <input type="file" ref={heroInputRef} className="hidden" onChange={e => handleImageUpload(e, 'hero')} />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* CATEGORIES */}
                  <div className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100">
                     <h3 className="text-[14px] font-black uppercase text-gray-950 tracking-[0.4em] italic mb-8">2. PRODUCT CATEGORIES</h3>
                     <div className="flex flex-wrap gap-3">
                        {siteSettings.categories.map(cat => (
                           <div key={cat.id} className="bg-gray-50 px-5 py-3 rounded-full border border-gray-100 flex items-center gap-3 group">
                              <span className="text-[10px] font-black uppercase italic text-gray-950">{cat.label.cn} ({cat.label.en})</span>
                              <button onClick={() => { if(confirm("Remove category?")) updateSiteSettings({...siteSettings, categories: siteSettings.categories.filter(c => c.id !== cat.id)}) }} className="text-gray-200 hover:text-lg-red"><X size={12}/></button>
                           </div>
                        ))}
                        <button onClick={() => {
                          const name = prompt("New Category Name (e.g. Fridge)");
                          if(!name) return;
                          updateSiteSettings({...siteSettings, categories: [...siteSettings.categories, { id: name, label: {en: name, cn: name, ms: name} }]});
                        }} className="bg-lg-red text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2">
                           <Plus size={14}/> ADD
                        </button>
                     </div>
                  </div>
               </div>

               {/* Column 2: Core Values (Home Page Benefits) */}
               <div className="lg:col-span-8">
                  <div className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100">
                     <h3 className="text-[14px] font-black uppercase text-gray-950 tracking-[0.4em] italic mb-10">3. CORE VALUES (HOME PAGE BENEFITS)</h3>
                     <div className="grid md:grid-cols-3 gap-8">
                        {siteSettings.benefits.map((b, idx) => (
                           <div key={idx} className="space-y-6">
                              <div className="space-y-3">
                                 <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">DISPLAY NUMBER</label>
                                 <input value={b.number} onChange={e => {
                                    const next = [...siteSettings.benefits];
                                    next[idx].number = e.target.value;
                                    updateSiteSettings({...siteSettings, benefits: next});
                                 }} className="w-full p-4 bg-gray-50 rounded-2xl font-black italic shadow-inner outline-none border-none text-xl" />
                              </div>
                              <div onClick={() => benefitImageRefs.current[idx]?.click()} className="aspect-video bg-gray-50 rounded-[30px] border border-gray-100 flex items-center justify-center overflow-hidden cursor-pointer shadow-inner group">
                                 {b.image ? <img src={b.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" /> : <Plus size={24} className="text-gray-200" />}
                                 <input type="file" ref={el => { benefitImageRefs.current[idx] = el; }} className="hidden" onChange={e => handleImageUpload(e, 'benefit', idx)} />
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">BENEFIT TITLE</label>
                                 {['cn', 'en', 'ms'].map(lang => (
                                    <div key={lang} className="relative">
                                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-300 uppercase">{lang}</span>
                                       <input value={(b.title as any)[lang]} onChange={e => {
                                          const next = [...siteSettings.benefits];
                                          (next[idx].title as any)[lang] = e.target.value;
                                          updateSiteSettings({...siteSettings, benefits: next});
                                       }} className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl font-bold text-[10px] uppercase shadow-inner outline-none border-none" />
                                    </div>
                                 ))}
                              </div>
                              <div className="space-y-4">
                                 <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">BENEFIT DESC</label>
                                 {['cn', 'en', 'ms'].map(lang => (
                                    <div key={lang} className="relative">
                                       <span className="absolute left-4 top-4 text-[8px] font-black text-gray-300 uppercase">{lang}</span>
                                       <textarea value={(b.description as any)[lang]} onChange={e => {
                                          const next = [...siteSettings.benefits];
                                          (next[idx].description as any)[lang] = e.target.value;
                                          updateSiteSettings({...siteSettings, benefits: next});
                                       }} className="w-full pl-10 pr-4 py-4 bg-gray-50 rounded-xl font-bold text-[10px] uppercase shadow-inner outline-none border-none h-24 resize-none" />
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
               {/* Column 3: Footer & Contact */}
               <div className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100 h-fit">
                  <h3 className="text-[14px] font-black uppercase text-gray-950 tracking-[0.4em] italic mb-10">4. FOOTER & CONTACT INFO</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">OFFICE EMAIL</label>
                           <input value={siteSettings.officeEmail} onChange={e => updateSiteSettings({...siteSettings, officeEmail: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl font-black text-xs shadow-inner outline-none border-none" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">OFFICE PHONE</label>
                           <input value={siteSettings.officePhone || ''} onChange={e => updateSiteSettings({...siteSettings, officePhone: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl font-black text-xs shadow-inner outline-none border-none" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">STORE LOCATION & MAPS</label>
                           <textarea value={siteSettings.siteAddress || ''} onChange={e => updateSiteSettings({...siteSettings, siteAddress: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl font-black text-xs shadow-inner outline-none border-none h-28 resize-none mb-4" placeholder="Full Address" />
                           <input value={siteSettings.googleMapsUrl || ''} onChange={e => updateSiteSettings({...siteSettings, googleMapsUrl: e.target.value})} className="w-full p-4 bg-white rounded-xl font-bold text-[9px] shadow-sm outline-none border border-gray-100" placeholder="Google Maps URL" />
                        </div>
                     </div>
                     <div className="space-y-6">
                        <label className="text-[9px] font-black text-lg-red uppercase tracking-widest ml-2">HUB DESCRIPTION (FOOTER)</label>
                        {['cn', 'en', 'ms'].map(lang => (
                           <div key={lang} className="space-y-2">
                              <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-2">{lang}</span>
                              <textarea value={(siteSettings.siteDescription as any)[lang]} onChange={e => {
                                 const next = {...siteSettings.siteDescription as any};
                                 next[lang] = e.target.value;
                                 updateSiteSettings({...siteSettings, siteDescription: next});
                              }} className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-[10px] uppercase shadow-inner outline-none border-none h-28 resize-none" />
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Column 4: Join Us Info */}
               <div className="bg-white p-10 rounded-[50px] shadow-sm border border-gray-100 h-fit">
                  <h3 className="text-[14px] font-black uppercase text-gray-950 tracking-[0.4em] italic mb-10">5. 加入资讯 (JOIN US INFO)</h3>
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <label className="text-[9px] font-black text-lg-red uppercase tracking-widest ml-2">JOIN US TAGLINE</label>
                        {['cn', 'en', 'ms'].map(lang => (
                           <div key={lang} className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-gray-300 uppercase">{lang}</span>
                              <input value={(siteSettings.joinUsTagline as any)[lang]} onChange={e => {
                                 const next = {...siteSettings.joinUsTagline as any};
                                 next[lang] = e.target.value;
                                 updateSiteSettings({...siteSettings, joinUsTagline: next});
                              }} className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl font-black italic shadow-inner outline-none border-none text-sm uppercase" />
                           </div>
                        ))}
                     </div>
                     
                     <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                           <div className="space-y-3">
                              <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">RECRUITMENT WA (601...)</label>
                              <input value={siteSettings.recruitmentWa} onChange={e => updateSiteSettings({...siteSettings, recruitmentWa: e.target.value})} className="w-full p-6 bg-gray-50 rounded-[30px] font-black text-2xl shadow-inner outline-none border-none italic" />
                           </div>
                           <div className="space-y-4">
                              <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2 italic">JOIN US PAIN POINTS (TRILINGUAL)</label>
                              {siteSettings.joinUsPainPoints.map((pp, idx) => (
                                 <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 relative shadow-inner">
                                    {['cn', 'en', 'ms'].map(l => (
                                       <div key={l} className="flex items-center gap-2">
                                          <span className="text-[7px] font-black text-gray-300 uppercase w-4">{l}</span>
                                          <input value={(pp as any)[l]} onChange={e => {
                                             const next = [...siteSettings.joinUsPainPoints];
                                             (next[idx] as any)[l] = e.target.value;
                                             updateSiteSettings({...siteSettings, joinUsPainPoints: next});
                                          }} className="bg-transparent border-none outline-none font-bold text-[9px] uppercase w-full" />
                                       </div>
                                    ))}
                                    <button onClick={() => updateSiteSettings({...siteSettings, joinUsPainPoints: siteSettings.joinUsPainPoints.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-gray-200 hover:text-lg-red"><Trash2 size={12}/></button>
                                 </div>
                              ))}
                              <button onClick={() => updateSiteSettings({...siteSettings, joinUsPainPoints: [...siteSettings.joinUsPainPoints, {en:'',cn:'',ms:''}]})} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[8px] font-black text-gray-300 uppercase tracking-widest hover:border-lg-red hover:text-lg-red transition-all">+ ADD PAIN POINT</button>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2 italic">PARTNER REWARDS (TRILINGUAL)</label>
                           {siteSettings.joinUsBenefits.map((b, idx) => (
                              <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2 relative shadow-inner">
                                 {['cn', 'en', 'ms'].map(l => (
                                    <div key={l} className="flex items-center gap-2">
                                       <span className="text-[7px] font-black text-gray-300 uppercase w-4">{l}</span>
                                       <input value={(b as any)[l]} onChange={e => {
                                          const next = [...siteSettings.joinUsBenefits];
                                          (next[idx] as any)[l] = e.target.value;
                                          updateSiteSettings({...siteSettings, joinUsBenefits: next});
                                       }} className="bg-transparent border-none outline-none font-bold text-[9px] uppercase w-full" />
                                    </div>
                                 ))}
                                 <button onClick={() => updateSiteSettings({...siteSettings, joinUsBenefits: siteSettings.joinUsBenefits.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-gray-200 hover:text-lg-red"><Trash2 size={12}/></button>
                              </div>
                           ))}
                           <button onClick={() => updateSiteSettings({...siteSettings, joinUsBenefits: [...siteSettings.joinUsBenefits, {en:'',cn:'',ms:''}]})} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[8px] font-black text-gray-300 uppercase tracking-widest hover:border-lg-red hover:text-lg-red transition-all">+ ADD REWARD</button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Promo Editor Modal */}
        {editingPromo && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-[#f8f9fa] w-full max-w-5xl rounded-[70px] p-10 md:p-14 shadow-3xl animate-scale-up text-left relative my-auto">
               <button onClick={() => setEditingPromo(null)} className="absolute top-10 right-10 w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-300 hover:text-lg-red shadow-premium transition-all"><X size={32}/></button>
               
               <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-10 text-gray-950 flex items-center gap-4">
                  <Ticket className="text-lg-red" size={32}/> PROMO CONFIGURATION.
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">PROMO TITLE (CN)</label>
                        <input value={editingPromo.title?.cn || ''} onChange={e => setEditingPromo({...editingPromo, title: {en: e.target.value, cn: e.target.value, ms: e.target.value}})} className="w-full p-8 bg-white rounded-[35px] font-black text-xl italic outline-none shadow-premium border-none" placeholder="E.G. OHSEM 50%"/>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">PROMO TYPE</label>
                        <div className="flex bg-white p-2 rounded-[35px] shadow-premium">
                           {['percentage', 'fixed_discount', 'fixed_price'].map((type) => (
                             <button key={type} onClick={() => setEditingPromo({...editingPromo, type: type as PromoType})} className={`flex-1 py-4 rounded-[25px] text-[10px] font-black uppercase tracking-widest transition-all ${editingPromo.type === type ? 'bg-lg-red text-white shadow-lg' : 'text-gray-400'}`}>
                               {type.replace('_', ' ').toUpperCase()}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">END DATE</label>
                        <input type="date" value={editingPromo.endDate || ''} onChange={e => setEditingPromo({...editingPromo, endDate: e.target.value})} className="w-full p-8 bg-white rounded-[35px] font-black text-xl italic outline-none shadow-premium border-none"/>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">DISCOUNT VALUE</label>
                           <input type="number" value={editingPromo.value || 0} onChange={e => setEditingPromo({...editingPromo, value: Number(e.target.value)})} className="w-full p-8 bg-white rounded-[35px] font-black text-4xl italic outline-none shadow-premium border-none text-lg-red"/>
                        </div>
                        {editingPromo.type === 'percentage' && (
                          <div className="space-y-4 animate-fade-in">
                             <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">DURATION (MONTHS)</label>
                             <input type="number" value={editingPromo.durationMonths || ''} onChange={e => setEditingPromo({...editingPromo, durationMonths: Number(e.target.value)})} className="w-full p-8 bg-white rounded-[35px] font-black text-4xl italic outline-none shadow-premium border-none text-gray-950" placeholder="E.G. 9"/>
                          </div>
                        )}
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic">THEME COLOR</label>
                        <div className="flex gap-4">
                           {['rose', 'amber', 'emerald', 'blue', 'cyan'].map(c => (
                             <button key={c} onClick={() => setEditingPromo({...editingPromo, color: c as any})} className={`w-14 h-14 rounded-full transition-all border-4 ${editingPromo.color === c ? 'border-lg-red scale-110 shadow-xl' : 'border-white'}`} style={{backgroundColor: c === 'rose' ? '#e11d48' : c === 'amber' ? '#d97706' : c === 'emerald' ? '#059669' : c === 'blue' ? '#2563eb' : '#0891b2'}} />
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8 flex flex-col h-full">
                     <div className="flex-1 space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] ml-4 italic flex justify-between">
                           SELECT PRODUCTS <span>SELECTED: {(editingPromo.applicableProductIds || []).length}</span>
                        </label>
                        <div className="bg-white rounded-[45px] shadow-premium p-6 overflow-y-auto max-h-[500px] no-scrollbar border border-gray-100 flex-grow">
                           <div className="space-y-4">
                              {(products || []).map(p => (
                                <button key={p.id} onClick={() => {
                                  const currentIds = editingPromo.applicableProductIds || [];
                                  const nextIds = currentIds.includes(p.id)
                                    ? currentIds.filter(id => id !== p.id)
                                    : [...currentIds, p.id];
                                  setEditingPromo({...editingPromo, applicableProductIds: nextIds});
                                }} className={`w-full p-6 rounded-[30px] border flex items-center justify-between transition-all ${editingPromo.applicableProductIds?.includes(p.id) ? 'border-lg-red bg-lg-red/5' : 'border-gray-100 hover:border-gray-200'}`}>
                                   <div className="flex items-center gap-4 text-left">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${editingPromo.applicableProductIds?.includes(p.id) ? 'bg-lg-red text-white' : 'bg-gray-50 text-gray-200'}`}>
                                         <Check size={18} strokeWidth={4}/>
                                      </div>
                                      <div>
                                         <p className="text-[12px] font-black uppercase text-gray-950 leading-none">{p.name}</p>
                                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{p.modelId || p.id}</p>
                                      </div>
                                   </div>
                                </button>
                              ))}
                           </div>
                        </div>
                     </div>
                     <button onClick={handleSavePromo} className="w-full bg-lg-red text-white py-10 rounded-[40px] font-black uppercase text-sm tracking-[0.4em] shadow-3xl shadow-lg-red/20 hover:bg-black transition-all active:scale-95 mt-auto">
                        PUBLISH PROMOTION
                     </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* Product Editor Modal */}
        {editingProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-[#f8f9fa] w-full max-w-[1580px] rounded-[90px] p-8 md:p-14 shadow-3xl animate-scale-up text-left relative my-auto">
                <button onClick={() => { setEditingProduct(null); setOriginalProductId(null); }} className="absolute top-10 right-10 w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-300 hover:text-lg-red shadow-premium"><X size={32}/></button>

                <div className="grid lg:grid-cols-12 gap-8 xl:gap-10 mt-10">
                  <div className="lg:col-span-3 space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 ml-4">SKU Name</label>
                        <input value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-8 bg-white rounded-[35px] font-black text-2xl italic outline-none shadow-premium border-none"/>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 ml-4 italic">Main Model Code (ID Sync)</label>
                        <input 
                          value={editingProduct.modelId || editingProduct.id || ''} 
                          onChange={e => {
                            const val = e.target.value.toUpperCase().trim();
                            setEditingProduct(prev => prev ? {...prev, modelId: val, id: val} : null);
                          }} 
                          className="w-full p-8 bg-white rounded-[35px] font-black text-4xl text-lg-red italic outline-none shadow-premium border-none uppercase tracking-tighter" placeholder="DFC335HM"/>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 ml-4">Category</label>
                        <select value={editingProduct.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full p-8 bg-white rounded-[35px] font-black text-lg italic outline-none shadow-premium border-none appearance-none cursor-pointer">
                            {(categories || []).map(c => <option key={c.id} value={c.id}>{c.label.cn}</option>)}
                        </select>
                      </div>

                      <div className="space-y-6 pt-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-lg-red ml-4 italic">HP Surcharge Logic</label>
                        <div className="space-y-4">
                           {(editingProduct.hpOptions || []).map((hp, idx) => (
                             <div key={idx} className="p-6 bg-white rounded-[35px] border border-gray-100 space-y-4 shadow-premium relative">
                                <input value={hp.label.cn || ''} onChange={e => {
                                      const next = [...(editingProduct.hpOptions || [])];
                                      const v = e.target.value;
                                      next[idx].label = { en: v, cn: v, ms: v };
                                      setEditingProduct({...editingProduct, hpOptions: next});
                                   }} className="w-full bg-transparent border-none outline-none font-black italic text-lg text-gray-950" placeholder="E.G. 1.0HP" />
                                <div className="grid grid-cols-2 gap-4">
                                   <input value={hp.value || ''} onChange={e => {
                                        const next = [...(editingProduct.hpOptions || [])];
                                        next[idx].value = e.target.value;
                                        setEditingProduct({...editingProduct, hpOptions: next});
                                     }} className="w-full bg-gray-50 p-3 rounded-2xl text-[12px] font-black italic shadow-inner" placeholder="+RM10" />
                                   <input value={hp.modelId || ''} onChange={e => {
                                        const next = [...(editingProduct.hpOptions || [])];
                                        next[idx].modelId = e.target.value;
                                        setEditingProduct({...editingProduct, hpOptions: next});
                                     }} className="w-full bg-gray-50 p-3 rounded-2xl text-[12px] font-black uppercase shadow-inner text-center" placeholder="-HP1" />
                                </div>
                                <button onClick={() => setEditingProduct({...editingProduct, hpOptions: (editingProduct.hpOptions || []).filter((_, i) => i !== idx)})} className="absolute -right-2 -top-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-200 hover:text-lg-red shadow-lg"><Trash2 size={14}/></button>
                             </div>
                           ))}
                           <button onClick={() => setEditingProduct({...editingProduct, hpOptions: [...(editingProduct.hpOptions || []), { label: {en:'',cn:'',ms:''}, value: '', modelId: '' }]})} className="w-full p-6 border-4 border-dashed border-white rounded-[30px] text-gray-300 font-black uppercase tracking-widest text-[10px] hover:text-lg-red hover:border-lg-red transition-all flex items-center justify-center gap-4 bg-white/40">
                              <Plus size={16}/> Add HP Spec
                           </button>
                        </div>
                      </div>

                      <div className="space-y-6 pt-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 ml-4">Main Image</label>
                        <div onClick={() => mainImageInputRef.current?.click()} className="p-10 bg-white rounded-[60px] border-4 border-dashed border-gray-50 flex flex-col items-center shadow-premium cursor-pointer hover:border-lg-red transition-all group">
                            {editingProduct.image ? <img src={editingProduct.image} className="h-40 object-contain drop-shadow-3xl mb-6 transition-transform group-hover:scale-105" /> : <ImageIcon size={50} className="text-gray-100 mb-6"/>}
                            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Upload Main Image</div>
                            <input type="file" ref={mainImageInputRef} onChange={(e) => handleImageUpload(e, 'main')} className="hidden" accept="image/*" />
                        </div>
                      </div>
                  </div>

                  <div className="lg:col-span-4 space-y-10">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-950 ml-4 italic">Color Variants & SKU Suffix</label>
                        <div className="space-y-4">
                           {(editingProduct.variants || []).map((v, idx) => (
                             <div key={idx} className="p-6 bg-white rounded-[40px] border border-gray-100 flex items-center gap-6 shadow-premium relative">
                                <div onClick={() => variantImageInputRef.current[idx]?.click()} className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center overflow-hidden cursor-pointer relative">
                                   {v.image ? <img src={v.image} className="w-full h-full object-cover" /> : <ImageIcon size={28} className="text-gray-200" />}
                                   <input type="file" ref={el => { variantImageInputRef.current[idx] = el; }} onChange={(e) => handleImageUpload(e, 'variant', idx)} className="hidden" accept="image/*" />
                                </div>
                                <div className="flex-1 space-y-1">
                                   <input value={v.name || ''} onChange={e => {
                                      const next = [...(editingProduct.variants || [])];
                                      next[idx].name = e.target.value;
                                      setEditingProduct({...editingProduct, variants: next});
                                   }} className="w-full bg-transparent border-none outline-none font-black text-xl italic" placeholder="Variant Color" />
                                   <input value={v.modelId || ''} onChange={e => {
                                         const next = [...(editingProduct.variants || [])];
                                         next[idx].modelId = e.target.value;
                                         setEditingProduct({...editingProduct, variants: next});
                                      }} className="w-full bg-transparent border-none outline-none font-bold text-[10px] text-gray-400 uppercase" placeholder="Suffix E.G. -SIL" />
                                </div>
                                <button onClick={() => setEditingProduct({...editingProduct, variants: (editingProduct.variants || []).filter((_, i) => i !== idx)})} className="absolute -right-2 -top-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-200 hover:text-lg-red shadow-lg"><Trash2 size={14}/></button>
                             </div>
                           ))}
                           <button onClick={() => setEditingProduct({...editingProduct, variants: [...(editingProduct.variants || []), { name: '', image: '', modelId: '' }]})} className="w-full p-8 border-4 border-dashed border-white rounded-[40px] text-gray-300 font-black uppercase tracking-widest text-[11px] hover:text-lg-red hover:border-lg-red transition-all flex items-center justify-center gap-4 bg-white/40">
                               <Plus size={20}/> Add Variant
                           </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-950 ml-4 italic">Selling Points</label>
                        <div className="space-y-8">
                            {(editingProduct.features || []).map((f, i) => (
                              <div key={i} className="p-8 bg-white rounded-[50px] shadow-premium relative group border border-gray-50">
                                  <textarea value={f.cn || ''} onChange={e => {
                                     const next = [...(editingProduct.features || [])];
                                     next[i] = { ...next[i], cn: e.target.value };
                                     setEditingProduct({...editingProduct, features: next});
                                  }} className="w-full bg-transparent border-none outline-none font-black text-2xl italic text-gray-950 resize-none min-h-[90px]" placeholder={`Feature Highlight 0${i+1} (CN)...`} />
                                  <button onClick={() => autoTranslateFeature(i)} className={`absolute right-6 top-6 w-12 h-12 bg-[#05090f] text-white rounded-[18px] flex items-center justify-center shadow-xl transform scale-0 group-hover:scale-100 transition-all hover:bg-lg-red ${isTranslating === i ? 'animate-spin' : ''}`}>
                                    <Languages size={20}/>
                                  </button>
                                  <div className="mt-4 pt-4 border-t border-gray-50 space-y-4">
                                     <input value={f.en || ''} onChange={e => {
                                          const next = [...(editingProduct.features || [])];
                                          next[i] = { ...next[i], en: e.target.value };
                                          setEditingProduct({...editingProduct, features: next});
                                        }} className="w-full text-[11px] font-bold text-gray-600 bg-gray-50/50 p-2 rounded-xl outline-none" placeholder="EN Translation..."/>
                                     <input value={f.ms || ''} onChange={e => {
                                          const next = [...(editingProduct.features || [])];
                                          next[i] = { ...next[i], ms: e.target.value };
                                          setEditingProduct({...editingProduct, features: next});
                                        }} className="w-full text-[11px] font-bold text-gray-600 bg-gray-50/50 p-2 rounded-xl outline-none" placeholder="MS Translation..."/>
                                  </div>
                              </div>
                            ))}
                            <button onClick={() => setEditingProduct({...editingProduct, features: [...(editingProduct.features || []), {en:'',cn:'',ms:''}]})} className="w-full text-gray-300 font-black uppercase text-[10px] tracking-widest py-4 hover:text-lg-red">+ Add Selling Point</button>
                        </div>
                      </div>
                  </div>

                  <div className="lg:col-span-5 space-y-10">
                      <div className="bg-white p-10 xl:p-14 rounded-[70px] shadow-premium space-y-10 border border-gray-100 flex flex-col min-h-[900px]">
                        <h4 className="text-[14px] font-black uppercase text-lg-red tracking-[0.6em] mb-4 italic">Subscription Plans</h4>
                        <div className="space-y-10 overflow-y-auto no-scrollbar pr-2 flex-grow max-h-[1050px]">
                           {(editingProduct.plans || []).map((plan, idx) => (
                              <div key={idx} className="p-10 bg-gray-50/40 rounded-[50px] border border-gray-100 space-y-8 relative group/plan hover:bg-white transition-all shadow-sm">
                                 <div className="grid grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                       <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-2">RM / MONTH</label>
                                       <input type="number" value={plan.price || 0} onChange={e => {
                                          const next = [...(editingProduct.plans || [])];
                                          next[idx].price = Number(e.target.value);
                                          setEditingProduct({...editingProduct, plans: next});
                                       }} className="w-full p-8 bg-white rounded-3xl font-black text-6xl italic border-none outline-none shadow-premium text-gray-950 focus:bg-gray-50" placeholder="0" />
                                    </div>
                                    <div className="space-y-4">
                                       <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-2">FREQ</label>
                                       <select value={plan.serviceInterval || 'None'} onChange={e => {
                                          const next = [...(editingProduct.plans || [])];
                                          next[idx].serviceInterval = e.target.value as any;
                                          setEditingProduct({...editingProduct, plans: next});
                                       }} className="w-full p-8 bg-white rounded-3xl font-black text-2xl italic border-none outline-none shadow-premium cursor-pointer text-gray-950 appearance-none">
                                          <option value="None">None</option>
                                          <option value="3m">3 Months</option>
                                          <option value="4m">4 Months</option>
                                          <option value="6m">6 Months</option>
                                          <option value="12m">12 Months</option>
                                       </select>
                                    </div>
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-2">Service Logic</label>
                                    <select value={plan.maintenanceType || 'None'} onChange={e => {
                                       const next = [...(editingProduct.plans || [])];
                                       next[idx].maintenanceType = e.target.value as any;
                                       setEditingProduct({...editingProduct, plans: next});
                                    }} className="w-full p-8 bg-white rounded-3xl font-black text-3xl italic outline-none shadow-premium border-none text-gray-950 appearance-none">
                                       <option value="Regular Visit">Regular Visit</option>
                                       <option value="Combine Maintenance">Combine Maintenance</option>
                                       <option value="Self Service">Self Service</option>
                                       <option value="No Service">No Service</option>
                                       <option value="None">None</option>
                                    </select>
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-2">Term Duration</label>
                                    <select value={plan.termYears || 5} onChange={e => {
                                       const next = [...(editingProduct.plans || [])];
                                       const v = e.target.value;
                                       next[idx].termYears = v === 'Outright' ? 'Outright' : Number(v);
                                       setEditingProduct({...editingProduct, plans: next});
                                    }} className="w-full p-8 bg-white rounded-3xl font-black text-3xl italic outline-none shadow-premium border-none text-gray-950 appearance-none">
                                       <option value="3">3 Years Plan</option>
                                       <option value="5">5 Years Plan</option>
                                       <option value="7">7 Years Plan</option>
                                       <option value="Outright">Outright</option>
                                    </select>
                                 </div>
                                 <button onClick={() => setEditingProduct({...editingProduct, plans: (editingProduct.plans || []).filter((_, i) => i !== idx)})} className="w-full py-4 text-[11px] font-black text-gray-300 hover:text-lg-red uppercase tracking-[0.3em]">Remove Plan</button>
                              </div>
                           ))}
                        </div>
                        <button onClick={() => setEditingProduct({...editingProduct, plans: [...(editingProduct.plans || []), { termYears: 5, maintenanceType: 'Regular Visit', serviceInterval: '4m', price: 0 }]})} className="w-full p-12 border-4 border-dashed border-gray-100 rounded-[50px] text-gray-300 font-black uppercase tracking-widest text-[12px] hover:text-lg-red hover:border-lg-red transition-all flex items-center justify-center gap-4 bg-gray-50/20">
                            <Plus size={24}/> Add Tier
                        </button>
                        <button onClick={saveProduct}
                          className="w-full bg-lg-red text-white py-14 rounded-[55px] font-black uppercase text-2xl tracking-[0.5em] shadow-3xl flex items-center justify-center gap-8 hover:bg-black transition-all active:scale-95 mt-6"
                        >
                          Push Update <ArrowRight size={36}/>
                        </button>
                      </div>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
