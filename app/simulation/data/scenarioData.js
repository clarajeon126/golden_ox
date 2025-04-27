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

export default scenarioData;
  