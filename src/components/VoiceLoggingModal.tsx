import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Volume2,
  CheckCircle,
  AlertTriangle,
  HeartPulse,
  Activity,
  Plus,
  Trash2,
  Cpu,
  Wifi,
  WifiOff,
  User,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { BeneficiaryCategory, VisitRecord, ASHAProfile } from '../types';
import { evaluateClinicalRisk } from '../utils/clinicalRiskEngine';
import { parseOfflineVoiceTranscript, normalizeDevanagariNumerals } from '../utils/offlineVoiceParser';
import { PRESET_VOICE_SCENARIOS, PresetVoiceScenario, isWebSpeechSupported, speakTriageGuidance } from '../utils/speechHelper';
import { RiskTriageBanner } from './RiskTriageBanner';

interface VoiceLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVisit: (visit: VisitRecord) => void;
  profile: ASHAProfile;
  lang: 'hi' | 'en';
  isOnline: boolean;
  prefillBeneficiaryName?: string;
  prefillCategory?: BeneficiaryCategory;
}

export const VoiceLoggingModal: React.FC<VoiceLoggingModalProps> = ({
  isOpen,
  onClose,
  onSaveVisit,
  profile,
  lang,
  isOnline,
  prefillBeneficiaryName = '',
  prefillCategory = 'ANC',
}) => {
  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [speechLang, setSpeechLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');
  const [transcript, setTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Extraction Engine State
  const [extractionSource, setExtractionSource] = useState<'offline-parser' | 'gemini-ai'>('offline-parser');
  const [isExtracting, setIsExtracting] = useState(false);

  // Form Fields (Structured Entities)
  const [beneficiaryName, setBeneficiaryName] = useState(prefillBeneficiaryName);
  const [category, setCategory] = useState<BeneficiaryCategory>(prefillCategory);
  const [age, setAge] = useState<string>('24');
  const [husbandOrGuardian, setHusbandOrGuardian] = useState('');
  const [villageArea, setVillageArea] = useState('Rampur Tola 2');
  const [contactNumber, setContactNumber] = useState('+91 ');
  const [gestationalMonths, setGestationalMonths] = useState<string>('7');
  const [gestationalWeeks, setGestationalWeeks] = useState<string>('30');
  const [systolicBP, setSystolicBP] = useState<string>('');
  const [diastolicBP, setDiastolicBP] = useState<string>('');
  const [hemoglobin, setHemoglobin] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [ifaTablets, setIfaTablets] = useState<string>('30');
  const [notes, setNotes] = useState<string>('');
  const [customSymptomInput, setCustomSymptomInput] = useState('');

  const recognitionRef = useRef<any>(null);

  // Common clinical symptoms chips for quick tap-to-add
  const commonSymptoms = [
    { en: 'Swelling in feet/face', hi: 'पैरों या चेहरे में सूजन' },
    { en: 'Vaginal bleeding', hi: 'रक्तस्राव (ब्लीडिंग)' },
    { en: 'Severe headache', hi: 'तेज सिरदर्द' },
    { en: 'High fever', hi: 'तेज बुखार' },
    { en: 'Dizziness / Extreme fatigue', hi: 'चक्कर आना व अत्यधिक कमजोरी' },
    { en: 'Decreased fetal movements', hi: 'गर्भ में हलचल कम होना' },
    { en: 'Severe abdominal pain', hi: 'पेट में तेज दर्द' },
    { en: 'Unable to breastfeed', hi: 'नवजात: दूध न पीना' },
    { en: 'Jaundice / Yellow eyes/skin', hi: 'पीलिया' },
    { en: 'Severe dysmenorrhea', hi: 'माहवारी में अत्यधिक दर्द' },
  ];

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (!isOpen) return;

    if (prefillBeneficiaryName) {
      setBeneficiaryName(prefillBeneficiaryName);
    }
    if (prefillCategory) {
      setCategory(prefillCategory);
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = speechLang;

          rec.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              finalTranscript += event.results[i][0].transcript;
            }
            if (finalTranscript) {
              setTranscript(finalTranscript);
              // Run immediate offline parser for instant real-time filling
              applyExtractedEntities(parseOfflineVoiceTranscript(finalTranscript), 'offline-parser');
            }
          };

          rec.onerror = (event: any) => {
            console.warn('Speech recognition error:', event.error);
            if (event.error !== 'no-speech') {
              setSpeechError(event.error === 'not-allowed' ? 'Microphone permission denied' : event.error);
            }
            setIsListening(false);
          };

          rec.onend = () => {
            setIsListening(false);
          };

          recognitionRef.current = rec;
        } catch (e) {
          console.warn('Speech init failed:', e);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isOpen, speechLang]);

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError(
        lang === 'hi'
          ? 'आपके ब्राउज़र में स्पीच रिकॉग्निशन उपलब्ध नहीं है। कृपया नीचे दिए गए टेस्ट वाक्यों का उपयोग करें।'
          : 'Web Speech API not available. Please use the preset test phrases below.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current.lang = speechLang;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start listening:', err);
      }
    }
  };

  // Apply parsed entities to form fields
  const applyExtractedEntities = (extracted: any, source: 'offline-parser' | 'gemini-ai') => {
    setExtractionSource(source);

    if (extracted.beneficiaryName && (!beneficiaryName || beneficiaryName === prefillBeneficiaryName)) {
      setBeneficiaryName(extracted.beneficiaryName);
    }
    if (extracted.category) {
      setCategory(extracted.category);
    }
    if (extracted.age) {
      setAge(String(extracted.age));
    }
    if (extracted.gestationalMonths !== null && extracted.gestationalMonths !== undefined) {
      setGestationalMonths(String(extracted.gestationalMonths));
    }
    if (extracted.gestationalWeeks !== null && extracted.gestationalWeeks !== undefined) {
      setGestationalWeeks(String(extracted.gestationalWeeks));
    }
    if (extracted.systolicBP) {
      setSystolicBP(String(extracted.systolicBP));
    }
    if (extracted.diastolicBP) {
      setDiastolicBP(String(extracted.diastolicBP));
    }
    if (extracted.hemoglobin) {
      setHemoglobin(String(extracted.hemoglobin));
    }
    if (extracted.weightKg) {
      setWeightKg(String(extracted.weightKg));
    }
    if (extracted.symptoms && Array.isArray(extracted.symptoms) && extracted.symptoms.length > 0) {
      setSymptoms((prev) => {
        const merged = new Set([...prev, ...extracted.symptoms]);
        return Array.from(merged);
      });
    }
    if (extracted.ifaTabletsGiven) {
      setIfaTablets(String(extracted.ifaTabletsGiven));
    }
    if (extracted.notes) {
      setNotes(extracted.notes);
    }
  };

  // Run Extraction via server Gemini AI (if online) or fallback to offline
  const handleExtractFromTranscript = async (textToExtract: string) => {
    if (!textToExtract.trim()) return;

    // First do instantaneous client-side parse so UI updates in 0ms!
    const offlineParsed = parseOfflineVoiceTranscript(textToExtract);
    applyExtractedEntities(offlineParsed, 'offline-parser');

    // If online, also call the server-side Gemini 3.8 endpoint for richer dialect understanding
    if (isOnline) {
      setIsExtracting(true);
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: textToExtract,
            language: speechLang.startsWith('hi') ? 'hi' : 'en',
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          applyExtractedEntities(data.data, data.source === 'gemini' ? 'gemini-ai' : 'offline-parser');
        }
      } catch (err) {
        console.warn('Gemini extraction call failed, sticking with offline parse:', err);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  // Test with Preset Voice Scenario
  const handleSelectPreset = (scenario: PresetVoiceScenario) => {
    setTranscript(scenario.transcript);
    handleExtractFromTranscript(scenario.transcript);
  };

  // Compute live clinical risk
  const parsedSys = systolicBP ? parseInt(systolicBP, 10) : null;
  const parsedDia = diastolicBP ? parseInt(diastolicBP, 10) : null;
  const parsedHb = hemoglobin ? parseFloat(hemoglobin) : null;
  const parsedAge = age ? parseInt(age, 10) : null;
  const parsedWeight = weightKg ? parseFloat(weightKg) : null;
  const parsedMonths = gestationalMonths ? parseInt(gestationalMonths, 10) : null;
  const parsedWeeks = gestationalWeeks ? parseInt(gestationalWeeks, 10) : null;

  const currentRisk = evaluateClinicalRisk({
    category,
    age: parsedAge,
    gestationalMonths: parsedMonths,
    gestationalWeeks: parsedWeeks,
    systolicBP: parsedSys,
    diastolicBP: parsedDia,
    hemoglobin: parsedHb,
    weightKg: parsedWeight,
    symptoms,
  });

  // Toggle symptom chip
  const toggleSymptom = (symNameEn: string) => {
    setSymptoms((prev) =>
      prev.includes(symNameEn) ? prev.filter((s) => s !== symNameEn) : [...prev, symNameEn]
    );
  };

  const handleAddCustomSymptom = () => {
    if (customSymptomInput.trim() && !symptoms.includes(customSymptomInput.trim())) {
      setSymptoms([...symptoms, customSymptomInput.trim()]);
      setCustomSymptomInput('');
    }
  };

  // Handle Save
  const handleSave = () => {
    if (!beneficiaryName.trim()) {
      alert(lang === 'hi' ? 'कृपया लाभार्थी का नाम दर्ज करें।' : 'Please enter beneficiary name.');
      return;
    }

    const newRecord: VisitRecord = {
      id: `rec-${Date.now().toString().slice(-6)}`,
      beneficiaryId: `B-${Math.floor(1000 + Math.random() * 9000)}`,
      beneficiaryName: beneficiaryName.trim(),
      husbandOrGuardianName: husbandOrGuardian.trim() || 'Ramesh',
      age: parsedAge || 24,
      category,
      contactNumber: contactNumber.trim() || '+91 98000 00000',
      villageArea: villageArea.trim() || profile.village,
      visitDate: new Date().toISOString(),
      gestationalMonths: parsedMonths,
      gestationalWeeks: parsedWeeks,
      systolicBP: parsedSys,
      diastolicBP: parsedDia,
      hemoglobin: parsedHb,
      weightKg: parsedWeight,
      symptoms,
      symptomsHindi: symptoms.map((s) => {
        const found = commonSymptoms.find((cs) => cs.en === s);
        return found ? found.hi : s;
      }),
      ifaTabletsGiven: ifaTablets ? parseInt(ifaTablets, 10) : null,
      voiceTranscript: transcript,
      risk: currentRisk,
      synced: isOnline, // if online at creation, auto-mark synced
      notes: notes.trim(),
    };

    onSaveVisit(newRecord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-stone-50 rounded-2xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-rose-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-700 flex items-center justify-center border border-rose-500/50">
              <Mic className="w-5 h-5 text-rose-100" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {lang === 'hi' ? 'आवाज से गृह भ्रमण दर्ज करें' : 'Voice Visit Logging (ASHA Field Entry)'}
              </h2>
              <p className="text-xs text-rose-200">
                {lang === 'hi'
                  ? 'हिंदी में बोलें • स्वतः फील्ड निष्कर्षण • नैदानिक जोखिम स्वतः गणना'
                  : 'Speak naturally in Hindi • Auto-structured fields • Instant Triage Risk'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Extraction engine badge */}
            <span
              className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                extractionSource === 'gemini-ai'
                  ? 'bg-rose-950/80 border-rose-400 text-rose-200'
                  : 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
              }`}
            >
              {extractionSource === 'gemini-ai' ? (
                <>
                  <Sparkles className="w-3 h-3 text-rose-300" />
                  <span>Gemini 3.8 AI</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3 h-3 text-emerald-300" />
                  <span>{lang === 'hi' ? 'ऑफलाइन पार्सर (0ms)' : 'Offline Parser (0ms)'}</span>
                </>
              )}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-rose-800 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* SECTION 1: VOICE INPUT & PRESETS */}
          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  {lang === 'hi' ? 'कदम 1: बोलें या वाक्य चुनें' : 'Step 1: Speak or Choose Voice Sample'}
                </span>
              </div>

              {/* Language Selector for speech recognition */}
              <div className="flex items-center gap-1.5 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
                <button
                  onClick={() => setSpeechLang('hi-IN')}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    speechLang === 'hi-IN' ? 'bg-rose-700 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  हिन्दी (hi-IN)
                </button>
                <button
                  onClick={() => setSpeechLang('en-IN')}
                  className={`px-2 py-0.5 rounded font-medium transition ${
                    speechLang === 'en-IN' ? 'bg-rose-700 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  English / Hinglish
                </button>
              </div>
            </div>

            {/* Microphone Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={toggleListening}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 shadow-md transition ${
                  isListening
                    ? 'bg-rose-600 text-white ring-4 ring-rose-300 animate-pulse'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 text-white animate-bounce" />
                    <span>{lang === 'hi' ? 'सुनना रोकें (Listening...)' : 'Stop Listening...'}</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 text-rose-400" />
                    <span>{lang === 'hi' ? 'माइक चालू करें (Tap to Speak)' : 'Start Speaking (Mic)'}</span>
                  </>
                )}
              </button>

              {/* Live Transcript Box */}
              <div className="w-full flex-1 relative">
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value);
                    applyExtractedEntities(parseOfflineVoiceTranscript(e.target.value), 'offline-parser');
                  }}
                  placeholder={
                    lang === 'hi'
                      ? 'उदा: "रेखा, 7 महीने, बीपी 150/100, पैरों में सूजन..."'
                      : 'e.g. "Rekha, 7 months, BP 150/100, swelling in feet..."'
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:border-rose-600 focus:ring-1 focus:ring-rose-600 text-sm text-stone-900 placeholder:text-stone-400 font-medium"
                />
                {transcript && (
                  <button
                    onClick={() => handleExtractFromTranscript(transcript)}
                    disabled={isExtracting}
                    className="absolute right-2 top-2 px-2 py-1 rounded bg-rose-700 text-white text-xs font-semibold hover:bg-rose-800 flex items-center gap-1 shadow-xs"
                    title="Re-run entity extraction"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isExtracting ? '...' : lang === 'hi' ? 'पार्स करें' : 'Parse'}</span>
                  </button>
                )}
              </div>
            </div>

            {speechError && (
              <p className="mt-2 text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{speechError}</span>
              </p>
            )}

            {/* Quick Test Voice Presets */}
            <div className="mt-3 pt-3 border-t border-stone-200">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                {lang === 'hi'
                  ? 'तुरंत परीक्षण के लिए आवाज नमूने (Field Voice Scenarios):'
                  : 'Quick Field Audio Scenarios (Tap to Auto-Fill):'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {PRESET_VOICE_SCENARIOS.map((scen) => (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() => handleSelectPreset(scen)}
                    className="text-left p-2 rounded-lg border border-stone-200 bg-stone-50 hover:bg-rose-50/70 hover:border-rose-300 transition text-xs group"
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-bold text-stone-800 group-hover:text-rose-900">
                        {lang === 'hi' ? scen.titleHindi : scen.title}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          scen.expectedRisk === 'RED'
                            ? 'bg-rose-100 text-rose-700'
                            : scen.expectedRisk === 'AMBER'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {scen.expectedRisk}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 italic line-clamp-1">"{scen.transcript}"</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2: LIVE CLINICAL RISK EVALUATION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>{lang === 'hi' ? 'कदम 2: नैदानिक जोखिम चेतावनी (Clinical Triage)' : 'Step 2: Real-time Clinical Triage'}</span>
              </span>
            </div>
            <RiskTriageBanner
              risk={currentRisk}
              profile={profile}
              lang={lang}
              beneficiaryName={beneficiaryName}
            />
          </div>

          {/* SECTION 3: STRUCTURED FORM FIELDS */}
          <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-stone-600" />
              <span>{lang === 'hi' ? 'कदम 3: निकाले गए विवरण व स्वास्थ्य जांच (Structured Fields)' : 'Step 3: Verify Extracted Entities'}</span>
            </span>

            {/* Row 1: Beneficiary Name, Category, Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'लाभार्थी का नाम *' : 'Beneficiary Name *'}
                </label>
                <input
                  type="text"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="उदा: रेखा देवी"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-medium focus:ring-1 focus:ring-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'श्रेणी (Category)' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as BeneficiaryCategory)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-medium bg-white"
                >
                  <option value="ANC">{lang === 'hi' ? 'गर्भवती महिला (ANC)' : 'Pregnant Woman (ANC)'}</option>
                  <option value="PNC">{lang === 'hi' ? 'प्रसूता मां (PNC)' : 'Postpartum Mother (PNC)'}</option>
                  <option value="NEWBORN">{lang === 'hi' ? 'नवजात शिशु (Newborn HBNC)' : 'Newborn Infant (0-28d)'}</option>
                  <option value="ADOLESCENT">{lang === 'hi' ? 'किशोरी (Adolescent Girl)' : 'Adolescent Girl (10-19y)'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'उम्र (वर्ष)' : 'Age (Years)'}
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="उदा: 24"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-medium"
                />
              </div>
            </div>

            {/* Row 2: Vitals - Gestational Age, Blood Pressure, Hemoglobin, Weight */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {category === 'ANC' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'hi' ? 'गर्भकाल (महीने/हफ़्ते)' : 'Gestational Age (M/W)'}
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={gestationalMonths}
                      onChange={(e) => setGestationalMonths(e.target.value)}
                      placeholder="M"
                      className="w-1/2 px-2 py-2 rounded-lg border border-stone-300 text-sm font-medium text-center"
                      title="Months"
                    />
                    <input
                      type="number"
                      value={gestationalWeeks}
                      onChange={(e) => setGestationalWeeks(e.target.value)}
                      placeholder="W"
                      className="w-1/2 px-2 py-2 rounded-lg border border-stone-300 text-sm font-medium text-center"
                      title="Weeks"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'रक्तचाप / BP (Sys/Dia)' : 'Blood Pressure (Sys/Dia)'}
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={systolicBP}
                    onChange={(e) => setSystolicBP(e.target.value)}
                    placeholder="120"
                    className={`w-1/2 px-2 py-2 rounded-lg border text-sm font-bold text-center ${
                      parsedSys && parsedSys >= 140
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-stone-300 text-stone-900'
                    }`}
                  />
                  <span className="text-stone-400 font-bold">/</span>
                  <input
                    type="number"
                    value={diastolicBP}
                    onChange={(e) => setDiastolicBP(e.target.value)}
                    placeholder="80"
                    className={`w-1/2 px-2 py-2 rounded-lg border text-sm font-bold text-center ${
                      parsedDia && parsedDia >= 90
                        ? 'border-rose-500 bg-rose-50 text-rose-900'
                        : 'border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'हीमोग्लोबिन / Hb (g/dL)' : 'Hemoglobin (g/dL)'}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={hemoglobin}
                  onChange={(e) => setHemoglobin(e.target.value)}
                  placeholder="उदा: 10.5"
                  className={`w-full px-3 py-2 rounded-lg border text-sm font-bold text-center ${
                    parsedHb && parsedHb < 7.0
                      ? 'border-rose-500 bg-rose-50 text-rose-900'
                      : parsedHb && parsedHb < 11.0
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-stone-300 text-stone-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'वजन (किलो)' : 'Weight (kg)'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="उदा: 52"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-medium text-center"
                />
              </div>
            </div>

            {/* Row 3: Danger Symptoms Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {lang === 'hi' ? 'लक्षण व खतरे के संकेत (Symptoms & Danger Signs):' : 'Observed Danger Signs & Symptoms:'}
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {commonSymptoms.map((sym) => {
                  const isSelected = symptoms.includes(sym.en);
                  return (
                    <button
                      key={sym.en}
                      type="button"
                      onClick={() => toggleSymptom(sym.en)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition ${
                        isSelected
                          ? 'bg-rose-700 border-rose-800 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
                      }`}
                    >
                      {lang === 'hi' ? sym.hi : sym.en}
                    </button>
                  );
                })}
              </div>

              {/* Custom symptom input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSymptomInput}
                  onChange={(e) => setCustomSymptomInput(e.target.value)}
                  placeholder={lang === 'hi' ? 'अन्य कोई लक्षण दर्ज करें...' : 'Add other symptom...'}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSymptom}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 text-white text-xs font-medium hover:bg-stone-900"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  {lang === 'hi' ? 'जोड़ें' : 'Add'}
                </button>
              </div>
            </div>

            {/* Row 4: Guardian, Village Area, Phone, IFA Tablets */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-stone-200">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'पति या अभिभावक' : 'Husband / Guardian'}
                </label>
                <input
                  type="text"
                  value={husbandOrGuardian}
                  onChange={(e) => setHusbandOrGuardian(e.target.value)}
                  placeholder="उदा: रमेश यादव"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'टोला / मोहल्ला' : 'Village Area / Tola'}
                </label>
                <input
                  type="text"
                  value={villageArea}
                  onChange={(e) => setVillageArea(e.target.value)}
                  placeholder="उदा: पूरब टोला"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'मोबाइल नंबर' : 'Contact Phone'}
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 9839..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'दी गई IFA गोलियां' : 'IFA Tablets Given'}
                </label>
                <input
                  type="number"
                  value={ifaTablets}
                  onChange={(e) => setIfaTablets(e.target.value)}
                  placeholder="30"
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium text-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-4 sm:px-6 py-3 border-t border-stone-300 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold shadow-xs transition"
          >
            {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-800 hover:to-red-900 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-rose-200" />
              <span>{lang === 'hi' ? 'रजिस्टर में दर्ज करें' : 'Save & Record in Register'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
