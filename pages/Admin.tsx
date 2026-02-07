
import React, { useState } from 'react';
import { Product, AppConfig } from '../types';

interface AdminProps {
  products: Product[];
  config: AppConfig;
  onUpdateProducts: (p: Product[]) => void;
  onUpdateConfig: (c: AppConfig) => void;
}

const Admin: React.FC<AdminProps> = ({ products, config, onUpdateProducts, onUpdateConfig }) => {
  const [activeTab, setActiveTab] = useState<'vercel' | 'txt_guide' | 'cloudflare_tabs'>('txt_guide');

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-white dark:bg-slate-900 min-h-screen pb-20 text-slate-900 dark:text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Domain Rescue</h2>
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">解决 "Linked to another account" 问题</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
          <button 
            onClick={() => setActiveTab('txt_guide')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'txt_guide' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400'}`}
          >
            最重要：添加 TXT 记录
          </button>
          <button 
            onClick={() => setActiveTab('vercel')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'vercel' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400'}`}
          >
            Vercel 验证
          </button>
        </div>
      </div>

      {activeTab === 'txt_guide' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-500/50 rounded-[2.5rem] p-8 md:p-10">
            <h3 className="text-xl font-black uppercase italic mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500">priority_high</span>
              Vercel 提示 "Linked to another account"？
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              这是因为 Vercel 需要你证明你真的拥有这个域名。请在 Cloudflare 的 <strong>Records</strong> 页面添加这条记录：
            </p>

            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type (类型)</label>
                  <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 rounded-xl font-mono text-sm text-primary font-bold">TXT</div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Name (名称)</label>
                  <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 rounded-xl font-mono text-sm text-slate-700 dark:text-slate-300">_vercel</div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">TTL</label>
                  <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 rounded-xl font-mono text-sm text-slate-400 italic">Auto / 3600</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Content / Value (内容/值)</label>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-4 rounded-xl font-mono text-[11px] text-amber-700 dark:text-amber-400 break-all">
                  从 Vercel 错误提示中复制那串以 vc-domain-verify= 开头的代码，粘贴到这里
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white">
              <p className="text-xs font-light leading-relaxed">
                <span className="font-bold text-amber-400">注意：</span> 添加完这条 TXT 记录后，请等待 1 分钟，然后点击 Vercel 页面上的黑色 <strong>Verify</strong> 按钮。
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-primary text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-primary/20 text-center">
            <h3 className="text-3xl font-black italic uppercase mb-6">最后一步</h3>
            <p className="text-sm text-white/80 mb-10 max-w-md mx-auto">
              只要 Cloudflare 里的 TXT 记录添加成功了，点击 Vercel 里的这个按钮，你的网站就会立刻上线。
            </p>
            <div className="inline-block bg-black px-16 py-4 rounded-xl font-black text-lg hover:scale-105 transition-all cursor-pointer shadow-xl">
              VERIFY
            </div>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">lgsubscribe.biz.my</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
