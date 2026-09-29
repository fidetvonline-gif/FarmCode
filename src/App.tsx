import React from 'react';
import { FarmProvider, useFarm } from './context/FarmContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PlotsManager } from './components/PlotsManager';
import { ResourcesManager } from './components/ResourcesManager';
import { InventoryManager } from './components/InventoryManager';
import { ActivitiesManager } from './components/ActivitiesManager';
import { WorkersManager } from './components/WorkersManager';
import { QRCodeStudio } from './components/QRCodeStudio';
import { ReportsManager } from './components/ReportsManager';
import { SettingsView } from './components/SettingsView';
import { QRScannerModal } from './components/QRScannerModal';
import { SupabaseModal } from './components/SupabaseModal';
import { LoginModal } from './components/LoginModal';
import { OfflineIndicator } from './components/OfflineIndicator';

function MainLayout() {
  const { activeTab } = useFarm();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      
      {/* Top Bar Header */}
      <Header />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'plots' && <PlotsManager />}
          {activeTab === 'resources' && <ResourcesManager />}
          {activeTab === 'inventory' && <InventoryManager />}
          {activeTab === 'activities' && <ActivitiesManager />}
          {activeTab === 'workers' && <WorkersManager />}
          {activeTab === 'qr_studio' && <QRCodeStudio />}
          {activeTab === 'reports' && <ReportsManager />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'qr_scanner' && <Dashboard />}
        </main>
      </div>

      {/* Global QR Code Scanner Modal */}
      <QRScannerModal />

      {/* Global Supabase Cloud Database Modal */}
      <SupabaseModal />

      {/* Global Login & Auth Modal */}
      <LoginModal />

      {/* PWA Offline Connection Indicator */}
      <OfflineIndicator />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-300">
            U & E Grace Foundation Farm, Ikot Ekpene, Akwa Ibom State · QR Code Based System for Farm Management
          </p>
          <p className="text-[11px] text-slate-500">
            PWA Enabled · PostgreSQL Database with Supabase · QR Identification · Activity Tracking
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <FarmProvider>
      <MainLayout />
    </FarmProvider>
  );
}
