import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, Copy, RefreshCw, Server, X, ExternalLink, Key, Link as LinkIcon } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, resetSupabaseClient } from '../../lib/supabase';
import { supabaseService } from '../../lib/supabaseService';
import { useApp } from '../../context/AppContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { addNotification, syncFromSupabase, pushAllDataToSupabase } = useApp();
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      if (config.isConfigured) {
        testConn();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const testConn = async () => {
    setStatus('testing');
    setStatusMessage('Vérification de la connexion Supabase...');
    const res = await supabaseService.testConnection();
    if (res.success) {
      setStatus('success');
      setStatusMessage(res.message);
    } else {
      setStatus('error');
      setStatusMessage(res.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    resetSupabaseClient();
    addNotification({
      type: 'info',
      title: 'Configuration sauvegardée',
      message: 'Client Supabase réinitialisé.'
    });
    await testConn();
    await syncFromSupabase();
  };

  const handleCopySql = () => {
    const sqlSchema = `-- MEDIA CAMPAIGN MANAGER - SUPABASE SCHEMA (Compatible with String & UUID IDs)
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

-- Script de migration si la table pricing existe déjà sans rate_type :
ALTER TABLE pricing ADD COLUMN IF NOT EXISTS rate_type VARCHAR(20) NOT NULL DEFAULT 'catalog';
ALTER TABLE pricing DROP CONSTRAINT IF EXISTS unique_media_client_pricing;
ALTER TABLE pricing DROP CONSTRAINT IF EXISTS unique_media_client_rate_type;
ALTER TABLE pricing ADD CONSTRAINT unique_media_client_rate_type UNIQUE(media_id, client_id, rate_type);
CREATE TABLE IF NOT EXISTS events (id VARCHAR(100) PRIMARY KEY, event_date DATE NOT NULL, name VARCHAR(200) NOT NULL, client_id VARCHAR(100) NOT NULL, region_id VARCHAR(100) NOT NULL, status VARCHAR(50) DEFAULT 'Planifié', notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS media_events (id VARCHAR(100) PRIMARY KEY, event_id VARCHAR(100) NOT NULL, media_id VARCHAR(100) NOT NULL, proof_of_diffusion TEXT, expense_type VARCHAR(50), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS media_payments (id VARCHAR(100) PRIMARY KEY, payment_date DATE NOT NULL DEFAULT CURRENT_DATE, media_id VARCHAR(100) NOT NULL, event_id VARCHAR(100) NOT NULL, client_id VARCHAR(100), focal_point_id VARCHAR(100), amount NUMERIC(12, 2) NOT NULL, payment_method VARCHAR(50) NOT NULL, reference_no VARCHAR(100), notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS audit_logs (id VARCHAR(100) PRIMARY KEY, user_id VARCHAR(100), user_name VARCHAR(150), action VARCHAR(50) NOT NULL, entity_type VARCHAR(50) NOT NULL, entity_id VARCHAR(100), details TEXT, created_at TIMESTAMPTZ DEFAULT NOW());

-- Enable RLS and add public access policies
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE focal_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE medias ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

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
DROP POLICY IF EXISTS "Public Audit" ON audit_logs;
CREATE POLICY "Public Audit" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
`;
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    addNotification({
      type: 'success',
      title: 'Schéma SQL Copié',
      message: 'Collez ce script dans le SQL Editor de Supabase pour créer toutes les tables.'
    });
  };

  const handleSeedSupabase = async () => {
    setIsSyncing(true);
    const success = await pushAllDataToSupabase();
    setIsSyncing(false);
    if (success) {
      addNotification({
        type: 'success',
        title: 'Données poussées sur Supabase',
        message: 'Toutes les tables ont été peuplées avec succès.'
      });
      await testConn();
    } else {
      addNotification({
        type: 'error',
        title: 'Échec de l\'envoi',
        message: 'Vérifiez la connexion ou si les tables existent sur Supabase.'
      });
    }
  };

  const handlePullFromSupabase = async () => {
    setIsSyncing(true);
    const success = await syncFromSupabase();
    setIsSyncing(false);
    if (success) {
      addNotification({
        type: 'success',
        title: 'Données téléchargées depuis Supabase',
        message: 'L\'application est maintenant alignée à 100% avec Supabase.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/30 to-blue-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Base de Données Supabase (Unique Source)
              </h2>
              <p className="text-xs text-slate-400">
                Connectez votre projet Supabase PostgreSQL pour centraliser vos données
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Live Status Card */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            status === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : status === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : status === 'testing'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : 'bg-white/5 border-white/10 text-slate-300'
          }`}>
            <div className="flex items-center gap-3">
              {status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
              {status === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
              {status === 'testing' && <RefreshCw className="w-5 h-5 animate-spin text-blue-400 shrink-0" />}
              {status === 'idle' && <Server className="w-5 h-5 text-slate-400 shrink-0" />}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">Statut de la Connexion</div>
                <div className="text-xs font-mono mt-0.5">
                  {statusMessage || 'Aucun test effectué pour le moment.'}
                </div>
              </div>
            </div>

            <button
              onClick={testConn}
              disabled={status === 'testing'}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === 'testing' ? 'animate-spin' : ''}`} />
              Tester
            </button>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                URL du Projet Supabase (VITE_SUPABASE_URL)
              </label>
              <input
                type="url"
                required
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                Clé Anonyme (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Enregistrer & Connecter
              </button>
            </div>
          </form>

          {/* Actions & Tools */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Outils & Initialisation de la Base de Données
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Copy SQL Button */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Copy className="w-4 h-4 text-emerald-400" />
                    1. Script DDL SQL Supabase
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Copiez le script de création de tables à exécuter dans le SQL Editor de Supabase.
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="w-full py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedSql ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Schéma Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copier le Script SQL
                    </>
                  )}
                </button>
              </div>

              {/* Seed Supabase Button */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-400" />
                    2. Synchronisation des Données
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Envoyez les données initiales vers Supabase ou téléchargez la dernière version.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePullFromSupabase}
                    disabled={isSyncing || status !== 'success'}
                    className="flex-1 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                    title="Télécharger depuis Supabase"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    Pull (Recevoir)
                  </button>
                  <button
                    onClick={handleSeedSupabase}
                    disabled={isSyncing || status !== 'success'}
                    className="flex-1 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                    title="Envoyer vers Supabase"
                  >
                    <Database className="w-3 h-3" />
                    Push (Envoyer)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-950 flex justify-between items-center text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Documentation Supabase :</span>
            <a
              href="https://supabase.com/docs"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              supabase.com/docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
