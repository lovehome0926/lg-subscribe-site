
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Agent, Language, ProductPlan, PromotionTemplate } from '../types';
import { Zap, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  activeAgent: Agent | null;
  language: Language;
  promoTemplates?: PromotionTemplate[];
}

const ProductCard: React.FC<ProductCardProps> = ({ product, activeAgent, language, promoTemplates = [] }) => {
  if (!product) return null;

  const [purchaseMode, setPurchaseMode] = useState<'rental' | 'outright'>('rental');
  const [selectedTerm, setSelectedTerm] = useState<number | 'Outright'>(0);
  const [selectedMaintType, setSelectedMaintType] = useState<ProductPlan['maintenanceType']>('Regular Visit');

  const availableTerms = useMemo(() => {
    const terms = product.plans
      .filter(p => typeof p.termYears === 'number')
      .map(p => p.termYears as number);
    return Array.from(new Set(terms)).sort((a, b) => b - a);
  }, [product.plans]);

  useEffect(() => {
    if (purchaseMode === 'rental' && availableTerms.length > 0) {
      setSelectedTerm(availableTerms[0]);
    } else if (purchaseMode === 'outright') {
      setSelectedTerm('Outright');
    }
  }, [purchaseMode, availableTerms]);

  const currentPlan = useMemo(() => {
    const targetTerm = purchaseMode === 'outright' ? 'Outright' : selectedTerm;
    return product.plans.find(p => p.termYears === targetTerm && p.maintenanceType === selectedMaintType) || 
           product.plans.find(p => p.termYears === targetTerm);
  }, [purchaseMode, product.plans, selectedTerm, selectedMaintType]);

  const t = {
    en: { sub: "RENTAL", cash: "OUTRIGHT", perMo: "MONTHLY", inquire: "INQUIRE NOW", model: "MODEL", years: "YEARS", month: "Month", service: "Service" },
    cn: { sub: "月付租赁", cash: "买断总价", perMo: "月供", inquire: "立即咨询", model: "型号", years: "年", month: "每月", service: "售后服务" },
    ms: { sub: "SEWA", cash: "TUNAI", perMo: "BULANAN", inquire: "TANYA SEKARANG", model: "MODEL", years: "TAHUN", month: "Bulan", service: "Servis" }
  }[language];

  return (
    <div className="bg-white rounded-[40px] p-8 md:p-10 border border-gray-100 flex flex-col h-full group hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all duration-700 relative overflow-hidden">
      
      {/* Badges */}
      <div className="flex items-center gap-2 mb-8 h-8">
        {product.isHotSale && (
          <div className="bg-lg-red text-white text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Zap size={10} fill="currentColor" /> {language === 'cn' ? '热门销售' : language === 'ms' ? 'JUALAN HEBAT' : 'HOT SALE'}
          </div>
        )}
        <span className="ml-auto text-[8px] font-black text-gray-300 uppercase tracking-widest">{product.category}</span>
      </div>

      {/* Header */}
      <div className="space-y-2 mb-10">
        <h3 className="text-2xl md:text-3xl font-black text-gray-950 uppercase tracking-tighter leading-none group-hover:text-lg-red transition-colors">{product.name}</h3>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{product.subName[language]}</p>
      </div>

      {/* Image Area */}
      <div className="aspect-square flex items-center justify-center relative mb-12 p-6">
        <div className="absolute inset-0 bg-gray-50 rounded-full scale-90 group-hover:scale-100 transition-transform duration-1000 opacity-50"></div>
        <img 
          src={product.image} 
          className="max-h-full object-contain relative z-10 drop-shadow-[0_25px_45px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform duration-700" 
          alt={product.name} 
        />
      </div>

      {/* Selectors */}
      <div className="space-y-6 mb-12 flex-grow">
        <div className="flex p-1.5 bg-gray-100 rounded-3xl border border-gray-100">
          <button 
            onClick={() => setPurchaseMode('rental')} 
            className={`flex-1 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'rental' ? 'bg-white text-lg-red shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {t.sub}
          </button>
          <button 
            onClick={() => setPurchaseMode('outright')} 
            className={`flex-1 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'outright' ? 'bg-white text-lg-red shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {t.cash}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {purchaseMode === 'rental' && (
            <div className="space-y-2">
              <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">Plan</label>
              <select 
                className="w-full bg-gray-50 p-4 rounded-2xl text-[11px] font-black uppercase outline-none focus:bg-white border border-transparent focus:border-gray-200 transition-all"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(Number(e.target.value))}
              >
                {availableTerms.map(t_val => <option key={t_val} value={t_val}>{t_val} {t.years}</option>)}
              </select>
            </div>
          )}
          <div className={purchaseMode === 'outright' ? 'col-span-2 space-y-2' : 'space-y-2'}>
            <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest ml-1">{t.service}</label>
            <select 
              className="w-full bg-gray-50 p-4 rounded-2xl text-[11px] font-black uppercase outline-none focus:bg-white border border-transparent focus:border-gray-200 transition-all"
              value={selectedMaintType}
              onChange={(e) => setSelectedMaintType(e.target.value as any)}
            >
              {Array.from(new Set(product.plans.map(p => p.maintenanceType))).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="pt-8 border-t border-gray-50 mt-auto">
        <div className="flex flex-col mb-8">
           <span className="text-lg-red text-[10px] font-black uppercase tracking-[0.2em] mb-2">{t.perMo}</span>
           <div className="flex items-baseline gap-2">
             <span className="text-4xl md:text-5xl font-black text-gray-950 tracking-tighter">RM{currentPlan?.price}</span>
             {purchaseMode === 'rental' && <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">/ {t.month}</span>}
           </div>
        </div>

        <a 
          href={`https://wa.me/${activeAgent?.whatsapp || "60177473787"}?text=Hi, I am interested in ${product.name} (${product.id})\nMode: ${purchaseMode}\nPlan: ${selectedTerm}\nService: ${selectedMaintType}`} 
          target="_blank"
          className="w-full bg-gray-950 text-white py-6 rounded-full font-black uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-lg-red transition-all shadow-xl group/btn"
        >
          {t.inquire} <ArrowRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
