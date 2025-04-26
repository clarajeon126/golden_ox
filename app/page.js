"use client"; // You need this because you're using hooks!

import { useState } from "react";
import { askGPT } from "../utils/askGPT";
import styles from "./page.module.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const scenarioData = {
    "incident_number": "25008386",
    "patient": {
      "name": "John A. Doe",
      "dob": "1944-09-22",
      "gender": "Female",
      "race": "White",
      "weight_kg": 101,
      "home_address": {
        "street": "123 Main St",
        "city": "Baltimore",
        "state": "MD",
        "zip": "Baltimore City"
      },
      "medical_history": [
        "Coronary Artery Disease",
        "Atrial Fibrillation",
        "Cardiac Stent",
        "Quadruple Bypass (2017)"
      ],
      "medications": [
        "Eliquis (apixaban)",
        "Albuterol"
      ],
      "allergies": "No Known Drug Allergy"
    },
    "chief_complaint": {
      "primary": "Chest pain",
      "secondary": "Shortness of Breath (SOB)",
      "anatomic_location": "Chest",
      "symptom_onset": "Unknown"
    },
    "vitals": [
      {
        "time": "2025-04-23T10:38:00",
        "bp": "155/71",
        "hr": 69,
        "rr": 24,
        "spo2": 97,
        "pain": 8,
        "gcs": 15,
        "temperature_c": 36.6,
        "glucose_mg_dl": 113,
        "cardiac_rhythm": "Atrial Fibrillation (A-Fib)"
      },
      {
        "time": "2025-04-23T10:49:39",
        "bp": "178/97",
        "hr": 70,
        "rr": 24,
        "spo2": 95,
        "pain": 8,
        "gcs": 15,
        "cardiac_rhythm": "Atrial Fibrillation (A-Fib)"
      },
      {
        "time": "2025-04-23T10:54:38",
        "bp": "156/93",
        "hr": 90,
        "rr": 20,
        "spo2": 95,
        "pain": 8,
        "gcs": 15,
        "cardiac_rhythm": "Atrial Fibrillation (A-Fib)"
      },
      {
        "time": "2025-04-23T10:58:42",
        "bp": "139/70",
        "hr": 72,
        "rr": 18,
        "spo2": 97,
        "pain": 8,
        "gcs": 15,
        "cardiac_rhythm": "Atrial Fibrillation (A-Fib)"
      }
    ],
    "treatments": [
      "Oxygen via nasal cannula at 3 LPM",
      "Aspirin 4 x 81mg PO",
      "IV established and blood drawn",
      "Nitroglycerin 0.4mg SL (two doses)",
      "Coached breathing exercises"
    ],
    "transport": {
      "mode_to_scene": "Lights/Sirens",
      "mode_to_hospital": "Lights/Sirens",
      "hospital": {
        "name": "Carroll Hospital Center (LifeBridge)",
        "address": "200 Memorial Avenue, Westminster, MD 21157"
      },
      "priority": "Priority 2"
    },
    "crew": [
      {
        "name": "Kong, King",
        "role": "Primary Patient Caregiver",
        "level": "Paramedic"
      },
      {
        "name": "User, Demo",
        "role": "Other Patient Caregiver (Ride-along)",
        "level": "Student"
      }
    ],
    "narrative_summary": "Patient with history of A-Fib and CAD experienced chest pain (8/10) and SOB, worsened over 1 day. Vitals taken, oxygen administered. Aspirin given. IV started. Two doses of nitroglycerin administered, pain reduced to 3/10. Patient transported via stretcher to Carroll Hospital Center with no change in cardiac rhythm on 12-lead ECG. Handed off to hospital staff."
  };
  
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: `You are an EMT training simulation assistant. Your role is to guide the student step-by-step through an emergency call based on the following patient care report.
  
  Here is the report data:
  
  ${JSON.stringify(scenarioData, null, 2)}
  
  Use the "narrative_summary" and other fields to build a simple starting scene.
  
  Important rules:
  - Start by describing the situation briefly: where it happens, how many patients, whether the scene looks safe.
  - Then ask the student what they want to do first.
  - The student will type free text answers.
  - Your job is to evaluate their answer:
    - If correct, congratulate them briefly and move to the next action they should do.
    - If partially correct, give a hint.
    - If wrong or missing something important, gently correct them.
  - Guide the user through the expected EMT steps:
    1. Ensure scene safety and BSI (Body Substance Isolation)/PPE
    2. Determine number of patients
    3. Request additional resources if needed
    4. Perform Primary Assessment (Level of Consciousness, Airway, Breathing, Circulation)
    5. Perform Secondary Assessment (Vitals, SAMPLE history)
    6. Administer treatments (Oxygen, Aspirin, etc.)
    7. Transport decision
  
  Format your responses as friendly but professional EMT training advice.
  
  After each answer from the user, provide feedback and ask them the next logical question.
  `
    }
  ]);
  

  const handleSend = async () => {
    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput(""); // clear input

    const reply = await askGPT(updatedMessages);

    setMessages([...updatedMessages, { role: "assistant", content: reply }]);
    setOutput(reply);
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>🚑 EMT Simulation</h1>

        <div style={{ marginBottom: "1rem" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your next action here..."
            rows={4}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button onClick={handleSend} style={{ padding: "0.5rem 1rem", marginBottom: "1rem" }}>
          Send
        </button>

        <div style={{ border: "1px solid gray", padding: "1rem", borderRadius: "8px" }}>
          <h2>📋 Simulation Output</h2>
          <p>{output}</p>
        </div>
      </main>

      <footer className={styles.footer}>
        EMT Training Simulation 🚑
      </footer>
    </div>
  );
}
