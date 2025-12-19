
import React, { useState } from 'react';
import { ShieldCheck, User, Key, ArrowRight, AlertCircle, Hash, Globe } from 'lucide-react';
import { Role, LanguageCode, Translation, AuthUser, Agent } from '../types';

interface LoginProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  translations: Translation;
  onLogin: (user: AuthUser) => void;
  agents: Agent[];
}

export const Login: React.FC<LoginProps> = ({ language, setLanguage, translations, onLogin, agents }) => {
  const [role, setRole] = useState<Role>('LSM');
  const [idInput, setIdInput] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    const normalizedInput = idInput.trim();

    if (role === 'LSM') {
      if (normalizedInput === 'Joecindy@1123') {
        onLogin({ role: 'LSM' });
      } else {
        setError(true);
      }
    } else {
      // 代理 ID 不区分大小写匹配
      const agent = agents.find(a => a.id.toUpperCase() === normalizedInput.toUpperCase());
      if (agent) {
        onLogin({ role: 'LM', agentId: agent.id });
      } else {
        setError(true);
      }
    }
  };

  const resetForm = (newRole: Role) => {
    setRole(newRole);
    setIdInput('');
    setError(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-[#A50034] rounded-[2.2rem] flex items-center justify-center text-white font-black text-3xl mx-auto shadow-2xl mb-4 rotate-3 border-4 border-white">LG</div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{translations.loginTitle}</h1>
          
          <div className="flex justify-center pt-2">
             <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm">
                <Globe size={14} className="text-gray-400" />
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                  className="text-xs bg-transparent outline-none font-bold text-gray-600 appearance-none cursor-pointer"
                >
                  <option value="zh">简体中文</option>
                  <option value="en">English</option>
                  <option value="ms">Bahasa Melayu</option>
                </select>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-50/50 backdrop-blur-sm">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8">
            <button 
              onClick={() => resetForm('LSM')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black transition-all ${role === 'LSM' ? 'bg-white text-[#A50034] shadow-md scale-100' : 'text-gray-400 hover:text-gray-500 scale-95'}`}
            >
              <ShieldCheck size={16} /> {translations.loginLsm}
            </button>
            <button 
              onClick={() => resetForm('LM')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black transition-all ${role === 'LM' ? 'bg-white text-blue-600 shadow-md scale-100' : 'text-gray-400 hover:text-gray-500 scale-95'}`}
            >
              <User size={16} /> {translations.loginLm}
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] px-1">
                {role === 'LSM' ? translations.passwordLabel : translations.agentCodeLabel}
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#A50034] transition-colors">
                  {role === 'LSM' ? <Key size={18} /> : <Hash size={18} />}
                </div>
                <input 
                  type={role === 'LSM' ? "password" : "text"}
                  className={`w-full bg-gray-50/50 border-0 ring-1 ring-gray-200 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:ring-2 ${role === 'LSM' ? 'focus:ring-[#A50034]' : 'focus:ring-blue-600'} transition-all`}
                  value={idInput}
                  onChange={(e) => setIdInput(e.target.value)}
                  placeholder={role === 'LSM' ? "Admin Access Only" : "M000000 / F000000"}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl text-xs font-bold animate-pulse">
                <AlertCircle size={14} />
                {translations.loginError}
              </div>
            )}

            <button 
              type="submit"
              className={`w-full py-4 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all ${role === 'LSM' ? 'bg-[#A50034]' : 'bg-blue-600'}`}
            >
              {translations.loginBtn} <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <div className="text-center px-8">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Authorized Personnel Only<br/>
            © 2026 LG Subscribe Malaysia
          </p>
        </div>
      </div>
    </div>
  );
};
