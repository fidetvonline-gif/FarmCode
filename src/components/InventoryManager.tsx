import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { InventoryItem, InventoryCategory } from '../types/farm';
import QRCode from 'qrcode';
import {
  Package,
  Plus,
  Search,
  QrCode,
  Edit2,
  Trash2,
  X,
  Download,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const {
    inventory,
    addInventoryItem,
    updateInventoryItem,
    adjustStock,
    deleteInventoryItem,
    currentUser,
    setIsScannerOpen,
    lookupQRCode,
    setSelectedScannedResult,
  } = useFarm();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [qrModalItem, setQrModalItem] = useState<InventoryItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const [adjustModalItem, setAdjustModalItem] = useState<InventoryItem | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'add' | 'deduct'>('deduct');

  const [formData, setFormData] = useState({
    item_name: '',
    category: 'Fertilizer' as InventoryCategory,
    quantity: 10,
    unit: '50kg Bag',
    minimum_stock: 5,
    expiry_date: '',
    location: 'Main Warehouse',
  });

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.qr_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      item_name: '',
      category: 'Fertilizer',
      quantity: 10,
      unit: '50kg Bag',
      minimum_stock: 5,
      expiry_date: '',
      location: 'Main Warehouse',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minimum_stock: item.minimum_stock,
      expiry_date: item.expiry_date || '',
      location: item.location || 'Main Warehouse',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateInventoryItem(editingItem.id, formData);
    } else {
      addInventoryItem(formData);
    }
    setIsModalOpen(false);
  };

  const handleConfirmStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalItem) return;
    const delta = adjustType === 'deduct' ? -Math.abs(adjustAmount) : Math.abs(adjustAmount);
    adjustStock(adjustModalItem.id, delta);
    setAdjustModalItem(null);
  };

  const handleViewQR = async (item: InventoryItem) => {
    setQrModalItem(item);
    try {
      const url = await QRCode.toDataURL(item.qr_code, { width: 300, margin: 2 });
      setQrDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickScan = (code: string) => {
    const res = lookupQRCode(code);
    if (res) {
      setSelectedScannedResult(res);
      setIsScannerOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span>Farm Inputs & Inventory Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor seeds, fertilizers, feeds, chemicals, safety gear, and low-stock reorder thresholds.
          </p>
        </div>

        {currentUser.role === 'administrator' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Input Item</span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search input name, item code, or QR ID..."
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="all">All Categories</option>
          <option value="Seeds">Seeds</option>
          <option value="Fertilizer">Fertilizer</option>
          <option value="Animal Feed">Animal Feed</option>
          <option value="Chemicals">Chemicals</option>
          <option value="PPE">PPE</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="all">All Stock Statuses</option>
          <option value="Available">Available</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Code / Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Current Stock</th>
                <th className="py-3 px-4 text-right">Minimum Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">QR ID</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[10px] font-bold text-blue-900 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded mr-2">
                      {item.item_code}
                    </span>
                    <span className="font-bold text-slate-900">{item.item_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                  <td className="py-3.5 px-4 text-right tabular-nums">
                    <span className="font-extrabold text-sm text-slate-900">{item.quantity}</span>{' '}
                    <span className="text-[11px] text-slate-500">{item.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right tabular-nums text-slate-500">
                    {item.minimum_stock} {item.unit}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Low Stock'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.status === 'Low Stock' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      <span>{item.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{item.location || 'Warehouse'}</td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleQuickScan(item.qr_code)}
                      className="font-mono text-[11px] font-bold text-blue-700 hover:underline"
                    >
                      {item.qr_code}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setAdjustModalItem(item);
                          setAdjustAmount(1);
                        }}
                        className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded text-[11px] transition cursor-pointer"
                        title="Adjust Stock Quantity"
                      >
                        Adjust
                      </button>

                      <button
                        onClick={() => handleViewQR(item)}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded transition cursor-pointer"
                        title="View QR Badge"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      {currentUser.role === 'administrator' && (
                        <>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded transition cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete inventory item "${item.item_name}"?`)) {
                                deleteInventoryItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {adjustModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Adjust Stock Level</h3>
                <p className="text-[11px] text-slate-300">{adjustModalItem.item_name} ({adjustModalItem.item_code})</p>
              </div>
              <button onClick={() => setAdjustModalItem(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmStockAdjust} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Quantity:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {adjustModalItem.quantity} {adjustModalItem.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Min Reorder Level:</span>
                  <span className="font-semibold text-slate-700 text-xs">
                    {adjustModalItem.minimum_stock} {adjustModalItem.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('deduct')}
                    className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1 border ${
                      adjustType === 'deduct'
                        ? 'bg-amber-500 text-amber-950 border-amber-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span>Deduct Stock (-)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1 border ${
                      adjustType === 'add'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>Restock (+)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantity ({adjustModalItem.unit}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-extrabold text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingItem ? 'Edit Farm Input' : 'Register New Farm Input'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  placeholder="e.g. NPK 15-15-15 Granular Fertilizer"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Fertilizer">Fertilizers</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Animal Feed">Animal Feed</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="PPE">PPE</option>
                    <option value="Tools">Tools</option>
                    <option value="Fuel">Fuel</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Packaging Unit *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. 50kg Bag"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum Stock Level *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.minimum_stock}
                    onChange={(e) => setFormData({ ...formData, minimum_stock: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-bold"
                >
                  {editingItem ? 'Update Item' : 'Save & Assign QR Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModalItem && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 text-slate-900 p-6 text-center space-y-4">
            <div className="p-4 bg-slate-900 text-white rounded-2xl border-2 border-amber-400 shadow-md text-center space-y-2">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest border-b border-slate-800 pb-1">
                U & E Grace Foundation Farm
              </div>
              <h4 className="font-extrabold text-sm text-white">{qrModalItem.item_name}</h4>
              <div className="bg-white p-2 rounded-xl inline-block shadow-inner mx-auto my-1">
                <img src={qrDataUrl} alt={qrModalItem.qr_code} className="w-44 h-44 mx-auto" />
              </div>
              <div className="font-mono text-sm font-bold text-amber-400 bg-slate-800 px-3 py-1 rounded-md inline-block">
                {qrModalItem.qr_code}
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <a
                href={qrDataUrl}
                download={`${qrModalItem.qr_code}.png`}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </a>
              <button
                onClick={() => setQrModalItem(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
