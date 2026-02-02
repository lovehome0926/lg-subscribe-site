
import React from 'react';
import { AppConfig, AppView } from '../types';

interface LandingProps {
  config: AppConfig;
  onNavigate: (v: AppView) => void;
}

const Landing: React.FC<LandingProps> = ({ config, onNavigate }) => {
  return (
    <div className="flex flex-col">
      <section className="relative min-h-[80vh] flex items-center bg-white dark:bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/20 blur-[100px] rounded-full translate-x-1/2"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12 py-20 items-center relative z-10">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 bg-slate-900 dark:bg-primary text-white px-6 py-2 rounded-xl text-xs font-black italic tracking-[0.2em]">
               LG SUBSCRIBE™
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] tracking-tighter italic">
              A COMPLETE<br/>HOME, TODAY.
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-light max-w-lg leading-relaxed">
              Experience the premium life with flexible ownership. From OLED TVs to Water Purifiers, our subscription plans make Life's Good.
            </p>
            <div className="flex flex-wrap gap-4 pt-6">
              <button 
                onClick={() => onNavigate(AppView.CATALOG)}
                className="bg-primary text-white px-10 py-5 rounded-[2rem] font-black italic text-lg shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
              >
                BROWSE CATALOG
              </button>
              <button className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-slate-200 transition-all">
                LEARN MORE
              </button>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl group-hover:bg-primary/20 transition-all"></div>
            <img 
              src={config.heroImageUrl} 
              className="relative w-full rounded-[3rem] shadow-2xl rotate-2 group-hover:rotate-0 transition-all duration-700"
              alt="LG Home Appliances"
            />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-12 italic">Official Partnership Network</p>
            <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24 opacity-30 dark:opacity-50 grayscale">
                <div className="text-2xl font-black italic">LG ThinQ</div>
                <div className="text-2xl font-black italic">PureCare</div>
                <div className="text-2xl font-black italic">OLED evo</div>
                <div className="text-2xl font-black italic">DualCool</div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
