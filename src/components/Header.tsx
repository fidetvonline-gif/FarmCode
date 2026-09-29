import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import {
  ScanLine,
  Shield,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Database,
  RefreshCw,
  CheckCircle2,
  LogIn,
  LogOut,
  Key,
} from 'lucide-react';
import farmLogo from '../assets/images/farm_logo_badge_1790713219043.jpg';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    setIsScannerOpen,
    resetDatabase,
    isSupabaseConnected,
    isSyncing,
    setIsSupabaseModalOpen,
    isAuthenticated,
    setIsLoginModalOpen,
    logout,
  } = useFarm();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  return (
    <header className="bg-emerald-900 text-white border-b border-emerald-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand Title & Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-emerald-600 bg-emerald-800 shrink-0 shadow-sm">
            <img 
              src={farmLogo} 
              alt="U & E Grace Foundation Farm Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-white leading-none">
                U & E Grace Foundation Farm
              </span>
            </div>
            <p className="text-xs text-emerald-300 font-medium tracking-wide">
              Ikot Ekpene · QR Farm Management System
            </p>
          </div>
        </div>

        {/* Zone 2 & 3: PWA Install, Database status, Quick Scan & User Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* PWA Install Button */}
          <PWAInstallButton variant="header" />

          {/* Supabase Cloud Connection Indicator / Trigger */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isSupabaseConnected
                ? 'bg-emerald-800/90 text-emerald-200 border-emerald-700 hover:bg-emerald-800 hover:text-white'
                : 'bg-amber-950/40 text-amber-200 border-amber-500/40 hover:bg-amber-900/50'
            }`}
            title="Configure Supabase Cloud Database & Synchronize"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300" />
            ) : isSupabaseConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Database className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span className="hidden md:inline font-mono">
              {isSyncing ? 'Syncing...' : isSupabaseConnected ? 'Supabase Live' : 'Supabase Config'}
            </span>
            <span className="md:hidden">
              <Database className="w-3.5 h-3.5" />
            </span>
          </button>

          {/* Quick Camera QR Scan Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition shadow-sm active:scale-95 cursor-pointer"
            title="Scan QR Code using device camera or file"
          >
            <ScanLine className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
            <span className="hidden sm:inline font-bold">Scan QR Code</span>
            <span className="sm:hidden font-bold">Scan</span>
          </button>

          {/* User Authentication & Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700/80 rounded-lg text-xs sm:text-sm transition cursor-pointer"
            >
              {currentUser.role === 'administrator' ? (
                <Shield className="w-4 h-4 text-amber-400" />
              ) : (
                <UserCheck className="w-4 h-4 text-emerald-400" />
              )}
              <div className="text-left hidden md:block">
                <div className="font-semibold text-xs text-white leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-300 capitalize">{currentUser.role.replace('_', ' ')}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
            </button>

            {showRoleDropdown && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 text-slate-800 z-50 text-xs"
                onMouseLeave={() => setShowRoleDropdown(false)}
              >
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">User Account & Roles</p>
                    <p className="text-[11px] text-slate-500">Active session details</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setShowRoleDropdown(false);
                    }}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100/80 px-2 py-1 rounded-md flex items-center gap-1 cursor-pointer"
                  >
                    <Key className="w-3 h-3" />
                    <span>Login Details</span>
                  </button>
                </div>

                <div className="p-1 space-y-1">
                  <button
                    onClick={() => { switchUserRole('administrator'); setShowRoleDropdown(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${currentUser.role === 'administrator' ? 'bg-emerald-50 font-semibold text-emerald-900' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <div className="font-bold">Engr. Sunday Akpan</div>
                        <div className="text-[10px] text-slate-500 font-normal">Administrator (admin@uefarm.ng)</div>
                      </div>
                    </div>
                    {currentUser.role === 'administrator' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                  </button>

                  <button
                    onClick={() => { switchUserRole('farm_worker'); setShowRoleDropdown(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${currentUser.role === 'farm_worker' ? 'bg-emerald-50 font-semibold text-emerald-900' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold">Blessing Okon</div>
                        <div className="text-[10px] text-slate-500 font-normal">Worker (worker@uefarm.ng)</div>
                      </div>
                    </div>
                    {currentUser.role === 'farm_worker' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                  </button>
                </div>

                <div className="border-t border-slate-100 mt-1 pt-1 px-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setShowRoleDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2 transition cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Switch / View Login Credentials</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Reset database to initial demo state? All custom entries will be restored to defaults.')) {
                        resetDatabase();
                        setShowRoleDropdown(false);
                      }
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset Seed Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
