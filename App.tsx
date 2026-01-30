
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
      // 强制在 2.5 秒后解锁，防止任何异步逻辑卡死导致页面进不去
      const forceReady = setTimeout(() => setIsReady(true), 2500);

      try {
        const savedSettings = localStorage.getItem('lg_site_settings');
        if (savedSettings) setSiteSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));

        setBrandingLogo(localStorage.getItem('lg_branding_logo'));
        setBrandingHero(localStorage.getItem('lg_branding_hero'));

        const savedCats = localStorage.getItem('lg_categories');
        if (savedCats) setCategories(JSON.parse(savedCats));

        const dbProducts = await getProductsDB();
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        } else {
          setProducts(INITIAL_PRODUCTS);
          await saveProductsDB(INITIAL_PRODUCTS);
        }

        const params = new URLSearchParams(window.location.search);
        const agentWa = params.get('wa') || params.get('agent_wa');
        const agentName = params.get('name') || params.get('agent_name');

        if (agentWa) {
          const newAgent: Agent = { id: Date.now().toString(), name: agentName || 'Official Partner', whatsapp: agentWa };
          setActiveAgent(newAgent);
          localStorage.setItem('lg_active_agent', JSON.stringify(newAgent));
        } else {
          const stored = localStorage.getItem('lg_active_agent');
          if (stored) setActiveAgent(JSON.parse(stored));
        }

        const handleHash = () => {
          const h = window.location.hash.replace('#', '');
          if (h === 'admin') setCurrentRoute(AppRoute.ADMIN);
          else setCurrentRoute(AppRoute.HOME);
        };
        window.addEventListener('hashchange', handleHash);
        handleHash();

      } catch (e) { 
        console.error("Initialization error:", e); 
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
    if(confirm("确定要重置为 master 预设数据吗？")) {
      setProducts(INITIAL_PRODUCTS);
      await saveProductsDB(INITIAL_PRODUCTS);
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
              setCategories={(c) => { setCategories(c); localStorage.setItem('lg_categories', JSON.stringify(c)); }}
              language={language} 
              brandingLogo={brandingLogo}
              updateBrandingLogo={(l) => { setBrandingLogo(l); if(l) localStorage.setItem('lg_branding_logo', l); }}
              brandingHero={brandingHero}
              updateBrandingHero={(h) => { setBrandingHero(h); if(h) localStorage.setItem('lg_branding_hero', h); }}
              siteSettings={siteSettings}
              updateSiteSettings={(s) => { setSiteSettings(s); localStorage.setItem('lg_site_settings', JSON.stringify(s)); }}
              onReset={resetToMaster}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-10 fade-in text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-8 shadow-inner">🔐</div>
              <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-gray-400">Restricted Access</h2>
              <button onClick={() => { if(prompt("Enter PIN:") === "8888") setIsAdminAuth(true); }} className="bg-lg-red text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-105 transition active:scale-95">Verify Identity</button>
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
