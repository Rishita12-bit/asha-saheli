import { VisitRecord, DueListItem, ASHAProfile } from '../types';
import { evaluateClinicalRisk } from './clinicalRiskEngine';

export const SUNITA_PROFILE: ASHAProfile = {
  name: 'Sunita Devi (सुनीता देवी)',
  idNumber: 'UP-GKP-0842',
  village: 'Rampur (रामपुर)',
  subCentre: 'Pipraich Sub-Centre (पिपराइच उप-केंद्र)',
  block: 'Pipraich',
  district: 'Gorakhpur, Uttar Pradesh',
  populationCovered: 1048,
  households: 182,
  anmName: 'Rita Maurya (ANM रीता मौर्य)',
  anmPhone: '+91 94501 23891',
  moicDoctor: 'Dr. Vivek Sharma (MOIC PHC)',
  moicPhone: '+91 94152 77410',
  ambulance108: '108',
};

const VISITS_KEY = 'asha_saheli_visits_v1';
const DUE_LIST_KEY = 'asha_saheli_due_v1';
const SYNC_QUEUE_KEY = 'asha_saheli_sync_queue_v1';
const SIMULATED_OFFLINE_KEY = 'asha_saheli_sim_offline_v1';

export function getInitialVisits(): VisitRecord[] {
  const v1Risk = evaluateClinicalRisk({
    category: 'ANC',
    age: 24,
    gestationalMonths: 7,
    gestationalWeeks: 30,
    systolicBP: 150,
    diastolicBP: 100,
    hemoglobin: 9.8,
    weightKg: 58,
    symptoms: ['Swelling in feet/face', 'Severe headache'],
  });

  const v2Risk = evaluateClinicalRisk({
    category: 'ANC',
    age: 19,
    gestationalMonths: 6,
    gestationalWeeks: 26,
    systolicBP: 110,
    diastolicBP: 72,
    hemoglobin: 6.8,
    weightKg: 46,
    symptoms: ['Dizziness / Extreme fatigue'],
  });

  const v3Risk = evaluateClinicalRisk({
    category: 'PNC',
    age: 26,
    systolicBP: 122,
    diastolicBP: 80,
    hemoglobin: 10.2,
    weightKg: 52,
    symptoms: ['High fever', 'Chills'],
  });

  const v4Risk = evaluateClinicalRisk({
    category: 'NEWBORN',
    age: 0,
    weightKg: 2.1,
    symptoms: ['Jaundice / Yellow eyes/skin', 'Unable to breastfeed'],
  });

  const v5Risk = evaluateClinicalRisk({
    category: 'ANC',
    age: 28,
    gestationalMonths: 8,
    gestationalWeeks: 34,
    systolicBP: 118,
    diastolicBP: 76,
    hemoglobin: 11.5,
    weightKg: 62,
    symptoms: [],
  });

  const v6Risk = evaluateClinicalRisk({
    category: 'ANC',
    age: 22,
    gestationalMonths: 5,
    gestationalWeeks: 21,
    systolicBP: 134,
    diastolicBP: 86,
    hemoglobin: 10.2,
    weightKg: 51,
    symptoms: ['Swelling in feet/face'],
  });

  const v7Risk = evaluateClinicalRisk({
    category: 'ADOLESCENT',
    age: 15,
    hemoglobin: 9.2,
    weightKg: 38,
    symptoms: ['Dizziness / Extreme fatigue', 'Severe dysmenorrhea'],
  });

  return [
    {
      id: 'rec-001',
      beneficiaryId: 'B-0101',
      beneficiaryName: 'Rekha Devi (रेखा देवी)',
      husbandOrGuardianName: 'Ramesh Yadav',
      age: 24,
      category: 'ANC',
      contactNumber: '+91 98391 44520',
      villageArea: 'Rampur Tola 2 (पूरब टोला)',
      visitDate: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      gestationalMonths: 7,
      gestationalWeeks: 30,
      systolicBP: 150,
      diastolicBP: 100,
      hemoglobin: 9.8,
      weightKg: 58,
      symptoms: ['Swelling in feet/face', 'Severe headache'],
      symptomsHindi: ['पैरों या चेहरे में सूजन', 'तेज सिरदर्द'],
      ifaTabletsGiven: 30,
      ttDoseGiven: 'TT-2',
      voiceTranscript: 'रेखा, 7 महीने, बीपी 150/100, पैरों में सूजन और सिर में भारीपन',
      risk: v1Risk,
      synced: true,
      notes: 'Husband alerted. 108 ambulance called for PHC transfer.',
    },
    {
      id: 'rec-002',
      beneficiaryId: 'B-0102',
      beneficiaryName: 'Preeti Kumari (प्रीति कुमारी)',
      husbandOrGuardianName: 'Satish Paswan',
      age: 19,
      category: 'ANC',
      contactNumber: '+91 97932 11844',
      villageArea: 'Rampur Harijan Basti',
      visitDate: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      gestationalMonths: 6,
      gestationalWeeks: 26,
      systolicBP: 110,
      diastolicBP: 72,
      hemoglobin: 6.8,
      weightKg: 46,
      symptoms: ['Dizziness / Extreme fatigue'],
      symptomsHindi: ['चक्कर आना व अत्यधिक कमजोरी'],
      ifaTabletsGiven: 60,
      ttDoseGiven: 'TT-1',
      voiceTranscript: 'प्रीति, 19 साल, 6 महीने की गर्भवती, हीमोग्लोबिन 6.8, बहुत चक्कर और कमजोरी',
      risk: v2Risk,
      synced: true,
      notes: 'Severe nutritional anemia. Referred to CHC for Iron Sucrose IV infusion.',
    },
    {
      id: 'rec-003',
      beneficiaryId: 'B-0103',
      beneficiaryName: 'Aarti Singh (आरती सिंह)',
      husbandOrGuardianName: 'Dharmendra Singh',
      age: 26,
      category: 'PNC',
      contactNumber: '+91 96214 88390',
      villageArea: 'Rampur Thakur Tola',
      visitDate: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
      systolicBP: 122,
      diastolicBP: 80,
      hemoglobin: 10.2,
      weightKg: 52,
      symptoms: ['High fever', 'Chills'],
      symptomsHindi: ['तेज बुखार', 'ठंड व कंपकंपी'],
      ifaTabletsGiven: 30,
      voiceTranscript: 'आरती, डिलीवरी 4 दिन पहले हुई, तेज बुखार 102 और कांपना',
      risk: v3Risk,
      synced: true,
      notes: 'Suspected puerperal infection. Immediate ANM home assessment requested.',
    },
    {
      id: 'rec-004',
      beneficiaryId: 'B-0104',
      beneficiaryName: 'Newborn of Meena (मीना का नवजात)',
      husbandOrGuardianName: 'Vinod Maurya (Mother: Meena)',
      age: 0,
      category: 'NEWBORN',
      contactNumber: '+91 94520 67332',
      villageArea: 'Rampur Maurya Tola',
      visitDate: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
      weightKg: 2.1,
      symptoms: ['Jaundice / Yellow eyes/skin', 'Unable to breastfeed'],
      symptomsHindi: ['पीलिया (आंखें या त्वचा पीली होना)', 'मां का दूध पीने में असमर्थ'],
      immunizationsGiven: ['BCG', 'OPV-0', 'Hep-B0'],
      voiceTranscript: 'मीना का बच्चा, 4 दिन का, पीला पड़ रहा है और दूध नहीं पी पा रहा',
      risk: v4Risk,
      synced: false,
      notes: 'Newborn danger signs present. Advised immediate SNCU visit at District Hospital.',
    },
    {
      id: 'rec-005',
      beneficiaryId: 'B-0105',
      beneficiaryName: 'Suman Verma (सुमन वर्मा)',
      husbandOrGuardianName: 'Manoj Verma',
      age: 28,
      category: 'ANC',
      contactNumber: '+91 91254 78009',
      villageArea: 'Rampur Main Basti',
      visitDate: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
      gestationalMonths: 8,
      gestationalWeeks: 34,
      systolicBP: 118,
      diastolicBP: 76,
      hemoglobin: 11.5,
      weightKg: 62,
      symptoms: [],
      symptomsHindi: [],
      ifaTabletsGiven: 30,
      ttDoseGiven: 'TT-Booster',
      voiceTranscript: 'सुमन वर्मा, 8 माह, बीपी 118/76, हीमोग्लोबिन 11.5, सब सामान्य है',
      risk: v5Risk,
      synced: true,
      notes: 'Healthy pregnancy. Routine ANC 3 completed.',
    },
    {
      id: 'rec-006',
      beneficiaryId: 'B-0106',
      beneficiaryName: 'Pooja Sharma (पूजा शर्मा)',
      husbandOrGuardianName: 'Anand Sharma',
      age: 22,
      category: 'ANC',
      contactNumber: '+91 98892 33451',
      villageArea: 'Rampur Brahmapuri',
      visitDate: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
      gestationalMonths: 5,
      gestationalWeeks: 21,
      systolicBP: 134,
      diastolicBP: 86,
      hemoglobin: 10.2,
      weightKg: 51,
      symptoms: ['Swelling in feet/face'],
      symptomsHindi: ['पैरों या चेहरे में सूजन'],
      ifaTabletsGiven: 30,
      ttDoseGiven: 'TT-1',
      voiceTranscript: 'पूजा, 5 महीने, बीपी 134/86, पैरों में हल्की सूजन',
      risk: v6Risk,
      synced: true,
      notes: 'Pre-hypertensive state. Scheduled for BP check in 3 days.',
    },
    {
      id: 'rec-007',
      beneficiaryId: 'B-0107',
      beneficiaryName: 'Kajal Paswan (काजल पासवान)',
      husbandOrGuardianName: 'Father: Rajendra Paswan',
      age: 15,
      category: 'ADOLESCENT',
      contactNumber: '+91 97210 99401',
      villageArea: 'Rampur Harijan Basti',
      visitDate: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
      hemoglobin: 9.2,
      weightKg: 38,
      symptoms: ['Dizziness / Extreme fatigue', 'Severe dysmenorrhea'],
      symptomsHindi: ['चक्कर आना व अत्यधिक कमजोरी', 'माहवारी में अत्यधिक दर्द'],
      voiceTranscript: 'काजल, 15 साल, किशोरी, हीमोग्लोबिन 9.2, स्कूल जाती है, माहवारी में दर्द',
      risk: v7Risk,
      synced: true,
      notes: 'Provided 4 WIFS blue iron tablets and 2 sanitary napkin packs. Nutritional counseling given.',
      adolescentData: {
        schoolGoing: true,
        sanitaryNapkinsReceived: true,
        wifsBlueTabletsTaken: 4,
        menstrualDisorderFlag: true,
      },
    },
  ];
}

