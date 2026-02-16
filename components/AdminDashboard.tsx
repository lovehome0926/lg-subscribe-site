
import React, { useState } from 'react';
import { Product, Agent, CategoryItem, Language, SiteSettings, PromotionTemplate } from '../types.ts';
import { 
  Plus, Trash2, Edit2, Save, X, Ticket, 
  Settings, Users, Package, RefreshCw, 
  Image as ImageIcon, Globe, MapPin, 
  Phone, Mail, Facebook, Instagram, Music2 
} from 'lucide-react';

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
  products,
  setProducts,
  authorizedAgents,
  setAuthorizedAgents,
  categories,
  language,
  siteSettings,
  updateSiteSettings,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'agents' | 'settings' | 'promos'>('products');
  const [editingPromo, setEditingPromo] = useState<PromotionTemplate | null>(null);

  const handleUpdateSettings = (key: keyof SiteSettings, value: any) => {
    updateSiteSettings({ ...siteSettings, [key]: value });
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-gray-950">
            System <span className="text-lg-red">Terminal.</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your digital showroom ecosystem</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onReset} className="bg-white border border-gray-200 text-gray-400 px-6 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-rose-50 hover:text-lg-red transition-all flex items-center gap-2 shadow-sm">
            <RefreshCw size={14}/> Wipe Database
          </button>
        </div>
      </div>

      <div className="flex bg-white p-2 rounded-[30px] shadow-xl mb-12 overflow-x-auto no-scrollbar">
        {[
          { id: 'products', label: 'Products', icon: <Package size={16}/> },
          { id: 'promos', label: 'Promotions', icon: <Ticket size={16}/> },
          { id: 'agents', label: 'Partners', icon: <Users size={16}/> },
          { id: 'settings', label: 'Site Config', icon: <Settings size={16}/> }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[120px] py-4 rounded-[20px] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all ${activeTab === tab.id ? 'bg-lg-red text-white shadow-lg-red/20 shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[50px] p-8 md:p-12 shadow-2xl border border-gray-100 min-h-[500px]">
        {activeTab === 'promos' && (
          <div className="space-y-12 animate-fade-up">
            <div className="flex justify-between items-center border-b pb-8 border-gray-100">
               <div>
                 <h2 className="text-2xl font-black uppercase italic tracking-tight">Active Campaigns</h2>
                 <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Configure global product discounts</p>
               </div>
               {/* 修复创建促销时的初始化逻辑 */}
               <button onClick={() => setEditingPromo({ 
                id: `PR-${Date.now()}`, 
                type: 'percentage', 
                title: {en:'',cn:'',ms:''}, // 初始化三语对象
                applicableProductIds: [], 
                value: 0, 
                endDate: '', 
                content: {en:'',cn:'',ms:''}, 
                color: 'rose' 
              })} className="bg-lg-red text-white px-10 py-5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
                <Ticket size={16}/> Create Promo
              </button>
            </div>

            <div className="grid gap-6">
              {(siteSettings.promoTemplates || []).length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
                   <p className="text-gray-300 font-black uppercase tracking-widest text-xs italic">No active promotions found.</p>
                </div>
              ) : (
                (siteSettings.promoTemplates || []).map(promo => (
                  <div key={promo.id} className="p-8 bg-gray-50 rounded-[35px] flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-100">
                     <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl bg-${promo.color}-500 flex items-center justify-center text-white shadow-lg`}>
                           <Ticket size={24}/>
                        </div>
                        <div>
                           <p className="text-gray-950 font-black uppercase tracking-tight italic text-lg">{promo.title[language] || 'Promotion'}</p>
                           <p className="text-gray-400 font-bold text-[9px] uppercase tracking-[0.2em]">{promo.type} • {promo.applicableProductIds.length} Products</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => {
                         const next = siteSettings.promoTemplates.filter(t => t.id !== promo.id);
                         handleUpdateSettings('promoTemplates', next);
                       }}
                       className="w-12 h-12 rounded-full flex items-center justify-center text-gray-300 hover:bg-rose-50 hover:text-lg-red transition-all"
                     >
                       <Trash2 size={18}/>
                     </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Basic placeholders for other tabs to prevent empty state */}
        {activeTab === 'products' && <div className="text-center py-20 text-gray-400 uppercase font-black tracking-widest italic text-xs">Product Management Panel (Simulated)</div>}
        {activeTab === 'agents' && <div className="text-center py-20 text-gray-400 uppercase font-black tracking-widest italic text-xs">Partner Management Panel (Simulated)</div>}
        {activeTab === 'settings' && <div className="text-center py-20 text-gray-400 uppercase font-black tracking-widest italic text-xs">Site Config Panel (Simulated)</div>}
      </div>

      {editingPromo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-lg-dark/60 backdrop-blur-md p-6">
           <div className="bg-white w-full max-w-2xl rounded-[50px] p-12 shadow-3xl space-y-10 animate-fade-up border border-white/20">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter">Campaign Configuration</h3>
                 <button onClick={() => setEditingPromo(null)} className="text-gray-300 hover:text-lg-red"><X size={24}/></button>
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Title (EN)</label>
                    <input 
                      value={editingPromo.title.en} 
                      onChange={e => setEditingPromo({...editingPromo, title: {...editingPromo.title, en: e.target.value}})}
                      className="w-full p-6 bg-gray-50 rounded-3xl outline-none font-bold italic" 
                      placeholder="e.g. YEAR END SALE"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Discount Value (%)</label>
                    <input 
                      type="number"
                      value={editingPromo.value} 
                      onChange={e => setEditingPromo({...editingPromo, value: Number(e.target.value)})}
                      className="w-full p-6 bg-gray-50 rounded-3xl outline-none font-black italic" 
                    />
                 </div>
              </div>

              <button 
                onClick={() => {
                  const next = [...(siteSettings.promoTemplates || []), editingPromo];
                  handleUpdateSettings('promoTemplates', next);
                  setEditingPromo(null);
                }}
                className="w-full bg-black text-white py-8 rounded-full font-black uppercase tracking-[0.4em] text-xs hover:bg-lg-red shadow-2xl transition-all"
              >
                Launch Campaign
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
