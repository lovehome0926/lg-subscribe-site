import React, { useMemo, useState } from 'react';
import { Product, Agent, Language, SiteSettings } from '../types';
import ProductCard from './ProductCard';
import { UserCheck, ArrowUpRight } from 'lucide-react';

interface HomeProps {
  products: Product[];
  categories: string[];
  activeAgent: Agent | null;
  language: Language;
  brandingHero?: string | null;
  siteSettings: SiteSettings;
}

const Home: React.FC<HomeProps> = ({ products, categories, activeAgent, language, brandingHero, siteSettings }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const t = {
    en: { 
      heroTitle: "A Complete Home. Today.",
      heroSub: "LG Subscribe is a household appliance subscription service that allows you to complete your home in a cost-effective way.",
      ctaPrimary: "SUBSCRIBE NOW",
      ctaSecondary: "VIEW CATALOG",
      partnerMsg: "YOU ARE BEING SERVED BY OUR VERIFIED SPECIALIST:",
      partnerBadge: "VERIFIED PARTNER",
      all: "OUR COLLECTION"
    },
    cn: { 
      heroTitle: "即刻拥有，全屋圆满。",
      heroSub: "LG 订阅是一项家电订阅服务，让您以最具性价比的方式完善家居。从冰箱到电视，多种家电均可订阅。",
      ctaPrimary: "立即订阅",
      ctaSecondary: "查看产品目录",
      partnerMsg: "正在为您服务的是认证专员：",
      partnerBadge: "官方认证",
      all: "全系列目录"
    },
    ms: { 
      heroTitle: "Rumah Lengkap. Hari Ini.",
      heroSub: "LG Subscribe adalah perkhidmatan langganan perkakas rumah yang membolehkan anda melengkapkan rumah anda dengan cara yang menjimatkan.",
      ctaPrimary: "LANGGAN SEKARANG",
      ctaSecondary: "LIHAT KATALOG",
      partnerMsg: "ANDA DILAYANI OLEH PAKAR SAH KAMI:",
      partnerBadge: "RAKAN SAH",
      all: "KOLEKSI KAMI"
    }
  }[language];

  return (
    <div className="flex flex-col gap-0 pb-32 bg-white animate-fade-up">
      
      {activeAgent && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg">
           <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-full p-2 border border-lg-red/20 flex items-center justify-between">
              <div className="flex items-center gap-3 pl-3">
                 <div className="w-9 h-9 rounded-full agent-gradient flex items-center justify-center text-white shadow-lg">
                   <UserCheck size={16} />
                 </div>
                 <div className="flex flex-col">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none">{t.partnerMsg}</p>
                    <p className="text-[11px] font-black uppercase text-gray-950 mt-1">{activeAgent.name}</p>
                 </div>
              </div>
              <span className="bg-lg-red text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                {t.partnerBadge}
              </span>
           </div>
        </div>
      )}

      {/* Premium Hero Section */}
      <section className="relative h-[85vh] md:h-[90vh] flex items-center hero-beige overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full md:w-[65%] z-0 pointer-events-none">
          <div className="w-full h-full">
            <img 
              src={brandingHero || "https://i.ibb.co/VmxP0hV/lg-showroom-hero.png"} 
              className="w-full h-full object-cover object-center"
              alt="LG Home" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://www.lg.com/content/dam/channel/wcms/my/images/refrigerators/gr-b247sluv_asbp_e_my_c/gallery/dz-01.jpg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-lg-beige via-lg-beige/40 to-transparent"></div>
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-xl space-y-12 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl lg:text-[85px] font-black text-gray-950 tracking-tighter leading-[0.95]">
              {t.heroTitle}
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-tight text-sm leading-relaxed max-w-md mx-auto md:mx-0 opacity-80">
              {t.heroSub}
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start pt-2">
              <button 
                onClick={() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-lg-red text-white px-10 py-6 rounded-lg font-black uppercase tracking-wider text-[14px] flex items-center justify-center gap-4 hover:bg-black transition-all btn-red-shadow group"
              >
                {t.ctaPrimary} <ArrowUpRight size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button 
                onClick={() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-gray-950 px-10 py-6 rounded-lg font-black uppercase tracking-wider text-[14px] hover:bg-gray-50 transition-all shadow-xl"
              >
                {t.ctaSecondary}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section id="catalog-section" className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center space-y-10 mb-24">
             <span className="text-lg-red text-[11px] font-black uppercase tracking-[1em] block">{t.all}</span>
             <h2 className="text-6xl md:text-[100px] font-black uppercase tracking-tighter leading-none text-gray-950">CATALOG.</h2>
             <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto pt-8">
                {['All', ...categories].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${activeCategory === cat ? 'bg-lg-red text-white border-lg-red shadow-xl' : 'bg-transparent text-gray-400 border-gray-100 hover:text-gray-950'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {filteredProducts.map(p => (
               <ProductCard key={p.id} product={p} activeAgent={activeAgent} language={language} promoTemplates={siteSettings.promoTemplates} />
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;