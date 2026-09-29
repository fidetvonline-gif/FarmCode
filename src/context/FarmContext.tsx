import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  FarmPlot,
  Resource,
  FarmActivity,
  InventoryItem,
  Worker,
  QRCodeRecord,
  User,
  RecordType,
  ScannedResult,
} from '../types/farm';
import {
  INITIAL_USERS,
  INITIAL_PLOTS,
  INITIAL_RESOURCES,
  INITIAL_INVENTORY,
  INITIAL_WORKERS,
  INITIAL_ACTIVITIES,
  INITIAL_QR_RECORDS,
  DEMO_LOGIN_CREDENTIALS,
} from '../data/seedData';
import {
  supabaseFarmService,
  AllFarmData,
} from '../services/supabaseFarmService';
import {
  getActiveSupabaseConfig,
  saveSupabaseCredentials,
  clearSupabaseCredentials as clearStoredCredentials,
  testSupabaseConnection,
} from '../lib/supabase';

interface FarmContextType {
  // Auth state & actions
  currentUser: User;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  quickLogin: (email: string) => void;
  logout: () => void;
  switchUserRole: (role: User['role']) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  
  // Farm Plots
  plots: FarmPlot[];
  addPlot: (plot: Omit<FarmPlot, 'id' | 'plot_code' | 'qr_code' | 'created_at'>) => Promise<FarmPlot>;
  updatePlot: (id: number, plotData: Partial<FarmPlot>) => Promise<void>;
  deletePlot: (id: number) => Promise<void>;

  // Resources
  resources: Resource[];
  addResource: (resource: Omit<Resource, 'id' | 'resource_code' | 'qr_code' | 'created_at'>) => Promise<Resource>;
  updateResource: (id: number, resourceData: Partial<Resource>) => Promise<void>;
  deleteResource: (id: number) => Promise<void>;

  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'item_code' | 'qr_code' | 'status' | 'created_at'>) => Promise<InventoryItem>;
  updateInventoryItem: (id: number, itemData: Partial<InventoryItem>) => Promise<void>;
  adjustStock: (id: number, deltaQuantity: number, reason?: string) => Promise<void>;
  deleteInventoryItem: (id: number) => Promise<void>;

  // Workers
  workers: Worker[];
  addWorker: (worker: Omit<Worker, 'id' | 'worker_code' | 'qr_code' | 'created_at'>) => Promise<Worker>;
  updateWorker: (id: number, workerData: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: number) => Promise<void>;

  // Activities
  activities: FarmActivity[];
  addActivity: (activity: Omit<FarmActivity, 'id' | 'activity_code' | 'created_at'>) => Promise<FarmActivity>;
  updateActivityStatus: (id: number, status: FarmActivity['status']) => Promise<void>;
  deleteActivity: (id: number) => Promise<void>;

  // QR Code lookup & database control
  qrRecords: QRCodeRecord[];
  lookupQRCode: (code: string) => ScannedResult | null;
  resetDatabase: () => Promise<void>;
  seedDemoDataToBackend: () => Promise<{ success: boolean; message: string }>;

  // UI Active Tab state
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // QR Modal scanner trigger
  isScannerOpen: boolean;
  setIsScannerOpen: (open: boolean) => void;
  selectedScannedResult: ScannedResult | null;
  setSelectedScannedResult: (result: ScannedResult | null) => void;

  // Supabase Database Integration Provider States
  isSupabaseConfigured: boolean;
  isSupabaseConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  supabaseConfig: { url: string; anonKey: string; isConfigured: boolean; source: string };
  syncWithSupabase: () => Promise<boolean>;
  pushAllToSupabase: () => Promise<{ success: boolean; message: string }>;
  updateSupabaseCredentials: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  disconnectSupabase: () => void;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
}

