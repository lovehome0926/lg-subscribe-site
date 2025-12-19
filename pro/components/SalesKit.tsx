
import React, { useState } from 'react';
import { Search, Layers, ChevronRight, MessageCircle, FileDown, Copy, Check, Filter } from 'lucide-react';
import { Translation, Product } from '../types';
import { PRODUCT_DATA, FAQ_DATA, FORM_DATA, SCRIPT_DATA } from '../constants';

interface SalesKitProps {
  translations: Translation;
}

export const SalesKit: React.FC<SalesKitProps> = ({ translations }) => {
  const [search, setSearch] = useState('');
  const [subTab, setSubTab] = useState<'specs' | 'faq' | 'scripts' | 'forms'>('specs');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filteredProducts = PRODUCT_DATA.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFaq = FAQ_DATA.filter(f => 
    f.q.toLowerCase().includes(search.toLowerCase()) || 
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const filteredScripts = SCRIPT_DATA.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.content.toLowerCase().includes(search.toLowerCase())
  );

  const filteredForms = FORM_DATA.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-4">
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A50034] transition-colors" size={20} />
        <input 
          type="text" 
          placeholder={translations.searchPlaceholder}
          className="w-full bg-white border-0 ring-1 ring-gray-100 rounded-3xl pl-14 pr-6 py-4 text-sm font-bold shadow-xl outline-none focus:ring-2 focus:ring-[#A50034] transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl overflow-x-auto scrollbar-hide">
        {(['specs', 'faq', 'scripts', 'forms'] as const).map(tab => (
          <button 
            key={tab} onClick={() => setSubTab(tab)}
            className={`flex-1 min-w-[70px] py-2.5 text-[10px] font-black rounded-xl transition-all whitespace-nowrap ${subTab === tab ? 'bg-white shadow-sm text-[#A50034]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {translations[tab]}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {subTab === 'specs' && (
          filteredProducts.length > 0 ? (
            filteredProducts.map(p => (
              <div key={p.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3 hover:border-[#A50034]/20 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 font-black text-gray-800 text-sm">
                      <Layers size={16} className="text-[#A50034]" /> {p.name}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold mt-1">Ref: {p.id}</span>
                  </div>
                  <span className="text-[9px] bg-red-50 text-[#A50034] px-2 py-1 rounded-full font-bold uppercase tracking-widest">{p.category}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl space-y-2 text-[11px] font-bold">
                   <p><span className="text-gray-400 uppercase mr-2 text-[9px]">Dimensions:</span> {p.dims}</p>
                   <p className="text-[#A50034] leading-relaxed"><span className="text-gray-400 uppercase mr-2 text-[9px]">{translations.notes}:</span> {p.notes}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.sellingPoints.map((point, idx) => (
                    <span key={idx} className="bg-white text-gray-500 text-[10px] px-2.5 py-1 rounded-lg font-black border border-gray-100 shadow-sm flex items-center gap-1">
                      <div className="w-1 h-1 bg-[#A50034] rounded-full" /> {point}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-300 font-bold">{translations.noData}</div>
          )
        )}

        {subTab === 'faq' && (
          filteredFaq.length > 0 ? (
            <div className="space-y-3">
              {filteredFaq.map((item, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-all group">
                   <p className="text-xs font-black text-gray-800 mb-2 flex items-center gap-2 group-hover:text-[#A50034] transition-colors">
                     <MessageCircle size={14} className="text-[#A50034]" /> {item.q}
                   </p>
                   <p className="text-xs text-gray-500 font-medium leading-relaxed pl-6 border-l-2 border-gray-50">{item.a}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-300 font-bold">{translations.noData}</div>
          )
        )}

        {subTab === 'scripts' && (
          filteredScripts.length > 0 ? (
            <div className="space-y-4">
              {filteredScripts.map((script, i) => (
                <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-[10px] font-black text-[#A50034] uppercase tracking-widest">{script.title}</span>
                    <button 
                      onClick={() => handleCopy(script.content, i)}
                      className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 transition-all active:scale-90"
                    >
                      {copiedId === i ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-gray-700 leading-relaxed italic relative z-10">"{script.content}"</p>
                  <div className="absolute right-0 bottom-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform">
                    <MessageCircle size={64} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-300 font-bold">{translations.noData}</div>
          )
        )}

        {subTab === 'forms' && (
          filteredForms.length > 0 ? (
            <div className="space-y-3">
              {filteredForms.map((form, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-[#A50034] group-hover:bg-[#A50034] group-hover:text-white transition-all">
                      <FileDown size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-800">{form.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">{form.type} • {form.size}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-[#A50034]" />
                </div>
              ))}
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">More forms available on LG Partner Portal</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-gray-300 font-bold">{translations.noData}</div>
          )
        )}
      </div>
    </div>
  );
};
