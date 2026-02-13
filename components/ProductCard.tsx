
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Agent, Language, ProductPlan, ProductVariant, SiteSettings, HpOption } from '../types.ts';
import { Zap, ArrowRight, Check, Info, Flame, BadgePercent, Share2, Sparkle, Tag, RotateCw } from 'lucide-react';

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

  const hasOutright = useMemo(() => {
    return (product.outrightPrice && product.outrightPrice > 0) || product.plans.some(p => p.termYears === 'Outright');
  }, [product]);

  const yearOptions = useMemo(() => {
    const terms = product.plans
      .filter(p => typeof p.termYears === 'number')
      .map(p => p.termYears as number);
    return Array.from(new Set<number>(terms)).sort((a: number, b: number) => a - b);
  }, [product.plans]);

  useEffect(() => {
    if (purchaseMode === 'rental') {
      const rentalPlans = product.plans.filter(p => typeof p.termYears === 'number');
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
    let plan = product.plans.find(p => p.termYears === targetTerm && p.maintenanceType === selectedMaintType);
    if (!plan) plan = product.plans.find(p => p.termYears === targetTerm);
    return plan;
  }, [purchaseMode, product.plans, selectedTerm, selectedMaintType]);

  const activePromo = useMemo(() => {
    if (!siteSettings?.promoTemplates) return null;
    return siteSettings.promoTemplates.find(t => t.applicableProductIds.includes(product.id));
  }, [siteSettings, product.id]);

  const basePrice = useMemo(() => {
    return (currentPlan?.price || 0) + (selectedHp?.rentalOffset || 0);
  }, [currentPlan, selectedHp]);

  const finalPrice = useMemo(() => {
    if (!activePromo || purchaseMode === 'outright') return basePrice;
    
    if (activePromo.type === 'fixed_discount') {
        return Math.max(0, basePrice - activePromo.value);
    }
    if (activePromo.type === 'fixed_price') {
        return activePromo.value;
    }
    return Math.ceil(basePrice * (1 - activePromo.value / 100));
  }, [activePromo, basePrice, purchaseMode]);

  const totalSaved = useMemo(() => {
    if (!activePromo || purchaseMode === 'outright') return 0;
    const monthlyDiscount = basePrice - finalPrice;
    const duration = (activePromo.type === 'percentage' && activePromo.durationMonths) 
      ? activePromo.durationMonths 
      : (typeof selectedTerm === 'number' ? selectedTerm * 12 : 1);
    return monthlyDiscount * duration;
  }, [activePromo, basePrice, finalPrice, purchaseMode, selectedTerm]);

  const displayImage = selectedVariant?.image || product.image;
  const currentModelId = (selectedHp?.modelId || selectedVariant?.modelId || product.modelId || product.id).toString().toUpperCase();

  const handleShare = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const query = activeAgent ? `?wa=${activeAgent.whatsapp}&name=${encodeURIComponent(activeAgent.name)}&t=${activeAgent.token || 'SECURE'}#home` : '';
    const shareLink = `${baseUrl}${query}`;
    const featuresList = (product.features || []).slice(0, 3).map(f => `✅ ${f[language] || f.cn}`).join('\n');
    const message = `🔥 *LG Subscribe Special: ${product.name}*\n\n${featuresList}\n\n📌 *Model:* ${currentModelId}\n💰 *Price:* RM ${finalPrice}/mth\n\n🔗 *Apply Now:* ${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const cycleTerm = () => {
    if (purchaseMode !== 'rental' || yearOptions.length <= 1) return;
    const currentIndex = yearOptions.indexOf(selectedTerm as number);
    const nextIndex = (currentIndex + 1) % yearOptions.length;
    setSelectedTerm(yearOptions[nextIndex]);
  };

  const t = {
    en: { sub: "MONTHLY RENTAL", cash: "OUTRIGHT TOTAL", model: "MODEL", contract: "CONTRACT", maint: "PLAN", contact: "INQUIRE NOW", ori: "Original Price", save: "Total Saved", years: "Years Plan", whole: "For the whole term", hp: "HORSEPOWER" },
    cn: { sub: "月付租赁", cash: "买断总价", model: "型号", contract: "合约年份", maint: "服务方案", contact: "立即咨询", ori: "原价", save: "整个合约期共节省", years: "年合约", whole: "直到合约结束", hp: "马力选择" },
    ms: { sub: "SEWA BULANAN", cash: "BELIAN TUNAI", model: "MODEL", contract: "KONTRAK", maint: "SERVIS", contact: "TANYA SEKARANG", ori: "Harga Asal", save: "Jumlah Jimat", years: "Tahun", whole: "Sehingga tamat kontrak", hp: "KUASA KUDA" }
  }[language];

  return (
    <div className="bg-white rounded-[60px] p-10 md:p-16 border border-gray-100 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-3xl transition-all duration-700 text-left">
      <button onClick={handleShare} className="absolute top-10 left-10 z-20 w-14 h-14 bg-white rounded-full flex items-center justify-center text-gray-300 hover:text-lg-red hover:bg-rose-50 border border-gray-100 shadow-md transition-all active:scale-90">
        <Share2 size={20} />
      </button>

      <div className="absolute top-10 right-10 z-20 flex flex-col gap-3 items-end">
         {activePromo && (
           <div className={`bg-${activePromo.color || 'cyan'}-500 text-white px-6 py-3 rounded-full text-[12px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl animate-bounce`}>
             <Tag size={16} fill="white" /> {activePromo.title[language] || 'PROMO'}
           </div>
         )}
         {product.isHotSale && <div className="bg-lg-red text-white px-6 py-3 rounded-full text-[12px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl animate-pulse"><Flame size={16} fill="white" /> 人气爆款</div>}
         {product.isNew && <div className="bg-black text-white px-6 py-3 rounded-full text-[12px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"><Sparkle size={16} fill="white" /> NEW</div>}
      </div>

      <div className="space-y-4 mb-10 pr-20">
        <h3 className="text-4xl md:text-6xl font-black text-gray-950 uppercase tracking-tighter leading-tight italic">{product.name}</h3>
        <p className="text-gray-500 text-lg md:text-xl font-bold uppercase tracking-widest italic">{product.subName?.[language] || product.subName?.cn}</p>
        <div className="flex items-center gap-3 text-gray-400 bg-gray-50 px-6 py-3 rounded-2xl w-fit mt-6 border border-gray-100">
          <Info size={18} className="text-lg-red" />
          <span className="text-[12px] font-black uppercase tracking-[0.2em]">{t.model}: {currentModelId}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative mb-14 min-h-[400px]">
        <img src={displayImage} className="max-h-[450px] object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-1000" alt="" />
        {product.variants && product.variants.length > 1 && (
          <div className="absolute bottom-0 flex gap-4 bg-white/90 backdrop-blur-xl px-8 py-4 rounded-full border border-gray-100 shadow-sm z-20">
            {product.variants.map((v, i) => (
              <button key={i} onClick={() => setSelectedVariant(v)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${selectedVariant?.name === v.name ? 'border-lg-red scale-125 shadow-xl' : 'border-white opacity-40 hover:opacity-100'}`}
                style={{ backgroundColor: v.colorCode || '#ddd' }} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-5 mb-14">
        {(product.features || []).slice(0, 4).map((f, i) => (
          <div key={i} className="flex items-center gap-5 bg-gray-50/50 p-6 rounded-[30px] border border-gray-50">
             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#2ecc71] shadow-sm shrink-0 border border-gray-100"><Check size={20} strokeWidth={4} /></div>
             <p className="text-sm md:text-lg font-black text-gray-800 uppercase leading-tight italic">{f[language] || f.cn}</p>
          </div>
        ))}
      </div>

      {product.hpOptions && product.hpOptions.length > 1 && (
        <div className="mb-10 space-y-4">
           <label className="text-[12px] font-black text-gray-300 uppercase tracking-widest ml-4">{t.hp}</label>
           <div className="flex flex-wrap gap-4">
              {product.hpOptions.map((hp, i) => (
                <button key={i} onClick={() => setSelectedHp(hp)}
                  className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${selectedHp?.value === hp.value ? 'bg-lg-red text-white shadow-xl' : 'bg-gray-100 text-gray-400'}`}>
                  {hp.value}
                </button>
              ))}
           </div>
        </div>
      )}

      {hasOutright && (
        <div className="flex bg-gray-100 p-2 rounded-[35px] mb-10">
          <button onClick={() => setPurchaseMode('rental')} className={`flex-1 py-5 rounded-[30px] text-[13px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'rental' ? 'bg-white text-lg-red shadow-lg' : 'text-gray-400'}`}>{t.sub}</button>
          <button onClick={() => setPurchaseMode('outright')} className={`flex-1 py-5 rounded-[30px] text-[13px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'outright' ? 'bg-white text-lg-red shadow-lg' : 'text-gray-400'}`}>{t.cash}</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8 mb-14">
        <div className="space-y-3 text-left">
          <label className="text-[12px] font-black text-gray-300 uppercase tracking-widest ml-4">{t.contract}</label>
          <button disabled={purchaseMode === 'outright' || yearOptions.length <= 1} onClick={cycleTerm}
            className={`w-full p-8 rounded-[35px] text-xl font-black text-center border transition-all flex flex-col items-center justify-center min-h-[100px] ${purchaseMode === 'rental' && yearOptions.length > 1 ? 'bg-white border-lg-red text-lg-red shadow-xl hover:scale-105 active:scale-95' : 'bg-gray-50 border-gray-100 text-gray-950 uppercase italic'}`}>
            {purchaseMode === 'rental' ? `${selectedTerm} ${t.years}` : "-"}
            {purchaseMode === 'rental' && yearOptions.length > 1 && <RotateCw size={14} className="mt-2 text-gray-300 animate-spin-slow" />}
          </button>
        </div>
        <div className="space-y-3 text-left">
          <label className="text-[12px] font-black text-gray-300 uppercase tracking-widest ml-4">{t.maint}</label>
          <button onClick={() => {
              const termPlans = product.plans.filter(p => p.termYears === selectedTerm);
              if (termPlans.length > 1) {
                const curIdx = termPlans.findIndex(p => p.maintenanceType === selectedMaintType);
                const next = termPlans[(curIdx + 1) % termPlans.length];
                setSelectedMaintType(next.maintenanceType);
              }
          }} className={`w-full p-8 rounded-[35px] text-lg font-black text-center border transition-all flex flex-col items-center justify-center min-h-[100px] ${product.plans.filter(p=>p.termYears === selectedTerm).length > 1 ? 'bg-white border-lg-red text-lg-red shadow-xl scale-105 active:scale-95' : 'bg-gray-50 border-gray-100 text-gray-950 uppercase italic'}`}>
            <span>{selectedMaintType}</span>
          </button>
        </div>
      </div>

      <div className="mb-16 text-center space-y-6">
         {purchaseMode === 'rental' && activePromo && (
           <div className="text-gray-400 text-xl font-black uppercase tracking-widest italic flex items-center justify-center gap-4">
             {t.ori} <span className="line-through">RM {basePrice}</span>
           </div>
         )}
         <div className="flex items-baseline justify-center gap-4">
            <span className="text-4xl font-black italic">RM</span>
            <span className="text-9xl md:text-[160px] font-black italic tracking-tighter text-gray-950 leading-none">{finalPrice}</span>
            <span className="text-base font-black text-gray-400 uppercase">/ {purchaseMode === 'rental' ? 'MONTH' : 'TOTAL'}</span>
         </div>
         {purchaseMode === 'rental' && activePromo && (
           <div className={`mt-10 p-8 rounded-[40px] border border-${activePromo.color || 'cyan'}-100 bg-${activePromo.color || 'cyan'}-50/50 text-left animate-fade-up shadow-sm`}>
              <div className={`flex items-center gap-5 text-${activePromo.color || 'cyan'}-700 mb-3`}>
                <BadgePercent size={28} />
                <span className="text-base md:text-xl font-black uppercase tracking-widest italic">
                  {activePromo.title[language] || activePromo.title.cn}: 
                  {activePromo.type === 'percentage' ? ` 前 ${activePromo.durationMonths} 个月 ${activePromo.value}% 折扣` :
                   activePromo.type === 'fixed_discount' ? ` ${t.whole} 立减 RM ${activePromo.value}` :
                   ` ${t.whole} 特惠价 RM ${activePromo.value}`}
                </span>
              </div>
              <p className={`text-sm md:text-base font-black text-${activePromo.color || 'cyan'}-800 uppercase tracking-widest`}>
                {t.save} <span className="text-lg-red text-xl">RM {totalSaved}</span>
              </p>
           </div>
         )}
      </div>

      <a href={`https://wa.me/${activeAgent?.whatsapp || siteSettings.recruitmentWa}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (${currentModelId}).${activeAgent ? ` [Agent Code: ${activeAgent.token || 'SECURE'}]` : ''}`)}`} target="_blank" rel="noopener noreferrer" className="w-full bg-lg-dark text-white py-11 rounded-full font-black uppercase text-lg tracking-[0.4em] flex items-center justify-center gap-6 hover:bg-lg-red transition-all shadow-3xl active:scale-95">
        {t.contact} <ArrowRight size={28} />
      </a>
    </div>
  );
};

export default ProductCard;
