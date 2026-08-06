import { getSupabaseClient } from './supabase';
import {
  Region,
  Client,
  FocalPoint,
  Media,
  PricingRate,
  CampaignEvent,
  MediaByEvent,
  MediaPayment,
  AuditLog,
  PurchaseOrder,
  User,
  UserRole,
  RateType
} from '../types';

/**
 * Converts any custom string ID (e.g. 'cli-1') to a valid deterministic UUID format required by PostgreSQL uuid columns.
 */
export function ensureUuid(id: string | null | undefined): string | null {
  if (!id) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;

  let hex = '';
  for (let i = 0; i < id.length; i++) {
    hex += id.charCodeAt(i).toString(16);
  }
  hex = hex.padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(12, 15)}-a${hex.slice(15, 18)}-${hex.slice(18, 30)}`;
}

/**
 * Helper to upsert single or multiple records into Supabase.
 * Cleans empty string IDs to null first. If Postgres fails with UUID type syntax error (22P02),
 * automatically converts all ID fields to UUIDs and retries.
 */
async function upsertWithFallback(tableName: string, rawPayload: any | any[]) {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: null };

  const rawArray = Array.isArray(rawPayload) ? rawPayload : [rawPayload];
  if (rawArray.length === 0) return { error: null };

  const sanitizeObj = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    const res: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (key === 'id' || key.endsWith('_id')) {
        if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
          res[key] = null;
        } else {
          res[key] = val;
        }
      } else {
        res[key] = val;
      }
    }
    return res;
  };

  let cleanedArray = rawArray.map(sanitizeObj);

  let { error } = await supabase.from(tableName).upsert(cleanedArray);

  // If missing column error in Supabase schema cache (e.g. Could not find the 'default_focal_point_id' column of 'medias')
  if (error && error.message.includes('Could not find the') && error.message.includes('column')) {
    const match = error.message.match(/Could not find the '([^']+)' column/i);
    if (match && match[1]) {
      const missingCol = match[1];
      console.warn(`Supabase ${tableName} is missing column '${missingCol}'. Retrying upsert without it.`);
      cleanedArray = cleanedArray.map((obj: any) => {
        const copy = { ...obj };
        delete copy[missingCol];
        return copy;
      });
      const retry = await supabase.from(tableName).upsert(cleanedArray);
      error = retry.error;
    }
  }

  if (error && (error.code === '22P02' || error.message.toLowerCase().includes('uuid'))) {
    const convertObjToUuid = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      const res: any = {};
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if ((key === 'id' || key.endsWith('_id')) && typeof val === 'string' && val.trim().length > 0) {
          res[key] = ensureUuid(val);
        } else {
          res[key] = val;
        }
      }
      return res;
    };

    const uuidArray = cleanedArray.map(convertObjToUuid);
    const retry = await supabase.from(tableName).upsert(uuidArray);
    error = retry.error;

    if (error && error.message.includes('Could not find the') && error.message.includes('column')) {
      const match = error.message.match(/Could not find the '([^']+)' column/i);
      if (match && match[1]) {
        const missingCol = match[1];
        const strippedUuidArray = uuidArray.map((obj: any) => {
          const copy = { ...obj };
          delete copy[missingCol];
          return copy;
        });
        const retry2 = await supabase.from(tableName).upsert(strippedUuidArray);
        error = retry2.error;
      }
    }
  }

  if (error) {
    console.error(`Supabase ${tableName} upsert error:`, error.message, error.details || '');
  }

  return { error };
}

async function deleteWithFallback(tableName: string, id: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  let { error } = await supabase.from(tableName).delete().eq('id', id);
  if (error && (error.code === '22P02' || error.message.toLowerCase().includes('uuid'))) {
    const uuidId = ensureUuid(id);
    if (uuidId) {
      await supabase.from(tableName).delete().eq('id', uuidId);
    }
  }
}

/**
 * Service providing dual local & real-time Supabase sync.
 */
export const supabaseService = {
  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { success: false, message: 'Supabase n\'est pas configuré.' };
    }
    try {
      const { data, error } = await supabase.from('regions').select('id').limit(1);
      if (error && error.code !== 'PGRST116') {
        return { success: false, message: `Erreur Supabase: ${error.message}` };
      }
      return { success: true, message: 'Connexion à Supabase réussie!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Impossible de joindre Supabase.' };
    }
  },

  // Load all initial data from Supabase
  async loadAllData() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      const [
        { data: regions, error: errReg },
        { data: clients, error: errCli },
        { data: focalPoints, error: errFp },
        { data: medias, error: errMed },
        { data: pricing, error: errPrc },
        { data: events, error: errEvt },
        { data: mediaEvents, error: errMe },
        { data: mediaPayments, error: errPay },
        { data: purchaseOrders, error: errPo },
        { data: auditLogs, error: errAud },
        { data: users, error: errUsr },
        { data: roles, error: errRol }
      ] = await Promise.all([
        supabase.from('regions').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('focal_points').select('*'),
        supabase.from('medias').select('*'),
        supabase.from('pricing').select('*'),
        supabase.from('events').select('*'),
        supabase.from('media_events').select('*'),
        supabase.from('media_payments').select('*'),
        supabase.from('purchase_orders').select('*'),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('users').select('*'),
        supabase.from('roles').select('*')
      ]);

      if (errReg || errCli || errMed || errEvt || errUsr) {
        console.warn('Supabase fetch warnings:', { errReg, errCli, errMed, errEvt, errUsr });
      }

      const roleCodeMap: Record<string, UserRole> = {
        'SUPER_ADMIN': 'super-admin',
        'ADMIN': 'admin',
        'RESP_FINANCE': 'finance',
        'RESP_MEDIA': 'media_manager',
        'CLIENT': 'client',
        'AUDITOR': 'auditor',
        'AUDITEUR': 'auditor'
      };

      const mappedUsers: User[] | undefined = users?.map(u => {
        const roleObj = roles?.find((r: any) => r.id === u.role_id);
        const rawCode = (roleObj?.code || u.role_code || u.role || 'ADMIN').toUpperCase();
        const role: UserRole = roleCodeMap[rawCode] || (rawCode.toLowerCase().replace('_', '-') as UserRole) || 'admin';

        let clientId = u.client_id || undefined;
        if (!clientId && role === 'client' && clients) {
          const uName = (u.full_name || u.name || '').toLowerCase();
          const uEmail = (u.email || '').toLowerCase();
          const matchedCli = clients.find((c: any) => {
            const cName = (c.name || '').toLowerCase();
            const cEmail = (c.email || '').toLowerCase();
            return (
              (cName && uName && (cName.includes(uName) || uName.includes(cName))) ||
              (cEmail && uEmail && cEmail === uEmail)
            );
          });
          if (matchedCli) {
            clientId = matchedCli.id;
          }
        }

        return {
          id: u.id,
          name: u.full_name || u.name || u.email,
          email: u.email || '',
          role: role,
          avatar: u.avatar_url || u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.full_name || u.email)}`,
          clientId: clientId,
          password: u.password || '123456'
        };
      });

      return {
        users: mappedUsers,

        regions: regions?.map(r => ({
          id: r.id,
          name: r.name,
          code: r.code,
          createdAt: r.created_at || new Date().toISOString()
        })) as Region[] | undefined,

        clients: clients?.map(c => ({
          id: c.id,
          name: c.name,
          code: c.code,
          contactPerson: c.contact_person || '',
          email: c.email || '',
          phone: c.phone || '',
          createdAt: c.created_at || new Date().toISOString()
        })) as Client[] | undefined,

        focalPoints: focalPoints?.map(f => {
          const m = medias?.find((mItem: any) => mItem.id === f.media_id);
          const c = clients?.find((cItem: any) => cItem.id === f.client_id);
          return {
            id: f.id,
            name: f.name,
            phone: f.phone || '',
            email: f.email || '',
            mediaId: f.media_id || '',
            mediaName: f.media_name || m?.name || '',
            clientId: f.client_id || '',
            clientName: f.client_name || c?.name || ''
          };
        }) as FocalPoint[] | undefined,

        medias: medias?.map(m => ({
          id: m.id,
          name: m.name,
          location: m.location || '',
          type: m.type_code || m.type || 'TV',
          transportFee: Number(m.transport_fee || 0),
          phone: m.phone || '',
          focalPointId: m.default_focal_point_id || '',
          createdAt: m.created_at || new Date().toISOString()
        })) as Media[] | undefined,

        pricingRates: pricing?.map(p => ({
          id: p.id,
          mediaId: p.media_id,
          clientId: p.client_id,
          rateType: (p.rate_type as RateType) || 'catalog',
          rateAmount: Number(p.rate_amount || 0),
          effectiveDate: p.effective_date || new Date().toISOString().split('T')[0],
          version: p.version || 1
        })) as PricingRate[] | undefined,

        events: events?.map(e => ({
          id: e.id,
          eventDate: e.event_date,
          name: e.name,
          clientId: e.client_id,
          regionId: e.region_id,
          status: e.status || 'Planifié',
          notes: e.notes || '',
          createdAt: e.created_at || new Date().toISOString()
        })) as CampaignEvent[] | undefined,

        mediaByEvents: mediaEvents?.map(me => ({
          id: me.id,
          eventId: me.event_id,
          mediaId: me.media_id,
          proofOfDiffusion: me.proof_of_diffusion || '',
          podLinks: me.pod_links ? (Array.isArray(me.pod_links) ? me.pod_links : [me.pod_links]) : [],
          expenseType: me.expense_type || 'Tarif Média',
          amount: Number(me.amount || 0),
          paid: Number(me.paid || 0),
          pending: Number(me.pending || 0),
          updatedAt: me.updated_at || new Date().toISOString(),
          eventDate: me.event_date || ''
        })) as MediaByEvent[] | undefined,

        mediaPayments: mediaPayments?.map(p => ({
          id: p.id,
          paymentDate: p.payment_date,
          mediaId: p.media_id,
          eventId: p.event_id,
          clientId: p.client_id,
          amount: Number(p.amount || 0),
          paymentMethod: p.payment_method || 'Virement',
          referenceNo: p.reference_no || '',
          notes: p.notes || '',
          createdAt: p.created_at || new Date().toISOString()
        })) as MediaPayment[] | undefined,

        purchaseOrders: purchaseOrders?.map(po => ({
          id: po.id,
          poNumber: po.po_number,
          clientId: po.client_id,
          amount: Number(po.amount || 0),
          supportAmount: Number(po.support_amount || 0),
          fpcPercent: Number(po.fpc_percent || 5),
          agencyFeesPercent: Number(po.agency_fees_percent || 14),
          poDate: po.po_date || new Date().toISOString().split('T')[0],
          status: po.status || 'Actif',
          notes: po.notes || '',
          createdAt: po.created_at || new Date().toISOString()
        })) as PurchaseOrder[] | undefined,

        auditLogs: auditLogs?.map(a => ({
          id: a.id,
          userId: a.user_id || 'system',
          userName: a.user_name || 'Utilisateur',
          action: a.action || 'Modification',
          entityType: a.entity_type || 'Général',
          entityId: a.entity_id,
          details: a.details || '',
          timestamp: a.created_at || new Date().toISOString()
        })) as AuditLog[] | undefined
      };
    } catch (err) {
      console.error('Error loading Supabase data:', err);
      return null;
    }
  },

  // Save / Sync Event
  async saveEvent(evt: CampaignEvent) {
    await upsertWithFallback('events', {
      id: evt.id,
      event_date: evt.eventDate,
      name: evt.name,
      client_id: evt.clientId || null,
      region_id: evt.regionId || null,
      status: evt.status || 'Planifié',
      notes: evt.notes || '',
      created_at: evt.createdAt || new Date().toISOString().split('T')[0]
    });
  },

  async deleteEvent(id: string) {
    await deleteWithFallback('events', id);
  },

  // Save / Sync MediaByEvent
  async saveMediaByEvent(mbe: MediaByEvent) {
    await upsertWithFallback('media_events', {
      id: mbe.id,
      event_id: mbe.eventId,
      media_id: mbe.mediaId,
      proof_of_diffusion: mbe.proofOfDiffusion || '',
      expense_type: mbe.expenseType,
      updated_at: new Date().toISOString()
    });
  },

  async deleteMediaByEvent(id: string) {
    await deleteWithFallback('media_events', id);
  },

  // Save / Sync MediaPayment
  async saveMediaPayment(pay: MediaPayment) {
    await upsertWithFallback('media_payments', {
      id: pay.id,
      payment_date: pay.paymentDate,
      media_id: pay.mediaId,
      event_id: pay.eventId,
      client_id: pay.clientId || null,
      amount: pay.amount,
      payment_method: pay.paymentMethod,
      reference_no: pay.referenceNo || '',
      notes: pay.notes || '',
      created_at: pay.createdAt
    });
  },

  async deleteMediaPayment(id: string) {
    await deleteWithFallback('media_payments', id);
  },

  // Save / Sync Pricing
  async savePricingRate(p: PricingRate) {
    await upsertWithFallback('pricing', {
      id: p.id,
      media_id: p.mediaId,
      client_id: p.clientId,
      rate_type: p.rateType || 'catalog',
      rate_amount: p.rateAmount,
      effective_date: p.effectiveDate,
      version: p.version
    });
  },

  // Save / Sync Client
  async saveClient(c: Client) {
    await upsertWithFallback('clients', {
      id: c.id,
      name: c.name,
      code: c.code,
      contact_person: c.contactPerson,
      email: c.email,
      phone: c.phone,
      created_at: c.createdAt
    });
  },

  // Save / Sync Media
  async saveMedia(m: Media) {
    await upsertWithFallback('medias', {
      id: m.id,
      name: m.name,
      location: m.location,
      transport_fee: m.transportFee,
      phone: m.phone,
      default_focal_point_id: m.focalPointId || null,
      created_at: m.createdAt
    });
  },

  // Save / Sync Region
  async saveRegion(r: Region) {
    await upsertWithFallback('regions', {
      id: r.id,
      name: r.name,
      code: r.code,
      created_at: r.createdAt
    });
  },

  // Save / Sync Purchase Order
  async savePurchaseOrder(po: PurchaseOrder) {
    await upsertWithFallback('purchase_orders', {
      id: po.id,
      po_number: po.poNumber,
      client_id: po.clientId,
      amount: po.amount,
      support_amount: po.supportAmount,
      fpc_percent: po.fpcPercent,
      agency_fees_percent: po.agencyFeesPercent,
      po_date: po.poDate,
      status: po.status,
      notes: po.notes || '',
      created_at: po.createdAt
    });
  },

  // Delete Purchase Order
  async deletePurchaseOrder(id: string) {
    await deleteWithFallback('purchase_orders', id);
  },

  // Save / Sync Focal Point
  async saveFocalPoint(fp: FocalPoint) {
    await upsertWithFallback('focal_points', {
      id: fp.id,
      name: fp.name,
      phone: fp.phone,
      email: fp.email || '',
      media_id: fp.mediaId || null,
      client_id: fp.clientId || null
    });
  },

  // Save Audit Log
  async saveAuditLog(log: AuditLog) {
    await upsertWithFallback('audit_logs', {
      id: log.id,
      user_id: log.userId,
      user_name: log.userName,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId || null,
      details: log.details,
      created_at: log.timestamp
    });
  },

  // Seed initial tables in Supabase if empty
  async seedInitialData(initialData: {
    regions: Region[];
    clients: Client[];
    focalPoints: FocalPoint[];
    medias: Media[];
    pricingRates: PricingRate[];
    events: CampaignEvent[];
    mediaByEvents: MediaByEvent[];
    mediaPayments: MediaPayment[];
  }) {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      // Seed Regions
      if (initialData.regions?.length) {
        await upsertWithFallback(
          'regions',
          initialData.regions.map(r => ({
            id: r.id,
            name: r.name,
            code: r.code,
            created_at: r.createdAt
          }))
        );
      }

      // Seed Clients
      if (initialData.clients?.length) {
        await upsertWithFallback(
          'clients',
          initialData.clients.map(c => ({
            id: c.id,
            name: c.name,
            code: c.code,
            contact_person: c.contactPerson,
            email: c.email,
            phone: c.phone,
            created_at: c.createdAt
          }))
        );
      }

      // Seed Medias
      if (initialData.medias?.length) {
        await upsertWithFallback(
          'medias',
          initialData.medias.map(m => ({
            id: m.id,
            name: m.name,
            location: m.location,
            transport_fee: m.transportFee,
            phone: m.phone,
            created_at: m.createdAt
          }))
        );
      }

      // Seed Focal Points
      if (initialData.focalPoints?.length) {
        await upsertWithFallback(
          'focal_points',
          initialData.focalPoints.map(f => ({
            id: f.id,
            name: f.name,
            phone: f.phone,
            email: f.email || '',
            media_id: f.mediaId || null,
            client_id: f.clientId || null
          }))
        );
      }

      // Seed Pricing
      if (initialData.pricingRates?.length) {
        await upsertWithFallback(
          'pricing',
          initialData.pricingRates.map(p => ({
            id: p.id,
            media_id: p.mediaId,
            client_id: p.clientId,
            rate_type: p.rateType || 'catalog',
            rate_amount: p.rateAmount,
            effective_date: p.effectiveDate,
            version: p.version
          }))
        );
      }

      // Seed Events
      if (initialData.events?.length) {
        await upsertWithFallback(
          'events',
          initialData.events.map(e => ({
            id: e.id,
            event_date: e.eventDate,
            name: e.name,
            client_id: e.clientId,
            region_id: e.regionId,
            status: e.status,
            notes: e.notes || '',
            created_at: e.createdAt
          }))
        );
      }

      // Seed Media Events
      if (initialData.mediaByEvents?.length) {
        await upsertWithFallback(
          'media_events',
          initialData.mediaByEvents.map(m => ({
            id: m.id,
            event_id: m.eventId,
            media_id: m.mediaId,
            proof_of_diffusion: m.proofOfDiffusion,
            expense_type: m.expenseType,
            updated_at: m.updatedAt || new Date().toISOString()
          }))
        );
      }

      // Seed Media Payments
      if (initialData.mediaPayments?.length) {
        await upsertWithFallback(
          'media_payments',
          initialData.mediaPayments.map(p => ({
            id: p.id,
            payment_date: p.paymentDate,
            media_id: p.mediaId,
            event_id: p.eventId,
            client_id: p.clientId || null,
            amount: p.amount,
            payment_method: p.paymentMethod,
            reference_no: p.referenceNo || '',
            notes: p.notes || '',
            created_at: p.createdAt
          }))
        );
      }

      return true;
    } catch (err) {
      console.error('Failed to seed Supabase initial data:', err);
      return false;
    }
  },

  // Update User Profile in Supabase
  async updateUserProfile(userId: string, data: { name?: string; email?: string; avatar?: string; password?: string; clientId?: string }) {
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, message: 'Supabase non configuré.' };

    try {
      const payload: Record<string, any> = {};
      if (data.name !== undefined) payload.full_name = data.name;
      if (data.email !== undefined) payload.email = data.email;
      if (data.avatar !== undefined) payload.avatar_url = data.avatar;
      if (data.password !== undefined) payload.password = data.password;
      if (data.clientId !== undefined) payload.client_id = data.clientId;

      const { error } = await supabase.from('users').update(payload).eq('id', userId);
      if (error) {
        console.error('Erreur mise à jour utilisateur Supabase:', error);
        return { success: false, message: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Impossible de mettre à jour le profil.' };
    }
  },

  // Save / Upsert Single User
  async saveUser(user: User) {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      const { data: roles } = await supabase.from('roles').select('*');
      let roleId = null;
      if (roles) {
        const targetCode = user.role.toUpperCase().replace('-', '_');
        const matchedRole = roles.find((r: any) => r.code === targetCode || r.code.toLowerCase() === user.role.toLowerCase());
        if (matchedRole) roleId = matchedRole.id;
      }

      await upsertWithFallback('users', {
        id: user.id,
        email: user.email,
        full_name: user.name,
        role_id: roleId,
        avatar_url: user.avatar,
        client_id: user.clientId || null,
        password: user.password || '123456'
      });
      return true;
    } catch (err) {
      console.error('Erreur sauvegarde utilisateur Supabase:', err);
      return false;
    }
  },

  // Password Reset Requests Table Sync
  async savePasswordResetRequest(req: { id: string; email: string; userName?: string; reason?: string; status: string; createdAt: string }) {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    try {
      await upsertWithFallback('password_reset_requests', {
        id: req.id,
        email: req.email,
        user_name: req.userName || req.email,
        reason: req.reason || '',
        status: req.status || 'En attente',
        created_at: req.createdAt || new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error('Erreur sauvegarde demande mot de passe Supabase:', err);
      return false;
    }
  },

  async loadPasswordResetRequests() {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    try {
      const { data, error } = await supabase.from('password_reset_requests').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((item: any) => ({
        id: item.id,
        email: item.email,
        userName: item.user_name || item.email,
        reason: item.reason || '',
        status: item.status || 'En attente',
        createdAt: item.created_at
      }));
    } catch (err) {
      console.error('Erreur chargement demandes mot de passe Supabase:', err);
      return [];
    }
  }
};

