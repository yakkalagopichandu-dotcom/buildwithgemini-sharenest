import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { DonatePage } from './pages/DonatePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { TrackStatus } from './pages/TrackStatus';
import { AdminQueue } from './pages/AdminQueue';
import { FloatingChat } from './components/ChatBot/FloatingChat';
import { Language, translations } from './i18n/translations';
import { ShieldCheck, Globe2 } from 'lucide-react';

export function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [lang, setLang] = useState<Language>('en');
  const [trackInitialId, setTrackInitialId] = useState('');

  const t = translations[lang];

  const handleNavigateToTrack = (id: string) => {
    setTrackInitialId(id);
    setCurrentPage('track-status');
  };

  const handleNavigateToDonate = () => {
    setCurrentPage('donate');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        lang={lang}
        setLang={setLang}
        t={t}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentPage === 'dashboard' && (
          <Dashboard
            lang={lang}
            t={t}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'donate' && (
          <DonatePage
            lang={lang}
            t={t}
            onSuccessNavigate={() => setCurrentPage('dashboard')}
            onBackToDashboard={handleBackToDashboard}
          />
        )}

        {currentPage === 'register' && (
          <RegistrationPage
            lang={lang}
            t={t}
            onNavigateToTrack={handleNavigateToTrack}
            onNavigateToDonate={handleNavigateToDonate}
            onBackToDashboard={handleBackToDashboard}
          />
        )}

        {currentPage === 'track-status' && (
          <TrackStatus
            initialId={trackInitialId}
            lang={lang}
            t={t}
            onBackToDashboard={handleBackToDashboard}
          />
        )}

        {currentPage === 'admin' && (
          <AdminQueue
            lang={lang}
            t={t}
            onBackToDashboard={handleBackToDashboard}
          />
        )}
      </main>

      {/* Persistent Multilingual Agentic AI Floating Assistant */}
      <FloatingChat lang={lang} t={t} />

      {/* Professional Footer */}
      <footer className="border-t border-slate-200/90 bg-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{t.appName}</span>
            <span>—</span>
            <span>{t.tagline}</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>FSSAI Compliant Food Safety Protocol</span>
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Available in English, Telugu & Hindi</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
