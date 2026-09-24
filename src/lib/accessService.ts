import { getAccessSupabaseClient, normalizePhone } from './accessSupabase';
import { User, UserRole, UserShortcut, PasswordResetRequest } from '../types';

const ROLE_MAP: Record<string, UserRole> = {
  super_admin: 'super-admin',
  superadmin: 'super-admin',
  admin: 'admin',
  sub_admin: 'sub_admin',
  supervisor: 'supervisor',
  operation: 'operations',
  operations: 'operations',
};

const ALLOWED_SOURCE_ROLES = new Set(Object.keys(ROLE_MAP));

const avatarFor = (row: any) => row.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(row.full_name || row.phone || row.id)}`;

const mapAccessUser = (row: any): User | null => {
  const sourceRole = String(row.role || '').trim().toLowerCase();
  if (!ALLOWED_SOURCE_ROLES.has(sourceRole)) return null;
  if (row.is_active === false) return null;
  return {
    id: row.id,
    name: row.full_name || row.phone || 'Utilisateur',
    email: '',
    phone: row.phone || row.whatsapp_phone || '',
    role: ROLE_MAP[sourceRole],
    avatar: avatarFor(row),
    password: row.password_hash || '',
  };
};

export const accessService = {
  async loadUsers(): Promise<User[]> {
    const client = getAccessSupabaseClient();
    if (!client) return [];
    const { data, error } = await client
      .from('users')
      .select('id,phone,whatsapp_phone,full_name,role,password_hash,avatar_url,is_active,supervisor_id')
      .limit(500);
    if (error || !data) {
      console.error('Erreur chargement utilisateurs d’accès:', error);
      return [];
    }
    return data.map(mapAccessUser).filter((user): user is User => Boolean(user));
  },

  async updateUserProfile(userId: string, data: { name?: string; phone?: string; avatar?: string; password?: string }) {
    const client = getAccessSupabaseClient();
    if (!client) return { success: false, message: 'Base utilisateurs non configurée.' };
    const payload: Record<string, string> = {};
    if (data.name !== undefined) payload.full_name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.avatar !== undefined) payload.avatar_url = data.avatar;
    if (data.password !== undefined) payload.password_hash = data.password;
    const { error } = await client.from('users').update(payload).eq('id', userId);
    return error ? { success: false, message: error.message } : { success: true };
  },

  async loadUserShortcuts(userId: string): Promise<UserShortcut[]> {
    const client = getAccessSupabaseClient();
    if (!client || !userId) return [];
    const { data, error } = await client.from('user_shortcuts').select('*').eq('user_id', userId);
    if (error || !data) return [];
    return data.map((item: any) => ({ id: item.id, userId: item.user_id, actionId: item.action_id, keys: item.keys }));
  },

  async saveUserShortcut(shortcut: UserShortcut): Promise<boolean> {
    const client = getAccessSupabaseClient();
    if (!client) return false;
    const { error } = await client.from('user_shortcuts').upsert({
      id: shortcut.id || `sc-${shortcut.userId}-${shortcut.actionId}`,
      user_id: shortcut.userId,
      action_id: shortcut.actionId,
      keys: shortcut.keys,
    });
    return !error;
  },

  async savePasswordResetRequest(req: PasswordResetRequest): Promise<boolean> {
    const client = getAccessSupabaseClient();
    if (!client) return false;
    const { error } = await client.from('password_reset_requests').upsert({
      id: req.id,
      phone: req.email,
      user_name: req.userName || req.email,
      reason: req.reason || '',
      status: req.status,
      created_at: req.createdAt,
    });
    return !error;
  },

  async loadPasswordResetRequests(): Promise<PasswordResetRequest[]> {
    const client = getAccessSupabaseClient();
    if (!client) return [];
    const { data, error } = await client.from('password_reset_requests').select('*').order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      email: item.phone || item.email || '',
      userName: item.user_name || item.phone || '',
      reason: item.reason || '',
      status: item.status || 'En attente',
      createdAt: item.created_at,
    }));
  },

  findByIdentifier(users: User[], identifier: string) {
    const normalized = identifier.trim().toLowerCase();
    const phone = normalizePhone(identifier);
    return users.find((user) =>
      user.id.toLowerCase() === normalized ||
      Boolean(user.phone && normalizePhone(user.phone) === phone) ||
      user.name.toLowerCase() === normalized
    );
  },
};
