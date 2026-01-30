import React, { useState, useEffect } from 'react';
import { Product, AppRoute, Agent, Language, SiteSettings } from './types';
import { INITIAL_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES, DATA_VERSION } from './constants';
import { getProductsDB, saveProductsDB } from './utils/db';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import AgentTools from './components/AgentTools';
import Footer from './components/Footer';
import { X, Briefcase, Lock, ShieldCheck, UserCheck } from 'lucide-react';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  
  const safeStorage = {
    get: (key: string) => { try { return localStorage.getItem(key); } catch(e) { return null; } },
    set: (key: string, val: string) => { try { localStorage.setItem(key, val); } catch(e) {} },
    remove: (key: string) => { try { localStorage.removeItem(key); } catch(e) {} }
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
      const failsafe = setTimeout(() => {
        if (!isReady) {
          console.warn("App: Initialization failsafe triggered.");
          setIsReady(true);
        }
      }, 3000);

      try {
        const storedVersion = Number(safeStorage.get('lg_data_version') || 0);
        if (storedVersion < DATA_VERSION) {
          await saveProductsDB(INITIAL_PRODUCTS);
          safeStorage.set('lg_data_version', DATA_VERSION.toString());
        }

        const dbProducts = await getProductsDB();
        setProducts(dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS);

        // 核心：下线代理 (Agent) 追踪逻辑
        const params = new URLSearchParams(window.location.search);
        const wa = params.get('wa');
        const name = params.get('name');
        
        if (wa && name) {
          const agent = { id: wa, name: decodeURIComponent(name), whatsapp: wa };
          setActiveAgent(agent);
          safeStorage.set('active_agent', JSON.stringify(agent));
          // 静默清理 URL 参数，保持用户界面整洁，同时参数已持久化到 localStorage
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
        console.error("App: Boot error:", err);
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

  const handleReset = async () => {
    if (confirm("FACTORY RESET: Are you sure? This will delete everything.")) {
      localStorage.clear();
      await saveProductsDB(INITIAL_PRODUCTS);
      location.reload();
    }
  };

  if (!isReady) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#05090f] text-white">
      <div className="w-10 h-10 border-2 border-lg-red border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">Authenticating Assets...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-gray-950 antialiased selection:bg-lg-red selection:text-white">
      <Navbar 
        currentRoute={currentRoute} 
        activeAgent={activeAgent} 
        isAdmin={isAdminAuth}
        language={language}
        setLanguage={setLanguage}
        brandingLogo={brandingLogo}
      />
      
      <main className="pt-24">
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
          <div className="py-40 text-center space-y-12 px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center text-lg-red mb-4 shadow-2xl border border-gray-100">
                <Lock size={40} />
              </div>
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">System Terminal</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] max-w-xs mx-auto opacity-60">Admin clearance required to modify showroom catalog.</p>
            </div>
            
            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={() => {
                  const pin = prompt("Admin PIN (8888):");
                  if (pin === "8888") {
                    setIsAdminAuth(true);
                    setCurrentRoute(AppRoute.ADMIN);
                  } else if (pin !== null) {
                    alert("ACCESS DENIED: Authentication mismatch.");
                  }
                }} 
                className="bg-lg-red text-white px-20 py-6 rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_30px_60px_rgba(230,0,68,0.3)] hover:bg-black transition-all"
              >
                Authenticate
              </button>
              <button onClick={() => setCurrentRoute(AppRoute.HOME)} className="text-[9px] font-black uppercase tracking-widest text-gray-300 hover:text-lg-red transition-colors">Exit Terminal</button>
            </div>
          </div>
        )}
      </main>

      {/* 赚钱工具：下线通过这里生成推广链接 */}
      <div className="fixed bottom-10 right-10 z-[50] group">
        <div className="absolute bottom-full right-0 mb-6 w-56 bg-black text-white p-5 rounded-[30px] text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-3xl">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="text-lg-red" size={20} />
            <span>Downline Portal</span>
          </div>
          生成你的推广链接，赚取 LG 官方佣金。
        </div>
        <button 
          onClick={() => {
            const agentPanel = document.getElementById('agent-tools-modal');
            if (agentPanel) agentPanel.classList.toggle('hidden');
          }}
          className="w-18 h-18 md:w-20 md:h-20 bg-black text-white rounded-full flex items-center justify-center shadow-3xl hover:bg-lg-red transition-all duration-500 hover:scale-110 active:scale-90"
        >
          <Briefcase size={28} />
        </button>
      </div>

      <div id="agent-tools-modal" className="fixed inset-0 z-[2000] bg-white hidden overflow-y-auto">
         <div className="absolute top-10 right-10 z-[2010]">
            <button 
              onClick={() => document.getElementById('agent-tools-modal')?.classList.add('hidden')}
              className="p-5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors shadow-sm border border-gray-100"
            >
              <X size={24} />
            </button>
         </div>
         <AgentTools />
      </div>
    </div>
  );
};

export default App;