
import React, { useState, useMemo } from 'react';
import { Product, Agent, Language, SiteSettings } from '../types.ts';
import ProductCard from './ProductCard.tsx';
import { INITIAL_SITE_SETTINGS, CATEGORIES } from '../constants.ts';
import { ArrowUpRight, Search, Zap, Filter, X } from 'lucide-react';

interface HomeProps {
  products: Product[];
  activeAgent: Agent | null;
  language: Language;
  siteSettings: SiteSettings;
}

const Home: React.FC<HomeProps> = ({ products = [], activeAgent, language, siteSettings }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const config = siteSettings || INITIAL_SITE_SETTINGS;
  const heroTitle = config.heroTitle?.[language] || "A Complete Home. Today.";
  const heroSubtitle = config.heroSubtitle?.[language] || "Premium home appliances within reach.";
  const heroImageUrl = config.heroImageUrl || "https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg";
  
  const displayCategories = useMemo(() => {
    return (config.categories && config.categories.length > 0) ? config.categories : CATEGORIES;
  }, [config.categories]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    setIsFilterOpen(false);
    setTimeout(() => {
      const element = document.getElementById('catalog');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const filteredAndSorted = useMemo(() => {
    let list = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);
    return [...list].sort((a, b) => {
      if (a.isHotSale && !b.isHotSale) return -1;
      if (!a.isHotSale && b.isHotSale) return 1;
      return 0;
    });
  }, [activeCategory, products]);

  const t = {
    cn: { heroTag: "LG Subscribe™", ctaPrimary: "立即在线预订", all: "全部", showroom: "数字化展厅", browse: "浏览全系产品.", noAssets: "正在同步库存资产...", filter: "分类筛选", whatTitle: "什么是 LG Subscribe?", benefitsTitle: "三大利益点" },
    en: { heroTag: "LG Subscribe™", ctaPrimary: "SUBSCRIBE NOW", all: "All", showroom: "Digital Showroom", browse: "Browse Collection.", noAssets: "Inventory syncing...", filter: "Filter", whatTitle: "What is LG Subscribe?", benefitsTitle: "3 Benefits of LG Subscribe" },
    ms: { heroTag: "LG Subscribe™", ctaPrimary: "SUBSCRIBE SEKARANG", all: "Semua", showroom: "Bilik Pameran Digital", browse: "Lihat Koleksi.", noAssets: "Stok dikemaskini...", filter: "Tapis", whatTitle: "Apa itu LG Subscribe?", benefitsTitle: "3 Manfaat LG Subscribe" }
  }[language];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative w-full bg-[#f6f3ef] min-h-[70vh] md:min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImageUrl} className="w-full h-full object-cover opacity-70 md:opacity-80 scale-105" alt="LG Hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10 py-20">
          <div className="max-w-4xl animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-lg-red text-white px-5 py-2 rounded-full mb-8 shadow-xl">
              <Zap size={14} className="fill-white" />
              <span className="text-[10px] font-black italic tracking-widest uppercase">{t.heroTag}</span>
            </div>
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-gray-950 tracking-tighter leading-[0.9] mb-10 italic drop-shadow-sm">
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

      {/* Intro Section */}
      <section className="py-24 md:py-40 bg-white text-center px-6">
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-10">{config.whatIsSection?.title?.[language] || t.whatTitle}</h2>
        <div className="w-20 h-1.5 bg-lg-red mx-auto rounded-full mb-10"></div>
        <p className="text-xl md:text-3xl text-gray-500 font-medium italic max-w-4xl mx-auto leading-relaxed">
          {config.whatIsSection?.description?.[language] || ""}
        </p>
      </section>

      {/* Benefits Section - 读取后台设置 */}
      <section className="py-24 md:py-40 bg-[#f6f3ef]">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic mb-32 text-gray-950">{t.benefitsTitle}</h2>
          <div className="space-y-32">
             {(config.benefits || []).map((benefit, idx) => (
                <div key={idx} className={`flex flex-col ${idx % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}>
                   <div className="w-full md:w-1/2 aspect-[4/3] rounded-[60px] overflow-hidden shadow-2xl relative border-[12px] border-white/50 group">
                      <img src={benefit.image || "https://placehold.co/800x600?text=No+Image"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                   </div>
                   <div className="w-full md:w-1/2 relative">
                      <span className="text-[120px] md:text-[240px] font-black text-gray-200/40 absolute -top-16 md:-top-32 -left-8 md:-left-16 pointer-events-none italic">{benefit.number || `0${idx+1}`}</span>
                      <div className="relative z-10 space-y-6">
                         <h3 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight text-gray-950">{benefit.title[language]}</h3>
                         <p className="text-xl md:text-2xl text-gray-500 font-bold italic leading-relaxed">{benefit.description[language]}</p>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="py-24 md:py-32 container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-20 border-b pb-12 border-gray-100">
          <div className="space-y-4">
            <span className="text-lg-red font-black uppercase tracking-[0.8em] text-[11px] block">{t.showroom}</span>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">{t.browse}</h2>
          </div>
          <div className="hidden lg:flex flex-wrap gap-4">
            <button onClick={() => setActiveCategory('All')} className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === 'All' ? 'bg-lg-red text-white shadow-xl' : 'bg-gray-100 text-gray-400'}`}>{t.all}</button>
            {displayCategories.map(cat => (
              <button key={cat} onClick={() => handleCategoryClick(cat)} className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-lg-red text-white shadow-xl' : 'bg-gray-100 text-gray-400'}`}>{cat}</button>
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
