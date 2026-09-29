import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { Worker } from '../types/farm';
import QRCode from 'qrcode';
import {
  Users,
  Plus,
  Search,
  QrCode,
  Edit2,
  Trash2,
  X,
  Download,
  Phone,
  MapPin,
  ClipboardList,
} from 'lucide-react';

export const WorkersManager: React.FC = () => {
  const {
    workers,
    addWorker,
    updateWorker,
    deleteWorker,
    activities,
    currentUser,
    setIsScannerOpen,
    lookupQRCode,
    setSelectedScannedResult,
  } = useFarm();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);

  const [qrModalWorker, setQrModalWorker] = useState<Worker | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    position: 'Crop Production Supervisor',
    address: 'Ikot Ekpene, Akwa Ibom State',
    status: 'Active' as 'Active' | 'On Leave' | 'Inactive',
  });

  const filteredWorkers = workers.filter(
    (w) =>
      w.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.worker_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingWorker(null);
    setFormData({
      full_name: '',
      phone: '+234 ',
      position: 'Crop Production Supervisor',
      address: 'Ikot Ekpene, Akwa Ibom State',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w: Worker) => {
    setEditingWorker(w);
    setFormData({
      full_name: w.full_name,
      phone: w.phone,
      position: w.position,
      address: w.address,
      status: w.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker) {
      updateWorker(editingWorker.id, formData);
    } else {
      addWorker(formData);
    }
    setIsModalOpen(false);
  };

  const handleViewQR = async (w: Worker) => {
    setQrModalWorker(w);
    try {
      const url = await QRCode.toDataURL(w.qr_code, { width: 300, margin: 2 });
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
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Farm Worker Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register personnel, assign QR identity badges, and link staff to daily field activities.
          </p>
        </div>

        {currentUser.role === 'administrator' && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Worker</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search worker name, position, or ID code..."
          className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredWorkers.map((w) => {
          const actCount = activities.filter((a) => a.worker_id === w.id).length;

          return (
            <div
              key={w.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-indigo-900 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded">
                      {w.worker_code}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{w.full_name}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      w.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : w.status === 'On Leave'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {w.status}
                  </span>
                </div>

                <p className="text-xs font-semibold text-indigo-700">{w.position}</p>

                <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 my-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{w.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{w.address}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400 text-[10px]">QR ID Code:</span>
                    <button
                      onClick={() => handleQuickScan(w.qr_code)}
                      className="font-mono text-[11px] font-bold text-indigo-700 hover:underline"
                    >
                      {w.qr_code}
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-purple-600" />
                  <span>Logged Operations: <strong className="text-slate-800">{actCount}</strong></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <button
                  onClick={() => handleViewQR(w)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-indigo-700" />
                  <span>View ID Badge</span>
                </button>

                {currentUser.role === 'administrator' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(w)}
                      className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                      title="Edit Worker"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete worker "${w.full_name}"?`)) {
                          deleteWorker(w.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="Delete Worker"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-indigo-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingWorker ? 'Edit Worker Details' : 'Register New Worker'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-indigo-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Sunday Akpan"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Position / Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    placeholder="e.g. Crop Specialist"
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold"
                >
                  {editingWorker ? 'Update Worker' : 'Save & Assign ID Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {qrModalWorker && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 text-slate-900 p-6 text-center space-y-4">
            <div className="p-4 bg-indigo-950 text-white rounded-2xl border-2 border-amber-400 shadow-md text-center space-y-2">
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest border-b border-indigo-800 pb-1">
                U & E Grace Foundation Farm · Staff ID
              </div>
              <h4 className="font-extrabold text-base text-white">{qrModalWorker.full_name}</h4>
              <p className="text-xs text-amber-300 font-medium">{qrModalWorker.position}</p>
              
              <div className="bg-white p-2 rounded-xl inline-block shadow-inner mx-auto my-1">
                <img src={qrDataUrl} alt={qrModalWorker.qr_code} className="w-44 h-44 mx-auto" />
              </div>
              
              <div className="font-mono text-sm font-bold text-amber-400 bg-indigo-900 px-3 py-1 rounded-md inline-block">
                {qrModalWorker.qr_code}
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <a
                href={qrDataUrl}
                download={`${qrModalWorker.qr_code}.png`}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Badge PNG</span>
              </a>
              <button
                onClick={() => setQrModalWorker(null)}
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
