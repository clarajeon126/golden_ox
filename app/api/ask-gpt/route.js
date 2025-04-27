// /app/api/ask-gpt/route.js
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define your scenario (your patient care report)
const scenarioData = {
  incident_number: "25008386",
  patient: {
    name: "John A. Doe",
    dob: "1944-09-22",
    gender: "Female",
    race: "White",
    weight_kg: 101,
    home_address: {
      street: "123 Main St",
      city: "Baltimore",
      state: "MD",
      zip: "Baltimore City"
    },
    medical_history: [
      "Coronary Artery Disease",
      "Atrial Fibrillation",
      "Cardiac Stent",
      "Quadruple Bypass (2017)"
    ],
    medications: [
      "Eliquis (apixaban)",
      "Albuterol"
    ],
    allergies: "No Known Drug Allergy"
  },
  chief_complaint: {
    primary: "Chest pain",
    secondary: "Shortness of Breath (SOB)",
    anatomic_location: "Chest",
    symptom_onset: "Unknown"
  },
  vitals: [
    {
      time: "2025-04-23T10:38:00",
      bp: "155/71",
      hr: 69,
      rr: 24,
      spo2: 97,
      pain: 8,
      gcs: 15,
      temperature_c: 36.6,
      glucose_mg_dl: 113,
      cardiac_rhythm: "Atrial Fibrillation (A-Fib)"
    },
    {
      time: "2025-04-23T10:49:39",
      bp: "178/97",
      hr: 70,
      rr: 24,
      spo2: 95,
      pain: 8,
      gcs: 15,
      cardiac_rhythm: "Atrial Fibrillation (A-Fib)"
    },
    {
      time: "2025-04-23T10:54:38",
      bp: "156/93",
      hr: 90,
      rr: 20,
      spo2: 95,
      pain: 8,
      gcs: 15,
      cardiac_rhythm: "Atrial Fibrillation (A-Fib)"
    },
    {
      time: "2025-04-23T10:58:42",
      bp: "139/70",
      hr: 72,
      rr: 18,
      spo2: 97,
      pain: 8,
      gcs: 15,
      cardiac_rhythm: "Atrial Fibrillation (A-Fib)"
    }
  ],
  treatments: [
    "Oxygen via nasal cannula at 3 LPM",
    "Aspirin 4 x 81mg PO",
    "IV established and blood drawn",
    "Nitroglycerin 0.4mg SL (two doses)",
    "Coached breathing exercises"
  ],
  transport: {
    mode_to_scene: "Lights/Sirens",
    mode_to_hospital: "Lights/Sirens",
    hospital: {
      name: "Carroll Hospital Center (LifeBridge)",
      address: "200 Memorial Avenue, Westminster, MD 21157"
    },
    priority: "Priority 2"
  },
  crew: [
    {
      name: "Kong, King",
      role: "Primary Patient Caregiver",
      level: "Paramedic"
    },
    {
      name: "User, Demo",
      role: "Other Patient Caregiver (Ride-along)",
      level: "Student"
    }
  ],
  narrative_summary: "Patient with history of A-Fib and CAD experienced chest pain (8/10) and SOB, worsened over 1 day. Vitals taken, oxygen administered. Aspirin given. IV started. Two doses of nitroglycerin administered, pain reduced to 3/10. Patient transported via stretcher to Carroll Hospital Center with no change in cardiac rhythm on 12-lead ECG. Handed off to hospital staff."
};

export async function POST(req) {
  try {
    const { jsonPayload } = await req.json();
    console.log("[Server] Received Payload:", JSON.stringify(jsonPayload, null, 2));

    const { path, success, sender, prompt, response, hint } = jsonPayload;

    const systemPrompt = `
You are an EMT training simulation assistant. Guide the student step-by-step through an emergency call based on this patient care report:

${JSON.stringify(scenarioData, null, 2)}

---

Behavioral Rules:
- Start with a basic scene description (location, visible scene safety, general patient info).
- Prompts must be at least 2 sentences and medically accurate.
- Build scene awareness gradually.
- If user lacks information, invent realistic and creative details.
- Do not ask redundant questions. Provide information if needed.
- If user answers correctly, congratulate briefly and move forward.
- If user answers incorrectly, gently correct them and optionally give a hint.
- If user fails three times, give a hint immediately.
- ONLY communicate via strict JSON, never plain text.

You must ONLY respond using a JSON like:

{
  "path": { "current": ..., "total": ..., "steps": [...], "breakpoints": [...] },
  "success": 1 or 0,
  "sender": "gpt",
  "prompt": "Updated situation and next question",
  "response": "",
  "hint": "If user is wrong"
}

STRICT JSON RULES:
- Never modify "steps", "total", or "breakpoints".
- Only increment "current" when a user succeeds.
- Do NOT add free-text explanations outside JSON.
- Stay fully in character as an EMT examiner.

Current simulation context:

- Path: ${JSON.stringify(path)}
- Last prompt given: ${prompt}
- User's last response: ${response}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: response || "start simulation" },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages,
      temperature: 0.3,
    });

    const gptResponse = completion.choices[0]?.message?.content;
    console.log("[Server] Raw GPT Response:", gptResponse);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(gptResponse);
      console.log("[Server] Parsed GPT JSON:", JSON.stringify(parsedResponse, null, 2));
    } catch (error) {
      console.error("[Server] GPT Parsing Error:", error);
      return Response.json({ success: false, error: "Invalid GPT response" }, { status: 500 });
    }

    return Response.json({ success: true, response: parsedResponse });
  } catch (error) {
    console.error("[Server] Internal Server Error:", error);
    return Response.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

