import React, { useState, useMemo, useEffect } from 'react';
import { Product, Agent, Language, ProductPlan, PromotionTemplate } from '../types';
import { Zap, ArrowRight, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  activeAgent: Agent | null;
  language: Language;
  promoTemplates?: PromotionTemplate[];
}

const ProductCard: React.FC<ProductCardProps> = ({ product, activeAgent, language, promoTemplates = [] }) => {
  if (!product || !product.name || !Array.isArray(product.plans)) return null;

  const [purchaseMode, setPurchaseMode] = useState<'rental' | 'outright'>('rental');
  const [selectedTerm, setSelectedTerm] = useState<number | 'Outright'>(0);
  const [selectedMaintType, setSelectedMaintType] = useState<ProductPlan['maintenanceType']>('Regular Visit');
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);

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

  const activePromo = useMemo(() => {
    const active = promoTemplates.filter(t => t.isActive && (t.applyToAll || t.targetProductIds.includes(product.id)));
    if (active.length === 0) return null;
    return active.sort((a, b) => (b.applyToAll ? 0 : 1) - (a.applyToAll ? 0 : 1))[0];
  }, [promoTemplates, product.id]);

  const currentPlan = useMemo(() => {
    const targetTerm = purchaseMode === 'outright' ? 'Outright' : selectedTerm;
    const plan = product.plans.find(p => p.termYears === targetTerm && p.maintenanceType === selectedMaintType) || 
                 product.plans.find(p => p.termYears === targetTerm);
    
    if (!plan) return null;

    let finalPrice = plan.price;
    if (activePromo) {
      if (activePromo.discountType === 'percentage') {
        finalPrice = finalPrice * (1 - activePromo.discountAmount / 100);
      } else if (activePromo.discountType === 'fixed') {
        finalPrice = Math.max(0, finalPrice - activePromo.discountAmount);
      } else if (activePromo.discountType === 'direct') {
        finalPrice = activePromo.discountAmount;
      }
    }

    return { ...plan, price: finalPrice };
  }, [purchaseMode, product.plans, selectedTerm, selectedMaintType, activePromo]);

  const t = {
    en: { sub: "MONTHLY", cash: "CASH", perMo: "PER MONTH", inquire: "SECURE DEAL", plan: "PLAN", service: "SERVICE", problems: "SOLVES FOR YOU", model: "MODEL" },
    cn: { sub: "月付", cash: "总价", perMo: "每个月", inquire: "立即咨询", plan: "租期", service: "保养", problems: "为您解决", model: "型号" },
    ms: { sub: "BULANAN", cash: "TUNAI", perMo: "SETIAP BULAN", inquire: "DAPATKAN SEKARANG", plan: "PELAN", service: "SERVIS", problems: "PENYELESAIAN ANDA", model: "MODEL" }
  }[language];

  const subNameText = product.subName ? (product.subName[language] || product.subName['en'] || '') : '';

  return (
    <div className="bg-white rounded-[32px] md:rounded-[40px] overflow-hidden border border-gray-100 flex flex-col h-full group transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] p-6 md:p-10 relative">
      
      {/* Fixed Header Layout - No Overlaps */}
      <div className="mb-6 space-y-4">
        {/* Status Line */}
        <div className="flex flex-wrap items-center gap-2 h-7">
          {product.isHotSale && (
            <div className="bg-lg-red text-white text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <Zap size={8} fill="currentColor" /> HOT
            </div>
          )}
          {activePromo && (
            <div className="bg-amber-400 text-black text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 rounded-full shadow-sm">
              PROMO
            </div>
          )}
          <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] ml-auto">{product.category}</span>
        </div>

        {/* Title and Model Info */}
        <div className="space-y-2">
          <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-950 uppercase tracking-tighter leading-none break-words">
            {product.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2">
             <div className="bg-gray-950 text-white px-2 py-1 rounded text-[9px] font-black tracking-widest flex items-center gap-2">
                <span className="opacity-40">{t.model}</span>
                {product.id}
             </div>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] truncate max-w-[150px]">
                {subNameText}
             </p>
          </div>
        </div>
      </div>

      {/* Main Image View */}
      <div className="aspect-square flex items-center justify-center relative mb-8 p-4">
        <div className="absolute inset-0 bg-gray-50/50 rounded-full scale-90 group-hover:scale-100 transition-transform duration-1000"></div>
        <img 
          src={product.variants?.[selectedVariantIdx]?.image || product.image} 
          className="max-h-full object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform duration-700 ease-out" 
          alt={product.name} 
        />
        
        {/* Quick Color Picker */}
        {product.variants && product.variants.length > 1 && (
          <div className="absolute bottom-0 right-0 flex gap-1.5 p-2 bg-white/80 backdrop-blur rounded-2xl border border-gray-100">
            {product.variants.map((v, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedVariantIdx(i)}
                className={`w-3 h-3 rounded-full border transition-all ${selectedVariantIdx === i ? 'ring-2 ring-lg-red ring-offset-2 scale-110' : 'opacity-60 scale-90'}`}
                style={{ backgroundColor: v.colorCode || '#ccc' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pain Points */}
      {product.painPoints && product.painPoints.length > 0 && (
        <div className="mb-8 space-y-2">
          <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest px-1">{t.problems}</p>
          <div className="bg-gray-50/30 p-4 rounded-3xl space-y-2 border border-gray-100/50">
            {product.painPoints.slice(0, 2).map((pp, i) => (
              <div key={i} className="flex gap-2 items-start">
                <AlertCircle size={10} className="text-lg-red mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-tight tracking-tight">
                  {pp[language] || pp['en']}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Options Selection */}
      <div className="space-y-4 mb-8 flex-grow">
        <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
          <button 
            onClick={() => setPurchaseMode('rental')} 
            className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'rental' ? 'bg-white text-lg-red shadow-sm' : 'text-gray-400'}`}
          >
            {t.sub}
          </button>
          {product.plans.some(p => p.termYears === 'Outright') && (
            <button 
              onClick={() => setPurchaseMode('outright')} 
              className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'outright' ? 'bg-white text-lg-red shadow-sm' : 'text-gray-400'}`}
            >
              {t.cash}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
           {purchaseMode === 'rental' && (
              <div className="space-y-1.5">
                 <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.plan}</label>
                 <select 
                  className="w-full bg-gray-50 p-3 rounded-xl text-[10px] font-black uppercase outline-none border-none text-gray-950"
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(Number(e.target.value))}
                 >
                   {availableTerms.map(t => <option key={t} value={t}>{t}Y</option>)}
                 </select>
              </div>
           )}
           <div className={`space-y-1.5 ${purchaseMode === 'outright' ? 'col-span-2' : ''}`}>
              <label className="text-[7px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.service}</label>
              <select 
                className="w-full bg-gray-50 p-3 rounded-xl text-[10px] font-black uppercase outline-none border-none text-gray-950"
                value={selectedMaintType}
                onChange={(e) => setSelectedMaintType(e.target.value as any)}
              >
                {Array.from(new Set(product.plans.map(p => p.maintenanceType))).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
           </div>
        </div>
      </div>

      {/* Pricing Footer */}
      <div className="pt-6 border-t border-gray-50 mt-auto">
        <div className="flex items-end justify-between mb-6">
           <div className="flex flex-col">
              <span className="text-lg-red text-[9px] font-black uppercase tracking-widest mb-1">
                {purchaseMode === 'rental' ? t.sub : t.cash}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-black text-gray-950 tracking-tighter leading-none">
                  RM{Math.ceil(currentPlan?.price || 0)}
                </span>
                {purchaseMode === 'rental' && <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">/MO</span>}
              </div>
           </div>
        </div>

        <a 
          href={`https://wa.me/${activeAgent?.whatsapp || "60177473787"}?text=Hi, I am interested in ${product.name} (${product.id})\nPlan: ${selectedTerm}${purchaseMode === 'rental' ? 'Y' : ''}\nService: ${selectedMaintType}${activePromo ? `\nPromo: ${activePromo.name}` : ''}`} 
          target="_blank"
          className="w-full bg-gray-950 text-white py-5 rounded-full font-black uppercase text-[10px] tracking-[0.3em] text-center flex items-center justify-center gap-3 hover:bg-lg-red transition-all group/btn"
        >
          {t.inquire} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default ProductCard;