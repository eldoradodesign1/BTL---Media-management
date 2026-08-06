import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NumberWheelInput } from '../common/NumberWheelInput';
import {
  DollarSign,
  Tv,
  Building2,
  Info,
  Layers,
  Grid,
  ListFilter,
  Search,
  Plus,
  ShieldCheck,
  Eye,
  TrendingUp,
  Tag,
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit2,
  ArrowRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { RateType, PricingRate, MediaTypeCategory } from '../../types';

export const PricingMatrixView: React.FC = () => {
  const { medias, clients, pricingRates, updatePricingRate, currentUser } = useApp();

  // Role detection
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super-admin';
  const isClient = currentUser.role === 'client';
  const isBTL = !isAdmin && !isClient;

  // View mode: 'matrix' (Matrice croisée) | 'rows' (Enregistrements par ligne)
  const [viewMode, setViewMode] = useState<'matrix' | 'rows'>('matrix');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all'); // Media category
  const [selectedRateTypeFilter, setSelectedRateTypeFilter] = useState<string>('all'); // 'all' | 'catalog' | 'real'

  // Modal for adding/editing a price row
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMediaId, setModalMediaId] = useState<string>('');
  const [modalClientId, setModalClientId] = useState<string>('');
  const [modalCatalogRate, setModalCatalogRate] = useState<number>(0);
  const [modalRealRate, setModalRealRate] = useState<number>(0);

  // Filtered Medias
  const filteredMedias = useMemo(() => {
    return medias.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedTypeFilter === 'all' || m.type === selectedTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [medias, searchQuery, selectedTypeFilter]);

  // Filtered Clients
  const filteredClients = useMemo(() => {
    if (isClient && currentUser.clientId) {
      return clients.filter((c) => c.id === currentUser.clientId);
    }
    if (selectedClientFilter === 'all') return clients;
    return clients.filter((c) => c.id === selectedClientFilter);
  }, [clients, selectedClientFilter, isClient, currentUser.clientId]);

  // Filtered Rows for the Row View
  const rowViewData = useMemo(() => {
    return pricingRates.filter((pr) => {
      // Role level filter
      if (isClient) {
        if (pr.rateType !== 'catalog') return false;
        if (currentUser.clientId && pr.clientId !== currentUser.clientId) return false;
      }
      if (isBTL && pr.rateType !== 'real') return false;

      // User filters
      if (selectedRateTypeFilter !== 'all' && pr.rateType !== selectedRateTypeFilter) return false;
      if (selectedClientFilter !== 'all' && pr.clientId !== selectedClientFilter) return false;

      const med = medias.find((m) => m.id === pr.mediaId);
      if (med) {
        if (selectedTypeFilter !== 'all' && med.type !== selectedTypeFilter) return false;
        if (
          searchQuery &&
          !med.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !med.location.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });
  }, [pricingRates, isClient, isBTL, currentUser.clientId, selectedRateTypeFilter, selectedClientFilter, selectedTypeFilter, searchQuery, medias]);

  const handleOpenAddModal = (mediaId = '', clientId = '') => {
    const medId = mediaId || (medias[0]?.id ?? '');
    const cliId = clientId || (clients[0]?.id ?? '');

    const catalogPr = pricingRates.find((p) => p.mediaId === medId && p.clientId === cliId && p.rateType === 'catalog');
    const realPr = pricingRates.find((p) => p.mediaId === medId && p.clientId === cliId && p.rateType === 'real');

    setModalMediaId(medId);
    setModalClientId(cliId);
    setModalCatalogRate(catalogPr ? catalogPr.rateAmount : 1000);
    setModalRealRate(realPr ? realPr.rateAmount : 750);
    setIsModalOpen(true);
  };

  const handleSaveModalRates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalMediaId || !modalClientId) return;

    // Save catalog rate
    updatePricingRate(modalMediaId, modalClientId, 'catalog', Number(modalCatalogRate));
    // Save real rate
    updatePricingRate(modalMediaId, modalClientId, 'real', Number(modalRealRate));

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Role-Aware Banner Header */}
      <div className="p-6 rounded-3xl bg-slate-900/70 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-1.5">
            <DollarSign className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400">Grille Tarifaire Multi-Niveaux</span>
            <span className="text-slate-500">•</span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Mode Administrateur (Double Barème & Marges)
              </span>
            )}
            {isClient && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Catalogue Tarifaire Client
              </span>
            )}
            {isBTL && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Barème Coûts Réels Médias (BTL)
              </span>
            )}
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {isAdmin && 'Grille Mère Tarifaire & Double Barème (Catalogue vs Réel)'}
            {isClient && 'Catalogue Officiel des Tarifs Médias'}
            {isBTL && 'Grille des Coûts Négociés Médias (BTL)'}
          </h1>

          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {isAdmin &&
              'Enregistrement ligne par ligne de chaque tarif pour chaque média et client. Les administrateurs définissent à la fois le Prix Catalogue (vu par les clients) et le Prix Réel BTL (vu par les équipes opérationnelles).'}
            {isClient &&
              'Consultez le barème officiel des prix unitaires catalogue applicables pour vos campagnes et diffusions médiatiques.'}
            {isBTL &&
              'Barème confidentiel des coûts réels d\'acquisition média négociés par l\'agence BTL.'}
          </p>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Saisir / Ajuster un Tarif</span>
            </button>
          )}

          {/* Mode switch */}
          <div className="flex items-center bg-black/40 border border-white/15 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 shadow-inner'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Matrice Croisée</span>
            </button>
            <button
              onClick={() => setViewMode('rows')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                viewMode === 'rows'
                  ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-500/40 shadow-inner'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Lignes (Base)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer média ou ville..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Client Filter */}
          {!isClient && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedClientFilter}
                onChange={(e) => setSelectedClientFilter(e.target.value)}
                className="bg-slate-950/60 border border-white/10 text-white rounded-xl text-xs px-3 py-1.5 outline-none focus:border-cyan-500"
              >
                <option value="all">Tous les Clients</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Media Type Filter */}
          <div className="flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-slate-950/60 border border-white/10 text-white rounded-xl text-xs px-3 py-1.5 outline-none focus:border-cyan-500"
            >
              <option value="all">Tous types médias</option>
              <option value="TV">TV</option>
              <option value="Radio">Radio</option>
              <option value="Presse Écrite">Presse Écrite</option>
              <option value="Digital">Digital</option>
              <option value="Affichage (OOH)">Affichage (OOH)</option>
            </select>
          </div>

          {/* Rate Type Filter (Admins only in row view) */}
          {isAdmin && viewMode === 'rows' && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedRateTypeFilter}
                onChange={(e) => setSelectedRateTypeFilter(e.target.value)}
                className="bg-slate-950/60 border border-white/10 text-white rounded-xl text-xs px-3 py-1.5 outline-none focus:border-cyan-500"
              >
                <option value="all">Tous types de prix</option>
                <option value="catalog">Prix Catalogue Client</option>
                <option value="real">Prix Réel BTL</option>
              </select>
            </div>
          )}
        </div>

        {/* Info Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
          {isAdmin && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
                <span className="text-blue-300">Prix Catalogue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-300">Prix Réel BTL</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-amber-300">Marge BTL</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <div className="rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-cyan-300 select-none">
                  <th className="py-4 px-5 min-w-[220px]">Média / Emplacement</th>
                  {filteredClients.map((cli) => (
                    <th key={cli.id} className="py-4 px-5 text-center min-w-[200px]">
                      <div className="font-bold text-white text-xs">{cli.name}</div>
                      <span className="text-[9px] font-mono font-normal text-cyan-400">{cli.code}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredMedias.map((med) => (
                  <tr key={med.id} className="hover:bg-cyan-500/5 transition-colors">
                    {/* Media Name */}
                    <td className="py-4 px-5 font-bold text-white bg-black/20">
                      <div className="flex items-center gap-2">
                        <Tv className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{med.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-1">
                        {med.location} • <span className="text-cyan-300 font-medium">{med.type}</span>
                      </div>
                    </td>

                    {/* Client Cells */}
                    {filteredClients.map((cli) => {
                      const catalogObj = pricingRates.find(
                        (p) => p.mediaId === med.id && p.clientId === cli.id && (p.rateType === 'catalog' || !p.rateType)
                      );
                      const realObj = pricingRates.find(
                        (p) => p.mediaId === med.id && p.clientId === cli.id && p.rateType === 'real'
                      );

                      const catalogRate = catalogObj ? catalogObj.rateAmount : 0;
                      const realRate = realObj ? realObj.rateAmount : 0;
                      const margin = catalogRate - realRate;
                      const marginPct = catalogRate > 0 ? ((margin / catalogRate) * 100).toFixed(0) : '0';

                      return (
                        <td key={cli.id} className="py-3 px-4 text-center font-mono">
                          {/* Admin View: Both prices side-by-side + margin */}
                          {isAdmin && (
                            <div className="space-y-2 p-2 rounded-2xl bg-black/30 border border-white/5 hover:border-white/20 transition-all">
                              {/* Prix Catalogue (Client) */}
                              <div className="flex items-center justify-between text-[11px] gap-1">
                                <span className="text-[10px] text-blue-300 font-sans font-medium">Prix Catalogue:</span>
                                <NumberWheelInput
                                  value={catalogRate}
                                  onChange={(newVal) => updatePricingRate(med.id, cli.id, 'catalog', newVal)}
                                  prefix="$"
                                />
                              </div>

                              {/* Prix Réel (Coût BTL) */}
                              <div className="flex items-center justify-between text-[11px] gap-1">
                                <span className="text-[10px] text-emerald-300 font-sans font-medium">Coût Réel BTL:</span>
                                <NumberWheelInput
                                  value={realRate}
                                  onChange={(newVal) => updatePricingRate(med.id, cli.id, 'real', newVal)}
                                  prefix="$"
                                />
                              </div>

                              {/* Margin Indicator */}
                              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px] font-sans">
                                <span className="text-slate-400">Marge BTL:</span>
                                <span className={`font-bold ${margin >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                                  ${margin.toLocaleString()} ({marginPct}%)
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Client View: Catalogue Rate only */}
                          {isClient && (
                            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center">
                              <div className="text-[10px] text-blue-300 font-sans font-semibold mb-1">Tarif Catalogue</div>
                              <div className="text-sm font-extrabold text-white">${catalogRate.toLocaleString()}</div>
                            </div>
                          )}

                          {/* BTL User View: Real Cost Rate only */}
                          {isBTL && (
                            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                              <div className="text-[10px] text-emerald-300 font-sans font-semibold mb-1">Coût Réel BTL</div>
                              <div className="text-sm font-extrabold text-emerald-200">${realRate.toLocaleString()}</div>
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
      )}

      {/* ROW-BY-ROW DATABASE VIEW */}
      {viewMode === 'rows' && (
        <div className="rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-cyan-300 select-none">
                  <th className="py-4 px-5">ID / Version</th>
                  <th className="py-4 px-5">Média / Type</th>
                  <th className="py-4 px-5">Client (Annonceur)</th>
                  <th className="py-4 px-5">Type de Tarif</th>
                  <th className="py-4 px-5 text-right">Montant Unitaire ($)</th>
                  <th className="py-4 px-5">Date d'Effet</th>
                  {isAdmin && <th className="py-4 px-5 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {rowViewData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                      Aucun enregistrement tarifaire ne correspond aux filtres sélectionnés.
                    </td>
                  </tr>
                ) : (
                  rowViewData.map((pr) => {
                    const med = medias.find((m) => m.id === pr.mediaId);
                    const cli = clients.find((c) => c.id === pr.clientId);

                    const isCatalog = pr.rateType === 'catalog' || !pr.rateType;

                    return (
                      <tr key={pr.id} className="hover:bg-cyan-500/10 transition-colors">
                        {/* ID / Version */}
                        <td className="py-3.5 px-5 font-mono text-slate-400 text-[11px]">
                          <span className="text-slate-300 font-semibold">{pr.id}</span>
                          <span className="block text-[10px] text-slate-500">v{pr.version}</span>
                        </td>

                        {/* Media */}
                        <td className="py-3.5 px-5 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <Tv className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span>{med?.name || pr.mediaId}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            {med?.location} ({med?.type})
                          </div>
                        </td>

                        {/* Client */}
                        <td className="py-3.5 px-5 font-semibold text-slate-200">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>{cli?.name || pr.clientId}</span>
                          </div>
                          {cli && <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{cli.code}</div>}
                        </td>

                        {/* Rate Type Badge */}
                        <td className="py-3.5 px-5">
                          {isCatalog ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                              <Tag className="w-3 h-3" /> Prix Catalogue (Client)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <Eye className="w-3 h-3" /> Coût Réel (BTL)
                            </span>
                          )}
                        </td>

                        {/* Rate Amount */}
                        <td className="py-3.5 px-5 text-right font-mono font-extrabold text-sm">
                          {isAdmin ? (
                            <div className="inline-block">
                              <NumberWheelInput
                                value={pr.rateAmount}
                                onChange={(newVal) => updatePricingRate(pr.mediaId, pr.clientId, pr.rateType, newVal)}
                                prefix="$"
                              />
                            </div>
                          ) : (
                            <span className={isCatalog ? 'text-blue-300' : 'text-emerald-300'}>
                              ${pr.rateAmount.toLocaleString()}
                            </span>
                          )}
                        </td>

                        {/* Effective Date */}
                        <td className="py-3.5 px-5 font-mono text-slate-300 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{pr.effectiveDate}</span>
                          </div>
                        </td>

                        {/* Admin Action */}
                        {isAdmin && (
                          <td className="py-3.5 px-5 text-center">
                            <button
                              onClick={() => handleOpenAddModal(pr.mediaId, pr.clientId)}
                              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 transition-all"
                              title="Ajuster le couple de tarifs Catalogue / Réel"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal to add or edit dual rates (Catalog + Real) for a Media-Client Pair */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg p-6 bg-slate-900 border border-white/20 rounded-3xl shadow-2xl space-y-5 text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">Définir les Tarifs (Catalogue & Réel)</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalRates} className="space-y-4">
              {/* Media Select */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Média Concerné</label>
                <select
                  value={modalMediaId}
                  onChange={(e) => {
                    setModalMediaId(e.target.value);
                    const cat = pricingRates.find((p) => p.mediaId === e.target.value && p.clientId === modalClientId && p.rateType === 'catalog');
                    const rel = pricingRates.find((p) => p.mediaId === e.target.value && p.clientId === modalClientId && p.rateType === 'real');
                    if (cat) setModalCatalogRate(cat.rateAmount);
                    if (rel) setModalRealRate(rel.rateAmount);
                  }}
                  className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
                >
                  {medias.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.location} - {m.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Select */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Client (Annonceur)</label>
                <select
                  value={modalClientId}
                  onChange={(e) => {
                    setModalClientId(e.target.value);
                    const cat = pricingRates.find((p) => p.mediaId === modalMediaId && p.clientId === e.target.value && p.rateType === 'catalog');
                    const rel = pricingRates.find((p) => p.mediaId === modalMediaId && p.clientId === e.target.value && p.rateType === 'real');
                    if (cat) setModalCatalogRate(cat.rateAmount);
                    if (rel) setModalRealRate(rel.rateAmount);
                  }}
                  className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-cyan-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Prix Catalogue Client */}
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1.5">
                  <label className="block text-[11px] font-bold text-blue-300">Prix Catalogue ($)</label>
                  <p className="text-[10px] text-slate-400">Tarif officiel facturé au client</p>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={modalCatalogRate}
                    onChange={(e) => setModalCatalogRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-blue-500/40 rounded-xl text-sm font-bold text-white outline-none"
                  />
                </div>

                {/* Prix Réel Coût BTL */}
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                  <label className="block text-[11px] font-bold text-emerald-300">Coût Réel BTL ($)</label>
                  <p className="text-[10px] text-slate-400">Coût d'acquisition réel négocié</p>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={modalRealRate}
                    onChange={(e) => setModalRealRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-950 border border-emerald-500/40 rounded-xl text-sm font-bold text-white outline-none"
                  />
                </div>
              </div>

              {/* Calculated Margin summary */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-sans">Marge brute BTL issue du barème:</span>
                <span className={`font-extrabold ${modalCatalogRate - modalRealRate >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  ${(modalCatalogRate - modalRealRate).toLocaleString()} (
                  {modalCatalogRate > 0 ? (((modalCatalogRate - modalRealRate) / modalCatalogRate) * 100).toFixed(0) : '0'}%)
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all"
                >
                  Enregistrer les 2 Tarifs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
