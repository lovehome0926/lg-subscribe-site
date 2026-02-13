
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Agent, Language, SiteSettings, CategoryItem } from '../types.ts';
import ProductCard from './ProductCard.tsx';
import { INITIAL_SITE_SETTINGS, CATEGORIES } from '../constants.ts';
import { ArrowUpRight, Zap, ChevronDown, X, LayoutGrid, Check } from 'lucide-react';

interface HomeProps {
  products: Product[];
  activeAgent: Agent | null;
  language: Language;
  siteSettings: SiteSettings;
}

const Home: React.FC<HomeProps> = ({ products = [], activeAgent, language, siteSettings }) => {
  const [activeCategoryId, setActiveCategoryId] = useState('All');
  const [showMobileSticky, setShowMobileSticky] = useState(false);

  const config = siteSettings || INITIAL_SITE_SETTINGS;
  const heroTitle = config.heroTitle?.[language] || "A Complete Home. Today.";
  const heroSubtitle = config.heroSubtitle?.[language] || "Premium home appliances within reach.";
  const heroImageUrl = config.heroImageUrl || "https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg";
  
  const displayCategories = useMemo(() => {
    const cats = (config.categories && config.categories.length > 0) ? config.categories : CATEGORIES;
    return [{ id: 'All', label: { en: 'All', cn: '全部', ms: 'Semua' } } as CategoryItem, ...cats];
  }, [config.categories]);

  useEffect(() => {
    const handleScroll = () => {
      const catalogEl = document.getElementById('catalog');
      if (catalogEl) {
        const rect = catalogEl.getBoundingClientRect();
        setShowMobileSticky(rect.top <= 80);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategorySelect = (id: string) => {
    setActiveCategoryId(id);
    const element = document.getElementById('catalog');
    if (element) {
      const offset = 140; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = activeCategoryId === 'All' ? products : products.filter(p => p.category === activeCategoryId);
    return [...list].sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      if (a.isHotSale && !b.isHotSale) return -1;
      if (!a.isHotSale && b.isHotSale) return 1;
      return 0;
    });
  }, [activeCategoryId, products]);

  const t = {
    cn: { heroTag: "LG Subscribe™", ctaPrimary: "立即在线预订", showroom: "数字化展厅", browse: "浏览全系产品.", filterBtn: "选择产品分类", coreValue: "核心价值" },
    en: { heroTag: "LG Subscribe™", ctaPrimary: "SUBSCRIBE NOW", showroom: "Digital Showroom", browse: "Browse Collection.", filterBtn: "Select Category", coreValue: "CORE VALUES" },
    ms: { heroTag: "LG Subscribe™", ctaPrimary: "SUBSCRIBE SEKARANG", showroom: "Bilik Pameran Digital", browse: "Lihat Koleksi.", filterBtn: "Pilih Kategori", coreValue: "NILAI TERAS" }
  }[language];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative w-full bg-[#f6f3ef] min-h-[70vh] md:min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 text-left">
          <img src={heroImageUrl} className="w-full h-full object-cover opacity-70 scale-105" alt="LG Hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10 py-20">
          <div className="max-w-4xl animate-fade-up text-left text-gray-950">
            <div className="inline-flex items-center gap-2 bg-lg-red text-white px-5 py-2 rounded-full mb-8 shadow-xl">
              <Zap size={14} className="fill-white" />
              <span className="text-[10px] font-black italic tracking-widest uppercase">{t.heroTag}</span>
            </div>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-gray-950 tracking-tighter leading-[0.9] mb-10 italic drop-shadow-sm uppercase">
              {heroTitle}
            </h1>
            <p className="text-gray-700 text-lg md:text-2xl font-bold mb-12 max-w-2xl leading-relaxed">
              {heroSubtitle}
            </p>
            <button 
              onClick={() => document.getElementById('catalog')?.scrollIntoView({behavior:'smooth'})} 
              className="bg-black text-white px-12 py-6 rounded-full font-black uppercase text-sm tracking-widest flex items-center gap-4 shadow-3xl hover:bg-lg-red transition-all group w-full md:w-auto justify-center"
            >
              {t.ctaPrimary} <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* What is LG Subscribe Section */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 max-w-5xl text-center space-y-10 animate-fade-up">
          <div className="flex items-center justify-center gap-4">
             <div className="w-12 h-1 bg-lg-red rounded-full"></div>
             <span className="text-lg-red font-black text-[11px] uppercase tracking-[0.6em] italic">{config.whatIsSection.title[language]}</span>
             <div className="w-12 h-1 bg-lg-red rounded-full"></div>
          </div>
          <p className="text-2xl md:text-4xl font-black text-gray-950 leading-tight tracking-tight uppercase italic max-w-4xl mx-auto">
            {config.whatIsSection.description[language]}
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 md:py-32 bg-gray-50/30 overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
           <div className="text-center mb-24">
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-gray-950">{t.coreValue}</h2>
           </div>
           
           <div className="space-y-40">
              {(config.benefits || []).slice(0, 3).map((b, i) => (
                 <div key={i} className={`flex flex-col ${i % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24 animate-fade-up`}>
                    <div className="flex-1 w-full relative">
                       <div className="aspect-[4/3] rounded-[60px] overflow-hidden shadow-3xl relative z-10 group">
                          <img src={b.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={b.title.en} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                       </div>
                       <div className={`absolute -bottom-10 md:-bottom-20 text-[120px] md:text-[240px] font-black text-gray-100/60 select-none z-0 tracking-tighter leading-none italic ${i % 2 !== 0 ? '-left-10 md:-left-20' : '-right-10 md:-right-20'}`}>
                          {b.number || `0${i+1}`}
                       </div>
                    </div>
                    
                    <div className="flex-1 text-left space-y-8 relative z-10">
                       <div className="space-y-4">
                          <div className="text-[60px] md:text-[100px] font-black text-gray-100 italic leading-none mb-2 select-none">
                             {b.number || `0${i+1}`}
                          </div>
                          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-gray-950 leading-none">
                            {b.title[language]}
                          </h3>
                          <div className="w-16 h-1.5 bg-lg-red rounded-full"></div>
                       </div>
                       <p className="text-lg md:text-2xl font-bold text-gray-400 leading-relaxed uppercase tracking-tight max-w-xl italic">
                         {b.description[language]}
                       </p>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </section>

      {/* Mobile Sticky Filter */}
      <div className={`lg:hidden fixed top-20 left-0 w-full z-[90] transition-all duration-500 transform ${showMobileSticky ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm px-4 py-3 overflow-x-auto no-scrollbar flex gap-3">
          {displayCategories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => handleCategorySelect(cat.id)} 
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategoryId === cat.id ? 'bg-lg-red text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
            >
              {cat.label[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog */}
      <section id="catalog" className="py-24 md:py-32 container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 border-b pb-12 border-gray-100 text-left text-gray-950">
          <div className="space-y-4">
            <span className="text-lg-red font-black uppercase tracking-[0.8em] text-[11px] block">{t.showroom}</span>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">{t.browse}</h2>
          </div>
          <div className="hidden lg:flex flex-wrap gap-4">
            {displayCategories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => handleCategorySelect(cat.id)} 
                className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeCategoryId === cat.id ? 'bg-lg-red text-white shadow-xl' : 'bg-gray-100 text-gray-400'}`}
              >
                {cat.label[language]}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
          {filteredAndSorted.map(p => (
            <ProductCard key={p.id} product={p} activeAgent={activeAgent} language={language} siteSettings={siteSettings} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