export function getInitialDueList(): DueListItem[] {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400 * 1000).toISOString().split('T')[0];
  const inThreeDays = new Date(Date.now() + 3 * 86400 * 1000).toISOString().split('T')[0];
  const overdueDate = new Date(Date.now() - 2 * 86400 * 1000).toISOString().split('T')[0];

  return [
    {
      id: 'due-01',
      beneficiaryId: 'B-0101',
      beneficiaryName: 'Rekha Devi (रेखा देवी)',
      category: 'ANC',
      taskType: 'ANC_CHECKUP',
      taskTitle: 'Urgent Pre-eclampsia Referral Follow-up at PHC',
      taskTitleHindi: 'उच्च रक्तचाप आपातकालीन जांच (PHC पिपराइच)',
      dueDate: today,
      status: 'PENDING',
      priority: 'HIGH',
      contactNumber: '+91 98391 44520',
      villageArea: 'Rampur Tola 2',
    },
    {
      id: 'due-02',
      beneficiaryId: 'B-0102',
      beneficiaryName: 'Preeti Kumari (प्रीति कुमारी)',
      category: 'ANC',
      taskType: 'ANC_CHECKUP',
      taskTitle: 'Severe Anemia (Hb 6.8) IV Iron Sucrose Review',
      taskTitleHindi: 'गंभीर एनीमिया फॉलोअप व आयरन सुक्रोज डोज',
      dueDate: today,
      status: 'PENDING',
      priority: 'HIGH',
      contactNumber: '+91 97932 11844',
      villageArea: 'Rampur Harijan Basti',
    },
    {
      id: 'due-03',
      beneficiaryId: 'B-0104',
      beneficiaryName: 'Newborn of Meena (मीना का नवजात)',
      category: 'NEWBORN',
      taskType: 'HBNC_VISIT',
      taskTitle: 'HBNC Day-7 Home Visit & Weight Check',
      taskTitleHindi: 'HBNC सातवें दिन का गृह भ्रमण एवं वजन माप',
      dueDate: tomorrow,
      status: 'PENDING',
      priority: 'HIGH',
      contactNumber: '+91 94520 67332',
      villageArea: 'Rampur Maurya Tola',
    },
    {
      id: 'due-04',
      beneficiaryId: 'B-0106',
      beneficiaryName: 'Pooja Sharma (पूजा शर्मा)',
      category: 'ANC',
      taskType: 'TT_INJECTION',
      taskTitle: 'Tetanus Td-2 Dose at Anganwadi VHND Session',
      taskTitleHindi: 'टिटनेस (Td-2) टीका - ग्राम पोषण दिवस',
      dueDate: inThreeDays,
      status: 'PENDING',
      priority: 'MEDIUM',
      contactNumber: '+91 98892 33451',
      villageArea: 'Rampur Brahmapuri',
    },
    {
      id: 'due-05',
      beneficiaryId: 'B-0108',
      beneficiaryName: 'Aarav (Son of Sarita, 6 Weeks)',
      category: 'NEWBORN',
      taskType: 'IMMUNIZATION',
      taskTitle: 'Pentavalent-1, OPV-1, Rota-1 Immunization',
      taskTitleHindi: 'पेंटावैलेंट-1, पोलियो-1 व रोटावायरस टीका',
      dueDate: overdueDate,
      status: 'OVERDUE',
      priority: 'HIGH',
      contactNumber: '+91 94155 88219',
      villageArea: 'Rampur Main Basti',
    },
    {
      id: 'due-06',
      beneficiaryId: 'B-0107',
      beneficiaryName: 'Kajal Paswan (काजल)',
      category: 'ADOLESCENT',
      taskType: 'WIFS_SUPPLY',
      taskTitle: 'Weekly Iron Folic Acid (WIFS Blue) & Menstrual Pack',
      taskTitleHindi: 'किशोरी आयरन गोली (नीली) एवं सेनेटरी पैड वितरण',
      dueDate: inThreeDays,
      status: 'PENDING',
      priority: 'NORMAL',
      contactNumber: '+91 97210 99401',
      villageArea: 'Rampur Harijan Basti',
    },
  ];
}

