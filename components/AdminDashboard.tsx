import React, { useState } from 'react';
import { Product, Agent, SiteSettings, Language } from '../types';
import { Plus, Trash2, Link, Users, Package, Sparkles, Copy, Check, ShieldCheck, X } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  setProducts: (p: Product[]) => Promise<void>;
  authorizedAgents: Agent[];
  setAuthorizedAgents: (a: Agent[]) => Promise<void>;
  categories: string[];
  language: Language;
  siteSettings: SiteSettings;
  updateSiteSettings: (s: SiteSettings) => void;
  onReset: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, authorizedAgents, setAuthorizedAgents 
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'agents' | 'ai'>('inventory');
  const [newAgent, setNewAgent] = useState({ name: '', wa: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const addAgent = async () => {
    if (!newAgent.name || !newAgent.wa) return alert("请填写完整资料");
    const cleanWa = newAgent.wa.replace(/\D/g, '');
    if (authorizedAgents.some(a => a.whatsapp === cleanWa)) return alert("该号码已在授权名单中");
    
    const agent: Agent = { id: Date.now().toString(), name: newAgent.name, whatsapp: cleanWa };
    await setAuthorizedAgents([...authorizedAgents, agent]);
    setNewAgent({ name: '', wa: '' });
  };

  const removeAgent = async (wa: string) => {
    if (confirm("🚨 警告：撤销授权后，该代理的所有推广链接将立即失效。确定继续吗？")) {
      await setAuthorizedAgents(authorizedAgents.filter(a => a.whatsapp !== wa));
    }
  };

  const copyLink = (agent: Agent) => {
    // 生成带专属参数的推广链接
    const link = `${window.location.origin}${window.location.pathname}?wa=${agent.whatsapp}#home`;
    navigator.clipboard.writeText(link);
    setCopiedId(agent.whatsapp);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white min-h-screen pt-28">
      {/* 顶部导航 */}
      <div className="bg-lg-dark text-white py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-4xl font-black uppercase tracking-tighter">终端管理控制台</h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">LG Subscribe Digital Hub Admin</p>
          </div>
          <div className="flex bg-white/5 p-1.5 rounded-full backdrop-blur-md border border-white/5">
            <button onClick={() => setActiveTab('inventory')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-lg-red text-white' : 'text-gray-400 hover:text-white'}`}>产品库存</button>
            <button onClick={() => setActiveTab('agents')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'agents' ? 'bg-lg-red text-white' : 'text-gray-400 hover:text-white'}`}>代理授权 ({authorizedAgents.length})</button>
            <button onClick={() => setActiveTab('ai')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ai' ? 'bg-lg-red text-white' : 'text-gray-400 hover:text-white'}`}>AI 抓取</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        {activeTab === 'agents' && (
          <div className="grid lg:grid-cols-3 gap-16 animate-fade-up">
            {/* 授权表单 */}
            <div className="lg:col-span-1 bg-gray-50 p-10 rounded-[40px] border border-gray-100 space-y-10 h-fit sticky top-32">
              <div className="flex items-center gap-4 border-b pb-6 border-gray-200">
                <Users className="text-lg-red" size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight">发放新授权</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">下线姓名</label>
                  <input 
                    value={newAgent.name} 
                    onChange={e => setNewAgent({...newAgent, name: e.target.value})} 
                    className="w-full p-5 rounded-3xl bg-white border border-gray-100 outline-none focus:border-lg-red transition-all font-bold placeholder:text-gray-200" 
                    placeholder="例如: Agent Alex" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">WhatsApp (601xxxx)</label>
                  <input 
                    value={newAgent.wa} 
                    onChange={e => setNewAgent({...newAgent, wa: e.target.value})} 
                    className="w-full p-5 rounded-3xl bg-white border border-gray-100 outline-none focus:border-lg-red transition-all font-bold placeholder:text-gray-200" 
                    placeholder="60177473787" 
                  />
                </div>
                <button 
                  onClick={addAgent} 
                  className="w-full bg-lg-red text-white py-5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                >
                  <Plus size={16}/> 确认授权并记录
                </button>
              </div>
              <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed text-center">只有在此列表中的代理，其推广链接才具备咨询跳转功能。</p>
            </div>

            {/* 授权列表 */}
            <div className="lg:col-span-2 space-y-8">
              <h3 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                已授权推广名单 <span className="text-sm bg-gray-100 px-4 py-1.5 rounded-full text-gray-400">{authorizedAgents.length}</span>
              </h3>
              
              <div className="grid gap-6">
                {authorizedAgents.map(agent => (
                  <div key={agent.whatsapp} className="bg-white p-8 rounded-[35px] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-premium transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-lg-red border border-gray-100 shadow-inner group-hover:bg-lg-red group-hover:text-white transition-colors">
                        <ShieldCheck size={32} />
                      </div>
                      <div>
                        <p className="font-black text-xl uppercase tracking-tight text-gray-900">{agent.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">WA: {agent.whatsapp}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => copyLink(agent)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${copiedId === agent.whatsapp ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-black hover:text-white shadow-sm'}`}
                      >
                        {copiedId === agent.whatsapp ? <><Check size={14}/> 链接已就绪</> : <><Link size={14}/> 生成专属链接</>}
                      </button>
                      <button 
                        onClick={() => removeAgent(agent.whatsapp)} 
                        className="p-4 bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="删除授权"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                ))}
                {authorizedAgents.length === 0 && (
                  <div className="py-32 text-center border-4 border-dashed rounded-[50px] border-gray-50 text-gray-300 font-black uppercase text-sm tracking-[0.4em]">
                    等待发放第一份授权
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-up">
            {products.map(p => (
              <div key={p.id} className="bg-white p-8 rounded-[40px] border border-gray-100 flex items-center gap-8 shadow-sm hover:shadow-premium transition-all">
                <div className="w-24 h-24 bg-gray-50 rounded-3xl p-4">
                   <img src={p.image} className="w-full h-full object-contain" />
                </div>
                <div>
                  <p className="font-black uppercase tracking-tight text-lg">{p.name}</p>
                  <p className="text-[9px] font-black text-lg-red uppercase mt-1 tracking-[0.2em]">{p.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="max-w-2xl mx-auto py-20 text-center space-y-12 animate-fade-up">
            <div className="w-24 h-24 bg-lg-red/5 rounded-full flex items-center justify-center mx-auto">
               <Sparkles size={48} className="text-lg-red" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">AI 智能产品同步</h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">只需粘贴 LG 官网链接，AI 将自动解析规格、价格与多语言描述。</p>
            <textarea className="w-full h-64 p-10 rounded-[40px] bg-gray-50 border border-gray-100 outline-none focus:border-lg-red transition-all font-medium text-sm shadow-inner" placeholder="在此粘贴 LG 产品 URL..." />
            <button className="bg-black text-white px-20 py-7 rounded-full font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-lg-red transition-all">开始同步数据</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;