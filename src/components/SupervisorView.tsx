import React from 'react';
import {
  Building2,
  Users,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  PhoneCall,
  Activity,
  Ambulance,
  Calendar,
  CheckCheck,
  ShieldCheck,
} from 'lucide-react';
import { VisitRecord, ASHAProfile } from '../types';

interface SupervisorViewProps {
  visits: VisitRecord[];
  profile: ASHAProfile;
  lang: 'hi' | 'en';
}

export const SupervisorView: React.FC<SupervisorViewProps> = ({
  visits,
  profile,
  lang,
}) => {
  const highRiskCases = visits.filter((v) => v.risk.level === 'RED');
  const moderateCases = visits.filter((v) => v.risk.level === 'AMBER');

  return (
    <div className="space-y-4">
      {/* Supervisor Header */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 border border-stone-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-rose-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'hi' ? 'पर्यवेक्षक डैशबोर्ड (PHC / ANM पोर्टल)' : 'PHC Supervisor & ANM Portal'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-900 text-rose-200 border border-rose-700">
                {lang === 'hi' ? 'पिपराइच ब्लॉक' : 'Pipraich Block'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {lang === 'hi'
                ? `प्रभारी चिकित्सा अधिकारी: ${profile.moicDoctor} • पर्यवेक्षक: ${profile.anmName}`
                : `Medical Officer: ${profile.moicDoctor} • ANM: ${profile.anmName}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${profile.anmPhone}`}
            className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-stone-700"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'hi' ? 'ANM रीता को कॉल करें' : 'Call ANM Rita'}</span>
          </a>
        </div>
      </div>

      {/* Village Health Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            {lang === 'hi' ? 'गांव रामपुर आबादी' : 'Village Population'}
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {profile.populationCovered}
          </span>
          <span className="text-[11px] text-stone-500 block">{profile.households} {lang === 'hi' ? 'परिवार' : 'Households'}</span>
        </div>

        <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block flex items-center justify-between">
            <span>{lang === 'hi' ? 'रेफरल योग्य HRP' : 'Urgent HRP Cases'}</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </span>
          <span className="text-2xl font-black text-rose-900 mt-1 block">
            {highRiskCases.length}
          </span>
          <span className="text-[11px] text-rose-700 font-semibold block">
            {lang === 'hi' ? '108 एम्बुलेंस अलर्ट' : '108 Ambulance Alerts'}
          </span>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            {lang === 'hi' ? 'निगरानी में मध्यम जोखिम' : 'Moderate Monitoring'}
          </span>
          <span className="text-2xl font-black text-amber-950 mt-1 block">
            {moderateCases.length}
          </span>
          <span className="text-[11px] text-amber-800 block">{lang === 'hi' ? 'एएनएम गृह भ्रमण आवश्यक' : 'ANM Home Check Needed'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            {lang === 'hi' ? 'आशा कार्यकत्री' : 'Field Worker'}
          </span>
          <span className="text-sm font-bold text-stone-900 mt-1 block truncate">
            {profile.name}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold block flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'सक्रिय व सत्यापित' : 'Active & Verified'}</span>
          </span>
        </div>
      </div>

      {/* Urgent High-Risk Registry */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-rose-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-300" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {lang === 'hi'
                ? 'तत्काल कार्रवाई योग्य उच्च जोखिम सूची (Active Red Triage)'
                : 'Emergency High-Risk Pregnancies Needing Hospital Care'}
            </span>
          </div>
          <span className="text-xs text-rose-200 font-medium">
            {highRiskCases.length} {lang === 'hi' ? 'मरीज' : 'Patients'}
          </span>
        </div>

        <div className="divide-y divide-stone-200">
          {highRiskCases.map((rec) => (
            <div key={rec.id} className="p-4 sm:p-5 hover:bg-stone-50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-stone-900">
                    {rec.beneficiaryName}
                  </span>
                  <span className="px-2 py-0.5 rounded font-extrabold uppercase bg-rose-100 text-rose-800 text-[10px]">
                    {rec.category} ({rec.age}y)
                  </span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-600 font-medium">{rec.villageArea}</span>
                </div>

                <div className="text-stone-800 font-medium">
                  {rec.systolicBP && <span>BP: <strong className="text-rose-700">{rec.systolicBP}/{rec.diastolicBP} mmHg</strong> • </span>}
                  {rec.hemoglobin && <span>Hb: <strong className="text-rose-700">{rec.hemoglobin} g/dL</strong> • </span>}
                  <span>{rec.risk.reasons.join(', ')}</span>
                </div>

                <div className="text-stone-500 italic">
                  <strong>{lang === 'hi' ? 'आशा की कार्रवाई: ' : 'ASHA Action: '}</strong>
                  <span>{rec.risk.nextAction}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${rec.contactNumber}`}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-semibold"
                >
                  {lang === 'hi' ? 'मरीज को कॉल करें' : 'Call Patient'}
                </a>

                <a
                  href={`tel:${profile.ambulance108}`}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1 shadow-xs"
                >
                  <Ambulance className="w-3.5 h-3.5" />
                  <span>108</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
