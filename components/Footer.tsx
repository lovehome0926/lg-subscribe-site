
import React from 'react';
import { SiteSettings, Language, Agent } from '../types.ts';
import { MessageCircle, MapPin, Mail, ChevronRight, Facebook, Instagram, Music2, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  brandingLogo?: string | null;
  siteSettings: SiteSettings;
  language: Language;
  activeAgent?: Agent | null;
}

const Footer: React.FC<FooterProps> = ({ siteSettings, language }) => {
  // 防御性返回
  if (!siteSettings) return null;

  const t = {
    en: { join: "PARTNER REWARDS 2026", apply: "START YOUR BUSINESS", recruitment_msg: "Hi! I am interested in the LG Partner Program. Please tell me more about the rewards.", visit: "OFFLINE SHOWROOMS", contact: "HELP CENTER", main_showroom: "Main Showroom" },
    cn: { join: "2026 合伙人激励计划", apply: "开启您的轻创业之旅", recruitment_msg: "您好！我对 LG 合作伙伴计划很感兴趣。想了解更多佣金激励政策。", visit: "线下体验展厅", contact: "客户协助中心", main_showroom: "品牌体验中心" },
    ms: { join: "PROGRAM GANJARAN RAKAN 2026", apply: "SERTAI SEKARANG", recruitment_msg: "Hai! Saya berminat dengan Program Rakan LG. Sila kongsi info insentif.", visit: "BILIK PAMERAN KAMI", contact: "PUSAT BANTUAN", main_showroom: "Showroom Utama" }
  }[language];

  const recruitmentWa = `https://wa.me/${siteSettings.recruitmentWa || "60177473787"}?text=${encodeURIComponent(t.recruitment_msg)}`;
  const siteDesc = siteSettings.siteDescription?.[language] || siteSettings.siteDescription?.en || "Transforming the Malaysian home experience with flexible LG Subscribe™ technology.";

  return (
    <footer id="footer-section" className="bg-[#05090f] text-white pt-20 pb-20 mt-20">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Join Us Card */}
        <section id="footer-join-section" className="bg-white rounded-[60px] p-12 md:p-24 text-gray-950 mb-40 relative overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.5)] animate-fade-up">
           <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-gray-50/50 to-transparent skew-x-12 translate-x-24 pointer-events-none"></div>
           
           <div className="relative z-10 space-y-16">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-1 bg-lg-red rounded-full"></div>
                   <span className="text-lg-red font-black text-[13px] uppercase tracking-[0.6em]">{t.join}</span>
                </div>
                <h2 className="text-5xl md:text-[100px] font-black uppercase tracking-tighter leading-[0.8] text-gray-950 italic">
                  {siteSettings.joinUsTagline?.[language] || "STABILITY MATTERS."}
                </h2>
              </div>

              <div className="grid lg:grid-cols-12 gap-16 items-start">
                 <div className="lg:col-span-4 space-y-10">
                    <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.4em] block">READY FOR FINANCIAL FREEDOM?</span>
                    <div className="space-y-6">
                       {(siteSettings.joinUsPainPoints || []).map((p, i) => (
                          <div key={i} className="flex gap-4 items-start group">
                             <div className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center text-lg-red text-xs font-black shrink-0">?</div>
                             <p className="text-[12px] font-black uppercase tracking-tight text-gray-400 group-hover:text-gray-950 transition-colors leading-tight">{p?.[language] || ""}</p>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="lg:col-span-5 space-y-10">
                    <span className="text-[10px] font-black uppercase text-lg-red tracking-[0.4em] block">PARTNER INCENTIVES & PERKS</span>
                    <div className="flex flex-col gap-4">
                       {(siteSettings.joinUsBenefits || []).map((b, i) => (
                          <div key={i} className="flex items-center gap-4 bg-gray-50 px-8 py-6 rounded-3xl text-[12px] font-black uppercase tracking-widest border border-gray-100 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group">
                             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg-red group-hover:bg-lg-red group-hover:text-white transition-colors">⚡</div>
                             {b?.[language] || ""}
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="lg:col-span-3 flex justify-center lg:justify-end lg:pt-10">
                    <a 
                      href={recruitmentWa} 
                      target="_blank" 
                      className="bg-lg-red text-white px-14 py-9 rounded-full font-black uppercase tracking-[0.4em] text-[14px] shadow-3xl shadow-lg-red/40 hover:bg-gray-950 hover:scale-105 transition-all flex items-center gap-4 group"
                    >
                      {t.apply} <ChevronRight size={22} className="group-hover:translate-x-2 transition-transform" />
                    </a>
                 </div>
              </div>
           </div>
        </section>

        {/* Branding Footer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 border-t border-white/5 pt-24">
          <div className="md:col-span-4 space-y-10">
            <img src={siteSettings.logoUrl || "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png"} className="h-10 brightness-200" alt="LG" />
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-loose max-w-xs">
              {siteDesc}
            </p>
            <div className="flex gap-5 pt-4">
               {['fb', 'ig', 'tiktok'].map(platform => {
                 const link = (siteSettings.socialLinks as any)?.[platform];
                 if (!link) return null;
                 return (
                   <a key={platform} href={link} target="_blank" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors border border-white/5 hover:bg-lg-red shadow-inner">
                     {platform === 'fb' && <Facebook size={20} />}
                     {platform === 'ig' && <Instagram size={20} />}
                     {platform === 'tiktok' && <Music2 size={20} />}
                   </a>
                 );
               })}
            </div>
          </div>
          
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-20">
            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">{t.visit}</h4>
              <div className="space-y-8">
                {/* 核心修复：优先显示 siteAddress 字段的内容 */}
                {siteSettings.siteAddress ? (
                  <div className="space-y-8">
                    <a 
                      href={siteSettings.googleMapsUrl || "#"} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex gap-5 group cursor-pointer"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-lg-red transition-all shadow-sm">
                         <MapPin size={16} className="text-gray-400 group-hover:text-white" />
                      </div>
                      <div className="pb-2">
                        <p className="text-[12px] font-black text-gray-200 uppercase tracking-tight flex items-center gap-2">
                          {t.main_showroom} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </p>
                        <p className="text-[10px] font-medium text-gray-500 uppercase mt-2 leading-relaxed max-w-[280px]">{siteSettings.siteAddress}</p>
                      </div>
                    </a>

                    {/* 如果还有额外的门店列表，也一并显示 */}
                    {siteSettings.stores && siteSettings.stores.length > 0 && siteSettings.stores.map(s => (
                      <a 
                        key={s.id} 
                        href={s.googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex gap-5 group cursor-pointer"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-lg-red transition-all shadow-sm">
                           <MapPin size={16} className="text-gray-400 group-hover:text-white" />
                        </div>
                        <div className="pb-2">
                          <p className="text-[12px] font-black text-gray-200 uppercase tracking-tight flex items-center gap-2">
                            {s.name} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          <p className="text-[10px] font-medium text-gray-500 uppercase mt-2 leading-relaxed">{s.address}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  /* 原有的 stores 列表显示逻辑，作为备选 */
                  siteSettings.stores && siteSettings.stores.length > 0 ? (
                    siteSettings.stores.map(s => (
                      <a 
                        key={s.id} 
                        href={s.googleMapsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex gap-5 group cursor-pointer"
                      >
                        <div className="shrink-0 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-lg-red transition-all shadow-sm">
                           <MapPin size={16} className="text-gray-400 group-hover:text-white" />
                        </div>
                        <div className="pb-2">
                          <p className="text-[12px] font-black text-gray-200 uppercase tracking-tight flex items-center gap-2">
                            {s.name} <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          <p className="text-[10px] font-medium text-gray-500 uppercase mt-2 leading-relaxed">{s.address}</p>
                        </div>
                      </a>
                    ))
                  ) : (
                    <p className="text-[11px] text-gray-600 font-black uppercase">Official Brand Shops coming soon.</p>
                  )
                )}
              </div>
            </div>
            <div className="space-y-8">
              <h4 className="text-[11px] font-black uppercase text-lg-red tracking-[0.5em]">{t.contact}</h4>
              <div className="space-y-6">
                <a href={`mailto:${siteSettings.officeEmail}`} className="flex gap-5 items-center group cursor-pointer">
                   <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-600 group-hover:text-lg-red transition-colors shadow-sm"><Mail size={18} /></div>
                   <span className="text-[12px] font-black text-gray-200 uppercase tracking-widest">{siteSettings.officeEmail || "Email Office"}</span>
                </a>
                <a href={`https://wa.me/${siteSettings.recruitmentWa}`} target="_blank" className="flex gap-5 items-center group cursor-pointer">
                   <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-gray-600 group-hover:text-lg-red transition-colors shadow-sm"><MessageCircle size={18} /></div>
                   <span className="text-[12px] font-black text-gray-200 uppercase tracking-widest">Digital Hub Support</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-40 pt-12 border-t border-white/5 text-center">
           <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.6em]">© 2026 LG SUBSCRIBE DIGITAL PARTNER HUB. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
