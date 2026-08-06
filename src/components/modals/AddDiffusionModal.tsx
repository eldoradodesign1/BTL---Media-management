import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Tv, Plus } from 'lucide-react';
import { ExpenseType } from '../../types';

interface AddDiffusionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDiffusionModal: React.FC<AddDiffusionModalProps> = ({ isOpen, onClose }) => {
  const { events, medias, addMediaByEvent } = useApp();

  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [mediaId, setMediaId] = useState(medias[0]?.id || '');
  const [expenseType, setExpenseType] = useState<ExpenseType>('Tarif Média');
  const [proofOfDiffusion, setProofOfDiffusion] = useState('POD-JUSTIF-001.pdf');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId || !mediaId) return;

    const targetEvt = events.find((e) => e.id === eventId);

    addMediaByEvent({
      eventId,
      mediaId,
      eventDate: targetEvt?.eventDate || new Date().toISOString().split('T')[0],
      expenseType,
      proofOfDiffusion,
      podLinks: proofOfDiffusion ? ['https://media-archive.cd/pod/sample'] : [],
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl p-6 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Nouvelle Diffusion Média (Media_by_events)</h2>
            <p className="text-xs text-slate-400">Ajouter une ligne de prestation média</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
              Événement de Campagne *
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-sm outline-none focus:border-cyan-400"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({evt.clientName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
              Média Support *
            </label>
            <select
              value={mediaId}
              onChange={(e) => setMediaId(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-sm outline-none focus:border-cyan-400"
            >
              {medias.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.type} - {m.location})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Type de Dépense *
              </label>
              <select
                value={expenseType}
                onChange={(e) => setExpenseType(e.target.value as any)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
              >
                <option value="Tarif Média">Tarif Média (Barème Client)</option>
                <option value="Transport">Transport (Frais Fixe Média)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Preuve de Diffusion (POD)
              </label>
              <input
                type="text"
                placeholder="Laisser vide pour Montant = $0"
                value={proofOfDiffusion}
                onChange={(e) => setProofOfDiffusion(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
              Remarques
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Horaire de passage, tranche horaire..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer la Diffusion</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
