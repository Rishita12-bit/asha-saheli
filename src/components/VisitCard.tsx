import React, { useState } from 'react';
import {
  Heart,
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Phone,
  Volume2,
  VolumeX,
  Clock,
  MapPin,
  Check,
  CloudCheck,
  WifiOff,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
} from 'lucide-react';
import { VisitRecord, ASHAProfile } from '../types';
import { speakTriageGuidance, stopSpeaking } from '../utils/speechHelper';

interface VisitCardProps {
  visit: VisitRecord;
  profile: ASHAProfile;
  lang: 'hi' | 'en';
  onDelete: (id: string) => void;
}

export const VisitCard: React.FC<VisitCardProps> = ({
  visit,
  profile,
  lang,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const risk = visit.risk;
  const isRed = risk.level === 'RED';
  const isAmber = risk.level === 'AMBER';

  const handlePlayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak =
      lang === 'hi'
        ? `${visit.beneficiaryName}: ${risk.titleHindi}. कारण: ${risk.reasonsHindi.join(', ')}. आवश्यक कार्रवाई: ${risk.nextActionHindi}`
        : `${visit.beneficiaryName}: ${risk.title}. Grounds: ${risk.reasons.join(', ')}. Next Action: ${risk.nextAction}`;

    setIsPlayingAudio(true);
    speakTriageGuidance(textToSpeak, lang === 'hi' ? 'hi-IN' : 'en-IN');

    setTimeout(() => {
      setIsPlayingAudio(false);
    }, Math.min(12000, Math.max(3000, textToSpeak.length * 75)));
  };

  const getBorderColor = () => {
    if (isRed) return 'border-rose-400 bg-rose-50/40 hover:border-rose-500';
    if (isAmber) return 'border-amber-400 bg-amber-50/40 hover:border-amber-500';
    return 'border-emerald-300 bg-white hover:border-emerald-400';
  };

  const getCategoryBadge = () => {
    switch (visit.category) {
      case 'ANC':
        return { label: lang === 'hi' ? 'गर्भवती (ANC)' : 'Pregnant (ANC)', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'PNC':
        return { label: lang === 'hi' ? 'प्रसूता (PNC)' : 'Postpartum (PNC)', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'NEWBORN':
        return { label: lang === 'hi' ? 'नवजात (HBNC)' : 'Newborn (HBNC)', color: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'ADOLESCENT':
        return { label: lang === 'hi' ? 'किशोरी (RKSK)' : 'Adolescent', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    }
  };

  const catBadge = getCategoryBadge();

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 shadow-xs transition duration-200 ${getBorderColor()}`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Risk Level Badge Pill */}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isRed
                ? 'bg-rose-600 text-white'
                : isAmber
                ? 'bg-amber-500 text-stone-950 font-black'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isRed ? (
              <AlertCircle className="w-5 h-5 animate-pulse" />
            ) : isAmber ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                {visit.beneficiaryName}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${catBadge.color}`}>
                {catBadge.label}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {visit.age} {lang === 'hi' ? 'वर्ष' : 'yrs'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" />
                <span>{visit.villageArea}</span>
              </span>
              <span className="text-stone-300">•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>{new Date(visit.visitDate).toLocaleDateString('hi-IN', { month: 'short', day: 'numeric' })}</span>
              </span>
              <span className="text-stone-300">•</span>
              <span>
                {lang === 'hi' ? 'अभिभावक: ' : 'Guardian: '}
                <strong className="text-stone-700">{visit.husbandOrGuardianName}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Audio Speech Button */}
          <button
            onClick={handlePlayVoice}
            className={`p-2 rounded-xl border text-xs font-semibold shadow-xs transition ${
              isPlayingAudio
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300'
            }`}
            title={lang === 'hi' ? 'जोखिम व कदम आवाज में सुनें' : 'Listen to clinical triage guidance'}
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-rose-600" />}
          </button>

          {/* Call Link */}
          {visit.contactNumber && (
            <a
              href={`tel:${visit.contactNumber}`}
              className="p-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 shadow-xs transition"
              title={lang === 'hi' ? 'कॉल करें' : 'Call beneficiary'}
            >
              <Phone className="w-4 h-4 text-emerald-600" />
            </a>
          )}

          {/* Delete Button */}
          <button
            onClick={() => onDelete(visit.id)}
            className="p-2 rounded-xl bg-white hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-300 shadow-xs transition"
            title="Delete visit record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-stone-200/70">
        {/* Gestational Age */}
        {visit.category === 'ANC' && visit.gestationalMonths && (
          <div className="p-2 rounded-xl bg-white/90 border border-stone-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              {lang === 'hi' ? 'गर्भकाल' : 'Gestational Age'}
            </span>
            <span className="text-sm font-bold text-stone-900">
              {visit.gestationalMonths} {lang === 'hi' ? 'माह' : 'months'}
              {visit.gestationalWeeks ? ` (${visit.gestationalWeeks}w)` : ''}
            </span>
          </div>
        )}

        {/* Blood Pressure */}
        {visit.systolicBP && visit.diastolicBP ? (
          <div
            className={`p-2 rounded-xl border ${
              visit.systolicBP >= 140 || visit.diastolicBP >= 90
                ? 'bg-rose-100/70 border-rose-300 text-rose-950'
                : 'bg-white/90 border-stone-200/80 text-stone-900'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              {lang === 'hi' ? 'रक्तचाप (BP)' : 'Blood Pressure'}
            </span>
            <span className="text-sm font-black">
              {visit.systolicBP}/{visit.diastolicBP}
              <span className="text-[10px] font-normal ml-1">mmHg</span>
            </span>
          </div>
        ) : null}

        {/* Hemoglobin */}
        {visit.hemoglobin !== null && visit.hemoglobin !== undefined && (
          <div
            className={`p-2 rounded-xl border ${
              visit.hemoglobin < 7.0
                ? 'bg-rose-100/70 border-rose-300 text-rose-950'
                : visit.hemoglobin < 11.0
                ? 'bg-amber-100/70 border-amber-300 text-amber-950'
                : 'bg-white/90 border-stone-200/80 text-stone-900'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              {lang === 'hi' ? 'हीमोग्लोबिन (Hb)' : 'Hemoglobin'}
            </span>
            <span className="text-sm font-black">
              {visit.hemoglobin}
              <span className="text-[10px] font-normal ml-1">g/dL</span>
            </span>
          </div>
        )}

        {/* Weight */}
        {visit.weightKg && (
          <div className="p-2 rounded-xl bg-white/90 border border-stone-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              {lang === 'hi' ? 'वजन' : 'Weight'}
            </span>
            <span className="text-sm font-bold text-stone-900">
              {visit.weightKg} <span className="text-[10px] font-normal">kg</span>
            </span>
          </div>
        )}

        {/* IFA Tablets */}
        {visit.ifaTabletsGiven ? (
          <div className="p-2 rounded-xl bg-white/90 border border-stone-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
              {lang === 'hi' ? 'दी गई IFA गोली' : 'IFA Provided'}
            </span>
            <span className="text-sm font-bold text-stone-900">
              {visit.ifaTabletsGiven} <span className="text-[10px] font-normal">tabs</span>
            </span>
          </div>
        ) : null}
      </div>

      {/* Observed Danger Signs / Symptoms Tags */}
      {visit.symptoms && visit.symptoms.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-stone-500 mr-1">
            {lang === 'hi' ? 'लक्षण:' : 'Symptoms:'}
          </span>
          {(lang === 'hi' ? visit.symptomsHindi : visit.symptoms).map((sym, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                isRed
                  ? 'bg-rose-200/80 text-rose-950 border border-rose-300'
                  : 'bg-stone-200 text-stone-800'
              }`}
            >
              {sym}
            </span>
          ))}
        </div>
      )}

      {/* Triage Banner Summary */}
      <div
        className={`mt-3 p-3 rounded-xl border text-xs ${
          isRed
            ? 'bg-rose-100/60 border-rose-300 text-rose-950'
            : isAmber
            ? 'bg-amber-100/60 border-amber-300 text-amber-950'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-1.5 font-bold mb-1">
          <span className="uppercase tracking-wider font-extrabold text-[10px] px-1.5 py-0.2 rounded bg-black/10">
            {risk.level}
          </span>
          <span>{lang === 'hi' ? risk.titleHindi : risk.title}</span>
        </div>
        <p className="font-semibold text-stone-900 leading-snug">
          {lang === 'hi' ? risk.reasonsHindi[0] : risk.reasons[0]}
        </p>
        <p className="mt-1 text-[11px] text-stone-700 italic">
          <strong>{lang === 'hi' ? 'कार्रवाई: ' : 'Action: '}</strong>
          {lang === 'hi' ? risk.nextActionHindi : risk.nextAction}
        </p>
      </div>

      {/* Expand / Details Toggle */}
      <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-200/60 text-xs">
        <div className="flex items-center gap-2">
          {/* Sync status */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
              visit.synced
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            {visit.synced ? (
              <>
                <Check className="w-3 h-3 text-emerald-700" />
                <span>{lang === 'hi' ? 'RCH पोर्टल सिंक' : 'Portal Synced'}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-amber-700" />
                <span>{lang === 'hi' ? 'लोकल सुरक्षित (सिंक लंबित)' : 'Saved Offline (Pending)'}</span>
              </>
            )}
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-stone-600 hover:text-stone-900 font-semibold"
        >
          <span>{isExpanded ? (lang === 'hi' ? 'कम दिखाएं' : 'Less') : (lang === 'hi' ? 'विस्तार से' : 'Details')}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded details: Spoken Transcript & Clinical Protocols */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-stone-200 space-y-2 text-xs">
          {visit.voiceTranscript && (
            <div className="p-2.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-700">
              <span className="font-bold text-stone-500 uppercase tracking-wider block mb-1">
                {lang === 'hi' ? 'मूल आवाज ट्रांसक्रिप्ट (Original Spoken Note):' : 'Original Spoken Voice Note:'}
              </span>
              <p className="italic font-medium">"{visit.voiceTranscript}"</p>
            </div>
          )}

          {visit.notes && (
            <div className="text-stone-600">
              <strong className="text-stone-800">{lang === 'hi' ? 'आशा की टिप्पणी: ' : 'Field Notes: '}</strong>
              <span>{visit.notes}</span>
            </div>
          )}

          <div className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
            <span>{lang === 'hi' ? 'उप-केंद्र: ' : 'Sub-Centre: '}{profile.subCentre}</span>
            <span>{lang === 'hi' ? 'पर्यवेक्षक: ' : 'ANM: '}{profile.anmName}</span>
          </div>
        </div>
      )}
    </div>
  );
};
