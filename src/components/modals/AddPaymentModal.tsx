import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CreditCard, Plus } from 'lucide-react';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({ isOpen, onClose }) => {
  const { events, medias, clients, focalPoints, addMediaPayment } = useApp();

  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [mediaId, setMediaId] = useState(medias[0]?.id || '');
  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [amount, setAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<'Virement' | 'Chèque' | 'Mobile Money' | 'Espèces'>('Virement');
  const [referenceNo, setReferenceNo] = useState(`VIR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaId || !eventId || amount <= 0) return;

    const targetEvt = events.find((e) => e.id === eventId);
    const targetMedia = medias.find((m) => m.id === mediaId);
    const focalObj = focalPoints.find((fp) => fp.mediaId === mediaId || fp.id === targetMedia?.focalPointId);

    addMediaPayment({
      paymentDate,
      mediaId,
      eventId,
      amount,
      paymentMethod,
      referenceNo,
      focalPointName: focalObj?.name || targetMedia?.focalPointName,
      clientId: targetEvt?.clientId,
      clientName: targetEvt?.clientName,
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
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">Enregistrer un Paiement Média</h2>
            <p className="text-xs text-slate-400">Versement au point focal ou média</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Média Bénéficiaire *
              </label>
              <select
                value={mediaId}
                onChange={(e) => setMediaId(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-emerald-400"
              >
                {medias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Événement *
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-emerald-400"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Montant du Règlement ($) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-emerald-400 font-mono text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Date de Valeur *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Mode de Paiement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => {
                  const m = e.target.value as any;
                  setPaymentMethod(m);
                  const year = new Date().getFullYear();
                  const rand = Math.floor(1000 + Math.random() * 9000);
                  if (m === 'Mobile Money') setReferenceNo(`MM-${year}-${rand}`);
                  else if (m === 'Chèque') setReferenceNo(`CHQ-${year}-${rand}`);
                  else if (m === 'Espèces') setReferenceNo(`CASH-${year}-${rand}`);
                  else setReferenceNo(`VIR-${year}-${rand}`);
                }}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-emerald-400"
              >
                <option value="Virement">Virement Bancaire</option>
                <option value="Mobile Money">Mobile Money (M-Pesa/Airtel)</option>
                <option value="Chèque">Chèque Bancaire</option>
                <option value="Espèces">Espèces (Caisse)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                N° de Référence / Pièce
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
              Notes du Règlement
            </label>
            <textarea
              rows={2}
              placeholder="Acompte, solde..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Valider le Paiement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
