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
  Code
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, resetToDefaultData, addNotification } = useApp();
  const [copied, setCopied] = useState(false);

  const sqlSchemaText = `-- =========================================================
-- MEDIA CAMPAIGN MANAGER - SUPABASE & POSTGRESQL SCHEMA DDL
-- Normalized Architecture for Enterprise Campaign Tracking
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ROLES & PERMISSIONS
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  avatar_url TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REGIONS
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENTS
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(150),
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDIAS
CREATE TABLE medias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  location VARCHAR(100) NOT NULL,
  type_id UUID,
  transport_fee NUMERIC(12, 2) DEFAULT 0.00,
  phone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRICING MATRIX
CREATE TABLE pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES medias(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  rate_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  effective_date DATE DEFAULT CURRENT_DATE,
  version INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_date DATE NOT NULL,
  name VARCHAR(200) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
  region_id UUID REFERENCES regions(id) ON DELETE RESTRICT,
  status VARCHAR(50) DEFAULT 'Planifié',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDIA_EVENTS (DIFFUSIONS)
CREATE TABLE media_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  media_id UUID REFERENCES medias(id) ON DELETE RESTRICT,
  proof_of_diffusion TEXT,
  expense_type VARCHAR(50),
  amount NUMERIC(12, 2) DEFAULT 0.00,
  paid NUMERIC(12, 2) DEFAULT 0.00,
  pending NUMERIC(12, 2) DEFAULT 0.00,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MEDIA_PAYMENTS
CREATE TABLE media_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  media_id UUID REFERENCES medias(id) ON DELETE RESTRICT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(50),
  reference_no VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;

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
    </div>
  );
};
