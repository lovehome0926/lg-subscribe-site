
import React, { useState } from 'react';
import { Product, AppConfig } from '../types';

interface AdminProps {
  products: Product[];
  config: AppConfig;
  onUpdateProducts: (p: Product[]) => void;
  onUpdateConfig: (c: AppConfig) => void;
}

const Admin: React.FC<AdminProps> = ({ products, config, onUpdateProducts, onUpdateConfig }) => {
  const [activeTab, setActiveTab] = useState<'status' | 'cloudflare'>('status');

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto bg-white dark:bg-slate-900 min-h-screen pb-20 text-slate-900 dark:text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Domain Rescue</h2>
          <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">lgsubscribe.biz.my</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
          <button 
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'status' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400'}`}
          >
            Vercel 状态
          </button>
          <button 
            onClick={() => setActiveTab('cloudflare')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeTab === 'cloudflare' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400'}`}
          >
            Cloudflare 检查
          </button>
        </div>
      </div>

      {activeTab === 'status' ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-500/50 rounded-[2.5rem] p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <span className="material-symbols-outlined text-red-500 text-4xl">domain_disabled</span>
              <h3 className="text-xl font-black uppercase italic">域名验证卡死？</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-red-200 dark:border-red-900/50">
                <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-widest">请在 Vercel 域名设置页面尝试：</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="size-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-[10px] font-bold text-red-600 mt-0.5">1</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      点击 <strong>Remove</strong> 彻底从 Vercel 删除该域名。
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-[10px] font-bold text-red-600 mt-0.5">2</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      重新在输入框输入 <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">lgsubscribe.biz.my</code> 并添加。
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="size-5 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-[10px] font-bold text-red-600 mt-0.5">3</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      系统会再次提示 "Linked to another account"，此时点击那个 <strong>VERIFY</strong> 按钮。
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 animate-pulse">
                  等待 DNS 生效期间，Vercel 页面可能需要 60 秒才能刷新状态
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 border-4 border-amber-500/30">
            <h3 className="text-2xl font-black italic uppercase mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-amber-500">cloud_off</span>
              最关键的一步：关闭小橘灯
            </h3>
            
            <p className="text-sm text-slate-400 mb-10 leading-relaxed">
              Vercel 验证期间，Cloudflare 的 <strong>Proxy (代理)</strong> 功能必须关闭，否则 Vercel 找不到你的服务器。
            </p>

            <div className="space-y-6">
              <div className="p-6 bg-slate-800 rounded-3xl border border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">当前错误状态</span>
                  <div className="flex items-center gap-2 bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold">
                    <span className="size-2 bg-orange-500 rounded-full animate-ping"></span>
                    PROXIED (橙色云)
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  如果你的 A 记录或 CNAME 记录右侧是<strong>橙色云朵</strong>，请点击 Edit，把开关拨到左边，变成<strong>灰色云朵</strong>。
                </p>
              </div>

              <div className="p-6 bg-green-500/10 rounded-3xl border border-green-500/30">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-green-500">验证所需状态</span>
                  <div className="flex items-center gap-2 bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold">
                    <span className="size-2 bg-green-500 rounded-full"></span>
                    DNS ONLY (灰色云)
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  只有变成灰色云朵，Vercel 才能直接穿透 Cloudflare 验证你的域名所有权。
                </p>
              </div>
            </div>

            <div className="mt-10 p-4 bg-white/5 rounded-2xl">
              <p className="text-[10px] text-slate-500 italic">
                * 注意：关于 TXT 记录的引号，请完全忽略它。那是 Cloudflare 的显示方式，不影响验证。
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black italic uppercase text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            我已将云朵改为灰色，去刷新 Vercel
          </button>
        </div>
      )}
    </div>
  );
};

export default Admin;
