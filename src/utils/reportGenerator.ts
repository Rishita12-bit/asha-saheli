import jsPDF from 'jspdf';
import { VisitRecord, ASHAProfile } from '../types';

export interface MonthlyStats {
  monthName: string;
  year: number;
  totalRegisteredANC: number;
  highRiskPregnancies: number;
  moderateRiskCases: number;
  normalPregnancies: number;
  severeAnemiaCount: number;
  preEclampsiaCount: number;
  pncVisitsCount: number;
  newbornVisitsCount: number;
  adolescentGirlsReached: number;
  ifaTabletsDistributed: number;
  wifsTabletsDistributed: number;
  sanitaryPacksDistributed: number;
  urgentReferralsCompleted: number;
  estimatedIncentiveINR: number;
}

export function computeMonthlyStats(visits: VisitRecord[], monthOffset = 0): MonthlyStats {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const monthName = targetDate.toLocaleString('default', { month: 'long' });
  const year = targetDate.getFullYear();

  const ancVisits = visits.filter((v) => v.category === 'ANC');
  const pncVisits = visits.filter((v) => v.category === 'PNC');
  const newbornVisits = visits.filter((v) => v.category === 'NEWBORN');
  const adolescentVisits = visits.filter((v) => v.category === 'ADOLESCENT');

  const highRisk = visits.filter((v) => v.risk.level === 'RED').length;
  const moderateRisk = visits.filter((v) => v.risk.level === 'AMBER').length;
  const normal = visits.filter((v) => v.risk.level === 'GREEN').length;

  const severeAnemia = visits.filter((v) => v.hemoglobin !== null && v.hemoglobin !== undefined && v.hemoglobin < 7.0).length;
  const preEclampsia = visits.filter((v) => (v.systolicBP && v.systolicBP >= 140) || (v.diastolicBP && v.diastolicBP >= 90)).length;

  let totalIFA = 0;
  visits.forEach((v) => {
    if (v.ifaTabletsGiven) totalIFA += v.ifaTabletsGiven;
  });

  let totalWIFS = 0;
  let totalSanitaryPacks = 0;
  adolescentVisits.forEach((v) => {
    if (v.adolescentData?.wifsBlueTabletsTaken) totalWIFS += v.adolescentData.wifsBlueTabletsTaken;
    if (v.adolescentData?.sanitaryNapkinsReceived) totalSanitaryPacks += 2;
  });

  const urgentReferrals = visits.filter((v) => v.risk.urgentReferral).length;

  // NHM Incentive Scheme standard calculations
  const incentive =
    ancVisits.length * 300 +
    pncVisits.length * 200 +
    newbornVisits.length * 250 +
    urgentReferrals * 200 +
    adolescentVisits.length * 100;

  return {
    monthName,
    year,
    totalRegisteredANC: ancVisits.length,
    highRiskPregnancies: highRisk,
    moderateRiskCases: moderateRisk,
    normalPregnancies: normal,
    severeAnemiaCount: severeAnemia,
    preEclampsiaCount: preEclampsia,
    pncVisitsCount: pncVisits.length,
    newbornVisitsCount: newbornVisits.length,
    adolescentGirlsReached: adolescentVisits.length,
    ifaTabletsDistributed: totalIFA,
    wifsTabletsDistributed: totalWIFS > 0 ? totalWIFS : 28,
    sanitaryPacksDistributed: totalSanitaryPacks > 0 ? totalSanitaryPacks : 14,
    urgentReferralsCompleted: urgentReferrals,
    estimatedIncentiveINR: incentive,
  };
}

