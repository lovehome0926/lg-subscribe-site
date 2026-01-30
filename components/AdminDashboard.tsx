
import React, { useState, useRef, useMemo } from 'react';
import { Product, Language, SiteSettings, PromotionTemplate, ProductPlan, Multilingual, ProductVariant, HpOption, StoreLocation } from '../types.js';
import { processProductAI } from '../utils/ai.js';
import { 
  Plus, Sparkles, Trash2, RefreshCcw, Save, Search, 
  Settings, Download, Upload, FileJson, Edit3, 
  Tag, Image as ImageIcon, Briefcase, Layout, X, PlusCircle, MinusCircle, ExternalLink, Filter, Camera, Palette, Globe, Link
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  // 用于个别产品的 URL 同步
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
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
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

  const triggerStoreUpload = (id: string) => {
    activeStoreIdx.current = id;
    storeImgInputRef.current?.click();
  };

  const handleAISync = async (mode: 'text' | 'url') => {
    const input = mode === 'text' ? aiInput : productUrl;
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const result = await processProductAI(input, true);
      const newProduct = JSON.parse(result);
      if (newProduct && newProduct.id) {
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
      const parsed = JSON.parse(result);
      setEditingProduct({
        ...editingProduct,
        features: parsed.features || editingProduct.features,
        painPoints: parsed.painPoints || editingProduct.painPoints,
        subName: parsed.subName || editingProduct.subName,
        description: parsed.description || editingProduct.description,
        plans: parsed.plans || editingProduct.plans,
        hpOptions: parsed.hpOptions || editingProduct.hpOptions,
        officialUrl: individualSyncUrl
      });
      setIndividualSyncUrl('');
      alert("AI data extracted to form!");
    } catch (e) {
      alert("Extraction failed.");
    } finally { setIsProcessing(false); }
  };

  const saveProductEdits = async () => {
    if (!editingProduct) return;
    await setProducts(prev => {
      const exists = prev.find(p => p.id === editingProduct.id);
      if (exists) return prev.map(p => p.id === editingProduct.id ? editingProduct : p);
      return [editingProduct, ...prev];
    });
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm("Permanently delete this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const addStore = () => {
    const newStore: StoreLocation = { id: Date.now().toString(), name: 'New Store', address: '', googleMapsUrl: '', image: null };
    updateSiteSettings({ ...siteSettings, stores: [...siteSettings.stores, newStore] });
  };

  const updateStore = (id: string, updates: Partial<StoreLocation>) => {
    const next = siteSettings.stores.map(s => s.id === id ? { ...s, ...updates } : s);
    updateSiteSettings({ ...siteSettings, stores: next });
  };

  const addPromo = () => {
    const newPromo: PromotionTemplate = {
      id: Date.now().toString(), name: 'New Promo', discountType: 'fixed', discountAmount: 0,
      durationMonths: 12, isActive: true, applyToAll: true, targetProductIds: []
    };
    updateSiteSettings({ ...siteSettings, promoTemplates: [...siteSettings.promoTemplates, newPromo] });
  };

  const updatePromo = (id: string, updates: Partial<PromotionTemplate>) => {
    const next = siteSettings.promoTemplates.map(t => t.id === id ? { ...t, ...updates } : t);
    updateSiteSettings({ ...siteSettings, promoTemplates: next });
  };

  const MultiInput = ({ label, value, onChange }: { label: string, value: Multilingual, onChange: (v: Multilingual) => void }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</label>
      <div className="grid grid-cols-3 gap-2">
        <input className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900" value={value.en} onChange={e => onChange({ ...value, en: e.target.value })} placeholder="EN" />
        <input className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900" value={value.cn} onChange={e => onChange({ ...value, cn: e.target.value })} placeholder="中文" />
        <input className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-900" value={value.ms} onChange={e => onChange({ ...value, ms: e.target.value })} placeholder="BM" />
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
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-lg-red text-white shadow-lg' : 'bg-white/5 text-white/40 hover:text-white'}`}
              >
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
                <input 
                  className="w-full pl-16 pr-8 py-5 rounded-full bg-white border border-gray-100 text-sm font-bold text-gray-900 outline-none" 
                  placeholder="Filter by Model Name or ID..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <select className="bg-white border px-6 py-5 rounded-full text-xs font-black uppercase text-gray-900 outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button 
                  onClick={() => setEditingProduct({
                    id: 'MODEL-' + Date.now(), category: categories[0] || 'Uncategorized', name: 'New Asset',
                    subName: { en: '', cn: '', ms: '' }, description: '', image: '',
                    promoPrice: 0, normalPrice: 0, promoText: '', warranty: '1Y',
                    features: [], painPoints: [], plans: [], variants: [], hpOptions: []
                  })}
                  className="bg-black text-white px-8 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-lg-red transition flex items-center justify-center gap-3"
                >
                  <Plus size={16}/> New Entry
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start mb-10">
                    <img src={p.image} className="w-24 h-24 object-contain p-2 bg-gray-50 rounded-2xl" />
                    <div className="flex gap-2">
                      <button onClick={() => setEditingProduct(p)} className="p-4 bg-gray-50 text-gray-400 hover:bg-black hover:text-white rounded-full transition shadow-sm"><Edit3 size={18}/></button>
                      <button onClick={() => deleteProduct(p.id)} className="p-4 bg-red-50 text-red-300 hover:bg-red-500 hover:text-white rounded-full transition shadow-sm"><Trash2 size={18}/></button>
                    </div>
                  </div>
                  <h3 className="font-black uppercase tracking-tight text-xl text-gray-950 mb-1">{p.name}</h3>
                  <p className="text-[10px] font-black text-lg-red uppercase tracking-widest">{p.category}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ai-import' && (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="bg-[#05090f] p-16 lg:p-24 rounded-[70px] text-white shadow-3xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-80 h-80 bg-lg-red/20 blur-[130px]"></div>
               <div className="relative z-10 space-y-12">
                  <div className="text-center">
                    <Sparkles className="mx-auto text-lg-red mb-6" size={48} />
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Content Synchronizer</h2>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] ml-2">Product URL Import</label>
                    <div className="flex gap-4">
                      <div className="flex-1 relative">
                        <Link className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18}/>
                        <input 
                          value={productUrl}
                          onChange={e => setProductUrl(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-full pl-16 pr-8 py-5 text-sm font-medium outline-none focus:border-lg-red transition text-white"
                          placeholder="Paste official LG URL..."
                        />
                      </div>
                      <button disabled={isProcessing} onClick={() => handleAISync('url')} className="bg-lg-red text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition disabled:opacity-50">ANALYZE URL</button>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8 border-t border-white/5">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] ml-2">Bulk Text Sync</label>
                    <textarea value={aiInput} onChange={e => setAiInput(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[40px] p-12 text-sm font-medium h-64 outline-none focus:border-lg-red transition text-white" placeholder="Paste product specifications..." />
                    <button disabled={isProcessing} onClick={() => handleAISync('text')} className="w-full bg-white text-black py-8 rounded-full font-black uppercase text-[12px] tracking-[0.5em] hover:bg-lg-red hover:text-white transition disabled:opacity-50">
                      {isProcessing ? 'PARSING...' : 'EXECUTE SYNC'}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'promos' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-4xl font-black uppercase tracking-tighter text-gray-950">Promotions</h2>
              <button onClick={addPromo} className="bg-lg-red text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg">Add Template</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {siteSettings.promoTemplates.map(promo => (
                <div key={promo.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <input className="text-xl font-black uppercase outline-none" value={promo.name} onChange={e => updatePromo(promo.id, { name: e.target.value })} />
                    <button onClick={() => updateSiteSettings({ ...siteSettings, promoTemplates: siteSettings.promoTemplates.filter(t => t.id !== promo.id) })} className="text-red-300 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Type</label>
                       <select className="w-full p-4 bg-gray-50 rounded-2xl text-[11px] font-black" value={promo.discountType} onChange={e => updatePromo(promo.id, { discountType: e.target.value as any })}>
                         <option value="fixed">Fixed RM</option>
                         <option value="percentage">% Percent</option>
                         <option value="direct">Final Price</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[9px] font-black uppercase text-gray-300 tracking-widest">Amount</label>
                       <input className="w-full p-4 bg-gray-50 rounded-2xl text-[11px] font-black" type="number" value={promo.discountAmount} onChange={e => updatePromo(promo.id, { discountAmount: Number(e.target.value) })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'site' && (
          <div className="space-y-16">
            <div className="bg-white p-12 rounded-[55px] border border-gray-100 shadow-sm space-y-10">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Recruitment & Social</h2>
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-300">Office Email</label>
                  <input className="w-full p-6 bg-gray-50 rounded-3xl text-sm" value={siteSettings.officeEmail} onChange={e => updateSiteSettings({ ...siteSettings, officeEmail: e.target.value })} />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-gray-300">Recruitment WhatsApp</label>
                  <input className="w-full p-6 bg-gray-50 rounded-3xl text-sm" value={siteSettings.recruitmentWa} onChange={e => updateSiteSettings({ ...siteSettings, recruitmentWa: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="space-y-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Offline Stores</h2>
                <button onClick={addStore} className="bg-black text-white px-8 py-3 rounded-full font-black uppercase text-[10px]">Add Location</button>
              </div>
              <input type="file" ref={storeImgInputRef} className="hidden" accept="image/*" onChange={e => {
                const file = e.target.files?.[0];
                if (file && activeStoreIdx.current) {
                  handleImageUpload(file, url => updateStore(activeStoreIdx.current!, { image: url }));
                }
              }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {siteSettings.stores.map(store => (
                  <div key={store.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative group cursor-pointer" onClick={() => triggerStoreUpload(store.id)}>
                          {store.image ? (
                            <img src={store.image} className="w-16 h-16 object-cover rounded-xl" />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300"><Camera size={18}/></div>
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl"><Upload size={14} className="text-white"/></div>
                        </div>
                        <input className="text-lg font-black uppercase outline-none" value={store.name} onChange={e => updateStore(store.id, { name: e.target.value })} />
                      </div>
                      <button onClick={() => updateSiteSettings({ ...siteSettings, stores: siteSettings.stores.filter(s => s.id !== store.id) })} className="text-red-300 hover:text-red-500"><Trash2 size={18}/></button>
                    </div>
                    <textarea className="w-full p-4 bg-gray-50 rounded-2xl text-xs h-24" value={store.address} onChange={e => updateStore(store.id, { address: e.target.value })} placeholder="Store Address" />
                    <input className="w-full p-4 bg-gray-50 rounded-2xl text-xs" value={store.googleMapsUrl} onChange={e => updateStore(store.id, { googleMapsUrl: e.target.value })} placeholder="Maps Link" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white p-12 rounded-[55px] border border-gray-100 shadow-sm space-y-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black uppercase text-gray-950">Site Logo</h3>
                  <button onClick={() => logoInputRef.current?.click()} className="p-4 bg-gray-50 rounded-full text-lg-red hover:bg-lg-red hover:text-white transition"><Camera size={18}/></button>
                </div>
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], updateBrandingLogo)} />
                <input className="w-full p-6 bg-gray-50 rounded-2xl text-xs font-bold outline-none" placeholder="Or Image URL" value={brandingLogo || ''} onChange={e => updateBrandingLogo(e.target.value || null)} />
                {brandingLogo && <img src={brandingLogo} className="h-12 object-contain bg-gray-950 p-4 rounded-2xl" />}
              </div>
              <div className="bg-white p-12 rounded-[55px] border border-gray-100 shadow-sm space-y-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black uppercase text-gray-950">Hero Visual</h3>
                  <button onClick={() => heroInputRef.current?.click()} className="p-4 bg-gray-50 rounded-full text-lg-red hover:bg-lg-red hover:text-white transition"><Camera size={18}/></button>
                </div>
                <input type="file" ref={heroInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], updateBrandingHero)} />
                <input className="w-full p-6 bg-gray-50 rounded-2xl text-xs font-bold outline-none" placeholder="Or Image URL" value={brandingHero || ''} onChange={e => updateBrandingHero(e.target.value || null)} />
                {brandingHero && <img src={brandingHero} className="h-40 w-full object-cover rounded-[40px] shadow-2xl" />}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="max-w-3xl mx-auto bg-white p-16 rounded-[70px] border border-gray-100 shadow-3xl space-y-12">
            <div className="text-center space-y-4">
              <Download className="mx-auto text-lg-red" size={48} />
              <h2 className="text-3xl font-black uppercase tracking-tighter">Database Management</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Export products or restore to factory defaults.</p>
            </div>
            <div className="grid gap-6">
              <button 
                onClick={() => {
                  const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `lg-catalog-backup-${Date.now()}.json`;
                  a.click();
                }}
                className="w-full py-8 bg-black text-white rounded-full font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-lg-red transition"
              >
                <Download size={20}/> Export Catalog JSON
              </button>

              <div className="relative group">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".json" 
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = async (ev) => {
                        try {
                          const data = JSON.parse(ev.target?.result as string);
                          if (confirm("Replace entire database with this backup?")) {
                            await setProducts(data);
                            alert("Restore successful!");
                          }
                        } catch (err) { alert("Invalid backup file."); }
                      };
                      reader.readAsText(file);
                    }
                  }} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 bg-gray-50 border border-gray-100 text-gray-900 rounded-full font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-gray-100 transition"
                >
                  <Upload size={20}/> Restore from JSON
                </button>
              </div>

              <button onClick={onReset} className="w-full py-8 border-4 border-lg-red text-lg-red rounded-full font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-lg-red hover:text-white transition">
                <RefreshCcw size={20}/> Factory Reset DB
              </button>
            </div>
          </div>
        )}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
          <div className="bg-white w-full max-w-7xl my-auto rounded-[60px] p-12 lg:p-24 relative shadow-3xl overflow-y-auto max-h-[95vh] no-scrollbar">
             <button onClick={() => setEditingProduct(null)} className="absolute top-12 right-12 p-5 bg-gray-50 rounded-full text-gray-400 hover:text-black transition"><X size={24}/></button>
             
             <div className="flex flex-col md:flex-row items-center gap-10 mb-20">
               <div className="relative group">
                 <img src={editingProduct.image} className="w-40 h-40 object-contain p-6 bg-gray-50 rounded-[40px] border border-gray-100" />
                 <button onClick={() => productImgInputRef.current?.click()} className="absolute -bottom-4 -right-4 w-12 h-12 bg-lg-red text-white rounded-full flex items-center justify-center border-4 border-white shadow-xl"><Camera size={18}/></button>
                 <input type="file" ref={productImgInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], url => setEditingProduct({...editingProduct, image: url}))} />
               </div>
               <div className="flex-1">
                  <h2 className="text-5xl font-black uppercase tracking-tighter text-gray-950">Edit Master Asset</h2>
                  <div className="mt-6 flex flex-col md:flex-row gap-4">
                     <div className="relative flex-1">
                        <Link className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16}/>
                        <input 
                          value={individualSyncUrl} 
                          onChange={e => setIndividualSyncUrl(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-full pl-14 pr-4 py-4 text-xs font-bold outline-none" 
                          placeholder="Individual Product URL (Official LG)..." 
                        />
                     </div>
                     <button 
                       disabled={isProcessing} 
                       onClick={handleIndividualSync}
                       className="bg-lg-red text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-black transition disabled:opacity-50"
                     >
                       {isProcessing ? 'Syncing...' : 'Sync Specs'}
                     </button>
                  </div>
               </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
                <div className="space-y-16">
                   <div className="space-y-8">
                      <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em] pb-4 border-b">Identity</h4>
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-300 uppercase">Product Name</label>
                          <input className="w-full p-7 bg-gray-50 rounded-[30px] text-xl font-black text-gray-950 outline-none" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-300 uppercase">Category</label>
                            <select className="w-full p-7 bg-gray-50 rounded-[30px] font-black uppercase text-xs outline-none" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-300 uppercase">Warranty Info</label>
                            <input className="w-full p-7 bg-gray-50 rounded-[30px] font-black text-xs outline-none" value={editingProduct.warranty} onChange={e => setEditingProduct({...editingProduct, warranty: e.target.value})} />
                          </div>
                        </div>
                        <MultiInput label="Subtitle Branding" value={editingProduct.subName} onChange={v => setEditingProduct({...editingProduct, subName: v})} />
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="flex justify-between items-end border-b pb-4">
                        <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">Features & Specs</h4>
                        <button onClick={() => setEditingProduct({...editingProduct, features: [...editingProduct.features, { en: '', cn: '', ms: '' }]})} className="text-[9px] font-black uppercase text-lg-red flex items-center gap-2"><Plus size={14}/> Add Feature</button>
                      </div>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                        {editingProduct.features.map((f, i) => (
                          <div key={i} className="flex gap-4 items-start">
                            <div className="flex-1"><MultiInput label={`Feature ${i+1}`} value={f} onChange={v => { const next = [...editingProduct.features]; next[i] = v; setEditingProduct({...editingProduct, features: next}); }} /></div>
                            <button onClick={() => setEditingProduct({...editingProduct, features: editingProduct.features.filter((_, idx) => idx !== i)})} className="mt-8 text-red-300 hover:text-red-500"><MinusCircle size={20}/></button>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="flex justify-between items-end border-b pb-4">
                        <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">Horsepower (HP) Tiers</h4>
                        <button onClick={() => setEditingProduct({...editingProduct, hpOptions: [...(editingProduct.hpOptions || []), { value: '1.0', modelId: '', rentalOffset: 0, cashOffset: 0 }]})} className="text-[10px] font-black uppercase text-lg-red flex items-center gap-2"><PlusCircle size={16}/> Add Tier</button>
                      </div>
                      <div className="space-y-4">
                        {(editingProduct.hpOptions || []).map((hp, idx) => (
                          <div key={idx} className="bg-gray-50 p-6 rounded-[35px] grid grid-cols-4 gap-4 items-end relative shadow-inner">
                            <div className="space-y-1">
                               <label className="text-[7px] font-black text-gray-300 uppercase">HP</label>
                               <input className="w-full bg-white px-3 py-2 rounded-xl text-xs font-black outline-none" value={hp.value} onChange={e => { const next = [...(editingProduct.hpOptions || [])]; next[idx].value = e.target.value; setEditingProduct({...editingProduct, hpOptions: next}); }} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[7px] font-black text-gray-300 uppercase">Model ID</label>
                               <input className="w-full bg-white px-3 py-2 rounded-xl text-[9px] font-mono outline-none" value={hp.modelId || ''} onChange={e => { const next = [...(editingProduct.hpOptions || [])]; next[idx].modelId = e.target.value; setEditingProduct({...editingProduct, hpOptions: next}); }} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[7px] font-black text-gray-300 uppercase">Rent +</label>
                               <input type="number" className="w-full bg-white px-3 py-2 rounded-xl text-xs font-black outline-none" value={hp.rentalOffset} onChange={e => { const next = [...(editingProduct.hpOptions || [])]; next[idx].rentalOffset = Number(e.target.value); setEditingProduct({...editingProduct, hpOptions: next}); }} />
                            </div>
                            <div className="space-y-1">
                               <label className="text-[7px] font-black text-gray-300 uppercase">Cash +</label>
                               <input type="number" className="w-full bg-white px-3 py-2 rounded-xl text-xs font-black outline-none" value={hp.cashOffset} onChange={e => { const next = [...(editingProduct.hpOptions || [])]; next[idx].cashOffset = Number(e.target.value); setEditingProduct({...editingProduct, hpOptions: next}); }} />
                            </div>
                            <button onClick={() => setEditingProduct({...editingProduct, hpOptions: editingProduct.hpOptions?.filter((_, i) => i !== idx)})} className="absolute -top-3 -right-3 text-gray-200 hover:text-red-500"><MinusCircle size={20}/></button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
                <div className="space-y-16">
                   <div className="space-y-8">
                      <div className="flex justify-between items-end border-b pb-4">
                        <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">Subscription Plans</h4>
                        <button onClick={() => setEditingProduct({...editingProduct, plans: [...editingProduct.plans, { termYears: 7, maintenanceType: 'Regular Visit', serviceInterval: '4m', price: 0 }]})} className="text-[10px] font-black uppercase text-lg-red flex items-center gap-2"><PlusCircle size={16}/> Add Plan</button>
                      </div>
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 no-scrollbar">
                        {editingProduct.plans.map((plan, idx) => (
                          <div key={idx} className="bg-gray-50 p-8 rounded-[40px] grid grid-cols-2 md:grid-cols-4 gap-6 relative shadow-inner">
                            <div className="space-y-1">
                               <label className="text-[8px] font-black text-gray-300 uppercase">Term</label>
                               <select className="w-full bg-transparent font-black text-xs outline-none" value={plan.termYears} onChange={e => { const next = [...editingProduct.plans]; next[idx].termYears = e.target.value === 'Outright' ? 'Outright' : Number(e.target.value); setEditingProduct({...editingProduct, plans: next}); }}>
                                 {[7, 5, 3, 'Outright'].map(t => <option key={t} value={t}>{t}Y</option>)}
                               </select>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[8px] font-black text-gray-300 uppercase">Service</label>
                               <select className="w-full bg-transparent font-black text-[10px] outline-none" value={plan.maintenanceType} onChange={e => { const next = [...editingProduct.plans]; next[idx].maintenanceType = e.target.value as any; setEditingProduct({...editingProduct, plans: next}); }}>
                                 {['Regular Visit', 'Self Service', 'Combined', 'Combine Maintenance', 'None'].map(t => <option key={t} value={t}>{t}</option>)}
                               </select>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[8px] font-black text-gray-300 uppercase">Interval</label>
                               <select className="w-full bg-transparent font-black text-xs outline-none" value={plan.serviceInterval} onChange={e => { const next = [...editingProduct.plans]; next[idx].serviceInterval = e.target.value; setEditingProduct({...editingProduct, plans: next}); }}>
                                 {['4m', '6m', '8m', '12m', '24m', 'None'].map(t => <option key={t} value={t}>{t}</option>)}
                               </select>
                            </div>
                            <div className="space-y-1">
                               <label className="text-[8px] font-black text-gray-300 uppercase">Price RM</label>
                               <input type="number" className="w-full bg-transparent font-black text-xs outline-none" value={plan.price} onChange={e => { const next = [...editingProduct.plans]; next[idx].price = Number(e.target.value); setEditingProduct({...editingProduct, plans: next}); }} />
                            </div>
                            <button onClick={() => setEditingProduct({...editingProduct, plans: editingProduct.plans.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 text-gray-200 hover:text-red-500"><MinusCircle size={18}/></button>
                          </div>
                        ))}
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="flex justify-between items-end border-b pb-4">
                        <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">Color Variations</h4>
                        <button onClick={() => setEditingProduct({...editingProduct, variants: [...(editingProduct.variants || []), { name: 'White', image: '', colorCode: '#ffffff', modelId: '' }]})} className="text-[10px] font-black uppercase text-lg-red flex items-center gap-2"><Palette size={16}/> Add Color</button>
                      </div>
                      <div className="space-y-4">
                        <input type="file" ref={variantImgInputRef} className="hidden" accept="image/*" onChange={e => { const file = e.target.files?.[0]; if (file && activeVariantIdx.current >= 0) { handleImageUpload(file, url => { const next = [...(editingProduct.variants || [])]; next[activeVariantIdx.current].image = url; setEditingProduct({...editingProduct, variants: next}); }); } e.target.value = ''; }} />
                        {(editingProduct.variants || []).map((v, idx) => (
                          <div key={idx} className="bg-gray-50 p-6 rounded-[35px] grid grid-cols-12 gap-6 items-center relative shadow-inner">
                             <div className="col-span-3 flex flex-col items-center gap-3">
                                {v.image ? <img src={v.image} className="w-16 h-16 object-contain rounded-2xl bg-white p-2 shadow-sm" /> : <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300"><ImageIcon size={24}/></div>}
                                <button onClick={() => triggerVariantUpload(idx)} className="text-[8px] font-black uppercase text-lg-red">Upload</button>
                             </div>
                             <div className="col-span-9 grid grid-cols-2 gap-4">
                               <input className="bg-white px-4 py-2 rounded-xl text-[10px] font-black outline-none" placeholder="Color Name" value={v.name} onChange={e => { const next = [...(editingProduct.variants || [])]; next[idx].name = e.target.value; setEditingProduct({...editingProduct, variants: next}); }} />
                               <input className="bg-white px-4 py-2 rounded-xl text-[10px] font-mono outline-none" placeholder="Model SKU" value={v.modelId || ''} onChange={e => { const next = [...(editingProduct.variants || [])]; next[idx].modelId = e.target.value; setEditingProduct({...editingProduct, variants: next}); }} />
                               <div className="col-span-2 flex items-center gap-3">
                                  <input type="color" className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer" value={v.colorCode} onChange={e => { const next = [...(editingProduct.variants || [])]; next[idx].colorCode = e.target.value; setEditingProduct({...editingProduct, variants: next}); }} />
                                  <input className="flex-1 bg-white px-4 py-2 rounded-xl text-[10px] font-mono outline-none" value={v.colorCode} onChange={e => { const next = [...(editingProduct.variants || [])]; next[idx].colorCode = e.target.value; setEditingProduct({...editingProduct, variants: next}); }} />
                               </div>
                             </div>
                             <button onClick={() => setEditingProduct({...editingProduct, variants: editingProduct.variants?.filter((_, i) => i !== idx)})} className="absolute -top-3 -right-3 text-gray-200 hover:text-red-500"><MinusCircle size={20}/></button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
             </div>
             <div className="pt-20 border-t mt-20 flex gap-6 pb-6 bg-white">
                <button onClick={saveProductEdits} className="flex-1 bg-black text-white py-8 rounded-full font-black uppercase text-[14px] tracking-[0.5em] shadow-2xl hover:bg-lg-red transition-all duration-500">Update Platform Assets</button>
                <button onClick={() => setEditingProduct(null)} className="px-16 py-8 rounded-full font-black uppercase text-[12px] text-gray-400 border border-gray-100 transition">Discard</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
