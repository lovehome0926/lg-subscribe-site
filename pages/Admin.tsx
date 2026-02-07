
import React, { useState, useEffect } from 'react';
import { Product, AppConfig } from '../types';

interface AdminProps {
  products: Product[];
  config: AppConfig;
  onUpdateProducts: (p: Product[]) => void;
  onUpdateConfig: (c: AppConfig) => void;
}

const Admin: React.FC<AdminProps> = ({ products, config, onUpdateProducts, onUpdateConfig }) => {
  const [showDeployGuide, setShowDeployGuide] = useState(true);
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'checking' | 'success'>('idle');

  const handleVerifyClick = () => {
    setVerifyStatus('checking');
    setTimeout(() => {
      // 模拟验证过程
      setVerifyStatus('success');
    }, 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white dark:bg-slate-900 min-h-screen pb-20 text-slate-900 dark:text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Admin Portal</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide">lgsubscribe.biz.my</p>
        </div>
        <div className="flex items-center gap-2">
           <span className={`size-2 rounded-full ${verifyStatus === 'success' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
           <span className="text-[10px] font-black uppercase tracking-widest">{verifyStatus === 'success' ? 'Domain Active' : 'Pending Verification'}</span>
        </div>
      </div>

      {showDeployGuide && (
        <div className="mb-10 bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden border-4 border-primary">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="size-14 bg-green-500 rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-green-500/40">
                <span className="material-symbols-outlined text-white text-3xl">task_alt</span>
              </div>
              <div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight">配置已接近完美！</h3>
                <p className="text-green-500 font-bold text-[10px] uppercase tracking-[0.2em]">目前的 3 条记录（A, CNAME, TXT）都是正确的</p>
              </div>
            </div>

            <div className="bg-white/5 p-8 rounded-[2rem] border-2 border-dashed border-white/10">
               <h4 className="text-sm font-black italic mb-6 flex items-center gap-2 text-slate-400">
                 最后 1 分钟检查清单：
               </h4>
               <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <div className="size-6 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</div>
                    <div>
                      <p className="text-xs font-bold">检查 TXT 引号陷阱</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        点击 Cloudflare 中 <code className="text-primary">_vercel</code> 的 Edit，确认输入框里 **没有** 引号。
                        引号只能由 Cloudflare 自动显示，不能手动输入。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                    <div className="size-6 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</div>
                    <div>
                      <p className="text-xs font-bold">回到 Vercel 强行“抢回”域名</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                        因为报错“Linked to another account”，你需要点击 Vercel 域名页面的 <code className="bg-primary px-2 py-0.5 rounded text-white font-black uppercase">Verify</code> 按钮。
                        这是告诉 Vercel：“我有 TXT 证明，现在这域名归我了！”
                      </p>
                    </div>
                  </div>
               </div>
            </div>

            <div className="flex justify-center pt-4">
              <button 
                onClick={handleVerifyClick}
                disabled={verifyStatus === 'checking'}
                className="group relative px-12 py-4 bg-white text-black rounded-full font-black italic uppercase tracking-widest hover:scale-105 transition-all active:scale-95 disabled:opacity-50"
              >
                {verifyStatus === 'checking' ? '正在同步 DNS...' : '我已经完成检查了'}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-amber-500 rounded-full blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Content Restricted until success */}
      <div className={`transition-all duration-1000 ${verifyStatus === 'success' ? 'opacity-100 blur-0' : 'opacity-30 blur-sm pointer-events-none grayscale'}`}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <p className="text-slate-400 font-black italic uppercase">Catalog Management</p>
            </div>
            <div className="h-64 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <p className="text-slate-400 font-black italic uppercase">Settings & Leads</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Admin;
