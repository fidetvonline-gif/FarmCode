import React from 'react';
import { useFarm } from '../context/FarmContext';
import {
  LayoutDashboard,
  MapPin,
  Tractor,
  ClipboardList,
  Package,
  Users,
  QrCode,
  ScanLine,
  BarChart3,
  ShieldAlert,
  Settings,
  Database,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    inventory,
    isSupabaseConnected,
    setIsSupabaseModalOpen,
    setIsLoginModalOpen,
  } = useFarm();

  const lowStockCount = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock').length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'plots', label: 'Farm Plots', icon: MapPin },
    { id: 'resources', label: 'Farm Resources', icon: Tractor },
    { id: 'activities', label: 'Farm Activities', icon: ClipboardList },
    { id: 'inventory', label: 'Inputs & Inventory', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'workers', label: 'Worker Directory', icon: Users },
    { id: 'qr_studio', label: 'QR Code Studio', icon: QrCode },
    { id: 'qr_scanner', label: 'QR Code Scanner', icon: ScanLine, highlight: true },
    { id: 'reports', label: 'Reports & Audits', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Cloud DB', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 shrink-0 border-r border-slate-800 flex flex-col justify-between">
      <div className="p-4 space-y-4">
        <div>
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Management Modules
          </div>

          <nav className="mt-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isScanner = item.id === 'qr_scanner';

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : isScanner
                      ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isScanner ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-amber-950 rounded-full shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* PWA In-App Install in Sidebar */}
        <div className="pt-2 border-t border-slate-800/80">
          <PWAInstallButton variant="sidebar" />
        </div>

        {/* Supabase Quick Status in Sidebar */}
        <div>
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-left text-xs transition cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="truncate">
                <div className="text-[11px] font-bold text-slate-200">Supabase Cloud</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {isSupabaseConnected ? 'Live PostgreSQL' : 'Configure Cloud'}
                </div>
              </div>
            </div>
            {isSupabaseConnected ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Logged in as:</span>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <Key className="w-2.5 h-2.5" />
              <span>Login Details</span>
            </button>
          </div>
          <div className="text-slate-200 font-bold truncate">{currentUser.name}</div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
          </div>

          {currentUser.role === 'farm_worker' && (
            <div className="mt-2 text-[10px] text-amber-300/90 bg-amber-950/40 p-1.5 rounded-lg border border-amber-800/40 flex items-start gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Worker mode: Record activities and scan QR codes.</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
