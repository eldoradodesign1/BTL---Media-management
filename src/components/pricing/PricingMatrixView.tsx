import React from 'react';
import { useApp } from '../../context/AppContext';
import { NumberWheelInput } from '../common/NumberWheelInput';
import { DollarSign, Tv, Building2, Info, RefreshCw } from 'lucide-react';

export const PricingMatrixView: React.FC = () => {
  const { medias, clients, pricingRates, updatePricingRate } = useApp();

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Table Mère Pricing</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Grille Tarifaire Médias x Clients</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Grille croisée définissant le barème tarifaire unitaire appliqué pour chaque combinaison de média et d'annonceur.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300">
          <Info className="w-4 h-4 shrink-0" />
          <span>Double-clic ou molette pour modifier un tarif direct</span>
        </div>
      </div>

      {/* Pricing Matrix Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-cyan-300 select-none">
                <th className="py-4 px-5 min-w-[200px]">Média / Emplacement</th>
                {clients.map((cli) => (
                  <th key={cli.id} className="py-4 px-5 text-center min-w-[150px]">
                    <div className="font-bold text-white text-xs">{cli.name}</div>
                    <span className="text-[9px] font-mono font-normal text-cyan-400">{cli.code}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {medias.map((med) => (
                <tr key={med.id} className="hover:bg-cyan-500/10 transition-colors">
                  {/* Media Name */}
                  <td className="py-3.5 px-5 font-bold text-white bg-black/20">
                    <div className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{med.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{med.location} ({med.type})</div>
                  </td>

                  {/* Client Cells */}
                  {clients.map((cli) => {
                    const rateObj = pricingRates.find(
                      (p) => p.mediaId === med.id && p.clientId === cli.id
                    );
                    const currentRate = rateObj ? rateObj.rateAmount : 0;

                    return (
                      <td key={cli.id} className="py-3.5 px-5 text-center font-mono">
                        <NumberWheelInput
                          value={currentRate}
                          onChange={(newVal) => updatePricingRate(med.id, cli.id, newVal)}
                          prefix="$"
                        />
                        {rateObj && (
                          <div className="text-[9px] text-slate-500 mt-0.5 font-sans">
                            v{rateObj.version}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
