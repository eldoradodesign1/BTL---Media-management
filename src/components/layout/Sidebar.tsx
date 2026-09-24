import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  LayoutDashboard,
  Radio,
  Settings,
  Tv,
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, events, mediaByEvents, mediaPayments, currentUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'super-admin';

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, badge: null },
    { id: 'events', label: 'Campagnes', icon: Calendar, badge: events.length },
    { id: 'diffusions', label: 'Diffusions', icon: Tv, badge: mediaByEvents.length },
    { id: 'payments', label: 'Paiements', icon: CreditCard, badge: mediaPayments.length },
    { id: 'medias', label: 'Médias', icon: Radio, badge: null },
    { id: 'clients', label: 'Clients & régions', icon: Building2, badge: null },
    { id: 'pricing', label: 'Tarifs', icon: DollarSign, badge: null },
    { id: 'audit', label: 'Audit', icon: FileSpreadsheet, badge: null },
    { id: 'settings', label: isSuperAdmin ? 'Administration' : 'Paramètres', icon: Settings, badge: null },
  ];

  return (
    <aside className="btl-sidebar w-64 shrink-0 p-4 flex flex-col text-slate-100 min-h-[calc(100vh-100px)]">
      <div className="pb-4 mb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="btl-brand-mark w-10 h-10 rounded-[14px] flex items-center justify-center text-slate-950 ring-1 ring-white/15">
            <Zap className="w-[18px] h-[18px] fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-white text-[15px] tracking-[-0.02em] leading-none">BTL Media</h1>
            <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Pilotage des campagnes</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 overflow-y-auto flex-1 pr-1" aria-label="Navigation principale">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Espace de travail</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left border border-transparent ${isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-100'}`}
            >
              <span className="flex items-center gap-3"><Icon className={`w-[17px] h-[17px] ${isActive ? 'text-[var(--btl-lilac)]' : 'text-slate-500'}`} /><span className="text-xs leading-tight">{item.label}</span></span>
              {item.badge !== null && <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${isActive ? 'bg-white/10 text-white border-white/15' : 'bg-white/5 text-slate-500 border-white/10'}`}>{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-3 px-3 pt-3 border-t border-white/10 text-[10px] text-slate-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--btl-mint)]" aria-hidden="true" />
        <span>Calculs synchronisés</span>
      </div>
    </aside>
  );
};
