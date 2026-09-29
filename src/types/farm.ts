export type UserRole = 'administrator' | 'farm_worker';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  position?: string;
  status: 'Active' | 'Inactive';
}

export type PlotStatus = 'Active' | 'Harvested' | 'Inactive' | 'Fallow' | 'Nursery';

export interface FarmPlot {
  id: number;
  plot_code: string; // e.g. PLT-0001
  plot_name: string; // e.g. Plot A - Cassava Plantation
  location: string; // e.g. Block 1, East Sector
  size: number; // e.g. 2.5
  size_unit?: 'hectares' | 'acres';
  crop_type: string; // e.g. Cassava (TMS 30572)
  planting_date: string; // YYYY-MM-DD
  expected_harvest_date?: string;
  status: PlotStatus;
  description: string;
  qr_code: string; // e.g. FARM-PLT-0001
  created_at: string;
}

export type ResourceCategory = 'Equipment' | 'Tool' | 'Facility' | 'Livestock' | 'Vehicle' | 'Processing';
export type ResourceCondition = 'Good' | 'Fair' | 'Needs Maintenance' | 'Damaged';

export interface Resource {
  id: number;
  resource_code: string; // e.g. RES-0001
  name: string; // e.g. Massey Ferguson Tractor 275
  category: ResourceCategory;
  quantity: number;
  condition: ResourceCondition;
  location: string; // e.g. Central Machinery Shed
  qr_code: string; // e.g. FARM-RES-0001
  description: string;
  created_at: string;
}

export type ActivityStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface FarmActivity {
  id: number;
  activity_code: string; // e.g. ACT-0001
  activity_name: string; // e.g. Fertilizer Application
  plot_id?: number;
  resource_id?: number;
  worker_id: number;
  activity_date: string; // YYYY-MM-DD
  description: string;
  status: ActivityStatus;
  inventory_item_id?: number;
  quantity_used?: number;
  created_at: string;
}

export type InventoryCategory = 'Seeds' | 'Fertilizer' | 'Animal Feed' | 'Chemicals' | 'Tools' | 'PPE' | 'Fuel';
export type InventoryStatus = 'Available' | 'Low Stock' | 'Out of Stock';

export interface InventoryItem {
  id: number;
  item_code: string; // e.g. INV-0001
  item_name: string; // e.g. NPK 15-15-15 Fertilizer
  category: InventoryCategory;
  quantity: number;
  unit: string; // Bag, Litre, Kg, Piece, Bundle
  minimum_stock: number;
  expiry_date?: string;
  status: InventoryStatus;
  qr_code: string; // e.g. FARM-INV-0001
  location?: string;
  created_at: string;
}

export interface Worker {
  id: number;
  worker_code: string; // e.g. WRK-0001
  full_name: string;
  phone: string;
  position: string; // e.g. Crop Specialist
  address: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  qr_code: string; // e.g. FARM-WRK-0001
  created_at: string;
}

export type RecordType = 'farm_plot' | 'resource' | 'inventory_item' | 'worker';

export interface QRCodeRecord {
  id: number;
  qr_code: string;
  record_type: RecordType;
  record_id: number;
  created_at: string;
}

export interface ScannedResult {
  qr_code: string;
  record_type: RecordType;
  record_data: FarmPlot | Resource | InventoryItem | Worker;
  activities?: FarmActivity[];
}

export interface DemoLoginCredential {
  role: UserRole;
  label: string;
  name: string;
  email: string;
  password: string;
  position: string;
  badgeColor: string;
  description: string;
}
