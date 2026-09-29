import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { FarmPlot, PlotStatus } from '../types/farm';
import QRCode from 'qrcode';
import {
  MapPin,
  Plus,
  Search,
  QrCode,
  Edit2,
  Trash2,
  X,
  Download,
} from 'lucide-react';

export const PlotsManager: React.FC = () => {
  const {
    plots,
    addPlot,
    updatePlot,
    deletePlot,
    currentUser,
    setIsScannerOpen,
    lookupQRCode,
    setSelectedScannedResult,
  } = useFarm();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<FarmPlot | null>(null);
  const [qrModalPlot, setQrModalPlot] = useState<FarmPlot | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    plot_name: '',
    location: 'Ikot Ekpene Site',
    size: 1.0,
    size_unit: 'hectares' as 'hectares' | 'acres',
    crop_type: '',
    planting_date: new Date().toISOString().split('T')[0],
    expected_harvest_date: '',
    status: 'Active' as PlotStatus,
    description: '',
  });

  const filteredPlots = plots.filter((plot) => {
    const matchesSearch =
      plot.plot_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plot.plot_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plot.crop_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plot.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || plot.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingPlot(null);
    setFormData({
      plot_name: '',
      location: 'Ikot Ekpene Site',
      size: 1.5,
      size_unit: 'hectares',
      crop_type: '',
      planting_date: new Date().toISOString().split('T')[0],
      expected_harvest_date: '',
      status: 'Active',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plot: FarmPlot) => {
    setEditingPlot(plot);
    setFormData({
      plot_name: plot.plot_name,
      location: plot.location,
      size: plot.size,
      size_unit: plot.size_unit || 'hectares',
      crop_type: plot.crop_type,
      planting_date: plot.planting_date,
      expected_harvest_date: plot.expected_harvest_date || '',
      status: plot.status,
      description: plot.description,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlot) {
      updatePlot(editingPlot.id, formData);
    } else {
      addPlot(formData);
    }
    setIsModalOpen(false);
  };

  const handleViewQR = async (plot: FarmPlot) => {
    setQrModalPlot(plot);
    try {
      const url = await QRCode.toDataURL(plot.qr_code, { width: 300, margin: 2 });
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
            <MapPin className="w-5 h-5 text-emerald-700" />
            <span>Farm Plot Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register and manage field plots, crop varieties, planting dates, and unique QR code tags.
          </p>
        </div>

        {currentUser.role === 'administrator' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Plot</span>
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
            placeholder="Search plot name, code, crop, or location..."
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Harvested">Harvested</option>
          <option value="Fallow">Fallow</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredPlots.map((plot) => (
          <div
            key={plot.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-[10px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                    {plot.plot_code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{plot.plot_name}</h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    plot.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : plot.status === 'Harvested'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {plot.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">{plot.description}</p>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 my-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">Crop Cultivated:</span>
                  <span className="font-semibold text-slate-800">{plot.crop_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Plot Size:</span>
                  <span className="font-semibold text-slate-800">{plot.size} {plot.size_unit || 'ha'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Planting Date:</span>
                  <span className="font-semibold text-slate-800">{plot.planting_date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">QR Code ID:</span>
                  <button
                    onClick={() => handleQuickScan(plot.qr_code)}
                    className="font-mono text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    {plot.qr_code}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{plot.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <button
                onClick={() => handleViewQR(plot)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                <span>View QR Badge</span>
              </button>

              {currentUser.role === 'administrator' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(plot)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Edit Plot"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete plot "${plot.plot_name}"?`)) {
                        deletePlot(plot.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Delete Plot"
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
            <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingPlot ? 'Edit Plot Details' : 'Register New Farm Plot'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Plot Title *</label>
                <input
                  type="text"
                  required
                  value={formData.plot_name}
                  onChange={(e) => setFormData({ ...formData, plot_name: e.target.value })}
                  placeholder="e.g. Plot F - SAMMAZ Hybrid Maize"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Crop Variety *</label>
                  <input
                    type="text"
                    required
                    value={formData.crop_type}
                    onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                    placeholder="e.g. Yellow Maize"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Plot Size (Hectares) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Planting Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.planting_date}
                    onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PlotStatus })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Harvested">Harvested</option>
                    <option value="Fallow">Fallow</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Sector</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plot Notes</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes regarding soil, ridge spacing, or expected yield..."
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
                  className="px-5 py-2 bg-emerald-700 text-white rounded-lg font-bold"
                >
                  {editingPlot ? 'Update Plot' : 'Save & Assign QR Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModalPlot && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 text-slate-900 p-6 text-center space-y-4">
            <div className="p-4 bg-emerald-950 text-white rounded-2xl border-2 border-amber-400 shadow-md text-center space-y-2">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest border-b border-emerald-800 pb-1">
                U & E Grace Foundation Farm
              </div>
              <h4 className="font-extrabold text-sm text-white">{qrModalPlot.plot_name}</h4>
              <div className="bg-white p-2 rounded-xl inline-block shadow-inner mx-auto my-1">
                <img src={qrDataUrl} alt={qrModalPlot.qr_code} className="w-44 h-44 mx-auto" />
              </div>
              <div className="font-mono text-sm font-bold text-amber-400 bg-emerald-900 px-3 py-1 rounded-md inline-block">
                {qrModalPlot.qr_code}
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <a
                href={qrDataUrl}
                download={`${qrModalPlot.qr_code}.png`}
                className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </a>
              <button
                onClick={() => setQrModalPlot(null)}
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
