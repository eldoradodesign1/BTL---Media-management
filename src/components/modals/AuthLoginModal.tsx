import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Mail,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Database
} from 'lucide-react';

export const AuthLoginModal: React.FC = () => {
  const {
    users,
    login,
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    isSupabaseConnected
  } = useApp();

  const [selectedEmail, setSelectedEmail] = useState(currentUser?.email || users[0]?.email || '');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await login(selectedEmail, password);
      if (res.success) {
        setIsAuthModalOpen(false);
      } else {
        setErrorMsg(res.message || 'Identifiants invalides');
      }
    } catch (err: any) {
      setErrorMsg('Erreur lors de la tentative de connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectUser = (u: typeof users[0]) => {
    setSelectedEmail(u.email);
    setPassword(u.password || '123456');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-blue-500/30 rounded-3xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Glowing Ambient Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="p-8 pb-6 border-b border-white/10 text-center relative z-10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 ring-2 ring-white/20">
            <Zap className="w-7 h-7 fill-current" />
          </div>

          <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>Connexion & Authentification</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Accédez aux données de campagne média synchronisées sur Supabase
          </p>

          {isSupabaseConnected ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold mt-3">
              <Database className="w-3.5 h-3.5" />
              <span>Base Supabase Connectée ({users.length} comptes)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-semibold mt-3">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Mode Démo Local</span>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-6 relative z-10">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Select Supabase User */}
          {users.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Sélectionner un compte enregistré dans Supabase :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                {users.map((u) => {
                  const isSelected = selectedEmail.toLowerCase() === u.email.toLowerCase();
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => handleSelectUser(u)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white/20"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden text-left flex-1">
                        <div className="font-semibold text-xs truncate text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Mot de passe
                </label>
                <span className="text-[10px] text-slate-400">
                  Par défaut : <code className="px-1 bg-white/10 rounded">123456</code>
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white text-xs font-extrabold transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <span>Se Connecter à l'Application</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-white/10 text-center text-[11px] text-slate-400 flex items-center justify-between px-6">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Session protégée
          </span>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="text-slate-400 hover:text-white underline text-[11px]"
          >
            Fermer sans changer
          </button>
        </div>
      </div>
    </div>
  );
};
