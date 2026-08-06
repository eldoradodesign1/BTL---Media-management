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
  SavedView,
  PurchaseOrder,
  RateType,
  PasswordResetRequest
} from '../types';
import {
  initialRegions,
  initialClients,
  initialFocalPoints,
  initialMedias,
  initialPricingRates,
  initialEvents,
  initialMediaByEvents,
  initialMediaPayments,
  initialAuditLogs,
  initialPurchaseOrders
} from '../data/mockData';
import { supabaseService } from '../lib/supabaseService';
import { getSupabaseConfig } from '../lib/supabase';

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
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  requestPasswordReset: (email: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUserProfile: (data: { name?: string; email?: string; avatar?: string; password?: string; clientId?: string }) => Promise<{ success: boolean; message?: string }>;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Navigation & Search
  activeTab: string;
  setActiveTab: (tab: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  isSupabaseConnected: boolean;

  // Data State
  regions: Region[];
  clients: Client[];
  focalPoints: FocalPoint[];
  medias: Media[];
  pricingRates: PricingRate[];
  events: CampaignEvent[];
  mediaByEvents: MediaByEvent[];
  mediaPayments: MediaPayment[];
  purchaseOrders: PurchaseOrder[];
  auditLogs: AuditLog[];
  passwordResetRequests: PasswordResetRequest[];
  savedViews: SavedView[];

  // Notifications
  notifications: ToastNotification[];
  addNotification: (notif: Omit<ToastNotification, 'id'>) => void;
  removeNotification: (id: string) => void;
  resolvePasswordResetRequest: (id: string, newStatus: 'Résolu' | 'Rejeté') => void;

  // Supabase Sync Actions
  syncFromSupabase: () => Promise<boolean>;
  pushAllDataToSupabase: () => Promise<boolean>;

  // CRUD Actions
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  updatePurchaseOrder: (po: PurchaseOrder) => void;
  deletePurchaseOrder: (id: string) => void;

  addEvent: (evt: Omit<CampaignEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (evt: CampaignEvent) => void;
  deleteEvent: (id: string) => void;

  addMediaByEvent: (mbe: Omit<MediaByEvent, 'id' | 'updatedAt' | 'amount' | 'paid' | 'pending'>) => void;
  updateMediaByEvent: (mbe: MediaByEvent) => void;
  deleteMediaByEvent: (id: string) => void;

  addMediaPayment: (pay: Omit<MediaPayment, 'id' | 'createdAt'>) => void;
  deleteMediaPayment: (id: string) => void;

  updatePricingRate: (mediaId: string, clientId: string, rateTypeOrAmount: RateType | number, maybeAmount?: number) => void;
  
  addMedia: (m: Omit<Media, 'id' | 'createdAt'>) => void;
  updateMedia: (m: Media) => void;
  
  addClient: (c: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (c: Client) => void;

  addRegion: (r: Omit<Region, 'id' | 'createdAt'>) => void;

  addFocalPoint: (fp: Omit<FocalPoint, 'id'>) => void;
  updateFocalPoint: (fp: FocalPoint) => void;

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

  // User & Auth State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mcm_users');
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const realOnly = parsed.filter(u => !u.id.startsWith('u0') && !u.id.startsWith('u1') && !u.id.startsWith('u2') && !u.id.startsWith('u3') && !u.id.startsWith('u4') && !u.id.startsWith('u5'));
        if (realOnly.length > 0) return realOnly;
      } catch (e) {
        // ignore parse error
      }
    }
    return [];
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem('mcm_authenticated_user_id');
    const saved = localStorage.getItem('mcm_users');
    let realUsers: User[] = [];
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        realUsers = parsed.filter(u => !u.id.startsWith('u0') && !u.id.startsWith('u1') && !u.id.startsWith('u2') && !u.id.startsWith('u3') && !u.id.startsWith('u4') && !u.id.startsWith('u5'));
      } catch (e) {}
    }

    if (savedId && realUsers.length > 0) {
      const found = realUsers.find(u => u.id === savedId);
      if (found) return found;
    }
    if (realUsers.length > 0) return realUsers[0];

    // Placeholder temporaire avant le chargement Supabase
    return {
      id: 'default-admin',
      name: 'Administrateur Supabase',
      email: 'admin@btl-agency.cd',
      role: 'super-admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return true; // Active par défaut, peut être déconnecté via l'IHM
  });

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Core Data loaded from localStorage or empty when Supabase is active
  const isDbConfigured = getSupabaseConfig().isConfigured;

  const [regions, setRegions] = useState<Region[]>(() => {
    if (isDbConfigured) return [];
    const saved = localStorage.getItem('mcm_regions');
    return saved ? JSON.parse(saved) : [];
  });

  const [clients, setClients] = useState<Client[]>(() => {
    if (isDbConfigured) return [];
    const saved = localStorage.getItem('mcm_clients');
    return saved ? JSON.parse(saved) : [];
  });

  const [focalPoints, setFocalPoints] = useState<FocalPoint[]>(() => {
    if (isDbConfigured) return [];
    const saved = localStorage.getItem('mcm_focal_points');
    return saved ? JSON.parse(saved) : [];
  });

  const [medias, setMedias] = useState<Media[]>(() => {
    if (isDbConfigured) return [];
    const saved = localStorage.getItem('mcm_medias');
    return saved ? JSON.parse(saved) : [];
  });

  const [pricingRates, setPricingRates] = useState<PricingRate[]>(() => {
    if (isDbConfigured) return [];
    const saved = localStorage.getItem('mcm_pricing');
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<CampaignEvent[]>(() => {
    if (isDbConfigured) return [];
    const saved = localStorage.getItem('mcm_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [mediaByEvents, setMediaByEvents] = useState<MediaByEvent[]>(() => {
    if (isDbConfigured) return [];
    const saved = localStorage.getItem('mcm_media_events');
    return saved ? JSON.parse(saved) : [];
  });

  const [mediaPayments, setMediaPayments] = useState<MediaPayment[]>(() => {
    if (isDbConfigured) return [];
    const saved = localStorage.getItem('mcm_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    if (isDbConfigured) return [];
    const saved = localStorage.getItem('mcm_purchase_orders');
    return saved ? JSON.parse(saved) : initialPurchaseOrders;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    if (isDbConfigured) return [];
    const saved = localStorage.getItem('mcm_audit');
    return saved ? JSON.parse(saved) : [];
  });

  const [passwordResetRequests, setPasswordResetRequests] = useState<PasswordResetRequest[]>(() => {
    const saved = localStorage.getItem('mcm_password_resets');
    return saved ? JSON.parse(saved) : [];
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
      userId: currentUser?.id || 'sys',
      userName: currentUser ? currentUser.name : 'Système',
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    supabaseService.saveAuditLog(newLog);
  }, [currentUser]);

  // Supabase Sync Methods
  const syncFromSupabase = useCallback(async (): Promise<boolean> => {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      setIsSupabaseConnected(false);
      return false;
    }

    const remoteData = await supabaseService.loadAllData();
    if (!remoteData) {
      setIsSupabaseConnected(false);
      return false;
    }

    setIsSupabaseConnected(true);

    if (remoteData.users !== undefined) {
      setUsers(remoteData.users);
      localStorage.setItem('mcm_users', JSON.stringify(remoteData.users));

      if (remoteData.users.length > 0) {
        // Sync active current user with updated remote profile if available
        setCurrentUser(prevUser => {
          const matched = remoteData.users!.find(u => u.id === prevUser.id || (u.email && prevUser.email && u.email.toLowerCase() === prevUser.email.toLowerCase()));
          return matched || remoteData.users![0];
        });
      }
    }

    setRegions(remoteData.regions || []);
    setClients(remoteData.clients || []);
    setFocalPoints(remoteData.focalPoints || []);
    setMedias(remoteData.medias || []);
    setPricingRates(remoteData.pricingRates || []);
    setEvents(remoteData.events || []);
    setMediaByEvents(remoteData.mediaByEvents || []);
    setMediaPayments(remoteData.mediaPayments || []);
    setPurchaseOrders(remoteData.purchaseOrders || []);
    setAuditLogs(remoteData.auditLogs || []);

    const resetReqs = await supabaseService.loadPasswordResetRequests();
    if (resetReqs && resetReqs.length > 0) {
      setPasswordResetRequests(resetReqs);
    }

    return true;
  }, []);

  // Authentication & Profile Actions
  const login = useCallback(async (email: string, pass: string) => {
    const targetEmail = email.trim().toLowerCase();
    const matched = users.find(u => u.email.toLowerCase() === targetEmail);
    if (!matched) {
      return { success: false, message: 'Aucun utilisateur trouvé avec cette adresse email.' };
    }
    const expectedPass = matched.password || '123456';
    if (pass !== expectedPass) {
      return { success: false, message: 'Mot de passe incorrect.' };
    }

    setCurrentUser(matched);
    setIsAuthenticated(true);
    localStorage.setItem('mcm_authenticated_user_id', matched.id);
    addNotification({
      type: 'success',
      title: 'Connexion réussie',
      message: `Bienvenue, ${matched.name} !`
    });
    return { success: true };
  }, [users, addNotification]);

  const requestPasswordReset = useCallback(async (email: string, reason?: string) => {
    const targetEmail = email.trim().toLowerCase();
    const matched = users.find(u => u.email.toLowerCase() === targetEmail);
    const userName = matched ? matched.name : targetEmail;

    const newReq: PasswordResetRequest = {
      id: 'req-' + Date.now(),
      email: targetEmail,
      userName,
      reason: reason || 'Mot de passe oublié',
      status: 'En attente',
      createdAt: new Date().toISOString()
    };

    setPasswordResetRequests(prev => [newReq, ...prev]);
    localStorage.setItem('mcm_password_resets', JSON.stringify([newReq, ...passwordResetRequests]));
    supabaseService.savePasswordResetRequest(newReq);

    addNotification({
      type: 'warning',
      title: '🔐 Demande de Réinitialisation Mdp',
      message: `Requête enregistrée en base pour ${userName}. Notification transmise au SuperAdmin.`
    });

    logAuditAction('Modification', 'Sécurité', `Demande de réinitialisation de mot de passe par ${userName} (${targetEmail}). Motif: ${reason || 'Mot de passe oublié'}`);
    return { success: true, message: 'Demande transmise avec succès et enregistrée en base de données.' };
  }, [users, addNotification, logAuditAction, passwordResetRequests]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setIsAuthModalOpen(true);
    addNotification({
      type: 'info',
      title: 'Déconnexion',
      message: 'Vous avez été déconnecté de la session.'
    });
  }, [addNotification]);

  const updateUserProfile = useCallback(async (data: { name?: string; email?: string; avatar?: string; password?: string; clientId?: string }) => {
    if (!currentUser) return { success: false, message: 'Aucun utilisateur actif' };

    const updatedUser: User = {
      ...currentUser,
      ...(data.name ? { name: data.name } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.avatar ? { avatar: data.avatar } : {}),
      ...(data.password ? { password: data.password } : {}),
      ...(data.clientId ? { clientId: data.clientId } : {}),
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    // Save to Supabase
    const res = await supabaseService.updateUserProfile(currentUser.id, data);
    if (res.success) {
      addNotification({
        type: 'success',
        title: 'Profil mis à jour',
        message: 'Vos modifications ont été enregistrées sur la base Supabase.'
      });
      return { success: true };
    } else {
      addNotification({
        type: 'warning',
        title: 'Mise à jour locale',
        message: res.message || 'Changements sauvegardés en local (Erreur Supabase).'
      });
      return { success: true, message: res.message };
    }
  }, [currentUser, addNotification]);

  const pushAllDataToSupabase = useCallback(async (): Promise<boolean> => {
    const dataToSeed = {
      regions: regions.length ? regions : initialRegions,
      clients: clients.length ? clients : initialClients,
      focalPoints: focalPoints.length ? focalPoints : initialFocalPoints,
      medias: medias.length ? medias : initialMedias,
      pricingRates: pricingRates.length ? pricingRates : initialPricingRates,
      events: events.length ? events : initialEvents,
      mediaByEvents: mediaByEvents.length ? mediaByEvents : initialMediaByEvents,
      mediaPayments: mediaPayments.length ? mediaPayments : initialMediaPayments,
    };
    const success = await supabaseService.seedInitialData(dataToSeed);
    if (success) {
      setIsSupabaseConnected(true);
      await syncFromSupabase();
    }
    return success;
  }, [regions, clients, focalPoints, medias, pricingRates, events, mediaByEvents, mediaPayments, syncFromSupabase]);

  // Initial load effect for Supabase
  useEffect(() => {
    syncFromSupabase();
  }, [syncFromSupabase]);

  // Recalculate Business Logic Rules Engine
  const recalculateAll = useCallback(() => {
    setMediaByEvents((prevMbes) => {
      return prevMbes.map((row) => {
        const targetEvent = events.find((e) => e.id === row.eventId);
        const targetMedia = medias.find((m) => m.id === row.mediaId);
        const clientId = targetEvent?.clientId || row.clientId;

        const eventName = targetEvent?.name || row.eventName;
        const mediaName = targetMedia?.name || row.mediaName;
        const clientObj = clients.find((c) => c.id === clientId);
        const clientName = clientObj?.name || row.clientName;

        const focalObj = focalPoints.find((fp) => fp.id === targetMedia?.focalPointId || fp.mediaId === row.mediaId);
        const focalPointName = focalObj?.name || targetMedia?.focalPointName || row.focalPointName;
        const phone = focalObj?.phone || targetMedia?.phone || row.phone;

        let computedAmount = 0;
        let costAmount = 0;
        if (row.proofOfDiffusion && row.proofOfDiffusion.trim() !== '') {
          if (row.expenseType === 'Transport') {
            computedAmount = targetMedia?.transportFee ?? 0;
            costAmount = targetMedia?.transportFee ?? 0;
          } else {
            const catalogItem = pricingRates.find(
              (p) => p.mediaId === row.mediaId && p.clientId === clientId && (p.rateType === 'catalog' || !p.rateType)
            );
            const realItem = pricingRates.find(
              (p) => p.mediaId === row.mediaId && p.clientId === clientId && p.rateType === 'real'
            );
            computedAmount = catalogItem ? catalogItem.rateAmount : 0;
            costAmount = realItem ? realItem.rateAmount : computedAmount;
          }
        }

        const totalPaidForThisRow = mediaPayments
          .filter((pay) => pay.mediaId === row.mediaId && pay.eventId === row.eventId)
          .reduce((sum, pay) => sum + pay.amount, 0);

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
          costAmount,
          paid: totalPaidForThisRow,
          pending: pendingAmount,
        };
      });
    });
  }, [events, medias, clients, focalPoints, pricingRates, mediaPayments]);

  useEffect(() => {
    recalculateAll();
  }, [pricingRates, mediaPayments, events, medias, clients, focalPoints]);

  const computedMediaPayments = useMemo(() => {
    return mediaPayments.map((pay) => {
      const targetMedia = medias.find((m) => m.id === pay.mediaId);
      const targetEvt = events.find((e) => e.id === pay.eventId);
      const targetClient = clients.find((c) => c.id === (pay.clientId || targetEvt?.clientId));
      const focalObj = focalPoints.find((fp) => fp.mediaId === pay.mediaId || fp.id === targetMedia?.focalPointId);

      return {
        ...pay,
        mediaName: targetMedia?.name || pay.mediaName || 'Média inconnu',
        eventName: targetEvt?.name || pay.eventName || 'Événement non spécifié',
        clientName: targetClient?.name || pay.clientName || 'Client non spécifié',
        focalPointName: focalObj?.name || targetMedia?.focalPointName || pay.focalPointName,
      };
    });
  }, [mediaPayments, medias, events, clients, focalPoints]);

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

  useEffect(() => {
    if (!getSupabaseConfig().isConfigured) {
      localStorage.setItem('mcm_regions', JSON.stringify(regions));
      localStorage.setItem('mcm_clients', JSON.stringify(clients));
      localStorage.setItem('mcm_focal_points', JSON.stringify(focalPoints));
      localStorage.setItem('mcm_medias', JSON.stringify(medias));
      localStorage.setItem('mcm_pricing', JSON.stringify(pricingRates));
      localStorage.setItem('mcm_events', JSON.stringify(events));
      localStorage.setItem('mcm_media_events', JSON.stringify(mediaByEvents));
      localStorage.setItem('mcm_payments', JSON.stringify(mediaPayments));
      localStorage.setItem('mcm_purchase_orders', JSON.stringify(purchaseOrders));
      localStorage.setItem('mcm_audit', JSON.stringify(auditLogs));
    }
  }, [regions, clients, focalPoints, medias, pricingRates, events, mediaByEvents, mediaPayments, purchaseOrders, auditLogs]);

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
      message: 'Toutes les modifications ont été enregistrées.',
    });
    logAuditAction('Modification', 'Système', 'Sauvegarde manuelle effectuée (Ctrl+S)');
  };

  // CRUD Implementations with Supabase Dual Sync
  const addPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    const id = 'po-' + Date.now();
    const targetClient = clients.find(c => c.id === poData.clientId);
    const newPo: PurchaseOrder = {
      ...poData,
      id,
      clientName: targetClient?.name || poData.clientName || 'Client',
      createdAt: new Date().toISOString(),
    };
    setPurchaseOrders(prev => [newPo, ...prev]);
    supabaseService.savePurchaseOrder(newPo);
    logAuditAction('Création', 'Ordre de Paiement (PO)', `Ajout du PO ${newPo.poNumber} (${newPo.amount} $)`, id);
    addNotification({ type: 'success', title: 'PO Reçu enregistré', message: `Le PO ${newPo.poNumber} ($${newPo.amount.toLocaleString()}) a été ajouté.` });
  };

  const updatePurchaseOrder = (po: PurchaseOrder) => {
    const targetClient = clients.find(c => c.id === po.clientId);
    const updatedPo = { ...po, clientName: targetClient?.name || po.clientName };
    setPurchaseOrders(prev => prev.map(p => p.id === po.id ? updatedPo : p));
    supabaseService.savePurchaseOrder(updatedPo);
    logAuditAction('Modification', 'Ordre de Paiement (PO)', `Modification du PO ${updatedPo.poNumber}`, po.id);
    addNotification({ type: 'info', title: 'PO mis à jour', message: `Les données du PO ${updatedPo.poNumber} ont été actualisées.` });
  };

  const deletePurchaseOrder = (id: string) => {
    const target = purchaseOrders.find(p => p.id === id);
    setPurchaseOrders(prev => prev.filter(p => p.id !== id));
    supabaseService.deletePurchaseOrder(id);
    logAuditAction('Suppression', 'Ordre de Paiement (PO)', `Suppression du PO ${target?.poNumber || id}`, id);
    addNotification({ type: 'warning', title: 'PO supprimé', message: 'Le PO a été retiré.' });
  };

  const addEvent = (evt: Omit<CampaignEvent, 'id' | 'createdAt'>) => {
    const id = 'evt-' + Date.now();
    const newEvt: CampaignEvent = {
      ...evt,
      id,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setEvents((prev) => [newEvt, ...prev]);
    supabaseService.saveEvent(newEvt);
    logAuditAction('Création', 'Événement', `Création de l'événement "${newEvt.name}"`, id);
    addNotification({ type: 'success', title: 'Événement créé', message: `L'événement ${newEvt.name} a été ajouté.` });
  };

  const updateEvent = (updatedEvt: CampaignEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updatedEvt.id ? updatedEvt : e)));
    supabaseService.saveEvent(updatedEvt);
    logAuditAction('Modification', 'Événement', `Modification de l'événement "${updatedEvt.name}"`, updatedEvt.id);
    addNotification({ type: 'info', title: 'Événement mis à jour', message: `Les données ont été actualisées.` });
  };

  const deleteEvent = (id: string) => {
    const target = events.find((e) => e.id === id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setMediaByEvents((prev) => prev.filter((mbe) => mbe.eventId !== id));
    setMediaPayments((prev) => prev.filter((p) => p.eventId !== id));
    supabaseService.deleteEvent(id);
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
    supabaseService.saveMediaByEvent(newMbe);
    logAuditAction('Création', 'Diffusion Média', `Ajout diffusion média "${targetMedia?.name}" pour "${targetEvt?.name}"`, id);
    addNotification({ type: 'success', title: 'Diffusion enregistrée', message: 'La ligne a été ajoutée avec succès.' });
  };

  const updateMediaByEvent = (mbe: MediaByEvent) => {
    const updated = { ...mbe, updatedAt: new Date().toISOString().split('T')[0] };
    setMediaByEvents((prev) => prev.map((m) => (m.id === mbe.id ? updated : m)));
    supabaseService.saveMediaByEvent(updated);
    logAuditAction('Modification', 'Diffusion Média', `Mise à jour diffusion "${mbe.mediaName}"`, mbe.id);
  };

  const deleteMediaByEvent = (id: string) => {
    setMediaByEvents((prev) => prev.filter((m) => m.id !== id));
    supabaseService.deleteMediaByEvent(id);
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
    supabaseService.saveMediaPayment(newPay);
    logAuditAction('Création', 'Paiement Média', `Règlement de $${pay.amount} à "${targetMedia?.name}" pour "${targetEvt?.name}"`, id);
    addNotification({ type: 'success', title: 'Paiement enregistré', message: `Montant de $${pay.amount} enregistré pour ${targetMedia?.name}.` });
  };

  const deleteMediaPayment = (id: string) => {
    const target = mediaPayments.find((p) => p.id === id);
    setMediaPayments((prev) => prev.filter((p) => p.id !== id));
    supabaseService.deleteMediaPayment(id);
    logAuditAction('Suppression', 'Paiement Média', `Suppression du paiement de $${target?.amount || 0}`, id);
    addNotification({ type: 'warning', title: 'Paiement annulé', message: 'Le paiement a été retiré.' });
  };

  const updatePricingRate = (
    mediaId: string,
    clientId: string,
    rateTypeOrAmount: RateType | number,
    maybeAmount?: number
  ) => {
    const rateType: RateType = typeof rateTypeOrAmount === 'string' ? rateTypeOrAmount : 'catalog';
    const rateAmount: number = typeof rateTypeOrAmount === 'number' ? rateTypeOrAmount : (maybeAmount ?? 0);

    let rateToSave: PricingRate | null = null;
    setPricingRates((prev) => {
      const existing = prev.find(
        (p) => p.mediaId === mediaId && p.clientId === clientId && (p.rateType === rateType || (!p.rateType && rateType === 'catalog'))
      );
      if (existing) {
        rateToSave = { ...existing, rateType, rateAmount, version: existing.version + 1 };
        return prev.map((p) => (p.id === existing.id ? rateToSave! : p));
      } else {
        rateToSave = {
          id: 'pr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          mediaId,
          clientId,
          rateType,
          rateAmount,
          effectiveDate: new Date().toISOString().split('T')[0],
          version: 1,
        };
        return [...prev, rateToSave];
      }
    });

    if (rateToSave) {
      supabaseService.savePricingRate(rateToSave);
    }

    const targetMedia = medias.find((m) => m.id === mediaId);
    const targetClient = clients.find((c) => c.id === clientId);
    const labelType = rateType === 'real' ? 'Réel (BTL)' : 'Catalogue (Client)';
    logAuditAction('Modification', 'Grille Tarifaire', `Nouveau tarif ${labelType} $${rateAmount} pour [${targetMedia?.name}] / [${targetClient?.name}]`);
    addNotification({ type: 'info', title: 'Tarif mis à jour', message: `Tarif ${labelType} ajusté à $${rateAmount}` });
  };

  const addMedia = (m: Omit<Media, 'id' | 'createdAt'>) => {
    const id = 'med-' + Date.now();
    const newM: Media = { ...m, id, createdAt: new Date().toISOString().split('T')[0] };
    setMedias((prev) => [newM, ...prev]);
    supabaseService.saveMedia(newM);
    logAuditAction('Création', 'Média', `Ajout du média "${newM.name}"`, id);
    addNotification({ type: 'success', title: 'Média créé', message: `Média ${newM.name} ajouté.` });
  };

  const updateMedia = (m: Media) => {
    setMedias((prev) => prev.map((item) => (item.id === m.id ? m : item)));
    supabaseService.saveMedia(m);
    logAuditAction('Modification', 'Média', `Modification média "${m.name}"`, m.id);
  };

  const addClient = (c: Omit<Client, 'id' | 'createdAt'>) => {
    const id = 'cli-' + Date.now();
    const newC: Client = { ...c, id, createdAt: new Date().toISOString().split('T')[0] };
    setClients((prev) => [newC, ...prev]);
    supabaseService.saveClient(newC);
    logAuditAction('Création', 'Client', `Ajout du client "${newC.name}"`, id);
    addNotification({ type: 'success', title: 'Client créé', message: `Client ${newC.name} ajouté.` });
  };

  const updateClient = (c: Client) => {
    setClients((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    supabaseService.saveClient(c);
    logAuditAction('Modification', 'Client', `Modification client "${c.name}"`, c.id);
  };

  const addRegion = (r: Omit<Region, 'id' | 'createdAt'>) => {
    const id = 'reg-' + Date.now();
    const newR: Region = { ...r, id, createdAt: new Date().toISOString().split('T')[0] };
    setRegions((prev) => [newR, ...prev]);
    supabaseService.saveRegion(newR);
    logAuditAction('Création', 'Région', `Ajout région "${newR.name}"`, id);
  };

  const addFocalPoint = (fp: Omit<FocalPoint, 'id'>) => {
    const id = 'fp-' + Date.now();
    const newFp: FocalPoint = { ...fp, id };
    setFocalPoints((prev) => [newFp, ...prev]);
    supabaseService.saveFocalPoint(newFp);
    logAuditAction('Création', 'Point Focal', `Ajout point focal "${newFp.name}"`, id);
  };

  const updateFocalPoint = (fp: FocalPoint) => {
    setFocalPoints((prev) => prev.map((item) => (item.id === fp.id ? fp : item)));
    supabaseService.saveFocalPoint(fp);
    logAuditAction('Modification', 'Point Focal', `Modification point focal "${fp.name}"`, fp.id);
  };

  const resolvePasswordResetRequest = (id: string, newStatus: 'Résolu' | 'Rejeté') => {
    setPasswordResetRequests(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, status: newStatus } : r);
      localStorage.setItem('mcm_password_resets', JSON.stringify(updated));
      return updated;
    });
    const targetReq = passwordResetRequests.find(r => r.id === id);
    if (targetReq) {
      supabaseService.savePasswordResetRequest({ ...targetReq, status: newStatus });
    }
    addNotification({
      type: newStatus === 'Résolu' ? 'success' : 'info',
      title: 'Demande Mdp Mise à Jour',
      message: `La demande de ${targetReq?.email} a été marquée comme "${newStatus}".`
    });
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
    setPurchaseOrders(initialPurchaseOrders);
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
        isAuthenticated,
        login,
        requestPasswordReset,
        logout,
        updateUserProfile,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        activeTab,
        setActiveTab,
        globalSearchQuery,
        setGlobalSearchQuery,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isShortcutsModalOpen,
        setIsShortcutsModalOpen,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        isSupabaseConnected,
        regions,
        clients,
        focalPoints,
        medias,
        pricingRates,
        events: computedEvents,
        mediaByEvents,
        mediaPayments: computedMediaPayments,
        purchaseOrders,
        auditLogs,
        passwordResetRequests,
        savedViews,
        notifications,
        addNotification,
        removeNotification,
        resolvePasswordResetRequest,
        syncFromSupabase,
        pushAllDataToSupabase,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
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
        updateFocalPoint,
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
