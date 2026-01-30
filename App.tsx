
import React, { useState, useEffect } from 'react';
import { Product, AppRoute, Agent, Language, SiteSettings } from './types';
import { INITIAL_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES, DATA_VERSION } from './constants';
import { getProductsDB, saveProductsDB } from './utils/db';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import AgentTools from './components/AgentTools';
import Footer from './components/Footer';
import { X, Briefcase } from 'lucide-react';

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
  
  // Fix for error on line 29: Ensured default site settings match the SiteSettings interface
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = safeStorage.get('lg_site_settings');
    const defaultSettings: SiteSettings = {
      joinUsTagline: { en: 'Unlock your side hustle with LG.', cn: '加入 LG 开启副业。', ms: 'Jana pendapatan dengan LG.' },
      joinUsBenefits: [
        { en: 'High Commission', cn: '高额佣金', ms: 'Komisyen Tinggi' },
        { en: 'Flexible Hours', cn: '时间自由', ms: 'Masa Fleksibel' }
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
          return {
            ...defaultSettings,
            ...parsed
          };
        }
      }
    } catch(e) {}
    return defaultSettings;
  });

  // Initialization effect
  useEffect(() => {
    const loadData = async () => {
      const storedVersion = Number(safeStorage.get('lg_data_version') || 0);
      
      if (storedVersion < DATA_VERSION) {
        await saveProductsDB(INITIAL_PRODUCTS);
        safeStorage.set('lg_data_version', DATA_VERSION.toString());
      }

      const dbProducts = await getProductsDB();
      if (dbProducts.length > 0) {
        setProducts(dbProducts);
      } else {
        setProducts(INITIAL_PRODUCTS);
        await saveProductsDB(INITIAL_PRODUCTS);
      }

      // Check URL for agent info
      const params = new URLSearchParams(window.location.search);
      const wa = params.get('wa');
      const name = params.get('name');
      
      if (wa && name) {
        const agent = { id: wa, name: decodeURIComponent(name), whatsapp: wa };
        setActiveAgent(agent);
        safeStorage.set('active_agent', JSON.stringify(agent));
      } else {
        const savedAgent = safeStorage.get('active_agent');
        if (savedAgent) setActiveAgent(JSON.parse(savedAgent));
      }

      // Check admin auth via hash
      if (window.location.hash === '#admin-console') {
        setIsAdminAuth(true);
        setCurrentRoute(AppRoute.ADMIN);
      }

      setIsReady(true);
    };

    loadData();
  }, []);

  // Update effect for saving site settings
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
    if (confirm("Reset all data to default? This cannot be undone.")) {
      localStorage.clear();
      await saveProductsDB(INITIAL_PRODUCTS);
      location.reload();
    }
  };

  if (!isReady) return (
    <div className="h-screen w-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-lg-red border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // Added return statement to fix error on line 11 (Type '() => void' is not assignable to type 'FC<{}>')
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
          <div className="py-40 text-center space-y-8">
            <h2 className="text-4xl font-black">UNAUTHORIZED ACCESS</h2>
            <button onClick={() => setCurrentRoute(AppRoute.HOME)} className="bg-lg-red text-white px-10 py-4 rounded-full font-black uppercase tracking-widest">Return Home</button>
          </div>
        )}
      </main>

      {/* Persistent Shortcut for Agent Tools */}
      <div className="fixed bottom-10 right-10 z-[50] group">
        <button 
          onClick={() => {
            const agentPanel = document.getElementById('agent-tools-modal');
            if (agentPanel) agentPanel.classList.toggle('hidden');
          }}
          className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-lg-red transition-all duration-500 hover:scale-110 active:scale-90"
        >
          <Briefcase size={24} />
        </button>
        <div className="absolute bottom-full right-0 mb-4 bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Agent Tools
        </div>
      </div>

      {/* Agent Tools Modal / Overlay */}
      <div id="agent-tools-modal" className="fixed inset-0 z-[2000] bg-white hidden overflow-y-auto">
         <div className="absolute top-10 right-10 z-[10]">
            <button 
              onClick={() => document.getElementById('agent-tools-modal')?.classList.add('hidden')}
              className="p-4 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
         </div>
         <AgentTools />
      </div>
    </div>
  );
};

// Fixed error on index.tsx line 4 by adding default export
export default App;
