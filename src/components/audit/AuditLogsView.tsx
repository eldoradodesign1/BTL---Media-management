import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileSpreadsheet, User, Clock, Activity, ShieldCheck } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, globalSearchQuery } = useApp();

  const filteredLogs = auditLogs.filter((log) => {
    if (globalSearchQuery.trim()) {
      const q = globalSearchQuery.toLowerCase();
      return (
        log.userName.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityType.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'Création':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Modification':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Suppression':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Journal d'Audit & Traçabilité</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Historique des Opérations Métier</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Journal immuable enregistrant les créations, modifications de tarifs, suppressions et saisies d'acomptes.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4" />
          <span>Traçabilité Active</span>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-cyan-300 select-none">
                <th className="py-3.5 px-4">Horodatage</th>
                <th className="py-3.5 px-4">Utilisateur</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entité Concernée</th>
                <th className="py-3.5 px-4">Détails de l'Opération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-white">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{log.userName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{log.entityType}</td>
                  <td className="py-3 px-4 text-slate-300 leading-relaxed">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
