
import React, { useState } from 'react';
import { Product, Agent, Language, SiteSettings } from '../types';
import ProductCard from './ProductCard';
import { CATEGORIES } from '../constants';
import { CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface HomeProps {
  products: Product[];
  activeAgent: Agent | null;
  language: Language;
  siteSettings: SiteSettings;
}

const Home: React.FC<HomeProps> = ({ products, activeAgent, language }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const t = {
    cn: {
      heroTitle: "科技让生活更优雅",
      heroSub: "LG Subscribe 马来西亚认证合作伙伴。以极简的月付方案，解锁全球顶尖的家电艺术。",
      cta: "立即浏览展厅",
      agentNote: "认证顾问为您服务",
      all: "全部",
      showroom: "数字化展厅",
      browse: "浏览全系产品."
    },
    en: {
      heroTitle: "ELEGANCE IN EVERY DETAIL",
      heroSub: "LG Subscribe Malaysia Certified Partner. Experience premium living with flexible subscription plans.",
      cta: "Explore Collection",
      agentNote: "Certified Consultant",
      all: "All",
      showroom: "Digital Showroom",
      browse: "Browse Collection."
    },
    ms: {
      heroTitle: "KEANGGUNAN DALAM SETIAP PERINCIAN",
      heroSub: "Rakan Kongsi Sah LG Subscribe Malaysia. Alami kehidupan premium dengan pelan langganan fleksibel.",
      cta: "Terokai Koleksi",
      agentNote: "Perunding Sah",
      all: "Semua",
      showroom: "Bilik Pameran Digital",
      browse: "Lihat Koleksi."
    }
  }[language];

  const filtered = activeCategory === 'All' ? products : products.filter(p => p.category === activeCategory);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-[#f2f2f2] px-6 py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white skew-x-12 translate-x-32 hidden lg:block"></div>
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-12 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-sm">
              <ShieldCheck size={16} className="text-lg-red" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Official LG Partner</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-gray-950 uppercase">
              {t.heroTitle.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </h1>
            
            <p className="text-gray-500 font-medium text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
              {t.heroSub}
            </p>
            
            <div className="pt-6">
              <button 
                onClick={() => document.getElementById('catalog')?.scrollIntoView({behavior:'smooth'})}
                className="bg-lg-red text-white px-12 py-6 rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_20px_40px_rgba(230,0,68,0.2)] hover:bg-black transition-all"
              >
                {t.cta}
              </button>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-lg-red/5 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <img 
              src="https://www.lg.com/content/dam/channel/wcms/my/images/air-conditioners/v10api_answ_e_my_c/gallery/dz-01.jpg" 
              className="w-full h-auto object-contain drop-shadow-[0_50px_100px_rgba(0,0,0,0.1)] relative z-10 group-hover:scale-105 transition-transform duration-1000"
              alt="LG Hero"
            />
          </div>
        </div>
      </section>

      {/* 代理商置顶提示 */}
      {activeAgent && (
        <div className="sticky top-24 z-50 flex justify-center px-6 -mt-8 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-2xl px-10 py-5 rounded-full shadow-2xl border border-gray-100 flex items-center gap-8 pointer-events-auto animate-in slide-in-from-top-4">
            <div className="flex items-center gap-5 border-r pr-8">
              <div className="w-12 h-12 bg-lg-red rounded-full flex items-center justify-center text-white shadow-lg">
                <CheckCircle size={22} />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">{t.agentNote}</span>
                <span className="text-sm font-black text-gray-950 mt-1 uppercase">{activeAgent.name}</span>
              </div>
            </div>
            <a href={`https://wa.me/${activeAgent.whatsapp}`} target="_blank" className="text-[10px] font-black text-lg-red uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform pointer-events-auto">
              {language === 'cn' ? '立即咨询' : language === 'ms' ? 'Hubungi Sekarang' : 'Contact Now'} <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}

      {/* Catalog */}
      <section id="catalog" className="py-32 container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
          <div className="space-y-4">
            <span className="text-lg-red font-black uppercase tracking-[0.6em] text-[10px]">{t.showroom}</span>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter">{t.browse}</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['All', ...CATEGORIES].map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-black text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-200'}`}
              >
                {cat === 'All' ? t.all : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} activeAgent={activeAgent} language={language} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
