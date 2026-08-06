import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrderModal } from '../modals/PurchaseOrderModal';
import { ConfirmDeleteModal } from '../modals/ConfirmDeleteModal';
import { PurchaseOrder } from '../../types';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  User,
  Calendar,
  FileSpreadsheet,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const { clients, regions, events, mediaByEvents, purchaseOrders, mediaPayments, deletePurchaseOrder, currentUser } = useApp();

  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [editingPo, setEditingPo] = useState<PurchaseOrder | null>(null);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(clients[0]?.id || null);

  const [deletingPo, setDeletingPo] = useState<PurchaseOrder | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const canManagePo = currentUser?.role === 'super-admin' || currentUser?.role === 'admin' || currentUser?.role === 'finance';

  const handleOpenAddPo = (clientId?: string) => {
    setEditingPo(null);
    setIsPoModalOpen(true);
  };

  const handleOpenEditPo = (po: PurchaseOrder) => {
    setEditingPo(po);
    setIsPoModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">
            <Building2 className="w-4 h-4" />
            <span>Répertoire & Suivi Financier Clients BTL</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Portefeuille Clients & Subventions PO</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Aperçu détaillé des POs (Payment Orders), du support fixé, FPC (5%), Agency Fees (14%), des paiements et de la balance pour chaque client.
          </p>
        </div>

        {canManagePo && (
          <button
            onClick={() => handleOpenAddPo()}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-blue-600/25 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Enregistrer Un PO Reçu</span>
          </button>
        )}
      </div>

      {/* Clients Cards & PO Financial Breakdown Grid */}
      <div className="space-y-6">
        {clients.map((cli) => {
          const clientPOs = purchaseOrders.filter((po) => po.clientId === cli.id);
          const clientEvents = events.filter((e) => e.clientId === cli.id);
          const clientPayments = mediaPayments.filter((p) => p.clientId === cli.id);
          const clientDiffusions = mediaByEvents.filter((m) => m.clientId === cli.id);

          // Calculations per client
          const poSum = clientPOs.reduce((s, po) => s + po.amount, 0);
          const supportSum = clientPOs.reduce((s, po) => s + (po.supportAmount || 0), 0);
          const fpcSum = clientPOs.reduce((s, po) => s + (po.amount * (po.fpcPercent || 5)) / 100, 0);
          const feesSum = clientPOs.reduce((s, po) => s + (po.amount * (po.agencyFeesPercent || 14)) / 100, 0);
          const paymentsSum = clientPayments.reduce((s, p) => s + p.amount, 0);
          const balance = poSum - paymentsSum - fpcSum - feesSum - supportSum;
          const totalPending = clientDiffusions.reduce((s, m) => s + m.pending, 0);

          const isExpanded = expandedClientId === cli.id;

          return (
            <div
              key={cli.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-white/15 backdrop-blur-2xl shadow-xl space-y-4"
            >
              {/* Client Summary Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1.5 rounded-2xl text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {cli.code}
                  </span>
                  <div>
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      {cli.name}
                    </h2>
                    <div className="text-xs text-slate-400 flex items-center gap-4 mt-0.5">
                      <span>Contact: <strong className="text-slate-200">{cli.contactPerson}</strong></span>
                      <span>Email: <strong className="text-slate-200">{cli.email}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setExpandedClientId(isExpanded ? null : cli.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium flex items-center gap-1.5 border border-white/10 transition-colors"
                  >
                    <span>{isExpanded ? 'Masquer Détails' : 'Voir Activités & POs'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Client Financial Bar (PO, Support, FPC, Fees, Payments, Balance) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">PO Total Reçu</span>
                  <span className="text-base font-black font-mono text-white">${poSum.toLocaleString('fr-FR')}</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-red-400 uppercase font-semibold block">Support (Fixe)</span>
                  <span className="text-base font-bold font-mono text-red-400">${supportSum.toLocaleString('fr-FR')}</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-purple-300 uppercase font-semibold block">FPC Agence (5%)</span>
                  <span className="text-base font-bold font-mono text-purple-300">${fpcSum.toLocaleString('fr-FR')}</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-slate-300 uppercase font-semibold block">Agency Fees (14%)</span>
                  <span className="text-base font-bold font-mono text-slate-200">${feesSum.toLocaleString('fr-FR')}</span>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-blue-400 uppercase font-semibold block">Paiements Effectués</span>
                  <span className="text-base font-bold font-mono text-blue-400">${paymentsSum.toLocaleString('fr-FR')}</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold block">Balance Restante</span>
                  <span className="text-base font-black font-mono text-emerald-300">${balance.toLocaleString('fr-FR')}</span>
                </div>
              </div>

              {/* Detailed Accordion Panel for Client Activities & POs */}
              {isExpanded && (
                <div className="pt-4 border-t border-white/10 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Historique des Orders de Paiement (PO) pour {cli.name}</span>
                    </h3>
                  </div>

                  {clientPOs.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-black/30 text-center text-xs text-slate-400">
                      Aucun PO enregistré pour ce client.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-white/5 text-[10px] uppercase text-slate-400 font-bold border-b border-white/10">
                          <tr>
                            <th className="p-3">Numéro PO</th>
                            <th className="p-3">Date</th>
                            <th className="p-3 text-right">Montant PO</th>
                            <th className="p-3 text-right">Support</th>
                            <th className="p-3 text-right">FPC (5%)</th>
                            <th className="p-3 text-right">Fees (14%)</th>
                            <th className="p-3">Statut</th>
                            <th className="p-3">Notes</th>
                            {canManagePo && <th className="p-3 text-right">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {clientPOs.map((po) => {
                            const poFpc = (po.amount * (po.fpcPercent || 5)) / 100;
                            const poFees = (po.amount * (po.agencyFeesPercent || 14)) / 100;

                            return (
                              <tr key={po.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-3 font-mono font-bold text-white">{po.poNumber}</td>
                                <td className="p-3">{po.poDate}</td>
                                <td className="p-3 text-right font-mono font-bold text-emerald-400">
                                  ${po.amount.toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono text-red-400">
                                  ${(po.supportAmount || 0).toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono text-purple-300">
                                  ${poFpc.toLocaleString()}
                                </td>
                                <td className="p-3 text-right font-mono text-slate-300">
                                  ${poFees.toLocaleString()}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    {po.status}
                                  </span>
                                </td>
                                <td className="p-3 text-slate-400 text-[11px] truncate max-w-[150px]">
                                  {po.notes || '-'}
                                </td>
                                {canManagePo && (
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => handleOpenEditPo(po)}
                                        className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                        title="Modifier PO"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setDeletingPo(po);
                                          setIsDeleteModalOpen(true);
                                        }}
                                        className="p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                        title="Supprimer PO"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Client Events list */}
                  <div className="pt-2">
                    <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Campagnes & Événements ({clientEvents.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {clientEvents.map((evt) => (
                        <div key={evt.id} className="p-3 rounded-2xl bg-black/40 border border-white/10 text-xs">
                          <div className="font-bold text-white uppercase truncate">{evt.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">Date : {evt.eventDate}</div>
                          <div className="mt-2 text-right font-mono font-bold text-blue-400">
                            Statut: {evt.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PurchaseOrderModal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        editingPo={editingPo}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPo(null);
        }}
        onConfirm={() => {
          if (deletingPo) {
            deletePurchaseOrder(deletingPo.id);
          }
        }}
        title="Supprimer le PO (Purchase Order)"
        message={`Êtes-vous sûr de vouloir supprimer le PO N° ${deletingPo?.poNumber} d'un montant de $${deletingPo?.amount.toLocaleString()} ?`}
        confirmText="Oui, Supprimer"
      />
    </div>
  );
};
