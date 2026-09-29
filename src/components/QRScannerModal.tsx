import React, { useState, useEffect, useRef } from 'react';
import { useFarm } from '../context/FarmContext';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  X,
  Camera,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  MapPin,
  Tractor,
  Package,
  Users,
  Plus,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { ScannedResult } from '../types/farm';

export const QRScannerModal: React.FC = () => {
  const {
    isScannerOpen,
    setIsScannerOpen,
    lookupQRCode,
    plots,
    resources,
    inventory,
    workers,
    addActivity,
    adjustStock,
    setActiveTab,
  } = useFarm();

  const [scanMode, setScanMode] = useState<'camera' | 'file' | 'demo'>('demo');
  const [manualCode, setManualCode] = useState<string>('');
  const [scannedResult, setScannedResult] = useState<ScannedResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // Activity logging drawer state inside scan result
  const [showLogActivityForm, setShowLogActivityForm] = useState<boolean>(false);
  const [actName, setActName] = useState<string>('');
  const [actWorkerId, setActWorkerId] = useState<number>(workers[0]?.id || 1);
  const [actDesc, setActDesc] = useState<string>('');
  const [actSuccessMsg, setActSuccessMsg] = useState<string | null>(null);

  // Stock adjust state
  const [showStockAdjustForm, setShowStockAdjustForm] = useState<boolean>(false);
  const [stockDelta, setStockDelta] = useState<number>(1);
  const [stockAction, setStockAction] = useState<'add' | 'deduct'>('deduct');

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-video-element';

  // Handle Close
  const handleClose = () => {
    stopCameraScanner();
    setScannedResult(null);
    setErrorMessage(null);
    setIsScannerOpen(false);
  };

  // Start Camera Scanner
  const startCameraScanner = async () => {
    setErrorMessage(null);
    try {
      if (html5QrcodeRef.current) {
        await stopCameraScanner();
      }

      const html5Qrcode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      html5QrcodeRef.current = html5Qrcode;

      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleCodeFound(decodedText);
          stopCameraScanner();
        },
        () => {
          // Frame scan pass - silence per-frame errors
        }
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setIsCameraActive(false);
      setErrorMessage('Unable to access camera. Please allow camera permissions or try uploading a QR image.');
    }
  };

  const stopCameraScanner = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      try {
        await html5QrcodeRef.current.stop();
        html5QrcodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping camera scanner:', err);
      }
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (isScannerOpen && scanMode === 'camera') {
      startCameraScanner();
    } else {
      stopCameraScanner();
    }
    return () => {
      stopCameraScanner();
    };
  }, [isScannerOpen, scanMode]);

  // Process code lookup
  const handleCodeFound = (code: string) => {
    setErrorMessage(null);
    setActSuccessMsg(null);
    setShowLogActivityForm(false);
    setShowStockAdjustForm(false);

    const result = lookupQRCode(code);
    if (result) {
      setScannedResult(result);
    } else {
      setScannedResult(null);
      setErrorMessage('QR Code not recognized. Please verify the code or contact the administrator.');
    }
  };

  // File Upload scanner handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setErrorMessage(null);

    try {
      const html5Qrcode = new Html5Qrcode('qr-file-temp');
      const decodedText = await html5Qrcode.scanFile(file, true);
      handleCodeFound(decodedText);
      html5Qrcode.clear();
    } catch (err) {
      setScannedResult(null);
      setErrorMessage('Could not detect a valid QR Code in the uploaded image. Please try a clearer picture.');
    }
  };

  // Log Activity for Scanned Entity
  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedResult || !actName.trim()) return;

    const data = scannedResult.record_data;
    const type = scannedResult.record_type;

    addActivity({
      activity_name: actName,
      plot_id: type === 'farm_plot' ? data.id : undefined,
      resource_id: type === 'resource' ? data.id : undefined,
      worker_id: Number(actWorkerId),
      activity_date: new Date().toISOString().split('T')[0],
      description: actDesc || `Activity performed on scanned ${type.replace('_', ' ')} (${scannedResult.qr_code})`,
      status: 'Completed',
    });

    setActSuccessMsg(`Activity "${actName}" recorded successfully for ${scannedResult.qr_code}!`);
    setShowLogActivityForm(false);
    setActName('');
    setActDesc('');

    const refreshed = lookupQRCode(scannedResult.qr_code);
    if (refreshed) setScannedResult(refreshed);
  };

  // Adjust stock for scanned inventory item
  const handleStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedResult || scannedResult.record_type !== 'inventory_item') return;

    const delta = stockAction === 'deduct' ? -Math.abs(stockDelta) : Math.abs(stockDelta);
    adjustStock(scannedResult.record_data.id, delta);

    setActSuccessMsg(
      `Inventory ${stockAction === 'deduct' ? 'deducted' : 'restocked'} by ${stockDelta} ${
        (scannedResult.record_data as any).unit
      }`
    );
    setShowStockAdjustForm(false);

    const refreshed = lookupQRCode(scannedResult.qr_code);
    if (refreshed) setScannedResult(refreshed);
  };

  if (!isScannerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-8">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <QrCode className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">QR Code Scanner & Lookup</h2>
              <p className="text-xs text-emerald-300">Scan or select farm records to retrieve information instantly</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div id="qr-file-temp" className="hidden"></div>

        <div className="p-6">
          {/* Scan Mode Tabs */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => { setScanMode('demo'); setErrorMessage(null); }}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                scanMode === 'demo' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Select Code / Demo</span>
            </button>
            <button
              onClick={() => { setScanMode('camera'); setErrorMessage(null); }}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                scanMode === 'camera' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Video Feed</span>
            </button>
            <button
              onClick={() => { setScanMode('file'); stopCameraScanner(); setErrorMessage(null); }}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                scanMode === 'file' ? 'bg-white text-emerald-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload QR Image</span>
            </button>
          </div>

          {/* DEMO MODE */}
          {scanMode === 'demo' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <label className="block text-xs font-bold text-emerald-900 mb-1.5">
                  Simulate QR Scan (Select from Registered Farm Asset Codes):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleCodeFound(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="" disabled>-- Select a Farm Plot QR Code --</option>
                    {plots.map((p) => (
                      <option key={p.id} value={p.qr_code}>
                        {p.qr_code} - {p.plot_name} ({p.crop_type})
                      </option>
                    ))}
                  </select>

                  <select
                    onChange={(e) => {
                      if (e.target.value) handleCodeFound(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="" disabled>-- Select a Resource QR Code --</option>
                    {resources.map((r) => (
                      <option key={r.id} value={r.qr_code}>
                        {r.qr_code} - {r.name} ({r.category})
                      </option>
                    ))}
                  </select>

                  <select
                    onChange={(e) => {
                      if (e.target.value) handleCodeFound(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="" disabled>-- Select an Inventory QR Code --</option>
                    {inventory.map((i) => (
                      <option key={i.id} value={i.qr_code}>
                        {i.qr_code} - {i.item_name} ({i.quantity} {i.unit})
                      </option>
                    ))}
                  </select>

                  <select
                    onChange={(e) => {
                      if (e.target.value) handleCodeFound(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="" disabled>-- Select a Worker QR Code --</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.qr_code}>
                        {w.qr_code} - {w.full_name} ({w.position})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualCode.trim()) handleCodeFound(manualCode);
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter QR Code string e.g. FARM-PLT-0001 or FARM-RES-0001"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Lookup Code
                </button>
              </form>
            </div>
          )}

          {/* CAMERA MODE */}
          {scanMode === 'camera' && (
            <div className="space-y-3">
              <div
                id={scannerContainerId}
                className="w-full min-h-[280px] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center text-slate-400 text-xs relative border border-slate-700"
              >
                {!isCameraActive && (
                  <div className="text-center p-6 space-y-2">
                    <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                    <p>Starting camera video scanner feed...</p>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                Point your camera at a printed QR code tag on plot stakes, machinery, or storage bags.
              </p>
            </div>
          )}

          {/* FILE UPLOAD MODE */}
          {scanMode === 'file' && (
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center bg-slate-50 transition">
              <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800 mb-1">Upload QR Code Photo or Screenshot</p>
              <p className="text-xs text-slate-500 mb-4">Select a JPG, PNG, or WEBP image containing a QR code</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm transition">
                <span>Choose Image File</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Search Warning</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {actSuccessMsg && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actSuccessMsg}</span>
            </div>
          )}

          {/* SCANNED RESULT CARD */}
          {scannedResult && (
            <div className="mt-6 border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-emerald-700 text-white rounded-lg">
                    {scannedResult.record_type === 'farm_plot' && <MapPin className="w-5 h-5" />}
                    {scannedResult.record_type === 'resource' && <Tractor className="w-5 h-5" />}
                    {scannedResult.record_type === 'inventory_item' && <Package className="w-5 h-5" />}
                    {scannedResult.record_type === 'worker' && <Users className="w-5 h-5" />}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                      {scannedResult.record_type.replace('_', ' ')} Record
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {scannedResult.record_type === 'farm_plot' && (scannedResult.record_data as any).plot_name}
                      {scannedResult.record_type === 'resource' && (scannedResult.record_data as any).name}
                      {scannedResult.record_type === 'inventory_item' && (scannedResult.record_data as any).item_name}
                      {scannedResult.record_type === 'worker' && (scannedResult.record_data as any).full_name}
                    </h3>
                  </div>
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md">
                    {scannedResult.qr_code}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
                {scannedResult.record_type === 'farm_plot' && (
                  <>
                    <div><span className="text-slate-400 block text-[10px]">Plot Code:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).plot_code}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Crop Cultivated:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).crop_type}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Plot Size:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).size} ha</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Planting Date:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).planting_date}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Location:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).location}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Status:</span><span className="font-semibold text-emerald-700">{(scannedResult.record_data as any).status}</span></div>
                  </>
                )}

                {scannedResult.record_type === 'resource' && (
                  <>
                    <div><span className="text-slate-400 block text-[10px]">Resource Code:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).resource_code}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Category:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).category}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Quantity:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).quantity} units</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Condition:</span><span className="font-semibold text-emerald-700">{(scannedResult.record_data as any).condition}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Location:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).location}</span></div>
                  </>
                )}

                {scannedResult.record_type === 'inventory_item' && (
                  <>
                    <div><span className="text-slate-400 block text-[10px]">Item Code:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).item_code}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Current Stock:</span><span className="font-bold text-slate-900">{(scannedResult.record_data as any).quantity} {(scannedResult.record_data as any).unit}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Minimum Stock:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).minimum_stock} {(scannedResult.record_data as any).unit}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Stock Status:</span><span className={`font-bold ${(scannedResult.record_data as any).status === 'Available' ? 'text-emerald-700' : 'text-amber-600'}`}>{(scannedResult.record_data as any).status}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Category:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).category}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Storage Location:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).location || 'Warehouse'}</span></div>
                  </>
                )}

                {scannedResult.record_type === 'worker' && (
                  <>
                    <div><span className="text-slate-400 block text-[10px]">Worker Code:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).worker_code}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Position:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).position}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Phone Contact:</span><span className="font-semibold text-slate-800">{(scannedResult.record_data as any).phone}</span></div>
                    <div><span className="text-slate-400 block text-[10px]">Status:</span><span className="font-semibold text-emerald-700">{(scannedResult.record_data as any).status}</span></div>
                  </>
                )}
              </div>

              {scannedResult.activities && scannedResult.activities.length > 0 && (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-emerald-700" />
                    <span>Recent Activity Logs ({scannedResult.activities.length}):</span>
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {scannedResult.activities.slice(0, 3).map((act) => (
                      <div key={act.id} className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-semibold text-slate-800">{act.activity_name}</span>
                          <span className="text-slate-500 block">{act.description}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">{act.activity_date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200">
                <button
                  onClick={() => { setShowLogActivityForm(!showLogActivityForm); setShowStockAdjustForm(false); }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Activity For This Record</span>
                </button>

                {scannedResult.record_type === 'inventory_item' && (
                  <button
                    onClick={() => { setShowStockAdjustForm(!showStockAdjustForm); setShowLogActivityForm(false); }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Adjust Stock Quantity</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const typeTabMap: Record<string, string> = {
                      farm_plot: 'plots',
                      resource: 'resources',
                      inventory_item: 'inventory',
                      worker: 'workers',
                    };
                    setActiveTab(typeTabMap[scannedResult.record_type] || 'dashboard');
                    handleClose();
                  }}
                  className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ml-auto cursor-pointer"
                >
                  <span>Open Full Record View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {showLogActivityForm && (
                <form onSubmit={handleSaveActivity} className="bg-white p-4 rounded-xl border border-emerald-300 space-y-3 mt-3">
                  <h4 className="text-xs font-bold text-slate-900 border-b pb-1">Record New Activity for {scannedResult.qr_code}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Activity Name *</label>
                      <input
                        type="text"
                        required
                        value={actName}
                        onChange={(e) => setActName(e.target.value)}
                        placeholder="e.g. Weeding, Inspection, Maintenance"
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Assigned Worker *</label>
                      <select
                        value={actWorkerId}
                        onChange={(e) => setActWorkerId(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                      >
                        {workers.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.full_name} ({w.position})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">Activity Details / Notes</label>
                    <textarea
                      rows={2}
                      value={actDesc}
                      onChange={(e) => setActDesc(e.target.value)}
                      placeholder="Optional notes regarding tools used or observations..."
                      className="w-full text-xs p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLogActivityForm(false)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs rounded font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-700 text-white text-xs rounded font-semibold"
                    >
                      Save Activity Log
                    </button>
                  </div>
                </form>
              )}

              {showStockAdjustForm && scannedResult.record_type === 'inventory_item' && (
                <form onSubmit={handleStockAdjust} className="bg-white p-4 rounded-xl border border-amber-300 space-y-3 mt-3">
                  <h4 className="text-xs font-bold text-slate-900 border-b pb-1">Adjust Inventory Stock Level</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">Action</label>
                      <select
                        value={stockAction}
                        onChange={(e) => setStockAction(e.target.value as any)}
                        className="w-full text-xs p-2 border border-slate-300 rounded"
                      >
                        <option value="deduct">Deduct / Use Stock (-)</option>
                        <option value="add">Restock / Add (+)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-700 mb-1">
                        Quantity ({(scannedResult.record_data as any).unit})
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={stockDelta}
                        onChange={(e) => setStockDelta(Number(e.target.value))}
                        className="w-full text-xs p-2 border border-slate-300 rounded"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs rounded transition"
                      >
                        Confirm Adjustment
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
