
import React, { useState } from 'react';
import { AppRoute, Agent, Language } from '../types';

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

  const t = {
    en: { home: "Home", all: "Products", promo: "Promotion", contact: "Contact", join: "Join Us" },
    cn: { home: "首页", all: "产品", promo: "促销", contact: "联系", join: "加入我们" },
    ms: { home: "Utama", all: "Produk", promo: "Promosi", contact: "Hubungi", join: "Sertai Kami" }
  }[language];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: t.home, action: () => { window.scrollTo({top: 0, behavior: 'smooth'}); setIsMenuOpen(false); } },
    { id: 'catalog-section', label: t.all, action: () => scrollToSection('catalog-section') },
    { id: 'promotion-section', label: t.promo, action: () => scrollToSection('promotion-section') },
    { id: 'join-us-section', label: t.join, action: () => scrollToSection('join-us-section'), special: true },
    { id: 'footer-section', label: t.contact, action: () => scrollToSection('footer-section') },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[60] glass-nav border-b border-gray-100/50 h-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-full flex items-center justify-between">
          
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-gray-950 hover:text-lg-red transition-colors"
              aria-label="Open Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex-shrink-0 absolute left-1/2 -translate-x-1/2 md:relative md:left-0 md:translate-x-0">
            <a href="#home" className="flex items-center">
              <img src={brandingLogo || "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png"} className="h-10 sm:h-12 object-contain" alt="LG" />
            </a>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
            {navLinks.map(link => (
              <button 
                key={link.id} 
                onClick={link.action} 
                className={`hover:text-lg-red transition-colors ${link.special ? 'text-lg-red border-b border-lg-red/20' : ''}`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200 shadow-inner">
               {(['en', 'cn', 'ms'] as Language[]).map(lang => (
                 <button 
                   key={lang} 
                   onClick={() => setLanguage(lang)} 
                   className={`px-2.5 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase transition-all duration-300 ${language === lang ? 'bg-white text-lg-red shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                   {lang === 'cn' ? '中' : lang === 'ms' ? 'MY' : 'EN'}
                 </button>
               ))}
            </div>
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        ></div>
        
        <div className={`absolute top-0 left-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-500 flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 flex justify-between items-center border-b border-gray-50">
            <img src={brandingLogo || "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png"} className="h-8 object-contain" alt="LG" />
            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-black">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex-grow p-8 space-y-6 overflow-y-auto">
            <nav className="space-y-2">
              {navLinks.map(link => (
                <button 
                  key={link.id} 
                  onClick={link.action} 
                  className={`w-full text-left p-6 rounded-3xl text-[13px] font-black uppercase tracking-widest transition-all ${link.special ? 'bg-red-50 text-lg-red' : 'hover:bg-gray-50 text-gray-950'}`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
