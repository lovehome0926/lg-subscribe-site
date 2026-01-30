
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Product, Agent, Language, PromotionTemplate, SiteSettings } from '../types.js';
import ProductCard from './ProductCard.js';
import { ArrowDown, Zap, Sparkles, ChevronRight, ChevronLeft, ArrowUpRight, CheckCircle2, ShieldCheck, Smartphone, LayoutGrid, Settings2, Laptop } from 'lucide-react';

interface HomeProps {
  products: Product[];
  categories: string[];
  activeAgent: Agent | null;
  language: Language;
  brandingHero?: string | null;
}

const Home: React.FC<HomeProps> = ({ products, categories, activeAgent, language, brandingHero }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  
  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => p.category === activeCategory);
  }, [products, activeCategory]);

  const hotDeals = useMemo(() => products.filter(p => p.isHotSale), [products]);

  const t = {
    en: { 
      heroTitle: "Premium Living, Monthly Subscription", 
      heroSub: "Upgrade your lifestyle with LG's latest home appliances. Flexible plans, professional maintenance, and zero hidden costs.",
      shopBtn: "View Catalog",
      featured: "Hot Deals",
      all: "Our Collection",
      aboutTitle: "What is LG Subscribe?",
      aboutDesc: "LG Subscribe is a household appliance subscription service that allows you to complete your home in a cost-effective way. A wide range of appliances from refrigerators to TVs are available to subscribe, making your place truly feel like a home.",
      benefitsTitle: "3 Benefits of LG Subscribe",
      benefit1Title: "First in the market, Offering 10 product lines in Malaysia.",
      benefit2Title: "Varying Hassle Free Maintenance Care Service.",
      benefit2Desc: "From Self-Service, Regular Visit or Combine Maintenance.",
      benefit3Title: "LG ThinQ Accessible products.",
      benefit3Desc: "Upgrade your lifestyle with smart integrated home control."
    },
    cn: { 
      heroTitle: "高端生活，按月租赁", 
      heroSub: "轻松升级您的家居生活。LG 最新家电租约计划：方案灵活、专业保养、无隐藏费用。",
      shopBtn: "查看目录",
      featured: "热门推荐",
      all: "产品系列",
      aboutTitle: "什么是 LG 订阅服务？",
      aboutDesc: "LG 订阅是一项家电租赁服务，让您以更经济高效的方式完善家居配置。从冰箱到电视，多种家电均可订阅，让您的家更具温馨感与科技感。",
      benefitsTitle: "LG 订阅三大核心优势",
      benefit1Title: "市场首创，在大马提供 10 条产品线。",
      benefit2Title: "多样化无忧维护保养服务。",
      benefit2Desc: "提供自助服务、定期上门维护或组合保养方案。",
      benefit3Title: "支持 LG ThinQ 智能产品。",
      benefit3Desc: "通过智能集成家居控制，全面升级您的生活品质。"
    },
    ms: { 
      heroTitle: "Kehidupan Premium, Langganan Bulanan", 
      heroSub: "Tingkatkan gaya hidup anda dengan perkakas rumah LG terbaru. Pelan fleksibel, penyelenggaraan profesional, dan tiada kos tersembunyi.",
      shopBtn: "Lihat Katalog",
      featured: "Tawaran Hebat",
      all: "Koleksi Kami",
      aboutTitle: "Apakah itu LG Subscribe?",
      aboutDesc: "LG Subscribe ialah perkhidmatan langganan perkakas rumah yang membolehkan anda melengkapkan kediaman anda dengan cara yang kos efektif. Pelbagai peralatan daripada peti sejuk hingga TV tersedia untuk dilanggan.",
      benefitsTitle: "3 Kelebihan LG Subscribe",
      benefit1Title: "Pertama di pasaran, Menawarkan 10 barisan produk di Malaysia.",
      benefit2Title: "Pelbagai Perkhidmatan Penyelenggaraan Tanpa Kerumitan.",
      benefit2Desc: "Daripada Layan Diri, Lawatan Tetap atau Penyelenggaraan Gabungan.",
      benefit3Title: "Produk Boleh Diakses LG ThinQ.",
      benefit3Desc: "Tingkatkan gaya hidup anda dengan kawalan rumah pintar bersepadu."
    }
  }[language];

  return (
    <div className="flex flex-col gap-0 pb-32 bg-white">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={brandingHero || "https://i.ibb.co/3ykG2jN/lg-ambassador-hero.jpg"} 
            className="w-full h-full object-cover object-[center_30%] scale-105"
            alt="LG Home" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl space-y-10 animate-in slide-in-from-left duration-1000">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[1.1] text-gray-950">
              {t.heroTitle}
            </h1>
            <p className="text-gray-700 text-lg font-bold max-w-md leading-relaxed uppercase tracking-tight">
              {t.heroSub}
            </p>
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-lg-red text-white px-12 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-gray-900 transition-all duration-500"
              >
                {t.shopBtn}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: About Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-0.5 bg-lg-red"></div>
               <span className="text-lg-red text-[11px] font-black uppercase tracking-[0.5em]">{t.aboutTitle}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-gray-950 leading-tight">
              {language === 'cn' ? '以更经济的方式，\n完整您的家。' : 'COMPLETE YOUR HOME.\nCOST EFFECTIVE.'}
            </h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed uppercase tracking-tight max-w-xl">
              {t.aboutDesc}
            </p>
          </div>
          <div className="relative">
             <div className="aspect-video rounded-[40px] overflow-hidden shadow-3xl">
                <img src="https://www.lg.com/content/dam/channel/wcms/my/images/refrigerators/brand-shop-banner-pc.jpg" className="w-full h-full object-cover" alt="LG Lifestyle" />
             </div>
             <div className="absolute -bottom-10 -right-10 bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 hidden md:block">
                <Sparkles className="text-lg-red mb-4" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Life's Good</p>
             </div>
          </div>
        </div>
      </section>

      {/* NEW: 3 Benefits Section (Official Look) */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-24 space-y-4">
             <span className="text-lg-red text-[12px] font-black uppercase tracking-[0.6em]">{t.benefitsTitle}</span>
             <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-gray-950">Why Choose LG Subscribe?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {/* Benefit 01 */}
            <div className="group bg-white p-12 rounded-[50px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
              <div className="text-[100px] font-black text-gray-50 absolute -top-10 -right-5 group-hover:text-red-50 transition-colors">01</div>
              <div className="relative z-10 space-y-8">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-lg-red group-hover:bg-lg-red group-hover:text-white transition-all">
                   <LayoutGrid size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-950 leading-tight">
                  {t.benefit1Title}
                </h3>
              </div>
            </div>

            {/* Benefit 02 */}
            <div className="group bg-white p-12 rounded-[50px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
              <div className="text-[100px] font-black text-gray-50 absolute -top-10 -right-5 group-hover:text-red-50 transition-colors">02</div>
              <div className="relative z-10 space-y-8">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-lg-red group-hover:bg-lg-red group-hover:text-white transition-all">
                   <Settings2 size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-950 leading-tight mb-4">
                    {t.benefit2Title}
                  </h3>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t.benefit2Desc}</p>
                </div>
              </div>
            </div>

            {/* Benefit 03 */}
            <div className="group bg-white p-12 rounded-[50px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
              <div className="text-[100px] font-black text-gray-50 absolute -top-10 -right-5 group-hover:text-red-50 transition-colors">03</div>
              <div className="relative z-10 space-y-8">
                <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-lg-red group-hover:bg-lg-red group-hover:text-white transition-all">
                   <Smartphone size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-950 leading-tight mb-4">
                    {t.benefit3Title}
                  </h3>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t.benefit3Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Promotions Section (Restored & Improved) */}
      <section id="promotion-section" className="max-w-7xl mx-auto px-8 w-full mb-32">
         <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-20">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <Zap className="text-lg-red" size={24} fill="currentColor" />
                  <span className="text-lg-red text-[11px] font-black uppercase tracking-[0.6em]">{t.featured}</span>
               </div>
               <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter text-gray-950">Limited Time Offers</h2>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {hotDeals.length > 0 ? (
              hotDeals.map(p => <ProductCard key={p.id} product={p} activeAgent={activeAgent} language={language} />)
            ) : (
              products.slice(0, 2).map(p => <ProductCard key={p.id} product={p} activeAgent={activeAgent} language={language} />)
            )}
         </div>
      </section>

      <section id="catalog-section" className="max-w-7xl mx-auto px-8 w-full">
        <div className="bg-gray-50 rounded-[80px] p-12 lg:p-24 border border-gray-100 shadow-sm">
          <div className="flex flex-col gap-16 mb-24">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
              <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter text-gray-950">{t.all}</h2>
              <div className="flex flex-wrap justify-center gap-3 bg-white p-2 rounded-full shadow-inner border border-gray-100">
                {['All', ...categories].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-[#05090f] text-white shadow-xl' : 'text-gray-400 hover:text-gray-950'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} activeAgent={activeAgent} language={language} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
