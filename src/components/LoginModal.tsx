import React, { useState } from 'react';
import { X, User, Mail, ShieldCheck, CheckCircle2, LogOut, Sparkles } from 'lucide-react';
import { UserProfile, IndianLanguage } from '../types';
import { getTranslations } from '../services/weatherTranslations';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  currentLanguage: IndianLanguage;
  savedThreadsCount: number;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  currentLanguage,
  savedThreadsCount
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const t = getTranslations(currentLanguage.code);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onLogin({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      savedAt: new Date().toISOString()
    });
    onClose();
  };

  const handleQuickDemoLogin = (demoName: string, demoEmail: string) => {
    onLogin({
      name: demoName,
      email: demoEmail,
      savedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                {currentUser ? t.actions.myAccount : t.auth.title}
              </h2>
              <p className="text-xs text-slate-500">
                {currentUser ? t.auth.statusLoggedIn : t.auth.statusGuest}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentUser ? (
            /* Logged in state view */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate">{currentUser.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-600 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    {t.auth.statusLoggedIn}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="flex items-center justify-between font-medium">
                  <span>{t.actions.recentChats}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-slate-900">
                    {savedThreadsCount}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {t.auth.permanentNote}
                </p>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.actions.logout}</span>
              </button>
            </div>
          ) : (
            /* Login Form view */
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 text-sky-800 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-semibold">{t.auth.temporaryNotice}</p>
                  <p className="text-sky-700 text-[11px] mt-0.5">{t.auth.optionalNotice}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.auth.nameLabel}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Ayush"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.auth.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. ayush@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-sm"
                >
                  {t.auth.signInBtn}
                </button>
              </form>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider absolute">
                  or quick sign in
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('Ayush', 'isamaliyaayush@gmail.com')}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ayush (User)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('Farmer Rajesh', 'rajesh.farmer@agri.in')}
                  className="py-2 px-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kisan / Fisher</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
