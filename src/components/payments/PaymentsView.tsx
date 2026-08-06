import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaPayment } from '../../types';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import {
  CreditCard,
  Plus,
  Trash2,
  Tv,
  Calendar,
  Building2,
  Phone,
  User,
  DollarSign,
  FileCheck,
  Tag,
  Smartphone,
  Landmark,
  Banknote,
  Receipt
} from 'lucide-react';

interface PaymentsViewProps {
  onOpenAddModal: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ onOpenAddModal }) => {
  const { mediaPayments, deleteMediaPayment, globalSearchQuery, currentUser } = useApp();

  const [deletingPayment, setDeletingPayment] = useState<MediaPayment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('Tous');

  const isClient = currentUser?.role === 'client';

  const filteredPayments = mediaPayments.filter((p) => {
    if (selectedMethod !== 'Tous' && p.paymentMethod !== selectedMethod) return false;
    if (globalSearchQuery.trim()) {
      const q = globalSearchQuery.toLowerCase();
      const matchMedia = p.mediaName?.toLowerCase().includes(q);
      const matchEvent = p.eventName?.toLowerCase().includes(q);
      const matchClient = p.clientName?.toLowerCase().includes(q);
      const matchRef = p.referenceNo?.toLowerCase().includes(q);
      const matchFocal = p.focalPointName?.toLowerCase().includes(q);
      const matchMethod = p.paymentMethod?.toLowerCase().includes(q);
      if (!matchMedia && !matchEvent && !matchClient && !matchRef && !matchFocal && !matchMethod) return false;
    }
    return true;
  });

  const totalPaymentsSum = filteredPayments.reduce((s, p) => s + p.amount, 0);

  // Method breakdown sums
  const virementSum = mediaPayments.filter(p => p.paymentMethod === 'Virement').reduce((s, p) => s + p.amount, 0);
  const mobileMoneySum = mediaPayments.filter(p => p.paymentMethod === 'Mobile Money').reduce((s, p) => s + p.amount, 0);
  const chequeSum = mediaPayments.filter(p => p.paymentMethod === 'Chèque').reduce((s, p) => s + p.amount, 0);
  const especesSum = mediaPayments.filter(p => p.paymentMethod === 'Espèces').reduce((s, p) => s + p.amount, 0);

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'Mobile Money':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 w-fit">
            <Smartphone className="w-3 h-3 text-amber-400" />
            <span>Mobile Money</span>
          </span>
        );
      case 'Chèque':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 w-fit">
            <Receipt className="w-3 h-3 text-indigo-400" />
            <span>Chèque Bancaire</span>
          </span>
        );
      case 'Espèces':
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5 w-fit">
            <Banknote className="w-3 h-3 text-teal-400" />
            <span>Espèces</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 w-fit">
            <Landmark className="w-3 h-3 text-emerald-400" />
            <span>Virement</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            <CreditCard className="w-4 h-4" />
            <span>Table Mère Media_payments</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Registre des Paiements Médias</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Historique exhaustif des débursements, acomptes, virements et règlements Mobile Money effectués aux médias.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right">
            <div className="text-[10px] text-slate-400 font-medium">Total Décaissements</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              ${totalPaymentsSum.toLocaleString('fr-FR')}
            </div>
          </div>

          {!isClient && (
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-2xl text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer un Paiement</span>
            </button>
          )}
        </div>
      </div>

      {/* Payment Method KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedMethod(selectedMethod === 'Virement' ? 'Tous' : 'Virement')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedMethod === 'Virement'
              ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/30'
              : 'bg-slate-900/60 border-white/10 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Landmark className="w-3.5 h-3.5 text-emerald-400" />
              Virements
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            ${virementSum.toLocaleString('fr-FR')}
          </div>
        </button>

        <button
          onClick={() => setSelectedMethod(selectedMethod === 'Mobile Money' ? 'Tous' : 'Mobile Money')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedMethod === 'Mobile Money'
              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30'
              : 'bg-slate-900/60 border-white/10 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              Mobile Money
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-amber-400">
            ${mobileMoneySum.toLocaleString('fr-FR')}
          </div>
        </button>

        <button
          onClick={() => setSelectedMethod(selectedMethod === 'Chèque' ? 'Tous' : 'Chèque')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedMethod === 'Chèque'
              ? 'bg-indigo-500/20 border-indigo-400 ring-2 ring-indigo-400/30'
              : 'bg-slate-900/60 border-white/10 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Receipt className="w-3.5 h-3.5 text-indigo-400" />
              Chèques
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-indigo-400">
            ${chequeSum.toLocaleString('fr-FR')}
          </div>
        </button>

        <button
          onClick={() => setSelectedMethod(selectedMethod === 'Espèces' ? 'Tous' : 'Espèces')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            selectedMethod === 'Espèces'
              ? 'bg-teal-500/20 border-teal-400 ring-2 ring-teal-400/30'
              : 'bg-slate-900/60 border-white/10 hover:bg-white/5'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <Banknote className="w-3.5 h-3.5 text-teal-400" />
              Espèces (Caisse)
            </span>
          </div>
          <div className="text-lg font-bold font-mono text-teal-400">
            ${especesSum.toLocaleString('fr-FR')}
          </div>
        </button>
      </div>

      {/* Mode Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1">Filtrer :</span>
        {['Tous', 'Virement', 'Mobile Money', 'Chèque', 'Espèces'].map((method) => (
          <button
            key={method}
            onClick={() => setSelectedMethod(method)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
              selectedMethod === method
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            {method}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-emerald-300 select-none">
                <th className="py-3.5 px-4">Date / Référence</th>
                <th className="py-3.5 px-4">Média / Point Focal</th>
                <th className="py-3.5 px-4">Événement</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Mode de Règlement</th>
                <th className="py-3.5 px-4 text-right">Montant Versé ($)</th>
                {!isClient && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-emerald-500/10 transition-colors group">
                  {/* Date & Ref */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-white font-mono">{pay.paymentDate}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{pay.referenceNo}</div>
                  </td>

                  {/* Media & Focal Point */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{pay.mediaName}</span>
                    </div>
                    {pay.focalPointName && (
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <User className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span>Point focal: {pay.focalPointName}</span>
                      </div>
                    )}
                  </td>

                  {/* Event */}
                  <td className="py-3 px-4 font-medium text-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{pay.eventName}</span>
                    </div>
                  </td>

                  {/* Client */}
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1 w-fit">
                      <Building2 className="w-3 h-3 text-blue-400" />
                      <span>{pay.clientName}</span>
                    </span>
                  </td>

                  {/* Mode */}
                  <td className="py-3 px-4">
                    {getMethodBadge(pay.paymentMethod)}
                  </td>

                  {/* Amount */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                    ${pay.amount.toLocaleString('fr-FR')}
                  </td>

                  {/* Actions */}
                  {!isClient && (
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setDeletingPayment(pay);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-all"
                        title="Annuler/Supprimer ce paiement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={isClient ? 6 : 7} className="py-12 text-center text-slate-400 text-sm">
                    Aucun paiement enregistré pour cette sélection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPayment(null);
        }}
        onConfirm={() => {
          if (deletingPayment) {
            deleteMediaPayment(deletingPayment.id);
          }
        }}
        title="Supprimer le Paiement"
        message={`Êtes-vous sûr de vouloir supprimer le paiement de $${deletingPayment?.amount.toLocaleString()} pour ${deletingPayment?.mediaName} (${deletingPayment?.referenceNo}) ?`}
        confirmText="Oui, Supprimer"
      />
    </div>
  );
};
