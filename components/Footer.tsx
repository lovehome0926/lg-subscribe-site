
import React from 'react';
// Fixed: Added .js extension to import for consistency with other files
import { SiteSettings, Language, Agent } from '../types.js';

interface FooterProps {
  brandingLogo?: string | null;
  siteSettings: SiteSettings;
  language: Language;
  activeAgent?: Agent | null;
}

const Footer: React.FC<FooterProps> = ({ brandingLogo, siteSettings, language, activeAgent }) => {
  const t = {
    en: { join: "2026 PARTNER REWARDS", explore: "EXPLORE", visit: "VISIT OUR STORES", contact: "CONTACT", apply: "Chat for More Info", recruitment_msg: "Hi! I am interested in the 2026 LG LM Partner Program. Please tell me more about the 13% commission and Nationwide Business opportunity.", problems: "Why Join Us?", benefits: "2026 Incentive Highlights", maps: "Open Google Maps", phone: "Contact Number" },
    cn: { join: "2026 合作伙伴激励计划", explore: "探索", visit: "线下体验店 (所有站点)", contact: "联系我们", apply: "WhatsApp 咨询详情", recruitment_msg: "您好！我对 2026 LG LM 合作伙伴计划很感兴趣。想了解更多关于 13% 基础佣金和全马经营的详情。", problems: "您的事业新机遇", benefits: "2026 核心激励亮点", maps: "查看谷歌地图", phone: "联系电话" },
    ms: { join: "GANJARAN RAKAN 2026", explore: "TEROKAI", visit: "LOKASI KAMI", contact: "HUBUNGI", apply: "Hubungi Untuk Info", recruitment_msg: "Hai! Saya berminat dengan Program Rakan LG 2026. Boleh jelaskan lebih lanjut tentang komisyen 13% dan peluang perniagaan seluruh Malaysia?", problems: "Kenapa Sertai Kami?", benefits: "Sorotan Insentif 2026", maps: "Buka Google Maps", phone: "No. Telefon" }
  }[language];

  const recruitmentWa = `https://wa.me/${siteSettings.recruitmentWa || "60177473787"}?text=${encodeURIComponent(t.recruitment_msg)}`;

  const highlights = {
    en: [
      "13% Basic Commission (Outright)",
      "3 Months Rental Fee (Subscription)",
      "Up to RM 30,000 Volume Bonus",
      "RM 10,000 Annual Bonus Unlock",
      "Nationwide Business (Whole Malaysia)",
      "Flexible Time & Location"
    ],
    cn: [
      "13% 基础佣金 (买断/分期)",
      "3 个月租金奖励 (租赁计划)",
      "月度最高 RM 30,000 销量奖金",
      "解锁 RM 10,000 年度分红储蓄",
      "全马经营 (无地区限制)",
      "时间自由，地点随心"
    ],
    ms: [
      "13% Komisyen Asas (Tunai)",
      "Ganjaran 3 Bulan Sewa (Langganan)",
      "Volume Bonus sehingga RM 30,000",
      "Bonus Tahunan RM 10,000",
      "Perniagaan Seluruh Malaysia",
      "Masa & Lokasi Fleksibel"
    ]
  }[language];

  const recruitmentPainPoints = {
    en: [
      "Tired of the rigid 9-to-5 grind?",
      "Looking for true time and financial freedom?",
      "Want a business that works across whole Malaysia?",
      "Ready to unlock your secondary income stream?"
    ],
    cn: [
      "厌倦了朝九晚五的枯燥打工生活？",
      "渴望拥有真正的时间与财务自由？",
      "想要一份全马各地都能经营的事业？",
      "准备好开启您的第二份高薪副业了吗？"
    ],
    ms: [
      "Bosan dengan rutin kerja 9-pagi 5-petang?",
      "Inginkan kebebasan masa dan kewangan sejati?",
      "Mahu perniagaan yang boleh dijalankan seluruh Malaysia?",
      "Bersedia untuk mulakan pendapatan sampingan tinggi?"
    ]
  }[language];

  return (
    <footer id="footer-section" className="bg-gray-950 text-white pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* JOIN US SECTION WITH RECRUITMENT PAIN POINTS */}
        <section id="join-us-section" className="bg-white rounded-[50px] p-12 lg:p-20 text-gray-950 mb-32 relative overflow-hidden group shadow-2xl border-4 border-lg-red/10">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50 -skew-x-12 translate-x-24 group-hover:translate-x-16 transition-transform duration-1000"></div>
           <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-10">
                 <div className="space-y-2">
                    <span className="text-lg-red font-black text-[12px] uppercase tracking-[0.5em]">{t.join}</span>
                    <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-none">
                       {language === 'cn' ? '只要您稳定，\n我们给的就更多。' : 'STABILITY MATTERS.\nWE GIVE MORE.'}
                    </h2>
                 </div>
                 <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest block">{t.problems}</span>
                       <div className="space-y-4">
                          {recruitmentPainPoints.map((p, i) => (
                             <div key={i} className="flex gap-4 items-start">
                                <span className="text-lg-red font-black">?</span>
                                <p className="text-[13px] font-black uppercase tracking-tight text-gray-400 leading-tight">{p}</p>
                             </div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-4">
                       <span className="text-[10px] font-black uppercase text-lg-red tracking-widest block">{t.benefits}</span>
                       <div className="flex flex-wrap gap-2">
                          {highlights.map((b, i) => (
                             <div key={i} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200 shadow-sm">⚡ {b}</div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="shrink-0">
                 <a href={recruitmentWa} target="_blank" className="bg-lg-red text-white px-16 py-8 rounded-full font-black uppercase tracking-widest text-[14px] shadow-[0_20px_40px_rgba(230,0,68,0.3)] hover:bg-gray-900 hover:scale-105 transition-all block text-center animate-bounce-slow">
                   {t.apply}
                 </a>
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-3 space-y-10">
            <img 
              src={brandingLogo || "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png"} 
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
                  <span className="text-[16px] font-black tracking-tight block mb-4">{siteSettings.officeEmail}</span>
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

// Fixed: Added missing default export
export default Footer;
