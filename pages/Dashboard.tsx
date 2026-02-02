
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { MOCK_REFERRALS, SALES_CHART_DATA } from '../constants';
import { generateSalesScript } from '../services/gemini';

const Dashboard: React.FC = () => {
  const [targetAudience, setTargetAudience] = useState('New Homeowners');
  const [productName, setProductName] = useState('LG OLED TV');
  const [aiScript, setAiScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    const script = await generateSalesScript(productName, targetAudience);
    setAiScript(script || '');
    setIsGenerating(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 font-light mt-1">Track your performance and access sales intelligence.</p>
        </div>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold shadow-sm">
             <span className="material-symbols-outlined text-[20px]">file_download</span>
             Export Report
           </button>
           <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20">
             <span className="material-symbols-outlined text-[20px]">add</span>
             Create Link
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Earnings', val: '$12,450', change: '+12.5%', icon: 'payments', color: 'text-green-500' },
          { label: 'Active Refs', val: '482', change: '+5.2%', icon: 'link', color: 'text-blue-500' },
          { label: 'Conversions', val: '94', change: '+18.3%', icon: 'task_alt', color: 'text-purple-500' },
          { label: 'Pending Payout', val: '$1,200', change: '', icon: 'schedule', color: 'text-orange-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className={`material-symbols-outlined ${s.color} text-3xl`}>{s.icon}</span>
              {s.change && <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{s.change}</span>}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Referral Activity</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-700 uppercase">Weekly</button>
              <button className="px-3 py-1 text-[10px] font-bold rounded-md text-slate-400 uppercase">Monthly</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Bar dataKey="referrals" fill="#a50034" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Sales Tool */}
        <div className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20 space-y-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
            <h3 className="text-xl font-bold">AI Sales Assistant</h3>
          </div>
          <p className="text-sm font-light text-white/80">Generate custom sales scripts for your leads in seconds.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Product</label>
              <input 
                type="text" 
                className="w-full bg-white/10 border-white/20 rounded-xl px-4 py-2 text-sm placeholder-white/40 focus:ring-white focus:border-white" 
                placeholder="e.g. WashTower Vertical"
                value={productName}
                onChange={e => setProductName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-2">Audience</label>
              <input 
                type="text" 
                className="w-full bg-white/10 border-white/20 rounded-xl px-4 py-2 text-sm placeholder-white/40 focus:ring-white focus:border-white" 
                placeholder="e.g. Young Couples"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
              />
            </div>
            <button 
              onClick={handleGenerateScript}
              disabled={isGenerating}
              className="w-full bg-white text-primary font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Thinking...' : 'Generate Script'}
            </button>
          </div>

          {aiScript && (
            <div className="mt-6 bg-black/20 p-4 rounded-xl text-xs font-mono max-h-[200px] overflow-y-auto border border-white/10 whitespace-pre-wrap">
              {aiScript}
            </div>
          )}
        </div>
      </div>

      {/* Referral Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xl font-bold">Active Referral Campaigns</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Updates</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50 dark:border-slate-700">
                <th className="px-8 py-5">Campaign</th>
                <th className="px-8 py-5">Link</th>
                <th className="px-8 py-5">Clicks</th>
                <th className="px-8 py-5">Conv.</th>
                <th className="px-8 py-5">CR%</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {MOCK_REFERRALS.map(ref => (
                <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-900 dark:text-white">{ref.campaign}</td>
                  <td className="px-8 py-6">
                    <code className="bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded text-[11px] text-primary">{ref.url}</code>
                  </td>
                  <td className="px-8 py-6 text-sm">{ref.clicks}</td>
                  <td className="px-8 py-6 text-sm">{ref.conversions}</td>
                  <td className="px-8 py-6 text-sm">
                    <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded-full font-bold text-[11px]">{ref.cr}%</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="size-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 inline-flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
