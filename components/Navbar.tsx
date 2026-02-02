
import React, { useState, useEffect } from 'react';
import { Agent, Language } from '../types';

interface NavbarProps {
  activeAgent: Agent | null;
  isAdmin: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Navbar: React.FC<NavbarProps> = ({ language, setLanguage }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = {
    cn: { home: '展厅首页', join: '加盟合作' },
    en: { home: 'Showroom', join: 'Join Us' },
    ms: { home: 'Utama', join: 'Sertai Kami' }
  }[language];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 px-6 ${scrolled ? 'h-20 bg-white/80 backdrop-blur-2xl border-b border-gray-100 shadow-sm' : 'h-28 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-16">
          <a href="/"><img src="https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png" className="h-6 w-auto" alt="LG" /></a>
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <button className="hover:text-lg-red transition-colors">{navLinks.home}</button>
            <button className="hover:text-lg-red transition-colors">{navLinks.join}</button>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="bg-gray-100/50 p-1 rounded-full border border-gray-100 flex items-center">
            <button onClick={() => setLanguage('cn')} className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${language === 'cn' ? 'bg-white text-lg-red shadow-md' : 'text-gray-400 hover:text-black'}`}>CN</button>
            <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${language === 'en' ? 'bg-white text-lg-red shadow-md' : 'text-gray-400 hover:text-black'}`}>EN</button>
            <button onClick={() => setLanguage('ms')} className={`px-4 py-1.5 rounded-full text-[9px] font-black transition-all ${language === 'ms' ? 'bg-white text-lg-red shadow-md' : 'text-gray-400 hover:text-black'}`}>MS</button>
          </div>
          
          <button 
            onClick={() => window.location.hash = 'admin'}
            className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors border-l pl-4 border-gray-200 hidden xs:block"
          >
            ADMIN
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
