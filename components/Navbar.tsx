
import React, { useState } from 'react';
import { AppRoute, Agent, Language } from '../types.js';

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
    en: { home: "Home", all: "Products", promo: "Promotion", contact: "Contact", join: "Join Us", partner: "Verified Partner" },
    cn: { home: "首页", all: "产品", promo: "促销", contact: "联系", join: "加入我们", partner: "认证合作伙伴" },
    ms: { home: "Utama", all: "Produk", promo: "Promosi", contact: "Hubungi", join: "Sertai Kami", partner: "Rakan Sah" }
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
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[60] glass-nav border-b border-gray-100/50 h-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-full flex items-center justify-between">
          
          <div className="flex md:hidden">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 text-gray-950">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          </div>

          <div className="flex-shrink-0">
            <a href="#home" className="flex items-center gap-3">
              <img src={brandingLogo || "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png"} className="h-8 sm:h-10 object-contain" alt="LG" />
              {activeAgent && (
                <div className="hidden lg:flex flex-col border-l border-gray-200 pl-4 py-1">
                   <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">{t.partner}</span>
                   <span className="text-[10px] font-black uppercase text-lg-red tracking-wider">{activeAgent.name}</span>
                </div>
              )}
            </a>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
            {navLinks.map(link => (
              <button key={link.id} onClick={link.action} className={`hover:text-lg-red transition-colors ${link.special ? 'text-lg-red' : ''}`}>{link.label}</button>
            ))}
          </div>

          <div className="flex items-center gap-4">
             <div className="flex bg-gray-50 p-1 rounded-full border border-gray-100">
                {(['en', 'cn', 'ms'] as Language[]).map(lang => (
                  <button key={lang} onClick={() => setLanguage(lang)} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${language === lang ? 'bg-white text-lg-red shadow-sm' : 'text-gray-300'}`}>{lang === 'cn' ? '中' : lang.toUpperCase()}</button>
                ))}
             </div>
             {isAdmin && <a href="#admin" className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black">Admin</a>}
          </div>
        </div>
      </nav>
      {/* 移动端菜单逻辑保持不变，但修正了样式以防止卡死 */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative bg-white w-[80%] max-w-sm h-full shadow-2xl p-8 flex flex-col fade-in">
             <div className="flex justify-between items-center mb-12">
               <img src={brandingLogo || "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png"} className="h-8 object-contain" />
               <button onClick={() => setIsMenuOpen(false)}>✕</button>
             </div>
             <nav className="space-y-4">
               {navLinks.map(link => (
                 <button key={link.id} onClick={link.action} className="w-full text-left p-4 rounded-2xl text-[14px] font-black uppercase tracking-widest hover:bg-gray-50">{link.label}</button>
               ))}
               <button onClick={() => { window.location.hash = 'agent-tools'; setIsMenuOpen(false); }} className="w-full text-left p-4 rounded-2xl text-[14px] font-black uppercase tracking-widest text-lg-red bg-red-50">Partner Center</button>
             </nav>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
