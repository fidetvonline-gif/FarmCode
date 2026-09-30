import React from 'react';
import { useFarm } from '../context/FarmContext';
import {
  MapPin,
  Tractor,
  Package,
  ClipboardList,
  QrCode,
  ScanLine,
  AlertTriangle,
  ArrowRight,
  Printer,
  CheckCircle2,
  Clock,
  Users,
  Database,
} from 'lucide-react';
import heroBanner from '../assets/images/farm_hero_banner_1790713207506.jpg';
import qrStakeImg from '../assets/images/farm_qr_stake_1790713228299.jpg';

export const Dashboard: React.FC = () => {
  const {
    plots,
    resources,
    inventory,
    activities,
    qrRecords,
    workers,
    setActiveTab,
    setIsScannerOpen,
    lookupQRCode,
    setSelectedScannedResult,
    isSupabaseConnected,
    setIsSupabaseModalOpen,
  } = useFarm();

  const lowStockItems = inventory.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock');
  const activePlots = plots.filter((p) => p.status === 'Active');

  const stats = [
    {
      title: 'Farm Plots',
      value: plots.length,
      sub: `${activePlots.length} Active Cultivations`,
      icon: MapPin,
      color: 'bg-emerald-600',
      tab: 'plots',
    },
    {
      title: 'Farm Resources',
      value: resources.length,
      sub: 'Machinery & Tools',
      icon: Tractor,
      color: 'bg-amber-600',
      tab: 'resources',
    },
    {
      title: 'Inputs & Inventory',
      value: inventory.length,
      sub: `${lowStockItems.length} Low Stock Alerts`,
      icon: Package,
      color: lowStockItems.length > 0 ? 'bg-orange-600' : 'bg-blue-600',
      tab: 'inventory',
    },
    {
      title: 'Field Activities',
      value: activities.length,
      sub: 'Recorded Operations',
      icon: ClipboardList,
      color: 'bg-purple-600',
      tab: 'activities',
    },
    {
      title: 'QR Asset Identifiers',
      value: qrRecords.length,
      sub: 'Registered Field Codes',
      icon: QrCode,
      color: 'bg-teal-600',
      tab: 'qr_studio',
    },
    {
      title: 'Farm Workers',
      value: workers.length,
      sub: 'Active Field Personnel',
      icon: Users,
      color: 'bg-indigo-600',
      tab: 'workers',
    },
  ];

  const handleQuickScanCode = (code: string) => {
    const res = lookupQRCode(code);
    if (res) {
      setSelectedScannedResult(res);
      setIsScannerOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HERO BANNER CARD */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-emerald-900/30 bg-emerald-950 text-white">
        <img
          src={heroBanner}
          alt="U and E Grace Foundation Farm, Ikot Ekpene"
          className="w-full h-48 sm:h-56 object-cover opacity-25 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/80 to-transparent p-6 sm:p-8 flex flex-col justify-end">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-300">
                <span>Obio Ndot, Akwa Ibom State</span>
                <span>•</span>
                <span>Operations & Asset Management</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                U & E Grace Foundation Farm
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 max-w-2xl">
                Plot cultivation records, machinery tracking, field worker logs, and input inventory control.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <ScanLine className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Scan QR Tag</span>
              </button>
              <button
                onClick={() => setActiveTab('qr_studio')}
                className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl border border-emerald-600/50 flex items-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print QR Badges</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(stat.tab)}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className={`p-2.5 rounded-xl text-white ${stat.color} shadow-xs group-hover:scale-105 transition`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition" />
                </div>
                <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{stat.value}</div>
                <div className="text-xs font-bold text-slate-700 mt-0.5">{stat.title}</div>
              </div>
              <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* LOW STOCK WARNING BANNER */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Low Stock Warning ({lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''})
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                The following farm inputs require restocking: {lowStockItems.map((i) => `${i.item_name} (${i.quantity} ${i.unit} remaining)`).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded-xl transition shrink-0 cursor-pointer"
          >
            Manage Inventory
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: QR Code Quick Scanner Demonstration */}
        <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>Asset QR Code Lookup</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Direct Access
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-36">
            <img
              src={qrStakeImg}
              alt="QR Code Tag Attached to Stake"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-950/45 p-3 flex flex-col justify-between text-white">
              <div className="text-[10px] font-bold uppercase tracking-wider bg-emerald-800/90 px-2 py-0.5 rounded w-fit">
                Field Asset Tag
              </div>
              <p className="text-xs font-semibold drop-shadow">
                Each farm plot, machine, and inventory lot carries an individual QR code.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-700">Quick Test Lookups:</p>
            <div className="space-y-1.5">
              {[
                { code: 'FARM-PLT-0001', label: 'Plot A - Cassava Plantation' },
                { code: 'FARM-RES-0001', label: 'Massey Ferguson Tractor 275' },
                { code: 'FARM-INV-0002', label: 'Poultry Starter Mash Feed' },
                { code: 'FARM-WRK-0001', label: 'Blessing Okon (Supervisor)' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => handleQuickScanCode(item.code)}
                  className="w-full p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-medium flex items-center justify-between transition cursor-pointer text-slate-800"
                >
                  <span className="truncate">{item.label}</span>
                  <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0 ml-2">
                    {item.code}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <ScanLine className="w-4 h-4 text-amber-400" />
            <span>Open Camera Scanner</span>
          </button>
        </div>

        {/* Right Column: Recent Activities & Activity Tracker */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-700" />
                <span>Recent Field Operations & Logs</span>
              </h3>
              <p className="text-[11px] text-slate-500">Recorded activities by field personnel</p>
            </div>
            <button
              onClick={() => setActiveTab('activities')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({activities.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activities.slice(0, 5).map((act) => {
              const assignedWorker = workers.find((w) => w.id === act.worker_id);
              const targetPlot = plots.find((p) => p.id === act.plot_id);
              const targetRes = resources.find((r) => r.id === act.resource_id);

              return (
                <div
                  key={act.id}
                  className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl hover:border-slate-300 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                        {act.activity_code}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{act.activity_name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        act.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : act.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {act.status === 'Completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-amber-600" />}
                      <span>{act.status}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{act.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                    <div className="flex items-center gap-3">
                      <span>Worker: <strong className="text-slate-700">{assignedWorker?.full_name || 'Staff'}</strong></span>
                      {targetPlot && <span>Target: <strong className="text-slate-700">{targetPlot.plot_name}</strong></span>}
                      {targetRes && <span>Resource: <strong className="text-slate-700">{targetRes.name}</strong></span>}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{act.activity_date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
