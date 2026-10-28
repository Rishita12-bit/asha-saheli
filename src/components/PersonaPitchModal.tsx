import React from 'react';
import {
  HeartHandshake,
  BookOpen,
  WifiOff,
  AlertTriangle,
  Mic,
  FileCheck2,
  Users,
  CheckCircle,
  X,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ASHAProfile } from '../types';

interface PersonaPitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ASHAProfile;
  lang: 'hi' | 'en';
}

export const PersonaPitchModal: React.FC<PersonaPitchModalProps> = ({
  isOpen,
  onClose,
  profile,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-rose-900 via-red-900 to-rose-950 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'hi' ? 'केस स्टडी व परिचय' : 'ASHA Worker Persona & Problem Brief'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {profile.name}
          </h2>
          <p className="text-sm text-rose-100/90 mt-1 max-w-xl">
            {lang === 'hi'
              ? 'उप-केंद्र पिपराइच, गोरखपुर (उत्तर प्रदेश) • 1,048 ग्रामीण आबादी, 182 परिवार'
              : 'Sub-Centre Pipraich, Gorakhpur, UP • Covering 1,048 citizens across 182 rural households'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-stone-800 text-xs sm:text-sm">
          {/* Persona Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                {lang === 'hi' ? 'दैनिक कार्यक्षेत्र' : 'Daily Coverage'}
              </span>
              <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                6-8 km {lang === 'hi' ? 'पैदल गृह भ्रमण' : 'Walking Home Visits'}
              </span>
              <p className="text-[11px] text-stone-500 mt-1">
                {lang === 'hi' ? 'गर्भवती, प्रसूता, नवजात व किशोरियां' : 'Mothers, newborns, adolescents'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                {lang === 'hi' ? 'पारंपरिक बोझ' : 'Paper Register Burden'}
              </span>
              <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                5 {lang === 'hi' ? 'भारी रजिस्टर हाथ से भरना' : 'Thick Registers Carried'}
              </span>
              <p className="text-[11px] text-stone-500 mt-1">
                {lang === 'hi' ? 'RCH, डिलीवरी, टीकाकरण, WIFS' : 'RCH, Delivery, Immunization, Form 6'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                {lang === 'hi' ? 'नेटवर्क की स्थिति' : 'Connectivity Reality'}
              </span>
              <span className="text-sm font-bold text-rose-800 mt-0.5 block flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'कमजोर 2G या शून्य सिग्नल' : 'Spotty 2G / No Signal'}</span>
              </span>
              <p className="text-[11px] text-stone-500 mt-1">
                {lang === 'hi' ? 'ऐप 100% ऑफ़लाइन चलना जरूरी है' : 'App MUST work 100% offline'}
              </p>
            </div>
          </div>

          {/* The Life-and-Death Problem */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <h3 className="font-bold text-rose-950 text-sm flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{lang === 'hi' ? 'गंभीर समस्या: एक छूटा हुआ खतरे का संकेत जानलेवा हो सकता है' : 'The Core Problem: A Missed Warning Sign Can Be Fatal'}</span>
            </h3>
            <p className="text-stone-700 leading-relaxed text-xs">
              {lang === 'hi'
                ? 'सुनीता जब गांव के पूरब टोले में रेखा (24 वर्ष, 7 महीने की गर्भवती) के घर जाती हैं, तो बीपी 150/100 और पैरों में सूजन है। हाथ से भारी रजिस्टरों में लिखते समय अगर यह गंभीर प्री-एक्लेम्पसिया (दौरे का खतरा) छूट जाए, तो मां और बच्चे दोनों की जान जा सकती है। इसके अलावा महीने के अंत में 5 रजिस्टरों से संख्याएं गिनकर फॉर्म 6 बनाने में 3-4 दिन बर्बाद होते हैं।'
                : 'When Sunita visits Rekha (24y, 7 months pregnant in Rampur hamlet), Rekha has BP 150/100 and swelling. Recorded by hand in paper logs, severe pre-eclampsia can easily be overlooked until convulsions strike. Furthermore, reconciling five separate registers into Monthly Form 6 takes days of tedious manual tallying.'}
            </p>
          </div>

          {/* How ASHA Saheli Solves This (The Solution Pillars) */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900 text-sm">
              {lang === 'hi' ? 'आशा सहेली कैसे समाधान करती है (Core Solutions):' : 'How ASHA Saheli Solves This:'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-stone-200 bg-white shadow-xs flex items-start gap-2.5">
                <Mic className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-stone-900">
                    {lang === 'hi' ? '1. हिंदी आवाज में विजिट रिकॉर्डिंग' : '1. Voice Visit Logging in Hindi'}
                  </h4>
                  <p className="text-stone-600 mt-0.5">
                    {lang === 'hi'
                      ? 'सुनीता बस बोलती हैं "रेखा, 7 महीने, बीपी 150/100, पैरों में सूजन"। ऐप स्वतः नाम, गर्भकाल, बीपी व लक्षण दर्ज कर लेता है।'
                      : 'Speaks naturally in village Hindi. Instant zero-latency regex & Gemini NLP structuring.'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-white shadow-xs flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-stone-900">
                    {lang === 'hi' ? '2. पारदर्शी नैदानिक जोखिम चेतावनी' : '2. Transparent Clinical Risk Flagging'}
                  </h4>
                  <p className="text-stone-600 mt-0.5">
                    {lang === 'hi'
                      ? 'कोई ब्लैक बॉक्स AI नहीं! मानक MoHFW प्रोटोकॉल पर आधारित लाल/पीली/हरी चेतावनी, स्पष्ट कारण और 108 एम्बुलेंस शॉर्टकट।'
                      : 'Rule-based, explainable MoHFW protocol triage with audio readout and emergency 108 dials.'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-white shadow-xs flex items-start gap-2.5">
                <FileCheck2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-stone-900">
                    {lang === 'hi' ? '3. स्वतः तैयार सरकारी फॉर्म 6 व देय सूची' : '3. 1-Click Form 6 & Paperwork'}
                  </h4>
                  <p className="text-stone-600 mt-0.5">
                    {lang === 'hi'
                      ? 'आगामी टीकाकरण देय सूची, मासिक RCH प्रपत्र, और सुनीता का सरकारी प्रोत्साहन (Incentive) दावा एक क्लिक में PDF।'
                      : 'Generates official MoHFW Form 6 PDF, due lists, and calculates Sunita’s NHM incentive.'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-stone-200 bg-white shadow-xs flex items-start gap-2.5">
                <WifiOff className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-stone-900">
                    {lang === 'hi' ? '4. 100% ऑफ़लाइन फर्स्ट आर्किटेक्चर' : '4. 100% Offline-First Architecture'}
                  </h4>
                  <p className="text-stone-600 mt-0.5">
                    {lang === 'hi'
                      ? 'गहरे ग्रामीण क्षेत्र में इंटरनेट न होने पर भी सब कुछ फोन में सुरक्षित सहेजा जाता है और पीएचसी पहुंचने पर सिंक होता है।'
                      : 'IndexedDB storage with pending sync queue. Operates seamlessly in airplane mode.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition"
          >
            {lang === 'hi' ? 'ऐप का उपयोग शुरू करें' : 'Explore ASHA Saheli App'}
          </button>
        </div>
      </div>
    </div>
  );
};
