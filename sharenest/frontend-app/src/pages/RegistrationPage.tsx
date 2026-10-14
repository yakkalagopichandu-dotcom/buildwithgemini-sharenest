import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { Mascot } from '../components/Mascot';
import { BrandLogo } from '../components/BrandLogo';
import { 
  HeartHandshake, 
  Building2, 
  CheckCircle2, 
  FileText, 
  ArrowRight, 
  UploadCloud, 
  Scan, 
  Sparkles, 
  Image as ImageIcon,
  Check,
  SearchCheck,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface RegistrationPageProps {
  lang: Language;
  t: any;
  onNavigateToTrack: (id: string) => void;
  onNavigateToDonate: () => void;
  onBackToDashboard: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ 
  lang, 
  t, 
  onNavigateToTrack,
  onNavigateToDonate,
  onBackToDashboard
}) => {
  // Step 0: Role Selection (DONOR or CARE_HOME)
  const [selectedRole, setSelectedRole] = useState<'DONOR' | 'CARE_HOME' | null>(null);

  // Common User Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  // Donor-specific fields
  const [donorType, setDonorType] = useState('INDIVIDUAL'); // INDIVIDUAL, RESTAURANT, CATERER, CORPORATE

  // Care Home specific fields (exact same features as old onboarding)
  const [careHomeStep, setCareHomeStep] = useState(1);
  const [shelterType, setShelterType] = useState('orphanage');
  const [beneficiaryCount, setBeneficiaryCount] = useState<number | ''>('');
  const [facilityPhotoUrl, setFacilityPhotoUrl] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [deliveryWindow, setDeliveryWindow] = useState('');
  
  // Storage facilities checklist
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

  // Submission state
  const [submitted, setSubmitted] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // File upload simulation
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

  // Instant Scanning Simulation
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
      setFacilityPhotoUrl(URL.createObjectURL(file));
    }
  };

  // Sample Data auto-fill
  const fillSampleDonor = () => {
    setName('Ananya Sharma (Green Caterers)');
    setEmail('ananya.sharma@greencatering.org');
    setMobile('9848033441');
    setAddress('Jubilee Hills Road No. 36, Hyderabad');
    setDonorType('CATERER');
  };

  const fillSampleCareHome = () => {
    setName('Karuna Seva Children Shelter');
    setEmail('contact@karunaseva.org');
    setMobile('9849011223');
    setAddress('Road No. 12, Banjara Hills, Hyderabad, Telangana');
    setShelterType('orphanage');
    setBeneficiaryCount(55);
    setFacilityPhotoUrl('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80');
    setContactPerson('Sister Mary Thomas');
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

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setMobile('');
    setAddress('');
    setShelterType('orphanage');
    setBeneficiaryCount('');
    setFacilityPhotoUrl('');
    setContactPerson('');
    setDeliveryWindow('');
    setFssai('');
    setDocs({});
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (!name.trim()) {
      alert(lang === 'te' ? "దయచేసి మీ పేరును నమోదు చేయండి." : lang === 'hi' ? "कृपया अपना नाम दर्ज करें।" : "Please enter your name.");
      return;
    }
    if (!cleanMobile || cleanMobile.length !== 10) {
      alert(lang === 'te' ? "దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి." : lang === 'hi' ? "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit contact mobile number.");
      return;
    }

    setLoading(true);
    try {
      const serializableDocs: Record<string, string> = {};
      Object.entries(docs).forEach(([k, v]) => {
        serializableDocs[k] = v.url || v.fileName;
      });

      const payload = {
        role: selectedRole,
        name: name.trim(),
        email: email.trim(),
        mobile: cleanMobile,
        address: address.trim() || 'Hyderabad, Telangana',
        // Care home attributes
        shelter_type: shelterType,
        beneficiary_count: Number(beneficiaryCount) || 20,
        storage_facilities: storage,
        food_safety_license_no: fssai,
        documents: serializableDocs,
        facility_photo: facilityPhotoUrl,
        contact_person: contactPerson || name.trim(),
        delivery_window: deliveryWindow || '10:00 AM - 6:00 PM',
      };

      const res = await registerUser(payload);
      setRegisteredData(res);
      setSubmitted(true);
    } catch (err: any) {
      alert("Registration error: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (submitted && registeredData) {
    const isCareHome = selectedRole === 'CARE_HOME';
    const homeId = registeredData.care_home?.id || 'carehome-demo';

    return (
      <div className="max-w-xl mx-auto bg-white border border-emerald-100 rounded-3xl p-8 shadow-card text-center animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          {isCareHome ? t.submittedTitle : t.donorRegisteredTitle}
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          {isCareHome ? t.submittedMessage : t.donorRegisteredSubtitle}
        </p>

        {isCareHome ? (
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 mb-6 text-center">
            <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold block mb-1">
              Registered Care Home Application ID
            </span>
            <span className="text-2xl font-mono font-black text-emerald-950 tracking-wider bg-white px-4 py-1.5 rounded-xl border border-emerald-200 inline-block shadow-2xs">
              {homeId}
            </span>
            <p className="text-[11px] text-emerald-800/80 mt-2">
              Keep this reference ID to track your official verification progress anytime.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 mb-6 text-center">
            <span className="text-xs uppercase tracking-wider text-amber-900 font-bold block mb-1">
              {t.donorRegisteredTitle}
            </span>
            <span className="text-xl font-bold text-amber-950 block">
              {name}
            </span>
            <p className="text-[11px] text-amber-900/80 mt-2">
              {t.donorRegisteredSubtitle}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {isCareHome ? (
            <button
              onClick={() => onNavigateToTrack(homeId)}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <SearchCheck className="w-4 h-4" />
              <span>{t.checkStatusCta}</span>
            </button>
          ) : (
            <button
              onClick={onNavigateToDonate}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <HeartHandshake className="w-4 h-4 text-amber-300" />
              <span>{t.navDonate}</span>
            </button>
          )}

          <button
            onClick={() => {
              setSubmitted(false);
              setSelectedRole(null);
              handleResetForm();
            }}
            className="w-full sm:w-auto border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold px-5 py-3 rounded-full transition-colors"
          >
            {t.registerAnotherProfile}
          </button>
        </div>
      </div>
    );
  }

  // STEP 0: CHOOSE ROLE FIRST
  if (!selectedRole) {
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
            onClick={handleResetForm}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.refreshButton}</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card text-center">
          <BrandLogo size="lg" className="mx-auto mb-3" />
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider block mb-1">
            Community Onboarding
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.registerRoleTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            {t.registerRoleSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Card 1: Donor Option */}
          <div
            onClick={() => setSelectedRole('DONOR')}
            className="bg-white border-2 border-slate-200/90 hover:border-amber-500 rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-premium transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                {t.roleDonorTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                {t.roleDonorDesc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>{t.selectRoleCta}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Care Home Option */}
          <div
            onClick={() => setSelectedRole('CARE_HOME')}
            className="bg-white border-2 border-slate-200/90 hover:border-emerald-600 rounded-3xl p-6 sm:p-7 shadow-card hover:shadow-premium transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                {t.roleCareHomeTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                {t.roleCareHomeDesc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <span>{t.selectRoleCta}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ROLE SELECTED: DONOR FORM WITH COMPREHENSIVE LOCALIZATION
  if (selectedRole === 'DONOR') {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card animate-fadeIn">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/80 mb-6 gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title={t.backButton}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t.roleDonorTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.roleDonorDesc}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillSampleDonor}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.sampleButton}</span>
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              title={t.refreshButton}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              {t.donorNameLabel}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.donorNamePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.donorTypeLabel}
              </label>
              <select
                value={donorType}
                onChange={(e) => setDonorType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="INDIVIDUAL">{t.donorTypeIndividual}</option>
                <option value="RESTAURANT">{t.donorTypeRestaurant}</option>
                <option value="CATERER">{t.donorTypeCaterer}</option>
                <option value="CORPORATE">{t.donorTypeCorporate}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.contactPhoneField}
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
                  value={mobile}
                  onKeyDown={(e) => {
                    // Allow navigation/editing keys: Backspace, Tab, Delete, Arrow keys, Enter
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
                    setMobile(digits);
                  }}
                  placeholder="9848033441"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">10-digit mobile number (digits only)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.emailField}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="donor@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                {t.defaultAddressField}
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.defaultAddressPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-2xl text-sm transition-colors text-center"
            >
              {t.backToRole}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-3 rounded-2xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{loading ? "Registering..." : t.completeRegistration}</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ROLE SELECTED: CARE HOME FORM (All exact features with comprehensive localization & navigation)
  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-card animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 mb-6 gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title={t.backButton}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <Building2 className="w-5 h-5" />
          </div>
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
            onClick={fillSampleCareHome}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-full font-semibold transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.sampleButton}</span>
          </button>
          <button
            type="button"
            onClick={handleResetForm}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
            title={t.refreshButton}
          >
            <RotateCcw className="w-4 h-4" />
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
            onClick={() => setCareHomeStep(num)}
            className={`p-2.5 rounded-2xl text-center cursor-pointer transition-all ${
              careHomeStep === num
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
        {careHomeStep === 1 && (
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
                placeholder={t.careHomeNamePlaceholder}
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
                  value={facilityPhotoUrl}
                  onChange={(e) => setFacilityPhotoUrl(e.target.value)}
                  placeholder="https://example.com/facility.jpg"
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {facilityPhotoUrl ? (
                <div className="mt-3 relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={facilityPhotoUrl} alt="Care Home Preview" className="w-full h-full object-cover" />
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

        {careHomeStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t.storageHeading}</h3>
              <p className="text-xs text-slate-500">{t.storageHelper}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'fridge', label: t.storageFridge, desc: t.storageFridgeDesc },
                { key: 'freezer', label: t.storageFreezer, desc: t.storageFreezerDesc },
                { key: 'dry_storage', label: t.storageDry, desc: t.storageDryDesc },
                { key: 'kitchen', label: t.storageKitchen, desc: t.storageKitchenDesc },
                { key: 'power_backup', label: t.storagePower, desc: t.storagePowerDesc },
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

        {careHomeStep === 3 && (
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
                { key: 'registration_cert', title: t.docRegCert },
                { key: 'govt_sanction_order', title: t.docGovtOrder },
                { key: 'utility_bill', title: t.docUtilityBill },
                { key: 'manager_id', title: t.docManagerId },
                { key: 'auth_letter', title: t.docAuthLetter },
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
                      <button
                        type="button"
                        onClick={() => handleScanDocument(key, title)}
                        disabled={isScanning}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Scan className="w-3.5 h-3.5" />
                        <span>{t.instantScanButton}</span>
                      </button>

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

        {careHomeStep === 4 && (
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
                placeholder={t.addressPlaceholder}
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
                  placeholder={t.contactPersonPlaceholder}
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
                    value={mobile}
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
                      setMobile(digits);
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
                placeholder={t.deliveryWindowPlaceholder}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex justify-between items-center mt-8 border-t border-slate-200/80 pt-4">
        {careHomeStep > 1 ? (
          <button
            type="button"
            onClick={() => setCareHomeStep(careHomeStep - 1)}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
          >
            {t.prevStepButton}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSelectedRole(null)}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-colors"
          >
            {t.backToRole}
          </button>
        )}

        {careHomeStep < 4 ? (
          <button
            type="button"
            onClick={() => setCareHomeStep(careHomeStep + 1)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {t.nextStepButton} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
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
