import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  PhoneCall,
  Volume2,
  VolumeX,
  Ambulance,
  UserCheck,
  Building2,
} from 'lucide-react';
import { RiskEvaluation, RiskLevel, ASHAProfile } from '../types';
import { speakTriageGuidance, stopSpeaking } from '../utils/speechHelper';

interface RiskTriageBannerProps {
  risk: RiskEvaluation;
  profile: ASHAProfile;
  lang: 'hi' | 'en';
  beneficiaryName?: string;
  compact?: boolean;
}

export const RiskTriageBanner: React.FC<RiskTriageBannerProps> = ({
  risk,
  profile,
  lang,
  beneficiaryName = '',
  compact = false,
}) => {
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    const namePrefix = beneficiaryName ? `${beneficiaryName}: ` : '';
    const textToSpeak =
      lang === 'hi'
        ? `${namePrefix}${risk.titleHindi}. कारण: ${risk.reasonsHindi.join(', ')}. आवश्यक कदम: ${risk.nextActionHindi}`
        : `${namePrefix}${risk.title}. Reasons: ${risk.reasons.join(', ')}. Next Action: ${risk.nextAction}`;

    setIsSpeaking(true);
    speakTriageGuidance(textToSpeak, lang === 'hi' ? 'hi-IN' : 'en-IN');

    // Auto reset speaking state after rough duration
    const approxDurationMs = Math.min(14000, Math.max(3000, textToSpeak.length * 75));
    setTimeout(() => {
      setIsSpeaking(false);
    }, approxDurationMs);
  };

  const getTheme = (level: RiskLevel) => {
    switch (level) {
      case 'RED':
        return {
          bg: 'bg-rose-50 border-rose-400 text-rose-950',
          badgeBg: 'bg-rose-600 text-white',
          icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          accentBorder: 'border-l-4 border-l-rose-600',
        };
      case 'AMBER':
        return {
          bg: 'bg-amber-50 border-amber-400 text-amber-950',
          badgeBg: 'bg-amber-500 text-stone-950',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          accentBorder: 'border-l-4 border-l-amber-500',
        };
      case 'GREEN':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-400 text-emerald-950',
          badgeBg: 'bg-emerald-600 text-white',
          icon: <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />,
          accentBorder: 'border-l-4 border-l-emerald-600',
        };
    }
  };

  const theme = getTheme(risk.level);

  if (compact) {
    return (
      <div
        className={`rounded-lg p-2.5 border ${theme.bg} ${theme.accentBorder} flex items-start justify-between gap-2 text-xs`}
      >
        <div className="flex items-start gap-2">
          {theme.icon}
          <div>
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-extrabold ${theme.badgeBg}`}>
                {risk.level}
              </span>
              <span>{lang === 'hi' ? risk.titleHindi : risk.title}</span>
            </div>
            <p className="mt-0.5 text-stone-700 leading-snug">
              {lang === 'hi' ? risk.reasonsHindi[0] : risk.reasons[0]}
            </p>
          </div>
        </div>
        <button
          onClick={handleSpeak}
          className="p-1 rounded bg-white/80 hover:bg-white text-stone-700 border border-stone-300 shadow-xs shrink-0"
          title={lang === 'hi' ? 'निर्देश सुनें' : 'Read aloud'}
        >
          {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-4 shadow-sm ${theme.bg} ${theme.accentBorder}`}>
      {/* Top Banner Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {theme.icon}
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs uppercase font-extrabold tracking-wide ${theme.badgeBg}`}>
                {risk.level === 'RED'
                  ? lang === 'hi'
                    ? 'लाल चेतावनी • उच्च जोखिम'
                    : 'RED ALERT • HIGH RISK'
                  : risk.level === 'AMBER'
                  ? lang === 'hi'
                    ? 'पीली चेतावनी • मध्यम जोखिम'
                    : 'AMBER ALERT • MODERATE'
                  : lang === 'hi'
                  ? 'सामान्य • स्वस्थ'
                  : 'GREEN • NORMAL CARE'}
              </span>
              {risk.urgentReferral && (
                <span className="animate-pulse inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-700 text-white text-[10px] font-bold uppercase">
                  <Ambulance className="w-3 h-3" />
                  {lang === 'hi' ? 'तत्काल रेफरल' : 'Urgent Referral'}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold mt-1 text-stone-900">
              {lang === 'hi' ? risk.titleHindi : risk.title}
            </h3>
          </div>
        </div>

        {/* Read Out Audio Button */}
        <button
          onClick={handleSpeak}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs border transition ${
            isSpeaking
              ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
              : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
          }`}
          title="Play voice audio readout of clinical risk & required action in Hindi"
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>{lang === 'hi' ? 'रोकें' : 'Stop'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-rose-600" />
              <span>{lang === 'hi' ? 'आवाज में सुनें' : 'Listen'}</span>
            </>
          )}
        </button>
      </div>

      {/* Clinical Reasons List */}
      <div className="mt-3 pt-3 border-t border-stone-200/60">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
          {lang === 'hi' ? 'जोखिम का स्पष्ट कारण (Clinical Grounds):' : 'Transparent Clinical Grounds:'}
        </h4>
        <ul className="space-y-1">
          {(lang === 'hi' ? risk.reasonsHindi : risk.reasons).map((reason, idx) => (
            <li key={idx} className="text-xs text-stone-800 flex items-start gap-1.5 font-medium">
              <span className="text-stone-400 font-bold">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Immediate Clinical Next Action */}
      <div className="mt-3 p-3 rounded-lg bg-white/90 border border-stone-200 text-xs shadow-xs">
        <div className="flex items-center gap-1.5 text-stone-900 font-bold mb-1">
          <Building2 className="w-3.5 h-3.5 text-rose-700" />
          <span>{lang === 'hi' ? 'आशा दीदी के लिए अगला कदम (Protocol Action):' : 'Mandated Protocol Action:'}</span>
        </div>
        <p className="text-stone-800 font-semibold leading-relaxed">
          {lang === 'hi' ? risk.nextActionHindi : risk.nextAction}
        </p>
        <p className="mt-1 text-[11px] text-stone-500 font-medium">
          {lang === 'hi' ? 'रेफरल स्वास्थ्य केंद्र: ' : 'Recommended Facility: '}
          <strong className="text-stone-800">{risk.facility}</strong>
        </p>
      </div>

      {/* Emergency Call Shortcuts if RED or AMBER */}
      {(risk.level === 'RED' || risk.level === 'AMBER') && (
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-stone-200/60">
          <span className="text-[11px] font-bold text-stone-600 mr-1">
            {lang === 'hi' ? 'त्वरित सहायता कॉल:' : 'Quick Emergency Calls:'}
          </span>

          {risk.level === 'RED' && (
            <a
              href={`tel:${profile.ambulance108}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow transition"
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? '108 एम्बुलेंस' : 'Call 108 Ambulance'}</span>
            </a>
          )}

          <a
            href={`tel:${profile.anmPhone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium shadow-xs transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-rose-300" />
            <span>{lang === 'hi' ? `ANM रीता दीदी (${profile.anmPhone})` : `ANM Rita (${profile.anmPhone})`}</span>
          </a>

          <a
            href={`tel:${profile.moicPhone}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 text-xs font-medium shadow-xs transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-stone-600" />
            <span>{lang === 'hi' ? `PHC डॉक्टर शर्मा (${profile.moicPhone})` : `Dr. Sharma (${profile.moicPhone})`}</span>
          </a>
        </div>
      )}
    </div>
  );
};
