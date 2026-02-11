
import React, { useState, useEffect } from 'react';
import { Product, AppRoute, Agent, Language, SiteSettings } from './types.ts';
import { INITIAL_PRODUCTS, CATEGORIES, INITIAL_SITE_SETTINGS } from './constants.ts';
import { getProductsDB, saveProductsDB, getAgentsDB, saveAgentsDB, getSettingsDB, saveSettingsDB } from './utils/db.ts';
import Navbar from './components/Navbar.tsx';
import Home from './components/Home.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import AgentTools from './components/AgentTools.tsx';
import Footer from './components/Footer.tsx';
import { Lock, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [authorizedAgents, setAuthorizedAgents] = useState<Agent[]>([]);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [language, setLanguage] = useState<Language>('cn');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const emergencyTimer = setTimeout(() => { if (!isReady) setIsReady(true); }, 4500);

    const initApp = async () => {
      try {
        const dbProducts = await getProductsDB().catch(() => null);
        setProducts(Array.isArray(dbProducts) && dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS);

        const dbAgents = await getAgentsDB().catch(() => null);
        setAuthorizedAgents(Array.isArray(dbAgents) ? dbAgents : []);

        const dbSettings = await getSettingsDB().catch(() => null);
        if (dbSettings && typeof dbSettings === 'object') {
          // 核心修复：加载时自动合并原有分类，确保不丢失
          const userCategories = Array.isArray(dbSettings.categories) ? dbSettings.categories : [];
          const mergedCategories = Array.from(new Set([...CATEGORIES, ...userCategories]));

          setSiteSettings({
            ...INITIAL_SITE_SETTINGS,
            ...dbSettings,
            categories: mergedCategories,
            benefits: Array.isArray(dbSettings.benefits) ? dbSettings.benefits : INITIAL_SITE_SETTINGS.benefits,
          });
        }

        const params = new URLSearchParams(window.location.search);
        const wa = params.get('wa');
        const name = params.get('name');
        if (wa) {
          const agentData = { whatsapp: wa.replace(/\D/g, ''), name: name || 'Certified Partner', id: 'ext' };
          setActiveAgent(agentData);
          localStorage.setItem('cached_agent', JSON.stringify(agentData));
        } else {
          const saved = localStorage.getItem('cached_agent');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed?.whatsapp) setActiveAgent(parsed);
            } catch (e) { localStorage.removeItem('cached_agent'); }
          }
        }

        const handleHash = () => {
          const hash = window.location.hash || '#home';
          if (hash.includes('admin')) setCurrentRoute(AppRoute.ADMIN);
          else if (hash.includes('agent-tools')) setCurrentRoute(AppRoute.AGENT_TOOLS);
          else setCurrentRoute(AppRoute.HOME);
        };
        window.addEventListener('hashchange', handleHash);
        handleHash();
        
        setIsReady(true);
        clearTimeout(emergencyTimer);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Initialization failed");
        setIsReady(true);
      }
    };

    initApp();
    return () => clearTimeout(emergencyTimer);
  }, []);

  const updateSiteSettings = async (next: SiteSettings) => {
    setSiteSettings(next);
    await saveSettingsDB(next);
  };

  if (error) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-10 text-center">
        <AlertCircle className="text-lg-red mb-6" size={64} />
        <h1 className="text-2xl font-black uppercase mb-4 tracking-tighter italic">System Exception</h1>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-black text-white px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-3"><RefreshCw size={14} /> Reset & Refresh</button>
      </div>
    );
  }

  if (!isReady) return <div className="h-screen w-full flex items-center justify-center bg-white"><Loader2 className="animate-spin text-lg-red" size={48} /></div>;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-lg-red selection:text-white">
      <Navbar activeAgent={activeAgent} isAdmin={isAdminAuth} language={language} setLanguage={setLanguage} siteSettings={siteSettings} />
      <main>
        {currentRoute === AppRoute.HOME ? (
          <>
            <Home products={products} activeAgent={activeAgent} language={language} siteSettings={siteSettings} />
            <Footer language={language} siteSettings={siteSettings} activeAgent={activeAgent} />
          </>
        ) : currentRoute === AppRoute.AGENT_TOOLS ? (
          <AgentTools siteSettings={siteSettings} language={language} />
        ) : isAdminAuth ? (
          <AdminDashboard 
            products={products} 
            setProducts={async (p) => { setProducts(p); await saveProductsDB(p); }} 
            authorizedAgents={authorizedAgents} 
            setAuthorizedAgents={async (a) => { setAuthorizedAgents(a); await saveAgentsDB(a); }} 
            categories={siteSettings.categories} 
            language={language} 
            siteSettings={siteSettings} 
            updateSiteSettings={updateSiteSettings} 
            onReset={() => { if(confirm("Wipe all data?")) { localStorage.clear(); location.reload(); } }} 
          />
        ) : (
          <div className="h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-lg-red shadow-2xl mb-8 animate-bounce"><Lock size={32}/></div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 italic text-center text-lg-dark">Authentication Required</h2>
            <button onClick={() => { if(prompt("Terminal PIN (Default: 8888)") === "8888") setIsAdminAuth(true); }} className="bg-black text-white px-16 py-6 rounded-full font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl hover:bg-lg-red transition-all">Unlock Terminal</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
