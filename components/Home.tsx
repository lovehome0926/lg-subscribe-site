import React, { useMemo, useState } from 'react';
import { Product, Agent, Language, SiteSettings } from '../types';
import ProductCard from './ProductCard';
import { Zap, UserCheck, Box, Settings, Cpu, ArrowUpRight } from 'lucide-react';

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

  const hotDeals = useMemo(() => products.filter(p => p.isHotSale), [products]);

  const t = {
    en: { 
      heroBadge: "LG Subscribe™",
      heroTitle: "A Complete Home. Today.",
      heroSub: "LG Subscribe is a household appliance subscription service that allows you to complete your home in a cost-effective way. A wide range of appliances from refrigerators to TVs are available to subscribe, making your place truly feel like a home.",
      ctaPrimary: "SUBSCRIBE NOW",
      ctaSecondary: "VIEW CATALOG",
      benefitTitle: "3 BENEFITS OF LG SUBSCRIBE",
      benefit1: "First in the market, Offering 10 product lines in Malaysia.",
      benefit2: "Varying Hassle Free Maintenance Care Service from Self-Service, Regular Visit or Combine Maintenance.",
      benefit3: "LG ThinQ Accessible products to upgrade your lifestyle.",
      partnerMsg: "YOU ARE BEING SERVED BY OUR VERIFIED SPECIALIST:",
      partnerBadge: "VERIFIED PARTNER",
      featured: "HOT DEALS",
      all: "OUR COLLECTION"
    },
    cn: { 
      heroBadge: "LG Subscribe™ 订阅服务",
      heroTitle: "即刻拥有，全屋圆满。",
      heroSub: "LG 订阅是一项家电订阅服务，让您以最具性价比的方式完善家居。从冰箱到电视，多种家电均可订阅，让您的房子真正有家的感觉。",
      ctaPrimary: "立即订阅",
      ctaSecondary: "查看产品目录",
      benefitTitle: "LG 订阅的 3 大优势",
      benefit1: "市场首创，在大马提供 10 条产品线。",
      benefit2: "灵活的无忧维护服务：包括自助服务、定期访问或组合维护。",
      benefit3: "LG ThinQ 智能互联，全方位升级您的生活方式。",
      partnerMsg: "正在为您服务的是认证专员：",
      partnerBadge: "官方认证",
      featured: "热门推荐",
      all: "全系列目录"
    },
    ms: { 
      heroBadge: "LG Subscribe™",
      heroTitle: "Rumah Lengkap. Hari Ini.",
      heroSub: "LG Subscribe adalah perkhidmatan langganan perkakas rumah yang membolehkan anda melengkapkan rumah anda dengan cara yang menjimatkan. Pelbagai pilihan perkakas dari peti sejuk hingga TV sedia untuk dilanggan.",
      ctaPrimary: "LANGGAN SEKARANG",
      ctaSecondary: "LIHAT KATALOG",
      benefitTitle: "3 MANFAAT LG SUBSCRIBE",
      benefit1: "Pertama di pasaran, Menawarkan 10 barisan produk di Malaysia.",
      benefit2: "Servis Penyelenggaraan Tanpa Keraguan dari Servis Sendiri, Lawatan Berkala atau Penyelenggaraan Gabungan.",
      benefit3: "Produk Diakses LG ThinQ untuk meningkatkan gaya hidup anda.",
      partnerMsg: "ANDA DILAYANI OLEH PAKAR SAH KAMI:",
      partnerBadge: "RAKAN SAH",
      featured: "TAWARAN HEBAT",
      all: "KOLEKSI KAMI"
    }
  }[language];

  return (
    <div className="flex flex-col gap-0 pb-32 bg-white">
      
      {activeAgent && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-lg animate-in slide-in-from-top duration-1000">
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

      {/* Optimized Hero Section - Full Banner Implementation */}
      <section className="relative h-[85vh] md:h-[90vh] flex items-center hero-beige overflow-hidden">
        
        {/* Full Banner Background Image Overlay */}
        <div className="absolute top-0 right-0 w-full h-full md:w-[65%] z-0 pointer-events-none">
          <div className="w-full h-full animate-in fade-in duration-1000">
            <img 
              src={brandingHero || "https://i.ibb.co/VmxP0hV/lg-showroom-hero.png"} 
              className="w-full h-full object-cover object-center"
              alt="LG Digital Home Showroom" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://www.lg.com/content/dam/channel/wcms/my/images/refrigerators/gr-b247sluv_asbp_e_my_c/gallery/dz-01.jpg";
              }}
            />
            {/* Smooth transition gradient from beige to image */}
            <div className="absolute inset-0 bg-gradient-to-r from-lg-beige via-lg-beige/20 to-transparent"></div>
          </div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-xl space-y-12 text-center md:text-left">
            {/* Header Title - Slightly smaller as requested */}
            <h1 className="text-5xl md:text-7xl lg:text-[85px] font-black text-gray-950 tracking-tighter leading-[0.95] hero-text-shadow">
              {t.heroTitle}
            </h1>

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

      {/* 3 Benefits Section - Elegant Showroom Layout */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-20 items-center mb-24">
             <div className="lg:col-span-1 space-y-10">
                <div className="space-y-4">
                  <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none text-gray-950">
                     {t.benefitTitle}
                  </h2>
                  <div className="w-24 h-2 bg-lg-red"></div>
                </div>
                <p className="text-gray-500 text-lg font-medium leading-relaxed uppercase tracking-tight opacity-70">
                   {t.heroSub}
                </p>
             </div>

             <div className="lg:col-span-2 grid md:grid-cols-3 gap-8">
                <div className="bg-lg-beige/20 p-10 rounded-[45px] space-y-10 relative overflow-hidden group hover:bg-lg-beige/40 transition-all duration-500">
                   <div className="benefit-number text-gray-900">01</div>
                   <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-lg-red shadow-xl group-hover:scale-110 transition-transform">
                      <Box size={32} />
                   </div>
                   <p className="text-[14px] font-black uppercase tracking-tight text-gray-950 leading-snug">
                     {t.benefit1}
                   </p>
                </div>

                <div className="bg-lg-beige/20 p-10 rounded-[45px] space-y-10 relative overflow-hidden group hover:bg-lg-beige/40 transition-all duration-500">
                   <div className="benefit-number text-gray-900">02</div>
                   <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-lg-red shadow-xl group-hover:scale-110 transition-transform">
                      <Settings size={32} />
                   </div>
                   <p className="text-[14px] font-black uppercase tracking-tight text-gray-950 leading-snug">
                     {t.benefit2}
                   </p>
                </div>

                <div className="bg-lg-beige/20 p-10 rounded-[45px] space-y-10 relative overflow-hidden group hover:bg-lg-beige/40 transition-all duration-500">
                   <div className="benefit-number text-gray-900">03</div>
                   <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-lg-red shadow-xl group-hover:scale-110 transition-transform">
                      <Cpu size={32} />
                   </div>
                   <p className="text-[14px] font-black uppercase tracking-tight text-gray-950 leading-snug">
                     {t.benefit3}
                   </p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Promotion & Catalog Sections - Preserving All Logic */}
      <section id="promotion-section" className="py-40 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lg-red to-transparent"></div>
        <div className="container mx-auto px-6 max-w-7xl">
           <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-32">
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <Zap className="text-lg-red" size={24} fill="currentColor" />
                    <span className="text-lg-red text-[11px] font-black uppercase tracking-[0.8em]">{t.featured}</span>
                 </div>
                 <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-none">HOT OFFERS.</h2>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-[0.1em] text-[11px] max-w-xs mb-6 border-l-2 border-lg-red pl-8">
                PREMIUM INSTALLATION AND PROFESSIONAL CARE INCLUDED IN EVERY SUBSCRIPTION.
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {(hotDeals.length > 0 ? hotDeals : products.slice(0, 2)).map(p => (
                <div key={p.id} className="transform hover:scale-[1.01] transition-all duration-700">
                  <ProductCard product={p} activeAgent={activeAgent} language={language} promoTemplates={siteSettings.promoTemplates} />
                </div>
              ))}
           </div>
        </div>
      </section>

      <section id="catalog-section" className="py-48 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center space-y-10 mb-32">
             <span className="text-lg-red text-[11px] font-black uppercase tracking-[1em] block">{t.all}</span>
             <h2 className="text-6xl md:text-[120px] font-black uppercase tracking-tighter leading-none text-gray-950">CATALOG.</h2>
             
             <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto pt-14">
                {['All', ...categories].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 border-2 ${activeCategory === cat ? 'bg-lg-red text-white border-lg-red shadow-2xl shadow-lg-red/30' : 'bg-transparent text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-950'}`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
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