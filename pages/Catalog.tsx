
import React, { useState } from 'react';
import { Product, AppConfig } from '../types';
import { calculatePromoPrice, generateWhatsappLink } from '../services/utils';

interface CatalogProps {
  products: Product[];
  config: AppConfig;
}

const Catalog: React.FC<CatalogProps> = ({ products, config }) => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
            LG <span className="text-primary">Subscribe</span> Catalog
          </h2>
          <p className="text-slate-400 font-light mt-1">Life's Good with flexible plans starting today.</p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(c => (
            <button 
              key={c}
              onClick={() => setFilter(c)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-xs font-bold transition-all ${filter === c ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white dark:bg-slate-800 text-slate-400'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {filteredProducts.map(product => {
          const basePrice = product.plans[0]?.monthlyPrice || 0;
          const promoPrice = calculatePromoPrice(basePrice, product.promo);
          const hasPromo = product.promo && product.promo.type !== 'none';

          return (
            <div key={product.id} className="group relative bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className="aspect-square rounded-3xl overflow-hidden mb-6 bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                {product.isNew && <span className="absolute top-8 left-8 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase italic tracking-widest">New</span>}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">{product.category}</p>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight min-h-[3rem] line-clamp-2">{product.name}</h4>
                  <p className="text-xs text-slate-400 font-light line-clamp-2 mt-2">{product.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-700">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Monthly Subscription</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white italic">
                          RM{promoPrice}
                        </span>
                        {hasPromo && (
                          <span className="text-sm text-slate-400 line-through">RM{basePrice}</span>
                        )}
                        <span className="text-xs text-slate-400">/mo</span>
                      </div>
                      {hasPromo && product.promo?.months && (
                        <p className="text-[10px] text-green-500 font-bold uppercase mt-1">
                          *First {product.promo.months} months
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                    <button 
                      onClick={() => window.open(generateWhatsappLink(config.contactWhatsapp, product), '_blank')}
                      className="bg-green-500 text-white rounded-2xl py-3 flex items-center justify-center gap-2 hover:brightness-110 transition-all font-bold text-sm"
                    >
                      <span className="material-symbols-outlined text-sm">chat</span> WhatsApp
                    </button>
                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl py-3 flex items-center justify-center gap-2 hover:brightness-110 transition-all font-bold text-sm">
                      Details
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Catalog;
