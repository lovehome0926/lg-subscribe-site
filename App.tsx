
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Admin from './pages/Admin';
import { AppView, Product, AppConfig } from './types';
import { INITIAL_PRODUCTS, INITIAL_CONFIG } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.LANDING);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);

  // Persistence
  useEffect(() => {
    const savedProducts = localStorage.getItem('lg_products');
    const savedConfig = localStorage.getItem('lg_config');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedTheme === 'dark') setIsDarkMode(true);
  }, []);

  const handleUpdateProducts = (newP: Product[]) => {
    setProducts(newP);
    localStorage.setItem('lg_products', JSON.stringify(newP));
  };

  const handleUpdateConfig = (newC: AppConfig) => {
    setConfig(newC);
    localStorage.setItem('lg_config', JSON.stringify(newC));
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const renderContent = () => {
    switch (activeView) {
      case AppView.LANDING:
        return <Landing config={config} onNavigate={setActiveView} />;
      case AppView.DASHBOARD:
        return <Admin products={products} config={config} onUpdateProducts={handleUpdateProducts} onUpdateConfig={handleUpdateConfig} />;
      case AppView.CATALOG:
        return <Catalog products={products} config={config} />;
      default:
        return <Landing config={config} onNavigate={setActiveView} />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onNavigate={setActiveView} 
      isDarkMode={isDarkMode} 
      onToggleDarkMode={toggleDarkMode}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
