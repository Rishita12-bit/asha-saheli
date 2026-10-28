import { RiskEvaluation, RiskLevel, BeneficiaryCategory } from '../types';

export interface ClinicalParameters {
  category: BeneficiaryCategory;
  age?: number | null;
  gestationalMonths?: number | null;
  gestationalWeeks?: number | null;
  systolicBP?: number | null;
  diastolicBP?: number | null;
  hemoglobin?: number | null;
  weightKg?: number | null;
  symptoms: string[];
  previousComplications?: string[];
  missedVisitsCount?: number;
}

export function evaluateClinicalRisk(params: ClinicalParameters): RiskEvaluation {
  const redReasonsEn: string[] = [];
  const redReasonsHi: string[] = [];
  const amberReasonsEn: string[] = [];
  const amberReasonsHi: string[] = [];

  const symLower = params.symptoms.map((s) => s.toLowerCase());
  const hasSymptom = (...keywords: string[]) =>
    symLower.some((s) => keywords.some((k) => s.includes(k)));

  // 1. Blood Pressure Rules (Pre-eclampsia / Eclampsia Protocol)
  if (params.systolicBP || params.diastolicBP) {
    const sys = params.systolicBP || 0;
    const dia = params.diastolicBP || 0;

    if (sys >= 160 || dia >= 110) {
      redReasonsEn.push(`Severe Hypertensive Crisis (${sys}/${dia} mmHg) - high risk of eclampsia/stroke`);
      redReasonsHi.push(`अत्यधिक गंभीर उच्च रक्तचाप (${sys}/${dia} mmHg) - झटके (दौरे) और एक्लेम्पसिया का अति गंभीर खतरा`);
    } else if (sys >= 140 || dia >= 90) {
      redReasonsEn.push(`High Blood Pressure (${sys}/${dia} mmHg) indicating Pre-eclampsia`);
      redReasonsHi.push(`उच्च रक्तचाप (${sys}/${dia} mmHg) - प्री-एक्लेम्पसिया का स्पष्ट लक्षण`);
    } else if ((sys >= 130 && sys < 140) || (dia >= 85 && dia < 90)) {
      amberReasonsEn.push(`Pre-hypertension (${sys}/${dia} mmHg) - needs re-check in 48 hours`);
      amberReasonsHi.push(`रक्तचाप सामान्य से अधिक (${sys}/${dia} mmHg) - 48 घंटे में पुनः जांच आवश्यक`);
    }
  }

  // 2. Hemoglobin / Severe Anemia Rules (MoHFW Anemia Mukt Bharat guidelines)
  if (params.hemoglobin !== undefined && params.hemoglobin !== null) {
    const hb = params.hemoglobin;
    if (hb < 7.0) {
      redReasonsEn.push(`Severe Anemia (Hb: ${hb} g/dL < 7.0) - risk of cardiac failure & postpartum hemorrhage`);
      redReasonsHi.push(`गंभीर रक्ताल्पता/एनीमिया (Hb: ${hb} g/dL) - तत्काल खून चढ़ाने (Blood Transfusion) या IV आयरन की जरूरत`);
    } else if (hb >= 7.0 && hb < 10.0) {
      amberReasonsEn.push(`Moderate Anemia (Hb: ${hb} g/dL) - requires double dose IFA and therapeutic diet`);
      amberReasonsHi.push(`मध्यम रक्ताल्पता (Hb: ${hb} g/dL) - दोगुनी आयरन-फोलिक गोली (IFA) और पौष्टिक आहार आवश्यक`);
    } else if (hb >= 10.0 && hb < 11.0 && params.category === 'ANC') {
      amberReasonsEn.push(`Mild Anemia (Hb: ${hb} g/dL) - regular IFA compliance check`);
      amberReasonsHi.push(`हल्की रक्ताल्पता (Hb: ${hb} g/dL) - नियमित आयरन गोली का सेवन सुनिश्चित करें`);
    }
  }

  // 3. Maternal Danger Signs (Pregnancy & Postpartum)
  if (params.category === 'ANC' || params.category === 'PNC') {
    // Vaginal bleeding
    if (hasSymptom('bleeding', 'रक्त', 'खून', 'spotting', 'discharge blood')) {
      redReasonsEn.push('Vaginal Bleeding detected - danger sign of Antepartum/Postpartum Hemorrhage');
      redReasonsHi.push('योनि से रक्तस्राव - तत्काल आपातकालीन खतरा (रक्तस्राव)');
    }

    // Neurological symptoms (Impending eclampsia)
    if (hasSymptom('headache', 'सिरदर्द', 'vision', 'धुंधला', 'convulsion', 'दौरा', 'चक्कर')) {
      if ((params.systolicBP && params.systolicBP >= 140) || hasSymptom('convulsion', 'दौरा')) {
        redReasonsEn.push('Severe headache / visual disturbances with elevated BP - Impending Eclampsia');
        redReasonsHi.push('तेज सिरदर्द और नजर का धुंधलापन - दौरे आने (एक्लेम्पसिया) की गंभीर चेतावनी');
      } else {
        amberReasonsEn.push('Persistent headache or dizziness reported');
        amberReasonsHi.push('लगातार तेज सिरदर्द या चक्कर आना');
      }
    }

    // Edema / Swelling
    if (hasSymptom('swelling', 'सूजन', 'edema', 'feet', 'face')) {
      if (params.systolicBP && params.systolicBP >= 140) {
        // Already escalated by BP, but add note
        redReasonsEn.push('Swelling in feet/face combined with hypertension');
        redReasonsHi.push('उच्च रक्तचाप के साथ चेहरे और पैरों में तीव्र सूजन');
      } else {
        amberReasonsEn.push('Swelling in feet or puffy face - monitor BP closely for pre-eclampsia');
        amberReasonsHi.push('पैरों या चेहरे पर सूजन - प्री-एक्लेम्पसिया की संभावना, रक्तचाप की निरंतर निगरानी');
      }
    }

    // High fever & sepsis signs
    if (hasSymptom('fever', 'बुखार', 'chills', 'कांपना', 'temperature')) {
      redReasonsEn.push('High Fever with chills - risk of malaria, urinary tract infection, or maternal sepsis');
      redReasonsHi.push('तेज बुखार व ठंड लगना - संक्रमण (सेप्सिस) या मलेरिया का खतरा');
    }

    // Decreased fetal movements
    if (hasSymptom('movement', 'हलचल', 'fetal', 'slow')) {
      redReasonsEn.push('Decreased or absent fetal movements in 3rd trimester');
      redReasonsHi.push('गर्भ में शिशु की हलचल कम होना या न महसूस होना - तत्काल अल्ट्रासाउंड/जांच जरूरी');
    }

    // Age risk factors
    if (params.age) {
      if (params.age < 18) {
        redReasonsEn.push(`Adolescent pregnancy (Age ${params.age} years) - high obstetric risk`);
        redReasonsHi.push(`किशोरी गर्भावस्था (उम्र ${params.age} वर्ष) - अपरिपक्व शरीर व उच्च जोखिम प्रसव`);
      } else if (params.age >= 35) {
        amberReasonsEn.push(`Advanced maternal age (${params.age} years) - higher risk of gestational diabetes & hypertension`);
        amberReasonsHi.push(`अधिक आयु गर्भावस्था (${params.age} वर्ष) - उच्च रक्तचाप व शुगर की नियमित जांच`);
      }
    }

    // Missed visits
    if (params.missedVisitsCount && params.missedVisitsCount >= 2) {
      amberReasonsEn.push(`Missed ${params.missedVisitsCount} consecutive scheduled ANC checkups`);
      amberReasonsHi.push(`लगातार ${params.missedVisitsCount} एएनसी (ANC) जांच छूट गई हैं`);
    }
  }

  // 4. Newborn Specific Rules (HBNC - Home Based Newborn Care)
  if (params.category === 'NEWBORN') {
    if (hasSymptom('not feeding', 'दूध नहीं', 'weak suck', 'lethargic', 'सुस्त', 'no feed')) {
      redReasonsEn.push('Newborn unable to breastfeed or lethargic - primary sign of neonatal sepsis');
      redReasonsHi.push('नवजात शिशु मां का दूध नहीं पी पा रहा या अत्यधिक सुस्त है - नवजात संक्रमण का संकेत');
    }
    if (hasSymptom('breathing', 'सांस', 'chest', 'पसली', 'grunting')) {
      redReasonsEn.push('Fast breathing or chest indrawing - acute respiratory infection / pneumonia');
      redReasonsHi.push('तेज सांस चलना या छाती/पसली धंसना - निमोनिया का गंभीर लक्षण');
    }
    if (hasSymptom('jaundice', 'पीलिया', 'yellow')) {
      redReasonsEn.push('Severe neonatal jaundice noted (yellow palms/soles)');
      redReasonsHi.push('नवजात में पीलिया (आंखें या हथेलियां पीली होना) - फोटोथेरेपी की आवश्यकता');
    }
    if (params.weightKg && params.weightKg < 2.0) {
      redReasonsEn.push(`Very Low Birth Weight (${params.weightKg} kg < 2.0 kg) - SNCU admission required`);
      redReasonsHi.push(`अति कम जन्म वजन (${params.weightKg} kg) - SNCU (शिशु गहन चिकित्सा) में भर्ती आवश्यक`);
    } else if (params.weightKg && params.weightKg >= 2.0 && params.weightKg < 2.5) {
      amberReasonsEn.push(`Low Birth Weight (${params.weightKg} kg) - requires intensive Kangaroo Mother Care (KMC)`);
      amberReasonsHi.push(`कम जन्म वजन (${params.weightKg} kg) - लगातार कंगारू मदर केयर (KMC) व गर्माहट`);
    }
  }

  // 5. Adolescent Specific Rules (RKSK)
  if (params.category === 'ADOLESCENT') {
    if (hasSymptom('severe pain', 'दर्द', 'menstrual', 'fainting', 'चक्कर')) {
      amberReasonsEn.push('Severe dysmenorrhea / menstrual distress with dizziness');
      amberReasonsHi.push('माहवारी में अत्यधिक दर्द या चक्कर - RKSK परामर्श और चिकित्सीय सलाह');
    }
  }

  // Determine final triage level
  if (redReasonsEn.length > 0) {
    return {
      level: 'RED',
      title: 'HIGH RISK ALERT (उच्च जोखिम)',
      titleHindi: 'उच्च जोखिम - तत्काल रेफरल आवश्यक',
      reasons: redReasonsEn,
      reasonsHindi: redReasonsHi,
      nextAction: 'Immediate Referral to PHC Pipraich / District Hospital Gorakhpur. Call 108 Ambulance right now. Accompany the patient with MCP card.',
      nextActionHindi: 'आज ही 108 एम्बुलेंस बुलाकर PHC पिपराइच / जिला अस्पताल रेफर करें। आशा दीदी स्वयं एमसीपी कार्ड के साथ जाएं। ANM रीता दीदी को तत्काल सूचित करें।',
      urgentReferral: true,
      facility: 'PHC Pipraich / BRD Medical College Gorakhpur',
    };
  }

  if (amberReasonsEn.length > 0) {
    return {
      level: 'AMBER',
      title: 'MODERATE RISK (मध्यम जोखिम - निगरानी)',
      titleHindi: 'मध्यम जोखिम - विशेष निगरानी व एएनएम परामर्श',
      reasons: amberReasonsEn,
      reasonsHindi: amberReasonsHi,
      nextAction: 'Schedule priority ANM home visit within 48 hours. Provide double IFA tablets, diet counseling, and re-check BP in 3 days.',
      nextActionHindi: '48 घंटे के भीतर एएनएम दीदी से गृह भ्रमण करवाएं। आयरन की अतिरिक्त गोलियां दें, पोषण परामर्श दें और 3 दिन बाद पुनः बीपी मापें।',
      urgentReferral: false,
      facility: 'Sub-Centre Pipraich (ANM Rita)',
    };
  }

  return {
    level: 'GREEN',
    title: 'NORMAL ROUTINE CARE (सामान्य स्थिति)',
    titleHindi: 'सामान्य स्थिति - नियमित देखभाल जारी रखें',
    reasons: ['All vital parameters and symptoms within standard healthy limits.'],
    reasonsHindi: ['सभी जांच व स्वास्थ्य संकेत सामान्य सीमा में हैं।'],
    nextAction: 'Continue daily IFA tablet, balanced diet, rest, and ensure attendance at upcoming Village Health & Nutrition Day (VHND).',
    nextActionHindi: 'रोजाना एक आयरन-फोलिक गोली व कैल्शियम लें, संतुलित भोजन करें, और अगले ग्राम स्वास्थ्य एवं पोषण दिवस (VHND) पर आएं।',
    urgentReferral: false,
    facility: 'Village Anganwadi / Sub-Centre Pipraich',
  };
}
