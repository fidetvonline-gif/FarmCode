import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import { DEMO_LOGIN_CREDENTIALS } from '../data/seedData';
import {
  Lock,
  Mail,
  Key,
  Shield,
  UserCheck,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import farmLogo from '../assets/images/farm_logo_badge_1790713219043.jpg';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    currentUser,
    isAuthenticated,
    login,
    quickLogin,
    logout,
  } = useFarm();

  const [emailInput, setEmailInput] = useState('admin@uefarm.ng');
  const [passwordInput, setPasswordInput] = useState('adminpassword123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoginModalOpen && isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const res = await login(emailInput, passwordInput);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setIsLoginModalOpen(false);
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSelectDemoUser = (email: string, pass: string) => {
    setEmailInput(email);
    setPasswordInput(pass);
    setErrorMsg(null);
  };

  const handle1ClickLogin = (email: string) => {
    quickLogin(email);
    setSuccessMsg('Logged in successfully!');
    setTimeout(() => {
      setIsLoginModalOpen(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white flex items-center justify-between border-b border-emerald-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-600/80 bg-emerald-800 shrink-0 shadow-md">
              <img
                src={farmLogo}
                alt="U & E Grace Foundation Farm Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                  Farm System Authentication
                </h2>
              </div>
              <p className="text-xs text-emerald-300 font-medium">
                U & E Grace Foundation Farm, Ikot Ekpene · Digital Portal Login
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-800/80 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          
          {/* Active Session Notice if authenticated */}
          {isAuthenticated && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs text-emerald-900">
                  Currently active as <strong>{currentUser.name}</strong> ({currentUser.role.replace('_', ' ')})
                </span>
              </div>
              <button
                onClick={logout}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                Log Out
              </button>
            </div>
          )}

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Preset Demo Login Credentials Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Demo Login Accounts & Credentials</span>
              </h3>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                1-Click Sign In
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DEMO_LOGIN_CREDENTIALS.map((cred) => {
                const isCurrent = currentUser.email.toLowerCase() === cred.email.toLowerCase() && isAuthenticated;
                return (
                  <div
                    key={cred.email}
                    className={`p-3.5 rounded-2xl border transition relative flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cred.badgeColor}`}>
                          {cred.role === 'administrator' ? 'Administrator' : 'Farm Worker'}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-slate-900 text-xs">{cred.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">{cred.position}</div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 space-y-1 text-[11px] font-mono text-slate-600">
                        <div className="truncate">
                          <span className="text-slate-400 select-none">Email: </span>
                          <strong className="text-slate-800">{cred.email}</strong>
                        </div>
                        <div className="truncate">
                          <span className="text-slate-400 select-none">Pass: </span>
                          <strong className="text-slate-800">{cred.password}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handle1ClickLogin(cred.email)}
                        className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sign In</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectDemoUser(cred.email, cred.password)}
                        className="px-2 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                        title="Fill into form"
                      >
                        Fill
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standard Login Form */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Or Enter Account Credentials</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="e.g. admin@uefarm.ng"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isLoading ? 'Verifying...' : 'Authenticate & Enter Dashboard'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Security & Role-Based Access Control (RBAC)</span>
          <span className="font-semibold text-emerald-800">U & E Grace Farm Portal</span>
        </div>

      </div>
    </div>
  );
};
