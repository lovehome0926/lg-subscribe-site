
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Agent, Language, ProductPlan, ProductVariant, SiteSettings, HpOption } from '../types.ts';
import { Zap, ArrowRight, Check, Info, Flame, Calendar, BadgePercent, Clock, RefreshCw } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  activeAgent: Agent | null;
  language: Language;
  siteSettings: SiteSettings;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, activeAgent, language, siteSettings }) => {
  if (!product || !Array.isArray(product.plans) || product.plans.length === 0) return null;

  const [purchaseMode, setPurchaseMode] = useState<'rental' | 'outright'>('rental');
  const [selectedTerm, setSelectedTerm] = useState<number | 'Outright'>(0);
  const [selectedMaintType, setSelectedMaintType] = useState<ProductPlan['maintenanceType']>('Regular Visit');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(product.variants?.[0] || null);
  const [selectedHp, setSelectedHp] = useState<HpOption | null>(product.hpOptions?.[0] || null);

  // 判断是否具备买断选项
  const hasOutrightOption = useMemo(() => {
    return (product.outrightPrice && product.outrightPrice > 0) || product.plans.some(p => p.termYears === 'Outright');
  }, [product]);

  useEffect(() => {
    if (purchaseMode === 'rental') {
      const rentalPlans = product.plans.filter(p => typeof p.termYears === 'number');
      if (rentalPlans.length > 0) {
        const lowest = rentalPlans.reduce((min, p) => p.price < min.price ? p : min, rentalPlans[0]);
        setSelectedTerm(lowest.termYears as number);
        setSelectedMaintType(lowest.maintenanceType || 'Regular Visit');
      }
    } else {
      setSelectedTerm('Outright');
      const outrightPlan = product.plans.find(p => p.termYears === 'Outright');
      if (outrightPlan) setSelectedMaintType(outrightPlan.maintenanceType || 'Regular Visit');
    }
  }, [purchaseMode, product.plans]);

  const toggleMaintenance = () => {
    const termPlans = product.plans.filter(p => p.termYears === selectedTerm);
    if (termPlans.length <= 1) return;
    const currentIndex = termPlans.findIndex(p => p.maintenanceType === selectedMaintType);
    const nextIndex = (currentIndex + 1) % termPlans.length;
    setSelectedMaintType(termPlans[nextIndex].maintenanceType);
  };

  const currentPlan = useMemo(() => {
    const targetTerm = purchaseMode === 'outright' ? 'Outright' : selectedTerm;
    let plan = product.plans.find(p => p.termYears === targetTerm && p.maintenanceType === selectedMaintType);
    if (!plan) plan = product.plans.find(p => p.termYears === targetTerm);
    
    if (plan && selectedHp) {
      const offset = purchaseMode === 'rental' ? (selectedHp.rentalOffset || 0) : (selectedHp.cashOffset || 0);
      return { ...plan, price: plan.price + offset };
    }
    // 如果是买断模式且没有 plan，回退到 outrightPrice 字段
    if (!plan && purchaseMode === 'outright') {
      return { termYears: 'Outright', maintenanceType: 'No Service', serviceInterval: 'None', price: product.outrightPrice || 0 } as ProductPlan;
    }
    return plan;
  }, [purchaseMode, product.plans, selectedTerm, selectedMaintType, selectedHp, product.outrightPrice]);

  const activePromo = useMemo(() => {
    if (!siteSettings?.promoTemplates) return null;
    return siteSettings.promoTemplates.find(t => t.applicableProductIds.includes(product.id));
  }, [siteSettings, product.id]);

  const finalMonthlyPrice = useMemo(() => {
    if (!currentPlan) return 0;
    if (purchaseMode === 'outright') return currentPlan.price;
    if (!activePromo) return currentPlan.price;
    return Math.ceil(currentPlan.price * (1 - activePromo.value / 100));
  }, [activePromo, currentPlan, purchaseMode]);

  const totalSavings = useMemo(() => {
    if (!activePromo || !currentPlan || purchaseMode === 'outright') return 0;
    const discountAmountPerMonth = currentPlan.price - finalMonthlyPrice;
    return Math.ceil(discountAmountPerMonth * (activePromo.durationMonths || 0));
  }, [activePromo, currentPlan, finalMonthlyPrice, purchaseMode]);

  const displayImage = selectedVariant?.image || product.image;
  const currentModelId = selectedVariant?.modelId || selectedHp?.modelId || product.modelId || product.id;

  const t = {
    en: { sub: "MONTHLY RENTAL", cash: "OUTRIGHT PRICE", model: "MODEL", contract: "CONTRACT", maint: "MAINTENANCE", saved: "Saved RM", original: "Original RM" },
    cn: { sub: "月付租赁", cash: "买断总价", model: "型号", contract: "CONTRACT", maint: "MAINTENANCE", saved: "整个合约期共节省 RM", original: "原价 RM" },
    ms: { sub: "SEWA BULANAN", cash: "HARGA TUNAI", model: "MODEL", contract: "CONTRACT", maint: "MAINTENANCE", saved: "JUMLAH JIMAT RM", original: "Asal RM" }
  }[language];

  const hasMultipleMaint = product.plans.filter(p => p.termYears === selectedTerm).length > 1;

  return (
    <div className="bg-white rounded-[40px] p-6 md:p-10 border border-gray-100 flex flex-col min-h-[95vh] md:h-full relative overflow-hidden shadow-sm group hover:shadow-2xl transition-all duration-500">
      <div className="absolute top-6 right-6 z-20 flex flex-col gap-2 items-end">
         {product.isHotSale && <div className="bg-[#fb6f5b] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"><Flame size={14} fill="white" /> POPULAR</div>}
         {activePromo && purchaseMode === 'rental' && <div className="bg-lg-dark text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-sm"><Zap size={14} fill="white" /> PROMO</div>}
      </div>

      <div className="space-y-2 mb-8 text-left pr-24">
        <h3 className="text-xl md:text-3xl font-black text-lg-red uppercase tracking-tighter leading-tight italic">{product.name}</h3>
        <div className="flex flex-col gap-1">
           <p className="text-sm md:text-lg font-bold text-gray-400 uppercase tracking-wide">{product.subName?.[language] || ""}</p>
           <div className="flex items-center gap-2 text-gray-300 bg-gray-50 px-2 py-1 rounded-lg w-fit mt-1"><Info size={12} /><span className="text-[10px] font-black uppercase tracking-widest leading-none">{t.model}: {currentModelId}</span></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative mb-10 min-h-[250px]">
        <div className="absolute inset-0 bg-gray-50 rounded-full scale-90 opacity-40"></div>
        <img src={displayImage} className="max-h-[350px] object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-700" alt="" />
        {product.variants && product.variants.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 z-20 pb-4">
             {product.variants.map((v, i) => (
                <button key={i} onClick={() => setSelectedVariant(v)} className={`w-5 h-5 rounded-full border-2 transition-all ${selectedVariant?.name === v.name ? 'border-lg-red scale-125' : 'border-gray-200'}`} style={{ backgroundColor: v.colorCode || '#f1f1f1' }} />
             ))}
          </div>
        )}
      </div>

      <div className="space-y-3 mb-10">
        {(product.features || []).map((f, i) => (
          <div key={i} className="flex items-center gap-4 bg-[#f8f9fa] p-4 rounded-2xl border border-gray-100">
             <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#2ecc71] shadow-sm shrink-0"><Check size={14} strokeWidth={4} /></div>
             <p className="text-[13px] font-bold text-gray-800 leading-tight">{f[language]}</p>
          </div>
        ))}
      </div>

      {/* 只有具备买断价格时才显示切换选项卡 */}
      {hasOutrightOption && (
        <div className="bg-[#f1f3f5] p-1.5 rounded-[22px] mb-8 flex">
          <button onClick={() => setPurchaseMode('rental')} className={`flex-1 py-3 rounded-[18px] text-xs font-black transition-all ${purchaseMode === 'rental' ? 'bg-white text-lg-red shadow-sm' : 'text-gray-400'}`}>{t.sub}</button>
          <button onClick={() => setPurchaseMode('outright')} className={`flex-1 py-3 rounded-[18px] text-xs font-black transition-all ${purchaseMode === 'outright' ? 'bg-white text-lg-red shadow-sm' : 'text-gray-400'}`}>{t.cash}</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t.contract}</label>
          <div className="bg-[#f8f9fa] p-4 rounded-2xl text-[13px] font-black text-center border border-gray-100 uppercase tracking-tighter">
            {purchaseMode === 'rental' ? `${selectedTerm} YEARS` : "CASH"}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t.maint}</label>
          <button 
            disabled={!hasMultipleMaint}
            onClick={toggleMaintenance}
            className={`w-full p-4 rounded-2xl text-[12px] font-black text-center border transition-all flex flex-col gap-0.5 justify-center min-h-[56px] ${hasMultipleMaint ? 'bg-white border-lg-red/20 shadow-lg cursor-pointer hover:bg-rose-50' : 'bg-[#f8f9fa] border-gray-100'}`}
          >
            <span className="leading-tight flex items-center justify-center gap-2">
              {selectedMaintType} {hasMultipleMaint && <RefreshCw size={10} className="text-lg-red" />}
            </span>
            {currentPlan?.serviceInterval && currentPlan?.serviceInterval !== 'None' && (
              <span className="text-[8px] text-lg-red flex items-center justify-center gap-1 font-black uppercase tracking-widest"><Clock size={10}/> EVERY {currentPlan?.serviceInterval}</span>
            )}
          </button>
        </div>
      </div>

      <div className="mb-10 text-center space-y-2 relative">
         {activePromo && purchaseMode === 'rental' && <div className="text-gray-400 text-sm font-bold uppercase tracking-widest line-through decoration-lg-red/40 decoration-2">{t.original} {currentPlan?.price}</div>}
         <div className="flex items-baseline justify-center gap-1"><span className="text-xl font-black italic">RM</span><span className="text-7xl font-black italic tracking-tighter text-gray-950">{finalMonthlyPrice}</span><span className="text-xs font-black text-gray-400 uppercase">/ {purchaseMode === 'rental' ? 'MONTH' : 'TOTAL'}</span></div>
      </div>

      {activePromo && purchaseMode === 'rental' && (
        <div className="space-y-3 mb-10">
           <div className="bg-[#e0fbff] p-5 rounded-[30px] flex flex-col gap-2 border border-[#b8f2f9] shadow-inner">
               <div className="flex items-center gap-3"><BadgePercent size={20} className="text-[#00bcd4]" /><span className="text-[12px] font-black text-[#008ba3] uppercase tracking-tighter leading-none">{activePromo.title[language]}: 第一至 {activePromo.durationMonths} 个月 {activePromo.value}% 折扣</span></div>
               <div className="pl-8"><span className="text-[11px] font-black text-[#008ba3] bg-white/60 px-3 py-1 rounded-full">{t.saved} {totalSavings}</span></div>
           </div>
        </div>
      )}

      <a href={`https://wa.me/${activeAgent?.whatsapp || siteSettings.recruitmentWa || "60177473787"}?text=Hi, I'm interested in ${encodeURIComponent(product.name)} (Model: ${currentModelId}). Referral: ${encodeURIComponent(activeAgent?.name || 'HQ')}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#05090f] text-white py-6 rounded-full font-black uppercase text-[12px] tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-lg-red transition-all shadow-xl active:scale-95">立即咨询 <ArrowRight size={18} /></a>
    </div>
  );
};

export default ProductCard;
