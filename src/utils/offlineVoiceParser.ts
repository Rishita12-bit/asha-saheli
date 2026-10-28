import { BeneficiaryCategory } from '../types';

export interface ExtractedEntities {
  beneficiaryName: string;
  category: BeneficiaryCategory;
  age: number | null;
  gestationalMonths: number | null;
  gestationalWeeks: number | null;
  systolicBP: number | null;
  diastolicBP: number | null;
  hemoglobin: number | null;
  weightKg: number | null;
  symptoms: string[];
  symptomsHindi: string[];
  ifaTabletsGiven: number | null;
  notes: string;
}

// Convert Devanagari numerals (०१२३४५६७८९) to standard ASCII numerals (0-9)
export function normalizeDevanagariNumerals(text: string): string {
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let res = text;
  devanagariDigits.forEach((digit, i) => {
    res = res.replaceAll(digit, i.toString());
  });
  return res;
}

export function parseOfflineVoiceTranscript(rawTranscript: string): ExtractedEntities {
  const normalized = normalizeDevanagariNumerals(rawTranscript);
  const text = normalized.toLowerCase();

  // 1. Blood Pressure: formats like "150/100", "150 / 100", "150 बटा 100", "150 100", "बीपी 140 90"
  let systolicBP: number | null = null;
  let diastolicBP: number | null = null;

  const bpSlashMatch = normalized.match(/(\d{2,3})\s*(?:\/|\s*बटा\s*|\s*by\s*|\s*-\s*)\s*(\d{2,3})/i);
  if (bpSlashMatch) {
    const s = parseInt(bpSlashMatch[1], 10);
    const d = parseInt(bpSlashMatch[2], 10);
    if (s >= 60 && s <= 250 && d >= 30 && d <= 160) {
      systolicBP = s;
      diastolicBP = d;
    }
  } else {
    // Try after "bp" or "बीपी" followed by two numbers
    const bpSpaceMatch = normalized.match(/(?:bp|बीपी|रक्तचाप|ब्लड प्रेशर)\s*(?:है|का|level|:)?\s*(\d{2,3})\s+(\d{2,3})/i);
    if (bpSpaceMatch) {
      const s = parseInt(bpSpaceMatch[1], 10);
      const d = parseInt(bpSpaceMatch[2], 10);
      if (s >= 60 && s <= 250 && d >= 30 && d <= 160) {
        systolicBP = s;
        diastolicBP = d;
      }
    }
  }

  // 2. Gestational age: Months / Weeks
  let gestationalMonths: number | null = null;
  let gestationalWeeks: number | null = null;

  const monthWords: { [key: string]: number } = {
    'पहला': 1, 'दूसरे': 2, 'तीसरा': 3, 'तीसरे': 3, 'चौथा': 4, 'चौथे': 4,
    'पांचवा': 5, 'पांचवे': 5, 'छठा': 6, 'छठे': 6, 'सातवा': 7, 'सातवे': 7,
    'आठवा': 8, 'आठवे': 8, 'नौवां': 9, 'नौवे': 9,
    'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9
  };

  const monthMatch = normalized.match(/(\d+)\s*(?:महीने|महीना|माह|मास|months?|month)/i);
  if (monthMatch) {
    gestationalMonths = parseInt(monthMatch[1], 10);
  } else {
    for (const [w, val] of Object.entries(monthWords)) {
      if (new RegExp(`${w}\\s*(?:महीने|महीना|माह|मास)`, 'i').test(normalized)) {
        gestationalMonths = val;
        break;
      }
    }
  }

  const weekMatch = normalized.match(/(\d+)\s*(?:हफ़्ते|हफ्ते|सप्ताह|weeks?|week)/i);
  if (weekMatch) {
    gestationalWeeks = parseInt(weekMatch[1], 10);
  }

  // If months found but weeks not, estimate weeks = months * 4.3
  if (gestationalMonths && !gestationalWeeks) {
    gestationalWeeks = Math.round(gestationalMonths * 4.3);
  } else if (gestationalWeeks && !gestationalMonths) {
    gestationalMonths = Math.min(9, Math.round(gestationalWeeks / 4.3));
  }

  // 3. Hemoglobin (Hb)
  let hemoglobin: number | null = null;
  const hbMatch =
    normalized.match(/(?:hb|हीमोग्लोबिन|खून|hemoglobin)\s*(?:है|का|level|:)?\s*(\d+(?:\.\d+)?)/i) ||
    normalized.match(/(\d+(?:\.\d+)?)\s*(?:ग्राम|gram|gm|g\/dl)\s*(?:खून|hb|हीमोग्लोबिन)?/i);

  if (hbMatch) {
    const val = parseFloat(hbMatch[1]);
    if (val >= 2 && val <= 18) {
      hemoglobin = val;
    }
  }

  // 4. Age
  let age: number | null = null;
  const ageMatch = normalized.match(/(?:उम्र|age)\s*(?:है|:)?\s*(\d+)/i) ||
                   normalized.match(/(\d+)\s*(?:साल|वर्ष|years?|yr)/i);
  if (ageMatch) {
    const a = parseInt(ageMatch[1], 10);
    if (a >= 0 && a <= 99) {
      age = a;
    }
  }

  // 5. Weight
  let weightKg: number | null = null;
  const weightMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:किलो|kg|किलोग्राम|kilo)/i) ||
                      normalized.match(/(?:वजन|weight)\s*(?:है|:)?\s*(\d+(?:\.\d+)?)/i);
  if (weightMatch) {
    weightKg = parseFloat(weightMatch[1]);
  }

  // 6. Category
  let category: BeneficiaryCategory = 'ANC';
  if (/नवजात|शिशु|बच्चा|newborn|infant|baby|जन्म|दिन का|days old/i.test(normalized)) {
    category = 'NEWBORN';
  } else if (/किशोरी|लड़की|माहवारी|adolescent|teen|wifs|मासिक धर्म|पीरियड|स्कूल/i.test(normalized)) {
    category = 'ADOLESCENT';
  } else if (/प्रसव के बाद|डिलीवरी|pnc|postpartum|प्रसूता|जननी/i.test(normalized)) {
    category = 'PNC';
  } else {
    category = 'ANC';
  }

  // 7. Symptoms
  const symptoms: string[] = [];
  const symptomsHindi: string[] = [];

  const addSymptom = (en: string, hi: string) => {
    if (!symptoms.includes(en)) {
      symptoms.push(en);
      symptomsHindi.push(hi);
    }
  };

  if (/सूजन|सूज|swelling|edema|swollen|पैरों में पानी/i.test(normalized)) {
    addSymptom('Swelling in feet/face', 'पैरों या चेहरे में सूजन');
  }
  if (/खून|रक्त|bleeding|रक्तस्राव|ब्लीडिंग/i.test(normalized)) {
    addSymptom('Vaginal bleeding', 'रक्तस्राव (ब्लीडिंग)');
  }
  if (/सिरदर्द|सिर दर्द|headache|माथा दर्द/i.test(normalized)) {
    addSymptom('Severe headache', 'तेज सिरदर्द');
  }
  if (/चक्कर|dizziness|fainting|बेहोशी|कमजोरी|घूमना/i.test(normalized)) {
    addSymptom('Dizziness / Extreme fatigue', 'चक्कर आना व अत्यधिक कमजोरी');
  }
  if (/बुखार|ताप|fever|temperature|तापमान|गरम/i.test(normalized)) {
    addSymptom('High fever', 'तेज बुखार');
  }
  if (/उल्टी|जी मिचलाना|vomiting|nausea|मतली/i.test(normalized)) {
    addSymptom('Severe vomiting', 'उल्टी या जी मिचलाना');
  }
  if (/पीलिया|jaundice|yellow|पीला/i.test(normalized)) {
    addSymptom('Jaundice / Yellow eyes/skin', 'पीलिया (आंखें या त्वचा पीली होना)');
  }
  if ((/हलचल|मूवमेंट|movement|किक/i.test(normalized) && /कम|घट|slow|less|reduced|नहीं/i.test(normalized)) || /बच्चा नहीं घूम रहा/i.test(normalized)) {
    addSymptom('Decreased fetal movements', 'गर्भ में शिशु की हलचल कम होना');
  }
  if (/पेट दर्द|पेट में दर्द|abdominal pain|cramp|ऐंठन/i.test(normalized)) {
    addSymptom('Severe abdominal pain', 'पेट में तेज दर्द व ऐंठन');
  }
  if (/दूध नहीं|not feeding|feed|दूध न पीना/i.test(normalized)) {
    addSymptom('Unable to breastfeed', 'मां का दूध पीने में असमर्थ');
  }
  if (/सांस|पसली|breathing|chest indrawing/i.test(normalized)) {
    addSymptom('Fast breathing / chest indrawing', 'तेज सांस चलना या पसली धंसना');
  }

  // 8. Beneficiary Name Extraction
  // Usually in field visits, the name is stated early: e.g. "रेखा, 7 महीने...", "प्रीति उम्र 22...", "सुनीता दीदी, पूजा 24 साल..."
  let beneficiaryName = '';
  // Clean off common prefixes
  const cleanTranscript = normalized
    .replace(/^(नमस्ते|आशा दीदी|सुनीता दीदी|सुनीता जी|आज की विजिट|विजिट|मरीज|लाभार्थी|नाम|श्रीमती|बहू|की)\s*[,:]?\s*/i, '')
    .trim();

  const nameChunk = cleanTranscript.split(/[,।\n\-]|(?:\b(?:की|उम्र|age|महीने|महीना|साल|वर्ष|बीपी|bp)\b)/i)[0].trim();
  const nameWords = nameChunk.split(/\s+/).filter((w) => w.length > 1 && !/^(का|के|की|में|से|को|है|था|थी|और|या)$/i.test(w));
  if (nameWords.length > 0) {
    beneficiaryName = nameWords.slice(0, 2).join(' ');
  }

  // IFA tablets check
  let ifaTabletsGiven: number | null = null;
  if (/ifa|आयरन|गोली|tablet|लाल गोली/i.test(normalized)) {
    const tabletCountMatch = normalized.match(/(\d+)\s*(?:गोली|गोलियां|tablets?)/i);
    ifaTabletsGiven = tabletCountMatch ? parseInt(tabletCountMatch[1], 10) : 30;
  }

  return {
    beneficiaryName,
    category,
    age,
    gestationalMonths,
    gestationalWeeks,
    systolicBP,
    diastolicBP,
    hemoglobin,
    weightKg,
    symptoms,
    symptomsHindi,
    ifaTabletsGiven,
    notes: rawTranscript,
  };
}
