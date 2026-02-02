
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
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white dark:bg-slate-900 min-h-screen">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold">Admin Portal</h2>
        <div className="flex gap-4">
          <button onClick={handleBackup} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span> Backup
          </button>
          <label className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-sm cursor-pointer flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">upload</span> Restore
            <input type="file" onChange={handleRestore} className="hidden" accept=".json" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Site Config */}
        <section className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4">Site Branding</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">LOGO URL</label>
              <input value={config.logoUrl} onChange={e => onUpdateConfig({...config, logoUrl: e.target.value})} className="w-full p-2 rounded border bg-white dark:bg-slate-900 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">HERO IMAGE URL</label>
              <input value={config.heroImageUrl} onChange={e => onUpdateConfig({...config, heroImageUrl: e.target.value})} className="w-full p-2 rounded border bg-white dark:bg-slate-900 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">CONTACT WHATSAPP (eg. 60123...)</label>
              <input value={config.contactWhatsapp} onChange={e => onUpdateConfig({...config, contactWhatsapp: e.target.value})} className="w-full p-2 rounded border bg-white dark:bg-slate-900 text-sm" />
            </div>
          </div>
        </section>

        {/* Product List */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Manage Products</h3>
            <button onClick={addProduct} className="text-primary text-sm font-bold">+ Add Product</button>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {products.map(p => (
              <div key={p.id} className="border dark:border-slate-700 p-4 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <img src={p.imageUrl} className="size-12 rounded object-cover" />
                  <div>
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.modelCode}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(p.id)} className="p-2 text-blue-500"><span className="material-symbols-outlined">edit</span></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2 text-red-500"><span className="material-symbols-outlined">delete</span></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-6">
              <h3 className="text-xl font-bold">Edit Product</h3>
              <button onClick={() => setEditingId(null)} className="material-symbols-outlined">close</button>
            </div>
            
            {products.find(p => p.id === editingId) && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Name" value={products.find(p => p.id === editingId)?.name} onChange={e => updateProduct(editingId, {name: e.target.value})} className="p-3 border rounded-xl dark:bg-slate-800" />
                  <input placeholder="Model Code" value={products.find(p => p.id === editingId)?.modelCode} onChange={e => updateProduct(editingId, {modelCode: e.target.value})} className="p-3 border rounded-xl dark:bg-slate-800" />
                </div>
                
                <textarea placeholder="Description" value={products.find(p => p.id === editingId)?.description} onChange={e => updateProduct(editingId, {description: e.target.value})} className="w-full p-3 border rounded-xl dark:bg-slate-800 min-h-[100px]" />
                
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <p className="font-bold mb-3 text-sm">Promotion Settings</p>
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      value={products.find(p => p.id === editingId)?.promo?.type || 'none'} 
                      onChange={e => updateProduct(editingId, {promo: {...(products.find(p => p.id === editingId)?.promo || {type: 'none', value: 0}), type: e.target.value as PromoType}})}
                      className="p-2 border rounded-lg bg-white dark:bg-slate-900"
                    >
                      <option value="none">No Promo</option>
                      <option value="half_price">50% Off (First N Months)</option>
                      <option value="percentage">N% Discount</option>
                      <option value="fixed_price">Fixed Monthly Price</option>
                    </select>
                    <input 
                      type="number" 
                      placeholder="Value" 
                      value={products.find(p => p.id === editingId)?.promo?.value} 
                      onChange={e => updateProduct(editingId, {promo: {...(products.find(p => p.id === editingId)?.promo || {type: 'none', value: 0}), value: Number(e.target.value)}})}
                      className="p-2 border rounded-lg bg-white dark:bg-slate-900" 
                    />
                    <input 
                      type="number" 
                      placeholder="Months Duration" 
                      value={products.find(p => p.id === editingId)?.promo?.months} 
                      onChange={e => updateProduct(editingId, {promo: {...(products.find(p => p.id === editingId)?.promo || {type: 'none', value: 0}), months: Number(e.target.value)}})}
                      className="p-2 border rounded-lg bg-white dark:bg-slate-900" 
                    />
                    <input 
                      type="date" 
                      value={products.find(p => p.id === editingId)?.promo?.endDate} 
                      onChange={e => updateProduct(editingId, {promo: {...(products.find(p => p.id === editingId)?.promo || {type: 'none', value: 0}), endDate: e.target.value}})}
                      className="p-2 border rounded-lg bg-white dark:bg-slate-900" 
                    />
                  </div>
                </div>

                <button onClick={() => setEditingId(null)} className="w-full bg-primary text-white py-4 rounded-2xl font-bold">Save Changes</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
