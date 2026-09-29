import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useFarm } from '../context/FarmContext';
import { QrCode, Printer, Download, CheckSquare, Square, Filter, RefreshCw, Scissors } from 'lucide-react';

interface BadgeItem {
  id: string;
  code: string;
  qr_code: string;
  title: string;
  subtitle: string;
  category: string;
  dataUrl?: string;
  type: 'plot' | 'resource' | 'inventory' | 'worker';
}

export const QRCodeStudio: React.FC = () => {
  const { plots, resources, inventory, workers } = useFarm();

  const [activeTabType, setActiveTabType] = useState<string>('all');
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [badgeItems, setBadgeItems] = useState<BadgeItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Build unified items array
  useEffect(() => {
    const list: BadgeItem[] = [];

    plots.forEach((p) => {
      list.push({
        id: `plot-${p.id}`,
        code: p.plot_code,
        qr_code: p.qr_code,
        title: p.plot_name,
        subtitle: `${p.crop_type} (${p.size} ha)`,
        category: 'Farm Plot',
        type: 'plot',
      });
    });

    resources.forEach((r) => {
      list.push({
        id: `res-${r.id}`,
        code: r.resource_code,
        qr_code: r.qr_code,
        title: r.name,
        subtitle: `${r.category} · ${r.location}`,
        category: 'Farm Resource',
        type: 'resource',
      });
    });

    inventory.forEach((i) => {
      list.push({
        id: `inv-${i.id}`,
        code: i.item_code,
        qr_code: i.qr_code,
        title: i.item_name,
        subtitle: `Stock: ${i.quantity} ${i.unit}`,
        category: 'Farm Input',
        type: 'inventory',
      });
    });

    workers.forEach((w) => {
      list.push({
        id: `wrk-${w.id}`,
        code: w.worker_code,
        qr_code: w.qr_code,
        title: w.full_name,
        subtitle: w.position,
        category: 'Worker ID',
        type: 'worker',
      });
    });

    // Generate Data URLs for QR images
    const generateAll = async () => {
      setIsGenerating(true);
      const withQr = await Promise.all(
        list.map(async (item) => {
          try {
            const dataUrl = await QRCode.toDataURL(item.qr_code, {
              width: 250,
              margin: 1,
              color: { dark: '#064e3b', light: '#ffffff' },
            });
            return { ...item, dataUrl };
          } catch {
            return item;
          }
        })
      );
      setBadgeItems(withQr);
      setIsGenerating(false);

      // Select all by default
      setSelectedCodes(new Set(withQr.map((i) => i.qr_code)));
    };

    generateAll();
  }, [plots, resources, inventory, workers]);

  const filteredBadges = badgeItems.filter(
    (b) => activeTabType === 'all' || b.type === activeTabType
  );

  const toggleSelect = (qrCode: string) => {
    const next = new Set(selectedCodes);
    if (next.has(qrCode)) next.delete(qrCode);
    else next.add(qrCode);
    setSelectedCodes(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedCodes);
    filteredBadges.forEach((b) => next.add(b.qr_code));
    setSelectedCodes(next);
  };

  const deselectAllFiltered = () => {
    const next = new Set(selectedCodes);
    filteredBadges.forEach((b) => next.delete(b.qr_code));
    setSelectedCodes(next);
  };

  const handlePrintBatch = () => {
    const selectedList = badgeItems.filter((b) => selectedCodes.has(b.qr_code));
    if (selectedList.length === 0) {
      alert('Please select at least one QR badge card to print.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const cardsHtml = selectedList
      .map(
        (item) => `
        <div class="badge-card">
          <div class="header">
            <p class="org">U & E GRACE FOUNDATION FARM</p>
            <p class="loc">IKOT EKPENE, AKWA IBOM STATE</p>
          </div>
          <div class="category">${item.category.toUpperCase()}</div>
          <h3 class="title">${item.title}</h3>
          <p class="subtitle">${item.subtitle}</p>
          <div class="qr-box">
            <img src="${item.dataUrl}" />
          </div>
          <div class="code-id">${item.qr_code}</div>
          <p class="cut-hint">✂ Cut along outer border for stake/badge attachment</p>
        </div>
      `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>U & E Grace Foundation Farm - Print QR Badges</title>
          <style>
            @media print {
              body { margin: 0; padding: 10px; font-family: system-ui, -apple-system, sans-serif; }
              .no-print { display: none; }
            }
            body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; padding: 20px; }
            .grid { display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
            .badge-card {
              width: 240px;
              border: 2px dashed #064e3b;
              border-radius: 12px;
              padding: 12px;
              background: white;
              text-align: center;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              page-break-inside: avoid;
            }
            .header { border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px; }
            .org { font-size: 10px; font-weight: 800; color: #064e3b; letter-spacing: 0.5px; margin: 0; }
            .loc { font-size: 8px; color: #64748b; margin: 0; font-weight: 600; }
            .category { display: inline-block; background: #fef3c7; color: #78350f; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-bottom: 4px; }
            .title { font-size: 13px; font-weight: 800; color: #0f172a; margin: 4px 0 2px 0; line-height: 1.2; }
            .subtitle { font-size: 10px; color: #475569; margin: 0 0 8px 0; }
            .qr-box img { width: 150px; height: 150px; display: block; margin: 0 auto; border: 2px solid #064e3b; border-radius: 8px; padding: 4px; background: white; }
            .code-id { font-family: monospace; font-weight: 800; font-size: 14px; color: #064e3b; margin-top: 6px; }
            .cut-hint { font-size: 8px; color: #94a3b8; margin-top: 6px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom:20px; text-align:center;">
            <button onclick="window.print()" style="background:#064e3b; color:white; border:none; padding:10px 20px; font-weight:bold; border-radius:8px; cursor:pointer;">
              🖨 Click Here to Print ${selectedList.length} QR Badges
            </button>
          </div>
          <div class="grid">
            ${cardsHtml}
          </div>
          <script>
            setTimeout(() => { window.print(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl font-bold text-slate-900">QR Code Batch Print Studio</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate and print weather-proof QR badge tags for field stakes, machinery, storage bags, and personnel
          </p>
        </div>

        <button
          onClick={handlePrintBatch}
          disabled={selectedCodes.size === 0}
          className="bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-amber-300" />
          <span>Print Selected Badges ({selectedCodes.size})</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        
        {/* Type Filter */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'plot', label: 'Farm Plots' },
            { id: 'resource', label: 'Resources' },
            { id: 'inventory', label: 'Inputs' },
            { id: 'worker', label: 'Workers' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTabType(t.id)}
              className={`px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTabType === t.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Selection Shortcuts */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={selectAllFiltered}
            className="text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Select All</span>
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={deselectAllFiltered}
            className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Deselect</span>
          </button>
        </div>
      </div>

      {/* Badge Grid View */}
      {isGenerating ? (
        <div className="p-12 text-center text-slate-500 font-medium text-sm">
          Generating QR vector codes...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBadges.map((badge) => {
            const isSelected = selectedCodes.has(badge.qr_code);

            return (
              <div
                key={badge.id}
                onClick={() => toggleSelect(badge.qr_code)}
                className={`bg-white rounded-2xl border-2 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                    : 'border-dashed border-slate-300 hover:border-slate-400'
                }`}
              >
                {/* Selection Checkbox Pill */}
                <div className="absolute top-3 right-3 z-10">
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600 bg-white rounded" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                  )}
                </div>

                {/* Badge Card Container Mock */}
                <div className="text-center space-y-2">
                  <div className="border-b border-slate-100 pb-1 text-[10px] font-extrabold text-emerald-900 uppercase tracking-wider">
                    U & E Grace Foundation Farm
                  </div>

                  <span className="inline-block text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                    {badge.category}
                  </span>

                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {badge.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">{badge.subtitle}</p>

                  <div className="p-2 bg-white border-2 border-emerald-800 rounded-xl inline-block my-1 shadow-inner">
                    {badge.dataUrl ? (
                      <img src={badge.dataUrl} alt={badge.qr_code} className="w-32 h-32 mx-auto" />
                    ) : (
                      <div className="w-32 h-32 bg-slate-100 animate-pulse"></div>
                    )}
                  </div>

                  <div className="font-mono font-extrabold text-sm text-emerald-950">
                    {badge.qr_code}
                  </div>

                  <div className="pt-1 text-[9px] text-slate-400 flex items-center justify-center gap-1 italic border-t border-slate-100">
                    <Scissors className="w-3 h-3" />
                    <span>Cut outline for field attachment</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
