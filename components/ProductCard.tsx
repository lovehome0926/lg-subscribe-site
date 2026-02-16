
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Agent, Language, ProductPlan, ProductVariant, SiteSettings, HpOption } from '../types.ts';
import { Zap, ArrowRight, Check, Info, Flame, BadgePercent, Share2, Tag, RotateCw } from 'lucide-react';

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

  // 强化三语翻译词典 - 彻底覆盖促销所有组件
  // Add 'hp' key to translations
  const t = {
    en: { 
      sub: "RENTAL", cash: "CASH", model: "MODEL", contract: "TERM", maint: "PLAN", contact: "INQUIRE NOW", ori: "Normal Price", 
      save: "Total Saved", years: "Years", mth_short: "mth", hp: "SPEC",
      promo_first: "First", promo_months: "Months", promo_off: "OFF", promo_spec: "Special"
    },
    cn: { 
      sub: "租凭", cash: "买断", model: "型号", contract: "年份", maint: "方案", contact: "立即咨询", ori: "原价", 
      save: "整个合约期共节省", years: "年", mth_short: "月", hp: "规格",
      promo_first: "前", promo_months: "个月", promo_off: "折扣", promo_spec: "特惠"
    },
    ms: { 
      sub: "SEWA", cash: "TUNAI", model: "MODEL", contract: "TEMPOH", maint: "SERVIS", contact: "TANYA SEKARANG", ori: "Harga Asal", 
      save: "Jumlah Jimat", years: "Tahun", mth_short: "bln", hp: "SPESIFIKASI",
      promo_first: "Pertama", promo_months: "Bulan", promo_off: "DISKAUN", promo_spec: "Istimewa"
    }
  }[language];

  return (
    <div className="bg-white rounded-[40px] md:rounded-[60px] p-5 md:p-16 border border-gray-100 flex flex-col relative overflow-hidden group shadow-sm hover:shadow-3xl transition-all duration-700 text-left">
      {/* 分享按钮 */}
      <button onClick={handleShare} className="absolute top-5 left-5 z-20 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center text-gray-300 hover:text-lg-red hover:bg-rose-50 border border-gray-100 shadow-md transition-all active:scale-90">
        <Share2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
      </button>

      {/* 状态徽章 */}
      <div className="absolute top-5 right-5 z-20 flex flex-col gap-1.5 items-end">
         {activePromo && (
           <div className={`bg-${activePromo.color || 'cyan'}-500 text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full text-[8px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-xl animate-bounce`}>
             <Tag className="w-3 h-3 md:w-[16px] md:h-[16px]" fill="white" /> 
             {activePromo.title[language] || activePromo.title.cn || activePromo.title.en || 'PROMO'}
           </div>
         )}
         {product.isHotSale && <div className="bg-lg-red text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full text-[8px] md:text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-xl animate-pulse"><Flame className="w-3 h-3 md:w-[16px] md:h-[16px]" fill="white" /> HOT</div>}
      </div>

      {/* 标题部分 */}
      <div className="space-y-1 md:space-y-3 mb-4 md:mb-10 pr-12">
        <h3 className="text-2xl md:text-7_xl font-black text-gray-950 uppercase tracking-tighter leading-tight italic">{product.name}</h3>
        <p className="text-gray-400 text-xs md:text-2xl font-bold uppercase tracking-widest italic">{product.subName?.[language] || product.subName?.cn}</p>
        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 md:px-6 py-1 md:py-2 rounded-xl w-fit mt-1 md:mt-4 border border-gray-100">
          <Info size={12} className="text-lg-red md:w-4 md:h-4" />
          <span className="text-[8px] md:text-[12px] font-black uppercase tracking-[0.1em]">{t.model}: {currentModelId}</span>
        </div>
      </div>

      {/* 产品主图 - 电脑端恢复较大的展示空间 */}
      <div className="relative flex flex-col items-center justify-center mb-6 md:mb-16">
        <div className="relative flex items-center justify-center min-h-[220px] md:min-h-[500px] w-full">
          <img src={displayImage} className="max-h-[220px] md:max-h-[500px] object-contain relative z-10 drop-shadow-2xl group-hover:scale-105 transition-transform duration-1000" alt="" />
          {product.variants && product.variants.length > 1 && (
            <div className="absolute -bottom-2 md:-bottom-6 flex gap-2 md:gap-3 bg-white/90 backdrop-blur-xl px-4 py-2 md:px-6 md:py-3 rounded-full border border-gray-100 shadow-md z-20">
              {product.variants.map((v, i) => (
                <button key={i} onClick={() => setSelectedVariant(v)}
                  className={`w-4 h-4 md:w-6 md:h-6 rounded-full border-2 transition-all ${selectedVariant?.name === v.name ? 'border-lg-red scale-110 shadow-lg' : 'border-white opacity-40 hover:opacity-100'}`}
                  style={{ backgroundColor: v.colorCode || '#ddd' }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 核心卖点 - 电脑端垂直列表显示更整齐 */}
      <div className="space-y-2 md:space-y-4 mb-6 md:mb-12">
        {(product.features || []).slice(0, 4).map((f, i) => (
          <div key={i} className="flex items-center gap-3 md:gap-4 bg-gray-50/50 p-3 md:p-5 rounded-[20px] md:rounded-[25px] border border-gray-50">
             <div className="w-5 h-5 md:w-7 md:h-7 bg-white rounded-full flex items-center justify-center text-[#2ecc71] shadow-sm shrink-0 border border-gray-100"><Check className="w-3 h-3 md:w-4 md:h-4" strokeWidth={4} /></div>
             <p className="text-[11px] md:text-xl font-black text-gray-800 uppercase leading-tight italic">{f[language] || f.cn}</p>
          </div>
        ))}
      </div>

      {/* 马力/配置选项 */}
      {product.hpOptions && product.hpOptions.length > 0 && (
        <div className="mb-4 md:mb-8 space-y-2">
           <label className="text-[9px] md:text-[11px] font-black text-gray-300 uppercase tracking-widest ml-1">{t.hp}</label>
           <div className="flex flex-wrap gap-2">
              {product.hpOptions.map((hp, i) => (
                <button key={i} onClick={() => setSelectedHp(hp)}
                  className={`px-4 py-2 md:px-8 md:py-4 rounded-full text-[8px] md:text-[12px] font-black uppercase tracking-widest transition-all ${selectedHp?.value === hp.value ? 'bg-lg-red text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {hp.value}
                </button>
              ))}
           </div>
        </div>
      )}

      {/* 租/买切换 */}
      {hasOutright && (
        <div className="flex bg-gray-100 p-1 md:p-1.5 rounded-[20px] md:rounded-[30px] mb-4 md:mb-8">
          <button onClick={() => setPurchaseMode('rental')} className={`flex-1 py-3 md:py-5 rounded-[15px] md:rounded-[25px] text-[10px] md:text-[13px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'rental' ? 'bg-white text-lg-red shadow-md' : 'text-gray-400'}`}>{t.sub}</button>
          <button onClick={() => setPurchaseMode('outright')} className={`flex-1 py-3 md:py-5 rounded-[15px] md:rounded-[25px] text-[10px] md:text-[13px] font-black uppercase tracking-widest transition-all ${purchaseMode === 'outright' ? 'bg-white text-lg-red shadow-md' : 'text-gray-400'}`}>{t.cash}</button>
        </div>
      )}

      {/* 合约/服务方案选择 */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-12">
        <div className="space-y-1.5 md:space-y-3 text-left">
          <label className="text-[9px] md:text-[11px] font-black text-gray-300 uppercase tracking-widest ml-1">{t.contract}</label>
          <button disabled={purchaseMode === 'outright' || yearOptions.length <= 1} onClick={cycleTerm}
            className={`w-full p-4 md:p-8 rounded-[20px] md:rounded-[35px] text-xs md:text-2xl font-black text-center border transition-all flex flex-col items-center justify-center min-h-[65px] md:min-h-[110px] ${purchaseMode === 'rental' && yearOptions.length > 1 ? 'bg-white border-lg-red text-lg-red shadow-md hover:scale-[1.02]' : 'bg-gray-50 border-gray-100 text-gray-950 uppercase italic'}`}>
            {purchaseMode === 'rental' ? `${selectedTerm} ${t.years}` : "-"}
            {purchaseMode === 'rental' && yearOptions.length > 1 && <RotateCw className="w-3 h-3 md:w-5 md:h-5 mt-1 text-gray-300 animate-spin-slow" />}
          </button>
        </div>
        <div className="space-y-1.5 md:space-y-3 text-left">
          <label className="text-[9px] md:text-[11px] font-black text-gray-300 uppercase tracking-widest ml-1">{t.maint}</label>
          <button onClick={() => {
              const termPlans = product.plans.filter(p => p.termYears === selectedTerm);
              if (termPlans.length > 1) {
                const curIdx = termPlans.findIndex(p => p.maintenanceType === selectedMaintType);
                const next = termPlans[(curIdx + 1) % termPlans.length];
                setSelectedMaintType(next.maintenanceType);
              }
          }} className={`w-full p-4 md:p-8 rounded-[20px] md:rounded-[35px] text-[9px] md:text-xl font-black text-center border transition-all flex flex-col items-center justify-center min-h-[65px] md:min-h-[110px] ${product.plans.filter(p=>p.termYears === selectedTerm).length > 1 ? 'bg-white border-lg-red text-lg-red shadow-md hover:scale-[1.02]' : 'bg-gray-50 border-gray-100 text-gray-950 uppercase italic'}`}>
            <span className="truncate w-full px-1">{selectedMaintType}</span>
          </button>
        </div>
      </div>

      {/* 价格与促销信息 */}
      <div className="mb-6 md:mb-16 text-center space-y-2 md:space-y-6">
         {purchaseMode === 'rental' && activePromo && (
           <div className="text-gray-400 text-xs md:text-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-2">
             {t.ori} <span className="line-through">RM {basePrice}</span>
           </div>
         )}
         <div className="flex items-baseline justify-center gap-1.5 md:gap-4">
            <span className="text-xl md:text-4xl font-black italic">RM</span>
            <span className="text-5xl md:text-[160px] font-black italic tracking-tighter text-gray-950 leading-none">{finalPrice}</span>
            <span className="text-[9px] md:text-xl font-black text-gray-400 uppercase">/ {purchaseMode === 'rental' ? t.mth_short : 'TOTAL'}</span>
         </div>
         
         {/* 促销信息面板 - 强化三语 */}
         {purchaseMode === 'rental' && activePromo && (
           <div className={`mt-4 md:mt-10 p-5 md:p-10 rounded-[25px] md:rounded-[45px] border border-${activePromo.color || 'cyan'}-100 bg-${activePromo.color || 'cyan'}-50/50 text-left animate-fade-up shadow-sm`}>
              <div className={`flex items-center gap-3 md:gap-5 text-${activePromo.color || 'cyan'}-700 mb-2 md:mb-4`}>
                <BadgePercent className="w-5 h-5 md:w-8 md:h-8" />
                <span className="text-[10px] md:text-2xl font-black uppercase tracking-widest italic leading-tight">
                  {/* 这里确保标题是翻译过的 */}
                  {activePromo.title[language] || activePromo.title.cn || activePromo.title.en || 'PROMO'}: 
                  {activePromo.type === 'percentage' ? ` ${t.promo_first} ${activePromo.durationMonths} ${t.promo_months} ${activePromo.value}% ${t.promo_off}` :
                   activePromo.type === 'fixed_discount' ? ` ${t.promo_spec} RM ${activePromo.value} ${t.promo_off}` :
                   ` ${t.promo_spec} RM ${activePromo.value}`}
                </span>
              </div>
              <p className={`text-[9px] md:text-lg font-black text-${activePromo.color || 'cyan'}-800 uppercase tracking-widest`}>
                {t.save} <span className="text-lg-red text-sm md:text-3xl">RM {totalSaved}</span>
              </p>
           </div>
         )}
      </div>

      {/* 底部咨询按钮 */}
      <a href={`https://wa.me/${activeAgent?.whatsapp || siteSettings.recruitmentWa}?text=${encodeURIComponent(`Hi, I'm interested in ${product.name} (${currentModelId}).${activeAgent ? ` [Agent Code: ${activeAgent.token || 'SECURE'}]` : ''}`)}`} target="_blank" rel="noopener noreferrer" className="w-full bg-lg-dark text-white py-6 md:py-10 rounded-full font-black uppercase text-xs md:text-2xl tracking-[0.2em] md:tracking-[0.4em] flex items-center justify-center gap-3 md:gap-6 hover:bg-lg-red transition-all shadow-2xl active:scale-95">
        {t.contact} <ArrowRight className="w-5 h-5 md:w-8 md:h-8" />
      </a>
    </div>
  );
};

export default ProductCard;
