
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
  
  // 安全读取 localStorage
  const safeGetItem = (key: string): string | null => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  };
  const safeSetItem = (key: string, value: string) => {
    try { localStorage.setItem(key, value); } catch (e) {}
  };
  const safeRemoveItem = (key: string) => {
    try { localStorage.removeItem(key); } catch (e) {}
  };

  const [brandingLogo, setBrandingLogo] = useState<string | null>(() => safeGetItem('lg_branding_logo'));
  const [brandingHero, setBrandingHero] = useState<string | null>(() => safeGetItem('lg_branding_hero'));
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = safeGetItem('lg_site_settings');
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
    safeSetItem('lg_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    if (brandingLogo) safeSetItem('lg_branding_logo', brandingLogo);
    else safeRemoveItem('lg_branding_logo');
  }, [brandingLogo]);

  useEffect(() => {
    if (brandingHero) safeSetItem('lg_branding_hero', brandingHero);
    else safeRemoveItem('lg_branding_hero');
  }, [brandingHero]);

  useEffect(() => {
    const init = async () => {
      // 容错：3.5秒后强制进入页面，防止任何挂起的 Promise 导致黑屏
      const forceReady = setTimeout(() => {
        setIsReady(true);
      }, 3500);

      try {
        // 尝试从本地 IndexedDB 获取数据
        const dbProducts = await getProductsDB().catch(() => []);
        setProducts(dbProducts.length ? dbProducts : INITIAL_PRODUCTS);

        // 处理代理链接参数
        const params = new URLSearchParams(window.location.search);
        const wa = params.get('wa');
        const name = params.get('name');
        
        if (wa) {
          const newAgent: Agent = { id: Date.now().toString(), name: name || 'Official Partner', whatsapp: wa };
          setActiveAgent(newAgent);
          safeSetItem('lg_active_agent', JSON.stringify(newAgent));
        } else {
          const stored = safeGetItem('lg_active_agent');
          if (stored) setActiveAgent(JSON.parse(stored));
        }

        // 简单的哈希路由
        const handleHash = () => {
          const h = window.location.hash.replace('#', '').split('?')[0];
          if (h === 'admin') setCurrentRoute(AppRoute.ADMIN);
          else if (h === 'agent-tools') setCurrentRoute(AppRoute.HOME); // 保持在首页，由 window.location.hash.includes 逻辑控制展示
          else setCurrentRoute(AppRoute.HOME);
        };
        window.addEventListener('hashchange', handleHash);
        handleHash();
      } catch (err) {
        console.error("Critical Init Error:", err);
        setProducts(INITIAL_PRODUCTS); // 最后的保命符
      } finally {
        clearTimeout(forceReady);
        setIsReady(true);
      }
    };
    init();
  }, []);

  // 这里的 useEffect 负责移除 index.html 里的原始 Loader
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
      safeRemoveItem('lg_branding_logo');
      safeRemoveItem('lg_branding_hero');
      safeRemoveItem('lg_site_settings');
      location.reload();
    }
  };

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
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Synchronizing Data...</p>
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
