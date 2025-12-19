
import React from 'react';
import { Calendar, BookOpen, Sparkles, Users, User, LogOut, Globe } from 'lucide-react';
import { Translation, LanguageCode, Role, AuthUser } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  user: AuthUser;
  onLogout: () => void;
  translations: Translation;
}

const NavItem: React.FC<{
  id: string;
  icon: any;
  label: string;
  activeTab: string;
  onClick: (id: string) => void;
}> = ({ id, icon: Icon, label, activeTab, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`flex flex-col items-center justify-center flex-1 py-3 transition-all active:scale-90 ${activeTab === id ? 'text-[#A50034]' : 'text-gray-400'}`}
  >
    <Icon size={20} className={activeTab === id ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
    <span className="text-[10px] mt-1 font-bold">{label}</span>
    {activeTab === id && <div className="w-1 h-1 bg-[#A50034] rounded-full mt-1"></div>}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ 
  children, activeTab, setActiveTab, language, setLanguage, user, onLogout, translations 
}) => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans select-none overflow-x-hidden flex flex-col items-center">
      <header className="w-full max-w-md bg-white border-b sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#A50034] rounded-lg flex items-center justify-center text-white font-black text-xs shrink-0">LG</div>
          <span className="font-black tracking-tight text-[#A50034] text-xs truncate max-w-[80px]">{translations.title}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as LanguageCode)}
              className="appearance-none bg-gray-100 rounded-full px-6 py-1.5 text-[10px] font-black outline-none border-none text-gray-600 focus:ring-1 focus:ring-[#A50034]"
            >
              <option value="zh">中</option>
              <option value="en">EN</option>
              <option value="ms">BM</option>
            </select>
            <Globe size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          
          <div className={`text-[9px] px-2 py-1 rounded-full font-black text-white ${user.role === 'LSM' ? 'bg-[#A50034]' : 'bg-blue-600'} shrink-0`}>
            {user.role}
          </div>
          <button 
            onClick={onLogout}
            className="p-1.5 text-gray-400 hover:text-red-500 active:scale-90 transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="w-full max-w-md p-4 animate-in fade-in duration-300 flex-1">
        {children}
      </main>

      <footer className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center px-4 pb-6 pt-2 z-50 rounded-t-3xl shadow-2xl">
        <NavItem id="schedule" icon={Calendar} label={translations.schedule} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="ai" icon={Sparkles} label={translations.aiCoach} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="salesKit" icon={BookOpen} label={translations.salesKit} activeTab={activeTab} onClick={setActiveTab} />
        <NavItem id="agents" icon={user.role === 'LSM' ? Users : User} label={user.role === 'LSM' ? translations.agents : translations.myAvailability} activeTab={activeTab} onClick={setActiveTab} />
      </footer>
    </div>
  );
};
