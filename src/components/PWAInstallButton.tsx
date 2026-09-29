import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check } from 'lucide-react';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'sidebar' | 'card' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as standalone PWA
  if (isInstalled) {
    if (variant === 'sidebar') {
      return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-[11px] text-emerald-300">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Installed as Web App</span>
        </div>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'sidebar') {
      return (
        <button
          onClick={install}
          className="w-full flex items-center justify-between p-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-300" />
            <span>Install PWA App</span>
          </div>
          <span className="text-[10px] bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-200">Offline</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 rounded-lg transition shadow-sm active:scale-95 cursor-pointer"
        title="Install U & E Grace Farm PWA on this device"
      >
        <Download className="w-3.5 h-3.5 text-amber-300" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'sidebar'
              ? 'w-full flex items-center gap-2 p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer'
              : 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-200 bg-emerald-800 hover:bg-emerald-700 border border-emerald-700 rounded-lg transition cursor-pointer'
          }
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-300" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Install on iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    1
                  </span>
                  <p>
                    Tap the <strong>Share</strong> button (box with an arrow pointing up) in your Safari toolbar.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    2
                  </span>
                  <p>
                    Scroll down the options list and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    3
                  </span>
                  <p>
                    Tap <strong>Add</strong> in the top right. The farm app will launch standalone without browser bars!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
