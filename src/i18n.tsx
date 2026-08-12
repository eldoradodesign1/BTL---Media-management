import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'fr' | 'en';

type TranslationValue = string | TranslationTree;
interface TranslationTree {
  [key: string]: TranslationValue;
}

const translations: Record<Language, TranslationTree> = {
  fr: {
    language: { french: 'Français', english: 'English', selector: 'Langue' },
    nav: {
      overview: 'Vue d’ensemble',
      campaigns: 'Campagnes',
      diffusions: 'Diffusions',
      payments: 'Paiements',
      media: 'Médias',
      directory: 'Répertoire',
      pricing: 'Tarifs',
      audit: 'Journal d’audit',
      settings: 'Paramètres',
      workspace: 'Espace de travail',
      more: 'Plus d’outils',
    },
    brand: { name: 'BTL Media', subtitle: 'Pilotage de campagnes' },
    shell: { search: 'Rechercher une campagne, un média ou un client…', command: 'Commandes', save: 'Enregistrer', export: 'Exporter', notifications: 'Notifications', account: 'Compte' },
    dashboard: {
      eyebrow: 'Vue financière',
      title: 'Suivi des campagnes',
      subtitle: 'Une lecture simple de vos budgets, paiements et engagements médias.',
      client: 'Périmètre client',
      allClients: 'Tous les clients',
      addPayment: 'Nouveau paiement',
      addPurchaseOrder: 'Enregistrer un PO',
      receivedBudget: 'Budget reçu',
      executedPayments: 'Paiements exécutés',
      mediaBalance: 'Solde médias',
      activeCampaigns: 'Campagnes actives',
      receivedBudgetHint: 'Ordres de paiement enregistrés',
      executedPaymentsHint: 'Montants réglés aux médias',
      mediaBalanceHint: 'Engagements restant à régler',
      activeCampaignsHint: 'Campagnes dans le périmètre',
      progress: 'Progression des paiements',
      progressHint: 'Comparaison des engagements et règlements sur les six derniers mois.',
      recentCampaigns: 'Campagnes récentes',
      recentCampaignsHint: 'Les cinq dernières campagnes du périmètre sélectionné.',
      campaign: 'Campagne',
      clientColumn: 'Client',
      date: 'Date',
      commitment: 'Engagé',
      paid: 'Payé',
      remaining: 'Reste',
      noCampaigns: 'Aucune campagne ne correspond à ce périmètre.',
      actions: 'Actions rapides',
      manageCampaigns: 'Gérer les campagnes',
      manageMedia: 'Gérer les médias',
      currentPeriod: 'Période actuelle',
      chartCommitment: 'Budget engagé',
      chartPaid: 'Paiements effectués',
    },
    events: { eyebrow: 'Registre des campagnes', title: 'Événements de campagne média', description: 'Regroupez les activités médias par annonceur, région et calendrier d’exécution.', create: 'Créer une campagne', all: 'Toutes les campagnes', scheduled: 'Planifiée', inProgress: 'En cours', completed: 'Terminée', cancelled: 'Annulée', total: 'Total', paid: 'Payé', remaining: 'Reste', diffusionCount: 'diffusions', editHint: 'Modifier cette campagne', deleteHint: 'Supprimer cette campagne', empty: 'Aucune campagne ne correspond à votre recherche.', deleteTitle: 'Supprimer la campagne', deleteMessage: 'Souhaitez-vous vraiment supprimer la campagne « {name} » ? Les diffusions et calculs associés seront également supprimés.', deleteConfirm: 'Oui, supprimer' },
    status: { connected: 'Synchronisé', disconnected: 'Hors ligne', noNotifications: 'Aucune notification récente', pending: 'En attente' },
    account: { profile: 'Mon profil', signIn: 'Connexion', signOut: 'Se déconnecter', savedAccounts: 'Comptes enregistrés', superAdmin: 'Super administrateur', admin: 'Administrateur', mediaManager: 'Responsable média', finance: 'Responsable finance', auditor: 'Auditeur', client: 'Utilisateur client', user: 'Utilisateur' },
    common: { close: 'Fermer', cancel: 'Annuler', save: 'Enregistrer', delete: 'Supprimer', edit: 'Modifier', loading: 'Chargement…', all: 'Tous', currency: 'USD' },
  },
  en: {
    language: { french: 'Français', english: 'English', selector: 'Language' },
    nav: {
      overview: 'Overview',
      campaigns: 'Campaigns',
      diffusions: 'Deliveries',
      payments: 'Payments',
      media: 'Media',
      directory: 'Directory',
      pricing: 'Rates',
      audit: 'Audit log',
      settings: 'Settings',
      workspace: 'Workspace',
      more: 'More tools',
    },
    brand: { name: 'BTL Media', subtitle: 'Campaign management' },
    shell: { search: 'Search a campaign, media outlet or client…', command: 'Commands', save: 'Save', export: 'Export', notifications: 'Notifications', account: 'Account' },
    dashboard: {
      eyebrow: 'Financial overview',
      title: 'Campaign monitoring',
      subtitle: 'A simple view of budgets, payments and media commitments.',
      client: 'Client scope',
      allClients: 'All clients',
      addPayment: 'New payment',
      addPurchaseOrder: 'Add purchase order',
      receivedBudget: 'Budget received',
      executedPayments: 'Payments made',
      mediaBalance: 'Media balance',
      activeCampaigns: 'Active campaigns',
      receivedBudgetHint: 'Recorded purchase orders',
      executedPaymentsHint: 'Amounts paid to media outlets',
      mediaBalanceHint: 'Outstanding media commitments',
      activeCampaignsHint: 'Campaigns in this scope',
      progress: 'Payment progress',
      progressHint: 'A comparison of commitments and payments over the last six months.',
      recentCampaigns: 'Recent campaigns',
      recentCampaignsHint: 'The five latest campaigns in the selected scope.',
      campaign: 'Campaign',
      clientColumn: 'Client',
      date: 'Date',
      commitment: 'Committed',
      paid: 'Paid',
      remaining: 'Remaining',
      noCampaigns: 'No campaigns match this scope.',
      actions: 'Quick actions',
      manageCampaigns: 'Manage campaigns',
      manageMedia: 'Manage media',
      currentPeriod: 'Current period',
      chartCommitment: 'Committed budget',
      chartPaid: 'Payments made',
    },
    events: { eyebrow: 'Campaign register', title: 'Media campaign events', description: 'Group media activities by advertiser, region and delivery schedule.', create: 'Create campaign', all: 'All campaigns', scheduled: 'Scheduled', inProgress: 'In progress', completed: 'Completed', cancelled: 'Cancelled', total: 'Total', paid: 'Paid', remaining: 'Remaining', diffusionCount: 'deliveries', editHint: 'Edit this campaign', deleteHint: 'Delete this campaign', empty: 'No campaigns match your search.', deleteTitle: 'Delete campaign', deleteMessage: 'Do you really want to delete “{name}”? Its deliveries and related calculations will also be deleted.', deleteConfirm: 'Yes, delete' },
    status: { connected: 'Synced', disconnected: 'Offline', noNotifications: 'No recent notifications', pending: 'Pending' },
    account: { profile: 'My profile', signIn: 'Sign in', signOut: 'Sign out', savedAccounts: 'Saved accounts', superAdmin: 'Super administrator', admin: 'Administrator', mediaManager: 'Media manager', finance: 'Finance manager', auditor: 'Auditor', client: 'Client user', user: 'User' },
    common: { close: 'Close', cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit', loading: 'Loading…', all: 'All', currency: 'USD' },
  },
};

export type TranslationKey = string;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  formatCurrency: (value: number) => string;
  formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  locale: string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getValue(tree: TranslationTree, key: string): string | undefined {
  return key.split('.').reduce<TranslationValue | undefined>((value, part) => {
    if (!value || typeof value === 'string') return undefined;
    return value[part];
  }, tree) as string | undefined;
}

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('btl-language');
    if (stored === 'en' || stored === 'fr') return stored;
    return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  });

  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    localStorage.setItem('btl-language', nextLanguage);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === 'fr' ? 'BTL Media — Pilotage de campagnes' : 'BTL Media — Campaign management';
  }, [language]);

  const t = useCallback((key: TranslationKey, fallback?: string) => {
    return getValue(translations[language], key) || fallback || key;
  }, [language]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number.isFinite(value) ? value : 0);
  }, [locale]);

  const formatDate = useCallback((value: string | Date, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) => {
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return new Intl.DateTimeFormat(locale, options).format(parsed);
  }, [locale]);

  const value = useMemo(() => ({ language, setLanguage, t, formatCurrency, formatDate, locale }), [language, setLanguage, t, formatCurrency, formatDate, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
};
