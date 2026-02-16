
import React, { useState, useEffect } from 'react';
import { Agent, Language, SiteSettings } from '../types.ts';

interface NavbarProps {
  activeAgent: Agent | null;
  isAdmin: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  siteSettings: SiteSettings;
}

const Navbar: React.FC<NavbarProps> = ({ language, setLanguage, siteSettings }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = {
    cn: { home: '品牌展厅', categories: '产品', join: '合伙人' },
    en: { home: 'Showroom', categories: 'Product', join: 'Join Us' },
    ms: { home: 'Utama', categories: 'Produk', join: 'Sertai' }
  }[language];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 px-4 md:px-6 ${scrolled ? 'h-16 md:h-20 bg-white/80 backdrop-blur-2xl border-b border-gray-100 shadow-sm' : 'h-24 md:h-28 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-4 md:gap-16">
          <a href="/"><img src={siteSettings.logoUrl || "https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png"} className="h-5 md:h-6 w-auto transition-transform hover:scale-105" alt="LG Logo" /></a>
          
          {/* 桌面端导航 */}
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <button onClick={() => window.location.hash = ''} className="hover:text-lg-red transition-colors">{navLinks.home}</button>
            <button onClick={() => scrollToSection('catalog')} className="hover:text-lg-red transition-colors">{navLinks.categories}</button>
            <button onClick={() => scrollToSection('footer-join-section')} className="hover:text-lg-red transition-colors">{navLinks.join}</button>
          </div>

          {/* 手机端导航快捷键 */}
          <div className="flex lg:hidden items-center gap-3 text-[9px] font-black uppercase tracking-widest text-gray-400">
            <button onClick={() => scrollToSection('catalog')} className="px-2 py-1 hover:text-lg-red active:text-lg-red transition-colors">{navLinks.categories}</button>
            <button onClick={() => scrollToSection('footer-join-section')} className="px-2 py-1 hover:text-lg-red active:text-lg-red transition-colors">{navLinks.join}</button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-gray-100/50 p-0.5 md:p-1 rounded-full border border-gray-100 flex items-center">
            <button onClick={() => setLanguage('cn')} className={`px-2 md:px-4 py-1 rounded-full text-[8px] md:text-[9px] font-black ${language === 'cn' ? 'bg-white text-lg-red shadow-sm md:shadow-md' : 'text-gray-400'}`}>CN</button>
            <button onClick={() => setLanguage('en')} className={`px-2 md:px-4 py-1 rounded-full text-[8px] md:text-[9px] font-black ${language === 'en' ? 'bg-white text-lg-red shadow-sm md:shadow-md' : 'text-gray-400'}`}>EN</button>
            <button onClick={() => setLanguage('ms')} className={`px-2 md:px-4 py-1 rounded-full text-[8px] md:text-[9px] font-black ${language === 'ms' ? 'bg-white text-lg-red shadow-sm md:shadow-md' : 'text-gray-400'}`}>MS</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
