import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  Database,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  UploadCloud,
  Layers,
  Key,
  Globe,
  ExternalLink,
  Info,
} from 'lucide-react';
import { SUPABASE_SCHEMA_SQL } from '../lib/supabase';

export const SupabaseModal: React.FC = () => {
  const {
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
    isSupabaseModalOpen,
    setIsSupabaseModalOpen,
    plots,
    resources,
    inventory,
    workers,
    activities,
  } = useFarm();

  const [urlInput, setUrlInput] = useState(supabaseConfig.url || '');
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey || '');
  const [copiedSql, setCopiedSql] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isSupabaseModalOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setActionMessage(null);

    const res = await updateSupabaseCredentials(urlInput.trim(), keyInput.trim());
    setIsSaving(false);

    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
    } else {
      setActionMessage({ type: 'error', text: res.message });
    }
  };

  const handleManualSync = async () => {
    setActionMessage(null);
    const success = await syncWithSupabase();
    if (success) {
      setActionMessage({ type: 'success', text: 'Cloud database refreshed and synced successfully!' });
    } else {
      setActionMessage({ type: 'error', text: syncError || 'Unable to connect to Supabase. Check Project URL or run SQL schema script.' });
    }
  };

  const handlePushAll = async () => {
    setActionMessage(null);
    const res = await pushAllToSupabase();
    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
    } else {
      setActionMessage({ type: 'error', text: res.message });
    }
  };

  const handleResetToLocal = () => {
    disconnectSupabase();
    setUrlInput('');
    setKeyInput('');
    setActionMessage({ type: 'success', text: 'Switched to Local Offline Mode. All demo farm data is active.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 bg-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800 rounded-xl border border-emerald-700 text-emerald-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Supabase Cloud Database</span>
                {isSupabaseConnected ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Live Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                    <AlertTriangle className="w-3 h-3 text-amber-300" />
                    Local Storage Active
                  </span>
                )}
              </h2>
              <p className="text-xs text-emerald-200">
                PostgreSQL persistence & cloud synchronization for U & E Grace Farm
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSupabaseModalOpen(false)}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/80 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-sm">
          
          {/* Action Message Banner */}
          {actionMessage && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-medium flex items-center gap-2.5 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {actionMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* Sync Error / Network notice */}
          {syncError && !actionMessage && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="font-bold block text-amber-950">Connection Status:</strong>
                  <p className="leading-relaxed">{syncError}</p>
                </div>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={handleResetToLocal}
                  className="px-3 py-1 bg-white border border-amber-300 text-amber-900 font-bold rounded-lg text-[11px] hover:bg-amber-100 transition cursor-pointer"
                >
                  Use Local Storage Mode
                </button>
              </div>
            </div>
          )}

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Plots</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">{plots.length}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Resources</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">{resources.length}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Inventory</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">{inventory.length}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Activities</div>
              <div className="text-base font-bold text-slate-900 tabular-nums">{activities.length}</div>
            </div>
          </div>

          {/* Configuration Form */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-3.5 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-emerald-700" />
                <span>Supabase API Credentials</span>
              </h3>
              {supabaseConfig.source === 'env' && (
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                  Loaded from .env
                </span>
              )}
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-3">
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
                    placeholder="https://your-project-ref.supabase.co"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Anon / Public API Key
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSaving || isSyncing}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Save & Connect</span>
                  </button>

                  {isSupabaseConfigured && (
                    <button
                      type="button"
                      onClick={handleManualSync}
                      disabled={isSyncing}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-700' : ''}`} />
                      <span>Fetch from Cloud</span>
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetToLocal}
                  className="text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer"
                >
                  Clear & Use Local Storage
                </button>
              </div>
            </form>
          </div>

          {/* Quick Push & SQL Schema Helper */}
          <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Database Tables & SQL Setup</span>
              </h3>
              <button
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL Copied!' : 'Copy Schema SQL'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              If creating a new Supabase database, copy the SQL schema script and run it in the{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                Supabase SQL Editor <ExternalLink className="w-3 h-3" />
              </a>{' '}
              to generate all farm tables.
            </p>

            {isSupabaseConnected && (
              <div className="pt-2">
                <button
                  onClick={handlePushAll}
                  disabled={isSyncing}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Push All Local Farm Records to Supabase</span>
                </button>
              </div>
            )}
          </div>

          {/* Status info */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Last cloud sync:{' '}
              <strong>
                {lastSyncTime ? lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Never'}
              </strong>
            </span>
            <span>U & E Grace Foundation Farm · Akwa Ibom</span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0">
          <button
            onClick={() => setIsSupabaseModalOpen(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
