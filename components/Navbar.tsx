
import React, { useState, useEffect } from 'react';
import { AppRoute, Agent, Language } from '../types';
import { Menu, X, User } from 'lucide-react';

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = {
    en: { home: "Home", all: "Catalog", promo: "Offers", join: "BECOME A PARTNER", partner: "Verified Specialist" },
    cn: { home: "首页", all: "产品目录", promo: "最新优惠", join: "BECOME A PARTNER", partner: "官方认证代理" },
    ms: { home: "Utama", all: "Katalog", promo: "Promosi", join: "BECOME A PARTNER", partner: "Pakar Sah" }
  }[language];

  const navLinks = [
    { id: 'home', label: t.home, action: () => { window.scrollTo({top: 0, behavior: 'smooth'}); setIsMenuOpen(false); } },
    { id: 'catalog-section', label: t.all, action: () => { document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); } },
    { id: 'promotion-section', label: t.promo, action: () => { document.getElementById('promotion-section')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); } },
  ];

  const officialLogo = "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png";
  const logoSrc = brandingLogo && brandingLogo.length > 10 ? brandingLogo : officialLogo;

  return (
    <>
      <nav className={`fixed top-0 w-full z-[1000] transition-all duration-500 flex items-center ${scrolled ? 'h-20 glass-nav border-b border-gray-100 shadow-sm' : 'h-24 bg-white/40'}`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between w-full">
          
          <div className="flex items-center gap-12">
            <a href="#home" className="flex-shrink-0">
              <img src={logoSrc} className={`h-8 md:h-9 w-auto object-contain transition-all ${scrolled ? 'brightness-100' : ''}`} alt="LG" />
            </a>
            
            <div className="hidden lg:flex items-center gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-gray-950">
              {navLinks.map(link => (
                <button key={link.id} onClick={link.action} className="hover:text-lg-red transition-all relative group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-lg-red transition-all group-hover:w-full"></span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 md:gap-8">
            <div className="hidden md:flex p-1 rounded-full bg-gray-200/20 border border-gray-200 backdrop-blur-md">
               {(['en', 'cn', 'ms'] as Language[]).map(lang => (
                 <button key={lang} onClick={() => setLanguage(lang)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all ${language === lang ? 'bg-white text-lg-red shadow-md' : 'text-gray-400 hover:text-lg-red'}`}>
                   {lang === 'cn' ? '中' : lang.toUpperCase()}
                 </button>
               ))}
            </div>

            <button 
              onClick={() => { document.getElementById('join-us-section')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="hidden sm:block text-[11px] font-black uppercase tracking-[0.2em] text-lg-red hover:opacity-70 transition-all border-b-2 border-lg-red/20 pb-1"
            >
              {t.join}
            </button>

            {activeAgent && (
              <div className="hidden xl:flex items-center gap-3 bg-lg-red text-white pl-1.5 pr-4 py-1.5 rounded-full shadow-lg shadow-lg-red/20">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black uppercase tracking-widest opacity-70 leading-none">{t.partner}</span>
                  <span className="text-[10px] font-black uppercase tracking-tight">{activeAgent.name}</span>
                </div>
              </div>
            )}

            <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-gray-950 hover:bg-gray-100 rounded-full transition-colors">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-[2000] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-3xl transition-transform duration-500 ease-out p-12 flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="flex justify-between items-center mb-16">
             <img src={logoSrc} className="h-7" alt="LG" />
             <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-black transition-colors"><X size={24}/></button>
           </div>
           
           <nav className="flex flex-col gap-10 mb-auto">
             {navLinks.map(link => (
               <button key={link.id} onClick={link.action} className="text-left text-3xl font-black uppercase tracking-tighter text-gray-950 hover:text-lg-red transition-all">
                 {link.label}
               </button>
             ))}
             <button 
                onClick={() => { document.getElementById('join-us-section')?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); }} 
                className="text-left text-3xl font-black uppercase tracking-tighter text-lg-red"
              >
                {t.join}
              </button>
           </nav>

           <div className="pt-12 border-t border-gray-100 space-y-10">
              <div className="flex gap-4">
                {(['en', 'cn', 'ms'] as Language[]).map(lang => (
                  <button key={lang} onClick={() => {setLanguage(lang); setIsMenuOpen(false);}} className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase border transition-all ${language === lang ? 'bg-lg-red text-white border-transparent shadow-xl' : 'bg-white text-gray-400 border-gray-100'}`}>
                    {lang === 'cn' ? '中文' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
              {activeAgent && (
                <div className="bg-gray-50 p-6 rounded-[35px] flex items-center gap-4 border border-gray-100">
                  <div className="w-12 h-12 bg-lg-red rounded-full flex items-center justify-center text-white shadow-lg">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{t.partner}</p>
                    <p className="text-lg font-black uppercase text-gray-950 leading-tight">{activeAgent.name}</p>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
