import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  LayoutDashboard,
  Calendar,
  Tv,
  CreditCard,
  Radio,
  Building2,
  DollarSign,
  FileSpreadsheet,
  Settings,
  PlusCircle,
  Sun,
  Moon,
  Sparkles,
  Save,
  Download
} from 'lucide-react';

interface CommandPaletteProps {
  onOpenExportModal?: () => void;
  onOpenAddEventModal?: () => void;
  onOpenAddDiffusionModal?: () => void;
  onOpenAddPaymentModal?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onOpenExportModal,
  onOpenAddEventModal,
  onOpenAddDiffusionModal,
  onOpenAddPaymentModal,
}) => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveTab,
    setTheme,
    triggerManualSave,
    events,
    medias,
  } = useApp();

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setSearch('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setIsCommandPaletteOpen(false);
  };

  const commandGroups = [
    {
      title: 'Navigation Rapide',
      items: [
        { id: 'nav-dashboard', icon: LayoutDashboard, label: 'Tableau de bord (Dashboard)', action: () => navigateTo('dashboard') },
        { id: 'nav-events', icon: Calendar, label: 'Événements Média (Campaign Events)', action: () => navigateTo('events') },
        { id: 'nav-diffusions', icon: Tv, label: 'Diffusions & Charges (Media_by_events)', action: () => navigateTo('diffusions') },
        { id: 'nav-payments', icon: CreditCard, label: 'Paiements Médias (Media Payments)', action: () => navigateTo('payments') },
        { id: 'nav-medias', icon: Radio, label: 'Répertoire Médias & Points Focaux', action: () => navigateTo('medias') },
        { id: 'nav-clients', icon: Building2, label: 'Clients & Régions', action: () => navigateTo('clients') },
        { id: 'nav-pricing', icon: DollarSign, label: 'Grille Tarifaire (Pricing Matrix)', action: () => navigateTo('pricing') },
        { id: 'nav-audit', icon: FileSpreadsheet, label: 'Journal d\'audit & Historique', action: () => navigateTo('audit') },
        { id: 'nav-settings', icon: Settings, label: 'Paramètres & Schéma SQL Supabase', action: () => navigateTo('settings') },
      ],
    },
    {
      title: 'Actions Rapides',
      items: [
        { id: 'act-save', icon: Save, label: 'Sauvegarder les modifications (Ctrl+S)', action: () => { triggerManualSave(); setIsCommandPaletteOpen(false); } },
        { id: 'act-export', icon: Download, label: 'Exporter Rapport Excel / PDF / CSV', action: () => { onOpenExportModal?.(); setIsCommandPaletteOpen(false); } },
        { id: 'act-new-evt', icon: PlusCircle, label: 'Nouveau Événement de Campagne', action: () => { onOpenAddEventModal?.(); setIsCommandPaletteOpen(false); } },
        { id: 'act-new-diff', icon: PlusCircle, label: 'Nouvelle Diffusion Média', action: () => { onOpenAddDiffusionModal?.(); setIsCommandPaletteOpen(false); } },
        { id: 'act-new-pay', icon: PlusCircle, label: 'Enregistrer un Paiement Média', action: () => { onOpenAddPaymentModal?.(); setIsCommandPaletteOpen(false); } },
      ],
    },
    {
      title: 'Thèmes & Design',
      items: [
        { id: 'theme-dark', icon: Moon, label: 'Activer Thème Dark (Bleu Nuit + Fumée Bleue)', action: () => { setTheme('dark'); setIsCommandPaletteOpen(false); } },
        { id: 'theme-light', icon: Sun, label: 'Activer Thème Light (Blanc Cassé + Papier Pastel)', action: () => { setTheme('light'); setIsCommandPaletteOpen(false); } },
        { id: 'theme-classic', icon: Sparkles, label: 'Activer Thème Classic (Microsoft Fluent Geometric)', action: () => { setTheme('classic'); setIsCommandPaletteOpen(false); } },
      ],
    },
  ];

  // Filter items
  const filteredGroups = commandGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  // Quick entity search results
  const matchedEvents = events.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())).slice(0, 3);
  const matchedMedias = medias.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-white/5">
          <Search className="w-5 h-5 text-cyan-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Rechercher une commande, un événement, un média, un écran... (Ctrl+K)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-base text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="px-2 py-1 text-xs font-mono text-slate-400 bg-white/10 hover:bg-white/20 rounded transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Command List Body */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {filteredGroups.map((group, idx) => (
            <div key={idx}>
              <div className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider px-3 mb-1.5">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center px-3 py-2.5 rounded-xl text-sm hover:bg-cyan-500/20 hover:text-cyan-200 transition-all text-left text-slate-200 group"
                    >
                      <Icon className="w-4 h-4 mr-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quick Matches */}
          {search.trim().length > 0 && (
            <>
              {matchedEvents.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider px-3 mb-1.5">
                    Événements Correspondants
                  </div>
                  {matchedEvents.map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => {
                        setActiveTab('events');
                        setIsCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm hover:bg-emerald-500/20 text-slate-200 text-left"
                    >
                      <span className="font-medium">{evt.name}</span>
                      <span className="text-xs text-slate-400">{evt.clientName}</span>
                    </button>
                  ))}
                </div>
              )}

              {matchedMedias.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider px-3 mb-1.5">
                    Médias Correspondants
                  </div>
                  {matchedMedias.map((med) => (
                    <button
                      key={med.id}
                      onClick={() => {
                        setActiveTab('medias');
                        setIsCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm hover:bg-purple-500/20 text-slate-200 text-left"
                    >
                      <span className="font-medium">{med.name}</span>
                      <span className="text-xs text-slate-400">{med.location}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {filteredGroups.length === 0 && search.trim() !== '' && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Aucune commande ou résultat trouvé pour "{search}"
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Ctrl+K</kbd> Ouvrir</span>
            <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Ctrl+S</kbd> Sauvegarder</span>
            <span><kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Ctrl+F</kbd> Rechercher</span>
          </div>
          <span className="text-cyan-400/80 font-mono">Media Campaign SaaS</span>
        </div>
      </div>
    </div>
  );
};
