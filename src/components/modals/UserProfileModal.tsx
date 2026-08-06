import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User as UserIcon,
  Mail,
  Lock,
  Key,
  ShieldCheck,
  Building2,
  Camera,
  Check,
  Sparkles,
  Upload,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    updateUserProfile,
    isProfileModalOpen,
    setIsProfileModalOpen,
    clients
  } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [password, setPassword] = useState(currentUser?.password || '123456');
  const [confirmPassword, setConfirmPassword] = useState(currentUser?.password || '123456');
  const [clientId, setClientId] = useState(currentUser?.clientId || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'permissions'>('profile');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isProfileModalOpen || !currentUser) return null;

  // Preset avatar templates
  const presetAvatars = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'Michael')}`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email || 'Sam')}`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=EldoMaster`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=MediaLead`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=MediaBot`
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setStatusMessage({ type: 'error', text: 'Image trop lourde. Veuillez choisir une image de moins de 2 Mo.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
          setStatusMessage({ type: 'success', text: 'Photo de profil chargée !' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Le nom complet est obligatoire.' });
      return;
    }

    if (!email.trim()) {
      setStatusMessage({ type: 'error', text: "L'adresse email est obligatoire." });
      return;
    }

    if (password !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setIsSaving(true);

    try {
      const res = await updateUserProfile({
        name,
        email,
        avatar,
        password,
        clientId: clientId || undefined
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
        setTimeout(() => {
          setIsProfileModalOpen(false);
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: res.message || 'Erreur de sauvegarde' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erreur inattendue.' });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super-admin': return 'Super Administrateur';
      case 'admin': return 'Administrateur Général';
      case 'finance': return 'Responsable Financier';
      case 'media_manager': return 'Responsable Média';
      case 'client': return 'Client / Annonceur';
      case 'auditor': return 'Auditeur';
      default: return role;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={avatar || currentUser.avatar}
                alt={name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/50 shadow-lg"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-lg text-white text-[10px]">
                <Sparkles className="w-3 h-3" />
              </span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                Espace Profil & Compte
              </h2>
              <p className="text-xs text-slate-400">
                Gérez votre identité, votre photo de profil et vos accès Supabase
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 px-6 bg-slate-900/50 text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            Profil & Photo
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Sécurité & Mot de Passe
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-3 font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'permissions'
                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Rôle & Permissions
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {statusMessage && (
            <div
              className={`p-3 rounded-2xl text-xs font-medium border flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <X className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Photo de Profil / Avatar
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <img
                    src={avatar || presetAvatars[0]}
                    alt="Preview"
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-500/40 shadow-xl"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md">
                        <Upload className="w-3.5 h-3.5" />
                        Charger une image
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                      <button
                        type="button"
                        onClick={() => setAvatar(presetAvatars[Math.floor(Math.random() * presetAvatars.length)])}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Avatar Aléatoire
                      </button>
                    </div>
                    <div>
                      <input
                        type="url"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="Ou coller un lien URL d'image (https://...)"
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Avatars Gallery */}
                <div className="mt-3">
                  <span className="text-[11px] text-slate-400">Ou choisissez parmi nos suggestions :</span>
                  <div className="flex gap-2 mt-1.5 overflow-x-auto pb-1">
                    {presetAvatars.map((url, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setAvatar(url)}
                        className={`p-1 rounded-xl border transition-all ${
                          avatar === url ? 'border-blue-500 ring-2 ring-blue-500/50 bg-blue-500/20' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx}`} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom Complet / Intitulé
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="Ex: Michael Bradley"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Adresse Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="michael@example.com"
                  />
                </div>
              </div>

              {/* Client Linking */}
              {currentUser.role === 'client' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Client Rattaché (Annonceur)
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <select
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Aucun / Tous les accès --</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
                <Key className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <p className="font-semibold">Authentification Supabase</p>
                  <p className="text-[11px] text-blue-200/80 mt-0.5">
                    Modifiez le mot de passe associé à votre compte dans la table <code className="px-1 py-0.5 bg-blue-900/50 rounded">users</code> de votre base Supabase.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nouveau Mot de Passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="Saisissez un nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirmer le Nouveau Mot de Passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500"
                    placeholder="Répétez le mot de passe"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Rôle Actuel :</span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Identifiant Unique (UUID) :</span>
                  <span className="text-[11px] font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded">
                    {currentUser.id}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Capacités attribuées :</span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Accès complet aux données médias et événements de la plateforme.</span>
                  </li>
                  <li className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mise à jour directe du profil et de l'avatar utilisateur.</span>
                  </li>
                  <li className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Moteur de calcul tarifaire et enregistrement d'audit.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Enregistrer sur Supabase
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
