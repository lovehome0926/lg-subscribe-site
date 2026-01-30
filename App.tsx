
import React, { useState, useEffect } from 'react';
import { Product, AppRoute, Agent, Language, SiteSettings } from './types.js';
import { INITIAL_PRODUCTS, CATEGORIES as DEFAULT_CATEGORIES, DATA_VERSION } from './constants.js';
import { getProductsDB, saveProductsDB, initDB } from './utils/db.js';
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
  
  // 安全读写封装
  const safeStorage = {
    get: (key: string) => { try { return localStorage.getItem(key); } catch(e) { return null; } },
    set: (key: string, val: string) => { try { localStorage.setItem(key, val); } catch(e) {} },
    remove: (key: string) => { try { localStorage.removeItem(key); } catch(e) {} }
  };

  const [brandingLogo, setBrandingLogo] = useState<string | null>(() => safeStorage.get('lg_branding_logo'));
  const [brandingHero, setBrandingHero] = useState<string | null>(() => safeStorage.get('lg_branding_hero'));
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = safeStorage.get('lg_site_settings');
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
    safeStorage.set('lg_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    if (brandingLogo) safeStorage.set('lg_branding_logo', brandingLogo);
    else safeStorage.remove('lg_branding_logo');
  }, [brandingLogo]);

  useEffect(() => {
    if (brandingHero) safeStorage.set('lg_branding_hero', brandingHero);
    else safeStorage.remove('lg_branding_hero');
  }, [brandingHero]);

  // 全局异常捕获，防止白屏
  useEffect(() => {
    const handleError = (e: ErrorEvent) => setBootError(`Runtime Error: ${e.message}`);
    const handleRejection = (e: PromiseRejectionEvent) => setBootError(`Async Error: ${e.reason}`);
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      // 容错：3秒后强制加载，防止挂起
      const forceReady = setTimeout(() => setIsReady(true), 3000);

      try {
        // 1. 版本检查：如果代码里的 DATA_VERSION 变了，说明有 Master 更新
        const lastVersion = parseInt(safeStorage.get('lg_data_version') || '0');
        
        if (lastVersion < DATA_VERSION) {
          console.log("Master Data Update Detected. Syncing...");
          setProducts(INITIAL_PRODUCTS);
          await saveProductsDB(INITIAL_PRODUCTS);
          safeStorage.set('lg_data_version', DATA_VERSION.toString());
        } else {
          // 2. 正常从 IndexedDB 读取
          const dbProducts = await getProductsDB().catch(() => []);
          setProducts(dbProducts.length ? dbProducts : INITIAL_PRODUCTS);
        }

        // 3. 处理代理链接
        const params = new URLSearchParams(window.location.search);
        const wa = params.get('wa');
        const name = params.get('name');
        
        if (wa) {
          const newAgent: Agent = { id: Date.now().toString(), name: name || 'Official Partner', whatsapp: wa };
          setActiveAgent(newAgent);
          safeStorage.set('lg_active_agent', JSON.stringify(newAgent));
        } else {
          const stored = safeStorage.get('lg_active_agent');
          if (stored) setActiveAgent(JSON.parse(stored));
        }

        // 4. 路由处理
        const handleHash = () => {
          const h = window.location.hash.replace('#', '').split('?')[0];
          if (h === 'admin') setCurrentRoute(AppRoute.ADMIN);
          else setCurrentRoute(AppRoute.HOME);
        };
        window.addEventListener('hashchange', handleHash);
        handleHash();
      } catch (err) {
        console.error("Critical Init Error:", err);
        setProducts(INITIAL_PRODUCTS);
      } finally {
        clearTimeout(forceReady);
        setIsReady(true);
      }
    };
    init();
  }, []);

  // 动画移除加载层
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
    if(confirm("Confirm reset to Master Data? This will clear all custom settings and local branding.")) {
      setProducts(INITIAL_PRODUCTS);
      await saveProductsDB(INITIAL_PRODUCTS);
      safeStorage.remove('lg_branding_logo');
      safeStorage.remove('lg_branding_hero');
      safeStorage.remove('lg_site_settings');
      safeStorage.set('lg_data_version', DATA_VERSION.toString());
      location.reload();
    }
  };

  if (bootError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-10 text-center">
        <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 max-w-md">
          <h2 className="text-xl font-black mb-4 uppercase">Boot System Failure</h2>
          <p className="text-xs font-mono break-all opacity-70 mb-6">{bootError}</p>
          <button onClick={() => location.reload()} className="bg-red-600 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">Restart Engine</button>
        </div>
      </div>
    );
  }

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
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Synchronizing Master Data...</p>
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
              onReset={resetToMaster}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-10">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest mb-2 text-gray-950">Encrypted Area</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10">Verification required to access management console</p>
              <button onClick={() => { if(prompt("Access PIN:") === "8888") setIsAdminAuth(true); }} className="bg-lg-red text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 transition-all">Verify Credentials</button>
            </div>
          )
        ) : window.location.hash.includes('agent-tools') ? (
          isAgentAuth ? (
            <AgentTools />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-10">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest mb-2 text-gray-950">Partner Gate</h2>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-10">Enter referral system passcode</p>
              <button onClick={() => { if(prompt("Agent PIN:") === "8888") setIsAgentAuth(true); }} className="bg-black text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 transition-all">Verify PIN</button>
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
