import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrder } from '../../types';
import { X, FileSpreadsheet, Plus, Edit2, ShieldAlert } from 'lucide-react';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPo?: PurchaseOrder | null;
}

export const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({
  isOpen,
  onClose,
  editingPo
}) => {
  const { clients, currentUser, addPurchaseOrder, updatePurchaseOrder } = useApp();

  const [poNumber, setPoNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState<number>(100000);
  const [supportAmount, setSupportAmount] = useState<number>(4000);
  const [fpcPercent, setFpcPercent] = useState<number>(5);
  const [agencyFeesPercent, setAgencyFeesPercent] = useState<number>(14);
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Actif' | 'Clôturé' | 'En attente'>('Actif');
  const [notes, setNotes] = useState('');

  const isAdminOrSuper = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';
  const isFinance = currentUser?.role === 'finance';

  useEffect(() => {
    if (editingPo) {
      setPoNumber(editingPo.poNumber);
      setClientId(editingPo.clientId);
      setAmount(editingPo.amount);
      setSupportAmount(editingPo.supportAmount || 0);
      setFpcPercent(editingPo.fpcPercent || 5);
      setAgencyFeesPercent(editingPo.agencyFeesPercent || 14);
      setPoDate(editingPo.poDate || new Date().toISOString().split('T')[0]);
      setStatus(editingPo.status || 'Actif');
      setNotes(editingPo.notes || '');
    } else {
      setClientId(clients[0]?.id || '');
      setPoNumber(`PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setAmount(100000);
      setSupportAmount(4000);
      setFpcPercent(5);
      setAgencyFeesPercent(14);
      setPoDate(new Date().toISOString().split('T')[0]);
      setStatus('Actif');
      setNotes('');
    }
  }, [editingPo, isOpen, clients]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !poNumber.trim() || amount <= 0) return;

    const selectedClient = clients.find(c => c.id === clientId);

    if (editingPo) {
      updatePurchaseOrder({
        ...editingPo,
        poNumber: poNumber.trim(),
        clientId,
        clientName: selectedClient?.name || editingPo.clientName,
        amount,
        supportAmount,
        fpcPercent,
        agencyFeesPercent,
        poDate,
        status,
        notes,
      });
    } else {
      addPurchaseOrder({
        poNumber: poNumber.trim(),
        clientId,
        clientName: selectedClient?.name || 'Client',
        amount,
        supportAmount,
        fpcPercent,
        agencyFeesPercent,
        poDate,
        status,
        notes,
      });
    }

    onClose();
  };

  // Preview calculations
  const calculatedFpc = (amount * fpcPercent) / 100;
  const calculatedFees = (amount * agencyFeesPercent) / 100;
  const netEstimatedBeforePayments = amount - supportAmount - calculatedFpc - calculatedFees;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-xl bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl p-6 text-slate-100 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              {editingPo ? 'Modifier le PO Reçu' : 'Enregistrer un PO Reçu (Payment Order)'}
            </h2>
            <p className="text-xs text-slate-400">
              Budget attribué par le client avec imputation du support, FPC et agency fees.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Client Rattaché *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-blue-400"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Numéro du PO / Référence *
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Ex: PO-2026-VODA-001"
                required
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-blue-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Montant Total du PO ($ USD) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="0"
                step="100"
                required
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white font-mono font-bold text-emerald-400 outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Date de Réception du PO *
              </label>
              <input
                type="date"
                value={poDate}
                onChange={(e) => setPoDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Section Paramètres Fixes Admin & Finance */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Rubriques d'Imputation & Frais
              </span>
              <span className="text-[10px] text-slate-400">
                {isAdminOrSuper ? 'Inscrit par Admin' : 'Défini par Admin/Finance'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                  Support Fixe ($ USD)
                </label>
                <input
                  type="number"
                  value={supportAmount}
                  onChange={(e) => setSupportAmount(Number(e.target.value))}
                  disabled={!isAdminOrSuper}
                  min="0"
                  step="50"
                  className={`w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-slate-100 font-mono font-bold outline-none ${
                    isAdminOrSuper ? 'focus:border-blue-400' : 'opacity-70 cursor-not-allowed'
                  }`}
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">
                  {isAdminOrSuper ? 'Montant inscrit en dur' : 'Fixé par Super Admin'}
                </span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                  FPC (% Agence)
                </label>
                <input
                  type="number"
                  value={fpcPercent}
                  onChange={(e) => setFpcPercent(Number(e.target.value))}
                  disabled={!isAdminOrSuper && !isFinance}
                  min="0"
                  max="100"
                  step="0.5"
                  className={`w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-slate-100 font-mono font-bold outline-none ${
                    isAdminOrSuper || isFinance ? 'focus:border-blue-400' : 'opacity-70 cursor-not-allowed'
                  }`}
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">Par défaut: 5%</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-semibold mb-1">
                  Agency Fees (%)
                </label>
                <input
                  type="number"
                  value={agencyFeesPercent}
                  onChange={(e) => setAgencyFeesPercent(Number(e.target.value))}
                  disabled={!isAdminOrSuper && !isFinance}
                  min="0"
                  max="100"
                  step="0.5"
                  className={`w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-slate-100 font-mono font-bold outline-none ${
                    isAdminOrSuper || isFinance ? 'focus:border-blue-400' : 'opacity-70 cursor-not-allowed'
                  }`}
                />
                <span className="text-[9px] text-slate-400 mt-0.5 block">Par défaut: 14%</span>
              </div>
            </div>

            {/* Calculated summary card in modal */}
            <div className="mt-3 p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
              <div>
                <span className="text-slate-400 block">Support</span>
                <span className="font-mono font-bold text-red-400">${supportAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">FPC ({fpcPercent}%)</span>
                <span className="font-mono font-bold text-purple-300">${calculatedFpc.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Fees ({agencyFeesPercent}%)</span>
                <span className="font-mono font-bold text-blue-300">${calculatedFees.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Dispo Avant Paiements</span>
                <span className="font-mono font-bold text-emerald-300">${netEstimatedBeforePayments.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Statut du PO
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-blue-400"
              >
                <option value="Actif" className="bg-slate-900 text-white">Actif</option>
                <option value="En attente" className="bg-slate-900 text-white">En attente</option>
                <option value="Clôturé" className="bg-slate-900 text-white">Clôturé</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                Notes & Remarques
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Campagne lancement Q1"
                className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              {editingPo ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  <span>Enregistrer les Modifications</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Ajouter le PO Reçu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
