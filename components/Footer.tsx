import React from 'react';
import { SiteSettings, Language, Agent } from '../types';

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
      titleLine1: "STABILITY MATTERS.",
      titleLine2: "WE GIVE MORE.",
      explore: "EXPLORE", 
      visit: "VISIT OUR STORES", 
      contact: "CONTACT", 
      apply: "CHAT FOR MORE INFO", 
      recruitment_msg: "Hi! I am interested in the 2026 LG LM Partner Program. Please tell me more about the 13% commission and incentives.", 
      problems: "WHY JOIN US?", 
      benefits: "2026 INCENTIVE HIGHLIGHTS", 
      maps: "Maps", 
      phone: "Phone" 
    },
    cn: { 
      join: "2026 合作伙伴奖励计划", 
      titleLine1: "只要您稳定，",
      titleLine2: "我们给的就更多。",
      explore: "探索", 
      visit: "线下体验店", 
      contact: "联系我们", 
      apply: "立即咨询详情", 
      recruitment_msg: "您好！我对 2026 LG LM 合作伙伴计划很感兴趣。想了解更多关于 13% 基础佣金和激励详情。", 
      problems: "为什么要加入我们？", 
      benefits: "2026 核心激励亮点", 
      maps: "地图", 
      phone: "电话" 
    },
    ms: { 
      join: "PROGRAM GANJARAN RAKAN 2026", 
      titleLine1: "KESTABILAN KERJA.",
      titleLine2: "KAMI BERI LEBIH.",
      explore: "TEROKAI", 
      visit: "LOKASI KAMI", 
      contact: "HUBUNGI", 
      apply: "MESEJ UNTUK INFO", 
      recruitment_msg: "Hai! Saya berminat dengan Program Rakan LG 2026. Boleh jelaskan lebih lanjut tentang komisyen 13% dan insentif?", 
      problems: "KENAPA SERTAI KAMI?", 
      benefits: "SOROTAN INSENTIF 2026", 
      maps: "Peta", 
      phone: "Telefon" 
    }
  }[language];

  const recruitmentWa = `https://wa.me/${siteSettings?.recruitmentWa || "60177473787"}?text=${encodeURIComponent(t.recruitment_msg)}`;

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
      "BONUS JUALAN SEHINGGA RM 30,000",
      "SIMPANAN BONUS TAHUNAN RM 10,000",
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
      "BOSAN DENGAN RUTIN KERJA 9-5?",
      "INGINKAN KEBEBASAN MASA DAN KEWANGAN?",
      "MAHU PERNIAGAAN SELURUH MALAYSIA?",
      "BERSEDIA UNTUK PENDAPATAN SAMPINGAN?"
    ]
  }[language];

  return (
    <footer id="footer-section" className="bg-[#05090f] text-white pt-20 pb-20 mt-20">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <section id="join-us-section" className="bg-white rounded-[40px] md:rounded-[60px] p-8 md:p-16 lg:p-24 text-gray-950 mb-40 relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-gray-50/50 to-transparent skew-x-12 translate-x-24 pointer-events-none"></div>
           
           <div className="relative z-10 space-y-12 md:space-y-16">
              <div className="space-y-4">
                <span className="text-lg-red font-black text-[11px] md:text-[13px] uppercase tracking-[0.4em]">{t.join}</span>
                <h2 className="text-4xl md:text-7xl lg:text-[110px] font-black uppercase tracking-tighter leading-[0.85] text-gray-950">
                  {t.titleLine1}<br/>{t.titleLine2}
                </h2>
              </div>

              <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
                 <div className="lg:col-span-4 space-y-6 md:space-y-8">
                    <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] block">{t.problems}</span>
                    <div className="space-y-4">
                       {recruitmentPainPoints.map((p, i) => (
                          <div key={i} className="flex gap-4 items-start group">
                             <span className="text-lg-red font-black text-[16px]">?</span>
                             <p className="text-[11px] font-black uppercase tracking-tight text-gray-400 group-hover:text-gray-950 transition-colors leading-tight">{p}</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="lg:col-span-5 space-y-6 md:space-y-8">
                    <span className="text-[10px] font-black uppercase text-lg-red tracking-[0.4em] block">{t.benefits}</span>
                    <div className="flex flex-col gap-3">
                       {highlights.map((b, i) => (
                          <div key={i} className="flex items-center gap-4 bg-white px-5 py-4 rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                             <span className="text-lg-red">⚡</span>
                             {b}
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="lg:col-span-3 flex justify-center lg:justify-end lg:pt-8">
                    <a 
                      href={recruitmentWa} 
                      target="_blank" 
                      className="bg-lg-red text-white px-10 py-6 md:py-8 rounded-[35px] font-black uppercase tracking-[0.2em] text-[12px] md:text-[14px] shadow-xl hover:bg-gray-950 hover:scale-105 transition-all block text-center min-w-[240px]"
                    >
                      {t.apply}
                    </a>
                 </div>
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 border-t border-white/5 pt-20 opacity-80">
          <div className="md:col-span-4 space-y-6">
            <img src="https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png" className="h-8 brightness-200" alt="LG" />
            <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">© 2026 LG Subscribe Digital Partner Malaysia.</p>
          </div>
          <div className="md:col-span-8 flex justify-end gap-12">
            <div className="text-right">
              <h4 className="text-[10px] font-black uppercase text-lg-red tracking-[0.4em] mb-4">{t.visit}</h4>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">Kuala Lumpur • Selangor • Johor Bahru</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;