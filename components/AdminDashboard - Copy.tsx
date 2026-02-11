
import React, { useState, useMemo } from 'react';
import { Product, Agent, SiteSettings, Language, PromotionTemplate, ProductPlan, ProductVariant, HpOption } from '../types.ts';
import { CATEGORIES } from '../constants.ts';
import { Plus, Trash2, X, Search, Download, Edit3, RefreshCw, Wand2, UploadCloud, UserPlus, Tag, Globe, Megaphone, Check, LayoutPanelTop, Calendar, PackageCheck, Filter } from 'lucide-react';
import { processProductAI } from '../utils/ai.ts';

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
  products, setProducts, authorizedAgents, setAuthorizedAgents, language, siteSettings, updateSiteSettings
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'agents' | 'promo' | 'settings'>('inventory');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromotionTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [promoProductSearch, setPromoProductSearch] = useState(''); // 新增：促销产品搜索
  const [isSyncing, setIsSyncing] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', wa: '' });

  const settings = siteSettings;

  const allCategories = useMemo(() => {
    const custom = Array.isArray(settings.categories) ? settings.categories : [];
    return Array.from(new Set([...CATEGORIES, ...custom]));
  }, [settings.categories]);

  const handleFileUpload = (callback: (base64: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => callback(readerEvent.target?.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    const exists = products.some(p => p.id === editingProduct.id);
    const next = exists ? products.map(p => p.id === editingProduct.id ? editingProduct : p) : [editingProduct, ...products];
    await setProducts(next);
    setEditingProduct(null);
  };

  const handleAISyncForProduct = async () => {
    if (!editingProduct?.officialUrl) return alert("Enter URL first.");
    setIsSyncing(true);
    try {
      const result = await processProductAI(editingProduct.officialUrl);
      const cleanedResult = result.replace(/```json\n?|```/g, '').trim();
      const parsed = JSON.parse(cleanedResult);
      setEditingProduct({ ...editingProduct, ...parsed, id: editingProduct.id });
    } catch (err) { alert("AI sync failed."); } finally { setIsSyncing(false); }
  };

  const updateField = (field: string, value: any) => {
    if (editingProduct) setEditingProduct({ ...editingProduct, [field]: value });
  };

  // 促销产品筛选逻辑
  const filteredProductsForPromo = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(promoProductSearch.toLowerCase()) || 
      p.id.toLowerCase().includes(promoProductSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(promoProductSearch.toLowerCase())
    );
  }, [products, promoProductSearch]);

  const togglePromoProduct = (id: string) => {
    if (!editingPromo) return;
    const current = editingPromo.applicableProductIds || [];
    const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
    setEditingPromo({ ...editingPromo, applicableProductIds: next });
  };

  return (
    <div className="bg-white min-h-screen pt-28 pb-20 font-sans">
      {/* 顶部导航栏 */}
      <div className="bg-lg-dark text-white py-12 px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="italic font-black">
            <h1 className="text-4xl uppercase tracking-tighter">LG HUB TERMINAL.</h1>
            <p className="text-lg-red text-[10px] uppercase tracking-[0.4em]">ADMIN & MARKETING CENTER</p>
          </div>
          
          <div className="flex bg-[#0a0f18] p-2 rounded-[30px] border border-white/5 shadow-inner">
            {[
              { id: 'inventory', label: 'INVENTORY' },
              { id: 'agents', label: 'AGENTS' },
              { id: 'promo', label: 'PROMO' },
              { id: 'settings', label: 'SETTINGS' }
            ].map(tab => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-10 py-3.5 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-lg-red text-white shadow-[0_10px_20px_rgba(230,0,68,0.3)]' : 'text-gray-500 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-12 animate-fade-up">
            <div className="flex justify-between items-end">
               <div className="space-y-4 flex-1">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter">Inventory assets.</h2>
                 <div className="relative max-w-lg">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                   <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-16 pr-6 py-5 rounded-[25px] border-none shadow-sm bg-gray-50 font-bold" placeholder="Search SKU..." />
                 </div>
               </div>
               <button onClick={() => setEditingProduct({ id: `P-${Date.now()}`, name: '', category: allCategories[0], subName: {en:'',cn:'',ms:''}, description: '', image: '', normalPrice: 0, promoPrice: 0, promoText: '', warranty: '', plans: [], features: [], painPoints: [], variants: [], hpOptions: [] })} className="bg-lg-red text-white px-10 py-5 rounded-full font-black uppercase text-[11px] tracking-widest shadow-xl">Add SKU</button>
            </div>
            <div className="grid gap-6">
              {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                <div key={p.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex items-center gap-8 group hover:border-lg-red transition-all">
                  <div className="w-24 h-24 bg-gray-50 rounded-[30px] p-4 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={p.image} className="max-h-full object-contain" alt={p.name} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-black uppercase italic">{p.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU: {p.id} | {p.category}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingProduct(p)} className="p-4 bg-gray-50 text-gray-400 rounded-full hover:bg-black hover:text-white transition-all"><Edit3 size={18}/></button>
                    <button onClick={() => {if(confirm("Delete this product?")) setProducts(products.filter(x => x.id !== p.id))}} className="p-4 bg-red-50 text-red-300 rounded-full hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AGENTS TAB */}
        {activeTab === 'agents' && (
          <div className="space-y-12 animate-fade-up">
            <div className="bg-white p-12 rounded-[50px] border border-gray-100 shadow-xl space-y-10">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Authorize Partners.</h2>
              <div className="flex gap-4">
                <input value={newAgent.name} onChange={e=>setNewAgent({...newAgent, name: e.target.value})} className="flex-1 p-6 bg-gray-50 rounded-3xl border-none font-bold" placeholder="Agent Name" />
                <input value={newAgent.wa} onChange={e=>setNewAgent({...newAgent, wa: e.target.value})} className="flex-1 p-6 bg-gray-50 rounded-3xl border-none font-bold" placeholder="WA Number (e.g. 6017...)" />
                <button onClick={() => {
                  if(!newAgent.name || !newAgent.wa) return;
                  setAuthorizedAgents([...authorizedAgents, { ...newAgent, id: `A-${Date.now()}`, whatsapp: newAgent.wa.replace(/\D/g, '') }]);
                  setNewAgent({ name: '', wa: '' });
                }} className="bg-lg-red text-white px-12 rounded-3xl font-black uppercase text-[11px] tracking-widest"><UserPlus size={18} className="inline mr-2"/> Add Partner</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {authorizedAgents.map(a => (
                  <div key={a.id} className="p-8 bg-gray-50 rounded-[40px] flex justify-between items-center group">
                    <div>
                      <h5 className="font-black uppercase">{a.name}</h5>
                      <p className="text-[10px] font-bold text-gray-400">{a.whatsapp}</p>
                    </div>
                    <button onClick={() => setAuthorizedAgents(authorizedAgents.filter(x => x.id !== a.id))} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROMO TAB */}
        {activeTab === 'promo' && (
          <div className="space-y-12 animate-fade-up">
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Marketing Campaigns.</h2>
              <button onClick={() => setEditingPromo({ id: `PR-${Date.now()}`, type: 'percentage', title: {en:'',cn:'',ms:''}, applicableProductIds: [], durationMonths: 6, value: 0, endDate: '', content: {en:'',cn:'',ms:''} })} className="bg-black text-white px-10 py-5 rounded-full font-black uppercase text-[11px] tracking-widest">New Promo</button>
            </div>
            
            <div className="grid gap-6">
              {(settings.promoTemplates || []).map(t => (
                <div key={t.id} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex justify-between items-center group">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-lg-red"><Tag size={24}/></div>
                    <div className="space-y-1">
                      <h4 className="text-xl font-black uppercase italic">{t.title[language] || t.title.en}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.type} | End: {t.endDate || 'No Expiry'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingPromo(t)} className="p-4 bg-gray-50 text-gray-400 rounded-full"><Edit3 size={18}/></button>
                    <button onClick={() => {
                      const next = { ...settings, promoTemplates: (settings.promoTemplates || []).filter(x => x.id !== t.id) };
                      updateSiteSettings(next);
                    }} className="p-4 bg-red-50 text-red-300 rounded-full"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-12 animate-fade-up">
            <div className="bg-white p-12 rounded-[60px] border border-gray-100 shadow-xl space-y-16">
              <div className="flex justify-between items-center border-b pb-8">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Terminal Configurations.</h2>
                <div className="flex gap-4">
                  <button onClick={() => {
                    const data = { products, siteSettings: settings, authorizedAgents, ts: Date.now() };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
                    a.download = `LG_HUB_BACKUP_${Date.now()}.json`; a.click();
                  }} className="bg-black text-white px-10 py-5 rounded-full font-black text-[11px] uppercase flex items-center gap-3"><Download size={18}/> Full Backup</button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-16">
                {/* Branding Assets */}
                <div className="space-y-10">
                  <h3 className="text-sm font-black uppercase text-lg-red flex items-center gap-2"><Globe size={16}/> Branding Visuals</h3>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Main Logo URL</label>
                      <div className="flex gap-4">
                        <input value={settings.logoUrl || ''} onChange={e => updateSiteSettings({...settings, logoUrl: e.target.value})} className="flex-1 p-6 bg-gray-50 rounded-2xl font-bold" />
                        <button onClick={() => handleFileUpload(b => updateSiteSettings({...settings, logoUrl: b}))} className="bg-black p-6 rounded-2xl text-white"><UploadCloud size={20}/></button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Hero Banner URL</label>
                      <div className="flex gap-4">
                        <input value={settings.heroImageUrl || ''} onChange={e => updateSiteSettings({...settings, heroImageUrl: e.target.value})} className="flex-1 p-6 bg-gray-50 rounded-2xl font-bold" />
                        <button onClick={() => handleFileUpload(b => updateSiteSettings({...settings, heroImageUrl: b}))} className="bg-black p-6 rounded-2xl text-white"><UploadCloud size={20}/></button>
                      </div>
                    </div>
                  </div>

                  {/* Benefit Items */}
                  <div className="space-y-6 pt-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase text-gray-400">Site Benefits (3-Items Recommended)</h4>
                      <button onClick={() => updateSiteSettings({...settings, benefits: [...(settings.benefits || []), { number: '01', title: {en:'',cn:'',ms:''}, description: {en:'',cn:'',ms:''}, image: '' }]})} className="text-lg-red font-black text-[10px]">+ ADD BENEFIT</button>
                    </div>
                    <div className="space-y-4">
                      {(settings.benefits || []).map((b, i) => (
                        <div key={i} className="p-6 bg-gray-50 rounded-[30px] flex gap-6 items-center border border-gray-100 group relative">
                          <button onClick={() => updateSiteSettings({...settings, benefits: settings.benefits.filter((_, idx) => idx !== i)})} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                          <div onClick={() => handleFileUpload(base64 => {
                             const next = [...settings.benefits];
                             next[i] = { ...next[i], image: base64 };
                             updateSiteSettings({ ...settings, benefits: next });
                          })} className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer shadow-sm">
                             {b.image ? <img src={b.image} className="max-h-full object-cover" /> : <UploadCloud className="text-gray-200" />}
                          </div>
                          <div className="flex-1 space-y-2">
                             <input value={b.title.en} onChange={e => {
                               const next = [...settings.benefits];
                               next[i] = { ...next[i], title: { ...next[i].title, en: e.target.value } };
                               updateSiteSettings({...settings, benefits: next});
                             }} className="w-full bg-transparent font-black text-xs uppercase" placeholder="Benefit Title" />
                             <input value={b.description.en} onChange={e => {
                               const next = [...settings.benefits];
                               next[i] = { ...next[i], description: { ...next[i].description, en: e.target.value } };
                               updateSiteSettings({...settings, benefits: next});
                             }} className="w-full bg-transparent text-[10px] font-bold text-gray-400" placeholder="Short Description" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recruitment & Categories */}
                <div className="space-y-10">
                  <h3 className="text-sm font-black uppercase text-lg-red flex items-center gap-2"><Megaphone size={16}/> Content & Categories</h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400">Recruitment WhatsApp</label>
                      <input value={settings.recruitmentWa || ''} onChange={e => updateSiteSettings({...settings, recruitmentWa: e.target.value})} className="w-full p-6 bg-gray-50 rounded-2xl font-bold" placeholder="601..." />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-gray-400">Custom Categories</label>
                        <span className="text-[9px] font-bold text-gray-300">System defaults are preserved</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {allCategories.map(cat => (
                          <div key={cat} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 group">
                            <span className="text-[10px] font-black uppercase">{cat}</span>
                            {settings.categories?.includes(cat) && (
                              <button onClick={() => updateSiteSettings({...settings, categories: settings.categories.filter(c => c !== cat)})} className="text-gray-300 hover:text-red-500"><X size={12}/></button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={editingProduct?.category || ''} onChange={e => setEditingProduct({ ...editingProduct!, category: e.target.value })} className="flex-1 p-4 bg-gray-50 rounded-xl font-bold text-xs" placeholder="New Category Name..." />
                        <button onClick={() => {
                          if(!editingProduct?.category) return;
                          const next = Array.from(new Set([...(settings.categories || []), editingProduct.category]));
                          updateSiteSettings({...settings, categories: next});
                          setEditingProduct({ ...editingProduct!, category: '' });
                        }} className="bg-black text-white px-6 rounded-xl font-black text-[10px]">ADD</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 商品资料完整修改页面 */}
      {editingProduct && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[50px] w-full max-w-7xl h-[90vh] overflow-hidden shadow-2xl flex flex-col relative animate-fade-up">
            <div className="px-12 py-10 border-b border-gray-100 flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">EDIT SKU ASSET.</h2>
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mt-2">Inventory Management & AI Sync</p>
               </div>
               <button onClick={() => setEditingProduct(null)} className="p-5 bg-gray-50 rounded-full hover:bg-lg-red hover:text-white transition-all text-gray-400"><X size={32}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
               <div className="grid lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-4 space-y-12">
                     <div className="space-y-6">
                        <label className="text-[11px] font-black uppercase text-lg-red tracking-[0.2em] block">1. Identity & Classification</label>
                        <div className="space-y-4">
                           <input value={editingProduct.name} onChange={e=>updateField('name', e.target.value)} className="w-full p-6 bg-gray-50 rounded-2xl border-none font-black text-xl shadow-sm" placeholder="Product Name" />
                           <input value={editingProduct.id} onChange={e=>updateField('id', e.target.value)} className="w-full p-6 bg-gray-50 rounded-2xl border-none font-bold text-xs text-gray-400" placeholder="Unique Model ID" />
                           <select value={editingProduct.category} onChange={e=>updateField('category', e.target.value)} className="w-full p-6 bg-gray-50 rounded-2xl border-none font-black text-xs uppercase text-lg-red appearance-none shadow-sm">
                              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <label className="text-[11px] font-black uppercase text-lg-red tracking-[0.2em] block">2. Official AI Sync</label>
                        <div className="flex gap-3">
                           <input value={editingProduct.officialUrl || ''} onChange={e=>updateField('officialUrl', e.target.value)} className="flex-1 p-6 bg-gray-50 rounded-2xl border-none font-bold text-xs" placeholder="Paste Official LG URL" />
                           <button onClick={handleAISyncForProduct} disabled={isSyncing} className="bg-black text-white p-6 rounded-2xl transition-all hover:bg-lg-red">{isSyncing ? <RefreshCw className="animate-spin" size={20}/> : <Wand2 size={20}/>}</button>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <label className="text-[11px] font-black uppercase text-lg-red tracking-[0.2em] block">3. Primary Visual</label>
                        <div className="aspect-square bg-gray-50 rounded-[50px] flex items-center justify-center p-12 overflow-hidden relative group shadow-inner">
                           {editingProduct.image ? <img src={editingProduct.image} className="max-h-full object-contain" alt="" /> : <UploadCloud size={60} className="text-gray-200" />}
                           <button onClick={() => handleFileUpload(b => updateField('image', b))} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-black">REPLACE IMAGE</button>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-8 space-y-16 pb-20">
                     {/* 颜色变体管理 */}
                     <div className="space-y-8">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                           <h3 className="text-2xl font-black italic uppercase tracking-tighter">COLOR VARIANTS.</h3>
                           <button onClick={() => updateField('variants', [...(editingProduct.variants || []), { name: 'New Color', image: '', modelId: '' }])} className="text-lg-red font-black uppercase text-[10px] tracking-widest"><Plus size={14} className="inline mr-1"/> ADD VARIANT</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {(editingProduct.variants || []).map((v, i) => (
                             <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex gap-4 items-center relative group">
                                <button onClick={() => updateField('variants', editingProduct.variants?.filter((_, idx)=>idx!==i))} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                                <div onClick={() => handleFileUpload(b => {
                                  const next = [...(editingProduct.variants || [])];
                                  next[i] = { ...next[i], image: b };
                                  updateField('variants', next);
                                })} className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer shrink-0 shadow-sm">
                                   {v.image ? <img src={v.image} className="max-h-full object-contain" /> : <UploadCloud size={18} className="text-gray-200" />}
                                </div>
                                <div className="flex-1 space-y-2">
                                   <input value={v.name} onChange={e => {
                                      const next = [...(editingProduct.variants || [])];
                                      next[i] = { ...next[i], name: e.target.value };
                                      updateField('variants', next);
                                   }} className="w-full bg-transparent font-black text-xs uppercase" placeholder="Color Name" />
                                   <input value={v.modelId} onChange={e => {
                                      const next = [...(editingProduct.variants || [])];
                                      next[i] = { ...next[i], modelId: e.target.value };
                                      updateField('variants', next);
                                   }} className="w-full bg-transparent font-bold text-[10px] text-gray-400" placeholder="Specific Model ID" />
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>

                     {/* HP Options */}
                     <div className="space-y-8">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                           <h3 className="text-2xl font-black italic uppercase tracking-tighter">HORSEPOWER (HP) OPTIONS.</h3>
                           <button onClick={() => updateField('hpOptions', [...(editingProduct.hpOptions || []), { label: {en:'1.0HP',cn:'1.0匹',ms:'1.0HP'}, value: '1.0HP', modelId: '', rentalOffset: 0, cashOffset: 0 }])} className="text-lg-red font-black uppercase text-[10px] tracking-widest"><Plus size={14} className="inline mr-1"/> ADD SPEC</button>
                        </div>
                        <div className="space-y-4">
                           {(editingProduct.hpOptions || []).map((hp, i) => (
                             <div key={i} className="p-6 bg-gray-50 rounded-3xl grid grid-cols-4 gap-4 items-center border border-gray-100 shadow-sm">
                                <input value={hp.label.en} onChange={e => {
                                  const next = [...(editingProduct.hpOptions || [])];
                                  next[i] = { ...next[i], label: { ...next[i].label, en: e.target.value, cn: e.target.value, ms: e.target.value } };
                                  updateField('hpOptions', next);
                                }} className="bg-white p-4 rounded-xl font-black text-xs" placeholder="HP Label" />
                                <input value={hp.modelId} onChange={e => {
                                  const next = [...(editingProduct.hpOptions || [])];
                                  next[i] = { ...next[i], modelId: e.target.value };
                                  updateField('hpOptions', next);
                                }} className="bg-white p-4 rounded-xl font-bold text-[10px] text-gray-400" placeholder="Model SKU" />
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black text-gray-400">PRICE OFFSET</span>
                                  <input type="number" value={hp.rentalOffset} onChange={e => {
                                    const next = [...(editingProduct.hpOptions || [])];
                                    next[i] = { ...next[i], rentalOffset: Number(e.target.value) };
                                    updateField('hpOptions', next);
                                  }} className="bg-white p-4 rounded-xl font-black text-xs w-20" />
                                </div>
                                <button onClick={() => updateField('hpOptions', editingProduct.hpOptions?.filter((_, idx)=>idx!==i))} className="text-red-300 hover:text-red-500 justify-self-end"><Trash2 size={18}/></button>
                             </div>
                           ))}
                        </div>
                     </div>

                     {/* 订阅计划 */}
                     <div className="space-y-8">
                        <div className="flex justify-between items-end border-b border-gray-100 pb-4">
                           <h3 className="text-2xl font-black italic uppercase tracking-tighter">SUBSCRIPTION PLANS.</h3>
                           <button onClick={() => updateField('plans', [...(editingProduct.plans || []), { termYears: 7, maintenanceType: 'Regular Visit', serviceInterval: '4m', price: 0 }])} className="text-lg-red font-black uppercase text-[10px] tracking-widest"><Plus size={14} className="inline mr-1"/> ADD PLAN</button>
                        </div>
                        <div className="space-y-4">
                           {(editingProduct.plans || []).map((plan, i) => (
                             <div key={i} className="p-6 bg-gray-50 rounded-3xl grid grid-cols-5 gap-4 items-center shadow-sm">
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase text-gray-400">Term</label>
                                   <select value={plan.termYears} onChange={e => {
                                      const next = [...(editingProduct.plans || [])];
                                      next[i] = { ...next[i], termYears: e.target.value === 'Outright' ? 'Outright' : Number(e.target.value) };
                                      updateField('plans', next);
                                   }} className="w-full bg-white p-4 rounded-xl font-black text-xs uppercase">
                                      {[3,4,5,6,7,'Outright'].map(v => <option key={v} value={v}>{v} {typeof v === 'number' ? 'Yrs' : ''}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase text-gray-400">Service Type</label>
                                   <select value={plan.maintenanceType} onChange={e => {
                                      const next = [...(editingProduct.plans || [])];
                                      next[i] = { ...next[i], maintenanceType: e.target.value as any };
                                      updateField('plans', next);
                                   }} className="w-full bg-white p-4 rounded-xl font-black text-xs">
                                      {['Regular Visit', 'Self Service', 'Combined', 'No Service'].map(v => <option key={v} value={v}>{v}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase text-gray-400">Interval</label>
                                   <select value={plan.serviceInterval} onChange={e => {
                                      const next = [...(editingProduct.plans || [])];
                                      next[i] = { ...next[i], serviceInterval: e.target.value as any };
                                      updateField('plans', next);
                                   }} className="w-full bg-white p-4 rounded-xl font-black text-xs">
                                      {['None', '3m', '6m', '12m', '24m'].map(v => <option key={v} value={v}>{v}</option>)}
                                   </select>
                                </div>
                                <div className="space-y-1">
                                   <label className="text-[9px] font-black uppercase text-gray-400">Monthly/Total</label>
                                   <input type="number" value={plan.price} onChange={e => {
                                      const next = [...(editingProduct.plans || [])];
                                      next[i] = { ...next[i], price: Number(e.target.value) };
                                      updateField('plans', next);
                                   }} className="w-full bg-white p-4 rounded-xl font-black text-xs" />
                                </div>
                                <button onClick={() => updateField('plans', editingProduct.plans?.filter((_, idx)=>idx!==i))} className="text-red-300 hover:text-red-500 pt-5 self-center"><Trash2 size={18}/></button>
                             </div>
                           ))}
                        </div>
                     </div>
                     <div className="pt-12 border-t border-gray-100">
                        <button onClick={handleSaveProduct} className="w-full bg-lg-red text-white py-8 rounded-[40px] font-black uppercase tracking-[0.4em] text-2xl shadow-2xl hover:bg-black transition-all">PERSIST ASSET TO CLOUD</button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 促销修改模版 - 已升级产品选择器 */}
      {editingPromo && (
        <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[50px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl animate-fade-up overflow-hidden">
             <div className="px-12 py-10 border-b border-gray-100 flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-3xl font-black italic uppercase">EDIT PROMOTION.</h2>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure campaign and select target products</p>
               </div>
               <button onClick={() => setEditingPromo(null)} className="p-4 bg-gray-50 rounded-full hover:bg-lg-red hover:text-white transition-all"><X size={24}/></button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-12 custom-scrollbar space-y-12">
                <div className="grid md:grid-cols-2 gap-10">
                   {/* Left: Campaign Config */}
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400">Campaign Type</label>
                          <select value={editingPromo.type} onChange={e=>setEditingPromo({...editingPromo, type: e.target.value as any})} className="w-full p-4 bg-gray-50 rounded-xl font-black text-xs border-none">
                              <option value="percentage">Percentage Off (%)</option>
                              <option value="fixed_price">Fixed Rental Price</option>
                              <option value="fixed_discount">Monthly Rebate (RM)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-2"><Calendar size={12}/> END DATE</label>
                          <input type="date" value={editingPromo.endDate || ''} onChange={e=>setEditingPromo({...editingPromo, endDate: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl font-black text-xs border-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-400">Promotion Title (English)</label>
                        <input value={editingPromo.title.en} onChange={e=>setEditingPromo({...editingPromo, title: {...editingPromo.title, en: e.target.value}})} className="w-full p-5 bg-gray-50 rounded-2xl font-black uppercase text-xs border-none" placeholder="Summer Super Deal" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400">Value (%, RM...)</label>
                          <input type="number" value={editingPromo.value} onChange={e=>setEditingPromo({...editingPromo, value: Number(e.target.value)})} className="w-full p-5 bg-gray-50 rounded-2xl font-black border-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-gray-400">Duration (Months)</label>
                          <input type="number" value={editingPromo.durationMonths || 0} onChange={e=>setEditingPromo({...editingPromo, durationMonths: Number(e.target.value)})} className="w-full p-5 bg-gray-50 rounded-2xl font-black border-none" />
                        </div>
                      </div>
                   </div>

                   {/* Right: Product Selector */}
                   <div className="space-y-6 flex flex-col">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase text-lg-red tracking-widest flex items-center gap-2"><PackageCheck size={14}/> APPLICABLE PRODUCTS</label>
                        <div className="flex gap-4">
                          <button onClick={() => setEditingPromo({...editingPromo, applicableProductIds: products.map(p => p.id)})} className="text-[9px] font-black uppercase text-gray-400 hover:text-black">Select All</button>
                          <button onClick={() => setEditingPromo({...editingPromo, applicableProductIds: []})} className="text-[9px] font-black uppercase text-gray-400 hover:text-red-500">Clear</button>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                        <input 
                          value={promoProductSearch} 
                          onChange={e => setPromoProductSearch(e.target.value)} 
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-xs font-bold border-none" 
                          placeholder="Quick search products..." 
                        />
                      </div>

                      <div className="flex-1 bg-gray-50 rounded-3xl p-4 overflow-y-auto max-h-[300px] custom-scrollbar grid grid-cols-2 gap-3">
                         {filteredProductsForPromo.map(p => {
                           const isSelected = (editingPromo.applicableProductIds || []).includes(p.id);
                           return (
                             <div 
                               key={p.id} 
                               onClick={() => togglePromoProduct(p.id)}
                               className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 relative ${isSelected ? 'bg-white border-lg-red shadow-md' : 'bg-white/50 border-transparent grayscale opacity-70 hover:opacity-100 hover:grayscale-0'}`}
                             >
                               <div className="w-10 h-10 shrink-0 bg-white rounded-lg p-1 flex items-center justify-center">
                                 <img src={p.image} className="max-h-full object-contain" />
                               </div>
                               <div className="min-w-0">
                                 <p className="text-[9px] font-black uppercase truncate leading-none mb-1">{p.name}</p>
                                 <p className="text-[8px] font-bold text-gray-400 uppercase truncate">SKU: {p.id}</p>
                               </div>
                               {isSelected && <div className="absolute -top-2 -right-2 bg-lg-red text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"><Check size={10} strokeWidth={4}/></div>}
                             </div>
                           );
                         })}
                      </div>
                      <p className="text-[9px] font-bold text-gray-400 text-center uppercase tracking-widest">{editingPromo.applicableProductIds?.length || 0} products selected</p>
                   </div>
                </div>

                <div className="pt-8 border-t border-gray-100">
                  <button onClick={() => {
                      const next = { ...settings, promoTemplates: (settings.promoTemplates || []).some(t => t.id === editingPromo.id) ? settings.promoTemplates.map(t => t.id === editingPromo.id ? editingPromo : t) : [...(settings.promoTemplates || []), editingPromo] };
                      updateSiteSettings(next);
                      setEditingPromo(null);
                  }} className="w-full bg-lg-red text-white py-6 rounded-full font-black uppercase tracking-[0.4em] shadow-xl hover:bg-black transition-all">SAVE & ACTIVATE PROMOTION</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
