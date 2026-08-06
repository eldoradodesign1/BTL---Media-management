import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Command,
  Keyboard,
  Bell,
  Sun,
  Moon,
  Sparkles,
  UserCheck,
  ShieldAlert,
  ChevronDown,
  Check,
  Save,
  Download,
  Database,
  User as UserIcon,
  LogOut,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenExportModal }) => {
  const {
    theme,
    setTheme,
    currentUser,
    setCurrentUser,
    users,
    globalSearchQuery,
    setGlobalSearchQuery,
    setIsCommandPaletteOpen,
    setIsShortcutsModalOpen,
    setIsSupabaseModalOpen,
    isSupabaseConnected,
    notifications,
    triggerManualSave,
    setIsProfileModalOpen,
    setIsAuthModalOpen,
    logout,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super-admin':
        return { label: 'Super Admin', color: 'bg-purple-500/25 text-purple-300 border-purple-500/40' };
      case 'admin':
        return { label: 'Admin Général', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'media_manager':
        return { label: 'Resp. Média BTL', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'finance':
        return { label: 'Resp. Finance BTL', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'auditor':
        return { label: 'Auditeur (Lecture)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'client':
        return { label: 'Utilisateur Client', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      default:
        return { label: 'Utilisateur', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-2 z-40 w-full backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-3 px-4 flex items-center justify-between text-slate-100 shadow-2xl transition-all">
      {/* Left Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Rechercher événements, médias, clients... (Ctrl+F)"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-1.5 bg-slate-950/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 bg-white/10 border border-white/10 rounded text-slate-400 pointer-events-none">
            Ctrl+F
          </kbd>
        </div>

        {/* Command Palette Trigger Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-200 transition-all shadow-sm shrink-0"
          title="Ouvrir la palette de commandes (Ctrl+K)"
        >
          <Command className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">Commandes</span>
          <kbd className="text-[10px] font-mono px-1 bg-black/40 border border-white/10 rounded text-blue-300">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Tools & Profile */}
      <div className="flex items-center gap-2">
        {/* Quick Save */}
        <button
          onClick={triggerManualSave}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
          title="Sauvegarder immédiatement (Ctrl+S)"
        >
          <Save className="w-4 h-4 text-emerald-400" />
        </button>

        {/* Supabase Status & Config Button (SuperAdmin Only) vs Standard Sync Button */}
        {currentUser.role === 'super-admin' ? (
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm border ${
              isSupabaseConnected
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40 text-amber-300'
            }`}
            title="Gérer la connexion Supabase PostgreSQL (SuperAdmin)"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Supabase DB</span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          </button>
        ) : (
          <button
            onClick={async () => {
              const ok = await useApp().syncFromSupabase();
              if (ok) {
                useApp().addNotification({
                  type: 'success',
                  title: 'Actualisation',
                  message: 'Les données ont été synchronisées avec la base de données.'
                });
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm border bg-slate-800/60 hover:bg-slate-800 border-white/15 text-slate-200"
            title="Actualiser et synchroniser les données"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        )}

        {/* Export Button */}
        <button
          onClick={onOpenExportModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-semibold transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Excel/PDF</span>
        </button>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={() => setIsShortcutsModalOpen(true)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
          title="Voir tous les raccourcis clavier & molette"
        >
          <Keyboard className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Theme Selector */}
        <div className="flex items-center bg-black/40 border border-white/15 p-0.5 rounded-xl">
          <button
            onClick={() => setTheme('dark')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              theme === 'dark' ? 'bg-cyan-500/30 text-cyan-200 shadow-inner' : 'text-slate-400 hover:text-white'
            }`}
            title="Thème Dark (Bleu Nuit + Fumée Bleue)"
          >
            <Moon className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Dark</span>
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              theme === 'light' ? 'bg-sky-500/30 text-sky-200 shadow-inner' : 'text-slate-400 hover:text-white'
            }`}
            title="Thème Light (Blanc Cassé + Papier Pastel)"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Light</span>
          </button>
          <button
            onClick={() => setTheme('classic')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              theme === 'classic' ? 'bg-indigo-500/30 text-indigo-200 shadow-inner' : 'text-slate-400 hover:text-white'
            }`}
            title="Thème Classic (Microsoft Fluent Geometric)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Classic</span>
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 relative transition-all"
          >
            <Bell className="w-4 h-4 text-amber-400" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl p-3 z-50 text-slate-200 backdrop-blur-2xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-2 px-1 flex items-center justify-between">
                <span>Notifications système</span>
                <span className="text-[10px] text-slate-400">{notifications.length} actives</span>
              </div>
              {notifications.length === 0 ? (
                <div className="text-xs text-slate-400 py-4 text-center">Aucune alerte en attente</div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2 rounded-xl bg-white/5 border border-white/10 text-xs">
                      <div className="font-semibold text-white">{n.title}</div>
                      <div className="text-slate-300 text-[11px] mt-0.5">{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 transition-all text-xs"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-white/30"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block text-left">
              <div className="font-semibold text-white leading-none">{currentUser.name}</div>
              <span className={`inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded-md border ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 border border-white/20 rounded-2xl shadow-2xl p-2 z-50 text-slate-200 backdrop-blur-2xl">
              {/* User Header Info */}
              <div className="p-3 mb-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-xl object-cover ring-1 ring-blue-400" referrerPolicy="no-referrer" />
                <div className="overflow-hidden">
                  <div className="font-bold text-white text-xs truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentUser.email}</div>
                  <span className={`inline-block mt-1 px-1.5 py-0.2 text-[9px] font-bold rounded border ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1 mb-2">
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition-all text-left"
                >
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span>Mon Profil & Photo</span>
                </button>

                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-white/10 transition-all text-left"
                >
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Authentificateur / Connexion</span>
                </button>
              </div>

              <div className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400 px-3 py-1 mt-2 border-t border-white/10 flex items-center justify-between">
                <span>Comptes enregistrés ({users.length})</span>
                {currentUser.role !== 'super-admin' && (
                  <span className="text-[9px] text-amber-400 font-normal">Mot de passe requis</span>
                )}
              </div>
              <div className="space-y-1 mt-1 max-h-48 overflow-y-auto pr-1">
                {users.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        if (currentUser.role === 'super-admin') {
                          setCurrentUser(u);
                        } else {
                          setIsAuthModalOpen(true);
                        }
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all text-left ${
                        isSelected ? 'bg-cyan-500/20 border border-cyan-500/40 text-white font-semibold' : 'hover:bg-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                        <div className="truncate">
                          <div className="font-medium text-white truncate text-[11px]">{u.name}</div>
                          <span className={`text-[8px] px-1 py-0.2 rounded border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
