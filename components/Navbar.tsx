
import React, { useState, useEffect } from 'react';
import { AppRoute, Agent, Language } from '../types.js';
import { Menu, X, Globe, ShieldCheck, User } from 'lucide-react';

interface NavbarProps {
  currentRoute: AppRoute;
  activeAgent: Agent | null;
  isAdmin: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  brandingLogo?: string | null;
}

const Navbar: React.FC<NavbarProps> = ({ currentRoute, activeAgent, isAdmin, language, setLanguage, brandingLogo }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setLogoError(false);
  }, [brandingLogo]);

  const t = {
    en: { home: "Home", all: "Catalog", promo: "Offers", join: "BECOME A PARTNER", partner: "Verified Agent" },
    cn: { home: "首页", all: "产品目录", promo: "限时优惠", join: "成为合伙人", partner: "认证代理人" },
    ms: { home: "Utama", all: "Katalog", promo: "Promosi", join: "Sertai Kami", partner: "Ejen Sah" }
  }[language];

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
      }
    }, 100);
  };

  const navLinks = [
    { id: 'home', label: t.home, action: () => { window.scrollTo({top: 0, behavior: 'smooth'}); setIsMenuOpen(false); } },
    { id: 'catalog-section', label: t.all, action: () => scrollToSection('catalog-section') },
    { id: 'promotion-section', label: t.promo, action: () => scrollToSection('promotion-section') },
    { id: 'join-us-section', label: t.join, action: () => scrollToSection('join-us-section'), special: true },
  ];

  const officialLogo = "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png";
  
  // 核心防御：检测是否为 ImgBB 的错误页面特征
  const isBrokenLink = !brandingLogo || 
                       brandingLogo.includes("imgbb.com/a/") || 
                       brandingLogo.includes("image not found") ||
                       brandingLogo.length < 10;

  const logoSrc = (!logoError && !isBrokenLink) ? brandingLogo : officialLogo;

  const textColor = 'text-gray-950 font-bold';
  const subTextColor = 'text-gray-500 font-medium';

  return (
    <>
      <nav className={`fixed top-0 w-full z-[60] transition-all duration-500 ${scrolled ? 'h-16 bg-white shadow-xl border-b border-gray-100' : 'h-24 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex items-center justify-between">
          <div className="flex md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className={`p-2 rounded-xl transition-colors ${textColor} hover:bg-black/5`}>
              <Menu size={24} />
            </button>
          </div>

          <div className="flex-shrink-0 flex items-center h-full">
            <a href="#home" className="flex items-center gap-5 h-full py-2">
              <div className="h-full flex items-center min-w-[100px] max-w-[200px]">
                <img 
                  src={logoSrc} 
                  className="h-10 md:h-12 w-auto object-contain transition-all duration-500 flex-shrink-0" 
                  alt="LG Logo" 
                  onError={() => setLogoError(true)}
                />
              </div>
              {activeAgent && (
                <div className={`hidden lg:flex items-center gap-3 border-l pl-5 py-1 border-gray-300`}>
                   <div className="w-8 h-8 rounded-full bg-lg-red flex items-center justify-center text-white shadow-lg">
                     <User size={14} />
                   </div>
                   <div className="flex flex-col">
                      <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${subTextColor}`}>{t.partner}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${textColor}`}>{activeAgent.name}</span>
                   </div>
                </div>
              )}
            </a>
          </div>

          <div className={`hidden md:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] ${textColor}`}>
            {navLinks.slice(0, 3).map(link => (
              <button key={link.id} onClick={link.action} className="hover:text-lg-red transition-all relative group opacity-90 hover:opacity-100">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lg-red transition-all group-hover:w-full"></span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-8">
             <button onClick={() => scrollToSection('join-us-section')} className="hidden lg:block text-[11px] font-black uppercase tracking-[0.2em] transition-all text-lg-red hover:opacity-70 font-black">
               {t.join}
             </button>
             <div className={`flex p-1 rounded-full border border-black/10 transition-all ${scrolled ? 'bg-gray-50' : 'bg-black/5 backdrop-blur-md'}`}>
                {(['en', 'cn', 'ms'] as Language[]).map(lang => (
                  <button key={lang} onClick={() => setLanguage(lang)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${language === lang ? 'bg-white text-lg-red shadow-sm' : 'text-gray-500 hover:text-lg-red'}`}>
                    {lang === 'cn' ? '中' : lang.toUpperCase()}
                  </button>
                ))}
             </div>
             {isAdmin && (
               <a href="#admin" className={`text-[9px] font-black uppercase tracking-widest transition-all ${subTextColor} hover:text-lg-red ml-2`}>
                 Admin
               </a>
             )}
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative bg-white w-[85%] max-w-sm h-full shadow-2xl p-10 flex flex-col animate-in slide-in-from-left duration-500">
             <div className="flex justify-between items-center mb-16">
               <img src={logoSrc} className="h-8 object-contain" alt="LG Logo" />
               <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20}/></button>
             </div>
             <nav className="space-y-2">
               {navLinks.map(link => (
                 <button key={link.id} onClick={link.action} className={`w-full text-left p-5 rounded-[24px] text-[13px] font-black uppercase tracking-widest transition-all ${link.special ? 'text-lg-red bg-red-50 font-black' : 'hover:bg-gray-50 text-gray-900 font-bold'}`}>
                  {link.label}
                </button>
               ))}
             </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
