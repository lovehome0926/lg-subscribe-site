
import React, { useState, useRef } from 'react';
import { Product, Language, SiteSettings, Multilingual, ProductPlan, StoreLocation, PromotionTemplate, HpOption, ProductVariant } from '../types';
import { processProductAI } from '../utils/ai';

interface AdminDashboardProps {
  products: Product[];
  setProducts: (action: Product[] | ((prev: Product[]) => Product[])) => void;
  categories: string[];
  setCategories: (cats: string[]) => void;
  language: Language;
  brandingLogo: string | null;
  updateBrandingLogo: (logo: string | null) => void;
  brandingHero: string | null;
  updateBrandingHero: (hero: string | null) => void;
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: SiteSettings) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, setProducts, categories, setCategories, language, brandingLogo, updateBrandingLogo, brandingHero, updateBrandingHero, siteSettings, updateSiteSettings
}) => {
  const [activeView, setActiveView] = useState<'products' | 'featured' | 'promos' | 'ai' | 'categories' | 'backup'>('products');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editorTab, setEditorTab] = useState<'basic' | 'content' | 'plans' | 'variants' | 'specs'>('basic');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [expandedPromo, setExpandedPromo] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<'recruitment' | 'stores' | 'contact'>('recruitment');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{type: 'main' | 'variant' | 'store' | 'branding_logo' | 'branding_hero', id?: string | number}>({type: 'main'});

  const triggerUpload = (type: 'main' | 'variant' | 'store' | 'branding_logo' | 'branding_hero', id?: string | number) => {
    setUploadTarget({type, id});
    fileInputRef.current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (uploadTarget.type === 'main' && editingProduct) {
        setEditingProduct({...editingProduct, image: base64});
      } else if (uploadTarget.type === 'variant' && editingProduct) {
        const nextVars = [...(editingProduct.variants || [])];
        const idx = uploadTarget.id as number;
        nextVars[idx] = {...nextVars[idx], image: base64};
        setEditingProduct({...editingProduct, variants: nextVars});
      } else if (uploadTarget.type === 'store') {
        const nextStores = siteSettings.stores.map(s => s.id === uploadTarget.id ? {...s, image: base64} : s);
        updateSiteSettings({...siteSettings, stores: nextStores});
      } else if (uploadTarget.type === 'branding_logo') {
        updateBrandingLogo(base64);
      } else if (uploadTarget.type === 'branding_hero') {
        updateBrandingHero(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleItemAIExtract = async () => {
    if (!aiInput.trim()) return;
    setIsProcessingAI(true);
    try {
      const extracted = await processProductAI(aiInput, true);
      if (extracted && extracted.length > 0) {
        const item = extracted[0];
        setEditingProduct(prev => ({
          ...prev,
          subName: item.subName,
          features: item.features,
          painPoints: item.painPoints
        }));
        setAiInput('');
      }
    } catch (e) { alert("AI extraction failed."); } finally { setIsProcessingAI(false); }
  };

  const handleSaveProduct = () => {
    if (!editingProduct?.id || !editingProduct?.name) return alert("SKU ID and Name are mandatory.");
    const p = editingProduct as Product;
    setProducts(prev => [p, ...prev.filter(x => x.id !== p.id)]);
    setEditingProduct(null);
  };

  const updatePromoTemplate = (id: string, updates: Partial<PromotionTemplate>) => {
    const nextTemplates = siteSettings.promoTemplates.map(t => t.id === id ? { ...t, ...updates } : t);
    updateSiteSettings({ ...siteSettings, promoTemplates: nextTemplates });
  };

  return (
    <div className="container mx-auto px-6 py-24 max-w-7xl fade-in text-gray-900">
      <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />

      <div className="flex flex-wrap gap-4 mb-16 justify-between items-center">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Studio Core.</h1>
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1">Malaysia Partner Digital Hub</p>
        </div>
        <div className="flex flex-wrap gap-2">
           {['products', 'featured', 'promos', 'categories', 'ai', 'backup'].map(v => (
             <button key={v} onClick={() => setActiveView(v as any)} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeView === v ? 'bg-lg-red text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>{v}</button>
           ))}
           <button onClick={() => setShowSettingsModal(true)} className="px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-black text-white ml-2">Settings</button>
        </div>
      </div>

      {activeView === 'products' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
           <button onClick={() => {setEditingProduct({id:'', name:'', plans:[], features:[], variants:[], hpOptions:[], category:categories[0], subName:{en:'',cn:'',ms:''}}); setEditorTab('basic');}} className="h-64 border-4 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center text-gray-200 hover:border-lg-red hover:text-lg-red transition group">
              <span className="text-4xl mb-2 group-hover:scale-125 transition-all">＋</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Add New SKU</span>
           </button>
           {products.map(p => (
             <div key={p.id} className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm group hover:shadow-xl transition-all relative">
                {p.isKlangValleyOnly && <span className="absolute top-4 right-4 bg-blue-600 text-white text-[7px] font-black px-2 py-1 rounded-lg uppercase">KV ONLY</span>}
                <div className="aspect-square bg-gray-50 rounded-3xl mb-6 p-6 flex items-center justify-center overflow-hidden">
                   <img src={p.image} className="max-h-full object-contain group-hover:scale-110 transition duration-500" />
                </div>
                <h4 className="text-[12px] font-black uppercase truncate">{p.name}</h4>
                <p className="text-[9px] text-gray-400 mb-4 tracking-widest">#{p.id}</p>
                <div className="flex gap-2">
                   <button onClick={() => {setEditingProduct(p); setEditorTab('basic');}} className="flex-1 bg-black text-white py-3 rounded-2xl text-[9px] font-black uppercase hover:bg-lg-red transition">Edit</button>
                   <button onClick={() => {if(confirm("Delete this product?")) setProducts(prev => prev.filter(x => x.id !== p.id));}} className="w-12 bg-red-50 text-red-500 py-3 rounded-2xl text-[9px] font-black uppercase">✕</button>
                </div>
             </div>
           ))}
        </div>
      )}

      {activeView === 'categories' && (
        <div className="max-w-xl mx-auto space-y-8 bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100 animate-in slide-in-from-bottom duration-500">
           <h2 className="text-2xl font-black uppercase tracking-tighter">Catalog Hierarchy</h2>
           <div className="space-y-3">
              {categories.map((c, i) => (
                <div key={i} className="flex gap-4">
                   <input value={c} onChange={e => {const n = [...categories]; n[i] = e.target.value; setCategories(n);}} className="flex-1 p-4 bg-gray-50 rounded-2xl font-black uppercase text-[11px]" />
                   <button onClick={() => setCategories(categories.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 transition">✕</button>
                </div>
              ))}
              <button onClick={() => setCategories([...categories, 'New Category'])} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-300 hover:text-lg-red hover:border-lg-red transition">＋ Add Category</button>
           </div>
        </div>
      )}

      {activeView === 'backup' && (
        <div className="max-w-2xl mx-auto bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100 text-center space-y-12 animate-in fade-in duration-500">
           <div className="space-y-4">
              <h2 className="text-4xl font-black uppercase tracking-tighter">System Backup</h2>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Maintain platform data safety</p>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button onClick={() => {
                const data = { products, categories, settings: siteSettings, logo: brandingLogo, hero: brandingHero };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `lg-platform-backup-${new Date().toISOString().split('T')[0]}.json`; a.click();
              }} className="bg-lg-red text-white py-8 rounded-[40px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Export All Data</button>
              
              <label className="bg-black text-white py-8 rounded-[40px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center justify-center">
                 Restore from JSON
                 <input type="file" className="hidden" accept=".json" onChange={e => {
                   const file = e.target.files?.[0]; if (!file) return;
                   const reader = new FileReader();
                   reader.onload = (re) => {
                      try {
                        const d = JSON.parse(re.target?.result as string);
                        if(d.products) setProducts(d.products);
                        if(d.categories) setCategories(d.categories);
                        if(d.settings) updateSiteSettings(d.settings);
                        if(d.logo) updateBrandingLogo(d.logo);
                        if(d.hero) updateBrandingHero(d.hero);
                        alert("Platform data restored!");
                      } catch(err) { alert("Invalid backup format."); }
                   };
                   reader.readAsText(file);
                 }} />
              </label>
           </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-[160] bg-black/98 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl h-full max-h-[95vh] rounded-[60px] shadow-3xl overflow-hidden flex flex-col">
             <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-6">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                   {['basic', 'content', 'plans', 'variants', 'specs'].map(t => (
                     <button key={t} onClick={() => setEditorTab(t as any)} className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${editorTab === t ? 'bg-lg-red text-white shadow-lg' : 'bg-white text-gray-400'}`}>{t}</button>
                   ))}
                </div>
                <div className="flex gap-3">
                   <button onClick={handleSaveProduct} className="bg-black text-white px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-lg-red transition shadow-lg">Confirm & Save</button>
                   <button onClick={() => setEditingProduct(null)} className="bg-gray-100 text-gray-400 px-5 py-3 rounded-full text-[10px] font-black uppercase">Cancel</button>
                </div>
             </div>

             <div className="flex-grow overflow-y-auto p-12 space-y-12 custom-scrollbar">
                {editorTab === 'basic' && (
                  <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto animate-in slide-in-from-bottom duration-300">
                     <div className="space-y-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-300 ml-1">SKU Code</label>
                           <input value={editingProduct.id} onChange={e => setEditingProduct({...editingProduct, id: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl font-black uppercase outline-none focus:bg-white focus:shadow-xl transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-300 ml-1">Product Title</label>
                           <input value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl font-black uppercase outline-none focus:bg-white focus:shadow-xl transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase text-gray-300 ml-1">Category</label>
                           <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl font-black uppercase outline-none">
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-3xl border border-blue-100">
                           <input type="checkbox" id="kv_only" checked={editingProduct.isKlangValleyOnly || false} onChange={e => setEditingProduct({...editingProduct, isKlangValleyOnly: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                           <label htmlFor="kv_only" className="text-[10px] font-black uppercase text-blue-800 tracking-widest cursor-pointer">📍 Klang Valley Only Exclusive</label>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-300 ml-1 text-center block">Master Product Photo</label>
                        <div onClick={() => triggerUpload('main')} className="w-full aspect-square bg-gray-50 rounded-[50px] flex items-center justify-center p-12 border-2 border-dashed border-gray-100 cursor-pointer relative group overflow-hidden">
                           {editingProduct.image ? <img src={editingProduct.image} className="max-h-full object-contain" /> : <span className="text-gray-200 uppercase font-black">Upload Master Photo</span>}
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase transition-opacity">Change Image</div>
                        </div>
                     </div>
                  </div>
                )}

                {editorTab === 'content' && (
                  <div className="space-y-12 max-w-5xl mx-auto animate-in slide-in-from-bottom duration-300">
                     <div className="bg-red-50 p-10 rounded-[50px] border border-red-100 space-y-6">
                        <h4 className="text-[11px] font-black text-lg-red uppercase tracking-widest">AI Copywriting (Fetch via URL)</h4>
                        <div className="flex gap-4">
                           <input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Paste LG official product URL here..." className="flex-1 p-5 bg-white rounded-3xl border border-red-200 text-xs font-medium outline-none" />
                           <button onClick={handleItemAIExtract} disabled={isProcessingAI} className="bg-lg-red text-white px-10 py-5 rounded-full text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all">
                              {isProcessingAI ? 'Analyzing...' : 'Auto-Extract Content'}
                           </button>
                        </div>
                     </div>
                     <div className="grid md:grid-cols-2 gap-16">
                        <div className="space-y-8">
                           <h5 className="text-[11px] font-black uppercase tracking-widest text-green-600 border-b border-green-100 pb-2">Selling Points (3-4 Items)</h5>
                           {(editingProduct.features || []).map((f, i) => (
                             <div key={i} className="space-y-3 p-6 bg-gray-50 rounded-[35px] relative group/item">
                                <button onClick={() => setEditingProduct({...editingProduct, features: editingProduct.features?.filter((_, idx)=>idx!==i)})} className="absolute -top-3 -right-3 w-8 h-8 bg-white shadow-lg rounded-full text-[10px] opacity-0 group-hover/item:opacity-100 transition-opacity">✕</button>
                                <input value={f.en} onChange={e => {const n=[...editingProduct.features!]; n[i]={...n[i], en:e.target.value}; setEditingProduct({...editingProduct, features:n});}} className="w-full p-2 bg-transparent font-bold border-b text-[11px] outline-none" placeholder="English Point" />
                                <input value={f.cn} onChange={e => {const n=[...editingProduct.features!]; n[i]={...n[i], cn:e.target.value}; setEditingProduct({...editingProduct, features:n});}} className="w-full p-2 bg-transparent font-bold border-b text-[11px] outline-none" placeholder="中文卖点" />
                             </div>
                           ))}
                           <button onClick={() => setEditingProduct({...editingProduct, features: [...(editingProduct.features||[]), {en:'',cn:'',ms:''}]})} className="text-[9px] font-black uppercase text-lg-red tracking-widest hover:underline transition">＋ Add New Feature</button>
                        </div>
                        <div className="space-y-8">
                           <h5 className="text-[11px] font-black uppercase tracking-widest text-orange-600 border-b border-orange-100 pb-2">Pain Points Solved (3 Items)</h5>
                           {(editingProduct.painPoints || []).map((p, i) => (
                             <div key={i} className="space-y-3 p-6 bg-gray-50 rounded-[35px] relative group/item">
                                <button onClick={() => setEditingProduct({...editingProduct, painPoints: editingProduct.painPoints?.filter((_, idx)=>idx!==i)})} className="absolute -top-3 -right-3 w-8 h-8 bg-white shadow-lg rounded-full text-[10px] opacity-0 group-hover/item:opacity-100 transition-opacity">✕</button>
                                <input value={p.en} onChange={e => {const n=[...editingProduct.painPoints!]; n[i]={...n[i], en:e.target.value}; setEditingProduct({...editingProduct, painPoints:n});}} className="w-full p-2 bg-transparent font-bold border-b text-[11px] outline-none" placeholder="Pain Point (EN)" />
                                <input value={p.cn} onChange={e => {const n=[...editingProduct.painPoints!]; n[i]={...n[i], cn:e.target.value}; setEditingProduct({...editingProduct, painPoints:n});}} className="w-full p-2 bg-transparent font-bold border-b text-[11px] outline-none" placeholder="中文描述" />
                             </div>
                           ))}
                           <button onClick={() => setEditingProduct({...editingProduct, painPoints: [...(editingProduct.painPoints||[]), {en:'',cn:'',ms:''}]})} className="text-[9px] font-black uppercase text-lg-red tracking-widest hover:underline transition">＋ Add Pain Point</button>
                        </div>
                     </div>
                  </div>
                )}

                {editorTab === 'plans' && (
                  <div className="space-y-8 max-w-5xl mx-auto animate-in slide-in-from-bottom duration-300">
                     <h5 className="text-[11px] font-black uppercase tracking-widest border-b pb-2">Pricing Matrix (Rental & Cash)</h5>
                     <div className="grid gap-6">
                        {(editingProduct.plans || []).map((plan, i) => (
                          <div key={i} className="bg-gray-50 p-8 rounded-[40px] grid grid-cols-2 md:grid-cols-4 gap-8 items-end shadow-sm">
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Plan Term</label>
                                <select value={plan.termYears} onChange={e => {const n=[...editingProduct.plans!]; n[i]={...n[i], termYears: e.target.value === 'Outright' ? 'Outright' : parseInt(e.target.value)}; setEditingProduct({...editingProduct, plans:n});}} className="w-full p-4 bg-white rounded-2xl font-black text-[11px] outline-none">
                                   <option value={7}>7 Years</option><option value={5}>5 Years</option><option value={3}>3 Years</option><option value="Outright">Outright Cash</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Maintenance</label>
                                <select value={plan.maintenanceType} onChange={e => {const n=[...editingProduct.plans!]; n[i]={...n[i], maintenanceType: e.target.value as any}; setEditingProduct({...editingProduct, plans:n});}} className="w-full p-4 bg-white rounded-2xl font-black text-[11px] outline-none">
                                   <option value="Regular Visit">Regular Visit</option><option value="Self Service">Self Service</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest ml-1">Price RM</label>
                                <input type="number" value={plan.price} onChange={e => {const n=[...editingProduct.plans!]; n[i]={...n[i], price: parseFloat(e.target.value)||0}; setEditingProduct({...editingProduct, plans:n});}} className="w-full p-4 bg-white rounded-2xl font-black text-[11px] outline-none" />
                             </div>
                             <button onClick={() => setEditingProduct({...editingProduct, plans: editingProduct.plans?.filter((_,idx)=>idx!==i)})} className="text-red-300 p-4 font-black uppercase text-[10px] hover:text-red-600 transition">Discard</button>
                          </div>
                        ))}
                        <button onClick={() => setEditingProduct({...editingProduct, plans:[...(editingProduct.plans||[]), {termYears:7, maintenanceType:'Regular Visit', price:0}]})} className="w-full py-6 border-4 border-dashed border-gray-100 rounded-[40px] text-[10px] font-black uppercase text-gray-300 hover:text-lg-red hover:border-lg-red transition-all">＋ Define New Price Point</button>
                     </div>
                     <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
                        <label className="text-[10px] font-black uppercase text-gray-300 ml-1">Outright Warranty Label (e.g. 1 YEAR WARRANTY)</label>
                        <input value={editingProduct.outrightWarranty || ''} onChange={e => setEditingProduct({...editingProduct, outrightWarranty: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl font-black uppercase mt-2 outline-none" />
                     </div>
                  </div>
                )}

                {editorTab === 'variants' && (
                  <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto animate-in slide-in-from-bottom duration-300">
                     {(editingProduct.variants || []).map((v, i) => (
                       <div key={i} className="bg-gray-50 p-10 rounded-[50px] flex gap-8 items-center relative group/var border border-gray-100">
                          <button onClick={() => setEditingProduct({...editingProduct, variants: editingProduct.variants?.filter((_,idx)=>idx!==i)})} className="absolute top-5 right-5 w-8 h-8 bg-white shadow-lg rounded-full text-[10px] opacity-0 group-hover/var:opacity-100 transition-opacity">✕</button>
                          <div onClick={() => triggerUpload('variant', i)} className="w-28 h-28 bg-white rounded-3xl overflow-hidden flex items-center justify-center p-4 border border-gray-100 relative cursor-pointer group/vimg">
                             {v.image ? <img src={v.image} className="max-h-full object-contain" /> : <span className="text-[8px] font-black uppercase opacity-20 text-center">Upload Path Photo</span>}
                             <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/vimg:opacity-100 flex items-center justify-center text-[8px] font-black text-white uppercase">Replace Photo</div>
                          </div>
                          <div className="flex-1 space-y-4">
                             <input value={v.name} onChange={e => {const n=[...editingProduct.variants!]; n[i]={...n[i], name:e.target.value}; setEditingProduct({...editingProduct, variants:n});}} className="w-full p-3 bg-white rounded-xl font-black text-[11px] uppercase outline-none" placeholder="Color Name" />
                             <input value={v.colorCode} onChange={e => {const n=[...editingProduct.variants!]; n[i]={...n[i], colorCode:e.target.value}; setEditingProduct({...editingProduct, variants:n});}} className="w-full p-3 bg-white rounded-xl font-black text-[10px] uppercase outline-none" placeholder="#HEX CODE" />
                          </div>
                       </div>
                     ))}
                     <button onClick={() => setEditingProduct({...editingProduct, variants: [...(editingProduct.variants||[]), {name:'New Color', colorCode:'#FFFFFF', image:''}]})} className="h-40 border-4 border-dashed border-gray-100 rounded-[50px] flex flex-col items-center justify-center text-gray-300 uppercase font-black text-[10px] hover:border-lg-red hover:text-lg-red transition-all">
                        <span className="text-2xl mb-1">＋</span>
                        <span>Add Color Variant</span>
                     </button>
                  </div>
                )}

                {editorTab === 'specs' && (
                  <div className="space-y-8 max-w-5xl mx-auto animate-in slide-in-from-bottom duration-300">
                     <h5 className="text-[11px] font-black uppercase tracking-widest border-b pb-2">Technical Specifications (HP/Liter/Kg)</h5>
                     <div className="grid gap-6">
                        {(editingProduct.hpOptions || []).map((hp, i) => (
                          <div key={i} className="bg-gray-50 p-8 rounded-[40px] grid md:grid-cols-4 gap-8 items-end shadow-sm">
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-gray-400 ml-1 uppercase">Capacity</label>
                                <input value={hp.value} onChange={e => {const n=[...editingProduct.hpOptions!]; n[i]={...n[i], value: e.target.value}; setEditingProduct({...editingProduct, hpOptions:n});}} placeholder="e.g. 1.0 HP" className="w-full p-4 bg-white rounded-xl font-black text-[11px] outline-none" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-gray-400 ml-1 uppercase">Specific SKU</label>
                                <input value={hp.modelId} onChange={e => {const n=[...editingProduct.hpOptions!]; n[i]={...n[i], modelId: e.target.value}; setEditingProduct({...editingProduct, hpOptions:n});}} placeholder="Model ID" className="w-full p-4 bg-white rounded-xl font-black text-[11px] outline-none" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[8px] font-black text-gray-400 ml-1 uppercase">Price Offset RM</label>
                                <input type="number" value={hp.rentalOffset} onChange={e => {const n=[...editingProduct.hpOptions!]; n[i]={...n[i], rentalOffset: parseFloat(e.target.value)||0}; setEditingProduct({...editingProduct, hpOptions:n});}} className="w-full p-4 bg-white rounded-xl font-black text-[11px] outline-none" />
                             </div>
                             <button onClick={() => setEditingProduct({...editingProduct, hpOptions: editingProduct.hpOptions?.filter((_,idx)=>idx!==i)})} className="text-red-300 font-black uppercase text-[10px] p-4 hover:text-red-600 transition">Remove</button>
                          </div>
                        ))}
                        <button onClick={() => setEditingProduct({...editingProduct, hpOptions:[...(editingProduct.hpOptions||[]), {value:'1.0 HP', modelId:'', rentalOffset:0}]})} className="w-full py-6 border-4 border-dashed border-gray-100 rounded-[40px] text-[10px] font-black uppercase text-gray-300 hover:text-lg-red hover:border-lg-red transition-all">＋ Define Capacity Variant</button>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {activeView === 'promos' && (
        <div className="space-y-8 animate-in fade-in duration-500">
           <div className="flex justify-between items-center">
              <div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter">Event Architect</h2>
                 <p className="text-[9px] font-black uppercase text-gray-300 tracking-[0.4em] mt-1">Configure Global Offer Templates</p>
              </div>
              <button onClick={() => {
                const newP: PromotionTemplate = { id: Date.now().toString(), name: 'Global Discount', discountType: 'fixed', discountAmount: 10, durationMonths: 'full', isActive: false, applyToAll: true, targetProductIds: [] };
                updateSiteSettings({...siteSettings, promoTemplates: [...siteSettings.promoTemplates, newP]});
                setExpandedPromo(newP.id);
              }} className="bg-amber-500 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">Create Template</button>
           </div>
           <div className="grid gap-6">
              {siteSettings.promoTemplates.map(promo => (
                <div key={promo.id} className={`bg-white rounded-[45px] border border-gray-100 overflow-hidden transition-all duration-500 ${expandedPromo === promo.id ? 'shadow-2xl' : 'shadow-sm hover:shadow-md'}`}>
                   <div onClick={() => setExpandedPromo(expandedPromo === promo.id ? null : promo.id)} className="p-10 flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-8">
                         <div className={`w-4 h-4 rounded-full shadow-inner ${promo.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-200'}`}></div>
                         <div>
                            <h4 className="text-[15px] font-black uppercase tracking-widest">{promo.name}</h4>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                               {promo.discountType === 'direct' ? 'Special One Price' : `${promo.discountType} discount`} • {promo.discountAmount}{promo.discountType === 'percentage' ? '%' : ' RM'} • {promo.durationMonths} Months
                            </p>
                         </div>
                      </div>
                      <span className={`text-gray-200 text-xl transition-transform duration-500 ${expandedPromo === promo.id ? 'rotate-180' : ''}`}>▼</span>
                   </div>
                   {expandedPromo === promo.id && (
                     <div className="p-12 bg-gray-50/50 border-t border-gray-50 space-y-10 animate-in slide-in-from-top duration-300">
                        <div className="grid md:grid-cols-4 gap-8">
                           <div className="space-y-2">
                              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Title</label>
                              <input value={promo.name} onChange={e => updatePromoTemplate(promo.id, {name: e.target.value})} className="w-full p-4 bg-white rounded-2xl font-black text-[11px] outline-none shadow-sm" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Type</label>
                              <select value={promo.discountType} onChange={e => updatePromoTemplate(promo.id, {discountType: e.target.value as any})} className="w-full p-4 bg-white rounded-2xl font-black text-[11px] outline-none shadow-sm">
                                 <option value="fixed">Fixed Deduct</option><option value="percentage">Percentage</option><option value="direct">Direct One Price</option>
                              </select>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Amount</label>
                              <input type="number" value={promo.discountAmount} onChange={e => updatePromoTemplate(promo.id, {discountAmount: parseFloat(e.target.value)||0})} className="w-full p-4 bg-white rounded-2xl font-black text-[11px] outline-none shadow-sm" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[8px] font-black uppercase text-gray-400 ml-1">Duration (Months)</label>
                              <input value={promo.durationMonths} onChange={e => updatePromoTemplate(promo.id, {durationMonths: e.target.value === 'full' ? 'full' : parseInt(e.target.value)||0})} className="w-full p-4 bg-white rounded-2xl font-black text-[11px] outline-none shadow-sm" />
                           </div>
                        </div>
                        <div className="flex flex-wrap gap-8 py-6 border-t border-gray-100">
                           <button onClick={() => updatePromoTemplate(promo.id, {isActive: !promo.isActive})} className={`px-10 py-3 rounded-full text-[10px] font-black uppercase transition-all ${promo.isActive ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>Template {promo.isActive ? 'Active' : 'Disabled'}</button>
                           <button onClick={() => updatePromoTemplate(promo.id, {applyToAll: !promo.applyToAll})} className={`px-10 py-3 rounded-full text-[10px] font-black uppercase transition-all ${promo.applyToAll ? 'bg-amber-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'}`}>{promo.applyToAll ? 'All Models Enrolled' : 'Manual Enrollment'}</button>
                           <button onClick={() => updateSiteSettings({...siteSettings, promoTemplates: siteSettings.promoTemplates.filter(t=>t.id!==promo.id)})} className="text-red-400 text-[10px] font-black uppercase ml-auto hover:text-red-600 transition">Discard Template</button>
                        </div>
                        {!promo.applyToAll && (
                           <div className="pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom">
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-6">Enroll Participating SKUs</h5>
                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                                 {products.map(p => {
                                    const isTarget = promo.targetProductIds.includes(p.id);
                                    return (
                                       <button key={p.id} onClick={() => {
                                          const next = isTarget ? promo.targetProductIds.filter(x=>x!==p.id) : [...promo.targetProductIds, p.id];
                                          updatePromoTemplate(promo.id, {targetProductIds: next});
                                       }} className={`p-4 rounded-3xl border-2 transition-all text-center flex flex-col items-center gap-2 ${isTarget ? 'border-amber-500 bg-amber-50 shadow-md' : 'border-white bg-white hover:border-gray-200'}`}>
                                          <img src={p.image} className="w-8 h-8 object-contain" />
                                          <span className="text-[7px] font-black uppercase tracking-tighter truncate w-full">{p.name}</span>
                                       </button>
                                    );
                                 })}
                              </div>
                           </div>
                        )}
                     </div>
                   )}
                </div>
              ))}
           </div>
        </div>
      )}

      {activeView === 'ai' && (
        <div className="max-w-4xl mx-auto space-y-12 py-10">
           <div className="text-center space-y-4">
              <h2 className="text-6xl font-black uppercase tracking-tighter">Gemini Engine</h2>
              <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.6em]">Bulk extract whole catalogs with Vision + Text reasoning</p>
           </div>
           <div className="bg-white p-12 rounded-[70px] border border-gray-100 shadow-3xl space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 -translate-y-16 translate-x-16 rounded-full blur-3xl"></div>
              <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Paste LG official product URL, specs text, or promotional images description here..." className="w-full h-80 p-10 bg-gray-50 rounded-[50px] font-medium outline-none border-2 border-transparent focus:bg-white focus:border-indigo-100 transition-all resize-none shadow-inner" />
              <button onClick={async () => {
                 if(!aiInput.trim()) return;
                 setIsProcessingAI(true);
                 try {
                   const res = await processProductAI(aiInput);
                   setProducts(prev => [...res, ...prev]);
                   setAiInput('');
                   alert(`Success! Generated ${res.length} digital twins.`);
                 } catch (e) { alert("AI extraction pipeline failed. Ensure API KEY is valid."); } finally { setIsProcessingAI(false); }
              }} disabled={isProcessingAI} className="w-full bg-indigo-600 text-white py-8 rounded-full font-black uppercase text-[14px] tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
                 {isProcessingAI ? (
                    <>
                       <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                       Synchronizing...
                    </>
                 ) : 'Invoke AI Extraction'}
              </button>
           </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-5xl rounded-[60px] shadow-3xl overflow-hidden flex flex-col max-h-[95vh] border border-gray-100">
             <div className="p-12 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <div className="flex gap-4">
                   {['recruitment', 'stores', 'contact'].map(t => (
                     <button key={t} onClick={() => setSettingsTab(t as any)} className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${settingsTab === t ? 'bg-black text-white shadow-xl scale-105' : 'text-gray-400 hover:text-black'}`}>{t}</button>
                   ))}
                </div>
                <button onClick={() => setShowSettingsModal(false)} className="text-3xl font-black text-gray-200 hover:text-black transition-colors">✕</button>
             </div>
             <div className="p-16 overflow-y-auto space-y-16 text-gray-900 custom-scrollbar">
                {settingsTab === 'recruitment' && (
                  <div className="space-y-12">
                     <div className="space-y-6">
                        <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">Recruitment Headlines</h4>
                        {(['en', 'cn', 'ms'] as Language[]).map(l => (
                          <div key={l} className="space-y-2">
                             <label className="text-[8px] font-black uppercase text-gray-300 ml-2">{l.toUpperCase()}</label>
                             <input value={siteSettings.joinUsTagline[l]} onChange={e => updateSiteSettings({...siteSettings, joinUsTagline: {...siteSettings.joinUsTagline, [l]: e.target.value}})} className="w-full p-5 bg-gray-50 rounded-2xl font-black border border-transparent focus:bg-white focus:border-gray-100 transition-all" />
                          </div>
                        ))}
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-gray-50">
                        <div className="space-y-4">
                           <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Global Assets</h4>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Brand Logo</label>
                                 <div onClick={() => triggerUpload('branding_logo')} className="w-full aspect-video bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center p-4 cursor-pointer hover:bg-white hover:border-lg-red transition relative group overflow-hidden">
                                    {brandingLogo ? <img src={brandingLogo} className="max-h-full object-contain" /> : <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Upload Logo</span>}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-black uppercase">Replace Logo</div>
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-1">Main Hero Banner</label>
                                 <div onClick={() => triggerUpload('branding_hero')} className="w-full aspect-video bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center p-4 cursor-pointer hover:bg-white hover:border-lg-red transition relative group overflow-hidden">
                                    {brandingHero ? <img src={brandingHero} className="max-h-full object-cover h-full" /> : <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Upload Hero</span>}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px] font-black uppercase">Replace Hero</div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
                {settingsTab === 'stores' && (
                   <div className="grid md:grid-cols-2 gap-10">
                      {siteSettings.stores.map(store => (
                        <div key={store.id} className="p-10 bg-gray-50 rounded-[50px] border border-gray-100 space-y-6 group/store relative">
                           <button onClick={() => updateSiteSettings({...siteSettings, stores: siteSettings.stores.filter(s=>s.id!==store.id)})} className="absolute top-6 right-8 text-red-200 opacity-0 group-hover/store:opacity-100 transition-opacity">✕</button>
                           <div onClick={() => triggerUpload('store', store.id)} className="w-full h-40 bg-white rounded-[40px] overflow-hidden border border-gray-100 relative cursor-pointer group/simg shadow-inner flex items-center justify-center">
                              {store.image ? <img src={store.image} className="w-full h-full object-cover" /> : <div className="text-[9px] font-black text-gray-200 uppercase tracking-widest">Upload Store Sight</div>}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/simg:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase">Replace Site Photo</div>
                           </div>
                           <input value={store.name} onChange={e => updateSiteSettings({...siteSettings, stores: siteSettings.stores.map(s=>s.id===store.id?{...s, name:e.target.value}:s)})} placeholder="Branch Display Name" className="w-full p-4 bg-white rounded-2xl font-black text-[11px] outline-none shadow-sm" />
                           <textarea value={store.address} onChange={e => updateSiteSettings({...siteSettings, stores: siteSettings.stores.map(s=>s.id===store.id?{...s, address:e.target.value}:s)})} placeholder="Full Street Address" className="w-full p-5 bg-white rounded-2xl text-xs font-medium resize-none h-28 shadow-sm outline-none" />
                        </div>
                      ))}
                      <button onClick={() => updateSiteSettings({...siteSettings, stores: [...siteSettings.stores, {id:Date.now().toString(), name:'LG Brand Store', address:'', googleMapsUrl:'', image:null}]})} className="h-80 border-4 border-dashed border-gray-50 rounded-[50px] text-gray-200 flex flex-col items-center justify-center gap-3 hover:text-lg-red hover:border-lg-red transition-all group">
                         <span className="text-4xl group-hover:scale-125 transition-transform">＋</span>
                         <span className="text-[11px] font-black uppercase tracking-widest">Register New Physical Site</span>
                      </button>
                   </div>
                )}
                {settingsTab === 'contact' && (
                  <div className="space-y-16">
                     <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">Main Office Email</label>
                           <input value={siteSettings.officeEmail} onChange={e => updateSiteSettings({...siteSettings, officeEmail: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl font-black shadow-inner outline-none" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2">Public Contact Phone</label>
                           <input value={siteSettings.contactPhone} onChange={e => updateSiteSettings({...siteSettings, contactPhone: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl font-black shadow-inner outline-none" />
                        </div>
                     </div>
                     <div className="space-y-8 pt-10 border-t border-gray-50">
                        <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">Social Media Graph</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {['fb', 'ig', 'tiktok'].map(s => (
                             <div key={s} className="space-y-2">
                                <label className="text-[8px] font-black text-gray-300 uppercase ml-2">{s === 'fb' ? 'Facebook' : s === 'ig' ? 'Instagram' : 'TikTok'}</label>
                                <input value={siteSettings.socialLinks?.[s as keyof typeof siteSettings.socialLinks]} onChange={e => updateSiteSettings({...siteSettings, socialLinks: {...siteSettings.socialLinks, [s]: e.target.value}})} placeholder="URL or @Username" className="w-full p-5 bg-gray-50 rounded-2xl text-[10px] font-bold outline-none" />
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
