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
    <aside className="w-64 shrink-0 bg-slate-950/72 backdrop-blur-2xl border border-white/12 rounded-2xl p-4 flex flex-col text-slate-100 shadow-2xl min-h-[calc(100vh-100px)]">
      <div className="pb-4 mb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20"><Zap className="w-5 h-5 fill-current" /></div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none">BTL Media</h1>
            <p className="text-[11px] text-slate-300 mt-1 font-medium">Pilotage des campagnes</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 overflow-y-auto flex-1 pr-1" aria-label="Navigation principale">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">Espace de travail</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-150 group text-left ${isActive ? 'bg-blue-500/22 border border-blue-400/40 text-white shadow-lg shadow-blue-500/10 font-semibold' : 'hover:bg-white/8 text-slate-200 hover:text-white border border-transparent'}`}
            >
              <span className="flex items-center gap-3"><Icon className={`w-4 h-4 ${isActive ? 'text-sky-300' : 'text-slate-400 group-hover:text-sky-300'}`} /><span className="text-xs leading-tight">{item.label}</span></span>
              {item.badge !== null && <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border ${isActive ? 'bg-blue-500 text-white border-blue-300' : 'bg-white/10 text-slate-100 border-white/15'}`}>{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-3 px-3 pt-3 border-t border-white/10 text-[10px] text-slate-300 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
        <span>Calculs synchronisés</span>
      </div>
    </aside>
  );
};
