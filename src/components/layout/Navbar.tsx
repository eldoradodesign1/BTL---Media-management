import React, { useMemo, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Database,
  Globe2,
  LogOut,
  Moon,
  Search,
  Sun,
  UserRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { UserRole } from '../../types';

interface NavbarProps {
  onOpenExportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const {
    theme,
    setTheme,
    currentUser,
    globalSearchQuery,
    setGlobalSearchQuery,
    setIsSupabaseModalOpen,
    isSupabaseConnected,
    notifications,
    setIsProfileModalOpen,
    setIsAuthModalOpen,
    logout,
  } = useApp();
  const { language, setLanguage, t } = useI18n();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const roleLabel = useMemo(() => {
    const roles: Record<UserRole, string> = {
      'super-admin': t('account.superAdmin'),
      admin: t('account.admin'),
      media_manager: t('account.mediaManager'),
      finance: t('account.finance'),
      auditor: t('account.auditor'),
      client: t('account.client'),
    };
    return roles[currentUser.role] || t('account.user');
  }, [currentUser.role, t]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <header className="topbar">
      <div className="topbar__search">
        <Search className="topbar__search-icon" aria-hidden="true" />
        <input
          id="global-search-input"
          type="search"
          value={globalSearchQuery}
          onChange={(event) => setGlobalSearchQuery(event.target.value)}
          placeholder={t('shell.search')}
          aria-label={t('shell.search')}
        />
        <kbd className="topbar__shortcut">⌘ K</kbd>
      </div>

      <div className="topbar__actions">
        {currentUser.role === 'super-admin' && (
          <button
            type="button"
            className={`icon-button ${isSupabaseConnected ? 'icon-button--success' : ''}`}
            onClick={() => setIsSupabaseModalOpen(true)}
            title={isSupabaseConnected ? t('status.connected') : t('status.disconnected')}
            aria-label={isSupabaseConnected ? t('status.connected') : t('status.disconnected')}
          >
            <Database className="h-4 w-4" />
          </button>
        )}

        <div className="language-switch" aria-label={t('language.selector')}>
          <Globe2 className="h-4 w-4" aria-hidden="true" />
          <button type="button" className={language === 'fr' ? 'language-switch__option language-switch__option--active' : 'language-switch__option'} onClick={() => setLanguage('fr')} aria-pressed={language === 'fr'}>FR</button>
          <button type="button" className={language === 'en' ? 'language-switch__option language-switch__option--active' : 'language-switch__option'} onClick={() => setLanguage('en')} aria-pressed={language === 'en'}>EN</button>
        </div>

        <button type="button" className="icon-button" onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'} aria-label={theme === 'light' ? 'Dark mode' : 'Light mode'}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        <div className="topbar__popover-anchor">
          <button type="button" className="icon-button icon-button--notification" onClick={() => setIsNotifOpen((open) => !open)} aria-label={t('shell.notifications')} aria-expanded={isNotifOpen}>
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
          </button>
          {isNotifOpen && (
            <div className="glass-popover glass-popover--notifications">
              <div className="glass-popover__heading">
                <span>{t('shell.notifications')}</span>
                <span>{notifications.length}</span>
              </div>
              {notifications.length > 0 ? (
                <div className="notification-list">
                  {notifications.slice(0, 5).map((notification) => (
                    <article key={notification.id} className="notification-item">
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                    </article>
                  ))}
                </div>
              ) : <p className="empty-message">{t('status.noNotifications')}</p>}
            </div>
          )}
        </div>

        <div className="topbar__popover-anchor">
          <button type="button" className="profile-trigger" onClick={() => setIsUserMenuOpen((open) => !open)} aria-expanded={isUserMenuOpen} aria-label={t('shell.account')}>
            {currentUser.avatar ? <img src={currentUser.avatar} alt="" className="profile-trigger__avatar" referrerPolicy="no-referrer" /> : <UserRound className="h-4 w-4" />}
            <span className="profile-trigger__meta">
              <strong>{currentUser.name}</strong>
              <small>{roleLabel}</small>
            </span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
          {isUserMenuOpen && (
            <div className="glass-popover glass-popover--profile">
              <div className="profile-summary">
                {currentUser.avatar ? <img src={currentUser.avatar} alt="" referrerPolicy="no-referrer" /> : <UserRound className="h-5 w-5" />}
                <div><strong>{currentUser.name}</strong><span>{currentUser.email}</span></div>
              </div>
              <div className="profile-menu">
                <button type="button" onClick={() => { setIsProfileModalOpen(true); setIsUserMenuOpen(false); }}><UserRound className="h-4 w-4" />{t('account.profile')}</button>
                <button type="button" onClick={() => { setIsAuthModalOpen(true); setIsUserMenuOpen(false); }}><Database className="h-4 w-4" />{t('account.signIn')}</button>
              </div>
              <button type="button" className="profile-menu__signout" onClick={() => { setIsUserMenuOpen(false); logout(); }}><LogOut className="h-4 w-4" />{t('account.signOut')}</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