// Local Storage Helper
export function loadVisits(): VisitRecord[] {
  try {
    const raw = localStorage.getItem(VISITS_KEY);
    if (!raw) {
      const initial = getInitialVisits();
      localStorage.setItem(VISITS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading visits:', err);
    return getInitialVisits();
  }
}

export function saveVisit(record: VisitRecord): void {
  const current = loadVisits();
  const index = current.findIndex((v) => v.id === record.id);
  let updated: VisitRecord[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = record;
  } else {
    updated = [record, ...current];
  }
  localStorage.setItem(VISITS_KEY, JSON.stringify(updated));

  // If not synced, add to sync queue
  if (!record.synced) {
    addToSyncQueue(record.id);
  }
}

export function deleteVisit(id: string): void {
  const current = loadVisits();
  const filtered = current.filter((v) => v.id !== id);
  localStorage.setItem(VISITS_KEY, JSON.stringify(filtered));
}

export function loadDueList(): DueListItem[] {
  try {
    const raw = localStorage.getItem(DUE_LIST_KEY);
    if (!raw) {
      const initial = getInitialDueList();
      localStorage.setItem(DUE_LIST_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    return getInitialDueList();
  }
}

export function updateDueItemStatus(id: string, status: 'PENDING' | 'OVERDUE' | 'COMPLETED'): void {
  const list = loadDueList();
  const updated = list.map((item) => (item.id === id ? { ...item, status } : item));
  localStorage.setItem(DUE_LIST_KEY, JSON.stringify(updated));
}

export function addDueItem(item: DueListItem): void {
  const list = loadDueList();
  localStorage.setItem(DUE_LIST_KEY, JSON.stringify([item, ...list]));
}

// Sync Queue & Offline Simulation
export function getSyncQueue(): string[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToSyncQueue(visitId: string): void {
  const queue = getSyncQueue();
  if (!queue.includes(visitId)) {
    queue.push(visitId);
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }
}

export function clearFromSyncQueue(visitIds: string[]): void {
  const queue = getSyncQueue().filter((id) => !visitIds.includes(id));
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function isSimulatedOffline(): boolean {
  return localStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true';
}

export function setSimulatedOffline(val: boolean): void {
  localStorage.setItem(SIMULATED_OFFLINE_KEY, String(val));
}

export function resetAllData(): void {
  localStorage.removeItem(VISITS_KEY);
  localStorage.removeItem(DUE_LIST_KEY);
  localStorage.removeItem(SYNC_QUEUE_KEY);
  localStorage.removeItem(SIMULATED_OFFLINE_KEY);
}
