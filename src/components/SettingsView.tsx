import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { DEMO_LOGIN_CREDENTIALS } from '../data/seedData';
import {
  Shield,
  RotateCcw,
  AlertTriangle,
  Database,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Globe,
  Key,
  ExternalLink,
  Lock,
  Download,
  UploadCloud,
  Layers,
  Fingerprint,
} from 'lucide-react';
import { SUPABASE_SCHEMA_SQL } from '../lib/supabase';
import { PWAInstallButton } from './PWAInstallButton';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    resetDatabase,
    seedDemoDataToBackend,
    isSupabaseConnected,
    isSupabaseConfigured,
    isSyncing,
    lastSyncTime,
    syncError,
    supabaseConfig,
    syncWithSupabase,
    pushAllToSupabase,
    updateSupabaseCredentials,
    disconnectSupabase,
    quickLogin,
    setIsLoginModalOpen,
  } = useFarm();

  const [urlInput, setUrlInput] = useState(supabaseConfig.url || '');
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeedingBackend, setIsSeedingBackend] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    const res = await updateSupabaseCredentials(urlInput.trim(), keyInput.trim());
    setIsSaving(false);
    setSaveStatus(res);
  };

  const handleSeedBackendDemoData = async () => {
    setIsSeedingBackend(true);
    setSaveStatus(null);
    const res = await seedDemoDataToBackend();
    setIsSeedingBackend(false);
    setSaveStatus(res);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            System Settings & Backend Control
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage user login credentials, backend database seeding, Supabase PostgreSQL persistence, and PWA mobile installation.
          </p>
        </div>

        {/* 1. DEMO LOGIN DETAILS & ACCESS CONTROL */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-700" />
              <span>Demo Login Accounts & Credentials</span>
            </h3>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-xs font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200/80 px-2.5 py-1 rounded-lg transition cursor-pointer"
            >
              Open Login Portal
            </button>
          </div>

          <p className="text-xs text-slate-600">
            Current session: <strong>{currentUser.name}</strong> ({currentUser.email}) — Role: <span className="capitalize font-semibold text-emerald-800">{currentUser.role.replace('_', ' ')}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DEMO_LOGIN_CREDENTIALS.map((cred) => {
              const isCurrent = currentUser.email.toLowerCase() === cred.email.toLowerCase();
              return (
                <div
                  key={cred.email}
                  className={`p-3.5 rounded-xl border bg-white flex flex-col justify-between ${
                    isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cred.badgeColor}`}>
                        {cred.role === 'administrator' ? 'Administrator' : 'Farm Worker'}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-xs text-slate-900">{cred.name}</div>
                    <div className="text-[11px] text-slate-500">{cred.position}</div>

                    <div className="pt-2 border-t border-slate-100 font-mono text-[11px] text-slate-600 space-y-0.5">
                      <div><span className="text-slate-400">Email:</span> {cred.email}</div>
                      <div><span className="text-slate-400">Pass:</span> {cred.password}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => quickLogin(cred.email)}
                    className="mt-3 w-full py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                    <span>Switch to this User</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. BACKEND DATABASE & DEMO SEEDING */}
        <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-700 text-white rounded-xl shadow-xs">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Backend Database & Demo Data Sync</span>
                  {isSupabaseConnected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Supabase Cloud Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Local Storage Cache Active
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-600">
                  Ensure all demo farm plots, equipment, inventory, staff, and QR records exist in the backend database.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                title="Copy schema SQL to run in Supabase SQL editor"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Schema Copied!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {saveStatus && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                saveStatus.success
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {saveStatus.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{saveStatus.message}</span>
            </div>
          )}

          {/* Seeding Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSeedBackendDemoData}
              disabled={isSeedingBackend || isSyncing}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSeedingBackend ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5 text-amber-400" />}
              <span>Sync / Add All Demo Data to Backend</span>
            </button>

            {isSupabaseConnected && (
              <button
                type="button"
                onClick={() => syncWithSupabase()}
                disabled={isSyncing}
                className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-700' : ''}`} />
                <span>Fetch from Cloud</span>
              </button>
            )}
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSaveCredentials} className="space-y-3 pt-2 border-t border-emerald-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600 outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Anon / API Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-600 outline-none font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="submit"
                disabled={isSaving || isSyncing}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>Save Credentials & Connect</span>
              </button>

              {supabaseConfig.source === 'custom' && (
                <button
                  type="button"
                  onClick={disconnectSupabase}
                  className="text-xs text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Disconnect Custom Credentials
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 3. PROGRESSIVE WEB APP (PWA) INSTALLATION */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Progressive Web App (PWA) Mobile & Offline Support</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              PWA Ready
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Install this farm management system directly to your Android device, iPhone/iPad, or computer for instant offline access, standalone UI without browser bars, and faster camera barcode scanning.
          </p>

          <div className="pt-1 flex items-center gap-3">
            <PWAInstallButton variant="card" />
          </div>
        </div>

        {/* 4. SYSTEM RESET */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Reset Demo Database to Initial Seeds</span>
          </h3>
          <p className="text-xs text-red-700">
            Restores all initial demo plots, machinery, inventory items, workers, and QR codes for U and E Grace Foundation Farm.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all farm data to initial demo state?')) {
                resetDatabase();
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Database</span>
          </button>
        </div>

      </div>
    </div>
  );
};
