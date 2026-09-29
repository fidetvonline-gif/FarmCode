import { getSupabaseClient, getActiveSupabaseConfig, testSupabaseConnection } from '../lib/supabase';
import {
  FarmPlot,
  Resource,
  InventoryItem,
  Worker,
  FarmActivity,
  QRCodeRecord,
  User,
} from '../types/farm';

export interface AllFarmData {
  users: User[];
  plots: FarmPlot[];
  resources: Resource[];
  inventory: InventoryItem[];
  workers: Worker[];
  activities: FarmActivity[];
  qrRecords: QRCodeRecord[];
}

export const supabaseFarmService = {
  isConfigured(): boolean {
    return getActiveSupabaseConfig().isConfigured && getSupabaseClient() !== null;
  },

  async testConnection() {
    return testSupabaseConnection();
  },

  // BATCH FETCH ALL FARM DATA
  async fetchAllFarmData(): Promise<{ success: boolean; data?: AllFarmData; error?: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase client is not configured' };
    }

    try {
      const [
        usersRes,
        plotsRes,
        resourcesRes,
        inventoryRes,
        workersRes,
        activitiesRes,
        qrRes,
      ] = await Promise.all([
        client.from('users').select('*').order('id', { ascending: true }),
        client.from('farm_plots').select('*').order('id', { ascending: false }),
        client.from('resources').select('*').order('id', { ascending: false }),
        client.from('inventory').select('*').order('id', { ascending: false }),
        client.from('workers').select('*').order('id', { ascending: false }),
        client.from('farm_activities').select('*').order('id', { ascending: false }),
        client.from('qr_codes').select('*').order('id', { ascending: false }),
      ]);

      if (
        usersRes.error ||
        plotsRes.error ||
        resourcesRes.error ||
        inventoryRes.error ||
        workersRes.error ||
        activitiesRes.error ||
        qrRes.error
      ) {
        const anyError =
          usersRes.error ||
          plotsRes.error ||
          resourcesRes.error ||
          inventoryRes.error ||
          workersRes.error ||
          activitiesRes.error ||
          qrRes.error;
        return { success: false, error: anyError?.message || 'Error fetching records from Supabase tables' };
      }

      return {
        success: true,
        data: {
          users: (usersRes.data || []) as User[],
          plots: (plotsRes.data || []) as FarmPlot[],
          resources: (resourcesRes.data || []) as Resource[],
          inventory: (inventoryRes.data || []) as InventoryItem[],
          workers: (workersRes.data || []) as Worker[],
          activities: (activitiesRes.data || []) as FarmActivity[],
          qrRecords: (qrRes.data || []) as QRCodeRecord[],
        },
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to fetch farm data from Supabase' };
    }
  },

  // USERS
  async getUsers(): Promise<User[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('users')
      .select('*')
      .order('id', { ascending: true });
    if (error) {
      console.warn('Supabase getUsers error:', error.message);
      return null;
    }
    return data as User[];
  },

  async createUser(user: User): Promise<User | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('users')
      .upsert([user], { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      console.warn('Supabase createUser error:', error.message);
      return null;
    }
    return data as User;
  },

  // FARM PLOTS
  async getPlots(): Promise<FarmPlot[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('farm_plots')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      console.warn('Supabase getPlots error:', error.message);
      return null;
    }
    return data as FarmPlot[];
  },

  async createPlot(plot: FarmPlot): Promise<FarmPlot | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('farm_plots')
      .upsert([plot], { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      console.warn('Supabase createPlot error:', error.message);
      return null;
    }
    return data as FarmPlot;
  },

  async updatePlot(id: number, plotData: Partial<FarmPlot>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('farm_plots')
      .update(plotData)
      .eq('id', id);
    if (error) {
      console.warn('Supabase updatePlot error:', error.message);
      return false;
    }
    return true;
  },

  async deletePlot(id: number): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('farm_plots')
      .delete()
      .eq('id', id);
    if (error) {
      console.warn('Supabase deletePlot error:', error.message);
      return false;
    }
    return true;
  },

  // RESOURCES
  async getResources(): Promise<Resource[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('resources')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      console.warn('Supabase getResources error:', error.message);
      return null;
    }
    return data as Resource[];
  },

  async createResource(resource: Resource): Promise<Resource | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('resources')
      .upsert([resource], { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      console.warn('Supabase createResource error:', error.message);
      return null;
    }
    return data as Resource;
  },

  async updateResource(id: number, resourceData: Partial<Resource>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('resources')
      .update(resourceData)
      .eq('id', id);
    if (error) {
      console.warn('Supabase updateResource error:', error.message);
      return false;
    }
    return true;
  },

  async deleteResource(id: number): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('resources')
      .delete()
      .eq('id', id);
    if (error) {
      console.warn('Supabase deleteResource error:', error.message);
      return false;
    }
    return true;
  },

  // INVENTORY
  async getInventory(): Promise<InventoryItem[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('inventory')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      console.warn('Supabase getInventory error:', error.message);
      return null;
    }
    return data as InventoryItem[];
  },

  async createInventoryItem(item: InventoryItem): Promise<InventoryItem | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('inventory')
      .upsert([item], { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      console.warn('Supabase createInventoryItem error:', error.message);
      return null;
    }
    return data as InventoryItem;
  },

  async updateInventoryItem(id: number, itemData: Partial<InventoryItem>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('inventory')
      .update(itemData)
      .eq('id', id);
    if (error) {
      console.warn('Supabase updateInventoryItem error:', error.message);
      return false;
    }
    return true;
  },

  async deleteInventoryItem(id: number): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('inventory')
      .delete()
      .eq('id', id);
    if (error) {
      console.warn('Supabase deleteInventoryItem error:', error.message);
      return false;
    }
    return true;
  },

  // WORKERS
  async getWorkers(): Promise<Worker[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('workers')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      console.warn('Supabase getWorkers error:', error.message);
      return null;
    }
    return data as Worker[];
  },

  async createWorker(worker: Worker): Promise<Worker | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('workers')
      .upsert([worker], { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      console.warn('Supabase createWorker error:', error.message);
      return null;
    }
    return data as Worker;
  },

  async updateWorker(id: number, workerData: Partial<Worker>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('workers')
      .update(workerData)
      .eq('id', id);
    if (error) {
      console.warn('Supabase updateWorker error:', error.message);
      return false;
    }
    return true;
  },

  async deleteWorker(id: number): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('workers')
      .delete()
      .eq('id', id);
    if (error) {
      console.warn('Supabase deleteWorker error:', error.message);
      return false;
    }
    return true;
  },

  // ACTIVITIES
  async getActivities(): Promise<FarmActivity[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('farm_activities')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      console.warn('Supabase getActivities error:', error.message);
      return null;
    }
    return data as FarmActivity[];
  },

  async createActivity(activity: FarmActivity): Promise<FarmActivity | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('farm_activities')
      .upsert([activity], { onConflict: 'id' })
      .select()
      .single();
    if (error) {
      console.warn('Supabase createActivity error:', error.message);
      return null;
    }
    return data as FarmActivity;
  },

  async updateActivity(id: number, activityData: Partial<FarmActivity>): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('farm_activities')
      .update(activityData)
      .eq('id', id);
    if (error) {
      console.warn('Supabase updateActivity error:', error.message);
      return false;
    }
    return true;
  },

  async deleteActivity(id: number): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('farm_activities')
      .delete()
      .eq('id', id);
    if (error) {
      console.warn('Supabase deleteActivity error:', error.message);
      return false;
    }
    return true;
  },

  // QR CODES
  async getQRCodes(): Promise<QRCodeRecord[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('qr_codes')
      .select('*')
      .order('id', { ascending: false });
    if (error) {
      console.warn('Supabase getQRCodes error:', error.message);
      return null;
    }
    return data as QRCodeRecord[];
  },

  async createQRCode(qrRecord: QRCodeRecord): Promise<QRCodeRecord | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data, error } = await client
      .from('qr_codes')
      .upsert([qrRecord], { onConflict: 'qr_code' })
      .select()
      .single();
    if (error) {
      console.warn('Supabase createQRCode error:', error.message);
      return null;
    }
    return data as QRCodeRecord;
  },

  async deleteQRCode(qrCode: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { error } = await client
      .from('qr_codes')
      .delete()
      .eq('qr_code', qrCode);
    if (error) {
      console.warn('Supabase deleteQRCode error:', error.message);
      return false;
    }
    return true;
  },

  // BULK SYNC / SEED ALL TO SUPABASE
  async syncAllToSupabase(data: AllFarmData): Promise<{ success: boolean; message: string }> {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, message: 'Supabase is not configured yet.' };
    }

    try {
      if (data.users && data.users.length > 0) {
        await client.from('users').upsert(data.users, { onConflict: 'id' });
      }
      if (data.plots && data.plots.length > 0) {
        await client.from('farm_plots').upsert(data.plots, { onConflict: 'id' });
      }
      if (data.resources && data.resources.length > 0) {
        await client.from('resources').upsert(data.resources, { onConflict: 'id' });
      }
      if (data.inventory && data.inventory.length > 0) {
        await client.from('inventory').upsert(data.inventory, { onConflict: 'id' });
      }
      if (data.workers && data.workers.length > 0) {
        await client.from('workers').upsert(data.workers, { onConflict: 'id' });
      }
      if (data.activities && data.activities.length > 0) {
        await client.from('farm_activities').upsert(data.activities, { onConflict: 'id' });
      }
      if (data.qrRecords && data.qrRecords.length > 0) {
        await client.from('qr_codes').upsert(data.qrRecords, { onConflict: 'qr_code' });
      }

      return {
        success: true,
        message: 'Successfully pushed all records to Supabase PostgreSQL database.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Error syncing data to Supabase.',
      };
    }
  },
};
