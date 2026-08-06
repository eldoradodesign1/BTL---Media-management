import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, MapPin, Mail, Phone, User, Calendar } from 'lucide-react';

export const ClientsView: React.FC = () => {
  const { clients, regions, events, mediaByEvents } = useApp();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            <Building2 className="w-4 h-4" />
            <span>Répertoire Clients & Régions</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Annonceurs & Cartographie Média</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Aperçu des comptes clients (Vodacom, Aga Khan, Coca-Cola, Bracongoles) et zones d'intervention en RDC.
          </p>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div>
        <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          <span>Comptes Clients Principaux ({clients.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((cli) => {
            const clientEvents = events.filter((e) => e.clientId === cli.id);
            const totalBudget = mediaByEvents
              .filter((m) => m.clientId === cli.id)
              .reduce((s, m) => s + m.amount, 0);

            return (
              <div
                key={cli.id}
                className="p-5 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {cli.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Inscrit le {cli.createdAt}</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    {cli.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Contact: {cli.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{cli.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-slate-400 text-[11px]">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{cli.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Campagnes</span>
                    <span className="font-bold text-white">{clientEvents.length} événements</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Budget Engagé</span>
                    <span className="font-bold text-emerald-400">${totalBudget.toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regions Grid */}
      <div className="pt-4">
        <h2 className="text-sm font-bold text-emerald-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>Régions & Couverture Géographique ({regions.length})</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {regions.map((reg) => {
            const regEvents = events.filter((e) => e.regionId === reg.id);
            return (
              <div
                key={reg.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-white/15 backdrop-blur-xl hover:border-emerald-500/50 transition-all text-center"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-xs flex items-center justify-center mx-auto mb-2">
                  {reg.code}
                </div>
                <div className="font-bold text-xs text-white truncate">{reg.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">
                  {regEvents.length} événements
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
