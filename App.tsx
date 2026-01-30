import React, { useState, useEffect } from 'react';
import { Product, AppRoute, Agent, Language, SiteSettings } from './types.js';
import { INITIAL_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES, DATA_VERSION } from './constants.js';
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
  const [bootError, setBootError] = useState<string | null>(null);
  
  const safeStorage = {
    get: (key: string) => { try { return localStorage.getItem(key); } catch(e) { return null; } },
    set: (key: string, val: string) => { try { localStorage.setItem(key, val); } catch(e) {} },
    remove: (key: string) => { try { localStorage.removeItem(key); } catch(e) {} }
  };

  const [brandingLogo, setBrandingLogo] = useState<string | null>(() => safeStorage.get('lg_branding_logo'));
  const [brandingHero, setBrandingHero] = useState<string | null>(() => safeStorage.get('lg_branding_hero'));
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = safeStorage.get('lg_site_settings');
    try {
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
    } catch(e) {
      return { officeEmail: 'support@lg.my', recruitmentWa: '60177473787', stores: [], promoTemplates: [], joinUsTagline: {en:'',cn:'',ms:''}, joinUsBenefits: [], joinUsPainPoints: [], featuredProductIds: [] };
    }
  });

  useEffect(() => {
    safeStorage.set('lg_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    if (brandingLogo) safeStorage.set('lg_branding_logo', brandingLogo);
    else safeStorage.remove('lg_branding_logo');
  }, [brandingLogo]);

  useEffect(() => {
    const init = async () => {
      const forceReady = setTimeout(() => setIsReady(true), 3500);

      try {
        const lastVersionStr = safeStorage.get('lg_data_version');
        const lastVersion = lastVersionStr ? parseInt(lastVersionStr) : 0;
        
        if (lastVersion < DATA_VERSION) {
          console.log(`Updating Master Data from version ${lastVersion} to ${DATA_VERSION}`);
          setProducts(INITIAL_PRODUCTS);
          await saveProductsDB(INITIAL_PRODUCTS);
          safeStorage.set('lg_data_version', DATA_VERSION.toString());
        } else {
          const dbProducts = await getProductsDB().catch(() => []);
          setProducts(dbProducts.length ? dbProducts : INITIAL_PRODUCTS);
        }

        const params = new URLSearchParams(window.location.search);
        const wa = params.get('wa');
        const name = params.get('name');
        
        if (wa) {
          const newAgent: Agent = { id: Date.now().toString(), name: name || 'Partner', whatsapp: wa };
          setActiveAgent(newAgent);
          safeStorage.set('lg_active_agent', JSON.stringify(newAgent));
        } else {
          const stored = safeStorage.get('lg_active_agent');
          if (stored) {
            try { setActiveAgent(JSON.parse(stored)); } catch(e) {}
          }
        }

        const handleHash = () => {
          const h = window.location.hash.replace('#', '').split('?')[0];
          if (h === 'admin') setCurrentRoute(AppRoute.ADMIN);
          else setCurrentRoute(AppRoute.HOME);
        };
        window.addEventListener('hashchange', handleHash);
        handleHash();
      } catch (err) {
        console.error("Init failed:", err);
        setProducts(INITIAL_PRODUCTS);
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

  if (bootError) return <div className="p-20 text-center font-black uppercase tracking-widest">{bootError}</div>;

  return (
    <div className="min-h-screen flex flex-col selection:bg-red-100 selection:text-lg-red bg-white">
      <Navbar 
        currentRoute={currentRoute} 
        activeAgent={activeAgent} 
        isAdmin={isAdminAuth} 
        language={language}
        setLanguage={setLanguage}
        brandingLogo={brandingLogo}
      />
      <main className="flex-grow pt-16">
        {!isReady ? (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
             <div className="w-10 h-10 border-4 border-gray-100 border-t-lg-red rounded-full animate-spin"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Synchronizing Master...</p>
          </div>
        ) : currentRoute === AppRoute.ADMIN ? (
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
              onReset={() => {
                 if(confirm("Reset?")) {
                   safeStorage.remove('lg_data_version');
                   location.reload();
                 }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
              <h2 className="text-xl font-black uppercase tracking-widest mb-10 text-gray-950">Encrypted Area</h2>
              <button onClick={() => { if(prompt("PIN:") === "8888") setIsAdminAuth(true); }} className="bg-lg-red text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl">Verify</button>
            </div>
          )
        ) : (
          <Home products={products} categories={categories} activeAgent={activeAgent} language={language} brandingHero={brandingHero} />
        )}
      </main>
      {isReady && <Footer brandingLogo={brandingLogo} siteSettings={siteSettings} language={language} activeAgent={activeAgent} />}
    </div>
  );
};

export default App;