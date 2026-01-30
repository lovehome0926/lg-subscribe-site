
import React, { useState, useEffect } from 'react';
import { Product, AppRoute, Agent, Language, SiteSettings } from './types.js';
import { INITIAL_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES } from './constants.js';
import { getProductsDB, saveProductsDB } from './utils/db.js';
import Navbar from './components/Navbar.js';
import Home from './components/Home.js';
import AdminDashboard from './components/AdminDashboard.js';
import AgentTools from './components/AgentTools.js';
import Footer from './components/Footer.js';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [isAgentAuth, setIsAgentAuth] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  
  const [brandingLogo, setBrandingLogo] = useState<string | null>(() => localStorage.getItem('lg_branding_logo'));
  const [brandingHero, setBrandingHero] = useState<string | null>(() => localStorage.getItem('lg_branding_hero'));
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('lg_site_settings');
    return saved ? JSON.parse(saved) : {
      joinUsTagline: { en: 'Unlock your side hustle with LG.', cn: '加入 LG 开启副业。', ms: 'Jana pendapatan dengan LG.' },
      joinUsBenefits: [{ en: 'High Commission', cn: '高额佣金', ms: 'Komisyen Tinggi' }],
      joinUsPainPoints: [{ en: 'Need extra cash?', cn: '需要额外资金？', ms: 'Perlu wang?' }],
      stores: [{ id: 'hq', name: 'LG HQ', address: 'Kuala Lumpur', googleMapsUrl: '', image: null }],
      promoTemplates: [],
      officeEmail: 'support@lg.my',
      recruitmentWa: '60177473787',
      featuredProductIds: [],
      socialLinks: { fb: '', ig: '', tiktok: '' }
    };
  });

  useEffect(() => {
    localStorage.setItem('lg_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    if (brandingLogo) localStorage.setItem('lg_branding_logo', brandingLogo);
    else localStorage.removeItem('lg_branding_logo');
  }, [brandingLogo]);

  useEffect(() => {
    if (brandingHero) localStorage.setItem('lg_branding_hero', brandingHero);
    else localStorage.removeItem('lg_branding_hero');
  }, [brandingHero]);

  useEffect(() => {
    const init = async () => {
      // 解决“页面转不出来”问题：3.5秒后强制进入页面
      const forceReady = setTimeout(() => {
        if (!isReady) setIsReady(true);
      }, 3500);

      try {
        const dbProducts = await getProductsDB();
        setProducts(dbProducts.length ? dbProducts : INITIAL_PRODUCTS);

        const params = new URLSearchParams(window.location.search);
        const wa = params.get('wa');
        const name = params.get('name');
        
        if (wa) {
          const newAgent: Agent = { id: Date.now().toString(), name: name || 'Official Partner', whatsapp: wa };
          setActiveAgent(newAgent);
          localStorage.setItem('lg_active_agent', JSON.stringify(newAgent));
        } else {
          const stored = localStorage.getItem('lg_active_agent');
          if (stored) setActiveAgent(JSON.parse(stored));
        }

        const handleHash = () => {
          const h = window.location.hash.replace('#', '').split('?')[0];
          if (h === 'admin') setCurrentRoute(AppRoute.ADMIN);
          else setCurrentRoute(AppRoute.HOME);
        };
        window.addEventListener('hashchange', handleHash);
        handleHash();
      } catch (err) {
        console.error("Initialization failure, using fallback data:", err);
      } finally {
        clearTimeout(forceReady);
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
        setTimeout(() => loader.remove(), 600);
      }
    }
  }, [isReady]);

  const resetToMaster = async () => {
    if(confirm("Confirm reset to Master Data? This will clear all custom settings and branding.")) {
      setProducts(INITIAL_PRODUCTS);
      await saveProductsDB(INITIAL_PRODUCTS);
      localStorage.removeItem('lg_branding_logo');
      localStorage.removeItem('lg_branding_hero');
      localStorage.removeItem('lg_site_settings');
      location.reload();
    }
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
      <main className="flex-grow pt-20">
        {!isReady ? null : currentRoute === AppRoute.ADMIN ? (
          isAdminAuth ? (
            <AdminDashboard 
              products={products} 
              setProducts={async (next) => {
                const nextP = typeof next === 'function' ? next(products) : next;
                setProducts(nextP);
                await saveProductsDB(nextP);
              }} 
              categories={categories}
              setCategories={(c) => setCategories(c)}
              language={language} 
              brandingLogo={brandingLogo}
              updateBrandingLogo={setBrandingLogo}
              brandingHero={brandingHero}
              updateBrandingHero={setBrandingHero}
              siteSettings={siteSettings}
              updateSiteSettings={setSiteSettings}
              onReset={resetToMaster}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-gray-950">System Restricted Access</h2>
              <button onClick={() => { if(prompt("PIN:") === "8888") setIsAdminAuth(true); }} className="bg-lg-red text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg">Verify Admin PIN</button>
            </div>
          )
        ) : window.location.hash.includes('agent-tools') ? (
          isAgentAuth ? (
            <AgentTools />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-gray-950">Partner Portal Access</h2>
              <button onClick={() => { if(prompt("Partner PIN:") === "8888") setIsAgentAuth(true); }} className="bg-black text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg">Enter Tool PIN</button>
            </div>
          )
        ) : (
          <Home products={products} categories={categories} activeAgent={activeAgent} language={language} brandingHero={brandingHero} />
        )}
      </main>
      <Footer brandingLogo={brandingLogo} siteSettings={siteSettings} language={language} activeAgent={activeAgent} />
    </div>
  );
};

export default App;
