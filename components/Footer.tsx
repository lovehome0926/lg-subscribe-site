
import React from 'react';
import { SiteSettings, Language, Agent } from '../types.js';

interface FooterProps {
  brandingLogo?: string | null;
  siteSettings: SiteSettings;
  language: Language;
  activeAgent?: Agent | null;
}

const Footer: React.FC<FooterProps> = ({ brandingLogo, siteSettings, language, activeAgent }) => {
  const t = {
    en: { 
      join: "2026 PARTNER REWARDS", 
      title: "STABILITY MATTERS.\nWE GIVE MORE.",
      explore: "EXPLORE", 
      visit: "VISIT OUR STORES", 
      contact: "CONTACT", 
      apply: "CHAT FOR MORE INFO", 
      recruitment_msg: "Hi! I am interested in the 2026 LG LM Partner Program. Please tell me more about the 13% commission and Nationwide Business opportunity.", 
      problems: "WHY JOIN US?", 
      benefits: "2026 INCENTIVE HIGHLIGHTS", 
      maps: "Open Google Maps", 
      phone: "Contact Number" 
    },
    cn: { 
      join: "2026 合作伙伴奖励计划", 
      title: "只要您稳定，\n我们给的就更多。",
      explore: "探索", 
      visit: "线下体验店 (所有站点)", 
      contact: "联系我们", 
      apply: "立即咨询详情", 
      recruitment_msg: "您好！我对 2026 LG LM 合作伙伴计划很感兴趣。想了解更多关于 13% 基础佣金和全马经营的详情。", 
      problems: "为什么要加入我们？", 
      benefits: "2026 核心激励亮点", 
      maps: "查看谷歌地图", 
      phone: "联系电话" 
    },
    ms: { 
      join: "GANJARAN RAKAN 2026", 
      title: "KEHIDUPAN STABIL.\nKAMI BERI LEBIH.",
      explore: "TEROKAI", 
      visit: "LOKASI KAMI", 
      contact: "HUBUNGI", 
      apply: "INFO LANJUT DI CHAT", 
      recruitment_msg: "Hai! Saya berminat dengan Program Rakan LG 2026. Boleh jelaskan lebih lanjut tentang komisyen 13% dan peluang perniagaan seluruh Malaysia?", 
      problems: "KENAPA SERTAI KAMI?", 
      benefits: "SOROTAN INSENTIF 2026", 
      maps: "Buka Google Maps", 
      phone: "No. Telefon" 
    }
  }[language];

  const recruitmentWa = `https://wa.me/${siteSettings.recruitmentWa || "60177473787"}?text=${encodeURIComponent(t.recruitment_msg)}`;

  const highlights = {
    en: [
      "13% BASIC COMMISSION (OUTRIGHT)",
      "3 MONTHS RENTAL FEE (SUBSCRIPTION)",
      "UP TO RM 30,000 VOLUME BONUS",
      "RM 10,000 ANNUAL BONUS UNLOCK",
      "NATIONWIDE BUSINESS (WHOLE MALAYSIA)",
      "FLEXIBLE TIME & LOCATION"
    ],
    cn: [
      "13% 基础佣金 (买断/分期)",
      "3 个月租金奖励 (租赁计划)",
      "月度最高 RM 30,000 销量奖金",
      "解锁 RM 10,000 年度分红储蓄",
      "全马各地皆可经营事业",
      "时间地点自由随心"
    ],
    ms: [
      "13% KOMISYEN ASAS (TUNAI)",
      "GANJARAN 3 BULAN SEWA (LANGGANAN)",
      "VOLUME BONUS SEHINGGA RM 30,000",
      "BONUS TAHUNAN RM 10,000",
      "PERNIAGAAN SELURUH MALAYSIA",
      "MASA & LOKASI FLEKSIBEL"
    ]
  }[language];

  const recruitmentPainPoints = {
    en: [
      "TIRED OF THE RIGID 9-TO-5 GRIND?",
      "LOOKING FOR TRUE TIME AND FINANCIAL FREEDOM?",
      "WANT A BUSINESS THAT WORKS ACROSS WHOLE MALAYSIA?",
      "READY TO UNLOCK YOUR SECONDARY INCOME STREAM?"
    ],
    cn: [
      "厌倦了朝九晚五、枯燥的打工生活？",
      "渴望拥有真正的时间自主与财务自由？",
      "想要一份全马各地、不受地域限制的事业？",
      "准备好开启您的第二份高收益收入了吗？"
    ],
    ms: [
      "BOSAN DENGAN RUTIN KERJA 9-PAGI 5-PETANG?",
      "INGINKAN KEBEBASAN MASA DAN KEWANGAN SEJATI?",
      "MAHU PERNIAGAAN SELURUH MALAYSIA?",
      "BERSEDIA UNTUK PENDAPATAN SAMPINGAN?"
    ]
  }[language];

  return (
    <footer id="footer-section" className="bg-[#05090f] text-white pt-40 pb-24">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* RE-DESIGNED JOIN US SECTION (BASED ON REFERENCE IMAGE) */}
        <section id="join-us-section" className="bg-white rounded-[60px] p-10 lg:p-24 text-gray-950 mb-40 relative overflow-hidden shadow-3xl">
           {/* Decorative Background Element */}
           <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-gray-50/50 to-transparent skew-x-12 translate-x-24 pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col gap-16">
              <div className="space-y-6">
                <span className="text-lg-red font-black text-[12px] uppercase tracking-[0.5em]">{t.join}</span>
                <h2 className="text-5xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.9] text-gray-950">
                  {t.title}
                </h2>
              </div>

              <div className="grid lg:grid-cols-12 gap-12 items-center">
                 {/* Left: Pain Points */}
                 <div className="lg:col-span-4 space-y-8">
                    <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] block">{t.problems}</span>
                    <div className="space-y-5">
                       {recruitmentPainPoints.map((p, i) => (
                          <div key={i} className="flex gap-4 items-start group">
                             <span className="text-lg-red font-black text-[16px] group-hover:scale-125 transition-transform duration-300">?</span>
                             <p className="text-[12px] font-black uppercase tracking-tight text-gray-400 group-hover:text-gray-950 transition-colors leading-tight">{p}</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Middle: Highlights */}
                 <div className="lg:col-span-5 space-y-8">
                    <span className="text-[10px] font-black uppercase text-lg-red tracking-[0.4em] block">{t.benefits}</span>
                    <div className="flex flex-col gap-3">
                       {highlights.map((b, i) => (
                          <div key={i} className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-lg-red/20 hover:shadow-xl transition-all duration-300">
                             <span className="text-lg-red">⚡</span>
                             {b}
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Right: CTA Button */}
                 <div className="lg:col-span-3 flex justify-center lg:justify-end">
                    <a 
                      href={recruitmentWa} 
                      target="_blank" 
                      className="bg-lg-red text-white px-12 py-8 rounded-[35px] font-black uppercase tracking-[0.2em] text-[13px] shadow-[0_25px_60px_rgba(230,0,68,0.35)] hover:bg-gray-950 hover:scale-110 active:scale-95 transition-all duration-500 block text-center min-w-[240px]"
                    >
                      {t.apply}
                    </a>
                 </div>
              </div>
           </div>
        </section>

        {/* Existing Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-3 space-y-10">
            <img 
              src={brandingLogo && !brandingLogo.includes("imgbb.com/a/") ? brandingLogo : "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png"} 
              className="h-10 brightness-200" 
              alt="LG" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png";
              }}
            />
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-medium uppercase tracking-tight">Official LG Home Appliance Subscription Digital Partner.</p>
          </div>
          <div className="md:col-span-6">
            <h4 className="text-[10px] font-black uppercase text-lg-red tracking-[0.4em] mb-10">{t.visit}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {siteSettings.stores.map(store => (
                 <div key={store.id} className="bg-white/5 rounded-[40px] overflow-hidden border border-white/5 group hover:border-lg-red transition-all">
                    {store.image && <img src={store.image} className="w-full h-32 object-cover opacity-60 group-hover:opacity-100 transition duration-1000" alt={store.name} />}
                    <div className="p-8 space-y-4">
                       <span className="text-[10px] font-black uppercase text-lg-red tracking-widest">{store.name}</span>
                       <p className="text-[12px] font-bold opacity-80 leading-relaxed uppercase tracking-tight">{store.address}</p>
                       {store.googleMapsUrl && (
                         <a href={store.googleMapsUrl} target="_blank" className="text-[9px] font-black uppercase text-white/40 hover:text-lg-red transition-colors inline-block tracking-widest">{t.maps} →</a>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          </div>
          <div className="md:col-span-3">
            <h4 className="text-[10px] font-black uppercase text-gray-700 tracking-[0.4em] mb-10">{t.contact}</h4>
            <div className="space-y-6">
               <div className="p-10 bg-white/5 rounded-[40px] border border-white/5">
                  <span className="text-[9px] font-black uppercase opacity-30 tracking-widest block mb-2">Partner Email</span>
                  <span className="text-[16px] font-black tracking-tight block mb-4 break-all">{siteSettings.officeEmail}</span>
                  {siteSettings.contactPhone && (
                    <>
                      <span className="text-[9px] font-black uppercase opacity-30 tracking-widest block mb-2">{t.phone}</span>
                      <span className="text-[16px] font-black tracking-tight">{siteSettings.contactPhone}</span>
                    </>
                  )}
               </div>
               <div className="flex gap-4">
                  {['fb', 'ig', 'tiktok'].map(key => {
                    const link = siteSettings.socialLinks?.[key as keyof typeof siteSettings.socialLinks];
                    if (!link) return null;
                    return (
                      <a key={key} href={link} target="_blank" className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center font-black text-[10px] hover:bg-lg-red hover:scale-110 transition-all border border-white/5 uppercase">
                        {key === 'fb' ? 'FB' : key === 'ig' ? 'IG' : 'TikTok'}
                      </a>
                    );
                  })}
               </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
