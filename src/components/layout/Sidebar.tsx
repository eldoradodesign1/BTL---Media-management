import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Tv,
  CreditCard,
  Radio,
  Building2,
  DollarSign,
  FileSpreadsheet,
  Settings,
  Sparkles,
  Zap,
  TrendingUp,
  Layers
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, events, mediaByEvents, mediaPayments } = useApp();

  const totalEventsCount = events.length;
  const totalDiffusionsCount = mediaByEvents.length;
  const totalPaymentsCount = mediaPayments.length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de Bord',
      icon: LayoutDashboard,
      badge: null,
      desc: 'KPIs, Analytics ECharts & Sunburst',
    },
    {
      id: 'events',
      label: 'Événements Média',
      icon: Calendar,
      badge: totalEventsCount,
      desc: 'Campagnes & événements médias',
    },
    {
      id: 'diffusions',
      label: 'Diffusions & Charges',
      icon: Tv,
      badge: totalDiffusionsCount,
      desc: 'Media_by_events avec calcul auto',
    },
    {
      id: 'payments',
      label: 'Paiements Médias',
      icon: CreditCard,
      badge: totalPaymentsCount,
      desc: 'Acomptes, soldes & points focaux',
    },
    {
      id: 'medias',
      label: 'Médias & Points Focaux',
      icon: Radio,
      badge: null,
      desc: 'Chaînes TV, Radios, Presse & Contacts',
    },
    {
      id: 'clients',
      label: 'Clients & Régions',
      icon: Building2,
      badge: null,
      desc: 'Répertoire annonceurs & zones',
    },
    {
      id: 'pricing',
      label: 'Grille Tarifaire',
      icon: DollarSign,
      badge: null,
      desc: 'Matrice de tarifs par Média x Client',
    },
    {
      id: 'audit',
      label: 'Journal d\'Audit',
      icon: FileSpreadsheet,
      badge: null,
      desc: 'Historique des actions & traçabilité',
    },
    {
      id: 'settings',
      label: 'Paramètres & BDD SQL',
      icon: Settings,
      badge: null,
      desc: 'Supabase DDL, thèmes & colonnes',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between text-slate-200 select-none shadow-2xl min-h-[calc(100vh-100px)]">
      {/* Brand Header */}
      <div className="pb-4 mb-2 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
              <span>MEDIA</span>
              <span className="text-blue-400 font-mono text-xs px-1.5 py-0.5 bg-blue-500/20 rounded border border-blue-500/30">SAAS</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Gestion des Campagnes Média</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="space-y-1 overflow-y-auto flex-1 pr-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400/90">
          Espaces de Travail
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-left ${
                isActive
                  ? 'bg-blue-500/20 border border-blue-500/30 text-blue-300 shadow-lg shadow-blue-500/10 font-semibold'
                  : 'hover:bg-white/5 text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-blue-300' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <div className="text-xs">
                  <div className="leading-tight">{item.label}</div>
                </div>
              </div>

              {item.badge !== null && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full border transition-all ${
                    isActive
                      ? 'bg-blue-500 text-white border-blue-400 shadow-sm'
                      : 'bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status Card */}
      <div className="p-3 border-t border-white/10">
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
            <span className="flex items-center gap-1.5 text-[11px]">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Calculs Auto Actifs
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Moteur de calcul de tarif média & montants restants synchronisé en temps réel.
          </p>
        </div>
      </div>
    </aside>
  );
};
