import React, { useState } from 'react';
import { createDonation } from '../services/api';
import { Language } from '../i18n/translations';
import { 
  HeartHandshake, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  UploadCloud, 
  ArrowLeft, 
  Sparkles, 
  RotateCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface DonatePageProps {
  lang: Language;
  t: any;
  onSuccessNavigate: () => void;
  onBackToDashboard?: () => void;
}

export const DonatePage: React.FC<DonatePageProps> = ({ 
  lang, 
  t, 
  onSuccessNavigate,
  onBackToDashboard
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [pickupWindow, setPickupWindow] = useState('');
  const [urgency, setUrgency] = useState('urgent');
  const [handoverMethod, setHandoverMethod] = useState('in_person');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const fillSampleDonation = () => {
    setTitle('45 Meal Trays - Veg Pulao, Paneer Curry & Rotis');
    setCategory('Food');
    setQuantity('45 Meal Trays (approx. 22 kg)');
    setLocation('Banjara Hills Road No. 10, Hyderabad');
    setPickupWindow('Today 5:00 PM - 8:30 PM');
    setUrgency('urgent');
    setHandoverMethod('in_person');
    setPhotoUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80');
    setNotes('Freshly packed surplus from wedding reception at 2 PM. Hygienically sealed in food-grade foil containers.');
  };

  const handleReset = () => {
    setTitle('');
    setCategory('Food');
    setQuantity('');
    setLocation('');
    setPickupWindow('');
    setNotes('');
    setSuccessCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !quantity.trim() || !location.trim()) {
      alert("Please fill in required fields (Title, Quantity, Location).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        quantity: quantity.trim(),
        location: location.trim(),
        pickup_window: pickupWindow.trim() || "Today, Within 3 hours",
        urgency,
        handover_method: handoverMethod,
        photos: {
          before: [photoUrl],
        },
        notes: notes.trim(),
      };

      const res = await createDonation(payload);
      setSuccessCode(res.handover_code || '482910');
    } catch (err: any) {
      alert("Error publishing donation: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (successCode) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-emerald-100 rounded-3xl p-8 shadow-card text-center animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          {t.postDonationSuccess}
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          {t.postDonationSuccessNote}
        </p>

        {/* 6-Digit Verification Code */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 mb-6 text-center">
          <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold block mb-1">
            {t.handoverCodeLabel}
          </span>
          <span className="text-3xl font-mono font-black text-emerald-950 tracking-widest bg-white px-5 py-2 rounded-xl border border-emerald-200 inline-block shadow-2xs">
            {successCode}
          </span>
          <p className="text-[11px] text-emerald-800/80 mt-2">
            Share this 6-digit PIN with the receiving care home or volunteer upon handover.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onSuccessNavigate}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-colors shadow-xs"
          >
            {t.viewInFeed}
          </button>
          <button
            onClick={handleReset}
            className="w-full sm:w-auto border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold px-5 py-3 rounded-full transition-colors"
          >
            List Another Donation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Top Control Bar with Back & Refresh */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToDashboard || onSuccessNavigate}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.backButton}</span>
        </button>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.refreshButton}</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/80 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t.donatePageTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.donatePageSubtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={fillSampleDonation}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.sampleButton}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              {t.itemTitle}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.itemTitlePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.categoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Food">{t.categoryFood}</option>
                <option value="Clothes">{t.categoryClothes}</option>
                <option value="Toys">{t.categoryToys}</option>
                <option value="Essentials">{t.categoryEssentials}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.quantityField}
              </label>
              <input
                type="text"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t.quantityPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.locationField}
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t.locationPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.pickupWindowField}
              </label>
              <input
                type="text"
                required
                value={pickupWindow}
                onChange={(e) => setPickupWindow(e.target.value)}
                placeholder={t.pickupWindowPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.urgencyField}
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="urgent">{t.urgencyUrgent}</option>
                <option value="high">{t.urgencyHigh}</option>
                <option value="medium">{t.urgencyMedium}</option>
                <option value="low">{t.urgencyLow}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.handoverMethodField}
              </label>
              <select
                value={handoverMethod}
                onChange={(e) => setHandoverMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="in_person">{t.handoverInPerson}</option>
                <option value="gate_drop">{t.handoverGateDrop}</option>
                <option value="care_home_van">{t.handoverVan}</option>
                <option value="volunteer">{t.handoverVolunteer}</option>
              </select>
            </div>
          </div>

          {/* Photo Frame & Input */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              {t.photoUrlField}
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            {photoUrl && (
              <div className="mt-3 relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img src={photoUrl} alt="Item Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              {t.notesField}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notesPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-2xl text-sm transition-colors shadow-xs mt-6 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{loading ? "Listing..." : t.postDonationButton}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
