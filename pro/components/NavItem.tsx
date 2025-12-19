
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TabId } from '../types';

interface NavItemProps {
  id: TabId;
  icon: LucideIcon;
  label: string;
  activeTab: TabId;
  onClick: (id: TabId) => void;
}

export const NavItem: React.FC<NavItemProps> = ({ id, icon: Icon, label, activeTab, onClick }) => (
  <button 
    onClick={() => onClick(id)}
    className={`flex flex-col items-center justify-center flex-1 py-2 transition-all active:scale-95 ${activeTab === id ? 'text-[#A50034]' : 'text-gray-400'}`}
  >
    <Icon size={22} className={activeTab === id ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
    <span className="text-[10px] mt-1 font-bold tracking-tight">{label}</span>
    {activeTab === id && (
      <div className="w-1 h-1 bg-[#A50034] rounded-full mt-1 animate-in fade-in zoom-in duration-300"></div>
    )}
  </button>
);
