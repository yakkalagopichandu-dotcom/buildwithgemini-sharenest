import React, { useState, useEffect } from 'react';
import { fetchCareHomeStatus } from '../services/api';
import { Language } from '../i18n/translations';
import { 
  Building2, 
  SearchCheck, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Users, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';

interface TrackStatusProps {
  initialId?: string;
  lang: Language;
  t: any;
  onBackToDashboard?: () => void;
}

export const TrackStatus: React.FC<TrackStatusProps> = ({ 
  initialId = '', 
  lang, 
  t,
  onBackToDashboard 
}) => {
  const [homeId, setHomeId] = useState(initialId || 'carehome-001');
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (idToSearch?: string) => {
    const target = idToSearch || homeId;
    if (!target.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchCareHomeStatus(target.trim());
      setRecord(data);
    } catch (e: any) {
      setError(e.response?.data?.detail || "No care home found with this ID.");
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setHomeId(initialId);
      handleLookup(initialId);
    } else {
      handleLookup('carehome-001');
    }
  }, [initialId]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fadeIn">
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
          onClick={() => handleLookup()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.refreshButton}</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60">
            <SearchCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.trackTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {t.trackSubtitle}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <input
            type="text"
            value={homeId}
            onChange={(e) => setHomeId(e.target.value)}
            placeholder={t.trackInputPlaceholder}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
          />
          <button
            onClick={() => handleLookup()}
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3 rounded-2xl text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <SearchCheck className="w-4 h-4" />
            <span>{loading ? "Searching..." : t.lookupButton}</span>
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Lookup Result View */}
      {record && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card space-y-6 animate-slideUp">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-3">
            <div>
              <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                {record.id}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {record.name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{record.address}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{record.beneficiary_count} residents</span>
                </span>
              </div>
            </div>

            <div className="self-start sm:self-auto">
              <span
                className={`text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow-2xs ${
                  record.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {record.status === 'VERIFIED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Clock className="w-4 h-4 text-amber-600" />
                )}
                <span>{record.status}</span>
              </span>
            </div>
          </div>

          {/* Verification Timeline Progress Tracker */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
              Institutional Verification Pipeline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">1. Details Registered</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Onboarding form & storage requirements submitted.
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                record.status === 'VERIFIED' 
                  ? 'bg-emerald-50/60 border-emerald-200/80' 
                  : 'bg-amber-50/60 border-amber-200/80'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {record.status === 'VERIFIED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  )}
                  <span className="text-xs font-bold text-slate-900">2. FSSAI & Document Audit</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {record.status === 'VERIFIED'
                    ? "Documents & 12A/80G status verified."
                    : "Verification review under active review by food safety team."}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${
                record.status === 'VERIFIED'
                  ? 'bg-emerald-50/60 border-emerald-200/80'
                  : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {record.status === 'VERIFIED' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-bold text-slate-900">3. Rescue Clearance</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {record.status === 'VERIFIED'
                    ? "Care home fully authorized to accept surplus listings."
                    : "Final activation upon verification completion."}
                </p>
              </div>
            </div>
          </div>

          {/* Details Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Contact Officer</span>
              <p className="font-bold text-slate-800">{record.contact_person}</p>
              <p className="text-slate-500">Window: {record.delivery_window}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Food Safety Record</span>
              <p className="font-bold text-slate-800 font-mono">
                {record.food_safety_license_no || "FSSAI Under Active Review"}
              </p>
              <p className="text-emerald-700 font-semibold">Cold Chain Storage Verified</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
