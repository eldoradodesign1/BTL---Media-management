import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaByEvent, ExpenseType } from '../../types';
import { NumberWheelInput } from '../common/NumberWheelInput';
import {
  Tv,
  Search,
  Plus,
  Trash2,
  FileCheck,
  FileX,
  ExternalLink,
  Edit2,
  DollarSign,
  AlertCircle,
  Phone,
  User,
  Filter,
  Check,
  X
} from 'lucide-react';

interface MediaEventsViewProps {
  onOpenAddModal: () => void;
}

export const MediaEventsView: React.FC<MediaEventsViewProps> = ({ onOpenAddModal }) => {
  const {
    mediaByEvents,
    updateMediaByEvent,
    deleteMediaByEvent,
    globalSearchQuery,
    events,
    medias,
    clients,
    pricingRates,
  } = useApp();

  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterExpenseType, setFilterExpenseType] = useState<string>('all');
  const [filterPodState, setFilterPodState] = useState<string>('all');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Filtered dataset
  const filteredList = useMemo(() => {
    return mediaByEvents.filter((item) => {
      // Global search
      if (globalSearchQuery.trim()) {
        const q = globalSearchQuery.toLowerCase();
        const matchName = item.eventName?.toLowerCase().includes(q);
        const matchMedia = item.mediaName?.toLowerCase().includes(q);
        const matchClient = item.clientName?.toLowerCase().includes(q);
        const matchFocal = item.focalPointName?.toLowerCase().includes(q);
        const matchPod = item.proofOfDiffusion?.toLowerCase().includes(q);
        if (!matchName && !matchMedia && !matchClient && !matchFocal && !matchPod) {
          return false;
        }
      }

      if (filterClient !== 'all' && item.clientId !== filterClient) return false;
      if (filterExpenseType !== 'all' && item.expenseType !== filterExpenseType) return false;
      if (filterPodState === 'provided' && (!item.proofOfDiffusion || item.proofOfDiffusion.trim() === '')) return false;
      if (filterPodState === 'missing' && item.proofOfDiffusion && item.proofOfDiffusion.trim() !== '') return false;

      return true;
    });
  }, [mediaByEvents, globalSearchQuery, filterClient, filterExpenseType, filterPodState]);

  // Quick Inline Toggle Proof of Diffusion
  const handleTogglePod = (row: MediaByEvent) => {
    if (row.proofOfDiffusion && row.proofOfDiffusion.trim() !== '') {
      // Clear POD -> Amount becomes 0 according to rule
      updateMediaByEvent({ ...row, proofOfDiffusion: '' });
    } else {
      // Set dummy POD -> Amount gets calculated
      const newPod = `POD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}.pdf`;
      updateMediaByEvent({ ...row, proofOfDiffusion: newPod });
    }
  };

  // Quick Expense Type Toggle
  const handleToggleExpenseType = (row: MediaByEvent) => {
    const nextType: ExpenseType = row.expenseType === 'Transport' ? 'Tarif Média' : 'Transport';
    updateMediaByEvent({ ...row, expenseType: nextType });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            <Tv className="w-4 h-4" />
            <span>Table Mère Media_by_events</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Diffusions & Charges Médias</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Calcul automatique du montant en fonction du type de dépense, du barème média-client et de la vérification de preuve de diffusion (POD).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Diffusion Média</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filtres:</span>
          </div>

          {/* Client Filter */}
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
          >
            <option value="all">Tous les Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Expense Type Filter */}
          <select
            value={filterExpenseType}
            onChange={(e) => setFilterExpenseType(e.target.value)}
            className="px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
          >
            <option value="all">Tous les Types de Dépense</option>
            <option value="Tarif Média">Tarif Média (Barème Client)</option>
            <option value="Transport">Transport Média</option>
          </select>

          {/* POD Filter */}
          <select
            value={filterPodState}
            onChange={(e) => setFilterPodState(e.target.value)}
            className="px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
          >
            <option value="all">Tous les états POD</option>
            <option value="provided">POD Validé (Montant &gt; 0)</option>
            <option value="missing">POD Manquant (Montant = $0)</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          <span>Affichage: </span>
          <span className="font-bold text-cyan-300">{filteredList.length}</span> / {mediaByEvents.length} diffusions
        </div>
      </div>

      {/* Main Interactive Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-cyan-300/90 select-none">
                <th className="py-3.5 px-4">Date / Événement</th>
                <th className="py-3.5 px-4">Média / Point Focal</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Preuve Diffusion (POD)</th>
                <th className="py-3.5 px-4">Type Dépense</th>
                <th className="py-3.5 px-4 text-right">Montant Calculé ($)</th>
                <th className="py-3.5 px-4 text-right">Payé ($)</th>
                <th className="py-3.5 px-4 text-right">Pending ($)</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredList.map((row) => {
                const isPodMissing = !row.proofOfDiffusion || row.proofOfDiffusion.trim() === '';

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-cyan-500/10 transition-colors group"
                  >
                    {/* Event & Date */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white group-hover:text-cyan-200 transition-colors">
                        {row.eventName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{row.eventDate}</div>
                    </td>

                    {/* Media & Focal Point */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{row.mediaName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <User className="w-2.5 h-2.5" />
                          {row.focalPointName || 'Non assigné'}
                        </span>
                        {row.phone && (
                          <span className="flex items-center gap-1 font-mono text-cyan-400">
                            <Phone className="w-2.5 h-2.5" />
                            {row.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Client */}
                    <td className="py-3 px-4 font-medium text-slate-300">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px]">
                        {row.clientName}
                      </span>
                    </td>

                    {/* Proof of Diffusion (POD) */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePod(row)}
                          title="Cliquer pour valider/annuler la preuve de diffusion (Impacte le montant = 0)"
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border flex items-center gap-1.5 transition-all ${
                            isPodMissing
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                          }`}
                        >
                          {isPodMissing ? (
                            <>
                              <FileX className="w-3.5 h-3.5 text-rose-400" />
                              <span>Non fourni ($0)</span>
                            </>
                          ) : (
                            <>
                              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="truncate max-w-[120px]">{row.proofOfDiffusion}</span>
                            </>
                          )}
                        </button>
                        {row.podLinks && row.podLinks.length > 0 && (
                          <a
                            href={row.podLinks[0]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-white/5 hover:bg-white/10 text-cyan-400"
                            title="Ouvrir le lien justificatif"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Expense Type */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleExpenseType(row)}
                        title="Basculez entre Transport (frais fixes du média) et Tarif Média (barème client)"
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                          row.expenseType === 'Transport'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                        }`}
                      >
                        {row.expenseType}
                      </button>
                    </td>

                    {/* Amount (Auto Calculated) */}
                    <td className="py-3 px-4 text-right">
                      {isPodMissing ? (
                        <span className="font-mono text-slate-500 font-bold">$0.00</span>
                      ) : (
                        <NumberWheelInput
                          value={row.amount}
                          onChange={(newVal) => updateMediaByEvent({ ...row, amount: newVal })}
                          prefix="$"
                        />
                      )}
                    </td>

                    {/* Paid */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono font-bold text-emerald-400">${(row.paid || 0).toLocaleString('fr-FR')}</span>
                    </td>

                    {/* Pending */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-mono font-bold ${
                          row.pending > 0 ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        ${(row.pending || 0).toLocaleString('fr-FR')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => deleteMediaByEvent(row.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                          title="Supprimer cette ligne"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    Aucune ligne de diffusion média ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
