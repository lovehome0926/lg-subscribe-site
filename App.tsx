
import React, { useState, useEffect, useCallback } from 'react';
import { Product, AppRoute, Agent, Language, SiteSettings } from './types';
import { INITIAL_PRODUCTS, CATEGORIES, INITIAL_SITE_SETTINGS } from './constants';
import { getProductsDB, saveProductsDB, getAgentsDB, saveAgentsDB } from './utils/db';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import { Lock } from 'lucide-react';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [authorizedAgents, setAuthorizedAgents] = useState<Agent[]>([]);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [language, setLanguage] = useState<Language>('cn');
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        // 加载产品
        const dbProducts = await getProductsDB();
        setProducts(dbProducts.length > 0 ? dbProducts : INITIAL_PRODUCTS);

        // 加载授权代理商列表
        const dbAgents = await getAgentsDB();
        setAuthorizedAgents(dbAgents);

        // 校验代理推广
        const params = new URLSearchParams(window.location.search);
        const wa = params.get('wa');
        
        if (wa) {
          // 只有在已授权列表中的代理才生效
          const agent = dbAgents.find(a => a.whatsapp === wa);
          if (agent) {
            setActiveAgent(agent);
            localStorage.setItem('cached_agent', JSON.stringify(agent));
          } else {
            console.warn("未授权的代理号码访问");
            localStorage.removeItem('cached_agent');
          }
        } else {
          const saved = localStorage.getItem('cached_agent');
          if (saved) {
            const agent = JSON.parse(saved);
            // 每次访问也检查下是否依然在授权列表
            if (dbAgents.some(a => a.whatsapp === agent.whatsapp)) {
              setActiveAgent(agent);
            } else {
              localStorage.removeItem('cached_agent');
            }
          }
        }

        const handleHash = () => {
          setCurrentRoute(window.location.hash.includes('admin') ? AppRoute.ADMIN : AppRoute.HOME);
        };
        window.addEventListener('hashchange', handleHash);
        handleHash();
        setIsReady(true);
      } catch (e) {
        setProducts(INITIAL_PRODUCTS);
        setIsReady(true);
      }
    };
    initApp();
  }, []);

  const updateAgents = async (next: Agent[]) => {
    setAuthorizedAgents(next);
    await saveAgentsDB(next);
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-lg-red selection:text-white">
      <Navbar 
        activeAgent={activeAgent} 
        isAdmin={isAdminAuth}
        language={language}
        setLanguage={setLanguage}
      />
      
      <main>
        {currentRoute === AppRoute.HOME ? (
          <>
            <Home products={products} activeAgent={activeAgent} language={language} siteSettings={siteSettings} />
            <Footer language={language} siteSettings={siteSettings} activeAgent={activeAgent} />
          </>
        ) : isAdminAuth ? (
          <AdminDashboard 
            products={products}
            setProducts={saveProductsDB as any}
            authorizedAgents={authorizedAgents}
            setAuthorizedAgents={updateAgents}
            categories={CATEGORIES}
            language={language}
            siteSettings={siteSettings}
            updateSiteSettings={setSiteSettings}
            onReset={() => { localStorage.clear(); location.reload(); }}
          />
        ) : (
          <div className="h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-lg-red shadow-2xl mb-8 animate-bounce"><Lock size={32}/></div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-8">管理权限验证</h2>
            <button 
              onClick={() => { if(prompt("请输入授权码 (默认: 8888)") === "8888") setIsAdminAuth(true); }}
              className="bg-black text-white px-12 py-5 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-lg-red transition-all"
            >
              解锁终端
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
