import React, { useMemo, useState } from 'react';
import { Building2, Calendar, ChevronRight, Edit, MapPin, Plus, Trash2, Tv } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { CampaignEvent, EventStatus } from '../../types';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { EditEventModal } from '../modals/EditEventModal';

interface EventsViewProps {
  onOpenAddModal: () => void;
  onSelectEventForDiffusions?: (eventId: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({ onOpenAddModal }) => {
  const { events, deleteEvent, globalSearchQuery, setActiveTab, currentUser } = useApp();
  const { formatCurrency, formatDate, t } = useI18n();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingEvent, setEditingEvent] = useState<CampaignEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<CampaignEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isClient = currentUser?.role === 'client';

  const statusMeta: Record<EventStatus, { key: string; classes: string }> = {
    Planifié: { key: 'events.scheduled', classes: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    'En cours': { key: 'events.inProgress', classes: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    Terminé: { key: 'events.completed', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    Annulé: { key: 'events.cancelled', classes: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  };

  const filters = [
    { id: 'all', label: t('events.all') },
    { id: 'Planifié', label: t('events.scheduled') },
    { id: 'En cours', label: t('events.inProgress') },
    { id: 'Terminé', label: t('events.completed') },
  ];

  const filteredEvents = useMemo(() => events.filter((event) => {
    const query = globalSearchQuery.trim().toLowerCase();
    const matchesSearch = !query || [event.name, event.clientName, event.regionName].some((value) => value?.toLowerCase().includes(query));
    return matchesSearch && (statusFilter === 'all' || event.status === statusFilter);
  }), [events, globalSearchQuery, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1"><Calendar className="w-4 h-4" /><span>{t('events.eyebrow')}</span></div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">{t('events.title')}</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">{t('events.description')}</p>
        </div>
        <button type="button" onClick={onOpenAddModal} className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25 shrink-0"><Plus className="w-4 h-4" /><span>{t('events.create')}</span></button>
      </header>

      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/40 border border-white/10 w-fit max-w-full overflow-x-auto text-xs">
        {filters.map((filter) => <button type="button" key={filter.id} onClick={() => setStatusFilter(filter.id)} className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${statusFilter === filter.id ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 shadow-inner' : 'text-slate-400 hover:text-white'}`}>{filter.label}</button>)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const meta = statusMeta[event.status];
          return (
            <article key={event.id} className="p-5 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col justify-between group hover:border-cyan-500/50 transition-all duration-300">
              <div>
                <div className="flex items-center justify-between mb-3"><span className="text-[11px] font-mono font-semibold text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-cyan-400" />{formatDate(event.eventDate)}</span><span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${meta.classes}`}>{t(meta.key)}</span></div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">{event.name}</h3>
                <div className="mt-3 space-y-1.5 text-xs text-slate-300"><div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" /><span className="font-semibold text-white">{event.clientName}</span></div><div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /><span>{event.regionName}</span></div></div>
                {event.notes && <p className="mt-3 text-[11px] text-slate-400 line-clamp-2 italic bg-white/5 p-2 rounded-xl border border-white/5">“{event.notes}”</p>}
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono"><div className="p-2 rounded-xl bg-white/5 border border-white/5"><div className="text-slate-400">{t('events.total')}</div><div className="font-bold text-white text-xs mt-0.5">{formatCurrency(event.totalAmount || 0)}</div></div><div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20"><div className="text-emerald-400">{t('events.paid')}</div><div className="font-bold text-emerald-300 text-xs mt-0.5">{formatCurrency(event.totalPaid || 0)}</div></div><div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20"><div className="text-amber-400">{t('events.remaining')}</div><div className="font-bold text-amber-300 text-xs mt-0.5">{formatCurrency(event.totalPending || 0)}</div></div></div>
                <div className="flex items-center justify-between pt-2"><button type="button" onClick={() => setActiveTab('diffusions')} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"><Tv className="w-3.5 h-3.5" /><span>{event.mediaCount || 0} {t('events.diffusionCount')}</span><ChevronRight className="w-3.5 h-3.5" /></button>{!isClient && <div className="flex items-center gap-1"><button type="button" onClick={() => { setEditingEvent(event); setIsEditModalOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/20 transition-all" title={t('events.editHint')} aria-label={t('events.editHint')}><Edit className="w-4 h-4" /></button><button type="button" onClick={() => { setDeletingEvent(event); setIsDeleteModalOpen(true); }} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all" title={t('events.deleteHint')} aria-label={t('events.deleteHint')}><Trash2 className="w-4 h-4" /></button></div>}</div>
              </div>
            </article>
          );
        })}
        {filteredEvents.length === 0 && <div className="col-span-full py-16 text-center text-slate-400 text-sm bg-slate-900/40 rounded-3xl border border-white/10">{t('events.empty')}</div>}
      </div>

      <EditEventModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingEvent(null); }} event={editingEvent} />
      <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setDeletingEvent(null); }} onConfirm={() => { if (deletingEvent) deleteEvent(deletingEvent.id); }} title={t('events.deleteTitle')} message={t('events.deleteMessage').replace('{name}', deletingEvent?.name || '')} confirmText={t('events.deleteConfirm')} />
    </div>
  );
};
