import React, { useState, useRef, useMemo } from 'react';
import { Product, Language, SiteSettings, PromotionTemplate, ProductPlan, Multilingual, ProductVariant, StoreLocation } from '../types';
import { processProductAI } from '../utils/ai';
import { 
  Plus, Sparkles, Trash2, RefreshCcw, Save, Search, 
  Settings, Download, Upload, Edit3, 
  X, PlusCircle, MinusCircle, Camera, Palette, Globe, Link, Info,
  Tag, Check, AlertCircle, Clock
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  setProducts: (next: Product[] | ((prev: Product[]) => Product[])) => Promise<void>;
  categories: string[];
  setCategories: (cats: string[]) => void;
  language: Language;
  brandingLogo: string | null;
  updateBrandingLogo: (logo: string | null) => void;
  brandingHero: string | null;
  updateBrandingHero: (hero: string | null) => void;
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: SiteSettings) => void;
  onReset: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, setProducts, categories, setCategories, 
  brandingLogo, updateBrandingLogo, brandingHero, updateBrandingHero,
  siteSettings, updateSiteSettings, onReset 
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'ai-import' | 'promos' | 'site' | 'branding' | 'backup'>('inventory');
  const [aiInput, setAiInput] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromotionTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [individualSyncUrl, setIndividualSyncUrl] = useState('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const productImgInputRef = useRef<HTMLInputElement>(null);
  const variantImgInputRef = useRef<HTMLInputElement>(null);
  const activeVariantIdx = useRef<number>(-1);
  const storeImgInputRef = useRef<HTMLInputElement>(null);
  const activeStoreIdx = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === 'All' || p.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, filterCategory]);

  const handleImageUpload = (file: File, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') callback(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerVariantUpload = (idx: number) => {
    activeVariantIdx.current = idx;
    variantImgInputRef.current?.click();
  };

  const healProduct = (p: any): Product => {
    return {
      ...p,
      subName: p.subName || { en: '', cn: '', ms: '' },
      features: Array.isArray(p.features) ? p.features.map((f: any) => typeof f === 'object' ? f : { en: f, cn: f, ms: f }) : [],
      painPoints: Array.isArray(p.painPoints) ? p.painPoints.map((pp: any) => typeof pp === 'object' ? pp : { en: pp, cn: pp, ms: pp }) : [],
      plans: Array.isArray(p.plans) ? p.plans : []
    } as Product;
  };

  const handleAISync = async (mode: 'text' | 'url') => {
    const input = mode === 'text' ? aiInput : productUrl;
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result = await processProductAI(input, true);
      const newProductRaw = JSON.parse(result);
      if (newProductRaw && newProductRaw.id) {
        const newProduct = healProduct(newProductRaw);
        setProducts(prev => {
          const exists = prev.find(p => p.id === newProduct.id);
          if (exists) return prev.map(p => p.id === newProduct.id ? newProduct : p);
          return [newProduct, ...prev];
        });
        if (mode === 'text') setAiInput(''); else setProductUrl('');
        alert("Product synced successfully!");
      }
    } catch (e) {
      alert("AI Sync Error. Please check your API key and content.");
    } finally { setIsProcessing(false); }
  };

  const handleIndividualSync = async () => {
    if (!individualSyncUrl.trim() || !editingProduct) return;
    setIsProcessing(true);
    try {
      const result = await processProductAI(individualSyncUrl, true);
      const parsed = healProduct(JSON.parse(result));
      setEditingProduct({
        ...editingProduct,
        features: parsed.features || editingProduct.features,
        painPoints: parsed.painPoints || editingProduct.painPoints,
        subName: parsed.subName || editingProduct.subName,
        description: parsed.description || editingProduct.description,
        plans: parsed.plans || editingProduct.plans,
        officialUrl: individualSyncUrl
      });
      setIndividualSyncUrl('');
      alert("Data synchronized to form!");
    } catch (e) {
      alert("Extraction failed.");
    } finally { setIsProcessing(false); }
  };

  const saveProductEdits = async () => {
    if (!editingProduct) return;
    const healedProduct = healProduct(editingProduct);
    await setProducts(prev => {
      const exists = prev.find(p => p.id === healedProduct.id);
      if (exists) return prev.map(p => p.id === healedProduct.id ? healedProduct : p);
      return [healedProduct, ...prev];
    });
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm("Delete this product permanently?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const savePromo = () => {
    if (!editingPromo) return;
    let next = [...siteSettings.promoTemplates];
    const exists = next.findIndex(t => t.id === editingPromo.id);
    if (exists >= 0) {
      next[exists] = editingPromo;
    } else {
      next.push(editingPromo);
    }
    updateSiteSettings({ ...siteSettings, promoTemplates: next });
    setEditingPromo(null);
  };

  const deletePromo = (id: string) => {
    if (confirm("Remove this promotion template?")) {
      const next = siteSettings.promoTemplates.filter(t => t.id !== id);
      updateSiteSettings({ ...siteSettings, promoTemplates: next });
    }
  };

  const MultiInput = ({ label, value, onChange }: { label: string, value: Multilingual, onChange: (v: Multilingual) => void }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <span className="text-[9px] font-black text-gray-300">EN</span>
          <input className="flex-1 bg-transparent text-xs font-bold outline-none" value={value?.en || ''} onChange={e => onChange({ ...value, en: e.target.value })} />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <span className="text-[9px] font-black text-gray-300">CN</span>
          <input className="flex-1 bg-transparent text-xs font-bold outline-none" value={value?.cn || ''} onChange={e => onChange({ ...value, cn: e.target.value })} />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <span className="text-[9px] font-black text-gray-300">MS</span>
          <input className="flex-1 bg-transparent text-xs font-bold outline-none" value={value?.ms || ''} onChange={e => onChange({ ...value, ms: e.target.value })} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-40">
      <div className="bg-[#05090f] text-white pt-24 pb-12 px-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-lg-red/10 blur-[150px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
          <div>
            <h1 className="text-6xl font-black uppercase tracking-tighter">System Console</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['inventory', 'ai-import', 'promos', 'site', 'branding', 'backup'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-lg-red text-white shadow-lg' : 'bg-white/5 text-white/40 hover:text-white'}`}>
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {activeTab === 'inventory' && (
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-gray-50 p-8 rounded-[40px] border border-gray-100 shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-gray-100 text-sm font-bold text-gray-900 outline-none" placeholder="Search by name or model ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="flex items-center gap-4">
                <select className="bg-white border px-6 py-5 rounded-full text-xs font-black uppercase text-gray-900 outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => setEditingProduct(healProduct({ id: 'MODEL-' + Date.now(), category: categories[0] || 'Uncategorized', name: 'New Product', subName: { en: '', cn: '', ms: '' }, description: '', image: '', promoPrice: 0, normalPrice: 0, promoText: '', warranty: '1Y', features: [], painPoints: [], plans: [], variants: [], hpOptions: [] }))} className="bg-black text-white px-8 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-lg-red transition flex items-center justify-center gap-3">
                  <Plus size={16}/> Create Entry
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-10">
                    <img src={p.image || "https://placehold.co/400x400?text=No+Image"} className="w-24 h-24 object-contain p-2 bg-gray-50 rounded-2xl" alt={p.name} />
                    <div className="flex gap-2">
                      <button onClick={() => setEditingProduct(healProduct(p))} className="p-4 bg-gray-50 text-gray-400 hover:bg-black hover:text-white rounded-full transition shadow-sm"><Edit3 size={18}/></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-4 bg-red-50 text-red-300 hover:bg-red-500 hover:text-white rounded-full transition shadow-sm"><Trash2 size={18}/></button>
                    </div>
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-xl text-gray-950 mb-1 leading-none">{p.name}</h3>
                  <p className="text-[10px] font-black text-lg-red uppercase tracking-widest mt-2">{p.category}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="space-y-12">
            <div className="flex justify-between items-center">
               <div className="space-y-1">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-950">Active Campaigns</h2>
                  <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em]">Apply bulk discounts and event pricing</p>
               </div>
               <button onClick={() => setEditingPromo({ id: 'P-' + Date.now(), name: 'Special Promotion', discountType: 'percentage', discountAmount: 10, durationMonths: 'full', isActive: true, applyToAll: false, targetProductIds: [] })} className="bg-lg-red text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3">
                  <Plus size={16}/> New Campaign
               </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {siteSettings.promoTemplates.map(promo => (
                 <div key={promo.id} className={`p-10 rounded-[50px] border shadow-sm group transition-all relative overflow-hidden ${promo.isActive ? 'bg-white border-gray-100' : 'bg-gray-50/50 border-gray-100 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-8">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${promo.isActive ? 'bg-amber-400' : 'bg-gray-300'}`}>
                          <Tag size={24} />
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => setEditingPromo(promo)} className="p-3 bg-gray-50 text-gray-400 hover:bg-black hover:text-white rounded-full transition"><Edit3 size={16}/></button>
                          <button onClick={() => deletePromo(promo.id)} className="p-3 bg-red-50 text-red-300 hover:bg-red-500 hover:text-white rounded-full transition"><Trash2 size={16}/></button>
                       </div>
                    </div>
                    <div className="space-y-2 mb-8">
                       <h3 className="text-xl font-black uppercase tracking-tight text-gray-950">{promo.name}</h3>
                       <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-lg-red">
                             {promo.discountType === 'percentage' ? `${promo.discountAmount}% OFF` : promo.discountType === 'fixed' ? `RM ${promo.discountAmount} OFF` : `NOW RM ${promo.discountAmount}`}
                          </span>
                          <span className="text-[9px] font-bold text-gray-300">|</span>
                          <span className="text-[9px] font-bold text-gray-300 uppercase">{promo.applyToAll ? 'All Products' : `${promo.targetProductIds.length} Products`}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${promo.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                       <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{promo.isActive ? 'Active' : 'Paused'}</span>
                    </div>
                 </div>
               ))}
               {siteSettings.promoTemplates.length === 0 && (
                 <div className="col-span-full py-40 text-center space-y-6">
                    <Info className="mx-auto text-gray-200" size={64} />
                    <p className="text-[11px] font-black text-gray-300 uppercase tracking-[0.5em]">No promotional campaigns found</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'ai-import' && (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-[#05090f] p-12 lg:p-24 rounded-[70px] text-white shadow-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-80 h-80 bg-lg-red/20 blur-[130px]"></div>
               <div className="relative z-10 space-y-12">
                  <div className="text-center">
                    <Sparkles className="mx-auto text-lg-red mb-6" size={48} />
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">AI Import Engine</h2>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] ml-2">LG Official URL</label>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Link className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18}/>
                        <input value={productUrl} onChange={e => setProductUrl(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-full pl-16 pr-8 py-5 text-sm font-medium outline-none focus:border-lg-red transition text-white" placeholder="https://www.lg.com/my/..." />
                      </div>
                      <button disabled={isProcessing} onClick={() => handleAISync('url')} className="bg-lg-red text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition disabled:opacity-50">SYNC URL</button>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] ml-2">Bulk Text Analysis</label>
                    <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[40px] p-10 text-sm font-medium h-64 outline-none focus:border-lg-red transition text-white" placeholder="Paste product descriptions, specs, or tables here..." />
                    <button disabled={isProcessing} onClick={() => handleAISync('text')} className="w-full bg-white text-black py-8 rounded-full font-black uppercase text-[12px] tracking-[0.5em] hover:bg-lg-red hover:text-white transition disabled:opacity-50">{isProcessing ? 'PROCESSING...' : 'ANALYZE & IMPORT'}</button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="max-w-3xl mx-auto bg-white p-12 md:p-20 rounded-[70px] border border-gray-100 shadow-3xl space-y-12">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-gray-100 text-lg-red"><Download size={32} /></div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-950">Data Recovery</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] max-w-sm mx-auto">Export your entire catalog and site settings for safety or relocation.</p>
            </div>
            <div className="grid gap-6">
              <button onClick={() => { const data = { products, siteSettings, version: Date.now() }; const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `lg-backup-${new Date().toISOString().split('T')[0]}.json`; a.click(); }} className="w-full py-8 bg-black text-white rounded-full font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-lg-red transition-all shadow-xl">
                <Download size={20}/> Download Snapshot
              </button>
              <div className="relative">
                <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = async (ev) => {
                      try {
                        const parsed = JSON.parse(ev.target?.result as string);
                        if (parsed && parsed.products && Array.isArray(parsed.products)) {
                          // Automatic Healing during Restore
                          const healedProducts = parsed.products.map(healProduct);
                          if (confirm("Restore database? This will heal older data formats automatically.")) {
                            await setProducts(healedProducts);
                            if (parsed.siteSettings) updateSiteSettings(parsed.siteSettings);
                            alert("Restore successful with auto-healing! Reloading application..."); 
                            location.reload();
                          }
                        } else { 
                          alert("Invalid backup format: Missing product inventory array."); 
                        }
                      } catch (err) { 
                        alert("Critical Error: Backup file is corrupted or not a valid JSON."); 
                      }
                    };
                    reader.readAsText(file);
                  }
                }} />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 bg-gray-50 border-4 border-dashed border-gray-200 text-gray-900 rounded-full font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:border-lg-red/30 transition-all"><Upload size={20}/> Upload Snapshot</button>
              </div>
              <button onClick={onReset} className="w-full py-8 border-4 border-lg-red text-lg-red rounded-full font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-lg-red hover:text-white transition-all"><RefreshCcw size={20}/> Hard Factory Reset</button>
            </div>
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-7xl my-auto rounded-[60px] p-8 md:p-16 lg:p-24 relative shadow-3xl overflow-y-auto max-h-[95vh] no-scrollbar">
             <button onClick={() => setEditingProduct(null)} className="absolute top-10 right-10 p-5 bg-gray-50 rounded-full text-gray-400 hover:text-black transition shadow-sm"><X size={24}/></button>
             <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
               <div className="relative group shrink-0">
                 <div className="w-48 h-48 bg-gray-50 rounded-[45px] border border-gray-100 flex items-center justify-center overflow-hidden"><img src={editingProduct.image || "https://placehold.co/400x400?text=Upload"} className="w-full h-full object-contain p-8" alt="Preview" /></div>
                 <button onClick={() => productImgInputRef.current?.click()} className="absolute -bottom-4 -right-4 w-14 h-14 bg-lg-red text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl hover:scale-110 transition-transform"><Camera size={20}/></button>
                 <input type="file" ref={productImgInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], url => setEditingProduct({...editingProduct, image: url}))} />
               </div>
               <div className="flex-1 space-y-6">
                  <h2 className="text-5xl font-black uppercase tracking-tighter text-gray-950">Master Editor</h2>
                  <div className="flex flex-col lg:flex-row gap-4">
                     <div className="relative flex-1">
                        <Link className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16}/><input value={individualSyncUrl} onChange={e => setIndividualSyncUrl(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-full pl-14 pr-4 py-4 text-[10px] font-black uppercase outline-none focus:border-lg-red transition" placeholder="Paste LG URL to update specs via AI..." />
                     </div>
                     <button disabled={isProcessing} onClick={handleIndividualSync} className="bg-lg-red text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                       {isProcessing ? <RefreshCcw size={14} className="animate-spin"/> : <Sparkles size={14}/>} {isProcessing ? 'EXTRACTING...' : 'SYNC WITH AI'}
                     </button>
                  </div>
               </div>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                <div className="space-y-16">
                   <div className="space-y-8">
                      <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em] pb-4 border-b">1. Basic Info</h4>
                      <div className="space-y-6">
                        <div className="space-y-2"><label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4">Product Name</label><input className="w-full p-6 bg-gray-50 rounded-[30px] text-2xl font-black text-gray-950 outline-none border border-transparent focus:border-lg-red transition-all" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2"><label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4">Category</label><select className="w-full p-6 bg-gray-50 rounded-[30px] font-black uppercase text-[10px] outline-none" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                          <div className="space-y-2"><label className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-4">Rental Warranty</label><input className="w-full p-6 bg-gray-50 rounded-[30px] font-black text-[10px] outline-none" value={editingProduct.warranty} onChange={e => setEditingProduct({...editingProduct, warranty: e.target.value})} /></div>
                        </div>
                        <MultiInput label="Marketing Subtitle" value={editingProduct.subName} onChange={v => setEditingProduct({...editingProduct, subName: v})} />
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="flex justify-between items-end border-b pb-4"><h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">2. Features / Specs</h4><button onClick={() => setEditingProduct({...editingProduct, features: [...editingProduct.features, { en: '', cn: '', ms: '' }]})} className="text-[9px] font-black uppercase text-lg-red flex items-center gap-2 hover:opacity-70"><Plus size={14}/> ADD FEATURE</button></div>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">{editingProduct.features.map((f, i) => (<div key={i} className="flex gap-4 items-start bg-gray-50/50 p-6 rounded-3xl relative"><div className="flex-1"><MultiInput label={`Feature ${i+1}`} value={f} onChange={v => { const next = [...editingProduct.features]; next[i] = v; setEditingProduct({...editingProduct, features: next}); }} /></div><button onClick={() => setEditingProduct({...editingProduct, features: editingProduct.features.filter((_, idx) => idx !== i)})} className="absolute top-4 right-4 text-gray-200 hover:text-red-500 transition-colors"><MinusCircle size={20}/></button></div>))}</div>
                   </div>
                </div>
                <div className="space-y-16">
                   <div className="space-y-8">
                      <div className="flex justify-between items-end border-b pb-4"><h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">3. Commercial Plans</h4><button onClick={() => setEditingProduct({...editingProduct, plans: [...editingProduct.plans, { termYears: 7, maintenanceType: 'Regular Visit', serviceInterval: '4m', price: 0 }]})} className="text-[10px] font-black uppercase text-lg-red flex items-center gap-2 hover:opacity-70"><PlusCircle size={16}/> ADD PLAN</button></div>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 no-scrollbar">{editingProduct.plans.map((plan, idx) => (<div key={idx} className="bg-gray-50 p-8 rounded-[40px] grid grid-cols-2 md:grid-cols-4 gap-6 relative shadow-inner"><div className="space-y-1"><label className="text-[8px] font-black text-gray-300 uppercase">Term</label><select className="w-full bg-transparent font-black text-xs outline-none" value={plan.termYears} onChange={e => { const next = [...editingProduct.plans]; next[idx].termYears = e.target.value === 'Outright' ? 'Outright' : Number(e.target.value); setEditingProduct({...editingProduct, plans: next}); }}>{[7, 5, 3, 'Outright'].map(t => <option key={t} value={t}>{t}Y</option>)}</select></div><div className="space-y-1"><label className="text-[8px] font-black text-gray-300 uppercase">Service</label><select className="w-full bg-transparent font-black text-[10px] outline-none" value={plan.maintenanceType} onChange={e => { const next = [...editingProduct.plans]; next[idx].maintenanceType = e.target.value as any; setEditingProduct({...editingProduct, plans: next}); }}>{['Regular Visit', 'Self Service', 'Combined', 'Combine Maintenance', 'None'].map(t => <option key={t} value={t}>{t}</option>)}</select></div><div className="space-y-1"><label className="text-[8px] font-black text-gray-300 uppercase">Interval</label><select className="w-full bg-transparent font-black text-xs outline-none" value={plan.serviceInterval} onChange={e => { const next = [...editingProduct.plans]; next[idx].serviceInterval = e.target.value; setEditingProduct({...editingProduct, plans: next}); }}>{['4m', '6m', '8m', '12m', '24m', 'None'].map(t => <option key={t} value={t}>{t}</option>)}</select></div><div className="space-y-1"><label className="text-[8px] font-black text-gray-300 uppercase">RM Price</label><input type="number" className="w-full bg-transparent font-black text-xs outline-none" value={plan.price} onChange={e => { const next = [...editingProduct.plans]; next[idx].price = Number(e.target.value); setEditingProduct({...editingProduct, plans: next}); }} /></div><button onClick={() => setEditingProduct({...editingProduct, plans: editingProduct.plans.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-gray-200 hover:text-red-500 transition-colors"><MinusCircle size={18}/></button></div>))}</div>
                   </div>
                   <div className="space-y-8">
                      <div className="flex justify-between items-end border-b pb-4"><h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">4. Color Variations</h4><button onClick={() => setEditingProduct({...editingProduct, variants: [...(editingProduct.variants || []), { name: 'Titan', image: editingProduct.image, colorCode: '#ffffff' }]})} className="text-[10px] font-black uppercase text-lg-red flex items-center gap-2 hover:opacity-70"><Palette size={16}/> ADD COLOR</button></div>
                      <div className="space-y-4">
                        <input type="file" ref={variantImgInputRef} className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file && activeVariantIdx.current >= 0) { handleImageUpload(file, url => { const next = [...(editingProduct.variants || [])]; next[activeVariantIdx.current].image = url; setEditingProduct({...editingProduct, variants: next}); }); } e.target.value = ''; }} />
                        {(editingProduct.variants || []).map((v, idx) => (<div key={idx} className="bg-gray-50 p-6 rounded-[35px] grid grid-cols-12 gap-6 items-center relative shadow-inner"><div className="col-span-4 flex flex-col items-center gap-2"><div className="w-16 h-16 bg-white rounded-2xl p-2 border border-gray-100 flex items-center justify-center relative group/v"><img src={v.image} className="max-h-full max-w-full object-contain" alt="Variant" /><button onClick={() => triggerVariantUpload(idx)} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover/v:opacity-100 transition rounded-2xl"><Camera size={14}/></button></div></div><div className="col-span-8 space-y-3"><input className="w-full bg-white px-4 py-2 rounded-xl text-[10px] font-black outline-none border border-transparent focus:border-lg-red transition" placeholder="Color Label" value={v.name} onChange={e => { const next = [...(editingProduct.variants || [])]; next[idx].name = e.target.value; setEditingProduct({...editingProduct, variants: next}); }} /><div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-transparent focus-within:border-lg-red transition"><input type="color" className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer" value={v.colorCode} onChange={e => { const next = [...(editingProduct.variants || [])]; next[idx].colorCode = e.target.value; setEditingProduct({...editingProduct, variants: next}); }} /><input className="flex-1 text-[9px] font-mono outline-none" value={v.colorCode} onChange={e => { const next = [...(editingProduct.variants || [])]; next[idx].colorCode = e.target.value; setEditingProduct({...editingProduct, variants: next}); }} /></div></div><button onClick={() => setEditingProduct({...editingProduct, variants: editingProduct.variants?.filter((_, i) => i !== idx)})} className="absolute -top-3 -right-3 text-gray-200 hover:text-red-500 transition-colors"><MinusCircle size={20}/></button></div>))}
                      </div>
                   </div>
                </div>
             </div>
             <div className="pt-20 border-t mt-20 flex flex-col md:flex-row gap-6 sticky bottom-0 bg-white z-20 py-8"><button onClick={saveProductEdits} className="flex-1 bg-black text-white py-8 rounded-full font-black uppercase text-[12px] tracking-[0.4em] shadow-2xl hover:bg-lg-red transition-all duration-500">SAVE ASSET CHANGES</button><button onClick={() => setEditingProduct(null)} className="px-16 py-8 rounded-full font-black uppercase text-[10px] text-gray-400 border border-gray-100 transition-all hover:bg-gray-50">DISCARD CHANGES</button></div>
          </div>
        </div>
      )}

      {editingPromo && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-4xl my-auto rounded-[60px] p-8 md:p-16 lg:p-20 relative shadow-3xl overflow-y-auto max-h-[95vh] no-scrollbar">
              <button onClick={() => setEditingPromo(null)} className="absolute top-10 right-10 p-5 bg-gray-50 rounded-full text-gray-400 hover:text-black transition shadow-sm"><X size={24}/></button>
              
              <div className="flex items-center gap-8 mb-16 border-b pb-8">
                 <div className="w-20 h-20 bg-amber-400 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-amber-400/20">
                    <Tag size={36} />
                 </div>
                 <div className="space-y-1">
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-950">Campaign Builder</h2>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Configure promotional triggers and discounts</p>
                 </div>
              </div>

              <div className="space-y-12">
                 {/* Basic Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Campaign Name</label>
                       <input className="w-full p-6 bg-gray-50 rounded-[30px] font-black text-gray-950 outline-none border border-transparent focus:border-lg-red transition" value={editingPromo.name} onChange={e => setEditingPromo({...editingPromo, name: e.target.value})} />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Status</label>
                       <div className="flex p-1 bg-gray-50 rounded-[30px] border">
                          <button onClick={() => setEditingPromo({...editingPromo, isActive: true})} className={`flex-1 py-4 rounded-[25px] text-[10px] font-black uppercase tracking-widest transition ${editingPromo.isActive ? 'bg-white text-green-500 shadow-sm' : 'text-gray-400'}`}>Active</button>
                          <button onClick={() => setEditingPromo({...editingPromo, isActive: false})} className={`flex-1 py-4 rounded-[25px] text-[10px] font-black uppercase tracking-widest transition ${!editingPromo.isActive ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>Paused</button>
                       </div>
                    </div>
                 </div>

                 {/* Discount Settings */}
                 <div className="bg-gray-50 p-10 rounded-[45px] space-y-8 shadow-inner border border-gray-100">
                    <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em] border-b pb-4">Discount Mechanics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Discount Type</label>
                          <select className="w-full p-6 bg-white rounded-[30px] font-black uppercase text-[10px] outline-none" value={editingPromo.discountType} onChange={e => setEditingPromo({...editingPromo, discountType: e.target.value as any})}>
                             <option value="percentage">Percentage OFF (%)</option>
                             <option value="fixed">Fixed Amount OFF (RM)</option>
                             <option value="direct">Direct Set Price (RM)</option>
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Amount</label>
                          <input type="number" className="w-full p-6 bg-white rounded-[30px] font-black text-2xl text-gray-950 outline-none" value={editingPromo.discountAmount} onChange={e => setEditingPromo({...editingPromo, discountAmount: Number(e.target.value)})} />
                       </div>
                    </div>
                 </div>

                 {/* Targeting */}
                 <div className="space-y-8">
                    <div className="flex justify-between items-center border-b pb-4">
                       <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">Target Selection</h4>
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase text-gray-400">Apply to All Products</span>
                          <button onClick={() => setEditingPromo({...editingPromo, applyToAll: !editingPromo.applyToAll})} className={`w-12 h-6 rounded-full relative transition-colors ${editingPromo.applyToAll ? 'bg-lg-red' : 'bg-gray-200'}`}>
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${editingPromo.applyToAll ? 'translate-x-7' : 'translate-x-1'}`}></div>
                          </button>
                       </div>
                    </div>

                    {!editingPromo.applyToAll && (
                       <div className="max-h-64 overflow-y-auto pr-4 grid grid-cols-1 md:grid-cols-2 gap-3 no-scrollbar">
                          {products.map(p => (
                             <button key={p.id} onClick={() => {
                                const next = [...editingPromo.targetProductIds];
                                const idx = next.indexOf(p.id);
                                if (idx >= 0) next.splice(idx, 1);
                                else next.push(p.id);
                                setEditingPromo({...editingPromo, targetProductIds: next});
                             }} className={`p-4 rounded-2xl flex items-center gap-4 border transition ${editingPromo.targetProductIds.includes(p.id) ? 'bg-lg-red/5 border-lg-red' : 'bg-gray-50 border-gray-100'}`}>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${editingPromo.targetProductIds.includes(p.id) ? 'bg-lg-red border-lg-red text-white' : 'border-gray-200 text-transparent'}`}>
                                   <Check size={12}/>
                                </div>
                                <div className="text-left">
                                   <p className="text-[10px] font-black uppercase text-gray-900 leading-none mb-1">{p.name}</p>
                                   <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{p.id}</p>
                                </div>
                             </button>
                          ))}
                       </div>
                    )}
                 </div>

                 <div className="pt-12 border-t flex flex-col md:flex-row gap-6">
                    <button onClick={savePromo} className="flex-1 bg-black text-white py-8 rounded-full font-black uppercase text-[12px] tracking-[0.4em] shadow-2xl hover:bg-lg-red transition-all">DEPLOΥ CAMPAIGN</button>
                    <button onClick={() => setEditingPromo(null)} className="px-16 py-8 rounded-full font-black uppercase text-[10px] text-gray-400 border border-gray-100 hover:bg-gray-50 transition">CANCEL</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;