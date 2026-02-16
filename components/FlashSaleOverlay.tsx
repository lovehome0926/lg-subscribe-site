
import React, { useState, useEffect, useMemo } from 'react';
import { SiteSettings, Language, Product, Lead, Agent } from '../types.ts';
import { X, Bell, Zap, CheckCircle, Package, Timer, ArrowRight, User, Phone, MapPin, Tag, Check, Calendar, BadgePercent, TrendingDown } from 'lucide-react';
import { saveLeadDB } from '../utils/db.ts';

interface FlashSaleOverlayProps {
  siteSettings: SiteSettings;
  products: Product[];
  language: Language;
  onClose: () => void;
  activeAgent: Agent | null;
}

const FlashSaleOverlay: React.FC<FlashSaleOverlayProps> = ({ 
  siteSettings, products = [], language, onClose, activeAgent 
}) => {
  const config = siteSettings?.flashSale;
  
  // 增加鲁棒性：产品 ID 匹配忽略大小写和前后空格
  const product = useMemo(() => {
    if (!config?.productId || !products?.length) return null;
    const targetId = config.productId.toLowerCase().trim();
    return products.find(p => p.id.toLowerCase().trim() === targetId);
  }, [products, config?.productId]);

  if (!config || !config.isActive || !product) return null;

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phone: '', postcode: '' });
  const [loading, setLoading] = useState(false);

  // 1. 获取该产品已选中的促销模板
  const activePromo = useMemo(() => {
    if (!siteSettings?.promoTemplates) return null;
    return siteSettings.promoTemplates.find(t => t.applicableProductIds.includes(product.id));
  }, [siteSettings, product.id]);

  // 2. 价格逻辑修正：优先应用管理员手动填写的原价和优惠价
  const priceDisplay = useMemo(() => {
    // 检查是否有手动覆盖
    if (config.customWasPrice && config.customPromoPrice) {
      const monthlyDiff = config.customWasPrice - config.customPromoPrice;
      const termYears = 5; 
      const totalSaved = monthlyDiff * 12 * termYears;
      return { 
        normal: config.customWasPrice, 
        promo: config.customPromoPrice, 
        totalSaved, 
        monthlyDiff,
        term: termYears
      };
    }

    const rentalPlans = (product.plans || []).filter(p => typeof p.termYears === 'number');
    const basePlan = rentalPlans.length > 0 
      ? [...rentalPlans].sort((a, b) => a.price - b.price)[0] 
      : null;
    
    const displayNormalPrice = (product.normalPrice && product.normalPrice > 0) 
      ? product.normalPrice 
      : (basePlan?.price || 0);

    const basePriceForPromo = basePlan?.price || displayNormalPrice;
    
    let finalPromoPrice = basePriceForPromo;
    
    if (activePromo) {
      if (activePromo.type === 'fixed_discount') finalPromoPrice = Math.max(0, basePriceForPromo - activePromo.value);
      else if (activePromo.type === 'fixed_price') finalPromoPrice = activePromo.value;
      else if (activePromo.type === 'percentage') finalPromoPrice = Math.ceil(basePriceForPromo * (1 - activePromo.value / 100));
    } else if (product.promoPrice && product.promoPrice > 0) {
      finalPromoPrice = product.promoPrice;
    }

    const monthlyDiff = displayNormalPrice - finalPromoPrice;
    const termYears = typeof basePlan?.termYears === 'number' ? basePlan.termYears : 5;
    const totalSaved = monthlyDiff * 12 * termYears; 

    return { 
      normal: displayNormalPrice, 
      promo: finalPromoPrice, 
      totalSaved, 
      monthlyDiff,
      term: termYears
    };
  }, [product, activePromo, config.customWasPrice, config.customPromoPrice]);

  const [timeLeft, setTimeLeft] = useState<{days:number, hrs:number, mins:number, secs:number}>({days:0, hrs:0, mins:0, secs:0});
  const launchTime = useMemo(() => {
    if (!config.launchDate) return Date.now();
    return new Date(`${config.launchDate}T00:00:00`).getTime();
  }, [config.launchDate]);
  
  const isLaunched = useMemo(() => Date.now() >= launchTime, [launchTime]);

  useEffect(() => {
    if (isLaunched) return;
    const timer = setInterval(() => {
      const diff = launchTime - Date.now();
      if (diff <= 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hrs: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / 1000 / 60) % 60),
        secs: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [launchTime, isLaunched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.postcode) return;
    setLoading(true);
    try {
      const lead: Lead = {
        id: `LEAD-${Date.now()}`,
        fullName: formData.fullName,
        phone: formData.phone,
        postcode: formData.postcode,
        productId: product.id,
        agentToken: activeAgent?.token,
        timestamp: Date.now()
      };
      await saveLeadDB(lead);
      setIsSubmitted(true);
      setTimeout(onClose, 3000);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const t = {
    en: { limited: "LIMITED EDITION", qty: "600 UNITS ONLY", notify: "DAFTAR SEKARANG", success: "Application Received!", close: "Close", form_name: "Nama Penuh (IC)", form_phone: "No WhatsApp", form_postcode: "Poskod", grab: "BELI SEKARANG", countdown: "MASA MELANCARKAN", ori: "HARGA BULANAN ASAL", promo: "HARGA PROMOSI", save: "JUMLAH JIMAT KONTRAK", mth: "/BLN", valid: "OFFER VALID UNTIL" },
    cn: { limited: "年度限量抢购", qty: "仅限前 600 名用户", notify: "立即报名预约", success: "预约成功！名额已为您锁定", close: "关闭窗口", form_name: "姓名 (如 IC 所示)", form_phone: "WhatsApp 手机号码", form_postcode: "邮政编码", grab: "立即抢购", countdown: "距离抢购开始还有", ori: "原价月费", promo: "限时抢购价", save: "整个合约共节省", mth: "/月", valid: "优惠截止日期" },
    ms: { limited: "EDISI TERHAD", qty: "HANYA 600 UNIT", notify: "DAFTAR SEKARANG", success: "Permohonan Diterima!", close: "Tutup", form_name: "Nama Penuh (seperti IC)", form_phone: "No WhatsApp", form_postcode: "Poskod", grab: "BELI SEKARANG", countdown: "MASA MELANCARKAN", ori: "HARGA BULANAN ASAL", promo: "HARGA PROMOSI", save: "JUMLAH JIMAT KONTRAK", mth: "/BLN", valid: "OFFER VALID UNTIL" }
  }[language];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4 bg-black/75 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-5xl max-h-[96vh] md:max-h-[88vh] bg-white rounded-[25px] md:rounded-[45px] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-up border border-gray-100">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 md:top-5 md:right-5 z-50 w-8 h-8 md:w-10 md:h-10 bg-gray-50/90 text-gray-400 hover:bg-lg-red hover:text-white rounded-full flex items-center justify-center transition-all group shadow-sm border border-gray-100">
          <X size={18} className="group-hover:rotate-90 transition-transform" />
        </button>

        {/* Left Side: Product Focus - Compact for one-page fit */}
        <div className="w-full md:w-[32%] bg-[#f8f9fa] p-3 md:p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-100 h-[140px] md:h-auto shrink-0">
           <div className="absolute top-3 left-3 flex flex-col gap-1 z-20">
              <div className="bg-lg-red text-white px-2 py-0.5 rounded-full text-[7px] md:text-[8px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm">
                <Zap size={8} fill="white" /> {t.limited}
              </div>
              <div className="bg-black text-white px-2 py-0.5 rounded-full text-[7px] md:text-[8px] font-black tracking-widest uppercase flex items-center gap-1 shadow-sm">
                <Package size={8} fill="white" /> {config.quantity} UNITS
              </div>
           </div>
           <img src={product.image} className="max-h-[85px] md:max-h-[260px] object-contain drop-shadow-lg z-10 transition-transform group-hover:scale-105" alt={product.name} />
           <div className="absolute bottom-2 md:bottom-6 left-0 w-full text-center px-2 z-20">
              <h2 className="text-sm md:text-2xl lg:text-3xl font-black text-gray-950 uppercase italic tracking-tighter leading-tight mb-0.5 break-words px-2 line-clamp-2">
                {product.name}
              </h2>
              <div className="bg-white/90 px-2 py-0.5 rounded-full inline-block border border-gray-100 shadow-sm max-w-[95%]">
                 <p className="text-lg-red font-black text-[7px] md:text-[10px] uppercase tracking-widest italic leading-none">{product.subName[language]}</p>
              </div>
           </div>
        </div>

        {/* Right Content Area: Tightened spacing to fit all info */}
        <div className="w-full md:w-[68%] p-3 md:p-8 flex flex-col justify-center bg-white relative overflow-y-auto no-scrollbar">
          {!isSubmitted ? (
            <div className="space-y-3 md:space-y-4">
              {!isLaunched ? (
                <>
                  <div className="space-y-1 md:space-y-1.5">
                    <div className="flex items-center gap-1.5">
                       <Timer size={12} className="text-lg-red"/>
                       <span className="text-gray-300 font-black text-[7px] md:text-[9px] uppercase tracking-[0.2em]">{t.countdown}</span>
                    </div>
                    <div className="flex gap-2.5 md:gap-6">
                       {[timeLeft.days, timeLeft.hrs, timeLeft.mins, timeLeft.secs].map((v, i) => (
                         <div key={i} className="flex flex-col items-start min-w-[28px] md:min-w-[45px]">
                            <div className="text-xl md:text-5xl font-black text-gray-950 italic tracking-tighter leading-none">{v.toString().padStart(2, '0')}</div>
                            <div className="text-[5px] md:text-[7px] font-black text-gray-300 tracking-wider uppercase">{['Days','Hrs','Mins','Secs'][i]}</div>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Pricing Box - Compressed & Prioritize Custom Price */}
                  <div className="bg-[#fafafa] p-3 md:p-5 lg:p-6 rounded-[15px] md:rounded-[35px] border border-gray-100 relative shadow-inner">
                     <div className="flex items-center justify-between gap-3 relative z-10">
                        <div className="space-y-0.5">
                           <p className="text-[7px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1">
                             <TrendingDown size={8}/> {t.ori}
                           </p>
                           <p className="text-sm md:text-2xl lg:text-3xl font-black text-gray-300 line-through italic leading-none">RM {priceDisplay.normal}</p>
                        </div>
                        <div className="space-y-0.5 text-right">
                           <p className="text-[7px] md:text-[9px] font-black text-lg-red uppercase tracking-widest flex items-center gap-1 justify-end">
                             <Zap size={8} fill="#e60044"/> {t.promo}
                           </p>
                           <p className="text-2xl md:text-6xl lg:text-8xl font-black text-lg-red italic leading-none tracking-tighter">RM {priceDisplay.promo}<span className="text-[7px] md:text-xs uppercase tracking-widest ml-0.5">{t.mth}</span></p>
                        </div>
                     </div>
                     <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-gray-50 shadow-sm">
                           <BadgePercent size={12} className="text-amber-500" />
                           <span className="text-[8px] md:text-[13px] font-black text-gray-950 uppercase italic leading-none">
                              {t.save} <span className="text-lg-red font-black">RM {priceDisplay.totalSaved}</span>
                           </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                           <p className="text-[5px] md:text-[7px] font-black text-gray-300 uppercase tracking-widest leading-none mb-0.5">{t.valid}</p>
                           <p className="text-[7px] md:text-[10px] font-black text-gray-950 italic leading-none">{config.launchDate}</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-2 md:space-y-4 text-left">
                    <h3 className="text-xs md:text-2xl lg:text-3xl font-black uppercase italic tracking-tighter text-gray-950 leading-none">BE THE FIRST TO SECURE.</h3>
                    <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                       {(product.features || []).slice(0, 4).map((f, i) => (
                         <div key={i} className="flex items-center gap-1 bg-gray-50 px-2 py-1 md:px-3 md:py-2 rounded-md md:rounded-lg border border-gray-100 shadow-sm">
                            <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0 shadow-sm"><Check size={6} strokeWidth={4} className="text-white" /></div>
                            <p className="text-[6px] md:text-[8px] font-black text-gray-500 uppercase italic tracking-tight truncate leading-none">{f[language] || f.cn}</p>
                         </div>
                       ))}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-2 md:space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 md:gap-2">
                       <div className="relative group">
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12} />
                         <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full pl-8 pr-3 py-2.5 md:py-3.5 bg-gray-50 rounded-lg md:rounded-xl border-none outline-none font-black text-[9px] md:text-xs focus:ring-1 focus:ring-lg-red/10 transition-all shadow-inner" placeholder={t.form_name}/>
                       </div>
                       <div className="relative group">
                         <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12} />
                         <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full pl-8 pr-3 py-2.5 md:py-3.5 bg-gray-50 rounded-lg md:rounded-xl border-none outline-none font-black text-[9px] md:text-xs focus:ring-1 focus:ring-lg-red/10 transition-all shadow-inner" placeholder={t.form_phone}/>
                       </div>
                    </div>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12} />
                      <input required value={formData.postcode} onChange={e => setFormData({...formData, postcode: e.target.value})} className="w-full pl-8 pr-3 py-2.5 md:py-3.5 bg-gray-50 rounded-lg md:rounded-xl border-none outline-none font-black text-[9px] md:text-xs focus:ring-1 focus:ring-lg-red/10 transition-all shadow-inner" placeholder={t.form_postcode}/>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-lg-red text-white py-3.5 md:py-5 rounded-full font-black uppercase tracking-[0.3em] text-[9px] md:text-[12px] shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 transform">
                      {loading ? <Timer className="animate-spin" size={14}/> : <Bell size={14} fill="white"/>} {t.notify}
                    </button>
                    <p className="text-center text-[5px] md:text-[7px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none">SECURE YOUR SLOT TODAY • NO PAYMENT NEEDED NOW</p>
                  </form>
                </>
              ) : (
                <div className="space-y-4 md:space-y-6 animate-fade-up">
                   <div className="space-y-1">
                      <div className="w-10 h-10 md:w-16 md:h-16 bg-lg-red rounded-xl flex items-center justify-center text-white shadow-xl animate-bounce border border-white/20"><Zap size={20} fill="white" /></div>
                      <h3 className="text-2xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-none">{t.grab}</h3>
                   </div>
                   <div className="bg-[#fafafa] p-4 md:p-8 rounded-2xl md:rounded-[40px] border border-gray-100 relative shadow-inner">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-0.5 md:space-y-1.5">
                           <p className="text-[7px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest line-through">WAS RM {priceDisplay.normal}</p>
                           <p className="text-3xl md:text-8xl font-black text-lg-red italic leading-none tracking-tighter">RM {priceDisplay.promo}<span className="text-[8px] md:text-xs uppercase tracking-widest ml-0.5">{t.mth}</span></p>
                           <p className="text-[8px] md:text-[12px] font-black text-gray-950 uppercase italic flex items-center gap-1.5 bg-white w-fit px-2 py-1 rounded-md shadow-sm">
                             <TrendingDown size={12} className="text-emerald-500" /> RM {priceDisplay.monthlyDiff}/MTH OFF
                           </p>
                        </div>
                        <div className="text-right space-y-0.5">
                           <div className="bg-black text-white px-2 py-1 rounded-full text-[7px] md:text-[9px] font-black tracking-widest inline-block uppercase">ONLY 600 SLOTS</div>
                           <p className="text-[7px] md:text-[10px] font-black text-gray-300 uppercase tracking-widest italic">{t.save}: <span className="text-gray-950 font-black">RM {priceDisplay.totalSaved}</span></p>
                        </div>
                      </div>
                   </div>
                   <a href={config.directLink || `https://wa.me/${activeAgent?.whatsapp || siteSettings.recruitmentWa}?text=FLASH SALE GRAB: ${product.name}!`} target="_blank" className="w-full bg-black text-white py-5 md:py-8 rounded-full font-black uppercase tracking-[0.4em] text-[10px] md:text-[16px] shadow-2xl hover:bg-lg-red transition-all flex items-center justify-center gap-4 group active:scale-95 transform">
                     SECURE DEAL NOW <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                   </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4 md:space-y-8 animate-fade-in py-8 md:py-16">
              <div className="w-16 md:w-24 h-16 md:h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100"><CheckCircle size={36} strokeWidth={3} /></div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-4xl font-black uppercase italic tracking-tighter leading-none text-gray-950">{t.success}</h3>
                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[7px] md:text-[10px] italic leading-loose">Priority notification set for {formData.phone}. Our team will contact you shortly.</p>
              </div>
              <button onClick={onClose} className="bg-gray-100 px-8 py-3 rounded-full text-gray-400 font-black uppercase tracking-[0.2em] text-[8px] hover:text-lg-red hover:bg-white border border-gray-100 transition-all shadow-sm active:scale-95">CLOSE WINDOW</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashSaleOverlay;
