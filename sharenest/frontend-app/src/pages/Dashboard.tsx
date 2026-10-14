import React, { useState, useEffect } from 'react';
import { fetchDashboardMetrics, fetchCategories, fetchDonations, claimDonation, inspectDonation } from '../services/api';
import { ImpactCounters } from '../components/ImpactCounters';
import { CategoryGrid } from '../components/CategoryGrid';
import { Mascot } from '../components/Mascot';
import { Donation } from '../types';
import { Language } from '../i18n/translations';
import { 
  HeartHandshake, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Camera, 
  X, 
  Sparkles,
  ArrowRight,
  UserCheck,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';

interface DashboardProps {
  lang: Language;
  t: any;
  setCurrentPage: (page: string) => void;
}

// Fallback images tailored to category if a donation has no before photo
const categoryImageMap: Record<string, string> = {
  Food: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
  Clothes: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
  Toys: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80',
  Essentials: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80',
};

export const Dashboard: React.FC<DashboardProps> = ({ lang, t, setCurrentPage }) => {
  const [metrics, setMetrics] = useState({
    total_donations: 10,
    meals_served: 240,
    co2_saved_kg: 508.4,
    verified_care_homes: 8,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Inspection modal state
  const [inspectModalDonation, setInspectModalDonation] = useState<Donation | null>(null);
  const [inspectionPhotoUrl, setInspectionPhotoUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
  const [inspectionNotes, setInspectionNotes] = useState('Food verified fresh, seals intact, hygienic handling confirmed.');
  const [inspecting, setInspecting] = useState(false);
  const [uploadingInspectionPhoto, setUploadingInspectionPhoto] = useState(false);

  const handleInspectionPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingInspectionPhoto(true);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setInspectionPhotoUrl(result);
        }
        setUploadingInspectionPhoto(false);
      };
      reader.onerror = () => {
        setUploadingInspectionPhoto(false);
        alert("Failed to read image file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const loadData = async () => {
    try {
      const [m, c, d] = await Promise.all([
        fetchDashboardMetrics(),
        fetchCategories(),
        fetchDonations(selectedCategory || undefined),
      ]);
      setMetrics(m);
      setCategories(c);
      setDonations(d);
    } catch (e) {
      console.error('Error loading dashboard data', e);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const handleClaim = async (donationId: string) => {
    setLoading(true);
    try {
      await claimDonation(donationId);
      await loadData();
      alert("Donation marked as in transit! You can now perform the arrival inspection.");
    } catch (e: any) {
      alert("Error claiming: " + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeInspect = async (action: 'ACCEPT' | 'REJECT') => {
    if (!inspectModalDonation) return;
    if (!inspectionPhotoUrl) {
      alert("Please capture or upload an inspection photo before proceeding.");
      return;
    }
    if (!inspectionNotes.trim()) {
      alert("Please provide inspection notes and quality comments.");
      return;
    }
    setInspecting(true);
    try {
      await inspectDonation({
        donation_id: inspectModalDonation.id,
        inspection_photos: [inspectionPhotoUrl],
        notes: inspectionNotes.trim(),
        action,
      });
      setInspectModalDonation(null);
      await loadData();
      alert(`Donation successfully ${action === 'ACCEPT' ? 'verified & accepted' : 'declined'}!`);
    } catch (e: any) {
      alert("Error finalizing inspection: " + (e.response?.data?.detail || e.message));
    } finally {
      setInspecting(false);
    }
  };

  const getDonationImage = (d: Donation) => {
    if (d.photos?.before && d.photos.before.length > 0 && d.photos.before[0]) {
      return d.photos.before[0];
    }
    if (d.photos?.after && d.photos.after.length > 0 && d.photos.after[0]) {
      return d.photos.after[0];
    }
    return categoryImageMap[d.category] || categoryImageMap.Food;
  };

  return (
    <div className="space-y-10 pb-16">
      {/* First Original Hero Banner Design */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-800 via-emerald-700 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          {/* Active Community Food Rescue Badge (High Contrast White Pill) */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold mb-3 border border-white/30 text-white shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
            <span>{t.heroBadge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {t.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-teal-100 mb-6 leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentPage('donate')}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-6 py-3 rounded-full text-xs sm:text-sm shadow-md transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-amber-950" />
              <span>{t.navDonate}</span>
            </button>

            <button
              onClick={() => setCurrentPage('register')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white font-semibold px-5 py-3 rounded-full text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <span>{t.navRegister}</span>
              <ArrowRight className="w-4 h-4 text-teal-200" />
            </button>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-full text-xs flex items-center gap-2 text-teal-100">
              <UserCheck className="w-4 h-4 text-emerald-300" />
              <span>Verified Care Homes Only</span>
            </div>
          </div>
        </div>

        {/* Mascot & Graphic Accents */}
        <div className="absolute -bottom-6 -right-6 opacity-35 sm:opacity-90 pointer-events-none">
          <Mascot size="lg" />
        </div>
      </div>

      {/* Live Impact Counters */}
      <ImpactCounters metrics={metrics} t={t} />

      {/* Category Grid (Unique per-category selection) */}
      <CategoryGrid
        categories={categories}
        onSelectCategory={setSelectedCategory}
        selectedCategory={selectedCategory}
        lang={lang}
        t={t}
      />

      {/* Available Donations Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 mb-6 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.availableDonationsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {selectedCategory 
                ? `Filtered by: ${selectedCategory}` 
                : t.availableDonationsSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-full font-bold transition-colors"
              >
                Clear Filter
              </button>
            )}
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
              {donations.length} {t.activeListingsCount}
            </span>
          </div>
        </div>

        {donations.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <HeartHandshake className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-sm font-semibold">No active listings in this category right now.</p>
            <p className="text-xs text-slate-400 mt-1">Try clicking "Clear Filter" to view all available listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {donations.map((d) => {
              const isClaimed = d.status === 'claimed' || d.status === 'in_transit';
              const isCompleted = d.status === 'completed';
              const itemImage = getDonationImage(d);

              return (
                <div
                  key={d.id}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-card hover:shadow-premium transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    {/* Unique Direct Item Image Frame */}
                    <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={itemImage}
                        alt={d.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = categoryImageMap[d.category] || categoryImageMap.Food;
                        }}
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {d.category}
                        </span>
                        {d.urgency === 'urgent' && (
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            URGENT
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 right-2.5">
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isClaimed
                              ? 'bg-amber-500 text-white'
                              : 'bg-teal-700 text-white'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-2.5">
                      <h3 className="font-bold text-base text-slate-900 line-clamp-1">{d.title}</h3>

                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-700">{t.qtyLabel}</span>
                          <span className="text-slate-900 font-semibold">{d.quantity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{d.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{d.pickup_window}</span>
                        </div>
                      </div>

                      {d.notes && (
                        <p className="text-[11px] bg-slate-50 p-2 rounded-xl text-slate-600 italic line-clamp-2">
                          "{d.notes}"
                        </p>
                      )}

                      {/* 6-Digit Handover Code */}
                      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-emerald-900 font-medium">
                          {t.handoverCodeLabel}:
                        </span>
                        <span className="font-mono font-bold tracking-widest text-emerald-800 text-sm bg-white px-2 py-0.5 rounded border border-emerald-200">
                          {d.handover_code || '382910'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 pt-0">
                    {isCompleted ? (
                      <div className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{t.completedBadge}</span>
                      </div>
                    ) : isClaimed ? (
                      <button
                        onClick={() => {
                          setInspectionPhotoUrl(itemImage);
                          setInspectModalDonation(d);
                        }}
                        className="w-full bg-teal-700 hover:bg-teal-800 text-white py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Camera className="w-4 h-4 text-teal-200" />
                        <span>{t.inspectAcceptButton}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClaim(d.id)}
                        disabled={loading}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-2.5 rounded-xl text-xs font-black tracking-wide shadow-xs transition-colors"
                      >
                        {t.acceptButton}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mandatory Inspection Modal with DIRECT IMAGE ONLY */}
      {inspectModalDonation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 animate-slideUp">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">{t.inspectionModalTitle}</h3>
              </div>
              <button
                onClick={() => setInspectModalDonation(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">{t.inspectionModalSubtitle}</p>

            {/* Direct Image Preview with Camera / Upload Actions */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {t.photoProofLabel}
                </label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Picture</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleInspectionPhotoUpload}
                      className="hidden"
                    />
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInspectionPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
                <img
                  src={inspectionPhotoUrl}
                  alt="Physical Inspection Direct Proof"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-xs">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" /> Direct Physical Inspection Photo Proof
                </span>
                {uploadingInspectionPhoto && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                    Loading Image...
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Care homes must capture or upload an authentic photo of the received items to verify food freshness, packaging integrity, and FSSAI standards.
              </p>
            </div>

            <div className="mb-6 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                {t.inspectionNotesLabel} & Inspector Comments *
              </label>
              <textarea
                rows={3}
                required
                value={inspectionNotes}
                onChange={(e) => setInspectionNotes(e.target.value)}
                placeholder="Enter quality observations, temperature check, freshness, packaging condition, or reasons..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleFinalizeInspect('REJECT')}
                disabled={inspecting}
                className="flex-1 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                {t.rejectDonation}
              </button>
              <button
                onClick={() => handleFinalizeInspect('ACCEPT')}
                disabled={inspecting}
                className="flex-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs"
              >
                {inspecting ? "Processing..." : t.finalizeAccept}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
