import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  ShieldAlert,
  Eye,
  EyeOff,
  Pill,
  Heart,
  Activity,
  Mic,
  Plus,
  BookOpen,
  Calendar,
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';
import { VisitRecord, ASHAProfile } from '../types';

interface AdolescentModuleViewProps {
  visits: VisitRecord[];
  profile: ASHAProfile;
  lang: 'hi' | 'en';
  onOpenVoiceLog: (prefillName?: string) => void;
}

export const AdolescentModuleView: React.FC<AdolescentModuleViewProps> = ({
  visits,
  profile,
  lang,
  onOpenVoiceLog,
}) => {
  const [isPrivacyLocked, setIsPrivacyLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);

  const adolescentVisits = visits.filter((v) => v.category === 'ADOLESCENT');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput.length >= 4) {
      setIsPrivacyLocked(false);
      setShowPinModal(false);
      setPinInput('');
    } else {
      alert(lang === 'hi' ? 'गलत पिन! डिफ़ॉल्ट पिन 1234 है।' : 'Incorrect PIN! Default PIN is 1234.');
    }
  };

  const maskName = (name: string) => {
    if (!isPrivacyLocked) return name;
    const parts = name.split(' ');
    return parts[0].charAt(0) + '*** ' + (parts[1] ? parts[1].charAt(0) + '***' : '');
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-purple-800/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-purple-700/80">
              <Sparkles className="w-5 h-5 text-purple-200" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold">
              {lang === 'hi' ? 'राष्ट्रीय किशोर स्वास्थ्य कार्यक्रम (RKSK)' : 'Adolescent Health Module (RKSK)'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-400/20 text-purple-200 border border-purple-400/30">
              10–19 {lang === 'hi' ? 'आयु वर्ग' : 'Years'}
            </span>
          </div>
          <p className="text-xs text-purple-200/90 mt-1 max-w-xl">
            {lang === 'hi'
              ? 'किशोरी बालिकाओं हेतु साप्ताहिक नीली आयरन-फोलिक गोली (WIFS), माहवारी स्वच्छता, व गोपनीयता-संरक्षित स्वास्थ्य रिकॉर्ड'
              : 'Weekly Blue IFA (WIFS) tracking, menstrual hygiene, anemia screening, and privacy-shielded records.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Shield Toggle */}
          <button
            onClick={() => {
              if (isPrivacyLocked) {
                setShowPinModal(true);
              } else {
                setIsPrivacyLocked(true);
              }
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition ${
              isPrivacyLocked
                ? 'bg-purple-800/90 hover:bg-purple-700 text-purple-100 border-purple-600'
                : 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
            }`}
            title="Toggle privacy mask for confidential adolescent menstrual health records"
          >
            {isPrivacyLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-purple-300" />
                <span>{lang === 'hi' ? 'गोपनीयता शील्ड: लॉक' : 'Privacy: Locked'}</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-white" />
                <span>{lang === 'hi' ? 'गोपनीयता: खुली है' : 'Privacy: Unlocked'}</span>
              </>
            )}
          </button>

          {/* New Adolescent Voice Log */}
          <button
            onClick={() => onOpenVoiceLog()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-purple-50 text-purple-950 text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Mic className="w-4 h-4 text-purple-700" />
            <span>{lang === 'hi' ? 'किशोरी विजिट बोलें' : 'Log RKSK Visit'}</span>
          </button>
        </div>
      </div>

      {/* RKSK Core Program Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pillar 1: WIFS Blue IFA */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase mb-1">
            <Pill className="w-4 h-4" />
            <span>{lang === 'hi' ? 'WIFS नीली आयरन गोली' : 'WIFS Blue IFA Supplement'}</span>
          </div>
          <span className="text-xl font-black text-stone-900">
            {lang === 'hi' ? 'हर सोमवार 1 गोली' : '1 Tablet Every Monday'}
          </span>
          <p className="text-xs text-stone-500 mt-1">
            {lang === 'hi'
              ? '10 से 19 वर्ष की बालिकाओं में रक्ताल्पता (एनीमिया) दूर करने हेतु 60mg आयरन + 500mcg फोलिक एसिड'
              : 'Weekly prophylaxis against nutritional iron-deficiency anemia in growing girls.'}
          </p>
        </div>

        {/* Pillar 2: Menstrual Hygiene */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase mb-1">
            <Heart className="w-4 h-4" />
            <span>{lang === 'hi' ? 'माहवारी स्वच्छता योजना' : 'Menstrual Hygiene Scheme'}</span>
          </div>
          <span className="text-xl font-black text-stone-900">
            {lang === 'hi' ? '₹6 में 6 सेनेटरी पैड' : 'Subsidized Pad Supply'}
          </span>
          <p className="text-xs text-stone-500 mt-1">
            {lang === 'hi'
              ? 'आशा कार्यकत्री द्वारा गांव में किशोरियों को सुरक्षित सैनिटरी नैपकिन वितरण एवं स्वच्छता परामर्श'
              : 'Safe napkin distribution, disposal guidance, and confidential counseling.'}
          </p>
        </div>

        {/* Pillar 3: Peer Educator (Saathiya) */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase mb-1">
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'hi' ? 'साथिया (Peer Educator)' : 'Saathiya Peer Counseling'}</span>
          </div>
          <span className="text-xl font-black text-stone-900">
            {lang === 'hi' ? 'त्रैमासिक किशोरी दिवस' : 'Quarterly Kishori Diwas'}
          </span>
          <p className="text-xs text-stone-500 mt-1">
            {lang === 'hi'
              ? 'आंगनवाड़ी केंद्र रामपुर में पोषण, व्यक्तिगत स्वच्छता, और हीमोग्लोबिन कैंप'
              : 'Regular community nutrition counseling and stigma-free support.'}
          </p>
        </div>
      </div>

      {/* Adolescent Registry Table / Records */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
            {lang === 'hi' ? 'गांव रामपुर - किशोरी स्वास्थ्य रजिस्टर' : 'Rampur Adolescent Health Records'}
          </span>
          <span className="text-xs text-stone-500">
            {adolescentVisits.length} {lang === 'hi' ? 'किशोरी दर्ज' : 'Enrolled Girls'}
          </span>
        </div>

        <div className="divide-y divide-stone-200">
          {adolescentVisits.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              {lang === 'hi'
                ? 'अभी कोई किशोरी रिकॉर्ड दर्ज नहीं है। ऊपर दिए गए "किशोरी विजिट बोलें" बटन से जोड़ें।'
                : 'No adolescent records yet. Click "Log RKSK Visit" to add.'}
            </div>
          ) : (
            adolescentVisits.map((record) => (
              <div key={record.id} className="p-4 hover:bg-stone-50/80 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">
                      {maskName(record.beneficiaryName)}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      {record.age} {lang === 'hi' ? 'वर्ष' : 'yrs'}
                    </span>
                    <span className="text-stone-400">•</span>
                    <span className="text-stone-600 font-medium">
                      {isPrivacyLocked ? '*** Basti' : record.villageArea}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-stone-600 mt-1">
                    <span>
                      <strong>{lang === 'hi' ? 'हीमोग्लोबिन: ' : 'Hb: '}</strong>
                      <span className={record.hemoglobin && record.hemoglobin < 10 ? 'text-amber-700 font-bold' : 'text-stone-900 font-bold'}>
                        {record.hemoglobin ? `${record.hemoglobin} g/dL` : 'जांच बाकी'}
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      <strong>{lang === 'hi' ? 'WIFS नीली गोली: ' : 'WIFS Blue: '}</strong>
                      <span className="text-emerald-700 font-bold">
                        {record.adolescentData?.wifsBlueTabletsTaken || 4} {lang === 'hi' ? 'गोली दी गई' : 'tabs given'}
                      </span>
                    </span>
                    <span>•</span>
                    <span>
                      <strong>{lang === 'hi' ? 'सेनेटरी पैड: ' : 'Sanitary Napkins: '}</strong>
                      <span className="text-purple-700 font-bold">
                        {record.adolescentData?.sanitaryNapkinsReceived ? (lang === 'hi' ? 'उपलब्ध कराया गया' : 'Supplied') : 'लंबित'}
                      </span>
                    </span>
                  </div>

                  {record.symptoms && record.symptoms.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="text-stone-400 font-bold text-[10px]">{lang === 'hi' ? 'लक्षण:' : 'Symptoms:'}</span>
                      {record.symptoms.map((s, i) => (
                        <span key={i} className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                      record.risk.level === 'RED'
                        ? 'bg-rose-100 text-rose-700'
                        : record.risk.level === 'AMBER'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {record.risk.level}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PIN Unlock Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-stone-300 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-700" />
                <h3 className="text-sm font-bold text-stone-900">
                  {lang === 'hi' ? 'गोपनीयता शील्ड खोलें' : 'Unlock Privacy Shield'}
                </h3>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              {lang === 'hi'
                ? 'माहवारी स्वास्थ्य व व्यक्तिगत रिकॉर्ड सुरक्षित रखने के लिए आशा पिन दर्ज करें (परीक्षण पिन: 1234)'
                : 'Enter your 4-digit ASHA PIN to unmask sensitive names and details (Test PIN: 1234)'}
            </p>

            <form onSubmit={handleUnlock} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="1234"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-center text-lg font-bold tracking-widest focus:ring-2 focus:ring-purple-600"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-3 py-1.5 rounded-lg border text-xs text-stone-700 hover:bg-stone-100"
                >
                  {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-bold hover:bg-purple-800"
                >
                  {lang === 'hi' ? 'अनलॉक करें' : 'Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
