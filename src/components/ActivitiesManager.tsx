import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { FarmActivity, ActivityStatus } from '../types/farm';
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  X,
  Trash2,
  UserCheck,
  MapPin,
  Tractor,
  Package,
} from 'lucide-react';

export const ActivitiesManager: React.FC = () => {
  const {
    activities,
    addActivity,
    updateActivityStatus,
    deleteActivity,
    plots,
    resources,
    workers,
    inventory,
    currentUser,
  } = useFarm();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityName, setActivityName] = useState('');
  const [targetType, setTargetType] = useState<'plot' | 'resource'>('plot');
  const [selectedPlotId, setSelectedPlotId] = useState<number>(plots[0]?.id || 1);
  const [selectedResourceId, setSelectedResourceId] = useState<number>(resources[0]?.id || 1);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number>(workers[0]?.id || 1);
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<ActivityStatus>('Completed');
  const [description, setDescription] = useState('');

  const [selectedInventoryId, setSelectedInventoryId] = useState<number | 'none'>('none');
  const [inventoryQuantity, setInventoryQuantity] = useState<number>(1);

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.activity_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || act.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setActivityName('');
    setTargetType('plot');
    setSelectedPlotId(plots[0]?.id || 1);
    setSelectedResourceId(resources[0]?.id || 1);
    setSelectedWorkerId(workers[0]?.id || 1);
    setActivityDate(new Date().toISOString().split('T')[0]);
    setStatus('Completed');
    setDescription('');
    setSelectedInventoryId('none');
    setInventoryQuantity(1);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    addActivity({
      activity_name: activityName,
      plot_id: targetType === 'plot' ? Number(selectedPlotId) : undefined,
      resource_id: targetType === 'resource' ? Number(selectedResourceId) : undefined,
      worker_id: Number(selectedWorkerId),
      activity_date: activityDate,
      status,
      description,
      inventory_item_id: selectedInventoryId !== 'none' ? Number(selectedInventoryId) : undefined,
      quantity_used: selectedInventoryId !== 'none' ? Number(inventoryQuantity) : undefined,
    });
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-purple-600" />
            <span>Farm Activity & Field Operations Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Record land preparation, planting, weeding, fertilizer application, feeding, and machinery maintenance.
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl shadow flex items-center gap-2 transition shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Activity</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activity name, code, or description..."
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Pending">Pending</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredActivities.map((act) => {
          const assignedWorker = workers.find((w) => w.id === act.worker_id);
          const targetPlot = plots.find((p) => p.id === act.plot_id);
          const targetRes = resources.find((r) => r.id === act.resource_id);
          const invItem = inventory.find((i) => i.id === act.inventory_item_id);

          return (
            <div
              key={act.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] font-bold text-purple-900 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded">
                    {act.activity_code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{act.activity_name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-500">{act.activity_date}</span>
                  
                  <select
                    value={act.status}
                    onChange={(e) => updateActivityStatus(act.id, e.target.value as ActivityStatus)}
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg border font-medium ${
                      act.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : act.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300'
                    }`}
                  >
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{act.description}</p>

              <div className="flex flex-wrap items-center justify-between text-xs pt-2 text-slate-600 gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Worker: <strong>{assignedWorker?.full_name || 'Staff Member'}</strong></span>
                  </span>

                  {targetPlot && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Plot: <strong>{targetPlot.plot_name} ({targetPlot.plot_code})</strong></span>
                    </span>
                  )}

                  {targetRes && (
                    <span className="flex items-center gap-1">
                      <Tractor className="w-3.5 h-3.5 text-amber-600" />
                      <span>Resource: <strong>{targetRes.name} ({targetRes.resource_code})</strong></span>
                    </span>
                  )}

                  {invItem && act.quantity_used && (
                    <span className="flex items-center gap-1 text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      <Package className="w-3.5 h-3.5 text-blue-600" />
                      <span>Input Used: <strong>{act.quantity_used} {invItem.unit}</strong> ({invItem.item_name})</span>
                    </span>
                  )}
                </div>

                {currentUser.role === 'administrator' && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete activity record "${act.activity_name}"?`)) {
                        deleteActivity(act.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 my-8">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-base">Record Farm Activity</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-purple-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveActivity} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity Title / Name *</label>
                <input
                  type="text"
                  required
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="e.g. Basal Fertilizer Application, Weeding, Maintenance"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Associated With</label>
                  <select
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="plot">Farm Plot</option>
                    <option value="resource">Resource</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Target *</label>
                  {targetType === 'plot' ? (
                    <select
                      value={selectedPlotId}
                      onChange={(e) => setSelectedPlotId(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    >
                      {plots.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.plot_name} ({p.plot_code})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={selectedResourceId}
                      onChange={(e) => setSelectedResourceId(Number(e.target.value))}
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    >
                      {resources.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.resource_code})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Worker *</label>
                  <select
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.full_name} ({w.position})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Activity Date *</label>
                  <input
                    type="date"
                    required
                    value={activityDate}
                    onChange={(e) => setActivityDate(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                <label className="block font-bold text-purple-900">Optional Input Deducted from Stock:</label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <select
                      value={selectedInventoryId}
                      onChange={(e) => setSelectedInventoryId(e.target.value === 'none' ? 'none' : Number(e.target.value))}
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white"
                    >
                      <option value="none">-- No Inventory Material Used --</option>
                      {inventory.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.item_name} ({i.quantity} {i.unit} available)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      disabled={selectedInventoryId === 'none'}
                      value={inventoryQuantity}
                      onChange={(e) => setInventoryQuantity(Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full p-2 border border-slate-300 rounded text-xs bg-white disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Activity Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Record observations, dosages applied, or maintenance details..."
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
                  className="px-5 py-2 bg-purple-700 text-white rounded-lg font-bold"
                >
                  Save Activity Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
