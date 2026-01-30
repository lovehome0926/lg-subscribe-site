import React, { useState, useEffect, useMemo } from 'react';
import { Product, AppRoute, Agent, Language, SiteSettings, Multilingual } from './types';
import { INITIAL_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES, DATA_VERSION } from './constants';
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.officeEmail && Array.isArray(parsed.stores)) {
          return parsed;
        }
      }
    } catch(e) {
      console.warn("Detected corrupted site settings, using defaults.");
    }
    return {
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

  const healProduct = (p: any): Product => {
    if (!p || typeof p !== 'object') return INITIAL_PRODUCTS[0];
    const ensureMultilingual = (val: any): Multilingual => {
      if (val && typeof val === 'object') {
        return { 
          en: String(val.en || val.cn || val.ms || ''), 
          cn: String(val.cn || val.en || val.ms || ''), 
          ms: String(val.ms || val.en || val.cn || '') 
        };
      }
      return { en: String(val || ''), cn: String(val || ''), ms: String(val || '') };
    };

    return {
      ...p,
      id: String(p.id || `M-${Date.now()}`),
      category: String(p.category || 'General'),
      name: String(p.name || 'Unnamed Product'),
      subName: ensureMultilingual(p.subName),
      description: String(p.description || ''),
      image: String(p.image || 'https://placehold.co/600x600?text=No+Image'),
      promoPrice: Number(p.promoPrice || 0),
      normalPrice: Number(p.normalPrice || 0),
      promoText: String(p.promoText || ''),
      warranty: String(p.warranty || 'Standard Warranty'),
      features: Array.isArray(p.features) ? p.features.map(f => ensureMultilingual(f)) : [],
      painPoints: Array.isArray(p.painPoints) ? p.painPoints.map(pp => ensureMultilingual(pp)) : [],
      plans: Array.isArray(p.plans) ? p.plans.map((plan: any) => ({
        ...plan,
        termYears: plan.termYears === 'Outright' ? 'Outright' : Number(plan.termYears || 0),
        maintenanceType: plan.maintenanceType || 'Regular Visit',
        price: Number(plan.price || 0)
      })) : []
    } as Product;
  };

  useEffect(() => {
    if (isReady) {
      safeStorage.set('lg_site_settings', JSON.stringify(siteSettings));
      // Immediate loader removal attempt
      const loader = document.getElementById('initial-loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }
    }
  }, [siteSettings, isReady]);

  useEffect(() => {
    const init = async () => {
      // Shorter failsafe to get user in quickly
      const failsafe = setTimeout(() => {
        setIsReady(true);
      }, 3000);

      try {
        const lastVersionStr = safeStorage.get('lg_data_version');
        const lastVersion = lastVersionStr ? parseInt(lastVersionStr) : 0;
        
        let finalProducts: Product[] = [];
        if (lastVersion < DATA_VERSION) {
          finalProducts = INITIAL_PRODUCTS.map(healProduct);
          await saveProductsDB(finalProducts);
          safeStorage.set('lg_data_version', DATA_VERSION.toString());
        } else {
          const dbProducts = await getProductsDB();
          finalProducts = (dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS).map(healProduct);
        }
        setProducts(finalProducts);

        // Affiliate logic
        const params = new URLSearchParams(window.location.search);
        const wa = params.get('wa');
        const name = params.get('name');
        
        if (wa) {
          const cleanWa = wa.replace(/\D/g, '');
          const newAgent: Agent = { id: Date.now().toString(), name: name || 'Partner', whatsapp: cleanWa };
          setActiveAgent(newAgent);
          safeStorage.set('lg_active_agent', JSON.stringify(newAgent));
          window.history.replaceState({}, '', window.location.pathname + window.location.hash);
        } else {
          const stored = safeStorage.get('lg_active_agent');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed?.whatsapp) setActiveAgent(parsed);
            } catch(e) {}
          }
        }

        const handleHash = () => {
          const hash = window.location.hash.split('?')[0];
          if (hash === '#admin') setCurrentRoute(AppRoute.ADMIN);
          else setCurrentRoute(AppRoute.HOME);
        };
        window.addEventListener('hashchange', handleHash);
        handleHash();

      } catch (err) {
        console.error("Init failed:", err);
      } finally {
        clearTimeout(failsafe);
        setIsReady(true);
      }
    };
    init();
  }, []);

  const safeProducts = useMemo(() => Array.isArray(products) ? products : [], [products]);

  const mainContent = currentRoute === AppRoute.ADMIN ? (
    isAdminAuth ? (
      <AdminDashboard 
        products={safeProducts} 
        setProducts={async (next) => {
          const nextP = typeof next === 'function' ? next(safeProducts) : next;
          setProducts(nextP);
          await saveProductsDB(nextP);
        }} 
        categories={categories}
        setCategories={setCategories}
        language={language} 
        brandingLogo={brandingLogo}
        updateBrandingLogo={(logo) => { setBrandingLogo(logo); safeStorage.set('lg_branding_logo', logo || ''); }}
        brandingHero={brandingHero}
        updateBrandingHero={(hero) => { setBrandingHero(hero); safeStorage.set('lg_branding_hero', hero || ''); }}
        siteSettings={siteSettings}
        updateSiteSettings={setSiteSettings}
        onReset={() => {
           if(confirm("Factory reset?")) {
             localStorage.clear();
             location.reload();
           }
        }}
      />
    ) : (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <h2 className="text-xl font-black uppercase tracking-widest mb-10 text-gray-950">System Access</h2>
        <button onClick={() => { 
          const pin = prompt("Admin PIN (8888):");
          if(pin === "8888") setIsAdminAuth(true); 
        }} className="bg-lg-red text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl">Verify Credentials</button>
      </div>
    )
  ) : window.location.hash.includes('agent-tools') ? (
    <AgentTools />
  ) : (
    <Home products={safeProducts} categories={categories} activeAgent={activeAgent} language={language} brandingHero={brandingHero} siteSettings={siteSettings} />
  );

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar 
        currentRoute={currentRoute} 
        activeAgent={activeAgent} 
        isAdmin={isAdminAuth} 
        language={language}
        setLanguage={setLanguage}
        brandingLogo={brandingLogo}
      />
      <main className="flex-grow">
        <div className="animate-in fade-in duration-700">
          {mainContent}
        </div>
      </main>
      <Footer brandingLogo={brandingLogo} siteSettings={siteSettings} language={language} activeAgent={activeAgent} />
    </div>
  );
};

export default App;