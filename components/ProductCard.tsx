
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Agent, Language, ProductPlan, PromotionTemplate } from '../types.js';
import { Shield, Sparkles, AlertCircle, Info, ChevronRight, Zap, Palette } from 'lucide-react';

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

  const availableTerms = useMemo(() => {
    const terms = product.plans
      .filter(p => typeof p.termYears === 'number')
      .map(p => p.termYears as number);
    return Array.from(new Set(terms)).sort((a, b) => b - a);
  }, [product.plans]);

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
    en: { more: "Specs", subscription: "Sub", outright: "Cash", was: "WAS", total_saved: "TOTAL SAVED", tc: "* T&C APPLY", ends: "ENDS", maint: "SERVICE", term: "PLAN", solving: "SOLUTIONS", kv: "KLANG VALLEY", variant: "MODEL" },
    cn: { more: "详情", subscription: "租赁", outright: "买断", was: "原价", total_saved: "合约总节省", tc: "* 需符合条规", ends: "截止日期", maint: "保养", term: "年限", solving: "为您解决", kv: "限定地区", variant: "款式型号" },
    ms: { more: "Info", subscription: "Sewa", outright: "Tunai", was: "ASAL", total_saved: "JUMLAH JIMAT", tc: "* T&C", ends: "TAMAT", maint: "SERVIS", term: "PLAN", solving: "SOLUSI", kv: "KLANG VALLEY", variant: "MODEL" }
  }[language];

  return (
    <div className="bg-white rounded-[55px] overflow-hidden border border-gray-100 shadow-[0_30px_90px_rgba(0,0,0,0.06)] flex flex-col h-full group transition-all duration-700 relative p-5 sm:p-7 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)]">
      
      {/* Top Bar Indicators */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-2 items-start">
           {product.isHotSale && (
             <span className="bg-[#05090f] text-white text-[8px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
               <Zap size={10} className="text-amber-400" fill="currentColor" /> HOT SELLER
             </span>
           )}
           {activePromoTemplate && purchaseMode === 'rental' && (
             <span className={`${getPromoColor(activePromoTemplate.name)} text-white text-[8px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full shadow-lg animate-pulse`}>
               {activePromoTemplate.name}
             </span>
           )}
           {product.isKlangValleyOnly && (
             <span className="bg-blue-600/10 text-blue-600 text-[8px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full border border-blue-600/20">
               📍 {t.kv}
             </span>
           )}
        </div>
        <button 
          onClick={() => setShowSpecs(!showSpecs)} 
          className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-lg-red hover:bg-red-50 transition-all duration-500 transform active:scale-90"
        >
          {showSpecs ? <ChevronRight size={20} className="rotate-180" /> : <Info size={20} />}
        </button>
      </div>

      {/* Product Title */}
      <div className="px-2 mb-6">
        <div className="flex flex-wrap items-baseline gap-3 mb-2">
          <h3 className="text-3xl font-black text-gray-950 uppercase tracking-tighter leading-none">{product.name}</h3>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">#{product.id}</span>
        </div>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em]">{product.subName[language]}</p>
      </div>

      {/* Main Image Area */}
      <div className="px-10 py-8 aspect-[4/3] flex items-center justify-center relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent rounded-[50px]"></div>
        <img 
          src={product.variants?.[selectedVariantIdx]?.image || product.image} 
          className="max-h-full object-contain relative z-10 drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:scale-110 transition duration-1000 ease-out" 
          alt={product.name} 
        />
      </div>

      {/* Variant Selection UI (RESTORED) */}
      {product.variants && product.variants.length > 1 && !showSpecs && (
        <div className="px-2 mb-6 flex flex-col gap-2 animate-in fade-in duration-500">
           <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.4em] ml-2">{t.variant}</span>
           <div className="flex flex-wrap gap-3">
             {product.variants.map((v, i) => (
               <button 
                key={i} 
                onClick={() => { setSelectedVariantIdx(i); setHasUserInteracted(true); }}
                className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center p-0.5 ${selectedVariantIdx === i ? 'border-lg-red scale-110' : 'border-transparent hover:border-gray-200'}`}
                title={v.name}
               >
                 <div 
                   className="w-full h-full rounded-full shadow-inner border border-black/5" 
                   style={{ backgroundColor: v.colorCode || '#f0f0f0' }}
                 ></div>
               </button>
             ))}
           </div>
           <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest mt-1 ml-2">
             {product.variants[selectedVariantIdx].name} {product.variants[selectedVariantIdx].modelId && <span className="text-gray-300 ml-2">({product.variants[selectedVariantIdx].modelId})</span>}
           </p>
        </div>
      )}

      {/* Controls / Specs Toggle */}
      <div className="px-2 flex-grow mb-8">
        {!showSpecs ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* HP Options Selector (RESTORED) */}
            {product.hpOptions && product.hpOptions.length > 0 && (
               <div className="flex flex-col gap-2">
                  <label className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] ml-2">Horsepower / Size</label>
                  <div className="flex flex-wrap gap-2">
                    {product.hpOptions.map((hp, i) => (
                      <button 
                        key={i} 
                        onClick={() => { setSelectedHPIdx(i); setHasUserInteracted(true); }}
                        className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${selectedHPIdx === i ? 'bg-black text-white border-transparent' : 'bg-white text-gray-400 border-gray-100 hover:text-lg-red'}`}
                      >
                        {hp.value}HP
                      </button>
                    ))}
                  </div>
               </div>
            )}

            {/* Purchase Mode Toggle */}
            <div className="flex p-1.5 bg-gray-50 rounded-3xl border border-gray-100 shadow-inner">
              <button 
                onClick={() => { setPurchaseMode('rental'); setHasUserInteracted(true); }} 
                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${purchaseMode === 'rental' ? 'bg-white text-lg-red shadow-xl scale-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t.subscription}
              </button>
              {hasOutright && (
                <button 
                  onClick={() => { setPurchaseMode('outright'); setHasUserInteracted(true); }} 
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${purchaseMode === 'outright' ? 'bg-white text-lg-red shadow-xl scale-100' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {t.outright}
                </button>
              )}
            </div>
            
            {/* Options Selectors */}
            {(purchaseMode === 'rental' || (purchaseMode === 'outright' && isWaterPurifier)) && (
              <div className="grid grid-cols-2 gap-4">
                {purchaseMode === 'rental' && (
                  <div className="flex flex-col gap-2">
                    <label className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] ml-2">Contract</label>
                    <select 
                      value={selectedTerm} 
                      onChange={e => { setSelectedTerm(Number(e.target.value)); setHasUserInteracted(true); }} 
                      className="bg-white border border-gray-100 rounded-[22px] p-5 text-[11px] font-black uppercase text-gray-900 outline-none focus:border-lg-red transition shadow-sm appearance-none"
                    >
                      {availableTerms.map(term => <option key={term} value={term}>{term}Y {t.term}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex flex-col gap-2 flex-grow">
                   <label className="text-[8px] font-black text-gray-300 uppercase tracking-[0.3em] ml-2">Service</label>
                   <select 
                    value={selectedMaintType} 
                    onChange={e => { setSelectedMaintType(e.target.value as any); setHasUserInteracted(true); }} 
                    className={`bg-white border border-gray-100 rounded-[22px] p-5 text-[11px] font-black uppercase text-gray-900 outline-none focus:border-lg-red transition shadow-sm appearance-none ${purchaseMode === 'outright' ? 'col-span-2' : ''}`}
                  >
                    {availableMaintTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#05090f] p-8 rounded-[40px] text-white h-[200px] overflow-y-auto no-scrollbar space-y-8 animate-in slide-in-from-right duration-500">
             <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <Sparkles className="text-lg-red" size={16} />
                 <span className="text-[9px] font-black uppercase tracking-[0.5em] text-lg-red">{t.solving}</span>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  {product.painPoints.map((p, i) => (
                    <div key={i} className="text-[11px] font-bold text-white/70 flex gap-3 items-center bg-white/5 px-5 py-4 rounded-[22px] border border-white/5">
                      <span className="text-lg-red font-black">?</span> {p[language]}
                    </div>
                  ))}
               </div>
             </div>
             <div className="space-y-4">
               <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.5em] block">Technical Prowess</span>
               <div className="grid grid-cols-1 gap-3">
                 {product.features.map((f, i) => (
                   <div key={i} className="text-[11px] font-bold text-white/50 flex gap-4">
                     <span className="text-lg-red font-black">✓</span> {f[language]}
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}
      </div>

      {/* Pricing Dashboard Panel */}
      <div className="mt-auto">
        <div className="bg-[#05090f] rounded-[50px] p-8 text-white relative overflow-hidden flex flex-col gap-6 shadow-2xl border border-white/5">
           {/* Animated Background Element */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-lg-red/20 blur-[80px] -translate-y-16 translate-x-16"></div>
           
           <div className="flex justify-between items-center z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{t.was} RM{currentBasePrice}</span>
              {(activePromoTemplate?.endDate || product.promoEndDate) && (
                <div className="flex items-center gap-2.5 bg-lg-red/10 px-4 py-2 rounded-full border border-lg-red/30 shadow-[0_0_20px_rgba(230,0,68,0.1)]">
                  <div className="w-1.5 h-1.5 bg-lg-red rounded-full animate-ping"></div>
                  <span className="text-lg-red text-[9px] font-black uppercase tracking-widest">{t.ends}: {activePromoTemplate?.endDate || product.promoEndDate}</span>
                </div>
              )}
           </div>

           <div className="flex items-end justify-between gap-4 z-10 relative">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-lg-red mb-2 tracking-[0.3em]">
                  {purchaseMode === 'rental' ? 'MONTHLY' : 'CASH PRICE'}
                </span>
                <div className="flex items-baseline gap-2">
                   <span className="text-6xl font-black tracking-tighter text-white drop-shadow-lg">RM{finalPrice}</span>
                   {purchaseMode === 'rental' && <span className="text-[14px] font-black text-white/30 uppercase tracking-widest">/MO</span>}
                </div>
              </div>

              {totalSavedValue > 0 && purchaseMode === 'rental' && (
                 <div className="bg-white/5 border border-white/10 rounded-[30px] p-5 flex flex-col items-center justify-center min-w-[110px] text-center shadow-inner">
                    <span className="text-[8px] font-black uppercase text-amber-500 mb-2 whitespace-nowrap tracking-widest leading-none">{t.total_saved}</span>
                    <span className="text-2xl font-black text-white leading-none">RM{totalSavedValue}</span>
                 </div>
              )}
           </div>

           <div className="flex flex-wrap gap-5 text-[9px] font-black uppercase tracking-[0.3em] text-white/40 pt-5 border-t border-white/5">
              {purchaseMode === 'rental' ? (
                <>
                  <div className="flex items-center gap-2"><Shield size={12} className="text-lg-red"/> {selectedMaintType}</div>
                  <div className="flex items-center gap-2"><Sparkles size={12} className="text-lg-red"/> {selectedTerm}Y TERM</div>
                </>
              ) : (
                <>
                  {isWaterPurifier && <div className="flex items-center gap-2"><Shield size={12} className="text-lg-red"/> {selectedMaintType}</div>}
                  <div className="flex items-center gap-2"><Shield size={12} className="text-lg-red"/> {product.outrightWarranty || '1Y WARRANTY'}</div>
                </>
              )}
           </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8">
        <a 
          href={`https://wa.me/${activeAgent?.whatsapp || "60177473787"}?text=Hi, I am interested in ${product.name} (#${product.id})\nMode: ${purchaseMode.toUpperCase()}\nPlan: ${selectedTerm}${typeof selectedTerm === 'number' ? 'Y' : ''} - ${selectedMaintType}`} 
          target="_blank" 
          className="w-full bg-[#05090f] text-white py-6 rounded-full font-black uppercase text-[11px] tracking-[0.5em] text-center block shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:bg-lg-red hover:shadow-[0_20px_50px_rgba(230,0,68,0.3)] transition-all transform active:scale-95 duration-500"
        >
          WhatsApp Inquiry
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
