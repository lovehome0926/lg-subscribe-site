
import React, { useState, useEffect } from 'react';
import { Product, AppRoute, Agent, Language, Multilingual, SiteSettings, StoreLocation } from './types';
import { INITIAL_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from './constants';
import { getProductsDB, saveProductsDB } from './utils/db';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import AgentTools from './components/AgentTools';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [brandingLogo, setBrandingLogo] = useState<string | null>(null);
  const [brandingHero, setBrandingHero] = useState<string | null>(null);
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    joinUsTagline: { 
      en: 'Unlock your side hustle potential with LG.', 
      cn: '加入 LG 合作伙伴，开启您的副业丰厚佣金。', 
      ms: 'Jana pendapatan sampingan sebagai Duta LG.' 
    },
    joinUsBenefits: [
      { en: 'High Commission Tiers', cn: '高额佣金回报', ms: 'Komisyen Tinggi' },
      { en: 'Flexible Working Hours', cn: '灵活工作时间', ms: 'Masa Kerja Felksibel' },
      { en: 'Professional Training', cn: '专业培训课程', ms: 'Latihan Profesional' }
    ],
    joinUsPainPoints: [
      { en: 'Struggling with fixed 9-5 income?', cn: '厌倦了固定且微薄的 9-5 工资？', ms: 'Bosan dengan gaji tetap 9-5 yang kecil?' },
      { en: 'Need extra cash for inflation?', cn: '需要额外资金应对通货膨胀？', ms: 'Perlukan wang tambahan untuk inflasi?' }
    ],
    stores: [
      { 
        id: 'hq', 
        name: 'LG Signature HQ', 
        address: 'No. 1, LG Signature Plaza, 50480 Kuala Lumpur', 
        googleMapsUrl: '', 
        image: null 
      }
    ],
    promoTemplates: [],
    officeEmail: 'support@lg-partner.my',
    contactPhone: '+60 3-1234 5678',
    recruitmentWa: '60177473787',
    featuredProductIds: [],
    socialLinks: { fb: '', ig: '', tiktok: '' }
  });

  useEffect(() => {
    const init = async () => {
      try {
        const savedSettings = localStorage.getItem('lg_site_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSiteSettings(prev => ({ ...prev, ...parsed }));
        }

        const savedLogo = localStorage.getItem('lg_branding_logo');
        if (savedLogo) setBrandingLogo(savedLogo);
        
        const savedHero = localStorage.getItem('lg_branding_hero');
        if (savedHero) setBrandingHero(savedHero);

        const savedCats = localStorage.getItem('lg_categories');
        if (savedCats) {
          try {
            const parsed = JSON.parse(savedCats);
            if (Array.isArray(parsed) && parsed.length > 0) setCategories(parsed);
          } catch (e) { }
        }

        let initialProducts: Product[] = [];
        const dbProducts = await getProductsDB();
        if (dbProducts && dbProducts.length > 0) {
          initialProducts = dbProducts;
        } else {
          initialProducts = INITIAL_PRODUCTS;
          await saveProductsDB(INITIAL_PRODUCTS);
        }
        setProducts(initialProducts);

        const params = new URLSearchParams(window.location.search);
        const agentWa = params.get('wa');
        const agentName = params.get('name');

        if (agentWa) {
          const newAgent: Agent = { id: Date.now().toString(), name: agentName || 'Official Partner', whatsapp: agentWa };
          setActiveAgent(newAgent);
          localStorage.setItem('lg_active_agent', JSON.stringify(newAgent));
        } else {
          const stored = localStorage.getItem('lg_active_agent');
          if (stored) {
            try { setActiveAgent(JSON.parse(stored)); } catch { localStorage.removeItem('lg_active_agent'); }
          }
        }

        const handleHash = () => {
          const h = window.location.hash.replace('#', '');
          if (h === 'admin') setCurrentRoute(AppRoute.ADMIN);
          else setCurrentRoute(AppRoute.HOME);
        };
        window.addEventListener('hashchange', handleHash);
        handleHash();

        setIsReady(true);
      } catch (e) {
        setIsReady(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (isReady) {
      const loader = document.getElementById('initial-loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 400);
      }
    }
  }, [isReady]);

  const updateSiteSettings = (next: SiteSettings) => {
    setSiteSettings(next);
    localStorage.setItem('lg_site_settings', JSON.stringify(next));
  };

  const updateProducts = async (next: Product[] | ((p: Product[]) => Product[])) => {
    const nextProducts = typeof next === 'function' ? next(products) : next;
    setProducts(nextProducts);
    await saveProductsDB(nextProducts);
  };

  const updateCategories = (next: string[]) => {
    setCategories(next);
    localStorage.setItem('lg_categories', JSON.stringify(next));
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-red-100 selection:text-lg-red">
      <Navbar 
        currentRoute={currentRoute} 
        activeAgent={activeAgent} 
        isAdmin={isAdminAuth} 
        language={language}
        setLanguage={setLanguage}
        brandingLogo={brandingLogo}
      />
      <main className="flex-grow pt-16">
        {!isReady ? null : currentRoute === AppRoute.ADMIN ? (
          isAdminAuth ? (
            <AdminDashboard 
              products={products} 
              setProducts={updateProducts} 
              categories={categories}
              setCategories={updateCategories}
              language={language} 
              brandingLogo={brandingLogo}
              updateBrandingLogo={(l) => { setBrandingLogo(l); if(l) localStorage.setItem('lg_branding_logo', l); }}
              brandingHero={brandingHero}
              updateBrandingHero={(h) => { setBrandingHero(h); if(h) localStorage.setItem('lg_branding_hero', h); }}
              siteSettings={siteSettings}
              updateSiteSettings={updateSiteSettings}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 fade-in text-center">
              <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-gray-400">Studio Core Access</h2>
              <button onClick={() => { if(prompt("Enter PIN to access Admin:") === "8888") setIsAdminAuth(true); }} className="bg-lg-red text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition">Verify Authorization</button>
            </div>
          )
        ) : window.location.hash.includes('agent-tools') ? (
          <AgentTools />
        ) : (
          <Home products={products} categories={categories} activeAgent={activeAgent} language={language} brandingHero={brandingHero} />
        )}
      </main>
      <Footer brandingLogo={brandingLogo} siteSettings={siteSettings} language={language} activeAgent={activeAgent} />
    </div>
  );
};

export default App;
