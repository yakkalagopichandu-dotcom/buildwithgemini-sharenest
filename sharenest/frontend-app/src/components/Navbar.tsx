import React from 'react';
import { BrandLogo } from './BrandLogo';
import { Language } from '../i18n/translations';
import { ShieldCheck, HeartHandshake, UserPlus, SearchCheck } from 'lucide-react';

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: any;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  lang,
  setLang,
  t,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => setCurrentPage('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <BrandLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl sm:text-2xl text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                Share<span className="text-emerald-700">Nest</span>
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                India
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 hidden sm:block">{t.tagline}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all ${
              currentPage === 'dashboard'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            {t.navDashboard}
          </button>

          <button
            onClick={() => setCurrentPage('donate')}
            className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              currentPage === 'donate'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-amber-500" />
            <span>{t.navDonate}</span>
          </button>

          {/* New Integrated Registration Feature */}
          <button
            onClick={() => setCurrentPage('register')}
            className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              currentPage === 'register'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>{t.navRegister}</span>
          </button>

          <button
            onClick={() => setCurrentPage('track-status')}
            className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              currentPage === 'track-status'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <SearchCheck className="w-4 h-4 text-indigo-500" />
            <span className="hidden md:inline">{t.navTrackStatus}</span>
          </button>

          <button
            onClick={() => setCurrentPage('admin')}
            className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              currentPage === 'admin'
                ? 'bg-emerald-700 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">{t.navAdminQueue}</span>
          </button>
        </nav>

        {/* Global Language Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              lang === 'en'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('te')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              lang === 'te'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            తెలుగు
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
              lang === 'hi'
                ? 'bg-white text-emerald-900 shadow-xs border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>
    </header>
  );
};
