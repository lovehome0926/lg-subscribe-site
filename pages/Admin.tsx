
import React, { useState } from 'react';
import { Product, AppConfig, PromoType } from '../types';

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
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white dark:bg-slate-900 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold italic">Admin & DNS Assistant</h2>
          <p className="text-sm text-slate-500">Target: lgsubscribe.biz.my</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleBackup} className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold uppercase">Export</button>
          <label className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold uppercase cursor-pointer">
            Import <input type="file" onChange={handleRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* Final Checklist Assistant */}
      {showDeployGuide && (
        <div className="mb-10 bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <button onClick={() => setShowDeployGuide(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Final Deployment Checklist
            </div>
            
            <h3 className="text-3xl font-black italic">GitHub 设定有关系吗？</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              <strong className="text-white">没有关系。</strong> GitHub 的 Environments 只是用来存放 Secrets 的，不影响域名的解析。只要 Vercel 能正常读取你的代码，GitHub 的工作就完成了。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="size-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-bold text-xs">01</div>
                <p className="font-bold text-xs uppercase tracking-widest">Cloudflare (OK)</p>
                <p className="text-[11px] text-slate-400">你现在的 Cloudflare 设置非常完美。A 记录和 TXT 记录都已经就绪。</p>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3 border-amber-500/50">
                <div className="size-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">02</div>
                <p className="font-bold text-xs uppercase tracking-widest">Vercel (需确认)</p>
                <p className="text-[11px] text-slate-400">请确保在 Vercel Domains 里，主域名是 <span className="text-amber-400">lgsubscribe.biz.my</span> 而不是 <span className="line-through">biz.my</span>。</p>
              </div>

              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-3">
                <div className="size-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs">03</div>
                <p className="font-bold text-xs uppercase tracking-widest">GitHub (Ignore)</p>
                <p className="text-[11px] text-slate-400">GitHub 里的 Environments 设置可以保持默认，不需要改动。</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                 <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span> 
                    Cloudflare IP: 76.76.21.21
                 </span>
                 <span>|</span>
                 <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span> 
                    TXT Name: _vercel
                 </span>
              </div>
              <a href="https://vercel.com/dashboard" target="_blank" className="bg-primary text-white px-8 py-3 rounded-full font-black italic hover:scale-105 transition-all text-sm">OPEN VERCEL DASHBOARD</a>
            </div>
          </div>
        </div>
      )}

      {/* 保持原有的 Admin 功能逻辑 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contact_support</span>
              Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">WhatsApp Number</label>
                <input value={config.contactWhatsapp} onChange={e => onUpdateConfig({...config, contactWhatsapp: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-xl font-bold italic uppercase tracking-tighter">Products</h3>
            <button onClick={addProduct} className="bg-primary text-white px-6 py-2 rounded-full text-xs font-black italic hover:scale-105 transition-all">ADD NEW</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <img src={p.imageUrl} className="size-10 object-contain rounded-lg bg-slate-50 dark:bg-slate-900" />
                  <span className="font-bold text-sm leading-tight">{p.name}</span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingId(p.id)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
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
