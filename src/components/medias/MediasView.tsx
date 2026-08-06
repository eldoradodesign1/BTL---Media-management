import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NumberWheelInput } from '../common/NumberWheelInput';
import { Radio, Tv, Globe, Newspaper, Monitor, MapPin, Phone, User, Plus, Search, Edit2, X, Check, Mail } from 'lucide-react';
import { MediaTypeCategory, Media, FocalPoint } from '../../types';

export const MediasView: React.FC = () => {
  const {
    medias,
    focalPoints,
    clients,
    updateMedia,
    addMedia,
    addFocalPoint,
    updateFocalPoint,
    globalSearchQuery,
    currentUser
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'medias' | 'focal_points'>('medias');

  // Permissions for editing media and focal points
  const canManageMedia = currentUser?.role === 'super-admin' || currentUser?.role === 'admin' || currentUser?.role === 'media_manager';

  // Modals state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);

  const [mediaName, setMediaName] = useState('');
  const [mediaType, setMediaType] = useState<MediaTypeCategory>('TV');
  const [mediaLocation, setMediaLocation] = useState('');
  const [mediaPhone, setMediaPhone] = useState('');
  const [mediaTransportFee, setMediaTransportFee] = useState<number>(50);
  const [mediaFocalPointId, setMediaFocalPointId] = useState<string>('');

  const [isFocalModalOpen, setIsFocalModalOpen] = useState(false);
  const [editingFocal, setEditingFocal] = useState<FocalPoint | null>(null);

  const [focalName, setFocalName] = useState('');
  const [focalPhone, setFocalPhone] = useState('');
  const [focalEmail, setFocalEmail] = useState('');
  const [focalMediaId, setFocalMediaId] = useState('');
  const [focalClientId, setFocalClientId] = useState('');

  const handleOpenAddMedia = () => {
    setEditingMedia(null);
    setMediaName('');
    setMediaType('TV');
    setMediaLocation('');
    setMediaPhone('');
    setMediaTransportFee(50);
    setMediaFocalPointId('');
    setIsMediaModalOpen(true);
  };

  const handleOpenEditMedia = (m: Media) => {
    setEditingMedia(m);
    setMediaName(m.name);
    setMediaType(m.type);
    setMediaLocation(m.location);
    setMediaPhone(m.phone || '');
    setMediaTransportFee(m.transportFee || 0);
    setMediaFocalPointId(m.focalPointId || '');
    setIsMediaModalOpen(true);
  };

  const handleSaveMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaName.trim()) return;

    const matchedFocal = focalPoints.find((fp) => fp.id === mediaFocalPointId);

    if (editingMedia) {
      updateMedia({
        ...editingMedia,
        name: mediaName.trim(),
        type: mediaType,
        location: mediaLocation.trim() || 'Kinshasa',
        phone: mediaPhone.trim(),
        transportFee: mediaTransportFee,
        focalPointId: mediaFocalPointId || undefined,
        focalPointName: matchedFocal?.name,
      });
    } else {
      addMedia({
        name: mediaName.trim(),
        type: mediaType,
        location: mediaLocation.trim() || 'Kinshasa',
        phone: mediaPhone.trim(),
        transportFee: mediaTransportFee,
        focalPointId: mediaFocalPointId || undefined,
        focalPointName: matchedFocal?.name,
      });
    }
    setIsMediaModalOpen(false);
  };

  const handleOpenAddFocal = () => {
    setEditingFocal(null);
    setFocalName('');
    setFocalPhone('');
    setFocalEmail('');
    setFocalMediaId('');
    setFocalClientId('');
    setIsFocalModalOpen(true);
  };

  const handleOpenEditFocal = (fp: FocalPoint) => {
    setEditingFocal(fp);
    setFocalName(fp.name);
    setFocalPhone(fp.phone);
    setFocalEmail(fp.email || '');
    setFocalMediaId(fp.mediaId || '');
    setFocalClientId(fp.clientId || '');
    setIsFocalModalOpen(true);
  };

  const handleSaveFocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focalName.trim()) return;

    const matchedMedia = medias.find((m) => m.id === focalMediaId);
    const matchedClient = clients.find((c) => c.id === focalClientId);

    if (editingFocal) {
      updateFocalPoint({
        ...editingFocal,
        name: focalName.trim(),
        phone: focalPhone.trim(),
        email: focalEmail.trim(),
        mediaId: focalMediaId || undefined,
        mediaName: matchedMedia?.name,
        clientId: focalClientId || undefined,
        clientName: matchedClient?.name,
      });
    } else {
      addFocalPoint({
        name: focalName.trim(),
        phone: focalPhone.trim(),
        email: focalEmail.trim(),
        mediaId: focalMediaId || undefined,
        mediaName: matchedMedia?.name,
        clientId: focalClientId || undefined,
        clientName: matchedClient?.name,
      });
    }
    setIsFocalModalOpen(false);
  };

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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 p-1 rounded-2xl">
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

          {canManageMedia && (
            <button
              onClick={activeSubTab === 'medias' ? handleOpenAddMedia : handleOpenAddFocal}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-2xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{activeSubTab === 'medias' ? 'Nouveau Média' : 'Nouveau Point Focal'}</span>
            </button>
          )}
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
                className="p-5 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300">
                        {med.type}
                      </span>
                      {canManageMedia && (
                        <button
                          onClick={() => handleOpenEditMedia(med)}
                          className="p-1 rounded-lg hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors"
                          title="Modifier les informations du média"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
                    {canManageMedia ? (
                      <NumberWheelInput
                        value={med.transportFee}
                        onChange={(newFee) => updateMedia({ ...med, transportFee: newFee })}
                        prefix="$"
                      />
                    ) : (
                      <span className="font-mono font-bold text-emerald-400 text-sm">${med.transportFee}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {canManageMedia ? 'Ajustement Molette' : 'Fixe'}
                  </span>
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
                  {canManageMedia && <th className="py-3.5 px-4 text-center">Actions</th>}
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
                    {canManageMedia && (
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleOpenEditFocal(fp)}
                          className="p-1 rounded-lg hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors"
                          title="Modifier le point focal"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Media Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-md bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl p-6 text-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  {editingMedia ? 'Modifier le Média' : 'Ajouter un Nouveau Média'}
                </h2>
                <p className="text-xs text-slate-400">Chaîne, station, journal ou régie d'affichage</p>
              </div>
            </div>

            <form onSubmit={handleSaveMedia} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                  Nom du Média *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: RTNC, Top Congo, Jeune Afrique"
                  value={mediaName}
                  onChange={(e) => setMediaName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                    Type de Média
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as MediaTypeCategory)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
                  >
                    <option value="TV">TV (Chaîne Télévision)</option>
                    <option value="Radio">Radio (Station)</option>
                    <option value="Presse Écrite">Presse Écrite</option>
                    <option value="Digital">Digital / Web</option>
                    <option value="Affichage (OOH)">Affichage (OOH)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                    Ville / Zone
                  </label>
                  <input
                    type="text"
                    placeholder="Kinshasa, Lubumbashi..."
                    value={mediaLocation}
                    onChange={(e) => setMediaLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                    Téléphone Contact
                  </label>
                  <input
                    type="text"
                    placeholder="+243 81 000 0000"
                    value={mediaPhone}
                    onChange={(e) => setMediaPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                    Frais de Transport Fixe ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={mediaTransportFee}
                    onChange={(e) => setMediaTransportFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                  Point Focal Défaut
                </label>
                <select
                  value={mediaFocalPointId}
                  onChange={(e) => setMediaFocalPointId(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
                >
                  <option value="">-- Aucun / À Définir --</option>
                  {focalPoints.map((fp) => (
                    <option key={fp.id} value={fp.id}>
                      {fp.name} ({fp.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                >
                  {editingMedia ? 'Enregistrer Modifications' : 'Créer le Média'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Add Focal Point Modal */}
      {isFocalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-md bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl p-6 text-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsFocalModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  {editingFocal ? 'Modifier le Point Focal' : 'Ajouter un Point Focal'}
                </h2>
                <p className="text-xs text-slate-400">Contact référent média ou client</p>
              </div>
            </div>

            <form onSubmit={handleSaveFocal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                  Nom & Prénom du Point Focal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean-Marc Mukendi"
                  value={focalName}
                  onChange={(e) => setFocalName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                    Téléphone Contact *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+243 81 000 0000"
                    value={focalPhone}
                    onChange={(e) => setFocalPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    placeholder="contact@media.cd"
                    value={focalEmail}
                    onChange={(e) => setFocalEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                    Média Associé
                  </label>
                  <select
                    value={focalMediaId}
                    onChange={(e) => setFocalMediaId(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
                  >
                    <option value="">-- Tous / Global --</option>
                    {medias.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider">
                    Client Associé
                  </label>
                  <select
                    value={focalClientId}
                    onChange={(e) => setFocalClientId(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/15 rounded-xl text-white outline-none focus:border-cyan-400"
                  >
                    <option value="">-- Tous Clients --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFocalModalOpen(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-colors font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                >
                  {editingFocal ? 'Enregistrer Modifications' : 'Créer le Point Focal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
