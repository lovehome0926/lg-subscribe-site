
import React, { useState } from 'react';
import { Product, AppConfig } from '../types';

interface AdminProps {
  products: Product[];
  config: AppConfig;
  onUpdateProducts: (p: Product[]) => void;
  onUpdateConfig: (c: AppConfig) => void;
}

const Admin: React.FC<AdminProps> = ({ products, config, onUpdateProducts, onUpdateConfig }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeployGuide, setShowDeployGuide] = useState(true);

  const handleBackup = () => {
    const data = JSON.stringify({ products, config }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lg_subscribe_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products && data.config) {
          onUpdateProducts(data.products);
          onUpdateConfig(data.config);
          alert('Restore successful!');
        }
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const addProduct = () => {
    const newP: Product = {
      id: Date.now().toString(),
      name: 'New Product',
      modelCode: 'LG-MODEL-XXX',
      category: 'Appliances',
      outrightPrice: 2000,
      plans: [{ name: '5 Years Plan', monthlyPrice: 80 }],
      imageUrl: 'https://picsum.photos/seed/new/600/600',
      description: 'New product description'
    };
    onUpdateProducts([...products, newP]);
    setEditingId(newP.id);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    onUpdateProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    if (confirm('Are you sure?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white dark:bg-slate-900 min-h-screen pb-20 text-slate-900 dark:text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Admin Portal</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide">lgsubscribe.biz.my</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleBackup} className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Export</button>
          <label className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-200 transition-colors">
            Import <input type="file" onChange={handleRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* Specific Verification Troubleshooter */}
      {showDeployGuide && (
        <div className="mb-10 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-500 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <button onClick={() => setShowDeployGuide(false)} className="absolute top-8 right-8 text-blue-600 hover:text-blue-800 transition-colors">
            <span className="material-symbols-outlined font-bold">close</span>
          </button>

          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Security Ownership Verification
            </div>
            
            <h3 className="text-3xl font-black italic text-blue-900 dark:text-blue-100 leading-tight">由于域名冲突，需完成以下两步</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* CNAME Update */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                   <span className="size-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                   更新 CNAME 记录 (专属目标)
                </p>
                <div className="bg-white/80 dark:bg-black/40 p-5 rounded-2xl border border-blue-200 space-y-3 shadow-sm">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target / Value</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-blue-50 dark:bg-blue-900/40 p-2 rounded text-[11px] font-mono text-blue-600 flex-1 break-all">f1c34f84b29571e7.vercel-dns-017.com</code>
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-600 font-bold">注意：Proxy status 必须保持灰色 ☁️</p>
                </div>
              </div>

              {/* TXT Record */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                   <span className="size-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                   新增 TXT 验证记录 (证明所有权)
                </p>
                <div className="bg-white/80 dark:bg-black/40 p-5 rounded-2xl border border-blue-200 space-y-3 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</p>
                      <code className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-[11px] block">_vercel</code>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                      <code className="bg-slate-100 dark:bg-slate-800 p-2 rounded text-[11px] block">TXT</code>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content / Value</p>
                    <code className="bg-blue-50 dark:bg-blue-900/40 p-2 rounded text-[11px] block break-all font-mono text-blue-600">vc-domain-verify=lgsubscribe.biz.my,6ac1a6e7fa0b76ef0754</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-white/20">
              <span className="material-symbols-outlined text-blue-500">info</span>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">
                完成这两条设置后，回到 Vercel 点击 "Refresh"。验证通过后，红色警告就会消失，网站立即生效。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin UI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings</span>
              Settings
            </h3>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-[0.2em]">WhatsApp Number</label>
              <input 
                value={config.contactWhatsapp} 
                onChange={e => onUpdateConfig({...config, contactWhatsapp: e.target.value})} 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6 px-2">
             <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Inventory Management</h3>
             <button onClick={addProduct} className="bg-primary text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">ADD PRODUCT</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-slate-50 dark:bg-slate-900 p-2 flex items-center justify-center">
                    <img src={p.imageUrl} className="max-w-full max-h-full object-contain" alt={p.name} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">{p.modelCode}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingId(p.id)} className="size-8 flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="size-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
