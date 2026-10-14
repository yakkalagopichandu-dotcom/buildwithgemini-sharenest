import React, { useState, useEffect } from 'react';
import { fetchAdminQueue } from '../services/api';
import { CareHome } from '../types';
import { Language } from '../i18n/translations';
import { 
  Building2, 
  MapPin, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

interface AdminQueueProps {
  lang: Language;
  t: any;
  onBackToDashboard?: () => void;
}

export const AdminQueue: React.FC<AdminQueueProps> = ({ 
  lang, 
  t,
  onBackToDashboard 
}) => {
  const [homes, setHomes] = useState<CareHome[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminQueue();
      // Enforce strictly VERIFIED homes
      setHomes(data.filter((h: any) => h.status === 'VERIFIED'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Control Bar with Back & Refresh */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.backButton}</span>
        </button>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.refreshButton}</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t.adminTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t.adminSubtitle}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full w-fit">
            {homes.length} {t.verifiedCount}
          </span>
        </div>

        {homes.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold">Loading official verified institutions directory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {homes.map((h) => (
              <div
                key={h.id}
                className="rounded-2xl border border-slate-200/90 p-5 bg-white shadow-card hover:shadow-premium transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {h.id}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> VERIFIED
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 mb-2">{h.name}</h3>

                  <div className="text-xs text-slate-600 space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{h.address}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{h.beneficiary_count} resident beneficiaries</span>
                    </div>

                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Receiving Window:</span> {h.delivery_window}
                    </div>
                  </div>

                  {h.food_safety_license_no && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-700 flex items-center justify-between">
                      <span className="text-slate-500 font-medium">FSSAI License:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {h.food_safety_license_no}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Certified Cold Storage & Meal Logistics Ready</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
