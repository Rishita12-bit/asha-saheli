export interface SpeechRecognitionHookResult {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: (lang?: string) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

// Check if browser supports Web Speech API
export function isWebSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

// Text to speech helper for field audio playback
export function speakTriageGuidance(text: string, lang = 'hi-IN'): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95; // Slightly slower for crisp Hindi understanding
    utterance.pitch = 1.05;

    // Pick Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.includes('Hindi'));
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('SpeechSynthesis error:', err);
  }
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export interface PresetVoiceScenario {
  id: string;
  title: string;
  titleHindi: string;
  transcript: string;
  category: 'ANC' | 'PNC' | 'NEWBORN' | 'ADOLESCENT';
  expectedRisk: 'RED' | 'AMBER' | 'GREEN';
  keyFinding: string;
}

export const PRESET_VOICE_SCENARIOS: PresetVoiceScenario[] = [
  {
    id: 'scen-1',
    title: 'Rekha - Severe Pre-eclampsia',
    titleHindi: 'रेखा - उच्च रक्तचाप व सूजन',
    transcript: 'रेखा, 7 महीने, बीपी 150/100, पैरों में सूजन और सिरदर्द',
    category: 'ANC',
    expectedRisk: 'RED',
    keyFinding: 'BP 150/100 + Severe Edema',
  },
  {
    id: 'scen-2',
    title: 'Preeti - Critical Anemia',
    titleHindi: 'प्रीति - गंभीर एनीमिया (Hb 6.8)',
    transcript: 'प्रीति, 19 साल, 6 महीने की गर्भवती, हीमोग्लोबिन 6.8, बहुत चक्कर और कमजोरी',
    category: 'ANC',
    expectedRisk: 'RED',
    keyFinding: 'Hb 6.8 g/dL (Emergency IV Iron needed)',
  },
  {
    id: 'scen-3',
    title: 'Meena Baby - Neonatal Sepsis / Jaundice',
    titleHindi: 'मीना का नवजात - पीलिया व दूध न पीना',
    transcript: 'मीना का बच्चा, 4 दिन का नवजात, पीला पड़ रहा है और दूध नहीं पी रहा',
    category: 'NEWBORN',
    expectedRisk: 'RED',
    keyFinding: 'Newborn Danger Sign (Jaundice + Anorexia)',
  },
  {
    id: 'scen-4',
    title: 'Suman - Healthy Normal ANC',
    titleHindi: 'सुमन - सामान्य स्वस्थ गर्भावस्था',
    transcript: 'सुमन वर्मा, 8 माह, बीपी 118/76, हीमोग्लोबिन 11.5, वजन 62 किलो, सब सामान्य',
    category: 'ANC',
    expectedRisk: 'GREEN',
    keyFinding: 'All Vitals Normal (ANC-3 Complete)',
  },
  {
    id: 'scen-5',
    title: 'Kajal - Adolescent Anemia & Menstrual Pain',
    titleHindi: 'काजल - किशोरी स्वास्थ्य व एनीमिया',
    transcript: 'काजल, 15 वर्ष, किशोरी, हीमोग्लोबिन 9.2, अत्यधिक कमजोरी और मासिक धर्म में दर्द',
    category: 'ADOLESCENT',
    expectedRisk: 'AMBER',
    keyFinding: 'RKSK WIFS Blue Dose + Menstrual Support',
  },
];
