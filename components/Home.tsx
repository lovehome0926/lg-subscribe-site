
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Product, Agent, Language, PromotionTemplate, SiteSettings } from '../types.js';
import ProductCard from './ProductCard.js';
import { ArrowDown, Zap, Sparkles, ChevronRight, ChevronLeft, ArrowUpRight } from 'lucide-react';

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
    let list = [...products].sort((a, b) => (a.isNew && !b.isNew) ? -1 : 0);
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
      return featuredIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => !!p);
    }
    return products.filter(p => p.isHotSale || p.isPromoActive || p.isNew).sort((a, b) => a.isHotSale ? -1 : 1);
  }, [products, siteSettings]);

  const scrollToCatalog = () => {
    const section = document.getElementById('catalog-section');
    if (section) window.scrollTo({ top: section.offsetTop - 150, behavior: 'smooth' });
  };

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    setActivePromoFilter('');
    const el = categoryRefs.current[cat];
    if (el) window.scrollTo({ top: el.offsetTop - 240, behavior: "smooth" });
  };

  const scrollPromos = (direction: 'left' | 'right') => {
    if (promoContainerRef.current) {
      promoContainerRef.current.scrollBy({ left: direction === 'left' ? -450 : 450, behavior: 'smooth' });
    }
  };

  const t = {
    en: { partner: "Official Partner:", hero_title: "A Complete Home. Today.", shop_now: "SUBSCRIBE NOW", catalog: "View Catalog", promo_title: "Limited Time Offers", promo_tag: "Flash Selection", explore: "Explore Collections", all_promos: "All Deals", filter_promo: "Promo Events", models: "Models" },
    cn: { partner: "认证代理人:", hero_title: "全屋智享。即刻拥有。", shop_now: "立即订阅", catalog: "查看目录", promo_title: "限时促销惊喜", promo_tag: "市场精选热卖", explore: "探索全线系列", all_promos: "全部优惠", filter_promo: "促销活动", models: "款产品" },
    ms: { partner: "Ejen Rasmi:", hero_title: "Kediaman Lengkap. Hari Ini.", shop_now: "LANGGAN SEKARANG", catalog: "Lihat Katalog", promo_title: "Tawaran Terhad", promo_tag: "Pilihan Kilat", explore: "Terokai Koleksi", all_promos: "Semua Tawaran", filter_promo: "Acara Promosi", models: "Model" }
  }[language];

  return (
    <div className="fade-in bg-white min-h-screen">
      {activeAgent && (
        <div className="bg-[#05090f] text-white py-3 px-6 sticky top-16 z-50 border-b border-white/5 shadow-2xl backdrop-blur-lg bg-opacity-95">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase tracking-[0.4em] opacity-40">{t.partner}</span>
              <span className="text-[12px] font-black uppercase tracking-widest text-lg-red">{activeAgent.name}</span>
            </div>
            <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">Commission Enabled</span>
            </div>
          </div>
        </div>
      )}

      {/* REFINED HERO SECTION */}
      <section className="relative h-[90vh] min-h-[700px] flex items-center bg-[#f2e6d9]">
        <div className="absolute inset-0">
          <img 
            src={brandingHero || "https://i.ibb.co/3ykG2jN/lg-ambassador-hero.jpg"} 
            className="w-full h-full object-cover object-[center_30%]"
            alt="LG Home" 
          />
        </div>
        
        <div className="container mx-auto px-10 md:px-24 relative z-10">
          <div className="max-w-4xl">
            <img src="https://i.ibb.co/Rk6m7Yw/lg-sub-logo-red.png" className="h-10 sm:h-14 mb-10 drop-shadow-sm" alt="LG Subscribe" />
            
            <h1 className="text-5xl md:text-[75px] font-black text-gray-950 uppercase tracking-tighter leading-[0.85] mb-12 animate-in slide-in-from-left duration-1000">
              {t.hero_title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 mt-16 animate-in slide-in-from-left duration-1000 delay-300">
              <button 
                onClick={scrollToCatalog} 
                className="group bg-lg-red text-white px-12 sm:px-16 py-6 sm:py-8 rounded-2xl font-black uppercase tracking-widest text-[12px] sm:text-[14px] shadow-2xl hover:bg-black transition-all duration-500 flex items-center gap-4"
              >
                {t.shop_now} <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              
              <button 
                onClick={scrollToCatalog} 
                className="bg-white text-gray-950 border-2 border-transparent hover:border-gray-950 px-12 sm:px-16 py-6 sm:py-8 rounded-2xl font-black uppercase tracking-widest text-[12px] sm:text-[14px] shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                {t.catalog}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Strip */}
      {promoProducts.length > 0 && (
        <section id="promotion-section" className="py-24 bg-[#05090f] text-white relative overflow-hidden">
          <div className="container mx-auto px-10 max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="text-lg-red" size={20} fill="currentColor" />
                  <span className="text-lg-red text-[11px] font-black uppercase tracking-[0.6em]">{t.promo_tag}</span>
                </div>
                <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">{t.promo_title}</h2>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => scrollPromos('left')} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-lg-red transition-all group"><ChevronLeft size={28}/></button>
                 <button onClick={() => scrollPromos('right')} className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center hover:bg-lg-red transition-all group"><ChevronRight size={28}/></button>
              </div>
            </div>
            
            <div className="overflow-x-auto no-scrollbar pb-10" ref={promoContainerRef}>
              <div className="flex gap-10 min-w-max px-4">
                {promoProducts.map(product => (
                  <div key={product.id} className="w-[340px] md:w-[420px]">
                    <ProductCard product={product} activeAgent={activeAgent} language={language} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Catalog Filters */}
      <div id="catalog-section" className="sticky top-[110px] md:top-[128px] z-[40] py-8 bg-white/90 backdrop-blur-2xl border-b border-gray-100">
        <div className="container mx-auto px-10 max-w-7xl flex flex-col gap-6">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
            {displayCategories.map(cat => (
              <button 
                key={cat} 
                onClick={() => scrollToCategory(cat)} 
                className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${activeCategory === cat ? 'bg-black text-white border-transparent' : 'bg-white text-gray-400 border-gray-100 hover:text-lg-red'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catalog Display */}
      <section className="py-24 pb-64 container mx-auto px-10 max-w-7xl">
        {displayCategories.map((cat, idx) => (
          <div key={cat} ref={el => { categoryRefs.current[cat] = el; }} className="mb-40 scroll-mt-[250px]">
            <div className="flex items-end gap-10 mb-16 border-b border-gray-100 pb-10">
              <h2 className="text-6xl md:text-9xl font-black text-gray-950 uppercase tracking-tighter leading-none">{cat}</h2>
              <span className="text-[12px] font-black text-gray-300 uppercase tracking-widest mb-4">{products.filter(p => p.category === cat).length} {t.models}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {sortedProductsList.filter(p => p.category === cat).map(product => <ProductCard key={product.id} product={product} activeAgent={activeAgent} language={language} />)}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