const STORAGE_KEYS = {
  USER: 'ue_farm_user_v2',
  AUTH: 'ue_farm_is_authenticated_v2',
  PLOTS: 'ue_farm_plots_v2',
  RESOURCES: 'ue_farm_resources_v2',
  INVENTORY: 'ue_farm_inventory_v2',
  WORKERS: 'ue_farm_workers_v2',
  ACTIVITIES: 'ue_farm_activities_v2',
  QR_RECORDS: 'ue_farm_qr_records_v2',
  LAST_SYNC: 'ue_farm_last_sync_v2',
};

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Supabase status state
  const [supabaseConfig, setSupabaseConfig] = useState(() => getActiveSupabaseConfig());
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return saved ? new Date(saved) : null;
  });
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
    return saved !== null ? JSON.parse(saved) : true; // Default true for frictionless defense/demo
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_USERS[0];
  });

  // Farm Data States
  const [plots, setPlots] = useState<FarmPlot[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PLOTS);
    return saved ? JSON.parse(saved) : INITIAL_PLOTS;
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESOURCES);
    return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WORKERS);
    return saved ? JSON.parse(saved) : INITIAL_WORKERS;
  });

  const [activities, setActivities] = useState<FarmActivity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [qrRecords, setQrRecords] = useState<QRCodeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QR_RECORDS);
    return saved ? JSON.parse(saved) : INITIAL_QR_RECORDS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [selectedScannedResult, setSelectedScannedResult] = useState<ScannedResult | null>(null);

  // Sync to local storage offline cache
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(isAuthenticated)); }, [isAuthenticated]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PLOTS, JSON.stringify(plots)); }, [plots]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources)); }, [resources]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers)); }, [workers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.QR_RECORDS, JSON.stringify(qrRecords)); }, [qrRecords]);
  useEffect(() => {
    if (lastSyncTime) {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, lastSyncTime.toISOString());
    }
  }, [lastSyncTime]);

  // Sync / Hydrate with Supabase
  const syncWithSupabase = useCallback(async (): Promise<boolean> => {
    const config = getActiveSupabaseConfig();
    setSupabaseConfig(config);

    if (!config.isConfigured) {
      setIsSupabaseConnected(false);
      setIsSyncing(false);
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Test connection first
      const connTest = await testSupabaseConnection();
      if (!connTest.success) {
        setIsSupabaseConnected(false);
        setSyncError(connTest.message);
        setIsSyncing(false);
        return false;
      }

      // Fetch all records from Supabase
      const result = await supabaseFarmService.fetchAllFarmData();
      if (result.success && result.data) {
        const { users: dbUsers, plots: dbPlots, resources: dbResources, inventory: dbInventory, workers: dbWorkers, activities: dbActivities, qrRecords: dbQr } = result.data;

        // If Supabase database is empty (brand new tables), auto-seed all initial demo records to backend!
        if (
          dbPlots.length === 0 &&
          dbResources.length === 0 &&
          dbInventory.length === 0 &&
          dbWorkers.length === 0
        ) {
          console.log('Supabase tables are empty, auto-seeding demo farm records to backend...');
          await supabaseFarmService.syncAllToSupabase({
            users: INITIAL_USERS,
            plots: INITIAL_PLOTS,
            resources: INITIAL_RESOURCES,
            inventory: INITIAL_INVENTORY,
            workers: INITIAL_WORKERS,
            activities: INITIAL_ACTIVITIES,
            qrRecords: INITIAL_QR_RECORDS,
          });
          setPlots(INITIAL_PLOTS);
          setResources(INITIAL_RESOURCES);
          setInventory(INITIAL_INVENTORY);
          setWorkers(INITIAL_WORKERS);
          setActivities(INITIAL_ACTIVITIES);
          setQrRecords(INITIAL_QR_RECORDS);
        } else {
          if (dbPlots.length > 0) setPlots(dbPlots);
          if (dbResources.length > 0) setResources(dbResources);
          if (dbInventory.length > 0) setInventory(dbInventory);
          if (dbWorkers.length > 0) setWorkers(dbWorkers);
          if (dbActivities.length > 0) setActivities(dbActivities);
          if (dbQr.length > 0) setQrRecords(dbQr);
          if (dbUsers.length > 0) {
            const foundUser = dbUsers.find((u) => u.id === currentUser.id) || dbUsers[0];
            if (foundUser) setCurrentUser(foundUser);
          }
        }

        setIsSupabaseConnected(true);
        const now = new Date();
        setLastSyncTime(now);
        setIsSyncing(false);
        return true;
      } else {
        setIsSupabaseConnected(false);
        setSyncError(result.error || 'Failed to fetch data from Supabase');
        setIsSyncing(false);
        return false;
      }
    } catch (err: any) {
      setIsSupabaseConnected(false);
      setSyncError(err?.message || 'Error communicating with Supabase');
      setIsSyncing(false);
      return false;
    }
  }, [currentUser.id]);

  // Initial mount sync
  useEffect(() => {
    syncWithSupabase();
  }, [syncWithSupabase]);

  // Push all current local state to Supabase backend
  const pushAllToSupabase = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const currentData: AllFarmData = {
        users: INITIAL_USERS,
        plots,
        resources,
        inventory,
        workers,
        activities,
        qrRecords,
      };
      const res = await supabaseFarmService.syncAllToSupabase(currentData);
      if (res.success) {
        setIsSupabaseConnected(true);
        setLastSyncTime(new Date());
      } else {
        setSyncError(res.message);
      }
      setIsSyncing(false);
      return res;
    } catch (err: any) {
      setIsSyncing(false);
      const msg = err?.message || 'Failed to push records to Supabase';
      setSyncError(msg);
      return { success: false, message: msg };
    }
  };

  // Seed / synchronize all demo data to backend
  const seedDemoDataToBackend = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      setPlots(INITIAL_PLOTS);
      setResources(INITIAL_RESOURCES);
      setInventory(INITIAL_INVENTORY);
      setWorkers(INITIAL_WORKERS);
      setActivities(INITIAL_ACTIVITIES);
      setQrRecords(INITIAL_QR_RECORDS);

      if (isSupabaseConnected) {
        const res = await supabaseFarmService.syncAllToSupabase({
          users: INITIAL_USERS,
          plots: INITIAL_PLOTS,
          resources: INITIAL_RESOURCES,
          inventory: INITIAL_INVENTORY,
          workers: INITIAL_WORKERS,
          activities: INITIAL_ACTIVITIES,
          qrRecords: INITIAL_QR_RECORDS,
        });
        setIsSyncing(false);
        if (res.success) {
          setLastSyncTime(new Date());
          return { success: true, message: 'All demo plots, equipment, inventory, staff, and QR codes added to backend database!' };
        }
        return res;
      }
      setIsSyncing(false);
      return { success: true, message: 'Demo data loaded in local storage cache (Configure Supabase to persist to cloud).' };
    } catch (err: any) {
      setIsSyncing(false);
      return { success: false, message: err?.message || 'Error seeding backend demo data' };
    }
  };

  // Update Supabase credentials runtime
  const updateSupabaseCredentials = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
    saveSupabaseCredentials(url, key);
    const config = getActiveSupabaseConfig();
    setSupabaseConfig(config);

    if (!config.isConfigured) {
      setIsSupabaseConnected(false);
      return { success: false, message: 'Invalid Supabase URL or Anon Key' };
    }

    const test = await testSupabaseConnection();
    if (!test.success) {
      setIsSupabaseConnected(false);
      setSyncError(test.message);
      return test;
    }

    // Attempt initial sync
    await syncWithSupabase();
    return { success: true, message: 'Successfully connected and synchronized with Supabase!' };
  };

  const disconnectSupabase = () => {
    clearStoredCredentials();
    const config = getActiveSupabaseConfig();
    setSupabaseConfig(config);
    setIsSupabaseConnected(false);
    setSyncError(null);
  };

  // AUTHENTICATION METHODS
  const login = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const targetUser = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!targetUser) {
      return { success: false, message: `Account with email "${email}" not found. Please check login credentials.` };
    }

    if (targetUser.password && targetUser.password !== pass) {
      return { success: false, message: 'Invalid password. Check the demo login credentials list below.' };
    }

    setCurrentUser(targetUser);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    return { success: true, message: `Welcome back, ${targetUser.name}!` };
  };

  const quickLogin = (email: string) => {
    const target = INITIAL_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase()) || INITIAL_USERS[0];
    setCurrentUser(target);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsLoginModalOpen(true);
  };

  const switchUserRole = (role: User['role']) => {
    const target = INITIAL_USERS.find((u) => u.role === role) || {
      ...currentUser,
      role,
      name: role === 'administrator' ? 'Engr. Sunday Akpan' : 'Blessing Okon',
    };
    setCurrentUser(target);
  };

  const resetDatabase = async () => {
    setPlots(INITIAL_PLOTS);
    setResources(INITIAL_RESOURCES);
    setInventory(INITIAL_INVENTORY);
    setWorkers(INITIAL_WORKERS);
    setActivities(INITIAL_ACTIVITIES);
    setQrRecords(INITIAL_QR_RECORDS);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.clear();

    if (isSupabaseConnected) {
      await supabaseFarmService.syncAllToSupabase({
        users: INITIAL_USERS,
        plots: INITIAL_PLOTS,
        resources: INITIAL_RESOURCES,
        inventory: INITIAL_INVENTORY,
        workers: INITIAL_WORKERS,
        activities: INITIAL_ACTIVITIES,
        qrRecords: INITIAL_QR_RECORDS,
      });
      setLastSyncTime(new Date());
    }
  };

  // Helper to register QR Code
  const registerQRRecord = async (recordType: RecordType, recordId: number, prefix: string): Promise<string> => {
    const padId = String(recordId).padStart(4, '0');
    const qrCode = `FARM-${prefix}-${padId}`;
    const newRecord: QRCodeRecord = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      qr_code: qrCode,
      record_type: recordType,
      record_id: recordId,
      created_at: new Date().toISOString(),
    };

    setQrRecords((prev) => [...prev.filter((r) => r.qr_code !== qrCode), newRecord]);

    if (isSupabaseConnected) {
      supabaseFarmService.createQRCode(newRecord).catch((err) => console.warn('Supabase QR insert error:', err));
    }

    return qrCode;
  };

  // PLOTS CRUD
  const addPlot = async (plotData: Omit<FarmPlot, 'id' | 'plot_code' | 'qr_code' | 'created_at'>): Promise<FarmPlot> => {
    const newId = plots.length > 0 ? Math.max(...plots.map((p) => p.id)) + 1 : 1;
    const plotCode = `PLT-${String(newId).padStart(4, '0')}`;
    const qrCode = await registerQRRecord('farm_plot', newId, 'PLT');

    const newPlot: FarmPlot = {
      ...plotData,
      id: newId,
      plot_code: plotCode,
      qr_code: qrCode,
      created_at: new Date().toISOString(),
    };

    setPlots((prev) => [newPlot, ...prev]);

    if (isSupabaseConnected) {
      supabaseFarmService.createPlot(newPlot).catch((err) => console.warn('Supabase plot insert error:', err));
    }

    return newPlot;
  };

  const updatePlot = async (id: number, plotData: Partial<FarmPlot>) => {
    setPlots((prev) => prev.map((p) => (p.id === id ? { ...p, ...plotData } : p)));

    if (isSupabaseConnected) {
      supabaseFarmService.updatePlot(id, plotData).catch((err) => console.warn('Supabase plot update error:', err));
    }
  };

  const deletePlot = async (id: number) => {
    const target = plots.find((p) => p.id === id);
    setPlots((prev) => prev.filter((p) => p.id !== id));
    setQrRecords((prev) => prev.filter((r) => !(r.record_type === 'farm_plot' && r.record_id === id)));

    if (isSupabaseConnected) {
      supabaseFarmService.deletePlot(id).catch((err) => console.warn('Supabase plot delete error:', err));
      if (target?.qr_code) {
        supabaseFarmService.deleteQRCode(target.qr_code).catch((err) => console.warn('Supabase qr delete error:', err));
      }
    }
  };

  // RESOURCES CRUD
  const addResource = async (resourceData: Omit<Resource, 'id' | 'resource_code' | 'qr_code' | 'created_at'>): Promise<Resource> => {
    const newId = resources.length > 0 ? Math.max(...resources.map((r) => r.id)) + 1 : 1;
    const resourceCode = `RES-${String(newId).padStart(4, '0')}`;
    const qrCode = await registerQRRecord('resource', newId, 'RES');

    const newResource: Resource = {
      ...resourceData,
      id: newId,
      resource_code: resourceCode,
      qr_code: qrCode,
      created_at: new Date().toISOString(),
    };

    setResources((prev) => [newResource, ...prev]);

    if (isSupabaseConnected) {
      supabaseFarmService.createResource(newResource).catch((err) => console.warn('Supabase resource insert error:', err));
    }

    return newResource;
  };

  const updateResource = async (id: number, resourceData: Partial<Resource>) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...resourceData } : r)));

    if (isSupabaseConnected) {
      supabaseFarmService.updateResource(id, resourceData).catch((err) => console.warn('Supabase resource update error:', err));
    }
  };

  const deleteResource = async (id: number) => {
    const target = resources.find((r) => r.id === id);
    setResources((prev) => prev.filter((r) => r.id !== id));
    setQrRecords((prev) => prev.filter((r) => !(r.record_type === 'resource' && r.record_id === id)));

    if (isSupabaseConnected) {
      supabaseFarmService.deleteResource(id).catch((err) => console.warn('Supabase resource delete error:', err));
      if (target?.qr_code) {
        supabaseFarmService.deleteQRCode(target.qr_code).catch((err) => console.warn('Supabase qr delete error:', err));
      }
    }
  };

  // INVENTORY CRUD
  const calculateInventoryStatus = (qty: number, minStock: number): InventoryItem['status'] => {
    if (qty <= 0) return 'Out of Stock';
    if (qty <= minStock) return 'Low Stock';
    return 'Available';
  };

  const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'item_code' | 'qr_code' | 'status' | 'created_at'>): Promise<InventoryItem> => {
    const newId = inventory.length > 0 ? Math.max(...inventory.map((i) => i.id)) + 1 : 1;
    const itemCode = `INV-${String(newId).padStart(4, '0')}`;
    const qrCode = await registerQRRecord('inventory_item', newId, 'INV');
    const status = calculateInventoryStatus(itemData.quantity, itemData.minimum_stock);

    const newItem: InventoryItem = {
      ...itemData,
      id: newId,
      item_code: itemCode,
      status,
      qr_code: qrCode,
      created_at: new Date().toISOString(),
    };

    setInventory((prev) => [newItem, ...prev]);

    if (isSupabaseConnected) {
      supabaseFarmService.createInventoryItem(newItem).catch((err) => console.warn('Supabase inventory insert error:', err));
    }

    return newItem;
  };

  const updateInventoryItem = async (id: number, itemData: Partial<InventoryItem>) => {
    let updatedItem: InventoryItem | undefined;
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const updated = { ...i, ...itemData };
          updated.status = calculateInventoryStatus(updated.quantity, updated.minimum_stock);
          updatedItem = updated;
          return updated;
        }
        return i;
      })
    );

    if (isSupabaseConnected && updatedItem) {
      supabaseFarmService.updateInventoryItem(id, updatedItem).catch((err) => console.warn('Supabase inventory update error:', err));
    }
  };

  const adjustStock = async (id: number, deltaQuantity: number) => {
    let updatedItem: InventoryItem | undefined;
    setInventory((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const newQty = Math.max(0, i.quantity + deltaQuantity);
          const newStatus = calculateInventoryStatus(newQty, i.minimum_stock);
          const updated = { ...i, quantity: newQty, status: newStatus };
          updatedItem = updated;
          return updated;
        }
        return i;
      })
    );

    if (isSupabaseConnected && updatedItem) {
      supabaseFarmService.updateInventoryItem(id, updatedItem).catch((err) => console.warn('Supabase stock adjust error:', err));
    }
  };

  const deleteInventoryItem = async (id: number) => {
    const target = inventory.find((i) => i.id === id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
    setQrRecords((prev) => prev.filter((r) => !(r.record_type === 'inventory_item' && r.record_id === id)));

    if (isSupabaseConnected) {
      supabaseFarmService.deleteInventoryItem(id).catch((err) => console.warn('Supabase inventory delete error:', err));
      if (target?.qr_code) {
        supabaseFarmService.deleteQRCode(target.qr_code).catch((err) => console.warn('Supabase qr delete error:', err));
      }
    }
  };

  // WORKERS CRUD
  const addWorker = async (workerData: Omit<Worker, 'id' | 'worker_code' | 'qr_code' | 'created_at'>): Promise<Worker> => {
    const newId = workers.length > 0 ? Math.max(...workers.map((w) => w.id)) + 1 : 1;
    const workerCode = `WRK-${String(newId).padStart(4, '0')}`;
    const qrCode = await registerQRRecord('worker', newId, 'WRK');

    const newWorker: Worker = {
      ...workerData,
      id: newId,
      worker_code: workerCode,
      qr_code: qrCode,
      created_at: new Date().toISOString(),
    };

    setWorkers((prev) => [newWorker, ...prev]);

    if (isSupabaseConnected) {
      supabaseFarmService.createWorker(newWorker).catch((err) => console.warn('Supabase worker insert error:', err));
    }

    return newWorker;
  };

  const updateWorker = async (id: number, workerData: Partial<Worker>) => {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, ...workerData } : w)));

    if (isSupabaseConnected) {
      supabaseFarmService.updateWorker(id, workerData).catch((err) => console.warn('Supabase worker update error:', err));
    }
  };

  const deleteWorker = async (id: number) => {
    const target = workers.find((w) => w.id === id);
    setWorkers((prev) => prev.filter((w) => w.id !== id));
    setQrRecords((prev) => prev.filter((r) => !(r.record_type === 'worker' && r.record_id === id)));

    if (isSupabaseConnected) {
      supabaseFarmService.deleteWorker(id).catch((err) => console.warn('Supabase worker delete error:', err));
      if (target?.qr_code) {
        supabaseFarmService.deleteQRCode(target.qr_code).catch((err) => console.warn('Supabase qr delete error:', err));
      }
    }
  };

  // ACTIVITIES CRUD
  const addActivity = async (activityData: Omit<FarmActivity, 'id' | 'activity_code' | 'created_at'>): Promise<FarmActivity> => {
    const newId = activities.length > 0 ? Math.max(...activities.map((a) => a.id)) + 1 : 1;
    const actCode = `ACT-${String(newId).padStart(4, '0')}`;

    const newActivity: FarmActivity = {
      ...activityData,
      id: newId,
      activity_code: actCode,
      created_at: new Date().toISOString(),
    };

    // If activity uses inventory, automatically deduct stock!
    if (activityData.inventory_item_id && activityData.quantity_used && activityData.quantity_used > 0) {
      adjustStock(activityData.inventory_item_id, -activityData.quantity_used);
    }

    setActivities((prev) => [newActivity, ...prev]);

    if (isSupabaseConnected) {
      supabaseFarmService.createActivity(newActivity).catch((err) => console.warn('Supabase activity insert error:', err));
    }

    return newActivity;
  };

  const updateActivityStatus = async (id: number, status: FarmActivity['status']) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

    if (isSupabaseConnected) {
      supabaseFarmService.updateActivity(id, { status }).catch((err) => console.warn('Supabase activity status update error:', err));
    }
  };

  const deleteActivity = async (id: number) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));

    if (isSupabaseConnected) {
      supabaseFarmService.deleteActivity(id).catch((err) => console.warn('Supabase activity delete error:', err));
    }
  };

  // QR CODE LOOKUP ENGINE
  const lookupQRCode = (code: string): ScannedResult | null => {
    const cleanCode = code.trim().toUpperCase();
    
    // First search in QR records database table
    const record = qrRecords.find((r) => r.qr_code.toUpperCase() === cleanCode);

    let type: RecordType | null = record ? record.record_type : null;
    let targetId: number | null = record ? record.record_id : null;

    // Fallback direct matching if code matches entity qr_code field directly
    if (!record) {
      const p = plots.find((p) => p.qr_code.toUpperCase() === cleanCode || p.plot_code.toUpperCase() === cleanCode);
      if (p) { type = 'farm_plot'; targetId = p.id; }
      else {
        const r = resources.find((res) => res.qr_code.toUpperCase() === cleanCode || res.resource_code.toUpperCase() === cleanCode);
        if (r) { type = 'resource'; targetId = r.id; }
        else {
          const inv = inventory.find((i) => i.qr_code.toUpperCase() === cleanCode || i.item_code.toUpperCase() === cleanCode);
          if (inv) { type = 'inventory_item'; targetId = inv.id; }
          else {
            const w = workers.find((wk) => wk.qr_code.toUpperCase() === cleanCode || wk.worker_code.toUpperCase() === cleanCode);
            if (w) { type = 'worker'; targetId = w.id; }
          }
        }
      }
    }

    if (!type || targetId === null) {
      return null;
    }

    let recordData: FarmPlot | Resource | InventoryItem | Worker | null = null;
    let relatedActivities: FarmActivity[] = [];

    if (type === 'farm_plot') {
      recordData = plots.find((p) => p.id === targetId) || null;
      relatedActivities = activities.filter((a) => a.plot_id === targetId);
    } else if (type === 'resource') {
      recordData = resources.find((r) => r.id === targetId) || null;
      relatedActivities = activities.filter((a) => a.resource_id === targetId);
    } else if (type === 'inventory_item') {
      recordData = inventory.find((i) => i.id === targetId) || null;
      relatedActivities = activities.filter((a) => a.inventory_item_id === targetId);
    } else if (type === 'worker') {
      recordData = workers.find((w) => w.id === targetId) || null;
      relatedActivities = activities.filter((a) => a.worker_id === targetId);
    }

    if (!recordData) return null;

    return {
      qr_code: cleanCode,
      record_type: type,
      record_data: recordData,
      activities: relatedActivities,
    };
  };

  return (
    <FarmContext.Provider
      value={{
        // Auth
        currentUser,
        isAuthenticated,
        login,
        quickLogin,
        logout,
        switchUserRole,
        isLoginModalOpen,
        setIsLoginModalOpen,

        // Data
        plots,
        addPlot,
        updatePlot,
        deletePlot,
        resources,
        addResource,
        updateResource,
        deleteResource,
        inventory,
        addInventoryItem,
        updateInventoryItem,
        adjustStock,
        deleteInventoryItem,
        workers,
        addWorker,
        updateWorker,
        deleteWorker,
        activities,
        addActivity,
        updateActivityStatus,
        deleteActivity,
        qrRecords,
        lookupQRCode,
        resetDatabase,
        seedDemoDataToBackend,
        activeTab,
        setActiveTab,
        isScannerOpen,
        setIsScannerOpen,
        selectedScannedResult,
        setSelectedScannedResult,

        // Supabase Cloud Integration
        isSupabaseConfigured: supabaseConfig.isConfigured,
        isSupabaseConnected,
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
      }}
    >
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
