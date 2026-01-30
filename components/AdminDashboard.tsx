
import React, { useState } from 'react';
import { Product, Language, SiteSettings } from '../types';

/* Define the props interface for AdminDashboard to resolve property errors from App.tsx */
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

/* Reconstruct AdminDashboard with proper state management and compliance with Gemini API guidelines */
const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, setProducts, categories, setCategories, language, brandingLogo, updateBrandingLogo, brandingHero, updateBrandingHero, siteSettings, updateSiteSettings, onReset
}) => {
  /* Initialize missing state variables to resolve 'Cannot find name' errors */
  const [activeView, setActiveView] = useState<'products' | 'backup'>('products');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'recruitment' | 'stores' | 'contact'>('recruitment');

  return (
    <div className="container mx-auto px-6 py-24 max-w-7xl fade-in text-gray-900">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveView('products')} 
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'products' ? 'bg-black text-white' : 'text-gray-400'}`}
            >
              Inventory
            </button>
            <button 
              onClick={() => setActiveView('backup')} 
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'backup' ? 'bg-black text-white' : 'text-gray-400'}`}
            >
              Backup & Sync
            </button>
            <button 
              onClick={() => setShowSettingsModal(true)} 
              className="px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
      
      {activeView === 'products' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">Inventory Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <h3 className="font-black text-gray-950">{p.name}</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.category}</p>
                </div>
                <div className="text-xs font-black text-lg-red">RM{p.promoPrice}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'backup' && (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
           <div className="bg-white p-12 rounded-[50px] shadow-2xl border border-gray-100 text-center space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Data Management</h2>
              <div className="grid grid-cols-1 gap-4">
                 <button onClick={onReset} className="bg-blue-600 text-white py-6 rounded-3xl font-black uppercase text-[11px] shadow-lg hover:bg-blue-700 transition">Sync from Master (GitHub)</button>
                 <button onClick={() => {
                   const data = products;
                   const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a'); a.href = url; a.download = `products-for-constants.json`; a.click();
                 }} className="bg-gray-100 text-gray-500 py-6 rounded-3xl font-black uppercase text-[11px] hover:bg-gray-200 transition">Export for constants.ts</button>
              </div>
           </div>
        </div>
      )}

      {/* Settings Modal with API management removed as per strictly prohibited guidelines */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-5xl rounded-[60px] shadow-3xl overflow-hidden flex flex-col max-h-[95vh]">
             <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div className="flex gap-4 overflow-x-auto">
                   {['recruitment', 'stores', 'contact'].map(t => (
                     <button 
                       key={t} 
                       onClick={() => setSettingsTab(t as any)} 
                       className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === t ? 'bg-black text-white' : 'text-gray-400'}`}
                     >
                       {t}
                     </button>
                   ))}
                </div>
                <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-black font-black text-xl px-4">✕</button>
             </div>
             <div className="p-12 overflow-y-auto space-y-12 custom-scrollbar">
                {settingsTab === 'recruitment' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-black uppercase">Recruitment Info</h4>
                    <p className="text-gray-500">Recruitment configuration options would be here.</p>
                  </div>
                )}
                {settingsTab === 'stores' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-black uppercase">Store Locations</h4>
                    <p className="text-gray-500">Store location management would be here.</p>
                  </div>
                )}
                {settingsTab === 'contact' && (
                  <div className="space-y-6">
                    <h4 className="text-xl font-black uppercase">Contact Details</h4>
                    <p className="text-gray-500">General contact settings would be here.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* Export default to satisfy App.tsx import requirements */
export default AdminDashboard;
