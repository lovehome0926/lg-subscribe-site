
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
    en: { join: "JOIN OUR AMBASSADOR", explore: "EXPLORE", visit: "VISIT OUR STORES", contact: "CONTACT", apply: "Apply to Join", recruitment_msg: "Hi! I am interested in joining the LG Ambassador program.", problems: "The Problems We Solve", benefits: "Exclusive Benefits", maps: "Open Google Maps", phone: "Contact Number" },
    cn: { join: "加入我们的合作伙伴", explore: "探索", visit: "线下体验店 (所有站点)", contact: "联系我们", apply: "立即申请加入代理", recruitment_msg: "您好！我有兴趣加入 LG 合作伙伴计划。", problems: "我们为您解决的痛点", benefits: "加入我们的专属优势", maps: "查看谷歌地图", phone: "联系电话" },
    ms: { join: "SERTAI RAKAN KAMI", explore: "TEROKAI", visit: "LOKASI KAMI", contact: "HUBUNGI", apply: "Mohon Sekarang", recruitment_msg: "Hai! Saya berminat untuk menyertai program Duta LG.", problems: "Masalah Yang Kami Selesaikan", benefits: "Kelebihan Eksklusif", maps: "Buka Google Maps", phone: "No. Telefon" }
  }[language];

  const recruitmentWa = `https://wa.me/${siteSettings.recruitmentWa || "60177473787"}?text=${encodeURIComponent(t.recruitment_msg)}`;

  return (
    <footer id="footer-section" className="bg-gray-950 text-white pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-7xl">
        <section id="join-us-section" className="bg-white rounded-[50px] p-12 lg:p-20 text-gray-950 mb-32 relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50 -skew-x-12 translate-x-24 group-hover:translate-x-16 transition-transform duration-1000"></div>
           <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-10">
                 <div className="space-y-2">
                    <span className="text-lg-red font-black text-[12px] uppercase tracking-[0.5em]">{t.join}</span>
                    <h2 className="text-4xl lg:text-7xl font-black uppercase tracking-tighter leading-none">{siteSettings.joinUsTagline[language]}</h2>
                 </div>
                 <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest block">{t.problems}</span>
                       {siteSettings.joinUsPainPoints.map((p, i) => (
                          <div key={i} className="flex gap-4 items-start">
                             <span className="text-lg-red font-black">?</span>
                             <p className="text-[13px] font-black uppercase tracking-tight text-gray-400 leading-tight">{p[language]}</p>
                          </div>
                       ))}
                    </div>
                    <div className="space-y-6">
                       <span className="text-[10px] font-black uppercase text-lg-red tracking-widest block">{t.benefits}</span>
                       {siteSettings.joinUsBenefits.map((b, i) => (
                          <div key={i} className="bg-gray-100 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest inline-block border border-gray-200">⚡ {b[language]}</div>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="shrink-0">
                 <a href={recruitmentWa} target="_blank" className="bg-gray-950 text-white px-16 py-8 rounded-full font-black uppercase tracking-widest text-[14px] shadow-2xl hover:bg-lg-red hover:scale-105 transition-all block text-center">
                   {t.apply}
                 </a>
              </div>
           </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-3 space-y-10">
            <img src={brandingLogo || "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png"} className="h-12 brightness-200" alt="LG" />
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

export default Footer;
