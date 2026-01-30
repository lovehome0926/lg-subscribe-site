import React, { useState, useEffect } from 'react';
import { Copy, Check, Rocket, ShieldCheck, Zap, ArrowRight, UserCheck, DollarSign, Target, Briefcase, Heart } from 'lucide-react';

const AgentTools: React.FC = () => {
  const [waNumber, setWaNumber] = useState('');
  const [name, setName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [estSales, setEstSales] = useState(5);
  const avgCommission = 350; 

  useEffect(() => {
    setWaNumber(localStorage.getItem('my_agent_wa') || '');
    setName(localStorage.getItem('my_agent_name') || '');
    window.scrollTo(0, 0);
  }, []);

  const generateLink = () => {
    if (!waNumber || !name) {
      alert("Please fill in both fields to create your personalized showroom.");
      return;
    }
    const cleanWa = waNumber.replace(/\D/g, '');
    const baseUrl = window.location.origin + window.location.pathname;
    // 构造带参数的推广链接：所有点击此链接进来的客户，咨询都会指向该代理的 WA
    const link = `${baseUrl}?wa=${cleanWa}&name=${encodeURIComponent(name)}#home`;
    setGeneratedLink(link);
    
    localStorage.setItem('my_agent_wa', cleanWa);
    localStorage.setItem('my_agent_name', name);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-6 py-24 md:py-36 max-w-7xl animate-in fade-in duration-1000">
      
      {/* 激励横幅：吸引下线加入 */}
      <div className="bg-[#05090f] text-white rounded-[60px] md:rounded-[100px] p-12 md:p-32 shadow-3xl mb-20 relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-lg-red/20 to-transparent skew-x-12 translate-x-32"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-blue-600/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="max-w-2xl space-y-10 text-center lg:text-left">
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <Briefcase className="text-lg-red" size={24} />
              <span className="text-lg-red text-[11px] font-black uppercase tracking-[0.8em]">Start Earning Today</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-4">
              OWN YOUR<br/><span className="text-lg-red">LG BUSINESS.</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs md:text-sm leading-loose max-w-md mx-auto lg:mx-0">
              只需一分钟。填写资料，生成你的专属推广链接。所有客户咨询直接联系到你的 WhatsApp。无需囤货，无须发货，佣金全归你。
            </p>
          </div>
          <div className="hidden lg:flex w-64 h-64 bg-white/5 rounded-[60px] rotate-12 items-center justify-center text-lg-red border border-white/10 shadow-2xl backdrop-blur-sm group hover:rotate-0 transition-all duration-700">
            <div className="text-center space-y-2">
               <Rocket size={80} className="group-hover:scale-110 transition-transform mx-auto" />
               <p className="text-[10px] font-black tracking-widest mt-4">ZERO COST</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
        {/* 左侧：链接配置区 */}
        <div className="space-y-16">
          <div className="bg-white p-12 md:p-20 rounded-[70px] border border-gray-100 shadow-2xl space-y-14">
             <div className="flex items-center justify-between border-b pb-8">
                <h3 className="text-3xl font-black uppercase tracking-tighter">1. 配置个人身份</h3>
                <UserCheck className="text-lg-red" size={36} />
             </div>
             <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] ml-4 block">推广姓名 (客户会看到的名称)</label>
                  <input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full p-8 bg-gray-50 rounded-[35px] outline-none font-black text-xl border-2 border-transparent focus:border-lg-red focus:bg-white transition-all shadow-inner text-gray-900" 
                    placeholder="例如: 认证顾问 小陈" 
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em] ml-4 block">WhatsApp 接收号码 (重要)</label>
                  <input 
                    value={waNumber} 
                    onChange={e => setWaNumber(e.target.value)} 
                    className="w-full p-8 bg-gray-50 rounded-[35px] outline-none font-black text-xl border-2 border-transparent focus:border-lg-red focus:bg-white transition-all shadow-inner text-gray-900" 
                    placeholder="601XXXXXXXX" 
                  />
                </div>
                <button 
                  onClick={generateLink} 
                  className="w-full group bg-lg-red text-white py-10 rounded-full font-black uppercase text-[13px] tracking-[0.5em] shadow-[0_25px_50px_rgba(230,0,68,0.3)] hover:bg-gray-950 hover:scale-[1.02] transition-all flex items-center justify-center gap-5"
                >
                  激活我的专属商城 <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </button>
             </div>
          </div>

          {generatedLink && (
            <div className="bg-gray-950 p-12 md:p-20 rounded-[70px] text-white shadow-3xl space-y-12 animate-in zoom-in-95 duration-700">
               <div className="flex items-center justify-between border-b border-white/5 pb-8">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">你的印钞机链接</h3>
                  <Zap className="text-amber-400" size={36} fill="currentColor" />
               </div>
               <div className="p-10 bg-white/5 rounded-[40px] font-mono text-[11px] break-all leading-relaxed border border-white/10 text-white/40 select-all shadow-inner">
                 {generatedLink}
               </div>
               <p className="text-[11px] text-gray-500 font-medium text-center italic">分享以上链接，客户下单时会自动联系到你的号码。</p>
               <button 
                onClick={copyToClipboard}
                className={`w-full py-10 rounded-full font-black uppercase text-[13px] tracking-[0.5em] flex items-center justify-center gap-5 transition-all shadow-2xl ${copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-lg-red hover:text-white'}`}
               >
                 {copied ? <><Check size={20}/> 复制成功!</> : <><Copy size={20}/> 复制推广链接</>}
               </button>
               <div className="pt-10 border-t border-white/5 flex gap-8 items-start">
                  <div className="w-16 h-16 bg-lg-red/10 rounded-3xl flex items-center justify-center text-lg-red shrink-0 border border-lg-red/20">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <p className="text-[12px] font-black uppercase tracking-widest text-white/90">Smart Tracking 系统</p>
                    <p className="text-[11px] text-white/30 font-bold mt-3 uppercase leading-relaxed">
                      该链接具备持久追踪功能。即使客户关闭页面后再次回来，系统依然会记得你是他们的推荐人。
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* 右侧：收入模拟与指南 */}
        <div className="space-y-16">
          <div className="bg-white p-12 md:p-20 rounded-[70px] border border-gray-100 shadow-2xl space-y-12">
            <div className="flex items-center gap-5 border-b pb-8">
              <DollarSign className="text-lg-red" size={36} />
              <h3 className="text-3xl font-black uppercase tracking-tighter">收入计算器</h3>
            </div>
            
            <div className="space-y-16">
              <div className="space-y-8">
                <div className="flex justify-between items-end px-4">
                   <label className="text-[11px] font-black text-gray-300 uppercase tracking-widest">月度目标销量</label>
                   <span className="text-5xl font-black text-gray-950">{estSales} <span className="text-sm text-gray-300 uppercase tracking-widest">台</span></span>
                </div>
                <div className="px-4">
                  <input 
                    type="range" min="1" max="100" step="1" 
                    value={estSales} 
                    onChange={e => setEstSales(Number(e.target.value))}
                    className="w-full h-4 bg-gray-100 rounded-full appearance-none cursor-pointer accent-lg-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div className="bg-gray-50 p-10 rounded-[45px] flex justify-between items-center shadow-inner border border-gray-100">
                   <div className="space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">预估月度佣金</p>
                      <p className="text-4xl font-black text-gray-950">RM { (estSales * avgCommission).toLocaleString() }</p>
                   </div>
                   <Target className="text-gray-200" size={48} />
                </div>
                
                <div className="bg-lg-red text-white p-12 rounded-[55px] relative overflow-hidden shadow-[0_30px_70px_rgba(230,0,68,0.3)]">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-3xl -translate-y-10 translate-x-10"></div>
                   <div className="relative z-10 space-y-4 text-center">
                      <p className="text-[11px] font-black uppercase tracking-[0.5em] opacity-60">预估年度额外收入</p>
                      <p className="text-6xl md:text-7xl font-black tracking-tighter leading-none">RM { (estSales * avgCommission * 12).toLocaleString() }</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-12 md:p-16 rounded-[70px] border border-gray-100 space-y-10">
             <div className="flex items-center gap-4">
                <Heart size={24} className="text-lg-red" fill="currentColor" />
                <h4 className="text-2xl font-black uppercase tracking-tighter text-gray-950">赚钱小贴士</h4>
             </div>
             <ul className="space-y-8">
               {[
                 "将你的推广链接分享到 WhatsApp 状态 (Status)，咨询率最高。",
                 "利用管理后台的 AI 导入功能，随时增加最火爆的新品。",
                 "在 Facebook 装修、家居小组发布产品，附带你的专属链接。",
                 "告诉客户：所有产品均由官方提供专业维护，完全无忧。"
               ].map((tip, idx) => (
                 <li key={idx} className="flex gap-6 items-start group">
                   <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shrink-0 text-[12px] font-black text-lg-red shadow-sm group-hover:bg-lg-red group-hover:text-white transition-all">{idx + 1}</div>
                   <p className="text-[12px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed pt-2">{tip}</p>
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentTools;