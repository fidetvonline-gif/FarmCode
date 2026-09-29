import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Resource, ResourceCategory, ResourceCondition } from '../types/farm';
import QRCode from 'qrcode';
import {
  Tractor,
  Plus,
  Search,
  QrCode,
  Edit2,
  Trash2,
  X,
  Download,
} from 'lucide-react';

export const ResourcesManager: React.FC = () => {
  const {
    resources,
    addResource,
    updateResource,
    deleteResource,
    currentUser,
    setIsScannerOpen,
    lookupQRCode,
    setSelectedScannedResult,
  } = useFarm();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [qrModalRes, setQrModalRes] = useState<Resource | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'Equipment' as ResourceCategory,
    quantity: 1,
    condition: 'Good' as ResourceCondition,
    location: 'Central Depot',
    description: '',
  });

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.resource_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.qr_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || res.category === categoryFilter;
    const matchesCond = conditionFilter === 'all' || res.condition === conditionFilter;
    return matchesSearch && matchesCat && matchesCond;
  });

  const handleOpenAdd = () => {
    setEditingResource(null);
    setFormData({
      name: '',
      category: 'Equipment',
      quantity: 1,
      condition: 'Good',
      location: 'Central Depot',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setFormData({
      name: res.name,
      category: res.category,
      quantity: res.quantity,
      condition: res.condition,
      location: res.location,
      description: res.description,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingResource) {
      updateResource(editingResource.id, formData);
    } else {
      addResource(formData);
    }
    setIsModalOpen(false);
  };

  const handleViewQR = async (res: Resource) => {
    setQrModalRes(res);
    try {
      const url = await QRCode.toDataURL(res.qr_code, { width: 300, margin: 2 });
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
            <Tractor className="w-5 h-5 text-amber-600" />
            <span>Farm Resource & Asset Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register machinery, tools, processing units, facilities, and assigned QR identification tags.
          </p>
        </div>

        {currentUser.role === 'administrator' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Resource</span>
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
            placeholder="Search resource name, code, or location..."
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
        >
          <option value="all">All Categories</option>
          <option value="Equipment">Equipment</option>
          <option value="Tool">Tools</option>
          <option value="Facility">Facility</option>
          <option value="Processing">Processing</option>
          <option value="Livestock">Livestock</option>
        </select>

        <select
          value={conditionFilter}
          onChange={(e) => setConditionFilter(e.target.value)}
          className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
        >
          <option value="all">All Conditions</option>
          <option value="Good">Good</option>
          <option value="Fair">Fair</option>
          <option value="Needs Maintenance">Needs Maintenance</option>
          <option value="Damaged">Damaged</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                    {res.resource_code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{res.name}</h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    res.condition === 'Good'
                      ? 'bg-emerald-100 text-emerald-800'
                      : res.condition === 'Needs Maintenance'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {res.condition}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">{res.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 my-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Category:</span>
                  <span className="font-semibold text-slate-800">{res.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Quantity:</span>
                  <span className="font-semibold text-slate-800">{res.quantity} unit(s)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">QR Code ID:</span>
                  <button
                    onClick={() => handleQuickScan(res.qr_code)}
                    className="font-mono text-[11px] font-bold text-amber-700 hover:underline"
                  >
                    {res.qr_code}
                  </button>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Location:</span>
                  <span className="font-semibold text-slate-800 truncate block">{res.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => handleViewQR(res)}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-700" />
                <span>View QR Badge</span>
              </button>

              {currentUser.role === 'administrator' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(res)}
                    className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Edit Resource"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete resource "${res.name}"?`)) {
                        deleteResource(res.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-amber-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingResource ? 'Edit Resource Asset' : 'Register New Resource'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-amber-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Resource Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Massey Ferguson Tractor 275"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ResourceCategory })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Tool">Tool</option>
                    <option value="Facility">Facility</option>
                    <option value="Processing">Processing</option>
                    <option value="Livestock">Livestock</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value as ResourceCondition })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Maintenance">Needs Maintenance</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter specifications or maintenance details..."
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                ></textarea>
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
                  className="px-5 py-2 bg-amber-600 text-white rounded-lg font-bold"
                >
                  {editingResource ? 'Update Resource' : 'Save & Assign QR Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModalRes && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 text-slate-900 p-6 text-center space-y-4">
            <div className="p-4 bg-slate-900 text-white rounded-2xl border-2 border-amber-400 shadow-md text-center space-y-2">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest border-b border-slate-800 pb-1">
                U & E Grace Foundation Farm
              </div>
              <h4 className="font-extrabold text-sm text-white">{qrModalRes.name}</h4>
              <div className="bg-white p-2 rounded-xl inline-block shadow-inner mx-auto my-1">
                <img src={qrDataUrl} alt={qrModalRes.qr_code} className="w-44 h-44 mx-auto" />
              </div>
              <div className="font-mono text-sm font-bold text-amber-400 bg-slate-800 px-3 py-1 rounded-md inline-block">
                {qrModalRes.qr_code}
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <a
                href={qrDataUrl}
                download={`${qrModalRes.qr_code}.png`}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </a>
              <button
                onClick={() => setQrModalRes(null)}
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
