
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Product, Agent, Language, PromotionTemplate, SiteSettings } from '../types';
import ProductCard from './ProductCard';

interface HomeProps {
  products: Product[];
  categories: string[];
  activeAgent: Agent | null;
  language: Language;
  brandingHero?: string | null;
}

const Home: React.FC<HomeProps> = ({ products, categories: customCategories, activeAgent, language, brandingHero }) => {
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activePromoFilter, setActivePromoFilter] = useState<string>('');
  const promoContainerRef = useRef<HTMLDivElement>(null);

  const siteSettings: SiteSettings | null = useMemo(() => {
    try {
      const saved = localStorage.getItem('lg_site_settings');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  }, []);

  const activePromoTemplates = useMemo(() => {
    return (siteSettings?.promoTemplates || []).filter((t: PromotionTemplate) => t.isActive);
  }, [siteSettings]);

  const displayCategories = useMemo(() => {
    const uniqueCatsInProducts = new Set(products.map(p => p.category));
    return customCategories.filter(cat => uniqueCatsInProducts.has(cat));
  }, [products, customCategories]);

  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  const sortedProductsList = useMemo(() => {
    let list = [...products].sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      return 0;
    });
    if (activePromoFilter) {
      list = list.filter(p => {
        const promo = activePromoTemplates.find(t => t.name === activePromoFilter);
        return promo ? (promo.applyToAll || (promo.targetProductIds && promo.targetProductIds.includes(p.id))) : false;
      });
    }
    return list;
  }, [products, activePromoFilter, activePromoTemplates]);

  const promoProducts = useMemo(() => {
    const featuredIds = siteSettings?.featuredProductIds || [];
    if (featuredIds.length > 0) {
      return featuredIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => !!p);
    }
    return products
      .filter(p => p.isHotSale || p.isPromoActive || p.isNew)
      .sort((a, b) => (a.isHotSale === b.isHotSale) ? 0 : a.isHotSale ? -1 : 1);
  }, [products, siteSettings]);

  const scrollToCatalog = () => {
    const firstCat = displayCategories[0];
    if (firstCat) scrollToCategory(firstCat);
  };

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    setActivePromoFilter('');
    const el = categoryRefs.current[cat];
    if (el) {
      window.scrollTo({ top: el.getBoundingClientRect().top - document.body.getBoundingClientRect().top - 240, behavior: 'smooth' });
    }
  };

  const scrollPromos = (direction: 'left' | 'right') => {
    if (promoContainerRef.current) {
      promoContainerRef.current.scrollBy({ left: direction === 'left' ? -400 : 400, behavior: 'smooth' });
    }
  };

  const t = {
    en: { partner: "Consultant:", hero_title: "LG Subscribe", hero_sub: "A Complete Home, Today.", shop_now: "Shop Now", models: "Models", promo_title: "LIMITED OFFERS", promo_tag: "MARKET HOT SELECTION", promo_sub: "CURATED BEST SELLERS WITH MAXIMUM CONTRACT SAVINGS.", explore: "Explore Collections", all_promos: "ALL DEALS", filter_promo: "PROMO EVENTS" },
    cn: { partner: "官方服务顾问:", hero_title: "LG Subscribe", hero_sub: "今天就让您的家完整无缺。", shop_now: "立即选购", models: "款机型", promo_title: "限时惊喜优惠", promo_tag: "市场精选热卖爆款", promo_sub: "自动锁定最高减免方案，为您展现最具冲击力的合约节省额度。", explore: "探索全线系列", all_promos: "全部优惠", filter_promo: "热门促销活动" },
    ms: { partner: "Penasihat Rasmi:", hero_title: "LG Subscribe", hero_sub: "Lengkapkan Rumah Anda, Hari Ini.", shop_now: "Beli Sekarang", models: "Model", promo_title: "TAWARAN TERHAD", promo_tag: "PILIHAN TERHANGAT PASARAN", promo_sub: "PILIHAN MODEL TERLARIS DENGAN PENJIMATAN KONTRAK MAKSIMUM.", explore: "Terokai Koleksi", all_promos: "SEMUA TAWARAN", filter_promo: "ACARA PROMOSI" }
  }[language];

  return (
    <div className="fade-in bg-white min-h-screen">
      {activeAgent && (
        <div className="bg-[#05090f] text-white py-4 px-6 sticky top-16 z-50 border-b border-white/5 shadow-xl">
          <div className="container mx-auto flex items-center justify-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">{t.partner}</span>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[13px] font-black uppercase tracking-widest text-lg-red">{activeAgent.name}</span>
            </div>
          </div>
        </div>
      )}

      <section className="px-4 sm:px-10 pt-6 pb-4 max-w-7xl mx-auto">
        <div className="relative w-full h-[380px] md:h-[560px] overflow-hidden rounded-[40px] md:rounded-[60px] bg-gray-900 group shadow-2xl">
          <img src={brandingHero || "https://i.ibb.co/3ykG2jN/lg-ambassador-hero.jpg"} className="w-full h-full object-cover object-[center_35%] transition-transform duration-1000 group-hover:scale-105" alt="LG" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-24 px-8 md:px-20 text-white">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-0.5 bg-lg-red"></div>
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.6em] text-lg-red">Corporate Partner</span>
             </div>
             <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-6 drop-shadow-2xl">{t.hero_title}</h1>
             <p className="text-base md:text-2xl font-light uppercase tracking-[0.25em] opacity-80 max-w-xl leading-relaxed mb-10">{t.hero_sub}</p>
             <div><button onClick={scrollToCatalog} className="bg-lg-red text-white px-14 py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-white hover:text-lg-red transition-all duration-500 transform active:scale-95">{t.shop_now}</button></div>
          </div>
        </div>
      </section>

      {promoProducts.length > 0 && (
        <section id="promotion-section" className="py-24 md:py-32 bg-[#05090f] text-white overflow-hidden relative">
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-lg-red rounded-full"></div>
                  <span className="text-lg-red text-[11px] font-black uppercase tracking-[0.7em]">{t.promo_tag}</span>
                </div>
                <h2 className="text-6xl md:text-[100px] font-black uppercase tracking-tighter leading-none">{t.promo_title}</h2>
                <p className="text-sm md:text-base text-gray-500 font-bold uppercase tracking-[0.3em] max-w-2xl leading-relaxed">{t.promo_sub}</p>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => scrollPromos('left')} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-lg-red transition-all group active:scale-90 flex items-center justify-center">←</button>
                 <button onClick={() => scrollPromos('right')} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-lg-red transition-all group active:scale-90 flex items-center justify-center">→</button>
              </div>
            </div>
            <div className="overflow-x-auto no-scrollbar pb-10" ref={promoContainerRef}>
              <div className="flex gap-8 md:gap-12 min-w-max px-4">
                {promoProducts.map(product => (
                  <div key={product.id} className="w-[300px] sm:w-[350px] md:w-[420px]">
                    <ProductCard product={product} activeAgent={activeAgent} language={language} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <div id="catalog-section" className="sticky top-[138px] z-[40] py-4 md:py-8 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col gap-4">
          <div className="flex-1 overflow-x-auto no-scrollbar py-1">
            <div className="flex gap-3 md:gap-4 min-w-max items-center">
              {displayCategories.map(cat => (
                <button key={cat} onClick={() => scrollToCategory(cat)} className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeCategory === cat && !activePromoFilter ? 'bg-gray-950 text-white shadow-lg scale-105' : 'bg-gray-50 text-gray-400 hover:text-gray-900'}`}>{cat}</button>
              ))}
            </div>
          </div>
          {activePromoTemplates.length > 0 && (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 pt-4 border-t border-gray-50">
              <span className="text-[8px] font-black text-lg-red uppercase tracking-[0.4em] shrink-0">{t.filter_promo}</span>
              <div className="overflow-x-auto no-scrollbar w-full">
                <div className="flex gap-3 min-w-max">
                  <button onClick={() => setActivePromoFilter('')} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!activePromoFilter ? 'bg-lg-red text-white shadow-md' : 'bg-red-50 text-lg-red/40'}`}>{t.all_promos}</button>
                  {activePromoTemplates.map(promo => (
                    <button key={promo.id} onClick={() => { setActivePromoFilter(promo.name); setActiveCategory(''); }} className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activePromoFilter === promo.name ? 'bg-amber-500 text-white shadow-md scale-105' : 'bg-amber-50 text-amber-500/50 hover:text-amber-500'}`}>✨ {promo.name}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="py-24 pb-48">
        <div className="container mx-auto px-6 max-w-7xl">
          {activePromoFilter ? (
            <div className="animate-in fade-in duration-700">
               <div className="mb-16 border-b border-gray-100 pb-10">
                  <h2 className="text-5xl md:text-8xl font-black text-gray-950 uppercase tracking-tighter leading-none">{activePromoFilter}</h2>
                  <p className="text-[10px] font-black text-lg-red uppercase tracking-[0.6em] mt-4">Showing participating items</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
                {sortedProductsList.map(product => <ProductCard key={product.id} product={product} activeAgent={activeAgent} language={language} />)}
              </div>
            </div>
          ) : displayCategories.map(cat => (
            <div key={cat} ref={el => { categoryRefs.current[cat] = el; }} className="mb-40 scroll-mt-72">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16 border-b border-gray-100 pb-10">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-lg-red uppercase tracking-[0.6em]">DIGITAL SHOWCASE</span>
                  <h2 className="text-5xl md:text-8xl font-black text-gray-950 uppercase tracking-tighter leading-none">{cat}</h2>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em]">{products.filter(p => p.category === cat).length} {t.models}</span>
                  </div>
                  <div className="w-12 h-1 bg-gray-950 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
                {sortedProductsList.filter(p => p.category === cat).map(product => <ProductCard key={product.id} product={product} activeAgent={activeAgent} language={language} />)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
