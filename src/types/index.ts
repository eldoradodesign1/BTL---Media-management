export type AppTheme = 'dark' | 'light' | 'classic';

export type UserRole = 'super-admin' | 'admin' | 'media_manager' | 'finance' | 'auditor' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  clientId?: string;
  password?: string;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  createdAt: string;
}

export type MediaTypeCategory = 'TV' | 'Radio' | 'Presse Écrite' | 'Digital' | 'Affichage (OOH)';

export interface Media {
  id: string;
  name: string;
  location: string;
  type: MediaTypeCategory;
  transportFee: number;
  phone: string;
  focalPointId: string;
  focalPointName?: string;
  createdAt: string;
}

export interface FocalPoint {
  id: string;
  name: string;
  phone: string;
  mediaId: string;
  mediaName?: string;
  clientId?: string;
  clientName?: string;
  email: string;
}

export type RateType = 'catalog' | 'real';

export interface PricingRate {
  id: string;
  mediaId: string;
  clientId: string;
  rateType: RateType; // 'catalog' (Prix Catalogue Client) or 'real' (Prix Réel / Coût BTL)
  rateAmount: number;
  effectiveDate: string;
  version: number;
}

export type EventStatus = 'Planifié' | 'En cours' | 'Terminé' | 'Annulé';

export interface CampaignEvent {
  id: string;
  eventDate: string;
  name: string;
  clientId: string;
  clientName?: string;
  regionId: string;
  regionName?: string;
  status: EventStatus;
  notes?: string;
  createdAt: string;
  // Computed totals
  totalAmount?: number;
  totalPaid?: number;
  totalPending?: number;
  mediaCount?: number;
}

export type ExpenseType = 'Transport' | 'Tarif Média';

export interface MediaByEvent {
  id: string;
  eventDate: string; // derived or overridden
  eventId: string;
  eventName?: string;
  mediaId: string;
  mediaName?: string;
  proofOfDiffusion: string; // empty string means unverified / zero amount
  podLinks: string[]; // URLs or attachment paths
  expenseType: ExpenseType;
  amount: number; // Prix Catalogue Client (Facturé)
  costAmount?: number; // Prix Réel BTL (Coût interne)
  paid: number; // auto-calculated from payments
  pending: number; // auto-calculated amount - paid
  focalPointName?: string;
  phone?: string;
  clientId?: string;
  clientName?: string;
  updatedAt: string;
  notes?: string;
}

export interface MediaPayment {
  id: string;
  paymentDate: string;
  mediaId: string;
  mediaName?: string;
  eventId: string;
  eventName?: string;
  focalPointName?: string;
  clientId?: string;
  clientName?: string;
  amount: number;
  paymentMethod: 'Virement' | 'Chèque' | 'Mobile Money' | 'Espèces';
  referenceNo: string;
  notes?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  entityType: 'media_event' | 'event' | 'payment';
  entityId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  entityType: 'media_event' | 'event' | 'payment';
  entityId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'Création' | 'Modification' | 'Suppression' | 'Export' | 'Import' | 'Connexion';
  entityType: string;
  entityId?: string;
  details: string;
  timestamp: string;
}

export interface SavedView {
  id: string;
  name: string;
  tab: string;
  filters: Record<string, any>;
  visibleColumns: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  clientId: string;
  clientName?: string;
  amount: number;
  supportAmount: number;
  fpcPercent: number;
  agencyFeesPercent: number;
  poDate: string;
  status: 'Actif' | 'Clôturé' | 'En attente';
  notes?: string;
  createdAt: string;
}

