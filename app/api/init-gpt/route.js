// /app/api/init-gpt/route.js

import { OpenAI } from "openai";
import { createSteps } from "@/app/simulation/helpers/steps"; // ✅ Import your steps generator!

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Your existing patient scenario
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

export async function GET() {
  try {
    // First generate your steps from createSteps
    const generatedSteps = createSteps({
      isMedical: true,
      isConscious: true,
      noBreathing: false,
      yesCPR: false,
      priority: 2,
      medications: [
        { name: "aspirin", dose: "325 mg", route: "PO", needsMedicalDirection: false },
        { name: "nitroglycerin", dose: "0.4 mg", route: "SL", needsMedicalDirection: true }
      ],
      traumaType: null,
      patientWeightKg: scenarioData.patient.weight_kg,
      age: 80,
      isPregnant: false,
      cardiacHistory: scenarioData.patient.medical_history
    });

    // Now create the path
    const path = {
      outer_id: 0,
      inner_id: 0,
      steps: generatedSteps
    };

    const systemPrompt = `
You are an EMT simulation assistant.

Your job:
- Write the FIRST SCENE DESCRIPTION and first PROMPT ONLY.
- The prompt must set the setting: location, patient appearance, basic setting of the scene, etc.
- But do not include any info that an EMT would not be able to see when they directly arrive on scene.
- DO NOT create any steps or path. Assume the steps were already generated.
- Focus on making the scene realistic, medically accurate, and immersive.
- Use 2-4 sentences.
- Ask the user what they would like to do first

Strictly output JSON ONLY like:

{
  "path": (provided path),
  "success": 1,
  "sender": "gpt",
  "prompt": "Scene description and question here",
  "response": "",
  "hint": ""
}

Here is the patient report:

${JSON.stringify(scenarioData, null, 2)}

Here is the already created path:

${JSON.stringify(path, null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.3,
    });

    const gptResponse = completion.choices[0]?.message?.content;
    console.log("[Server] GPT Initial Setup Response:", gptResponse);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(gptResponse);
    } catch (error) {
      console.error("[Server] GPT Initial Setup Parsing Error:", error);
      return Response.json({ success: false, error: "Invalid GPT JSON" }, { status: 500 });
    }

    return Response.json({ success: true, data: parsedResponse });
  } catch (error) {
    console.error("[Server] Initial Setup Server Error:", error);
    return Response.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}
