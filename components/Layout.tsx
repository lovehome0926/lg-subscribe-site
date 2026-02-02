
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, isDarkMode, onToggleDarkMode }) => {
  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
        
        {/* Sidebar for Dashboard and Catalog */}
        {(activeView === AppView.DASHBOARD || activeView === AppView.CATALOG) && (
          <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="size-10 bg-primary rounded-full flex items-center justify-center text-white">
                  <span className="material-symbols-outlined">home_max</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold leading-none">LG <span className="font-light">Subscribe</span></h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">Partner Portal</p>
                </div>
              </div>

              <nav className="space-y-1">
                <button 
                  onClick={() => onNavigate(AppView.DASHBOARD)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === AppView.DASHBOARD ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <span className="material-symbols-outlined">dashboard</span>
                  <span className="text-sm">Dashboard</span>
                </button>
                <button 
                  onClick={() => onNavigate(AppView.CATALOG)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === AppView.CATALOG ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <span className="material-symbols-outlined">shopping_bag</span>
                  <span className="text-sm">Catalog</span>
                </button>
              </nav>
            </div>

            <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => onNavigate(AppView.LANDING)}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="text-sm font-medium">Log Out</span>
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 md:px-12 flex items-center justify-between z-10">
            {activeView === AppView.LANDING ? (
              <div className="flex items-center gap-2">
                <div className="size-8 text-primary">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/></svg>
                </div>
                <h1 className="text-xl font-bold tracking-tight">LG <span className="font-light">Subscribe</span></h1>
              </div>
            ) : (
              <div className="md:hidden">
                 <h1 className="text-lg font-bold">Portal</h1>
              </div>
            )}

            <div className="flex items-center gap-6">
              <nav className={`${activeView === AppView.LANDING ? 'flex' : 'hidden md:flex'} items-center gap-8`}>
                <button onClick={() => onNavigate(AppView.LANDING)} className="text-sm font-semibold hover:text-primary">Home</button>
                <button onClick={() => onNavigate(AppView.CATALOG)} className="text-sm font-semibold hover:text-primary">Products</button>
                {activeView === AppView.LANDING && (
                  <button onClick={() => onNavigate(AppView.DASHBOARD)} className="bg-primary text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:brightness-110">Partner Login</button>
                )}
              </nav>

              <button 
                onClick={onToggleDarkMode}
                className="size-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span className="material-symbols-outlined">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
              </button>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 overflow-y-auto scroll-smooth">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
