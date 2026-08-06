import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NumberWheelInput } from '../common/NumberWheelInput';
import { Radio, Tv, Globe, Newspaper, Monitor, MapPin, Phone, User, Plus, Search } from 'lucide-react';
import { MediaTypeCategory } from '../../types';

export const MediasView: React.FC = () => {
  const { medias, focalPoints, updateMedia, addMedia, globalSearchQuery } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'medias' | 'focal_points'>('medias');

  const filteredMedias = medias.filter((m) => {
    if (globalSearchQuery.trim()) {
      const q = globalSearchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.focalPointName?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getMediaIcon = (type: MediaTypeCategory) => {
    switch (type) {
      case 'TV': return Tv;
      case 'Radio': return Radio;
      case 'Presse Écrite': return Newspaper;
      case 'Digital': return Globe;
      case 'Affichage (OOH)': return Monitor;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            <Radio className="w-4 h-4" />
            <span>Répertoire Officiel Médias</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Médias & Points Focaux</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Base de données des chaînes TV, stations radio, presse, régies d'affichage et contacts médias référencés.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-black/40 border border-white/10 p-1 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('medias')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'medias' ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Médias ({medias.length})
          </button>
          <button
            onClick={() => setActiveSubTab('focal_points')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeSubTab === 'focal_points' ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Points Focaux ({focalPoints.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'medias' ? (
        /* Medias Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedias.map((med) => {
            const Icon = getMediaIcon(med.type);
            return (
              <div
                key={med.id}
                className="p-5 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300">
                      {med.type}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {med.name}
                  </h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{med.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Point focal: {med.focalPointName || 'Non défini'}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <Phone className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>{med.phone || 'Non renseigné'}</span>
                    </div>
                  </div>
                </div>

                {/* Transport Fee Row */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Frais de Transport Fixe</span>
                    <NumberWheelInput
                      value={med.transportFee}
                      onChange={(newFee) => updateMedia({ ...med, transportFee: newFee })}
                      prefix="$"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Ajustement Molette</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Focal Points Table */
        <div className="rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-cyan-300 select-none">
                  <th className="py-3.5 px-4">Nom du Point Focal</th>
                  <th className="py-3.5 px-4">Média Associé</th>
                  <th className="py-3.5 px-4">Client Préféré</th>
                  <th className="py-3.5 px-4">Téléphone Contact</th>
                  <th className="py-3.5 px-4">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {focalPoints.map((fp) => (
                  <tr key={fp.id} className="hover:bg-cyan-500/10 transition-colors">
                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{fp.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">{fp.mediaName || 'Global'}</td>
                    <td className="py-3 px-4 text-slate-300">{fp.clientName || 'Tous'}</td>
                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">{fp.phone}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{fp.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
