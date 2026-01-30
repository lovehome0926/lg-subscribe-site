import React, { useState, useEffect } from 'react';
import { Product, AppRoute, Agent, Language, SiteSettings } from './types';
import { INITIAL_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES, DATA_VERSION } from './constants';
import { getProductsDB, saveProductsDB } from './utils/db';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import AgentTools from './components/AgentTools';
import Footer from './components/Footer';
import { X, Briefcase, Lock, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  
  const safeStorage = {
    get: (key: string) => { 
      try { return localStorage.getItem(key); } catch(e) { return null; } 
    },
    set: (key: string, val: string) => { 
      try { localStorage.setItem(key, val); } catch(e) {} 
    },
    remove: (key: string) => { 
      try { localStorage.removeItem(key); } catch(e) {} 
    }
  };

  const [brandingLogo, setBrandingLogo] = useState<string | null>(() => safeStorage.get('lg_branding_logo'));
  const [brandingHero, setBrandingHero] = useState<string | null>(() => safeStorage.get('lg_branding_hero'));
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = safeStorage.get('lg_site_settings');
    const defaultSettings: SiteSettings = {
      joinUsTagline: { en: 'Unlock your side hustle with LG.', cn: '加入 LG 开启副业。', ms: 'Jana pendapatan dengan LG.' },
      joinUsBenefits: [
        { en: 'High Commission', cn: '高额佣金', ms: 'Komisyen Tinggi' },
        { en: 'Flexible Hours', cn: '时间自由', ms: 'Masa Flexibel' }
      ],
      joinUsPainPoints: [
        { en: 'Low Income', cn: '收入偏低', ms: 'Pendapatan Rendah' }
      ],
      stores: [],
      promoTemplates: [],
      officeEmail: 'support@lg.my',
      recruitmentWa: '60177473787',
      featuredProductIds: [],
      socialLinks: { fb: '', ig: '', tiktok: '' }
    };

    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...defaultSettings, ...parsed };
        }
      }
    } catch(e) {}
    return defaultSettings;
  });

  useEffect(() => {
    const initApp = async () => {
      // 容错计时器：防止数据库初始化死锁
      const failsafe = setTimeout(() => {
        if (!isReady) {
          console.warn("App: Initialization failsafe triggered. Forcing ready state.");
          setIsReady(true);
        }
      }, 4000);

      try {
        const storedVersion = Number(safeStorage.get('lg_data_version') || 0);
        if (storedVersion < DATA_VERSION) {
          await saveProductsDB(INITIAL_PRODUCTS);
          safeStorage.set('lg_data_version', DATA_VERSION.toString());
        }

        const dbProducts = await getProductsDB();
        setProducts(dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS);

        // 处理代理参数
        const params = new URLSearchParams(window.location.search);
        const wa = params.get('wa');
        const name = params.get('name');
        
        if (wa && name) {
          const agent = { id: wa, name: decodeURIComponent(name), whatsapp: wa };
          setActiveAgent(agent);
          safeStorage.set('active_agent', JSON.stringify(agent));
          window.history.replaceState({}, '', window.location.pathname + window.location.hash);
        } else {
          const savedAgent = safeStorage.get('active_agent');
          if (savedAgent) {
            try {
              setActiveAgent(JSON.parse(savedAgent));
            } catch(e) {
              safeStorage.remove('active_agent');
            }
          }
        }

        const handleHashChange = () => {
          if (window.location.hash.includes('#admin')) {
            setCurrentRoute(AppRoute.ADMIN);
          } else {
            setCurrentRoute(AppRoute.HOME);
          }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange();

        setIsReady(true);
      } catch (err) {
        console.error("App: Initialization error handled.", err);
        setProducts(INITIAL_PRODUCTS);
        setIsReady(true); 
      } finally {
        clearTimeout(failsafe);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (isReady) {
      safeStorage.set('lg_site_settings', JSON.stringify(siteSettings));
    }
  }, [siteSettings, isReady]);

  const updateProducts = async (next: Product[] | ((prev: Product[]) => Product[])) => {
    const resolved = typeof next === 'function' ? next(products) : next;
    setProducts(resolved);
    await saveProductsDB(resolved);
  };

  if (!isReady) return null; // 由 index.html 的加载层负责

  return (
    <div className="min-h-screen bg-white font-sans text-gray-950 antialiased selection:bg-lg-red selection:text-white overflow-x-hidden">
      <Navbar 
        currentRoute={currentRoute} 
        activeAgent={activeAgent} 
        isAdmin={isAdminAuth}
        language={language}
        setLanguage={setLanguage}
        brandingLogo={brandingLogo}
      />
      
      <main className="pt-24 min-h-screen">
        {currentRoute === AppRoute.HOME ? (
          <>
            <Home 
              products={products} 
              categories={categories} 
              activeAgent={activeAgent} 
              language={language}
              brandingHero={brandingHero}
              siteSettings={siteSettings}
            />
            <Footer 
              brandingLogo={brandingLogo}
              siteSettings={siteSettings}
              language={language}
              activeAgent={activeAgent}
            />
          </>
        ) : isAdminAuth && currentRoute === AppRoute.ADMIN ? (
          <AdminDashboard 
            products={products}
            setProducts={updateProducts}
            categories={categories}
            setCategories={setCategories}
            language={language}
            brandingLogo={brandingLogo}
            updateBrandingLogo={(val) => { setBrandingLogo(val); if (val) safeStorage.set('lg_branding_logo', val); else safeStorage.remove('lg_branding_logo'); }}
            brandingHero={brandingHero}
            updateBrandingHero={(val) => { setBrandingHero(val); if (val) safeStorage.set('lg_branding_hero', val); else safeStorage.remove('lg_branding_hero'); }}
            siteSettings={siteSettings}
            updateSiteSettings={setSiteSettings}
            onReset={handleReset}
          />
        ) : (
          <div className="py-40 text-center space-y-12 px-6">
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-lg-red mb-4 shadow-xl border border-gray-100">
                <Lock size={32} />
              </div>
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">System Terminal</h2>
            </div>
            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={() => {
                  const pin = prompt("Admin PIN (8888):");
                  if (pin === "8888") {
                    setIsAdminAuth(true);
                    setCurrentRoute(AppRoute.ADMIN);
                  }
                }} 
                className="bg-lg-red text-white px-16 py-6 rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-xl"
              >
                Access System
              </button>
              <button onClick={() => setCurrentRoute(AppRoute.HOME)} className="text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-lg-red transition-colors">Return to Front View</button>
            </div>
          </div>
        )}
      </main>

      {/* 快捷工具入口 */}
      <div className="fixed bottom-10 right-10 z-[50]">
        <button 
          onClick={() => {
            const agentPanel = document.getElementById('agent-tools-modal');
            if (agentPanel) agentPanel.classList.toggle('hidden');
          }}
          className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-lg-red transition-all duration-500 hover:scale-110 active:scale-90"
        >
          <Briefcase size={24} />
        </button>
      </div>

      <div id="agent-tools-modal" className="fixed inset-0 z-[2000] bg-white hidden overflow-y-auto">
         <div className="sticky top-0 right-0 p-8 flex justify-end z-[2010]">
            <button 
              onClick={() => document.getElementById('agent-tools-modal')?.classList.add('hidden')}
              className="p-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm"
            >
              <X size={24} />
            </button>
         </div>
         <div className="mt-[-80px]">
           <AgentTools />
         </div>
      </div>
    </div>
  );

  function handleReset() {
    if (confirm("FACTORY RESET: All data will be wiped.")) {
      localStorage.clear();
      location.reload();
    }
  }
};

export default App;