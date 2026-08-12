import React from 'react';
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Radio,
  Settings2,
  SlidersHorizontal,
  Tv,
  WalletCards,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, events, mediaPayments } = useApp();
  const { t } = useI18n();

  const primaryItems = [
    { id: 'dashboard', label: t('nav.overview'), icon: LayoutDashboard },
    { id: 'events', label: t('nav.campaigns'), icon: CalendarDays, badge: events.length },
    { id: 'payments', label: t('nav.payments'), icon: WalletCards, badge: mediaPayments.length },
    { id: 'medias', label: t('nav.media'), icon: Radio },
  ];

  const secondaryItems = [
    { id: 'diffusions', label: t('nav.diffusions'), icon: Tv },
    { id: 'pricing', label: t('nav.pricing'), icon: CreditCard },
    { id: 'clients', label: t('nav.directory'), icon: SlidersHorizontal },
    { id: 'settings', label: t('nav.settings'), icon: Settings2 },
  ];

  const renderItem = (item: typeof primaryItems[number]) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{item.label}</span>
        {'badge' in item && typeof item.badge === 'number' && item.badge > 0 && <span className="sidebar-link__badge">{item.badge}</span>}
      </button>
    );
  };

  return (
    <aside className="sidebar" aria-label={t('nav.workspace')}>
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark" aria-hidden="true">B</div>
        <div>
          <p className="sidebar__brand-name">{t('brand.name')}</p>
          <p className="sidebar__brand-subtitle">{t('brand.subtitle')}</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        <p className="sidebar__label">{t('nav.workspace')}</p>
        <div className="sidebar__group">{primaryItems.map(renderItem)}</div>
        <p className="sidebar__label sidebar__label--secondary">{t('nav.more')}</p>
        <div className="sidebar__group">{secondaryItems.map(renderItem)}</div>
      </nav>

      <div className="sidebar__footer">
        <span className="sidebar__status-dot" aria-hidden="true" />
        <span>{t('status.connected')}</span>
      </div>
    </aside>
  );
};
