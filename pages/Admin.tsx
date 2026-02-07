
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white dark:bg-slate-900 min-h-screen pb-20 text-slate-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold italic uppercase tracking-tighter">Admin Portal</h2>
          <p className="text-xs text-slate-500 font-medium">Domain: lgsubscribe.biz.my</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleBackup} className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Export</button>
          <label className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-200 transition-colors">
            Import <input type="file" onChange={handleRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* Improved DNS Assistant for CNAME */}
      {showDeployGuide && (
        <div className="mb-10 bg-indigo-50 dark:bg-indigo-950/30 border-2 border-indigo-500 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <button onClick={() => setShowDeployGuide(false)} className="absolute top-8 right-8 text-indigo-600 hover:text-indigo-800 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              DNS Optimization Guide
            </div>
            
            <h3 className="text-3xl font-black italic text-indigo-900 dark:text-indigo-100 leading-tight">使用 CNAME 解决验证问题</h3>
            
            <div className="bg-white/80 dark:bg-black/40 p-6 rounded-3xl border border-indigo-200 dark:border-indigo-800 space-y-6">
              <p className="text-sm leading-relaxed text-indigo-900 dark:text-indigo-100">
                对于 <code className="bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded">lgsubscribe</code> 这种子域名，请按照以下参数修改 Cloudflare 记录：
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-indigo-100/50 dark:bg-indigo-900/50 border border-indigo-200/50">
                   <p className="text-[10px] font-black uppercase text-indigo-500 mb-3 tracking-widest">修改 CNAME 记录</p>
                   <ul className="text-xs space-y-2 font-medium text-slate-700 dark:text-slate-300">
                     <li>• <strong>Type:</strong> <span className="bg-white dark:bg-slate-800 px-1.5 rounded border border-indigo-200">CNAME</span></li>
                     <li>• <strong>Name:</strong> <span className="bg-white dark:bg-slate-800 px-1.5 rounded border border-indigo-200">lgsubscribe</span></li>
                     <li>• <strong>Target:</strong> <span className="bg-white dark:bg-slate-800 px-1.5 rounded border border-indigo-200">cname.vercel-dns.com</span></li>
                   </ul>
                </div>
                
                <div className="p-5 rounded-2xl bg-amber-100/50 dark:bg-amber-900/50 border border-amber-200/50">
                   <p className="text-[10px] font-black uppercase text-amber-600 mb-3 tracking-widest">关键一步：灰色云朵</p>
                   <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                     在 Proxy status 栏，点击那个橘色云朵把它变成 <strong>DNS Only (灰色)</strong> ☁️。<br/>
                     Vercel 只有直接看到这条记录才能完成验证。
                   </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white/40 dark:bg-black/20 rounded-2xl border border-white/20">
              <span className="material-symbols-outlined text-indigo-500">lightbulb</span>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                修改完成后，在 Vercel 域名页面点击 "Refresh" 按钮。一旦显示绿色的 "Valid Configuration"，你就可以把云朵点回橘色开启防御了。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Product Management Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings</span>
              Global Config
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-[0.2em]">WhatsApp Number</label>
                <input 
                  value={config.contactWhatsapp} 
                  onChange={e => onUpdateConfig({...config, contactWhatsapp: e.target.value})} 
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Live Inventory</h3>
            <button onClick={addProduct} className="bg-primary text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20">ADD NEW PRODUCT</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-slate-50 dark:bg-slate-900 p-2 flex items-center justify-center">
                    <img src={p.imageUrl} className="max-w-full max-h-full object-contain" alt={p.name} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight group-hover:text-primary transition-colors">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1">{p.modelCode}</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingId(p.id)} className="size-8 flex items-center justify-center text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="size-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 max-w-lg w-full shadow-2xl border border-white/5 animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black italic uppercase">Edit Details</h3>
               <button onClick={() => setEditingId(null)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                  <input 
                    value={products.find(p => p.id === editingId)?.name} 
                    onChange={e => updateProduct(editingId, {name: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 dark:bg-slate-800 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Product Name"
                  />
                </div>
                <button onClick={() => setEditingId(null)} className="w-full bg-primary text-white py-4 rounded-2xl font-black italic tracking-widest shadow-xl shadow-primary/30 hover:brightness-110 active:scale-[0.98] transition-all">
                  CONFIRM CHANGES
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
