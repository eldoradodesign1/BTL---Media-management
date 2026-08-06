import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Database,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  Sparkles,
  Server,
  ShieldCheck,
  Layers,
  Code,
  Keyboard,
  Command,
  Edit2
} from 'lucide-react';
import { DEFAULT_SHORTCUT_ACTIONS } from '../../types';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    resetToDefaultData,
    addNotification,
    setIsSupabaseModalOpen,
    isSupabaseConnected,
    setIsShortcutsModalOpen,
    currentUser,
    getUserShortcutKeys,
    updateUserShortcut,
    resetUserShortcutsToDefault
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingKeys, setEditingKeys] = useState<string>('');
  const isSuperAdmin = currentUser?.role === 'super-admin';

  const sqlSchemaText = `-- =========================================================
-- MEDIA CAMPAIGN MANAGER - SUPABASE & POSTGRESQL SCHEMA DDL
-- Flexible Architecture (Supports string & UUID IDs with RLS)
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS roles (id VARCHAR(100) PRIMARY KEY, code VARCHAR(50) UNIQUE NOT NULL, name VARCHAR(100) NOT NULL, description TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS users (id VARCHAR(100) PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, full_name VARCHAR(150) NOT NULL, role_id VARCHAR(100), avatar_url TEXT, client_id VARCHAR(100), password VARCHAR(255) DEFAULT '123456', status VARCHAR(20) DEFAULT 'active', created_at TIMESTAMPTZ DEFAULT NOW());

-- Migration pour utilisateurs :
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT '123456';
ALTER TABLE users ADD COLUMN IF NOT EXISTS client_id VARCHAR(100);
CREATE TABLE IF NOT EXISTS regions (id VARCHAR(100) PRIMARY KEY, name VARCHAR(100) NOT NULL, code VARCHAR(10) UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS clients (id VARCHAR(100) PRIMARY KEY, name VARCHAR(150) NOT NULL, code VARCHAR(20) UNIQUE NOT NULL, contact_person VARCHAR(100), email VARCHAR(150), phone VARCHAR(50), created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS media_types (id VARCHAR(100) PRIMARY KEY, code VARCHAR(50) UNIQUE NOT NULL, label VARCHAR(100) NOT NULL, icon VARCHAR(50));
CREATE TABLE IF NOT EXISTS focal_points (id VARCHAR(100) PRIMARY KEY, name VARCHAR(150) NOT NULL, phone VARCHAR(50) NOT NULL, email VARCHAR(150), client_id VARCHAR(100), media_id VARCHAR(100), created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS medias (id VARCHAR(100) PRIMARY KEY, name VARCHAR(150) NOT NULL, location VARCHAR(100) NOT NULL, type_id VARCHAR(100), transport_fee NUMERIC(12, 2) DEFAULT 0.00, phone VARCHAR(50), default_focal_point_id VARCHAR(100), created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS pricing (id VARCHAR(100) PRIMARY KEY, media_id VARCHAR(100) NOT NULL, client_id VARCHAR(100) NOT NULL, rate_type VARCHAR(20) NOT NULL DEFAULT 'catalog', rate_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00, effective_date DATE DEFAULT CURRENT_DATE, version INT DEFAULT 1, CONSTRAINT unique_media_client_rate_type UNIQUE(media_id, client_id, rate_type));

-- Script de migration si les tables existent déjà avec d'anciennes versions :
ALTER TABLE pricing ADD COLUMN IF NOT EXISTS rate_type VARCHAR(20) NOT NULL DEFAULT 'catalog';
ALTER TABLE pricing DROP CONSTRAINT IF EXISTS unique_media_client_pricing;
ALTER TABLE pricing DROP CONSTRAINT IF EXISTS unique_media_client_rate_type;
ALTER TABLE pricing ADD CONSTRAINT unique_media_client_rate_type UNIQUE(media_id, client_id, rate_type);
ALTER TABLE medias ADD COLUMN IF NOT EXISTS default_focal_point_id VARCHAR(100);
CREATE TABLE IF NOT EXISTS events (id VARCHAR(100) PRIMARY KEY, event_date DATE NOT NULL, name VARCHAR(200) NOT NULL, client_id VARCHAR(100) NOT NULL, region_id VARCHAR(100) NOT NULL, status VARCHAR(50) DEFAULT 'Planifié', notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS media_events (id VARCHAR(100) PRIMARY KEY, event_id VARCHAR(100) NOT NULL, media_id VARCHAR(100) NOT NULL, proof_of_diffusion TEXT, expense_type VARCHAR(50), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS payment_categories (id VARCHAR(100) PRIMARY KEY, code VARCHAR(50) UNIQUE NOT NULL, label VARCHAR(100) NOT NULL, description TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
INSERT INTO payment_categories (id, code, label, description) VALUES
  ('cat-vir', 'Virement', 'Virement Bancaire', 'Transfert direct compte à compte'),
  ('cat-mm', 'Mobile Money', 'Mobile Money', 'M-Pesa, Airtel Money, Orange Money'),
  ('cat-chk', 'Chèque', 'Chèque Bancaire', 'Paiement par chèque certifié ou classique'),
  ('cat-esp', 'Espèces', 'Espèces (Caisse)', 'Règlement direct en liquide / caisse')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS media_payments (id VARCHAR(100) PRIMARY KEY, payment_date DATE NOT NULL DEFAULT CURRENT_DATE, media_id VARCHAR(100) NOT NULL, event_id VARCHAR(100) NOT NULL, client_id VARCHAR(100), focal_point_id VARCHAR(100), amount NUMERIC(12, 2) NOT NULL, payment_method VARCHAR(50) NOT NULL DEFAULT 'Virement', reference_no VARCHAR(100), notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS purchase_orders (id VARCHAR(100) PRIMARY KEY, po_number VARCHAR(100) NOT NULL, client_id VARCHAR(100) NOT NULL, amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00, support_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00, fpc_percent NUMERIC(5, 2) NOT NULL DEFAULT 5.00, agency_fees_percent NUMERIC(5, 2) NOT NULL DEFAULT 14.00, po_date DATE NOT NULL DEFAULT CURRENT_DATE, status VARCHAR(20) DEFAULT 'Actif', notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS audit_logs (id VARCHAR(100) PRIMARY KEY, user_id VARCHAR(100), user_name VARCHAR(150), action VARCHAR(50) NOT NULL, entity_type VARCHAR(50) NOT NULL, entity_id VARCHAR(100), details TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS password_reset_requests (id VARCHAR(100) PRIMARY KEY, email VARCHAR(150) NOT NULL, user_name VARCHAR(150), reason TEXT, status VARCHAR(20) DEFAULT 'En attente', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS user_shortcuts (id VARCHAR(100) PRIMARY KEY, user_id VARCHAR(100) NOT NULL, action_id VARCHAR(100) NOT NULL, keys VARCHAR(50) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), CONSTRAINT unique_user_action_shortcut UNIQUE(user_id, action_id));

-- Enable RLS and add public access policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE focal_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE medias ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shortcuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Payment Categories" ON payment_categories;
CREATE POLICY "Public Payment Categories" ON payment_categories FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public User Shortcuts" ON user_shortcuts;
CREATE POLICY "Public User Shortcuts" ON user_shortcuts FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Roles" ON roles;
CREATE POLICY "Public Roles" ON roles FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Users" ON users;
CREATE POLICY "Public Users" ON users FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Regions" ON regions;
CREATE POLICY "Public Regions" ON regions FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Clients" ON clients;
CREATE POLICY "Public Clients" ON clients FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public FocalPoints" ON focal_points;
CREATE POLICY "Public FocalPoints" ON focal_points FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Medias" ON medias;
CREATE POLICY "Public Medias" ON medias FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Pricing" ON pricing;
CREATE POLICY "Public Pricing" ON pricing FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Events" ON events;
CREATE POLICY "Public Events" ON events FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public MediaEvents" ON media_events;
CREATE POLICY "Public MediaEvents" ON media_events FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Payments" ON media_payments;
CREATE POLICY "Public Payments" ON media_payments FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Purchase Orders" ON purchase_orders;
CREATE POLICY "Public Purchase Orders" ON purchase_orders FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Public Audit" ON audit_logs;
CREATE POLICY "Public Audit" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopied(true);
    addNotification({
      type: 'success',
      title: 'Schéma Copié',
      message: 'Le script SQL DDL Supabase a été copié dans le presse-papier.',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadSql = () => {
    const blob = new Blob([sqlSchemaText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schema_supabase_media_campaign.sql';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">
            <Settings className="w-4 h-4" />
            <span>Paramètres & Déploiement</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Configuration & Schéma SQL Supabase</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Personnalisation des thèmes, inspection de l'architecture SQL PostgreSQL normalisée et réinitialisation.
          </p>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Thème & Arrière-Plan Abstrait</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'dark'
                ? 'bg-cyan-500/20 border-cyan-400/60 ring-2 ring-cyan-400/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
              <Moon className="w-4 h-4 text-cyan-400" />
              <span>Dark (Par défaut)</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bleu nuit, verre fumé et fond abstrait "fumée bleue" généré par IA.
            </p>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'light'
                ? 'bg-sky-500/20 border-sky-400/60 ring-2 ring-sky-400/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
              <Sun className="w-4 h-4 text-sky-400" />
              <span>Light</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Blanc cassé, bleu pastel et texture "papier abstrait pastel".
            </p>
          </button>

          <button
            onClick={() => setTheme('classic')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              theme === 'classic'
                ? 'bg-indigo-500/20 border-indigo-400/60 ring-2 ring-indigo-400/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Classic</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspiré Microsoft Fluent, dominante bleue et formes géométriques.
            </p>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Section - Editable Per User */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-cyan-400" />
              <span>Raccourcis Clavier Personnalisés par Utilisateur</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configuration individuelle enregistrée pour <strong className="text-cyan-300">{currentUser?.name}</strong> ({currentUser?.email}).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => resetUserShortcutsToDefault()}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 font-semibold text-xs transition-all flex items-center gap-1.5"
              title="Restaurer la configuration par défaut"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Réinitialiser</span>
            </button>

            <button
              onClick={() => setIsShortcutsModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-all flex items-center gap-1.5"
            >
              <Command className="w-3.5 h-3.5" />
              <span>Guide des Touches</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
          {DEFAULT_SHORTCUT_ACTIONS.map((action) => {
            const activeKeys = getUserShortcutKeys(action.actionId);
            const isEditing = editingActionId === action.actionId;

            return (
              <div
                key={action.actionId}
                className={`p-3.5 rounded-2xl bg-black/40 border transition-all flex flex-col justify-between gap-2 ${
                  isEditing ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 bg-slate-950/80' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-xs">{action.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{action.description}</div>
                  </div>

                  {!isEditing ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/15 font-mono text-[10px] text-cyan-300 font-bold shadow-inner">
                        {activeKeys}
                      </kbd>
                      <button
                        onClick={() => {
                          setEditingActionId(action.actionId);
                          setEditingKeys(activeKeys);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Modifier ce raccourci"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>

                {isEditing && (
                  <div className="mt-1 pt-2 border-t border-white/10 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingKeys}
                      onChange={(e) => setEditingKeys(e.target.value)}
                      placeholder="Ex: Ctrl + K, Alt + S"
                      className="flex-1 px-2 py-1 rounded-xl bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      autoFocus
                    />
                    <button
                      onClick={async () => {
                        if (editingKeys.trim()) {
                          await updateUserShortcut(action.actionId, editingKeys.trim());
                        }
                        setEditingActionId(null);
                      }}
                      className="px-2 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] transition-all flex items-center gap-1 shrink-0"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>OK</span>
                    </button>
                    <button
                      onClick={() => setEditingActionId(null)}
                      className="px-2 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-[11px] transition-colors shrink-0"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SuperAdmin Only Sections */}
      {isSuperAdmin && (
        <>
          {/* Live Supabase Connection */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Connexion Supabase PostgreSQL</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isSupabaseConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {isSupabaseConnected ? 'Connecté & Synchronisé' : 'Configuration Requise / Offline'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                Liez l'application à votre projet Supabase (URL + Anon Key) pour synchroniser la base de données en temps réel et conserver Supabase comme source unique de vérité.
              </p>
            </div>

            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 shrink-0 flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>Configurer la Clé Supabase</span>
            </button>
          </div>

          {/* Supabase SQL DDL Exporter */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-white/15 backdrop-blur-2xl shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Architecture BDD PostgreSQL Normalisée (Supabase DDL)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Script SQL prêt à exécuter dans l'éditeur SQL Supabase pour créer la base de données de production.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copySql}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{copied ? 'Copié !' : 'Copier SQL'}</span>
                </button>
                <button
                  onClick={downloadSql}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger schema.sql</span>
                </button>
              </div>
            </div>

            {/* Code Block */}
            <div className="relative rounded-2xl bg-black/60 border border-white/10 p-4 font-mono text-xs text-cyan-300 max-h-80 overflow-y-auto leading-relaxed shadow-inner">
              <pre>{sqlSchemaText}</pre>
            </div>
          </div>

          {/* Data Reset */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-rose-500/30 backdrop-blur-2xl shadow-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>Réinitialisation des Données</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Restaure les données de démonstration d'origine et efface le stockage local.
              </p>
            </div>

            <button
              onClick={resetToDefaultData}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-semibold text-xs rounded-xl transition-all"
            >
              Restaurer Données
            </button>
          </div>
        </>
      )}
    </div>
  );
};
