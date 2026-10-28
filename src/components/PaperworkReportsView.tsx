import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Table,
  CheckCircle,
  AlertCircle,
  Coins,
  ShieldCheck,
  Building,
  UserCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { VisitRecord, ASHAProfile } from '../types';
import {
  computeMonthlyStats,
  generateOfficialPDFReport,
  generateCSVReport,
  downloadCSV,
} from '../utils/reportGenerator';

interface PaperworkReportsViewProps {
  visits: VisitRecord[];
  profile: ASHAProfile;
  lang: 'hi' | 'en';
}

export const PaperworkReportsView: React.FC<PaperworkReportsViewProps> = ({
  visits,
  profile,
  lang,
}) => {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number>(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const stats = computeMonthlyStats(visits, selectedMonthOffset);

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    try {
      generateOfficialPDFReport(profile, visits);
    } catch (err) {
      console.error('PDF error:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadCSV = () => {
    const csv = generateCSVReport(visits, profile);
    downloadCSV(
      `ASHA_Register_${profile.village}_${stats.monthName}_${stats.year}.csv`,
      csv
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Header & Action Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {lang === 'hi' ? 'मासिक प्रगति रिपोर्ट व फॉर्म 6' : 'Monthly Progress Report (Form 6)'}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {lang === 'hi' ? 'स्वतः तैयार' : 'Auto-Generated'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {lang === 'hi'
              ? 'राष्ट्रीय स्वास्थ्य मिशन (NHM) मानक प्रपत्र • पीएचसी व उप-केंद्र को जमा करने योग्य'
              : 'Official NHM Maternal & Child Health Reporting Format for Gorakhpur Division'}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PDF Download Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition"
            title="Download official vector PDF report formatted for Sub-Centre submission"
          >
            <Download className="w-4 h-4 text-rose-200" />
            <span>
              {isGeneratingPDF
                ? lang === 'hi'
                  ? 'पीडीएफ बन रहा है...'
                  : 'Generating...'
                : lang === 'hi'
                ? 'सरकारी फॉर्म 6 PDF डाउनलोड'
                : 'Download Form 6 PDF'}
            </span>
          </button>

          {/* CSV / Excel Button */}
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition"
            title="Export complete visit register as Excel-compatible CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'hi' ? 'एक्सेल/CSV एक्सपोर्ट' : 'Export Excel/CSV'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 text-xs shadow-xs transition"
            title="Print report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Selector Tabs */}
      <div className="flex items-center gap-2 bg-stone-200/70 p-1 rounded-xl w-fit">
        <button
          onClick={() => setSelectedMonthOffset(0)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedMonthOffset === 0 ? 'bg-white text-rose-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {lang === 'hi' ? 'चालू माह (Current Month)' : 'Current Month'}
        </button>
        <button
          onClick={() => setSelectedMonthOffset(1)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            selectedMonthOffset === 1 ? 'bg-white text-rose-950 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {lang === 'hi' ? 'पिछला माह (Previous Month)' : 'Previous Month'}
        </button>
      </div>

      {/* Sunita's Estimated Incentive Banner */}
      <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md border border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
            <Coins className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-200 block">
              {lang === 'hi' ? 'सुनीता दीदी का मासिक प्रोत्साहन दावा (NHM ASHA Incentive):' : 'Estimated Monthly Performance Incentive:'}
            </span>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>₹{stats.estimatedIncentiveINR.toLocaleString('en-IN')}</span>
              <span className="text-xs font-medium text-emerald-200 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-400/30">
                {lang === 'hi' ? 'PFMS भुगतान हेतु तैयार' : 'Ready for PFMS Approval'}
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              {lang === 'hi'
                ? `एएनसी ट्रैकिंग (${stats.totalRegisteredANC}), प्रसव उपरांत भ्रमण (${stats.pncVisitsCount}), नवजात HBNC (${stats.newbornVisitsCount}), एवं उच्च जोखिम रेफरल के आधार पर`
                : `Computed per NHM norms for ANC tracking, HBNC visits, and high-risk case accompaniment.`}
            </p>
          </div>
        </div>

        <div className="text-xs text-emerald-200 bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-700/40 w-full sm:w-auto">
          <div>
            <strong>{lang === 'hi' ? 'सत्यापन अधिकारी: ' : 'Supervising ANM: '}</strong>
            <span>{profile.anmName}</span>
          </div>
          <div className="mt-0.5">
            <strong>{lang === 'hi' ? 'उप-केंद्र: ' : 'Sub-Centre: '}</strong>
            <span>{profile.subCentre}</span>
          </div>
        </div>
      </div>

      {/* KPI Indicator Tiles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total ANC */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            {lang === 'hi' ? 'सक्रिय गर्भवती महिलाएं' : 'Active ANC Tracked'}
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {stats.totalRegisteredANC}
          </span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">
            {lang === 'hi' ? 'लक्ष्य: शत-प्रतिशत संस्थागत प्रसव' : 'Target: 100% Institutional'}
          </span>
        </div>

        {/* Metric 2: High Risk Pregnancies */}
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 block flex items-center justify-between">
            <span>{lang === 'hi' ? 'उच्च जोखिम गर्भावस्था (HRP)' : 'High Risk Pregnancies'}</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
          </span>
          <span className="text-2xl font-black text-rose-900 mt-1 block">
            {stats.highRiskPregnancies}
          </span>
          <span className="text-[11px] text-rose-700 font-semibold mt-0.5 block">
            {lang === 'hi' ? 'लाल चेतावनी (तत्काल रेफरल)' : 'Immediate CHC/PHC Action'}
          </span>
        </div>

        {/* Metric 3: Severe Anemia */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            {lang === 'hi' ? 'गंभीर एनीमिया (Hb < 7)' : 'Severe Anemia (Hb < 7)'}
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {stats.severeAnemiaCount}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            {lang === 'hi' ? 'IV आयरन सुक्रोज डोज दी गई' : 'IV Iron protocol initiated'}
          </span>
        </div>

        {/* Metric 4: Pre-eclampsia */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            {lang === 'hi' ? 'प्री-एक्लेम्पसिया (BP ≥ 140/90)' : 'Pre-eclampsia (High BP)'}
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {stats.preEclampsiaCount}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            {lang === 'hi' ? 'निरंतर निगरानी व मैग्नीशियम सल्फेट' : 'Close BP tracking'}
          </span>
        </div>

        {/* Metric 5: HBNC Visits */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            {lang === 'hi' ? 'नवजात गृह भ्रमण (HBNC)' : 'Newborn HBNC Visits'}
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {stats.newbornVisitsCount}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            {lang === 'hi' ? 'दिन 1, 3, 7, 14, 21, 28, 42' : 'Protocol 7 home visits'}
          </span>
        </div>

        {/* Metric 6: Adolescent Girls */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            {lang === 'hi' ? 'किशोरी स्वास्थ्य (RKSK)' : 'Adolescent Girls (RKSK)'}
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {stats.adolescentGirlsReached}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            {lang === 'hi' ? 'नीली IFA व सेनेटरी पैड वितरण' : 'WIFS Blue + Menstrual health'}
          </span>
        </div>

        {/* Metric 7: IFA Tablets Distributed */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            {lang === 'hi' ? 'वितरित IFA लाल गोलियां' : 'IFA Tablets Distributed'}
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {stats.ifaTabletsDistributed}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            {lang === 'hi' ? 'एनीमिया मुक्त भारत' : 'Anemia Mukt Bharat'}
          </span>
        </div>

        {/* Metric 8: Emergency Referrals */}
        <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            {lang === 'hi' ? '108 आपातकालीन रेफरल' : '108 Emergency Referrals'}
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {stats.urgentReferralsCompleted}
          </span>
          <span className="text-[11px] text-stone-500 mt-0.5 block">
            {lang === 'hi' ? 'शून्य देरी रेफरल' : 'Zero Delay accompanied'}
          </span>
        </div>
      </div>

      {/* Official Form 6 Table Preview */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="bg-stone-100/80 px-4 py-3 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-stone-600" />
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">
              {lang === 'hi'
                ? 'मासिक रजिस्टर सारांश प्रपत्र (Official Register Format)'
                : 'RCH Register Format & Indicator Tallies'}
            </span>
          </div>
          <span className="text-xs text-stone-500 font-medium">
            {stats.monthName} {stats.year}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">{lang === 'hi' ? 'संकेतक (Indicator)' : 'Indicator Name'}</th>
                <th className="px-4 py-3 text-center">{lang === 'hi' ? 'मासिक संख्या' : 'Monthly Count'}</th>
                <th className="px-4 py-3">{lang === 'hi' ? 'प्रोटोकॉल / मानक टिप्पणी' : 'Normative Protocol'}</th>
                <th className="px-4 py-3">{lang === 'hi' ? 'सत्यापन स्थिति' : 'Verification Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-medium text-stone-800">
              <tr>
                <td className="px-4 py-3 text-stone-400 font-bold">1</td>
                <td className="px-4 py-3 font-semibold">{lang === 'hi' ? 'पंजीकृत गर्भवती महिलाएं (ANC)' : 'Registered Pregnant Women (ANC)'}</td>
                <td className="px-4 py-3 text-center font-bold text-stone-900">{stats.totalRegisteredANC}</td>
                <td className="px-4 py-3 text-stone-600">{lang === 'hi' ? 'प्रथम त्रैमासिक में पंजीकरण व 4 जांच' : '1st Trimester Reg. & 4 Visits'}</td>
                <td className="px-4 py-3 text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'सत्यापित' : 'Verified'}</span>
                </td>
              </tr>

              <tr className="bg-rose-50/50">
                <td className="px-4 py-3 text-rose-500 font-bold">2</td>
                <td className="px-4 py-3 font-bold text-rose-950">
                  {lang === 'hi' ? 'उच्च जोखिम गर्भावस्था (HRP) चिन्हित' : 'High Risk Pregnancies (HRP) Flagged'}
                </td>
                <td className="px-4 py-3 text-center font-black text-rose-900">{stats.highRiskPregnancies}</td>
                <td className="px-4 py-3 text-rose-800">{lang === 'hi' ? 'बीपी 150/100, एनीमिया Hb < 7, रक्तस्राव' : 'BP ≥ 140/90, Hb < 7, Bleeding'}</td>
                <td className="px-4 py-3 text-rose-700 font-bold">
                  {lang === 'hi' ? '108 रेफरल पूरा' : 'Referred to PHC'}
                </td>
              </tr>

              <tr>
                <td className="px-4 py-3 text-stone-400 font-bold">3</td>
                <td className="px-4 py-3 font-semibold">{lang === 'hi' ? 'मध्यम जोखिम महिलाएं (AMBER)' : 'Moderate Risk Cases (AMBER)'}</td>
                <td className="px-4 py-3 text-center font-bold text-stone-900">{stats.moderateRiskCases}</td>
                <td className="px-4 py-3 text-stone-600">{lang === 'hi' ? 'अतिरिक्त IFA खुराक व ANM गृह भ्रमण' : 'Double IFA + ANM 48h Home Visit'}</td>
                <td className="px-4 py-3 text-amber-700 font-bold">{lang === 'hi' ? 'निगरानी में' : 'Under Monitoring'}</td>
              </tr>

              <tr>
                <td className="px-4 py-3 text-stone-400 font-bold">4</td>
                <td className="px-4 py-3 font-semibold">{lang === 'hi' ? 'प्रसव पश्चात फॉलोअप (PNC)' : 'Postpartum Follow-up (PNC)'}</td>
                <td className="px-4 py-3 text-center font-bold text-stone-900">{stats.pncVisitsCount}</td>
                <td className="px-4 py-3 text-stone-600">{lang === 'hi' ? '48 घंटे एवं 7 दिन के भीतर' : 'Within 48h & 7 days'}</td>
                <td className="px-4 py-3 text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'पूर्ण' : 'Completed'}</span>
                </td>
              </tr>

              <tr>
                <td className="px-4 py-3 text-stone-400 font-bold">5</td>
                <td className="px-4 py-3 font-semibold">{lang === 'hi' ? 'नवजात शिशु गृह भ्रमण (HBNC)' : 'Newborn Home Visits (HBNC)'}</td>
                <td className="px-4 py-3 text-center font-bold text-stone-900">{stats.newbornVisitsCount}</td>
                <td className="px-4 py-3 text-stone-600">{lang === 'hi' ? 'खतरे के संकेत, स्तनपान, तापमान जांच' : 'Danger signs, suckling, warmth'}</td>
                <td className="px-4 py-3 text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'पूर्ण' : 'Completed'}</span>
                </td>
              </tr>

              <tr>
                <td className="px-4 py-3 text-stone-400 font-bold">6</td>
                <td className="px-4 py-3 font-semibold">{lang === 'hi' ? 'किशोरी स्वास्थ्य (RKSK WIFS)' : 'Adolescent WIFS Blue IFA'}</td>
                <td className="px-4 py-3 text-center font-bold text-stone-900">{stats.adolescentGirlsReached}</td>
                <td className="px-4 py-3 text-stone-600">{lang === 'hi' ? 'साप्ताहिक नीली आयरन गोली व परामर्श' : 'Weekly Blue IFA + Counseling'}</td>
                <td className="px-4 py-3 text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{lang === 'hi' ? 'पूर्ण' : 'Completed'}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
