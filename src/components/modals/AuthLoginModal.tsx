import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  Phone,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  HelpCircle,
  KeyRound,
  ArrowLeft,
  UserRound,
} from 'lucide-react';

const roleLabel: Record<string, string> = {
  'super-admin': 'Superadmin',
  admin: 'Admin',
  sub_admin: 'Coordinateur',
  supervisor: 'Superviseur',
  operations: 'Opérations',
};

export const AuthLoginModal: React.FC = () => {
  const {
    users,
    login,
    requestPasswordReset,
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
    isSupabaseConnected,
  } = useApp();

  const [identifier, setIdentifier] = useState(currentUser?.phone || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotReason, setForgotReason] = useState('');

  const visibleUsers = useMemo(() => users.filter((user) => user.phone), [users]);
  const selectedUser = visibleUsers.find((user) => user.phone === identifier);

  if (!isAuthModalOpen) return null;

  const resetMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!identifier.trim() || !password) {
      setErrorMsg('Saisissez votre téléphone ou sélectionnez votre avatar, puis votre mot de passe.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await login(identifier, password);
      if (result.success) {
        setIsAuthModalOpen(false);
      } else {
        setErrorMsg(result.message || 'Identifiants invalides.');
      }
    } catch {
      setErrorMsg('Erreur lors de la tentative de connexion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset(forgotIdentifier, forgotReason);
      setSuccessMsg(result.message || 'Votre demande a bien été transmise.');
      setForgotReason('');
    } catch {
      setErrorMsg('Erreur lors de l’envoi de la demande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectUser = (phone: string) => {
    setIdentifier(phone);
    setPassword('');
    resetMessages();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl shadow-2xl text-slate-100 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-300/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-200/5 rounded-full blur-3xl pointer-events-none" />

        <div className="p-7 pb-5 border-b border-white/10 text-center relative z-10">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-200 to-teal-200 flex items-center justify-center text-slate-900 ring-1 ring-white/30">
            {isForgotMode ? <KeyRound className="w-7 h-7" /> : <Zap className="w-7 h-7 fill-current" />}
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {isForgotMode ? 'Demander un nouvel accès' : 'Accès à BTL Media'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isForgotMode
              ? 'Envoyez une demande au Superadmin avec votre numéro de téléphone.'
              : 'Sélectionnez votre avatar ou connectez-vous avec votre téléphone.'}
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[11px] font-semibold mt-3">
            {isSupabaseConnected ? <Database className="w-3.5 h-3.5 text-[var(--btl-mint)]" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-300" />}
            <span>{isSupabaseConnected ? `${users.length} comptes d’accès disponibles` : 'Connexion aux bases en cours'}</span>
          </div>
        </div>

        <div className="p-7 space-y-5 relative z-10">
          {errorMsg && <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-400/20 text-rose-200 text-xs font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span></div>}
          {successMsg && <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-200 text-xs font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{successMsg}</span></div>}

          {!isForgotMode ? (
            <>
              {visibleUsers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">Accès rapides</label>
                    <span className="text-[10px] text-slate-500">{visibleUsers.length} comptes</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {visibleUsers.map((user) => {
                      const isSelected = selectedUser?.id === user.id;
                      return (
                        <button
                          type="button"
                          key={user.id}
                          onClick={() => handleSelectUser(user.phone || '')}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-colors ${isSelected ? 'bg-violet-300/12 border-violet-200/40 text-white' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] text-slate-300'}`}
                        >
                          <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-white/15" referrerPolicy="no-referrer" />
                          <span className="overflow-hidden min-w-0">
                            <span className="block font-semibold text-[11px] truncate text-white">{user.name}</span>
                            <span className="block text-[9px] text-slate-500 truncate">{roleLabel[user.role] || user.role}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input type="tel" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="08XXXXXXXX" className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-violet-200/60" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Mot de passe</label>
                    <button type="button" onClick={() => { setForgotIdentifier(identifier); setIsForgotMode(true); resetMessages(); }} className="text-[11px] text-slate-400 hover:text-white underline">Accès oublié ?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-violet-200/60" />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-slate-500 hover:text-slate-300">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-200 to-teal-200 hover:from-violet-100 hover:to-teal-100 text-slate-950 text-xs font-extrabold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
                  <span>{isSubmitting ? 'Connexion…' : 'Se connecter'}</span><ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone ou identifiant</label>
                <div className="relative"><Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" /><input type="tel" required value={forgotIdentifier} onChange={(e) => setForgotIdentifier(e.target.value)} placeholder="08XXXXXXXX" className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-violet-200/60" /></div>
              </div>
              <textarea rows={3} value={forgotReason} onChange={(e) => setForgotReason(e.target.value)} placeholder="Motif ou message au Superadmin (optionnel)" className="w-full p-3 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:outline-none focus:border-violet-200/60" />
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => { setIsForgotMode(false); resetMessages(); }} className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" />Retour</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-extrabold flex items-center justify-center gap-2"><HelpCircle className="w-4 h-4" />Envoyer la demande</button>
              </div>
            </form>
          )}
        </div>

        <div className="p-4 bg-slate-950/80 border-t border-white/10 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[var(--btl-mint)]" />Accès réservé aux équipes BTL autorisées</div>
        {isAuthenticatedSafe(currentUser?.id) && <button type="button" onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white" aria-label="Fermer"><UserRound className="w-4 h-4" /></button>}
      </div>
    </div>
  );
};

const isAuthenticatedSafe = (id: string | undefined) => Boolean(id && id !== 'anonymous');
