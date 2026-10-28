import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gen AI client with server-side API key
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-memory synced visits store for supervisor PHC server simulation
const syncedVisitsStore: any[] = [];

// API: Voice Transcript Structured Extraction
app.post('/api/extract', async (req: Request, res: Response) => {
  const { transcript, language = 'hi' } = req.body;

  if (!transcript || typeof transcript !== 'string') {
    res.status(400).json({ error: 'Valid transcript string is required' });
    return;
  }

  // If Gemini client is available, extract with high-accuracy clinical reasoning
  if (ai) {
    try {
      const prompt = `You are a clinical transcription assistant for an Indian ASHA (Accredited Social Health Activist) healthcare worker in rural Uttar Pradesh.
The ASHA speaks in Hindi, Hinglish, or English during home visits to pregnant women, mothers, newborns, or adolescent girls.

Extract all clinical entities from this spoken transcript into structured JSON:
Transcript: "${transcript}"

Extract:
- beneficiaryName: Name of the woman / mother / newborn / girl (or empty string if not mentioned)
- category: one of "ANC" (pregnant woman / antenatal), "PNC" (postpartum mother), "NEWBORN" (infant 0-28 days), "ADOLESCENT" (10-19 yr girl)
- age: age in years if mentioned (number or null)
- gestationalMonths: if pregnant, months of pregnancy (1-9) or null
- gestationalWeeks: if pregnant, weeks of pregnancy (1-42) or null
- systolicBP: systolic blood pressure number or null (e.g. 150 from 150/100)
- diastolicBP: diastolic blood pressure number or null (e.g. 100 from 150/100)
- hemoglobin: Hb level in g/dL or null (e.g. 8.5)
- weightKg: weight in kg or null
- symptoms: array of detected symptoms/conditions in English (e.g. ["severe headache", "swelling in feet", "vaginal bleeding", "fever", "jaundice", "vomiting", "reduced fetal movements", "menstrual pain"])
- symptomsHindi: array of detected symptoms in Hindi (e.g. ["पैरों में सूजन", "सिरदर्द"])
- ifaTabletsGiven: number of Iron Folic Acid tablets distributed if mentioned, or null
- notes: concise summary in Hindi and English
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              beneficiaryName: { type: Type.STRING },
              category: { type: Type.STRING },
              age: { type: Type.NUMBER },
              gestationalMonths: { type: Type.NUMBER },
              gestationalWeeks: { type: Type.NUMBER },
              systolicBP: { type: Type.NUMBER },
              diastolicBP: { type: Type.NUMBER },
              hemoglobin: { type: Type.NUMBER },
              weightKg: { type: Type.NUMBER },
              symptoms: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              symptomsHindi: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              ifaTabletsGiven: { type: Type.NUMBER },
              notes: { type: Type.STRING },
            },
            required: ['beneficiaryName', 'category', 'symptoms'],
          },
        },
      });

      const extracted = JSON.parse(response.text || '{}');
      res.json({
        success: true,
        source: 'gemini',
        data: extracted,
      });
      return;
    } catch (err: any) {
      console.warn('Gemini extraction failed, delegating to offline fallback:', err?.message);
    }
  }

  // Server-side regex fallback if no Gemini key or offline
  const fallbackData = parseTranscriptRegex(transcript);
  res.json({
    success: true,
    source: 'rule-parser',
    data: fallbackData,
  });
});

// Helper regex parser for fallback
function parseTranscriptRegex(transcript: string) {
  const text = transcript.toLowerCase();

  // BP pattern: e.g. 150/100, 140 / 90, 120 80, बीपी 150 100
  let systolicBP: number | null = null;
  let diastolicBP: number | null = null;
  const bpMatch = transcript.match(/(\d{2,3})\s*(?:\/|\s*बटा\s*|\s*by\s*|\s*-\s*|\s+)\s*(\d{2,3})/i);
  if (bpMatch) {
    const s = parseInt(bpMatch[1], 10);
    const d = parseInt(bpMatch[2], 10);
    if (s >= 70 && s <= 240 && d >= 40 && d <= 150) {
      systolicBP = s;
      diastolicBP = d;
    }
  }

  // Gestational months/weeks
  let gestationalMonths: number | null = null;
  let gestationalWeeks: number | null = null;
  const monthMatch = transcript.match(/(\d+)\s*(?:महीने|महीना|माह|months?|month)/i);
  if (monthMatch) {
    gestationalMonths = parseInt(monthMatch[1], 10);
  }
  const weekMatch = transcript.match(/(\d+)\s*(?:हफ़्ते|सप्ताह|weeks?|week)/i);
  if (weekMatch) {
    gestationalWeeks = parseInt(weekMatch[1], 10);
  }

  // Hemoglobin
  let hemoglobin: number | null = null;
  const hbMatch = transcript.match(/(?:hb|हीमोग्लोबिन|खून|hemoglobin)\s*(?:है|का|level|:)?\s*(\d+(?:\.\d+)?)/i) ||
                  transcript.match(/(\d+(?:\.\d+)?)\s*(?:ग्राम|gram|gm|g\/dl|hb)/i);
  if (hbMatch) {
    hemoglobin = parseFloat(hbMatch[1]);
  }

  // Age
  let age: number | null = null;
  const ageMatch = transcript.match(/(\d+)\s*(?:साल|वर्ष|years?|yr|उम्र)/i);
  if (ageMatch) {
    age = parseInt(ageMatch[1], 10);
  }

  // Category detection
  let category = 'ANC';
  if (/नवजात|शिशु|बच्चा|newborn|infant|baby|जन्म|दिन का/i.test(transcript)) {
    category = 'NEWBORN';
  } else if (/किशोरी|लड़की|माहवारी|adolescent|teen|wifs|मासिक धर्म/i.test(transcript)) {
    category = 'ADOLESCENT';
  } else if (/प्रसव के बाद|डिलीवरी|pnc|postpartum|प्रसूता/i.test(transcript)) {
    category = 'PNC';
  }

  // Symptoms
  const symptoms: string[] = [];
  const symptomsHindi: string[] = [];

  if (/सूजन|सूज|swelling|edema|swollen/i.test(transcript)) {
    symptoms.push('Swelling in feet/face');
    symptomsHindi.push('पैरों या चेहरे में सूजन');
  }
  if (/खून|रक्त|bleeding|रक्तस्राव/i.test(transcript)) {
    symptoms.push('Vaginal bleeding');
    symptomsHindi.push('रक्तस्राव');
  }
  if (/सिरदर्द|सिर दर्द|headache/i.test(transcript)) {
    symptoms.push('Severe headache');
    symptomsHindi.push('तेज सिरदर्द');
  }
  if (/चक्कर|dizziness|fainting|बेहोशी/i.test(transcript)) {
    symptoms.push('Dizziness / Fainting');
    symptomsHindi.push('चक्कर आना');
  }
  if (/बुखार|ताप|fever|temperature/i.test(transcript)) {
    symptoms.push('High fever');
    symptomsHindi.push('तेज बुखार');
  }
  if (/उल्टी|जी मिचलाना|vomiting|nausea/i.test(transcript)) {
    symptoms.push('Severe vomiting');
    symptomsHindi.push('उल्टी / जी मिचलाना');
  }
  if (/पीलिया|jaundice|yellow/i.test(transcript)) {
    symptoms.push('Jaundice / Yellow eyes');
    symptomsHindi.push('पीलिया');
  }
  if (/हलचल|मूवमेंट|movement/i.test(transcript) && /कम|घट|slow|less|reduced/i.test(transcript)) {
    symptoms.push('Decreased fetal movements');
    symptomsHindi.push('बच्चे की हलचल कम होना');
  }
  if (/दर्द|पेट दर्द|abdominal pain/i.test(transcript)) {
    symptoms.push('Severe abdominal pain');
    symptomsHindi.push('पेट में तेज दर्द');
  }

  // Beneficiary Name guess (first 1-2 words before comma or month/age)
  let beneficiaryName = '';
  const firstChunk = transcript.split(/[,।\n]/)[0].trim();
  const words = firstChunk.split(/\s+/).filter(w => !/^(आज|विजिट|सुनीता|आशा|बहन|जी|श्रीमती|नाम)$/i.test(w));
  if (words.length > 0 && words[0].length > 1) {
    beneficiaryName = words.slice(0, 2).join(' ');
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
    weightKg: null,
    symptoms,
    symptomsHindi,
    ifaTabletsGiven: /ifa|आयरन|गोली|tablet/i.test(transcript) ? 30 : null,
    notes: transcript,
  };
}

// API: Batch Sync visits from ASHA app to PHC server
app.post('/api/sync', (req: Request, res: Response) => {
  const { visits = [], workerId, villageName } = req.body;
  if (Array.isArray(visits)) {
    visits.forEach((v) => {
      const idx = syncedVisitsStore.findIndex((existing) => existing.id === v.id);
      if (idx >= 0) {
        syncedVisitsStore[idx] = { ...v, syncedAt: new Date().toISOString() };
      } else {
        syncedVisitsStore.push({ ...v, syncedAt: new Date().toISOString() });
      }
    });
  }

  res.json({
    success: true,
    message: 'Data successfully synchronized with Gorakhpur District RCH Portal',
    syncedCount: visits.length,
    timestamp: new Date().toISOString(),
    workerId,
    villageName,
  });
});

// API: Supervisor stats
app.get('/api/supervisor/stats', (_req: Request, res: Response) => {
  res.json({
    totalPopulation: 1048,
    households: 182,
    ashaWorker: 'Sunita Devi (ID: UP-GKP-0842)',
    subCentre: 'Pipraich Sub-Centre, Gorakhpur',
    syncedVisits: syncedVisitsStore.length,
    lastSyncTime: syncedVisitsStore.length > 0 ? syncedVisitsStore[syncedVisitsStore.length - 1].syncedAt : null,
  });
});

app.use(express.static(path.join(__dirname, 'public')));

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ASHA Saheli server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
