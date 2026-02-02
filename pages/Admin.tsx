
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
          <h2 className="text-2xl font-bold">Admin Portal</h2>
          <p className="text-sm text-slate-500">Manage site content and deployment status</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleBackup} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-sm">download</span> Backup
          </button>
          <label className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-2 hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-sm">upload</span> Restore
            <input type="file" onChange={handleRestore} className="hidden" accept=".json" />
          </label>
        </div>
      </div>

      {/* Domain Verification Help Panel */}
      {showDeployGuide && (
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6 relative">
          <button 
            onClick={() => setShowDeployGuide(false)}
            className="absolute top-4 right-4 text-blue-400 hover:text-blue-600"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <span className="material-symbols-outlined">domain_verification</span>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200">域名验证助手 (biz.my)</h3>
              <p className="text-sm text-blue-800/80 dark:text-blue-300/80 max-w-2xl">
                如果 Vercel 提示 <b>"Linked to another account"</b>，这是因为该域名曾被其他账号使用。你必须在 Cloudflare 添加以下记录来证明所有权：
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm font-mono bg-white/50 dark:bg-black/20 p-2 rounded">
                  <span className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">TXT</span>
                  <span>_vercel</span>
                  <span className="text-blue-600 dark:text-blue-400">vc-domain-verify=biz.my,...</span>
                </li>
                <li className="flex items-center gap-2 text-sm font-mono bg-white/50 dark:bg-black/20 p-2 rounded">
                  <span className="bg-blue-100 dark:bg-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">A</span>
                  <span>@</span>
                  <span className="text-blue-600 dark:text-blue-400">76.76.21.21 (Cloudflare 云朵必须变灰)</span>
                </li>
              </ul>
              <div className="pt-2">
                <a 
                  href="https://www.whatsmydns.net/#TXT/_vercel.biz.my" 
                  target="_blank" 
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">open_in_new</span> 点击检查 TXT 记录是否全球生效
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Site Config */}
        <section className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">palette</span>
            <h3 className="text-lg font-bold">Branding & Contact</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Logo URL</label>
              <input value={config.logoUrl} onChange={e => onUpdateConfig({...config, logoUrl: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">Hero Image URL</label>
              <input value={config.heroImageUrl} onChange={e => onUpdateConfig({...config, heroImageUrl: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1 uppercase tracking-widest">WhatsApp Number (e.g. 60123...)</label>
              <input value={config.contactWhatsapp} onChange={e => onUpdateConfig({...config, contactWhatsapp: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
          </div>
        </section>

        {/* Product List */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
              <h3 className="text-lg font-bold">Live Catalog</h3>
            </div>
            <button onClick={addProduct} className="bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-primary/20 transition-all">+ Add Product</button>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {products.map(p => (
              <div key={p.id} className="border border-slate-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between bg-white dark:bg-slate-800/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-14 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden p-1">
                    <img src={p.imageUrl} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">{p.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{p.modelCode}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingId(p.id)} className="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black italic">EDIT PRODUCT</h3>
              <button onClick={() => setEditingId(null)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {products.find(p => p.id === editingId) && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Product Name</label>
                    <input value={products.find(p => p.id === editingId)?.name} onChange={e => updateProduct(editingId, {name: e.target.value})} className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Model Code</label>
                    <input value={products.find(p => p.id === editingId)?.modelCode} onChange={e => updateProduct(editingId, {modelCode: e.target.value})} className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Description</label>
                  <textarea value={products.find(p => p.id === editingId)?.description} onChange={e => updateProduct(editingId, {description: e.target.value})} className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-2xl dark:bg-slate-800 min-h-[120px] outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <p className="font-bold mb-4 text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">sell</span> Promotion Engine
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Promo Type</label>
                      <select 
                        value={products.find(p => p.id === editingId)?.promo?.type || 'none'} 
                        onChange={e => updateProduct(editingId, {promo: {...(products.find(p => p.id === editingId)?.promo || {type: 'none', value: 0}), type: e.target.value as PromoType}})}
                        className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="none">No Active Promo</option>
                        <option value="half_price">50% Off First N Months</option>
                        <option value="percentage">Percentage Discount</option>
                        <option value="fixed_price">Fixed Monthly Fee</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Value / Months</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          placeholder="Value" 
                          value={products.find(p => p.id === editingId)?.promo?.value} 
                          onChange={e => updateProduct(editingId, {promo: {...(products.find(p => p.id === editingId)?.promo || {type: 'none', value: 0}), value: Number(e.target.value)}})}
                          className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm" 
                        />
                        <input 
                          type="number" 
                          placeholder="Duration" 
                          value={products.find(p => p.id === editingId)?.promo?.months} 
                          onChange={e => updateProduct(editingId, {promo: {...(products.find(p => p.id === editingId)?.promo || {type: 'none', value: 0}), months: Number(e.target.value)}})}
                          className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button onClick={() => setEditingId(null)} className="w-full bg-primary text-white py-5 rounded-2xl font-black italic shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">SAVE ALL CHANGES</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
