import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CampaignEvent, EventStatus } from '../../types';
import { X, Calendar, Edit3, Save } from 'lucide-react';

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CampaignEvent | null;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({ isOpen, onClose, event }) => {
  const { clients, regions, updateEvent } = useApp();

  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [clientId, setClientId] = useState('');
  const [regionId, setRegionId] = useState('');
  const [status, setStatus] = useState<EventStatus>('Planifié');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (event) {
      setName(event.name || '');
      setEventDate(event.eventDate || new Date().toISOString().split('T')[0]);
      setClientId(event.clientId || (clients[0]?.id || ''));
      setRegionId(event.regionId || (regions[0]?.id || ''));
      setStatus(event.status || 'Planifié');
      setNotes(event.notes || '');
    }
  }, [event, clients, regions]);

  if (!isOpen || !event) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateEvent({
      ...event,
      name,
      eventDate,
      clientId,
      regionId,
      status,
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
            <Edit3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Modifier l'Événement</h2>
            <p className="text-xs text-slate-400">Corriger le client, la zone, la date ou le statut</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
              Nom de l'Événement / Campagne *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Lancement M-Pesa 5.0 Kinshasa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white text-sm outline-none focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Date de l'Événement *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Statut
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
              >
                <option value="Planifié">Planifié</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Annulé">Annulé</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Client (Annonceur) *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400 font-bold"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Région / Zone *
              </label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
              Notes & Description
            </label>
            <textarea
              rows={3}
              placeholder="Détails du cahier des charges média..."
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
              <Save className="w-4 h-4" />
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
