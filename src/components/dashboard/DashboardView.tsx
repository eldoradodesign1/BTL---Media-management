import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Landmark,
  Radio,
  WalletCards,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';

export const DashboardView: React.FC = () => {
  const { clients, currentUser, events, mediaByEvents, mediaPayments, purchaseOrders, setActiveTab } = useApp();
  const { formatCurrency, formatDate, locale, t } = useI18n();
  const isClientRole = currentUser.role === 'client';
  const defaultClient = isClientRole ? currentUser.clientId || clients[0]?.id || 'all' : 'all';
  const [selectedClientId, setSelectedClientId] = useState(defaultClient);

  const scopedEvents = useMemo(() => events.filter((event) => selectedClientId === 'all' || event.clientId === selectedClientId), [events, selectedClientId]);
  const scopedEventIds = useMemo(() => new Set(scopedEvents.map((event) => event.id)), [scopedEvents]);
  const scopedMediaEvents = useMemo(() => mediaByEvents.filter((item) => scopedEventIds.has(item.eventId)), [mediaByEvents, scopedEventIds]);
  const scopedPayments = useMemo(() => mediaPayments.filter((payment) => {
    if (selectedClientId === 'all') return scopedEventIds.has(payment.eventId);
    return payment.clientId === selectedClientId || scopedEventIds.has(payment.eventId);
  }), [mediaPayments, scopedEventIds, selectedClientId]);
  const scopedPOs = useMemo(() => purchaseOrders.filter((order) => selectedClientId === 'all' || order.clientId === selectedClientId), [purchaseOrders, selectedClientId]);

  const metrics = useMemo(() => {
    const budgetReceived = scopedPOs.reduce((sum, order) => sum + order.amount, 0);
    const paymentsExecuted = scopedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const mediaBalance = scopedMediaEvents.reduce((sum, item) => sum + item.pending, 0);
    const activeCampaigns = scopedEvents.filter((event) => event.status !== 'Terminé' && event.status !== 'Annulé').length;
    return { budgetReceived, paymentsExecuted, mediaBalance, activeCampaigns };
  }, [scopedEvents, scopedMediaEvents, scopedPOs, scopedPayments]);

  const trend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index), 1);
      return { key: `${date.getFullYear()}-${date.getMonth()}`, label: new Intl.DateTimeFormat(locale, { month: 'short' }).format(date), commitment: 0, paid: 0 };
    });
    const byKey = new Map(months.map((month) => [month.key, month]));
    scopedMediaEvents.forEach((item) => {
      const event = events.find((candidate) => candidate.id === item.eventId);
      const date = new Date(item.eventDate || event?.eventDate || '');
      const match = byKey.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (match) match.commitment += item.amount;
    });
    scopedPayments.forEach((payment) => {
      const date = new Date(payment.paymentDate);
      const match = byKey.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (match) match.paid += payment.amount;
    });
    const max = Math.max(1, ...months.flatMap((month) => [month.commitment, month.paid]));
    return { months, max };
  }, [events, locale, scopedMediaEvents, scopedPayments]);

  const recentCampaigns = useMemo(() => [...scopedEvents]
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    .slice(0, 5), [scopedEvents]);

  const campaignTotals = useMemo(() => new Map(scopedMediaEvents.reduce((result, item) => {
    const current = result.get(item.eventId) || { commitment: 0, paid: 0, remaining: 0 };
    current.commitment += item.amount;
    current.paid += item.paid;
    current.remaining += item.pending;
    result.set(item.eventId, current);
    return result;
  }, new Map<string, { commitment: number; paid: number; remaining: number }>())), [scopedMediaEvents]);

  const metricCards = [
    { label: t('dashboard.receivedBudget'), hint: t('dashboard.receivedBudgetHint'), value: formatCurrency(metrics.budgetReceived), icon: Landmark, tone: 'violet' },
    { label: t('dashboard.executedPayments'), hint: t('dashboard.executedPaymentsHint'), value: formatCurrency(metrics.paymentsExecuted), icon: CreditCard, tone: 'blue' },
    { label: t('dashboard.mediaBalance'), hint: t('dashboard.mediaBalanceHint'), value: formatCurrency(metrics.mediaBalance), icon: WalletCards, tone: 'rose' },
    { label: t('dashboard.activeCampaigns'), hint: t('dashboard.activeCampaignsHint'), value: String(metrics.activeCampaigns), icon: CalendarDays, tone: 'mint' },
  ];

  return (
    <section className="dashboard">
      <header className="dashboard-hero glass-card">
        <div>
          <p className="eyebrow">{t('dashboard.eyebrow')}</p>
          <h1>{t('dashboard.title')}</h1>
          <p className="dashboard-hero__description">{t('dashboard.subtitle')}</p>
        </div>
        <div className="dashboard-hero__controls">
          <label className="field-label" htmlFor="client-scope">{t('dashboard.client')}</label>
          <select id="client-scope" value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)} disabled={isClientRole} className="select-control">
            {!isClientRole && <option value="all">{t('dashboard.allClients')}</option>}
            {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
          </select>
        </div>
      </header>

      <div className="metric-grid">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <article className={`metric-card metric-card--${card.tone}`} key={card.label}>
              <div className="metric-card__icon"><Icon className="h-5 w-5" /></div>
              <p>{card.label}</p>
              <strong>{card.value}</strong>
              <span>{card.hint}</span>
            </article>
          );
        })}
      </div>

      <div className="dashboard-content-grid">
        <article className="glass-card payment-progress">
          <div className="section-heading">
            <div><h2>{t('dashboard.progress')}</h2><p>{t('dashboard.progressHint')}</p></div>
            <span className="period-pill">{t('dashboard.currentPeriod')}</span>
          </div>
          <div className="trend-legend">
            <span><i className="trend-legend__dot trend-legend__dot--commitment" />{t('dashboard.chartCommitment')}</span>
            <span><i className="trend-legend__dot trend-legend__dot--paid" />{t('dashboard.chartPaid')}</span>
          </div>
          <div className="trend-chart" role="img" aria-label={t('dashboard.progress')}>
            {trend.months.map((month) => (
              <div className="trend-chart__month" key={month.key}>
                <div className="trend-chart__bars">
                  <span className="trend-chart__bar trend-chart__bar--commitment" style={{ height: `${Math.max(4, (month.commitment / trend.max) * 100)}%` }} title={t('dashboard.chartCommitment') + ': ' + formatCurrency(month.commitment)} />
                  <span className="trend-chart__bar trend-chart__bar--paid" style={{ height: `${Math.max(4, (month.paid / trend.max) * 100)}%` }} title={t('dashboard.chartPaid') + ': ' + formatCurrency(month.paid)} />
                </div>
                <span>{month.label}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="glass-card quick-actions">
          <div className="section-heading"><div><h2>{t('dashboard.actions')}</h2><p>{t('dashboard.currentPeriod')}</p></div></div>
          <button type="button" className="quick-action quick-action--primary" onClick={() => setActiveTab('payments')}><CreditCard className="h-4 w-4" />{t('dashboard.addPayment')}<ArrowUpRight className="h-4 w-4" /></button>
          <button type="button" className="quick-action" onClick={() => setActiveTab('events')}><CalendarDays className="h-4 w-4" />{t('dashboard.manageCampaigns')}<ArrowUpRight className="h-4 w-4" /></button>
          <button type="button" className="quick-action" onClick={() => setActiveTab('medias')}><Radio className="h-4 w-4" />{t('dashboard.manageMedia')}<ArrowUpRight className="h-4 w-4" /></button>
        </aside>
      </div>

      <article className="glass-card campaign-table-card">
        <div className="section-heading"><div><h2>{t('dashboard.recentCampaigns')}</h2><p>{t('dashboard.recentCampaignsHint')}</p></div></div>
        {recentCampaigns.length > 0 ? (
          <div className="campaign-table-wrap">
            <table className="campaign-table">
              <thead><tr><th>{t('dashboard.campaign')}</th><th>{t('dashboard.clientColumn')}</th><th>{t('dashboard.date')}</th><th>{t('dashboard.commitment')}</th><th>{t('dashboard.paid')}</th><th>{t('dashboard.remaining')}</th></tr></thead>
              <tbody>
                {recentCampaigns.map((campaign) => {
                  const totals = campaignTotals.get(campaign.id) || { commitment: 0, paid: 0, remaining: 0 };
                  return <tr key={campaign.id}><td><button type="button" onClick={() => setActiveTab('events')} className="campaign-table__name">{campaign.name}</button></td><td>{campaign.clientName || '—'}</td><td>{formatDate(campaign.eventDate)}</td><td>{formatCurrency(totals.commitment)}</td><td>{formatCurrency(totals.paid)}</td><td><span className={totals.remaining > 0 ? 'amount-pending' : 'amount-settled'}>{formatCurrency(totals.remaining)}</span></td></tr>;
                })}
              </tbody>
            </table>
          </div>
        ) : <p className="empty-message empty-message--large">{t('dashboard.noCampaigns')}</p>}
      </article>
    </section>
  );
};
