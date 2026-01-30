
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Agent, Language, ProductPlan, PromotionTemplate } from '../types';

interface ProductCardProps {
  product: Product;
  activeAgent: Agent | null;
  language: Language;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, activeAgent, language }) => {
  if (!product || !product.name || !Array.isArray(product.plans)) return null;

  const [purchaseMode, setPurchaseMode] = useState<'rental' | 'outright'>('rental');
  const [selectedTerm, setSelectedTerm] = useState<number | 'Outright'>(0);
  const [selectedMaintType, setSelectedMaintType] = useState<ProductPlan['maintenanceType']>('Regular Visit');
  const [selectedHPIdx, setSelectedHPIdx] = useState(0);
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [showSpecs, setShowSpecs] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const getPromoColor = (name: string) => {
    const palette = ['bg-[#f59e0b]', 'bg-[#e60044]', 'bg-[#10b981]', 'bg-[#6366f1]', 'bg-[#f43f5e]', 'bg-[#06b6d4]'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  };

  const promoInfo = useMemo(() => {
    try {
      const savedSettings = localStorage.getItem('lg_site_settings');
      if (!savedSettings) return { templates: [] };
      const settings = JSON.parse(savedSettings);
      return { templates: (settings.promoTemplates || []).filter((t: PromotionTemplate) => {
        if (!t.isActive) return false;
        return t.applyToAll || (t.targetProductIds && t.targetProductIds.includes(product.id));
      }) };
    } catch (e) { return { templates: [] }; }
  }, [product.id]);

  const availableTerms = useMemo(() => 
    Array.from(new Set(product.plans.filter(p => p.termYears !== 'Outright').map(p => p.termYears as number))).sort((a, b) => b - a)
  , [product.plans]);

  // 同步购买模式与 Term
  useEffect(() => {
    if (!hasUserInteracted) {
      if (purchaseMode === 'rental' && availableTerms.length > 0) {
        setSelectedTerm(availableTerms[0]);
      } else if (purchaseMode === 'outright') {
        setSelectedTerm('Outright');
      }
    }
  }, [purchaseMode, availableTerms, hasUserInteracted]);

  const availableMaintTypes = useMemo(() => 
    Array.from(new Set(product.plans.filter(p => p.termYears === (purchaseMode === 'outright' ? 'Outright' : selectedTerm)).map(p => p.maintenanceType)))
  , [product.plans, selectedTerm, purchaseMode]);

  useEffect(() => {
    if (!hasUserInteracted && availableMaintTypes.length > 0) {
      setSelectedMaintType(availableMaintTypes[0] as any);
    }
  }, [availableMaintTypes, hasUserInteracted]);

  const currentBasePrice = useMemo(() => {
    const targetTerm = purchaseMode === 'outright' ? 'Outright' : selectedTerm;
    const plan = product.plans.find(p => p.termYears === targetTerm && p.maintenanceType === selectedMaintType) || 
                 product.plans.find(p => p.termYears === targetTerm);
    
    const offset = purchaseMode === 'outright' 
      ? (product.hpOptions?.[selectedHPIdx]?.cashOffset || 0)
      : (product.hpOptions?.[selectedHPIdx]?.rentalOffset || 0);

    return (plan?.price || 0) + offset;
  }, [purchaseMode, product.plans, selectedTerm, selectedMaintType, selectedHPIdx]);

  const promoCalculation = useMemo(() => {
    if (purchaseMode !== 'rental' || !promoInfo.templates.length) return { final: currentBasePrice, saved: 0, template: null };
    
    let best = { final: currentBasePrice, saved: 0, template: null as PromotionTemplate | null };
    
    promoInfo.templates.forEach(t => {
      let d = 0;
      if (t.discountType === 'percentage') d = currentBasePrice * (t.discountAmount / 100);
      else if (t.discountType === 'direct') d = Math.max(0, currentBasePrice - t.discountAmount);
      else d = t.discountAmount;
      
      const dur = t.durationMonths === 'full' ? (Number(selectedTerm) * 12) : Number(t.durationMonths);
      
      const discountedMonthly = Math.ceil(currentBasePrice - d);
      const monthlySaving = currentBasePrice - discountedMonthly;
      const totalSaved = monthlySaving * dur;

      if (totalSaved > best.saved) {
        best = { final: discountedMonthly, saved: totalSaved, template: t };
      }
    });
    return best;
  }, [purchaseMode, currentBasePrice, promoInfo.templates, selectedTerm]);

  const finalPrice = promoCalculation.final;
  const totalSavedValue = promoCalculation.saved;
  const activePromoTemplate = promoCalculation.template;

  const hasOutright = product.plans.some(p => p.termYears === 'Outright');
  const isWaterPurifier = product.category === 'Water Purifier';

  const t = {
    en: { more: "SPECS", subscription: "SUBSCRIPTION", outright: "CASH", monthly: "MONTHLY", was: "WAS", total_saved: "TOTAL SAVED", for: "FOR", months: "M", tc: "* T&C APPLY", ends: "ENDS", maint: "SERVICE", term: "PLAN", solving: "SOLVING YOUR PROBLEMS", kv: "KLANG VALLEY ONLY" },
    cn: { more: "详情", subscription: "租赁方案", outright: "买断", monthly: "每月", was: "原价", total_saved: "合约总节省", for: "前", months: "个月", tc: "* 需符合条规", ends: "截止日期", maint: "保养", term: "年限", solving: "为您解决以下烦恼", kv: "仅限 Klang Valley 地区" },
    ms: { more: "Info", subscription: "LANGGANAN", outright: "TUNAI", monthly: "BULANAN", was: "ASAL", total_saved: "JUMLAH JIMAT", for: "untuk", months: "bulan", tc: "* T&C", ends: "TAMAT", maint: "SERVIS", term: "PLAN", solving: "MENYELESAIKAN MASALAH ANDA", kv: "KLANG VALLEY SAHAJA" }
  }[language];

  return (
    <div className="bg-white rounded-[50px] overflow-hidden border border-gray-100 shadow-[0_10px_50px_rgba(0,0,0,0.05)] flex flex-col h-full group transition-all duration-500 relative p-3 sm:p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-1.5 items-start">
           {product.isHotSale && <span className="bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">HOT SELLING</span>}
           {activePromoTemplate && purchaseMode === 'rental' && <span className={`${getPromoColor(activePromoTemplate.name)} text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm animate-pulse`}>{activePromoTemplate.name}</span>}
           {product.isKlangValleyOnly && <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">📍 {t.kv}</span>}
        </div>
        <button onClick={() => setShowSpecs(!showSpecs)} className="text-[9px] font-black uppercase text-lg-red px-4 py-2 bg-red-50/80 backdrop-blur rounded-xl hover:bg-lg-red hover:text-white transition-all z-20">{showSpecs ? 'BACK' : t.more}</button>
      </div>

      <div className="px-1 mb-4">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-[19px] font-black text-gray-950 uppercase tracking-tighter leading-tight">{product.name}</h3>
          <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-lg text-[8px] font-black tracking-widest">#{product.id}</span>
        </div>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.15em]">{product.subName[language]}</p>
      </div>

      <div className="px-6 py-4 aspect-square flex items-center justify-center relative">
        <img src={product.variants?.[selectedVariantIdx]?.image || product.image} className="max-h-full object-contain group-hover:scale-105 transition duration-1000" alt={product.name} />
      </div>

      <div className="px-1 mb-6">
        {!showSpecs ? (
          <div className="space-y-4">
            <div className="flex p-1 bg-gray-50 rounded-2xl border border-gray-100">
              <button onClick={() => { setPurchaseMode('rental'); setHasUserInteracted(true); }} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'rental' ? 'bg-white text-lg-red shadow-sm' : 'text-gray-400'}`}>{t.subscription}</button>
              {hasOutright && <button onClick={() => { setPurchaseMode('outright'); setHasUserInteracted(true); }} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'outright' ? 'bg-white text-lg-red shadow-sm' : 'text-gray-400'}`}>{t.outright}</button>}
            </div>
            
            {(purchaseMode === 'rental' || (purchaseMode === 'outright' && isWaterPurifier)) && (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-300">
                {purchaseMode === 'rental' && (
                  <select value={selectedTerm} onChange={e => { setSelectedTerm(Number(e.target.value)); setHasUserInteracted(true); }} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-[9px] font-black uppercase text-gray-900 outline-none">
                    {availableTerms.map(term => <option key={term} value={term}>{term}Y {t.term}</option>)}
                  </select>
                )}
                <select value={selectedMaintType} onChange={e => { setSelectedMaintType(e.target.value as any); setHasUserInteracted(true); }} className={`bg-gray-50 border border-gray-100 rounded-xl p-3 text-[9px] font-black uppercase text-gray-900 outline-none ${purchaseMode === 'outright' ? 'col-span-2' : ''}`}>
                  {availableMaintTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 h-[150px] overflow-y-auto no-scrollbar space-y-4">
             {product.painPoints && product.painPoints.length > 0 && (
               <div className="space-y-2">
                 <span className="text-[8px] font-black text-lg-red uppercase tracking-widest block">{t.solving}</span>
                 {product.painPoints.map((p, i) => (
                   <div key={i} className="text-[10px] font-black text-gray-950 flex gap-2 items-center bg-white px-3 py-2 rounded-xl border border-red-100 shadow-sm">
                     <span className="text-lg-red">⚡</span> {p[language]}
                   </div>
                 ))}
               </div>
             )}
             <div className="space-y-2">
               <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">SPECIFICATIONS</span>
               {product.features.map((f, i) => <div key={i} className="text-[9px] font-bold text-gray-700 flex gap-2"><span className="text-green-500 font-black">✓</span> {f[language]}</div>)}
             </div>
          </div>
        )}
      </div>

      <div className="px-0">
        <div className="bg-[#05090f] rounded-[40px] p-6 text-white relative overflow-hidden flex flex-col gap-5 shadow-2xl border border-white/5">
           <div className="flex justify-between items-center z-10">
              <span className="text-[8px] font-black uppercase tracking-widest text-white/50">{t.was} RM{currentBasePrice}</span>
              {(activePromoTemplate?.endDate || product.promoEndDate) && (
                <div className="flex items-center gap-2 bg-lg-red/20 px-3 py-1.5 rounded-full border border-lg-red/40 shadow-[0_0_15px_rgba(230,0,68,0.2)]">
                  <div className="w-1.5 h-1.5 bg-lg-red rounded-full animate-ping"></div>
                  <span className="text-lg-red text-[8px] font-black uppercase tracking-[0.1em]">{t.ends}: {activePromoTemplate?.endDate || product.promoEndDate}</span>
                </div>
              )}
           </div>

           <div className="flex items-center justify-between gap-4 z-10 relative">
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black uppercase text-white/40 mb-1 tracking-widest">
                  {purchaseMode === 'rental' ? `${t.monthly} (${activePromoTemplate?.durationMonths === 'full' ? 'FULL TERM' : `${t.for} ${activePromoTemplate?.durationMonths}${t.months}`})` : 'TOTAL CASH'}
                </span>
                <div className="flex items-baseline gap-1">
                   <span className="text-5xl font-black tracking-tighter text-white drop-shadow-lg">RM{finalPrice}</span>
                   {purchaseMode === 'rental' && <span className="text-[11px] font-black text-white/30">/MO</span>}
                </div>
              </div>

              {totalSavedValue > 0 && purchaseMode === 'rental' && (
                 <div className="bg-white/5 border border-white/10 rounded-3xl p-4 flex flex-col items-center justify-center min-w-[90px] text-center shadow-inner">
                    <span className="text-[7px] font-black uppercase text-lg-red mb-1 whitespace-nowrap tracking-widest">{t.total_saved}</span>
                    <span className="text-xl font-black text-white leading-none">RM{totalSavedValue}</span>
                 </div>
              )}
           </div>

           <div className="flex gap-4 text-[8px] font-bold uppercase tracking-widest text-white/30 pt-3 border-t border-white/5">
              {purchaseMode === 'rental' ? (
                <>
                  <span className="flex items-center gap-1"><span className="w-1 h-1 bg-white/20 rounded-full"></span>{selectedMaintType}</span>
                  <span className="flex items-center gap-1"><span className="w-1 h-1 bg-white/20 rounded-full"></span>{selectedTerm}Y PLAN</span>
                </>
              ) : (
                <>
                  {isWaterPurifier && <span className="flex items-center gap-1"><span className="w-1 h-1 bg-white/20 rounded-full"></span>{selectedMaintType}</span>}
                  <span className="flex items-center gap-1"><span className="w-1 h-1 bg-white/20 rounded-full"></span>{product.outrightWarranty || '1 YEAR WARRANTY'}</span>
                </>
              )}
           </div>
        </div>
      </div>

      <div className="mt-4 pb-1">
        <a href={`https://wa.me/${activeAgent?.whatsapp || "60177473787"}?text=Hi, interested in ${product.name} (#${product.id})\nPlan: ${selectedTerm}${typeof selectedTerm === 'number' ? 'Y' : ''} - ${selectedMaintType}`} target="_blank" className="w-full bg-lg-red text-white py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] text-center block shadow-[0_15px_30px_rgba(230,0,68,0.25)] hover:bg-black transition-all transform active:scale-95">WHATSAPP INQUIRY</a>
      </div>
    </div>
  );
};

export default ProductCard;
