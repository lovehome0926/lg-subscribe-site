
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Agent, Language, ProductPlan, ProductVariant, SiteSettings, HpOption } from '../types.ts';
import { Zap, ArrowRight, Check, Info, Flame, Tag, RotateCw, Star, Calendar } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  activeAgent: Agent | null;
  language: Language;
  siteSettings: SiteSettings;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, activeAgent, language, siteSettings }) => {
  // 防御性校验
  if (!product || !Array.isArray(product.plans) || product.plans.length === 0) return null;

  const [purchaseMode, setPurchaseMode] = useState<'rental' | 'outright'>('rental');
  const [selectedTerm, setSelectedTerm] = useState<number | 'Outright'>(0);
  const [selectedMaintType, setSelectedMaintType] = useState<ProductPlan['maintenanceType']>('Regular Visit');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] || null);
  const [selectedHp, setSelectedHp] = useState<HpOption | null>(product.hpOptions?.[0] || null);

  const hasOutright = useMemo(() => {
    return (product.outrightPrice && product.outrightPrice > 0) || (product.plans && product.plans.some(p => p.termYears === 'Outright'));
  }, [product]);

  const yearOptions = useMemo(() => {
    const terms = (product.plans || [])
      .filter(p => typeof p.termYears === 'number')
      .map(p => p.termYears as number);
    return Array.from(new Set<number>(terms)).sort((a: number, b: number) => a - b);
  }, [product.plans]);

  useEffect(() => {
    if (purchaseMode === 'rental') {
      const rentalPlans = (product.plans || []).filter(p => typeof p.termYears === 'number');
      if (rentalPlans.length > 0) {
        const lowestPricePlan = [...rentalPlans].sort((a, b) => a.price - b.price)[0];
        setSelectedTerm(lowestPricePlan.termYears as number);
        setSelectedMaintType(lowestPricePlan.maintenanceType);
      }
    } else {
      setSelectedTerm('Outright');
    }
  }, [purchaseMode, product.plans]);

  const currentPlan = useMemo(() => {
    const targetTerm = purchaseMode === 'outright' ? 'Outright' : selectedTerm;
    let plan = (product.plans || []).find(p => p.termYears === targetTerm && p.maintenanceType === selectedMaintType);
    if (!plan) plan = (product.plans || []).find(p => p.termYears === targetTerm);
    return plan;
  }, [purchaseMode, product.plans, selectedTerm, selectedMaintType]);

  const activePromo = useMemo(() => {
    if (!siteSettings?.promoTemplates) return null;
    return siteSettings.promoTemplates.find(t => t.applicableProductIds.includes(product.id));
  }, [siteSettings, product.id]);

  const basePrice = useMemo(() => {
    const planPrice = currentPlan?.price || 0;
    const hpOffsetStr = selectedHp?.value || "0";
    const hpOffset = Number(hpOffsetStr.replace(/[^0-9.-]+/g, "")) || 0;
    return planPrice + hpOffset;
  }, [currentPlan, selectedHp]);

  const finalPrice = useMemo(() => {
    if (!activePromo || purchaseMode === 'outright') return basePrice;
    if (activePromo.type === 'fixed_discount') return Math.max(0, basePrice - activePromo.value);
    if (activePromo.type === 'fixed_price') return activePromo.value;
    return Math.ceil(basePrice * (1 - activePromo.value / 100));
  }, [activePromo, basePrice, purchaseMode]);

  const totalSaved = useMemo(() => {
    if (!activePromo || purchaseMode === 'outright' || typeof selectedTerm !== 'number' || selectedTerm <= 0) return 0;
    
    const monthlyDiff = basePrice - finalPrice;
    let duration = selectedTerm * 12; // 默认直到合约结束
    if (activePromo.type === 'percentage' && activePromo.durationMonths) {
       // 百分比折扣根据设置的时长计算，其余根据全合约期计算
       duration = Math.min(duration, activePromo.durationMonths);
    }
    return monthlyDiff * duration;
  }, [activePromo, basePrice, finalPrice, purchaseMode, selectedTerm]);

  const currentModelId = useMemo(() => {
    const baseId = (product.modelId || product.id || "").toString().toUpperCase();
    const variantSuffix = (selectedVariant?.modelId || "").toString().toUpperCase();
    const hpSuffix = (selectedHp?.modelId || "").toString().toUpperCase();
    return `${baseId}${variantSuffix}${hpSuffix}`.replace(/\s+/g, '');
  }, [product, selectedVariant, selectedHp]);

  const displayImage = selectedVariant?.image || product.image;

  const cycleTerm = () => {
    if (purchaseMode !== 'rental' || yearOptions.length <= 1) return;
    const currentIndex = yearOptions.indexOf(selectedTerm as number);
    const nextIndex = (currentIndex + 1) % yearOptions.length;
    setSelectedTerm(yearOptions[nextIndex]);
  };

  const t = {
    en: { sub: "RENTAL", cash: "CASH", model: "MODEL", contract: "TERM", maint: "PLAN", contact: "INQUIRE NOW", ori: "Normal Monthly", save: "Entire Contract Savings", years: "Years", mth_short: "mth", hp: "SPEC", new: "NEW", bln: "/mth", promo_msg: (val: any, dur: any) => `${val}% OFF for first ${dur} months` },
    cn: { sub: "租赁", cash: "买断", model: "型号", contract: "合约年份", maint: "维护方案", contact: "立即咨询", ori: "原价 RM", save: "整个合约共节省", years: "年", mth_short: "月", hp: "规格选择", new: "新品", bln: "/月", promo_msg: (val: any, dur: any) => `前 ${dur} 个月 ${val}% 折扣` },
    ms: { sub: "SEWA", cash: "TUNAI", model: "MODEL", contract: "TEMPOH", maint: "SERVIS", contact: "TANYA SEKARANG", ori: "Harga Asal", save: "Jumlah Jimat Kontrak", years: "Tahun", mth_short: "bln", hp: "SPESIFIKASI", new: "BARU", bln: "/bln", promo_msg: (val: any, dur: any) => `Diskaun ${val}% untuk ${dur} bulan pertama` }
  }[language];

  return (
    <div className="bg-white rounded-[40px] md:rounded-[60px] p-5 md:p-16 border border-gray-100 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-3xl transition-all duration-700 text-left">
      <div className="absolute top-5 right-5 z-20 flex flex-col gap-2 items-end">
         {activePromo && (
           <div className={`bg-${activePromo.color || 'rose'}-500 text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full text-[8px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-xl animate-bounce`}>
             <Tag className="w-3 h-3 md:w-[16px] md:h-[16px]" fill="white" /> 
             {activePromo.title?.[language] || activePromo.title?.cn || 'PROMO'}
           </div>
         )}
         {product.isNew && (
           <div className="bg-black text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full text-[8px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-xl">
             <Star className="w-3 h-3 md:w-[16px] md:h-[16px]" fill="white" /> {t.new}
           </div>
         )}
         {product.isHotSale && (
           <div className="bg-lg-red text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full text-[8px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-xl animate-pulse">
             <Flame className="w-3 h-3 md:w-[16px] md:h-[16px]" fill="white" /> HOT
           </div>
         )}
      </div>

      <div className="space-y-1 md:space-y-3 mb-4 md:mb-10 pr-12">
        <h3 className="text-2xl md:text-7xl font-black text-gray-950 uppercase tracking-tighter leading-[0.9] italic leading-none">{product.name}</h3>
        <p className="text-gray-400 text-xs md:text-2xl font-bold uppercase tracking-widest italic">{product.subName?.[language] || product.subName?.cn}</p>
        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 md:px-6 py-1 md:py-2 rounded-xl w-fit mt-1 md:mt-4 border border-gray-100">
          <Info size={12} className="text-lg-red md:w-4 md:h-4" />
          <span className="text-[8px] md:text-[12px] font-black uppercase tracking-[0.1em]">{t.model}: {currentModelId}</span>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center mb-6 md:mb-16">
        <div className="relative flex items-center justify-center min-h-[220px] md:min-h-[500px] w-full">
          <img src={displayImage} className="max-h-[220px] md:max-h-[500px] object-contain relative z-10 transition-transform duration-1000 group-hover:scale-105" alt="" />
          {(product.variants || []).length > 1 && (
            <div className="absolute -bottom-2 md:-bottom-6 flex gap-2 md:gap-3 bg-white/90 backdrop-blur-xl px-4 py-2 md:px-6 md:py-3 rounded-full border border-gray-100 shadow-md z-20">
              {(product.variants || []).map((v, i) => (
                <button key={i} onClick={() => setSelectedVariant(v)}
                  className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 transition-all ${selectedVariant?.name === v.name ? 'border-lg-red scale-110 shadow-lg' : 'border-white opacity-40 hover:opacity-100'}`}
                  style={{ backgroundColor: v.colorCode || '#ddd' }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 md:space-y-4 mb-6 md:mb-12">
        {(product.features || []).slice(0, 4).map((f, i) => (
          <div key={i} className="flex items-center gap-3 md:gap-4 bg-gray-50/50 p-3 md:p-5 rounded-[20px] md:rounded-[25px] border border-gray-50">
             <div className="w-5 h-5 md:w-7 md:h-7 bg-white rounded-full flex items-center justify-center text-[#2ecc71] shadow-sm shrink-0 border border-gray-100"><Check className="w-3 h-3 md:w-4 md:h-4" strokeWidth={4} /></div>
             <p className="text-[11px] md:text-xl font-black text-gray-800 uppercase leading-tight italic">{f[language] || f.cn}</p>
          </div>
        ))}
      </div>

      {(product.hpOptions || []).length > 0 && (
        <div className="mb-4 md:mb-8 space-y-2">
           <label className="text-[9px] md:text-[11px] font-black text-gray-300 uppercase tracking-widest ml-1">{t.hp}</label>
           <div className="flex flex-wrap gap-2">
              {(product.hpOptions || []).map((hp, i) => (
                <button key={i} onClick={() => setSelectedHp(hp)}
                  className={`px-4 py-2 md:px-8 md:py-4 rounded-full text-[8px] md:text-[12px] font-black uppercase tracking-widest transition-all ${selectedHp?.value === hp.value ? 'bg-lg-red text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {hp.label?.[language] || hp.label?.cn || hp.value.split('/')[0]}
                </button>
              ))}
           </div>
        </div>
      )}

      {hasOutright && (
        <div className="flex bg-gray-100 p-1 md:p-1.5 rounded-[20px] md:rounded-[30px] mb-4 md:mb-8">
          <button onClick={() => setPurchaseMode('rental')} className={`flex-1 py-3 md:py-5 rounded-[15px] md:rounded-[25px] text-[10px] md:text-[13px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'rental' ? 'bg-white text-lg-red shadow-md' : 'text-gray-400'}`}>{t.sub}</button>
          <button onClick={() => setPurchaseMode('outright')} className={`flex-1 py-3 md:py-5 rounded-[15px] md:rounded-[25px] text-[10px] md:text-[13px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'outright' ? 'bg-white text-lg-red shadow-md' : 'text-gray-400'}`}>{t.cash}</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-12">
        <div className="space-y-1.5 md:space-y-3 text-left">
          <label className="text-[9px] md:text-[11px] font-black text-gray-300 uppercase tracking-widest ml-1">{t.contract}</label>
          <button disabled={purchaseMode === 'outright' || yearOptions.length <= 1} onClick={cycleTerm}
            className={`w-full p-4 md:p-8 rounded-[20px] md:rounded-[35px] text-xs md:text-2xl font-black text-center border transition-all flex flex-col items-center justify-center min-h-[65px] md:min-h-[110px] ${purchaseMode === 'rental' && yearOptions.length > 1 ? 'bg-white border-lg-red text-lg-red shadow-md' : 'bg-gray-50 border-gray-100 text-gray-950'}`}>
            {purchaseMode === 'rental' ? `${selectedTerm} ${t.years}` : "-"}
            {purchaseMode === 'rental' && yearOptions.length > 1 && <RotateCw className="w-3 h-3 md:w-5 md:h-5 mt-1 text-gray-300 animate-spin-slow" />}
          </button>
        </div>
        <div className="space-y-1.5 md:space-y-3 text-left">
          <label className="text-[9px] md:text-[11px] font-black text-gray-300 uppercase tracking-widest ml-1">{t.maint}</label>
          <button onClick={() => {
              const termPlans = (product.plans || []).filter(p => p.termYears === selectedTerm);
              if (termPlans.length > 1) {
                const curIdx = termPlans.findIndex(p => p.maintenanceType === selectedMaintType);
                const next = termPlans[(curIdx + 1) % termPlans.length];
                setSelectedMaintType(next.maintenanceType);
              }
          }} className="w-full p-4 md:p-8 rounded-[20px] md:rounded-[35px] text-[9px] md:text-xl font-black text-center border transition-all flex flex-col items-center justify-center min-h-[65px] md:min-h-[110px] bg-gray-50 border-gray-100 text-gray-950">
            <span className="truncate w-full px-1 uppercase leading-none">{selectedMaintType}</span>
          </button>
        </div>
      </div>

      <div className="mb-6 md:mb-16 text-center space-y-4 md:space-y-8">
         <div className="flex flex-col items-center">
            {totalSaved > 0 && purchaseMode === 'rental' && (
              <span className="text-xl md:text-3xl font-black text-gray-300 uppercase italic line-through decoration-lg-red/40 decoration-2 mb-2">{t.ori} {basePrice}</span>
            )}
            <div className="flex items-baseline justify-center gap-1.5 md:gap-4 overflow-visible">
               <span className="text-xl md:text-4xl font-black italic">RM</span>
               <span className="text-5xl md:text-[140px] font-black italic tracking-tighter text-gray-950 leading-none">{finalPrice}</span>
               <span className="text-[9px] md:text-xl font-black text-gray-400 uppercase tracking-widest">{t.bln}</span>
            </div>
         </div>
         
         {totalSaved > 0 && purchaseMode === 'rental' && (
           <div className="flex flex-col items-center gap-4 animate-fade-in">
              <div className="bg-amber-50 px-8 py-5 rounded-[30px] border border-amber-100 shadow-sm space-y-2">
                {activePromo?.type === 'percentage' && activePromo.durationMonths && (
                   <p className="text-[12px] md:text-[16px] font-black text-amber-600 uppercase italic tracking-wide">
                      ⚡ {t.promo_msg(activePromo.value, activePromo.durationMonths)}
                   </p>
                )}
                <p className="text-[14px] md:text-[20px] font-black text-gray-950 uppercase italic leading-none">
                   {t.save}: <span className="text-lg-red">RM {totalSaved}</span>
                </p>
                <div className="flex items-center gap-2 justify-center text-[9px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                   <Calendar size={12}/> {activePromo?.endDate ? `VALID UNTIL ${activePromo.endDate}` : 'LIMITED TIME'}
                </div>
              </div>
           </div>
         )}
      </div>

      <a href={`https://wa.me/${activeAgent?.whatsapp || siteSettings.recruitmentWa}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (${currentModelId}).`)}`} target="_blank" rel="noopener noreferrer" className="w-full bg-lg-dark text-white py-6 md:py-10 rounded-full font-black uppercase text-xs md:text-2xl tracking-[0.2em] md:tracking-[0.4em] flex items-center justify-center gap-3 md:gap-6 hover:bg-lg-red transition-all shadow-2xl active:scale-95">
        {t.contact} <ArrowRight className="w-5 h-5 md:w-8 md:h-8" />
      </a>
    </div>
  );
};

export default ProductCard;
