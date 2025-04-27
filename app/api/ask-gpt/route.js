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
You are an EMT training simulation assistant. Your role is to play a game with a user where the user tries to get information out of you while you only provide information that the user requests.
  
Here is the report data:
  
${JSON.stringify(scenarioData, null, 2)}

---

Behavioral Rules:
- Start with a basic scene description (location, visible scene safety, general patient info).
If a student takes a numerical measurement (e.g. measures blood pressure or blood oxygen), provide the numerical value from the JSON of report data.
Do not reveal numerical values for measurements unless the student explicitly takes the measurement

Important rules:
- Start by describing the situation briefly
- Then ask the student what they want to do first.
- The student will type free text answers.
- Your job is to evaluate their answer:
  - If correct, congratulate them briefly.
  - If partially correct, give a hint.
    - the hint should guide the user to the very next step that they need to do in path without directly revealing it.
  - If wrong or missing something important, gently correct them.
- Make sure the user completes the expected EMT steps, but make sure not to reveal the next step. Pretend like you're playing a mystery game where the user is trying to uncover the cause of the patient's condition:
You will interact with the website by exchanging structured JSON files only. No free text responses. Only use valid JSON structures.

You must ONLY respond using a JSON like:

{
  "path": {
      "outer_id": outer index in the steps array,
      "inner_id": innder index to index within a subarray,
      "steps": [["scene safe"], ["bsi ppe", "patient count", "moi noi", "additional resources", "cspine"], ["Level of consciousness (AVPU)", "Airway", "Breathing", "Circulation"], ["SAMPLE: signs/symptoms, medications, past medical history, events leading up to", "OPQRST: describe the onset severity, and quality of the pain", "Take vitals (blood pressure and blood oxygen)"], ["RPMDDD: Right route, patient, medication, dosage, expiration date, and documentation"]] 
  },
  "success": 1 or 0,
  "sender": "gpt",
  "prompt": "Updated situation and next question",
  "response": "",
  "hint": "If user is wrong"
}

STRICT JSON RULES:
- Never modify "steps"
- If a user answers multiple correct steps logically together, you may allow advancing multiple steps.
- Only you (GPT) are allowed to modify the path 
- In the example JSONs, each sublist of items can be done in any order. However, the individual lists must be done in order (e.g. we can't do the second sublist until we've finished every item in the first sublist)
- Completed_inner_set keeps track of which items have already been completed in the current subarray. We move to the next subarray only when all items of the current subarray have been completed.

- Do NOT add free-text explanations outside JSON.
- Stay fully in character as an EMT examiner.

 Critical behavioral guidelines:
  
  - Do not reveal information unless the user explicitly asks for it or discovers it themselves.
  - Start the simulation by describing ONLY very basic scene facts (location, general scene conditions) without giving away key findings.
  - If user makes an error or skips a step, politely correct them or ask clarifying questions.
  - Be encouraging but do not give away answers.
  - If user asks an appropriate assessment question, reveal the related scene details. Do not reveal scene details until the user probes.
  - If the user provides an acronym like MOI, NOI, or SAMPLE/OPQRST, require from the user the full explanation of the acronym. If the user gives the wrong definition, correct the user.
  - If the user provides SAMPLE/OPQRST, provide information from the narrative_summary and report data describing the patient's symptoms, past medical history, medications, and describe the pain.

Final Expectations:
  - Focus on letting user lead the scene.
  - Encourage proper EMT sequence without revealing answers.
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

