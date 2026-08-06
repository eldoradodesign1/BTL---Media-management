import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CampaignEvent, EventStatus } from '../../types';
import {
  Calendar,
  Plus,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  Trash2,
  Edit,
  Tv,
  ChevronRight
} from 'lucide-react';

interface EventsViewProps {
  onOpenAddModal: () => void;
  onSelectEventForDiffusions?: (eventId: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onOpenAddModal, onSelectEventForDiffusions }) => {
  const { events, deleteEvent, globalSearchQuery, setActiveTab } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredEvents = events.filter((e) => {
    if (globalSearchQuery.trim()) {
      const q = globalSearchQuery.toLowerCase();
      const matchName = e.name.toLowerCase().includes(q);
      const matchClient = e.clientName?.toLowerCase().includes(q);
      const matchRegion = e.regionName?.toLowerCase().includes(q);
      if (!matchName && !matchClient && !matchRegion) return false;
    }

    if (statusFilter !== 'all' && e.status !== statusFilter) return false;

    return true;
  });

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'Terminé':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'En cours':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Planifié':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Annulé':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            <Calendar className="w-4 h-4" />
            <span>Table Mère Events</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Événements de Campagne Média</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Regroupement des activités médias par annonceur, zone géographique et calendrier d'exécution.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un Événement</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/40 border border-white/10 w-fit text-xs">
        {['all', 'Planifié', 'En cours', 'Terminé'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
              statusFilter === st
                ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-inner'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st === 'all' ? 'Tous les Événements' : st}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="p-5 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col justify-between group hover:border-cyan-500/50 transition-all duration-300"
          >
            <div>
              {/* Event Top Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono font-semibold text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  {evt.eventDate}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(evt.status)}`}>
                  {evt.status}
                </span>
              </div>

              {/* Event Name */}
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                {evt.name}
              </h3>

              {/* Client & Region */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-white">{evt.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{evt.regionName}</span>
                </div>
              </div>

              {evt.notes && (
                <p className="mt-3 text-[11px] text-slate-400 line-clamp-2 italic bg-white/5 p-2 rounded-xl border border-white/5">
                  "{evt.notes}"
                </p>
              )}
            </div>

            {/* Event Budget Totals */}
            <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-slate-400">Total</div>
                  <div className="font-bold text-white text-xs mt-0.5">${(evt.totalAmount || 0).toLocaleString('fr-FR')}</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-emerald-400">Payé</div>
                  <div className="font-bold text-emerald-300 text-xs mt-0.5">${(evt.totalPaid || 0).toLocaleString('fr-FR')}</div>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="text-amber-400">Reste</div>
                  <div className="font-bold text-amber-300 text-xs mt-0.5">${(evt.totalPending || 0).toLocaleString('fr-FR')}</div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setActiveTab('diffusions')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>{evt.mediaCount || 0} diffusions</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => deleteEvent(evt.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                  title="Supprimer cet événement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400 text-sm bg-slate-900/40 rounded-3xl border border-white/10">
            Aucun événement de campagne trouvé.
          </div>
        )}
      </div>
    </div>
  );
};