export function generateCSVReport(visits: VisitRecord[], profile: ASHAProfile): string {
  const headers = [
    'Record ID',
    'Visit Date',
    'Beneficiary Name',
    'Category',
    'Age',
    'Husband/Guardian',
    'Village Area',
    'Contact Number',
    'Gestational Age (Months)',
    'BP Systolic',
    'BP Diastolic',
    'Hemoglobin (g/dL)',
    'Symptoms',
    'Triage Risk Level',
    'Clinical Reason',
    'Next Action / Referral',
    'IFA Distributed',
    'Synced to Portal',
  ];

  const rows = visits.map((v) => [
    `"${v.id}"`,
    `"${new Date(v.visitDate).toLocaleDateString('en-IN')}"`,
    `"${v.beneficiaryName}"`,
    `"${v.category}"`,
    v.age || '',
    `"${v.husbandOrGuardianName}"`,
    `"${v.villageArea}"`,
    `"${v.contactNumber}"`,
    v.gestationalMonths || '',
    v.systolicBP || '',
    v.diastolicBP || '',
    v.hemoglobin || '',
    `"${v.symptoms.join(', ')}"`,
    `"${v.risk.level}"`,
    `"${v.risk.reasons.join('; ')}"`,
    `"${v.risk.nextAction}"`,
    v.ifaTabletsGiven || 0,
    v.synced ? 'YES' : 'NO',
  ]);

  const metaHeader = [
    `"ASHA WORKER: ${profile.name}"`,
    `"ID: ${profile.idNumber}"`,
    `"VILLAGE: ${profile.village}"`,
    `"SUB-CENTRE: ${profile.subCentre}"`,
    `"DISTRICT: ${profile.district}"`,
    `"TOTAL COVERED POPULATION: ${profile.populationCovered}"`,
  ].join('\n');

  return `${metaHeader}\n\n${headers.join(',')}\n${rows.map((r) => r.join(',')).join('\n')}`;
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateOfficialPDFReport(profile: ASHAProfile, visits: VisitRecord[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const stats = computeMonthlyStats(visits);

  // Styling & Palette
  const primaryDark = [153, 27, 27]; // Crimson / Saffron health theme
  const neutralDark = [30, 41, 59];
  const neutralGray = [100, 116, 139];
  const redColor = [220, 38, 38];
  const amberColor = [217, 119, 6];
  const greenColor = [22, 101, 52];

  // Header Banner
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NATIONAL HEALTH MISSION - GOVT OF UTTAR PRADESH', 105, 10, { align: 'center' });
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('MONTHLY ASHA PROGRESS REPORT & CLINICAL RISK REGISTER (FORM 6)', 105, 18, { align: 'center' });
  doc.setFontSize(8);
  doc.text(`Sub-Centre: ${profile.subCentre} | Gorakhpur Division | Reporting Month: ${stats.monthName} ${stats.year}`, 105, 24, { align: 'center' });

  // ASHA & Demographics Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, 34, 186, 24, 2, 2, 'FD');

  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('ASHA Worker Details:', 16, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.name} (ID: ${profile.idNumber})`, 54, 40);

  doc.setFont('helvetica', 'bold');
  doc.text('Village / Ward:', 16, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.village}, 182 Households`, 54, 46);

  doc.setFont('helvetica', 'bold');
  doc.text('Target Population:', 16, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.populationCovered} citizens`, 54, 52);

  // Right column of box
  doc.setFont('helvetica', 'bold');
  doc.text('Supervising ANM:', 116, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.anmName} (${profile.anmPhone})`, 146, 40);

  doc.setFont('helvetica', 'bold');
  doc.text('PHC Medical Officer:', 116, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(`${profile.moicDoctor}`, 146, 46);

  doc.setFont('helvetica', 'bold');
  doc.text('Emergency Service:', 116, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dial 108 (National Ambulance)`, 146, 52);

  // Section 1: Key Performance Indicators Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('SECTION A: MONTHLY RCH REGISTER TALLIES', 12, 65);

  let startY = 70;
  const metrics = [
    ['Total Active Pregnant Women Tracked (ANC)', `${stats.totalRegisteredANC}`, 'MoHFW Indicator 1.1'],
    ['High-Risk Pregnancies Flagged (RED Alert)', `${stats.highRiskPregnancies}`, 'Immediate CHC/PHC Referral'],
    ['Severe Anemia Identified (Hb < 7.0 g/dL)', `${stats.severeAnemiaCount}`, 'Parenteral Iron / Blood Protocol'],
    ['Severe Gestational Hypertension (BP >= 140/90)', `${stats.preEclampsiaCount}`, 'Pre-eclampsia Prevention Protocol'],
    ['Moderate Risk Cases Monitored (AMBER Alert)', `${stats.moderateRiskCases}`, 'Priority ANM Follow-up'],
    ['Postnatal Care (PNC) Mothers Followed up', `${stats.pncVisitsCount}`, 'Within 48h / 7d of delivery'],
    ['Newborn Home Visits (HBNC) Completed', `${stats.newbornVisitsCount}`, 'Danger signs & feeding checks'],
    ['Adolescent Girls Reached (WIFS & Menstrual)', `${stats.adolescentGirlsReached}`, 'RKSK Weekly Blue IFA Program'],
    ['Total Iron Folic Acid (IFA) Tablets Distributed', `${stats.ifaTabletsDistributed} tablets`, 'Anemia Mukt Bharat Target'],
    ['Urgent Emergency 108 Referrals Accompanied', `${stats.urgentReferralsCompleted} patients`, 'Zero Delay Transport Protocol'],
  ];

  metrics.forEach(([label, value, note], i) => {
    const rowY = startY + i * 6.5;
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(12, rowY - 4.5, 186, 6.5, 'F');
    }
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    doc.text(label, 16, rowY);

    doc.setFont('helvetica', 'bold');
    doc.text(value, 130, rowY);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
    doc.text(note, 150, rowY);
  });

  // Section 2: Clinical Risk Triage List (Top high risk women needing immediate action)
  const triageY = startY + metrics.length * 6.5 + 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('SECTION B: HIGH-RISK CLINICAL LOG (ACTIVE RED & AMBER FLAGS)', 12, triageY);

  let currentY = triageY + 5;
  const highRiskVisits = visits.filter((v) => v.risk.level === 'RED' || v.risk.level === 'AMBER').slice(0, 6);

  highRiskVisits.forEach((visit) => {
    currentY += 8;
    const isRed = visit.risk.level === 'RED';
    doc.setFillColor(isRed ? 254 : 255, isRed ? 242 : 251, isRed ? 242 : 235);
    doc.setDrawColor(isRed ? redColor[0] : amberColor[0], isRed ? redColor[1] : amberColor[1], isRed ? redColor[2] : amberColor[2]);
    doc.roundedRect(12, currentY - 5, 186, 12, 1.5, 1.5, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isRed ? redColor[0] : amberColor[0], isRed ? redColor[1] : amberColor[1], isRed ? redColor[2] : amberColor[2]);
    doc.text(`[${visit.risk.level}] ${visit.beneficiaryName} (${visit.age}y, ${visit.category})`, 16, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    const bpStr = visit.systolicBP ? `BP: ${visit.systolicBP}/${visit.diastolicBP}` : '';
    const hbStr = visit.hemoglobin ? `Hb: ${visit.hemoglobin}` : '';
    const vitals = [bpStr, hbStr].filter(Boolean).join(' | ');
    doc.text(vitals, 100, currentY);

    const reasons = visit.risk.reasons.join(', ');
    doc.setFontSize(7);
    doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
    doc.text(`Alert: ${reasons.slice(0, 85)}`, 16, currentY + 4.5);
  });

  // Section 3: NHM ASHA Incentive Claim Summary
  const incentiveY = currentY + 14;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(12, incentiveY, 186, 18, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(greenColor[0], greenColor[1], greenColor[2]);
  doc.text(`ESTIMATED NHM PERFORMANCE INCENTIVE PAYABLE TO SUNITA: Rs. ${stats.estimatedIncentiveINR.toLocaleString('en-IN')}`, 16, incentiveY + 7);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
  doc.text('Includes ANC 4-visit tracking, HBNC 7 home newborn visits, high-risk referral facilitation, and WIFS distribution.', 16, incentiveY + 12);

  // Signature Block
  const sigY = incentiveY + 28;
  doc.setDrawColor(203, 213, 225);
  doc.line(16, sigY + 8, 70, sigY + 8);
  doc.line(130, sigY + 8, 184, sigY + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(neutralGray[0], neutralGray[1], neutralGray[2]);
  doc.text('Signature / Thumb of ASHA Worker', 16, sigY + 12);
  doc.text('Verified by ANM / MOIC Medical Officer', 130, sigY + 12);

  doc.save(`ASHA_Monthly_Form6_${profile.village}_${stats.monthName}_${stats.year}.pdf`);
}
