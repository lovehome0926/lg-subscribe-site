
import React, { useState, useMemo } from 'react';
import { Product, Agent, Language, SiteSettings } from '../types.ts';
import ProductCard from './ProductCard.tsx';
import { INITIAL_SITE_SETTINGS } from '../constants.ts';
import { ArrowUpRight, Search, Zap, Flame, Sparkles } from 'lucide-react';

interface HomeProps {
  products: Product[];
  activeAgent: Agent | null;
  language: Language;
  siteSettings: SiteSettings;
}

const Home: React.FC<HomeProps> = ({ products = [], activeAgent, language, siteSettings }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const config = siteSettings || INITIAL_SITE_SETTINGS;
  const heroTitle = config.heroTitle?.[language] || "A Complete Home. Today.";
  const heroSubtitle = config.heroSubtitle?.[language] || "Premium home appliances within reach.";
  const heroImageUrl = config.heroImageUrl || "https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg";
  const whatIsTitle = config.whatIsSection?.title?.[language] || "What is LG Subscribe?";
  const whatIsDesc = config.whatIsSection?.description?.[language] || "";
  const benefits = config.benefits || [];
  
  const displayCategories = config.categories || [];

  const t = {
    cn: { heroTag: "LG Subscribe™", ctaPrimary: "立即在线预订", all: "全部", showroom: "数字化展厅", browse: "浏览全系产品.", noAssets: "正在同步库存资产...", benefitsTitle: "三大利益点", hotTag: "热门抢购", promoTag: "限时促销" },
    en: { heroTag: "LG Subscribe™", ctaPrimary: "SUBSCRIBE NOW", all: "All", showroom: "Digital Showroom", browse: "Browse Collection.", noAssets: "Inventory syncing...", benefitsTitle: "3 Benefits", hotTag: "HOT SALE", promoTag: "PROMO" },
    ms: { heroTag: "LG Subscribe™", ctaPrimary: "SUBSCRIBE SEKARANG", all: "Semua", showroom: "Bilik Pameran Digital", browse: "Lihat Koleksi.", noAssets: "Stok dikemaskini...", benefitsTitle: "3 Kelebihan", hotTag: "PALING LARIS", promoTag: "PROMOSI" }
  }[language];

  // 计算哪些分类有促销活动
  const categoriesWithPromo = useMemo(() => {
    const promoIds = (config.promoTemplates || []).flatMap(t => t.applicableProductIds);
    const result = new Set<string>();
    products.forEach(p => {
      if (promoIds.includes(p.id)) result.add(p.category);
    });
    return result;
  }, [config.promoTemplates, products]);

  const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  return (
    <div className="bg-white">
      {/* Hero Section - 优化为“翻白”清爽色调 */}
      <section className="relative w-full bg-[#f6f3ef] min-h-[75vh] md:min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImageUrl} className="w-full h-full object-cover opacity-80" alt="LG Hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent"></div>
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
            <div className="flex flex-wrap items-center gap-6">
              <button 
                onClick={() => document.getElementById('catalog')?.scrollIntoView({behavior:'smooth'})} 
                className="bg-black text-white px-12 py-6 rounded-full font-black uppercase text-sm tracking-widest flex items-center gap-4 shadow-3xl hover:bg-lg-red transition-all group"
              >
                {t.ctaPrimary} <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What is Section */}
      <section className="bg-white py-24 md:py-32 border-b border-gray-50">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic mb-8">{whatIsTitle}</h2>
          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto">
            {whatIsDesc}
          </p>
        </div>
      </section>

      {/* Catalog - 增加左侧分类导航 */}
      <section id="catalog" className="py-24 container mx-auto px-6 relative">
        <div className="flex flex-col md:flex-row justify-between items-end gap-16 mb-24 border-b pb-16 border-gray-100">
          <div className="space-y-6">
            <span className="text-lg-red font-black uppercase tracking-[0.8em] text-[12px] block">{t.showroom}</span>
            <h2 className="text-4xl md:text-8xl font-black uppercase tracking-tighter italic leading-none">{t.browse}</h2>
          </div>
        </div>

        <div className="flex gap-4 md:gap-12 relative">
          {/* 手机端左侧分类导航栏 */}
          <div className="w-[80px] md:w-[240px] shrink-0 sticky top-24 self-start h-[calc(100vh-120px)] overflow-y-auto no-scrollbar py-2">
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setActiveCategory('All')} 
                className={`relative group flex flex-col items-center md:items-start p-4 md:px-8 md:py-5 rounded-[25px] md:rounded-[35px] transition-all ${activeCategory === 'All' ? 'bg-lg-red text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-wider">{t.all}</span>
              </button>
              
              {displayCategories.map(cat => {
                const hasPromo = categoriesWithPromo.has(cat);
                return (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)} 
                    className={`relative group flex flex-col items-center md:items-start p-4 md:px-8 md:py-5 rounded-[25px] md:rounded-[35px] transition-all ${activeCategory === cat ? 'bg-lg-red text-white shadow-lg shadow-lg-red/20' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    {hasPromo && (
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
                    )}
                    <span className="text-[9px] md:text-[11px] font-black uppercase tracking-tighter md:tracking-wider text-center md:text-left leading-tight">{cat}</span>
                    {hasPromo && <span className="hidden md:block text-[8px] font-bold opacity-60 mt-1 uppercase">Promo active</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 商品列表 */}
          <div className="flex-1 min-w-0">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} activeAgent={activeAgent} language={language} siteSettings={siteSettings} />
                ))}
              </div>
            ) : (
              <div className="py-40 text-center flex flex-col items-center gap-6 animate-pulse">
                <Search size={48} className="text-gray-100" />
                <p className="text-gray-200 font-black uppercase tracking-[0.6em] text-sm">{t.noAssets}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-[#f2efe9] py-24 md:py-40">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-20">{t.benefitsTitle}</h2>
          
          <div className="space-y-24 md:space-y-40">
            {benefits.map((benefit, idx) => (
              <div key={idx} className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="w-full md:w-1/2 overflow-hidden rounded-[40px] shadow-2xl">
                  <img src={benefit.image} alt={benefit.title[language]} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="w-full md:w-1/2 space-y-6">
                  <span className="text-6xl md:text-8xl font-black text-gray-950/10 block leading-none">{benefit.number}</span>
                  <h3 className="text-2xl md:text-4xl font-black uppercase italic tracking-tight">{benefit.title[language]}</h3>
                  <p className="text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
                    {benefit.description[language]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
