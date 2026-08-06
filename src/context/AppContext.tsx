import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  AppTheme,
  User,
  Region,
  Client,
  Media,
  FocalPoint,
  PricingRate,
  CampaignEvent,
  MediaByEvent,
  MediaPayment,
  AuditLog,
  SavedView
} from '../types';
import {
  initialUsers,
  initialRegions,
  initialClients,
  initialFocalPoints,
  initialMedias,
  initialPricingRates,
  initialEvents,
  initialMediaByEvents,
  initialMediaPayments,
  initialAuditLogs
} from '../data/mockData';

// Background images generated for themes
import darkBg from '../assets/images/bg_dark_smoke_1786007004233.jpg';
import lightBg from '../assets/images/bg_light_pastel_1786007019240.jpg';
import classicBg from '../assets/images/bg_classic_geo_1786007034776.jpg';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  // Theme & Style
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  getBgImage: () => string;

  // Active User & Role
  currentUser: User;
  setCurrentUser: (u: User) => void;
  users: User[];

  // Navigation & Search
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;

  // Data State
  regions: Region[];
  clients: Client[];
  focalPoints: FocalPoint[];
  medias: Media[];
  pricingRates: PricingRate[];
  events: CampaignEvent[];
  mediaByEvents: MediaByEvent[];
  mediaPayments: MediaPayment[];
  auditLogs: AuditLog[];
  savedViews: SavedView[];

  // Notifications
  notifications: ToastNotification[];
  addNotification: (notif: Omit<ToastNotification, 'id'>) => void;
  removeNotification: (id: string) => void;

  // CRUD Actions
  addEvent: (evt: Omit<CampaignEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (evt: CampaignEvent) => void;
  deleteEvent: (id: string) => void;

  addMediaByEvent: (mbe: Omit<MediaByEvent, 'id' | 'updatedAt' | 'amount' | 'paid' | 'pending'>) => void;
  updateMediaByEvent: (mbe: MediaByEvent) => void;
  deleteMediaByEvent: (id: string) => void;

  addMediaPayment: (pay: Omit<MediaPayment, 'id' | 'createdAt'>) => void;
  deleteMediaPayment: (id: string) => void;

  updatePricingRate: (mediaId: string, clientId: string, rateAmount: number) => void;
  
  addMedia: (m: Omit<Media, 'id' | 'createdAt'>) => void;
  updateMedia: (m: Media) => void;
  
  addClient: (c: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (c: Client) => void;

  addRegion: (r: Omit<Region, 'id' | 'createdAt'>) => void;

  addFocalPoint: (fp: Omit<FocalPoint, 'id'>) => void;

  // Reset & Export
  resetToDefaultData: () => void;
  triggerManualSave: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme
  const [theme, setThemeState] = useState<AppTheme>(() => {
    return (localStorage.getItem('mcm_theme') as AppTheme) || 'dark';
  });

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
    localStorage.setItem('mcm_theme', t);
  };

  const getBgImage = () => {
    if (theme === 'light') return lightBg;
    if (theme === 'classic') return classicBg;
    return darkBg;
  };

  // User
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // Core Data loaded from localStorage or fallback
  const [regions, setRegions] = useState<Region[]>(() => {
    const saved = localStorage.getItem('mcm_regions');
    return saved ? JSON.parse(saved) : initialRegions;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('mcm_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [focalPoints, setFocalPoints] = useState<FocalPoint[]>(() => {
    const saved = localStorage.getItem('mcm_focal_points');
    return saved ? JSON.parse(saved) : initialFocalPoints;
  });

  const [medias, setMedias] = useState<Media[]>(() => {
    const saved = localStorage.getItem('mcm_medias');
    return saved ? JSON.parse(saved) : initialMedias;
  });

  const [pricingRates, setPricingRates] = useState<PricingRate[]>(() => {
    const saved = localStorage.getItem('mcm_pricing');
    return saved ? JSON.parse(saved) : initialPricingRates;
  });

  const [events, setEvents] = useState<CampaignEvent[]>(() => {
    const saved = localStorage.getItem('mcm_events');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  const [mediaByEvents, setMediaByEvents] = useState<MediaByEvent[]>(() => {
    const saved = localStorage.getItem('mcm_media_events');
    return saved ? JSON.parse(saved) : initialMediaByEvents;
  });

  const [mediaPayments, setMediaPayments] = useState<MediaPayment[]>(() => {
    const saved = localStorage.getItem('mcm_payments');
    return saved ? JSON.parse(saved) : initialMediaPayments;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('mcm_audit');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [savedViews] = useState<SavedView[]>([]);

  // Toast Notifications
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addNotification = useCallback((notif: Omit<ToastNotification, 'id'>) => {
    const id = 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    const newNotif = { ...notif, id };
    setNotifications((prev) => [newNotif, ...prev]);
    setTimeout(() => {
      removeNotification(id);
    }, 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const logAuditAction = useCallback((action: AuditLog['action'], entityType: string, details: string, entityId?: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  }, [currentUser]);

  // Recalculate Business Logic Rules Engine
  const recalculateAll = useCallback(() => {
    // 1. Recalculate each MediaByEvent row
    setMediaByEvents((prevMbes) => {
      return prevMbes.map((row) => {
        const targetEvent = events.find((e) => e.id === row.eventId);
        const targetMedia = medias.find((m) => m.id === row.mediaId);
        const clientId = targetEvent?.clientId || row.clientId;

        // Auto-resolve names
        const eventName = targetEvent?.name || row.eventName;
        const mediaName = targetMedia?.name || row.mediaName;
        const clientObj = clients.find((c) => c.id === clientId);
        const clientName = clientObj?.name || row.clientName;

        // Auto-resolve Focal point
        const focalObj = focalPoints.find((fp) => fp.id === targetMedia?.focalPointId || fp.mediaId === row.mediaId);
        const focalPointName = focalObj?.name || targetMedia?.focalPointName || row.focalPointName;
        const phone = focalObj?.phone || targetMedia?.phone || row.phone;

        // RULE 1: If Proof of Diffusion is empty -> Amount = 0
        let computedAmount = 0;
        if (row.proofOfDiffusion && row.proofOfDiffusion.trim() !== '') {
          if (row.expenseType === 'Transport') {
            // RULE 2: If Expense Type = "Transport" -> Amount = Media Transport Fee
            computedAmount = targetMedia?.transportFee ?? 0;
          } else {
            // RULE 3: If Expense Type = "Tarif Média" -> Amount = Pricing for Media x Client
            const pricingItem = pricingRates.find(
              (p) => p.mediaId === row.mediaId && p.clientId === clientId
            );
            computedAmount = pricingItem ? pricingItem.rateAmount : 0;
          }
        }

        // RULE 4: Paid = Sum of payments for same media AND same event
        const totalPaidForThisRow = mediaPayments
          .filter((pay) => pay.mediaId === row.mediaId && pay.eventId === row.eventId)
          .reduce((sum, pay) => sum + pay.amount, 0);

        // RULE 5: Pending = Amount - Paid
        const pendingAmount = Math.max(0, computedAmount - totalPaidForThisRow);

        return {
          ...row,
          eventName,
          mediaName,
          clientId,
          clientName,
          focalPointName,
          phone,
          amount: computedAmount,
          paid: totalPaidForThisRow,
          pending: pendingAmount,
        };
      });
    });
  }, [events, medias, clients, focalPoints, pricingRates, mediaPayments]);

  // Sync state whenever underlying relations change
  useEffect(() => {
    recalculateAll();
  }, [pricingRates, mediaPayments, events, medias, clients, focalPoints]);

  // Update Event totals automatically
  const computedEvents = useMemo(() => {
    return events.map((evt) => {
      const diffusions = mediaByEvents.filter((mbe) => mbe.eventId === evt.id);
      const totalAmount = diffusions.reduce((acc, curr) => acc + curr.amount, 0);
      const totalPaid = diffusions.reduce((acc, curr) => acc + curr.paid, 0);
      const totalPending = diffusions.reduce((acc, curr) => acc + curr.pending, 0);
      const clientObj = clients.find((c) => c.id === evt.clientId);
      const regionObj = regions.find((r) => r.id === evt.regionId);

      return {
        ...evt,
        clientName: clientObj?.name || evt.clientName,
        regionName: regionObj?.name || evt.regionName,
        totalAmount,
        totalPaid,
        totalPending,
        mediaCount: diffusions.length,
      };
    });
  }, [events, mediaByEvents, clients, regions]);

  // Persistence effect
  useEffect(() => {
    localStorage.setItem('mcm_regions', JSON.stringify(regions));
    localStorage.setItem('mcm_clients', JSON.stringify(clients));
    localStorage.setItem('mcm_focal_points', JSON.stringify(focalPoints));
    localStorage.setItem('mcm_medias', JSON.stringify(medias));
    localStorage.setItem('mcm_pricing', JSON.stringify(pricingRates));
    localStorage.setItem('mcm_events', JSON.stringify(events));
    localStorage.setItem('mcm_media_events', JSON.stringify(mediaByEvents));
    localStorage.setItem('mcm_payments', JSON.stringify(mediaPayments));
    localStorage.setItem('mcm_audit', JSON.stringify(auditLogs));
  }, [regions, clients, focalPoints, medias, pricingRates, events, mediaByEvents, mediaPayments, auditLogs]);

  // Shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        triggerManualSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerManualSave = () => {
    addNotification({
      type: 'success',
      title: 'Données sauvegardées',
      message: 'Toutes les modifications ont été enregistrées localement.',
    });
    logAuditAction('Modification', 'Système', 'Sauvegarde manuelle effectuée (Ctrl+S)');
  };

  // CRUD Implementations
  const addEvent = (evt: Omit<CampaignEvent, 'id' | 'createdAt'>) => {
    const id = 'evt-' + Date.now();
    const newEvt: CampaignEvent = {
      ...evt,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setEvents((prev) => [newEvt, ...prev]);
    logAuditAction('Création', 'Événement', `Création de l'événement "${newEvt.name}"`, id);
    addNotification({ type: 'success', title: 'Événement créé', message: `L'événement ${newEvt.name} a été ajouté.` });
  };

  const updateEvent = (updatedEvt: CampaignEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvt.id ? updatedEvt : e)));
    logAuditAction('Modification', 'Événement', `Modification de l'événement "${updatedEvt.name}"`, updatedEvt.id);
    addNotification({ type: 'info', title: 'Événement mis à jour', message: `Les données ont été actualisées.` });
  };

  const deleteEvent = (id: string) => {
    const target = events.find((e) => e.id === id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setMediaByEvents((prev) => prev.filter((mbe) => mbe.eventId !== id));
    setMediaPayments((prev) => prev.filter((p) => p.eventId !== id));
    logAuditAction('Suppression', 'Événement', `Suppression de l'événement "${target?.name || id}"`, id);
    addNotification({ type: 'warning', title: 'Événement supprimé', message: `L'événement a été retiré.` });
  };

  const addMediaByEvent = (mbe: Omit<MediaByEvent, 'id' | 'updatedAt' | 'amount' | 'paid' | 'pending'>) => {
    const id = 'mbe-' + Date.now();
    const targetEvt = events.find((e) => e.id === mbe.eventId);
    const targetMedia = medias.find((m) => m.id === mbe.mediaId);

    const newMbe: MediaByEvent = {
      ...mbe,
      id,
      amount: 0,
      paid: 0,
      pending: 0,
      updatedAt: new Date().toISOString().split('T')[0],
      eventName: targetEvt?.name,
      mediaName: targetMedia?.name,
    };

    setMediaByEvents((prev) => [newMbe, ...prev]);
    logAuditAction('Création', 'Diffusion Média', `Ajout diffusion média "${targetMedia?.name}" pour "${targetEvt?.name}"`, id);
    addNotification({ type: 'success', title: 'Diffusion enregistrée', message: 'La ligne a été ajoutée avec succès.' });
  };

  const updateMediaByEvent = (mbe: MediaByEvent) => {
    setMediaByEvents((prev) => prev.map((m) => (m.id === mbe.id ? { ...mbe, updatedAt: new Date().toISOString().split('T')[0] } : m)));
    logAuditAction('Modification', 'Diffusion Média', `Mise à jour diffusion "${mbe.mediaName}"`, mbe.id);
  };

  const deleteMediaByEvent = (id: string) => {
    setMediaByEvents((prev) => prev.filter((m) => m.id !== id));
    logAuditAction('Suppression', 'Diffusion Média', `Suppression ligne diffusion ID ${id}`, id);
    addNotification({ type: 'warning', title: 'Diffusion supprimée', message: 'La ligne de diffusion a été supprimée.' });
  };

  const addMediaPayment = (pay: Omit<MediaPayment, 'id' | 'createdAt'>) => {
    const id = 'pay-' + Date.now();
    const targetMedia = medias.find((m) => m.id === pay.mediaId);
    const targetEvt = events.find((e) => e.id === pay.eventId);

    const newPay: MediaPayment = {
      ...pay,
      id,
      createdAt: new Date().toISOString().split('T')[0],
      mediaName: targetMedia?.name,
      eventName: targetEvt?.name,
    };

    setMediaPayments((prev) => [newPay, ...prev]);
    logAuditAction('Création', 'Paiement Média', `Règlement de $${pay.amount} à "${targetMedia?.name}" pour "${targetEvt?.name}"`, id);
    addNotification({ type: 'success', title: 'Paiement enregistré', message: `Montant de $${pay.amount} enregistré pour ${targetMedia?.name}.` });
  };

  const deleteMediaPayment = (id: string) => {
    const target = mediaPayments.find((p) => p.id === id);
    setMediaPayments((prev) => prev.filter((p) => p.id !== id));
    logAuditAction('Suppression', 'Paiement Média', `Suppression du paiement de $${target?.amount || 0}`, id);
    addNotification({ type: 'warning', title: 'Paiement annulé', message: 'Le paiement a été retiré.' });
  };

  const updatePricingRate = (mediaId: string, clientId: string, rateAmount: number) => {
    setPricingRates((prev) => {
      const existing = prev.find((p) => p.mediaId === mediaId && p.clientId === clientId);
      if (existing) {
        return prev.map((p) =>
          p.mediaId === mediaId && p.clientId === clientId
            ? { ...p, rateAmount, version: p.version + 1 }
            : p
        );
      } else {
        const newRate: PricingRate = {
          id: 'pr-' + Date.now(),
          mediaId,
          clientId,
          rateAmount,
          effectiveDate: new Date().toISOString().split('T')[0],
          version: 1,
        };
        return [...prev, newRate];
      }
    });

    const targetMedia = medias.find((m) => m.id === mediaId);
    const targetClient = clients.find((c) => c.id === clientId);
    logAuditAction('Modification', 'Grille Tarifaire', `Nouveau tarif $${rateAmount} pour [${targetMedia?.name}] / [${targetClient?.name}]`);
    addNotification({ type: 'info', title: 'Tarif mis à jour', message: `Ajusté à $${rateAmount}` });
  };

  const addMedia = (m: Omit<Media, 'id' | 'createdAt'>) => {
    const id = 'med-' + Date.now();
    const newM: Media = { ...m, id, createdAt: new Date().toISOString().split('T')[0] };
    setMedias((prev) => [newM, ...prev]);
    logAuditAction('Création', 'Média', `Ajout du média "${newM.name}"`, id);
    addNotification({ type: 'success', title: 'Média créé', message: `Média ${newM.name} ajouté.` });
  };

  const updateMedia = (m: Media) => {
    setMedias((prev) => prev.map((item) => (item.id === m.id ? m : item)));
    logAuditAction('Modification', 'Média', `Modification média "${m.name}"`, m.id);
  };

  const addClient = (c: Omit<Client, 'id' | 'createdAt'>) => {
    const id = 'cli-' + Date.now();
    const newC: Client = { ...c, id, createdAt: new Date().toISOString().split('T')[0] };
    setClients((prev) => [newC, ...prev]);
    logAuditAction('Création', 'Client', `Ajout du client "${newC.name}"`, id);
    addNotification({ type: 'success', title: 'Client créé', message: `Client ${newC.name} ajouté.` });
  };

  const updateClient = (c: Client) => {
    setClients((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    logAuditAction('Modification', 'Client', `Modification client "${c.name}"`, c.id);
  };

  const addRegion = (r: Omit<Region, 'id' | 'createdAt'>) => {
    const id = 'reg-' + Date.now();
    const newR: Region = { ...r, id, createdAt: new Date().toISOString().split('T')[0] };
    setRegions((prev) => [newR, ...prev]);
    logAuditAction('Création', 'Région', `Ajout région "${newR.name}"`, id);
  };

  const addFocalPoint = (fp: Omit<FocalPoint, 'id'>) => {
    const id = 'fp-' + Date.now();
    const newFp: FocalPoint = { ...fp, id };
    setFocalPoints((prev) => [newFp, ...prev]);
    logAuditAction('Création', 'Point Focal', `Ajout point focal "${newFp.name}"`, id);
  };

  const resetToDefaultData = () => {
    setRegions(initialRegions);
    setClients(initialClients);
    setFocalPoints(initialFocalPoints);
    setMedias(initialMedias);
    setPricingRates(initialPricingRates);
    setEvents(initialEvents);
    setMediaByEvents(initialMediaByEvents);
    setMediaPayments(initialMediaPayments);
    setAuditLogs(initialAuditLogs);
    localStorage.clear();
    addNotification({ type: 'warning', title: 'Réinitialisation', message: 'Les données d\'origine ont été restaurées.' });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        getBgImage,
        currentUser,
        setCurrentUser,
        users,
        activeTab,
        setActiveTab,
        globalSearchQuery,
        setGlobalSearchQuery,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isShortcutsModalOpen,
        setIsShortcutsModalOpen,
        regions,
        clients,
        focalPoints,
        medias,
        pricingRates,
        events: computedEvents,
        mediaByEvents,
        mediaPayments,
        auditLogs,
        savedViews,
        notifications,
        addNotification,
        removeNotification,
        addEvent,
        updateEvent,
        deleteEvent,
        addMediaByEvent,
        updateMediaByEvent,
        deleteMediaByEvent,
        addMediaPayment,
        deleteMediaPayment,
        updatePricingRate,
        addMedia,
        updateMedia,
        addClient,
        updateClient,
        addRegion,
        addFocalPoint,
        resetToDefaultData,
        triggerManualSave,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
