
import React, { useState } from 'react';
import { Product, AppConfig } from '../types';

interface AdminProps {
  products: Product[];
  config: AppConfig;
  onUpdateProducts: (p: Product[]) => void;
  onUpdateConfig: (c: AppConfig) => void;
}

const Admin: React.FC<AdminProps> = ({ products, config, onUpdateProducts, onUpdateConfig }) => {
  const [showDeployGuide, setShowDeployGuide] = useState(true);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white dark:bg-slate-900 min-h-screen pb-20 text-slate-900 dark:text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Admin Portal</h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide">lgsubscribe.biz.my</p>
        </div>
      </div>

      {/* DNS TROUBLESHOOTER BASED ON SCREENSHOT */}
      {showDeployGuide && (
        <div className="mb-10 bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden border-4 border-primary">
          <div className="relative z-10 space-y-8">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-primary rounded-full flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-white">dns</span>
              </div>
              <div>
                <h3 className="text-2xl font-black italic uppercase">DNS 配置最终修正案</h3>
                <p className="text-slate-400 text-xs font-bold tracking-widest uppercase">根据你的 Cloudflare 截图定制</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Correction 1 */}
              <div className="bg-white/5 p-6 rounded-3xl border border-red-500/30">
                <p className="text-[10px] font-black text-red-500 uppercase mb-3">1. 必须删除的记录</p>
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 mb-3">
                   <p className="text-xs font-bold text-red-200">CNAME: lgsubscribe</p>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  截图中的这条记录会导致解析冲突。你的 A 记录已经指向了 Vercel，这条多余的 CNAME 必须删掉。
                </p>
              </div>

              {/* Correction 2 */}
              <div className="bg-white/5 p-6 rounded-3xl border border-green-500/30">
                <p className="text-[10px] font-black text-green-500 uppercase mb-3">2. 验证所有权 (找回域名)</p>
                <div className="space-y-2">
                  <div className="p-2 bg-black/40 rounded-lg border border-white/10 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Name:</span>
                    <code className="text-green-400 font-bold text-xs">_vercel</code>
                  </div>
                  <div className="p-2 bg-black/40 rounded-lg border border-white/10 overflow-hidden">
                    <p className="text-[10px] text-slate-500 mb-1">Content (确保无双引号):</p>
                    <code className="text-green-400 text-[9px] block truncate">vc-domain-verify=lgsubscribe.biz.my,6ac1a6e7fa0b76ef0754</code>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                  Vercel 提示“Linked to another account”是因为这个域名在别处用过。添加这条 TXT 记录后，点击 Vercel 的 <strong>Verify</strong> 即可强行迁入。
                </p>
              </div>

              {/* Correction 3 */}
              <div className="bg-white/5 p-6 rounded-3xl border border-blue-500/30">
                <p className="text-[10px] font-black text-blue-500 uppercase mb-3">3. 检查 A 记录</p>
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                   <p className="text-xs font-bold text-blue-200">A @ 76.76.21.21</p>
                </div>
                <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
                  截图中的 A 记录是正确的。只需确保它的 <strong>Proxy Status</strong> 保持为 <strong>DNS Only (灰云)</strong>。
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/10">
              <div className="text-xs text-slate-400 italic">
                完成修改后，请在 Vercel 仪表盘点击 <strong>"Refresh"</strong> 或 <strong>"Verify"</strong>。
              </div>
              <button 
                onClick={() => setShowDeployGuide(false)}
                className="bg-white text-black px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
              >
                我已经改好了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory UI Placeholder */}
      <div className="opacity-40 pointer-events-none">
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center border-4 border-dashed border-slate-200 dark:border-slate-700">
           <p className="text-slate-400 font-black italic uppercase">Inventory Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
