import React, { useState } from 'react';
import { saveCareHome } from '../services/api';
import { Mascot } from '../components/Mascot';
import { 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  Save, 
  UploadCloud, 
  Scan, 
  Sparkles, 
  Image as ImageIcon,
  Check,
  SearchCheck
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface CareHomeOnboardProps {
  lang: Language;
  t: any;
  onNavigateToTrack: (id: string) => void;
}

export const CareHomeOnboard: React.FC<CareHomeOnboardProps> = ({ lang, t, onNavigateToTrack }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [shelterType, setShelterType] = useState('orphanage');
  const [beneficiaryCount, setBeneficiaryCount] = useState<number | ''>('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState('');
  
  // Storage checklist
  const [storage, setStorage] = useState({
    fridge: false,
    freezer: false,
    dry_storage: false,
    kitchen: false,
    power_backup: false,
  });

  // Food safety & documents
  const [fssai, setFssai] = useState('');
  const [docs, setDocs] = useState<Record<string, { fileName: string; url: string; scanned?: boolean }>>({});
  const [scanningKey, setScanningKey] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [loading, setLoading] = useState(false);

  // File upload simulation / link input
  const handleFileUpload = (docKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocs((prev) => ({
        ...prev,
        [docKey]: {
          fileName: file.name,
          url: URL.createObjectURL(file),
          scanned: false,
        },
      }));
    }
  };

  // Instant Scanning Simulation for quick document verification
  const handleScanDocument = (docKey: string, defaultName: string) => {
    setScanningKey(docKey);
    setTimeout(() => {
      setDocs((prev) => ({
        ...prev,
        [docKey]: {
          fileName: `Scanned_${defaultName.replace(/\s+/g, '_')}_Verified.pdf`,
          url: 'https://storage.googleapis.com/demo/scanned_doc.pdf',
          scanned: true,
        },
      }));
      setScanningKey(null);
    }, 1200);
  };

  const handleFacilityPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoUrl(URL.createObjectURL(file));
    }
  };

  const fillSampleData = () => {
    setName('Anbu Seva Orphanage & Senior Center');
    setShelterType('orphanage');
    setBeneficiaryCount(45);
    setPhotoUrl('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80');
    setAddress('Road No. 12, Banjara Hills, Hyderabad, Telangana');
    setContactPerson('Sister Mary Thomas');
    setContactPhone('+91 98490 11223');
    setDeliveryWindow('Daily 11:00 AM - 7:00 PM');
    setStorage({
      fridge: true,
      freezer: false,
      dry_storage: true,
      kitchen: true,
      power_backup: true,
    });
    setFssai('FSSAI-120240019283');
    setDocs({
      registration_cert: { fileName: '12A_80G_Registration_Certificate.pdf', url: '#', scanned: true },
      govt_sanction_order: { fileName: 'State_Social_Welfare_Sanction.pdf', url: '#', scanned: true },
      utility_bill: { fileName: 'Electricity_Utility_Verification_Bill.pdf', url: '#', scanned: false },
      manager_id: { fileName: 'Trustee_Aadhaar_Verification.pdf', url: '#', scanned: false },
      auth_letter: { fileName: 'Board_Authorization_Letter.pdf', url: '#', scanned: false },
    });
  };

  const handleSave = async (submitNow: boolean) => {
    if (!name.trim()) {
      alert("Please enter the Care Home Name.");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const serializableDocs: Record<string, string> = {};
      Object.entries(docs).forEach(([k, v]) => {
        serializableDocs[k] = v.url || v.fileName;
      });

      const payload = {
        name,
        shelter_type: shelterType,
        beneficiary_count: Number(beneficiaryCount) || 10,
        storage_facilities: storage,
        food_safety_license_no: fssai,
        documents: serializableDocs,
        facility_photo: photoUrl,
        address: address || 'Hyderabad, Telangana',
        contact_person: contactPerson || 'In-charge Manager',
        contact_phone: contactPhone || '+91 90000 00000',
        delivery_window: deliveryWindow || '10:00 AM - 6:00 PM',
        status: submitNow ? 'SUBMITTED' : 'DRAFT',
      };
      const res = await saveCareHome(payload);
      const generatedId = res.care_home?.id || 'carehome-demo';
      setSubmittedId(generatedId);

      if (submitNow) {
        setSubmitted(true);
      } else {
        alert(`${t.draftMsg} Application ID: ${generatedId}`);
      }
    } catch (e: any) {
      alert("Error saving: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-emerald-100 rounded-3xl p-8 shadow-sm text-center animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{t.submittedTitle}</h2>
        <p className="text-sm text-slate-600 mb-4">{t.submittedMessage}</p>

        {/* Unique Tracking Reference */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 mb-6 text-center">
          <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold block mb-1">
            Registered Care Home Application ID
          </span>
          <span className="text-2xl font-mono font-black text-emerald-950 tracking-wider bg-white px-4 py-1.5 rounded-xl border border-emerald-200 inline-block shadow-2xs">
            {submittedId}
          </span>
          <p className="text-[11px] text-emerald-800/80 mt-2">
            Use this unique ID anytime to check the verification stage of your shelter.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigateToTrack(submittedId)}
            className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <SearchCheck className="w-4 h-4" />
            <span>{t.checkStatusCta}</span>
          </button>

          <button
            onClick={() => {
              setSubmitted(false);
              setStep(1);
            }}
            className="w-full sm:w-auto border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold px-5 py-3 rounded-full transition-colors"
          >
            Register Another Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <Mascot size="sm" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.onboardTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.onboardSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fillSampleData}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.sampleButton}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="text-xs text-emerald-800 border border-emerald-300 hover:bg-emerald-50 px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> {t.saveDraft}
          </button>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { label: t.step1Tab, num: 1 },
          { label: t.step2Tab, num: 2 },
          { label: t.step3Tab, num: 3 },
          { label: t.step4Tab, num: 4 },
        ].map(({ label, num }) => (
          <div
            key={num}
            onClick={() => setStep(num)}
            className={`p-2.5 rounded-2xl text-center cursor-pointer transition-all ${
              step === num
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs border border-slate-200/80'
            }`}
          >
            <span className="text-[10px] block opacity-80">Step {num}</span>
            <span className="text-xs truncate block">{label}</span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.careHomeName}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Karuna Seva Children Home, Sneha Old Age Care"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  {t.shelterType}
                </label>
                <select
                  value={shelterType}
                  onChange={(e) => setShelterType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="orphanage">{t.shelterOrphanage}</option>
                  <option value="old_age_home">{t.shelterSenior}</option>
                  <option value="shelter">{t.shelterCommunity}</option>
                  <option value="rehabilitation">{t.shelterRehab}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  {t.beneficiaryCount}
                </label>
                <input
                  type="number"
                  required
                  value={beneficiaryCount}
                  onChange={(e) => setBeneficiaryCount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 45"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Facility Photo Upload & Preview */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.facilityPhotoLabel}
              </label>
              <p className="text-[11px] text-slate-500 mb-3">{t.facilityPhotoHelper}</p>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <label className="bg-white border border-slate-300 hover:border-emerald-600 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 cursor-pointer shadow-2xs transition-colors flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-700" />
                  <span>{t.uploadFile}</span>
                  <input type="file" accept="image/*" onChange={handleFacilityPhotoUpload} className="hidden" />
                </label>

                <span className="text-xs text-slate-400">or enter image URL:</span>

                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/facility.jpg"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {photoUrl ? (
                <div className="mt-3 relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={photoUrl} alt="Care Home Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
                    <ImageIcon className="w-3 h-3 text-emerald-400" /> Facility Photo Ready
                  </span>
                </div>
              ) : (
                <div className="mt-3 border-2 border-dashed border-slate-200 rounded-xl h-20 flex items-center justify-center text-xs text-slate-400">
                  No facility photo selected yet.
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t.storageHeading}</h3>
              <p className="text-xs text-slate-500">{t.storageHelper}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'fridge', label: 'Commercial Refrigerator', desc: 'Capable of storing dairy & cooked food < 5°C' },
                { key: 'freezer', label: 'Deep Freezer', desc: 'For frozen ingredients and ice-cream' },
                { key: 'dry_storage', label: 'Dedicated Dry Pantry', desc: 'Shelves for rice, lentils, oils and sealed snacks' },
                { key: 'kitchen', label: 'Functional Kitchen & Staff', desc: 'Equipment to reheat and serve food immediately' },
                { key: 'power_backup', label: 'Power Backup / Generator', desc: 'Maintains cold chain during load shedding' },
              ].map(({ key, label, desc }) => (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    (storage as any)[key]
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-2xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(storage as any)[key]}
                    onChange={(e) => setStorage({ ...storage, [key]: e.target.checked })}
                    className="w-4 h-4 text-emerald-700 rounded mt-0.5 focus:ring-emerald-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{label}</span>
                    <span className="text-[11px] text-slate-500">{desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.fssaiLabel}
              </label>
              <input
                type="text"
                value={fssai}
                onChange={(e) => setFssai(e.target.value)}
                placeholder="e.g. FSSAI-120240019283"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block">
                    {t.docsHeading}
                  </span>
                  <p className="text-[11px] text-slate-500">{t.docsHelper}</p>
                </div>
              </div>

              {[
                { key: 'registration_cert', title: '1. Society / Trust Registration Certificate (12A/80G)' },
                { key: 'govt_sanction_order', title: '2. Govt Sanction / Recognition Order' },
                { key: 'utility_bill', title: '3. Physical Address Proof (Utility / Electricity Bill)' },
                { key: 'manager_id', title: '4. Trustee / Manager Govt ID Proof' },
                { key: 'auth_letter', title: '5. Board Authorization Letter' },
              ].map(({ key, title }) => {
                const doc = docs[key];
                const isScanning = scanningKey === key;

                return (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 block">{title}</span>
                        {isScanning ? (
                          <span className="text-[11px] text-indigo-600 font-medium flex items-center gap-1 animate-pulse">
                            <Scan className="w-3 h-3" /> {t.scanningInProgress}
                          </span>
                        ) : doc ? (
                          <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            {doc.fileName} {doc.scanned && "(Direct Scanned)"}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">PDF, JPG, or PNG under 10MB</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* SCANNING FEATURE */}
                      <button
                        type="button"
                        onClick={() => handleScanDocument(key, title)}
                        disabled={isScanning}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Scan className="w-3.5 h-3.5" />
                        <span>{t.instantScanButton}</span>
                      </button>

                      {/* STANDARD UPLOAD */}
                      <label className="bg-white border border-slate-300 hover:border-emerald-600 text-slate-700 font-semibold px-3 py-1.5 rounded-xl text-xs cursor-pointer shadow-2xs transition-colors">
                        <span>{doc ? t.changeFile : t.uploadFile}</span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => handleFileUpload(key, e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.addressLabel}
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Door No, Street name, Locality, Landmark, City, Pincode"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  {t.contactPersonLabel}
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Sister Mary / S. Rao"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  {t.contactPhoneLabel}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={contactPhone}
                    onKeyDown={(e) => {
                      const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight', 'Enter'];
                      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                        return;
                      }
                      if (!/^\d$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setContactPhone(digits);
                    }}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">10-digit mobile number (digits only)</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.deliveryWindowLabel}
              </label>
              <input
                type="text"
                required
                value={deliveryWindow}
                onChange={(e) => setDeliveryWindow(e.target.value)}
                placeholder="e.g. Daily 10:00 AM - 6:00 PM, or Anytime"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex justify-between items-center mt-8 border-t border-slate-200/80 pt-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
          >
            {t.prevStepButton}
          </button>
        ) : <div />}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {t.nextStepButton} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            {loading ? "Submitting..." : t.submitForReviewButton}
          </button>
        )}
      </div>
    </div>
  );
};
